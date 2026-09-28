import {
  Client, GatewayIntentBits, PermissionFlagsBits, ChannelType,
  PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, StringSelectMenuBuilder, AutoModerationRuleKeywordPresetType,
  AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleTriggerType,
  MessageFlags,
} from "discord.js";
import "dotenv/config";
import http from "http";
import { generateTemplate, reviseTemplate } from "./ai.js";
import { saveTemplate, loadTemplate, listTemplates, deleteTemplate } from "./store.js";
import { botsEmbed, companionBotEmbed, companionBotActionRow, carlBotGuideEmbed } from "./bots.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on("error", (err) => console.error("Client error:", err.message));
process.on("unhandledRejection", (err) => console.error("Unhandled:", err.message || err));

// Cloud healthcheck server (Render / Koyeb / Railway)
if (process.env.PORT) {
  http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is online 24/7!");
  }).listen(process.env.PORT, () => console.log(`Healthcheck port ${process.env.PORT} active`));
}

const botOwnerIds = new Set();

client.once("clientReady", async () => {
  console.log(`Bot online: ${client.user.tag}`);
  try {
    const app = await client.application.fetch();
    if (app.owner) {
      if (app.owner.members) {
        for (const [id] of app.owner.members) botOwnerIds.add(id);
      } else {
        botOwnerIds.add(app.owner.id);
      }
    }
    console.log(`🛡️ Bot Owner IDs: ${Array.from(botOwnerIds).join(", ")}`);
  } catch (e) {
    console.error("Fetch app owner error:", e.message);
  }
  if (process.env.OWNER_ID) botOwnerIds.add(process.env.OWNER_ID);
});

function isAuthorized(interaction) {
  if (botOwnerIds.has(interaction.user.id)) return true;
  if (interaction.guild && interaction.guild.ownerId === interaction.user.id) return true;
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  return false;
}

// Track temp voice channels: channelId -> { ownerId, guildId }
const tempVoiceChannels = new Map();
// Track which template was applied per guild: guildId -> code
const appliedTemplates = new Map();

// ─── Helpers ───

function parseColor(c) {
  if (!c) return 0;
  if (typeof c === "number") return c;
  if (typeof c === "string") return parseInt(c.replace("#", ""), 16) || 0;
  return 0;
}

function makeEmbed(title, desc, color = 0x5865f2) {
  const eb = new EmbedBuilder().setTitle(title).setColor(color).setTimestamp();
  if (desc !== undefined && desc !== null) {
    const str = String(desc).trim();
    if (str.length > 0) {
      eb.setDescription(str.slice(0, 4090));
    }
  }
  return eb;
}

async function botLog(guild, msg) {
  const logCh = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && (c.name.includes("bot-log") || c.name.includes("log-bot"))
  );
  if (logCh) await logCh.send({ embeds: [makeEmbed("📝 Log", msg, 0x95a5a6)] }).catch(() => {});
}

// ─── Apply Template ───

async function applyTemplate(guild, template, onProgress) {
  const log = (msg) => { console.log(msg); if (onProgress) onProgress(msg); };
  const createdRoles = {};
  let verifiedRole = null;
  let unverifiedRole = null;
  const staffRoleList = [];

  // 1. Create main roles (reuse existing by name)
  log("📋 Creating roles...");
  await guild.roles.fetch();
  await guild.members.fetch().catch(() => {});
  const botMembers = guild.members.cache.filter((m) => m.user.bot);
  const botRoles = [];
  for (const [, bm] of botMembers) {
    const role = bm.roles.botRole || bm.roles.highest;
    if (role && role.id !== guild.roles.everyone.id && !botRoles.some((r) => r.id === role.id)) {
      botRoles.push(role);
    }
  }

  const defaultVerifiedPerms = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.Stream,
    PermissionFlagsBits.UseVAD,
  ];

  for (const roleDef of template.roles || []) {
    const existing = guild.roles.cache.find((r) => r.name === roleDef.name && !r.managed);
    if (existing) {
      createdRoles[roleDef.name] = existing;
      if (roleDef.isVerified) {
        verifiedRole = existing;
        await existing.setPermissions(defaultVerifiedPerms, "Setup Bot update perms").catch(() => {});
      }
      if (roleDef.isUnverified) unverifiedRole = existing;
      if (roleDef.isStaff) staffRoleList.push(existing);
      log(`  ♻️ Reused: ${roleDef.name}`);
      continue;
    }
    let perms;
    if (roleDef.isVerified) {
      perms = new PermissionsBitField(defaultVerifiedPerms);
    } else if (roleDef.permissions && roleDef.permissions.length > 0) {
      perms = new PermissionsBitField(
        roleDef.permissions.map((p) => PermissionFlagsBits[p]).filter(Boolean)
      );
    } else {
      perms = new PermissionsBitField();
    }
    const role = await guild.roles.create({
      name: roleDef.name,
      colors: { primaryColor: parseColor(roleDef.color) },
      hoist: roleDef.hoist ?? false,
      permissions: perms,
      reason: "Setup Bot",
    });
    createdRoles[roleDef.name] = role;
    if (roleDef.isVerified) verifiedRole = role;
    if (roleDef.isUnverified) unverifiedRole = role;
    if (roleDef.isStaff) staffRoleList.push(role);
  }

  // 2. Create self-roles
  const selfRoleMap = {};
  for (const cat of template.selfRoles || []) {
    selfRoleMap[cat.category] = [];
    for (const r of cat.roles || []) {
      const existing = guild.roles.cache.find((gr) => gr.name === r.name && !gr.managed);
      if (existing) {
        selfRoleMap[cat.category].push({ name: r.name, role: existing, emoji: r.emoji || "⚪" });
        createdRoles[r.name] = existing;
        continue;
      }
      const role = await guild.roles.create({
        name: r.name,
        colors: { primaryColor: parseColor(r.color) },
        hoist: false,
        permissions: new PermissionsBitField(),
        reason: "Setup Bot self-role",
      });
      selfRoleMap[cat.category].push({ name: r.name, role, emoji: r.emoji || "⚪" });
      createdRoles[r.name] = role;
    }
  }
  log(`✅ ${Object.keys(createdRoles).length} roles ready`);

  // Fallback verified role
  if (!verifiedRole) {
    verifiedRole = Object.values(createdRoles).find(
      (r) => !r.permissions.has(PermissionFlagsBits.Administrator) &&
             !r.permissions.has(PermissionFlagsBits.ManageMessages)
    );
  }

  // 3. Role position ordering (highest first)
  log("📊 Ordering roles...");
  try {
    const allRoles = Object.values(createdRoles);
    const botRole = guild.members.me?.roles.highest;
    const maxPos = botRole ? botRole.position - 1 : allRoles.length;
    const positions = [];
    // Staff roles at top, then special, then member tiers, then self-roles at bottom
    const staffRoles = allRoles.filter((r) => staffRoleList.includes(r));
    const memberRoles = allRoles.filter((r) => !staffRoleList.includes(r) && !Object.values(selfRoleMap).flat().some((sr) => sr.role.id === r.id));
    const srRoles = Object.values(selfRoleMap).flat().map((sr) => sr.role);
    const ordered = [...staffRoles, ...memberRoles, ...srRoles];
    for (let i = 0; i < ordered.length; i++) {
      const pos = Math.max(1, maxPos - i);
      positions.push({ role: ordered[i].id, position: pos });
    }
    if (positions.length) await guild.roles.setPositions(positions).catch(() => {});
  } catch (e) { console.error("Role ordering:", e.message); }

  // 4. Create channels (Category-Sync architecture)
  log("📁 Creating channels (Category-Sync)...");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let chCount = 0;
  let verifyChannelRef = null;
  let rulesChannelRef = null;
  let selfRolesChannelRef = null;
  let welcomeChannelRef = null;
  let logChannelRef = null;
  let tempVcGeneratorRef = null;

  const standardMemberPerms = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.Stream,
    PermissionFlagsBits.UseVAD,
  ];

  const standardStaffPerms = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.Stream,
    PermissionFlagsBits.UseVAD,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.MoveMembers,
  ];

  const vipRole = Object.values(createdRoles).find(
    (r) => r.name.toLowerCase().includes("vip") || r.name.toLowerCase().includes("booster")
  );

  for (const cat of template.categories || []) {
    const catAccess = cat.access || "public";
    const catOverwrites = [];

    // Check if category name matches a specific self-role (e.g. "KELAS IF - 2 - KA" -> role "🏷️ IF-2-KA" or "KELOMPOK 1")
    let matchedSelfRole = null;
    const catNameClean = cat.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const sr of Object.values(selfRoleMap).flat()) {
      const roleNameClean = sr.role.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (roleNameClean.length >= 3 && catNameClean.includes(roleNameClean)) {
        matchedSelfRole = sr.role;
        break;
      }
    }

    if (catAccess === "gate") {
      catOverwrites.push({
        id: guild.roles.everyone.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AddReactions,
        ],
        deny: [
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.SendMessagesInThreads,
        ],
      });
      if (verifiedRole) {
        catOverwrites.push({
          id: verifiedRole.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AddReactions,
          ],
          deny: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.CreatePublicThreads,
            PermissionFlagsBits.CreatePrivateThreads,
            PermissionFlagsBits.SendMessagesInThreads,
          ],
        });
      }
      for (const sr of staffRoleList) {
        if (!sr.permissions.has(PermissionFlagsBits.Administrator)) {
          catOverwrites.push({
            id: sr.id,
            allow: standardStaffPerms,
          });
        }
      }
      for (const br of botRoles) {
        catOverwrites.push({
          id: br.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.ManageMessages,
          ],
        });
      }
    } else if (catAccess === "staff") {
      catOverwrites.push({
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      });
      if (verifiedRole) {
        catOverwrites.push({
          id: verifiedRole.id,
          deny: [PermissionFlagsBits.ViewChannel],
        });
      }
      for (const sr of staffRoleList) {
        if (!sr.permissions.has(PermissionFlagsBits.Administrator)) {
          catOverwrites.push({
            id: sr.id,
            allow: standardStaffPerms,
          });
        }
      }
    } else if (matchedSelfRole) {
      // Role-specific category (e.g. Kelas / Kelompok channel)
      catOverwrites.push({
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      });
      if (verifiedRole) {
        catOverwrites.push({
          id: verifiedRole.id,
          deny: [PermissionFlagsBits.ViewChannel],
        });
      }
      catOverwrites.push({
        id: matchedSelfRole.id,
        allow: standardMemberPerms,
      });
      for (const sr of staffRoleList) {
        if (!sr.permissions.has(PermissionFlagsBits.Administrator)) {
          catOverwrites.push({
            id: sr.id,
            allow: standardStaffPerms,
          });
        }
      }
    } else if (catAccess === "vip" && vipRole) {
      catOverwrites.push({
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      });
      catOverwrites.push({
        id: vipRole.id,
        allow: standardMemberPerms,
      });
    } else {
      // Default: "public"
      catOverwrites.push({
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      });
      if (verifiedRole) {
        catOverwrites.push({
          id: verifiedRole.id,
          allow: standardMemberPerms,
        });
      }
    }

    const category = await guild.channels.create({
      name: cat.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: catOverwrites,
      reason: "Setup Bot category-sync",
    });
    await sleep(250);

    for (const ch of cat.channels || []) {
      const isVoice = ch.type === "voice";
      const isTempVcGenerator = ch.isTempVoiceGenerator === true;
      const type = isVoice ? ChannelType.GuildVoice : ChannelType.GuildText;
      const channelOverwrites = [];

      // Channel-specific overrides ONLY when diverging from category:
      if (ch.isVerifyChannel) {
        channelOverwrites.push({
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AddReactions,
          ],
          deny: [PermissionFlagsBits.SendMessages],
        });
        if (verifiedRole) {
          channelOverwrites.push({
            id: verifiedRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AddReactions,
            ],
            deny: [PermissionFlagsBits.SendMessages],
          });
        }
        for (const br of botRoles) {
          channelOverwrites.push({
            id: br.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.ManageMessages,
            ],
          });
        }
      } else if (ch.readOnly && catAccess !== "gate") {
        channelOverwrites.push({
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.SendMessages],
        });
        if (verifiedRole) {
          channelOverwrites.push({
            id: verifiedRole.id,
            deny: [PermissionFlagsBits.SendMessages],
          });
        }
      } else if (ch.staffOnly && catAccess !== "staff") {
        channelOverwrites.push({
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        });
        if (verifiedRole) {
          channelOverwrites.push({
            id: verifiedRole.id,
            deny: [PermissionFlagsBits.ViewChannel],
          });
        }
      }

      const channelOpts = {
        name: ch.name,
        type,
        parent: category.id,
        reason: "Setup Bot channel",
      };
      if (channelOverwrites.length > 0) {
        channelOpts.permissionOverwrites = channelOverwrites;
      }
      if (ch.topic && !isVoice) channelOpts.topic = ch.topic;
      if (ch.slowmode && !isVoice) channelOpts.rateLimitPerUser = ch.slowmode;
      if (isVoice && typeof ch.userLimit === "number") channelOpts.userLimit = ch.userLimit;

      const created = await guild.channels.create(channelOpts);
      await sleep(250);

      // Starter guide message for key channels
      if (ch.name.toLowerCase().includes("suggestion") || ch.name.toLowerCase().includes("saran")) {
        await created.send({
          embeds: [makeEmbed("💡 Kotak Ide & Saran Komunitas", "Kirimkan saran, feedback, dan ide menarik kamu untuk perkembangan server!\n⏱️ *Slowmode 15 detik aktif untuk menjaga channel tetap teratur.*", 0xf1c40f)],
        }).catch(() => {});
      }
      if (ch.name.toLowerCase().includes("bot-command") || ch.name.toLowerCase().includes("perintah-bot")) {
        await created.send({
          embeds: [makeEmbed("🤖 Ruang Perintah Bot", "Gunakan channel ini untuk menjalankan command bot (musik, leveling, mini-games, dll) agar channel obrolan utama tetap bersih.", 0x3498db)],
        }).catch(() => {});
      }
      if (ch.name.toLowerCase().includes("media") || ch.name.toLowerCase().includes("clip") || ch.name.toLowerCase().includes("galeri") || ch.name.toLowerCase().includes("karya")) {
        await created.send({
          embeds: [makeEmbed("📸 Galeri & Media Komunitas", "Bagikan screenshot, video clip, fan art, atau meme favoritmu di sini!\n⏱️ *Slowmode aktif untuk mencegah spam postingan.*", 0x9b59b6)],
        }).catch(() => {});
      }

      if (ch.isVerifyChannel) verifyChannelRef = created;
      if (ch.name.toLowerCase().includes("rule")) rulesChannelRef = created;
      if (
        ch.isSelfRolesChannel ||
        ch.name.toLowerCase().includes("role") ||
        ch.name.toLowerCase().includes("pick") ||
        ch.name.toLowerCase().includes("pilih") ||
        ch.name.toLowerCase().includes("ambil") ||
        ch.name.toLowerCase().includes("kelompok")
      ) {
        selfRolesChannelRef = created;
      }
      if (ch.name.toLowerCase().includes("welcome")) welcomeChannelRef = created;
      if (ch.name.toLowerCase().includes("bot-log") || ch.name.toLowerCase().includes("log-bot")) logChannelRef = created;
      if (isTempVcGenerator) tempVcGeneratorRef = created;
      chCount++;
    }
    log(`  📁 ${cat.name} (${(cat.channels || []).length} ch)`);
  }

  // 5. Post welcome embed
  if (welcomeChannelRef && template.welcomeEmbed) {
    const we = template.welcomeEmbed;
    const embed = new EmbedBuilder()
      .setTitle(we.title || "Selamat Datang!")
      .setDescription(we.description || "")
      .setColor(parseColor(we.color));
    for (const f of we.fields || []) {
      embed.addFields({ name: f.name, value: f.value, inline: f.inline ?? true });
    }
    await welcomeChannelRef.send({ embeds: [embed] }).catch(() => {});
    log("  👋 Welcome embed posted");
  }

  // 6. Post rules embed
  if (rulesChannelRef && template.rulesEmbed) {
    const re = template.rulesEmbed;
    const rulesText = (re.rules || []).map((r, i) => `**${i + 1}.** ${r}`).join("\n");
    const embed = new EmbedBuilder()
      .setTitle(re.title || "📜 Rules")
      .setDescription((re.description ? re.description + "\n\n" : "") + rulesText)
      .setColor(parseColor(re.color))
      .setFooter({ text: "Melanggar rules = warn/mute/ban" });
    await rulesChannelRef.send({ embeds: [embed] }).catch(() => {});
    log("  📜 Rules embed posted");
  }

  // 7. Post verify button
  if (verifyChannelRef && verifiedRole) {
    const embed = new EmbedBuilder()
      .setTitle("✅ Verifikasi")
      .setDescription(
        "Klik tombol di bawah untuk verifikasi.\n" +
        "Setelah verify, kamu bisa pilih role dan akses semua channel!\n\n" +
        "Pastikan kamu sudah membaca rules."
      )
      .setColor(0x2ecc71);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`verify_btn_${verifiedRole.id}`).setLabel("✅ Verify & Akses Server").setStyle(ButtonStyle.Success)
    );
    await verifyChannelRef.send({ embeds: [embed], components: [row] }).catch(() => {});
    log("  ✅ Verify button posted");
  }

  // 8. Post self-role menus in dedicated channel (fallback to verify channel)
  const selfRolesChannel = selfRolesChannelRef || verifyChannelRef;
  if (selfRolesChannel && Object.keys(selfRoleMap).length > 0) {
    for (const [catName, roles] of Object.entries(selfRoleMap)) {
      if (roles.length === 0) continue;
      const cat = (template.selfRoles || []).find((c) => c.category === catName);
      const isSingleChoice = cat?.singleChoice || cat?.maxValues === 1;
      const embed = new EmbedBuilder()
        .setTitle(catName)
        .setDescription(cat?.description || (isSingleChoice ? "Pilih salah satu role:" : "Pilih satu atau beberapa role:"))
        .setColor(0x5865f2);
      const options = roles.slice(0, 25).map((r) => ({
        label: r.name.slice(0, 100), value: r.role.id, emoji: r.emoji,
      }));
      const menuId = `selfrole_${catName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)}`;
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(menuId).setPlaceholder(`Pilih ${catName}`)
          .setMinValues(0)
          .setMaxValues(isSingleChoice ? 1 : Math.min(options.length, 25))
          .addOptions(options)
      );
      await selfRolesChannel.send({ embeds: [embed], components: [row] }).catch((e) => console.error("Post self-role menu error:", e.message));
    }
    log("  🎭 Self-role menus posted");
  }

  // 9. Server settings
  log("⚙️ Configuring server...");
  try {
    await guild.setDefaultMessageNotifications(1); // mentions only
    await guild.setVerificationLevel(2); // medium
    log("  ⚙️ Server settings applied");
  } catch (e) { console.error("Server settings:", e.message); }

  // 10. Auto-mod rules
  log("🛡️ Setting up auto-mod...");
  try {
    const existingRules = await guild.autoModerationRules.fetch();
    const exemptRoleIds = staffRoleList.map((r) => r.id);

    // Anti-spam (if not exists)
    if (!existingRules.find((r) => r.name === "Setup Bot: Anti-Spam")) {
      await guild.autoModerationRules.create({
        name: "Setup Bot: Anti-Spam",
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.Spam,
        actions: [{ type: AutoModerationActionType.BlockMessage, metadata: { customMessage: "🛡️ Spam terdeteksi. Pesan diblokir." } }],
        exemptRoles: exemptRoleIds,
        enabled: true, reason: "Setup Bot auto-mod",
      }).catch(() => {});
    }
    // Anti mass-mention
    if (!existingRules.find((r) => r.name === "Setup Bot: Anti-Mention")) {
      await guild.autoModerationRules.create({
        name: "Setup Bot: Anti-Mention",
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.MentionSpam,
        triggerMetadata: { mentionTotalLimit: 5 },
        actions: [{ type: AutoModerationActionType.BlockMessage, metadata: { customMessage: "🛡️ Terlalu banyak mention. Max 5." } }],
        exemptRoles: exemptRoleIds,
        enabled: true, reason: "Setup Bot auto-mod",
      }).catch(() => {});
    }
    // Anti-scam keywords
    if (!existingRules.find((r) => r.name === "Setup Bot: Anti-Scam")) {
      await guild.autoModerationRules.create({
        name: "Setup Bot: Anti-Scam",
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.Keyword,
        triggerMetadata: {
          keywordFilter: [
            "*steam*gift*", "*discord*nitro*free*", "*airdrop*claim*", "*crypto*bonus*",
            "*free-nitro*", "*nitro-free*", "*steamcommunity*free*",
          ],
        },
        actions: [{ type: AutoModerationActionType.BlockMessage, metadata: { customMessage: "🛡️ Tautan atau kata kunci terindikasi scam/phishing." } }],
        exemptRoles: exemptRoleIds,
        enabled: true, reason: "Setup Bot anti-scam",
      }).catch(() => {});
    }
    log("  🛡️ Auto-mod rules created");
  } catch (e) { console.error("Auto-mod:", e.message); }

  // 11. Log
  if (logChannelRef) {
    await logChannelRef.send({ embeds: [makeEmbed("✅ Setup Complete", [
      `📋 ${Object.keys(createdRoles).length} roles`,
      `📁 ${(template.categories || []).length} categories`,
      `📝 ${chCount} channels`,
      `⚙️ Server settings applied`,
      `🛡️ Auto-mod enabled`,
    ].join("\n"), 0x2ecc71)] }).catch(() => {});
  }

  return {
    roles: Object.keys(createdRoles).length,
    categories: (template.categories || []).length,
    channels: chCount,
    verifiedRole: verifiedRole?.name,
    selfRoleMap,
  };
}

// ─── Clear Template ───

async function clearTemplate(guild, template) {
  const allRoleNames = new Set();
  for (const r of template.roles || []) allRoleNames.add(r.name);
  for (const cat of template.selfRoles || []) {
    for (const r of cat.roles || []) allRoleNames.add(r.name);
  }
  const catNames = new Set((template.categories || []).map((c) => c.name));
  let chDeleted = 0, catDeleted = 0, roleDeleted = 0, autoModDeleted = 0;

  await guild.channels.fetch();
  await guild.roles.fetch();

  for (const [, ch] of guild.channels.cache) {
    if (ch.type === ChannelType.GuildCategory && catNames.has(ch.name)) {
      for (const [, child] of ch.children.cache) {
        await child.delete("Setup Bot clear").catch((e) => console.error("ch del:", e.message));
        chDeleted++;
      }
      await ch.delete("Setup Bot clear").catch((e) => console.error("cat del:", e.message));
      catDeleted++;
    }
  }

  for (const [, role] of guild.roles.cache) {
    if (allRoleNames.has(role.name) && role.id !== guild.roles.everyone.id && !role.managed) {
      await role.delete("Setup Bot clear").catch((e) => console.error("role del:", e.message));
      roleDeleted++;
    }
  }

  // Delete auto-mod rules created by bot
  try {
    const rules = await guild.autoModerationRules.fetch();
    for (const [, rule] of rules) {
      if (rule.name.startsWith("Setup Bot:")) {
        await rule.delete("Setup Bot clear").catch(() => {});
        autoModDeleted++;
      }
    }
  } catch (e) { console.error("automod clear:", e.message); }

  return { roles: roleDeleted, categories: catDeleted, channels: chDeleted, autoMod: autoModDeleted };
}

// ─── Preview ───

function formatPreview(template) {
  let msg = "";
  const roles = (template.roles || []).map((r) => r.name);
  msg += `**Roles (${roles.length}):** ${roles.join(", ")}\n`;

  const selfRoleCount = (template.selfRoles || []).reduce((n, c) => n + (c.roles || []).length, 0);
  if (selfRoleCount) {
    msg += `**Self-Roles (${selfRoleCount}):** `;
    msg += (template.selfRoles || []).map((c) => `${c.category} (${(c.roles || []).length})`).join(", ") + "\n";
  }

  msg += "\n";
  for (const cat of template.categories || []) {
    msg += `📁 **${cat.name}**\n`;
    for (const ch of (cat.channels || []).slice(0, 8)) {
      const icon = ch.type === "voice" ? "🔊" : "#";
      const tags = [];
      if (ch.readOnly) tags.push("🔒");
      if (ch.staffOnly) tags.push("👁️");
      if (ch.isVerifyChannel) tags.push("✅");
      if (ch.isTempVoiceGenerator) tags.push("➕");
      msg += `${icon}${ch.name}${tags.length ? ` ${tags.join("")}` : ""}\n`;
    }
    if ((cat.channels || []).length > 8) msg += `  _...+${cat.channels.length - 8} more_\n`;
  }

  const features = [];
  if (template.welcomeEmbed) features.push("👋 Welcome");
  if (template.rulesEmbed) features.push("📜 Rules");
  if (selfRoleCount) features.push("🎭 Self-roles");
  features.push("✅ Verify");
  features.push("🛡️ Auto-mod");
  features.push("⚙️ Server settings");
  if ((template.categories || []).some((c) => (c.channels || []).some((ch) => ch.isTempVoiceGenerator))) {
    features.push("➕ Temp VC");
  }
  msg += "\n" + features.join(" • ") + "\n";

  return msg;
}

// ─── Member Join: Auto-role + Welcome ───

client.on("guildMemberAdd", async (member) => {
  try {
    // Skip bots and staff/administrators
    if (member.user.bot) return;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return;
    if (member.roles.cache.some((r) =>
      r.name.toLowerCase().includes("owner") ||
      r.name.toLowerCase().includes("admin") ||
      r.name.toLowerCase().includes("mod") ||
      r.name.toLowerCase().includes("staff")
    )) return;

    // Auto-assign unverified role
    const unverifiedRole = member.guild.roles.cache.find(
      (r) =>
        r.name.toLowerCase().includes("unverified") ||
        r.name.toLowerCase().includes("unverify") ||
        r.name.toLowerCase().includes("belum") ||
        r.name.toLowerCase().includes("not verified")
    );
    if (unverifiedRole) {
      await member.roles.add(unverifiedRole, "Auto-role on join").catch(() => {});
    }

    // Welcome message
    const welcomeCh = member.guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildText && c.name.toLowerCase().includes("welcome")
    );
    if (welcomeCh) {
      const embed = new EmbedBuilder()
        .setTitle("👋 Selamat Datang!")
        .setDescription(
          `Hai ${member}! Selamat datang di **${member.guild.name}**!\n\n` +
          `📜 Baca rules dulu\n` +
          `✅ Lalu verify untuk akses server\n` +
          `🎭 Pilih role sesuai minatmu\n\n` +
          `Kamu member ke-**${member.guild.memberCount}**! 🎉`
        )
        .setColor(0x5865f2)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();
      await welcomeCh.send({ embeds: [embed] }).catch(() => {});
    }

    await botLog(member.guild, `👋 **${member.user.tag}** joined. Members: ${member.guild.memberCount}`);
  } catch (e) { console.error("memberAdd:", e.message); }
});

// ─── Auto-remove Unverified role when Verified role is acquired ───

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  try {
    const hasVerified = newMember.roles.cache.some(
      (r) =>
        r.name.toLowerCase().includes("mahasiswa") ||
        r.name.toLowerCase().includes("member") ||
        r.name.toLowerCase().includes("verified") ||
        r.name.toLowerCase().includes("siswa")
    );
    if (!hasVerified) return;

    const unverifiedRole = newMember.roles.cache.find(
      (r) =>
        r.name.toLowerCase().includes("unverified") ||
        r.name.toLowerCase().includes("unverify") ||
        r.name.toLowerCase().includes("belum") ||
        r.name.toLowerCase().includes("not verified")
    );
    if (unverifiedRole) {
      await newMember.roles.remove(unverifiedRole, "Auto-strip unverified upon verification").catch(() => {});
    }
  } catch (e) {
    console.error("guildMemberUpdate error:", e.message);
  }
});

// ─── Temp Voice Channel ───

client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    // User joined a temp VC generator channel
    if (newState.channel && (newState.channel.name.includes("➕") || newState.channel.name.toLowerCase().includes("create"))) {
      const guild = newState.guild;
      let member = newState.member;
      if (!member && newState.id) {
        member = await guild.members.fetch(newState.id).catch(() => null);
      }
      if (!member) return;

      // Check limit (max 10 temp VCs per guild)
      const activeCount = [...tempVoiceChannels.values()].filter((v) => v.guildId === guild.id).length;
      if (activeCount >= 10) return;

      // Create temp VC in same category
      const parent = newState.channel.parent;
      const name = `🔊 ${member.displayName || member.user?.username || "Private"}'s Room`;
      const tempCh = await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        parent: parent?.id,
        permissionOverwrites: [
          { id: member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers] },
        ],
        reason: `Temp VC by ${member.user?.tag || member.id}`,
      });

      tempVoiceChannels.set(tempCh.id, { ownerId: member.id, guildId: guild.id });
      await member.voice.setChannel(tempCh).catch(() => {});
      await botLog(guild, `➕ **${member.user?.tag || member.id}** created temp VC: ${tempCh.name}`);
    }

    // User left a temp VC — delete if empty
    if (oldState.channel && tempVoiceChannels.has(oldState.channel.id)) {
      const ch = oldState.channel;
      if (ch.members && ch.members.size === 0) {
        const chName = ch.name;
        await ch.delete("Temp VC empty").catch(() => {});
        tempVoiceChannels.delete(ch.id);
        await botLog(oldState.guild, `🗑️ Temp VC deleted: ${chName} (empty)`);
      }
    }
  } catch (e) { console.error("voiceState:", e.message); }
});

// ─── Interaction Handlers ───

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err, origin) => {
  console.error("Uncaught Exception:", err, "origin:", origin);
});

const pendingSetups = new Map();
const pendingClears = new Map();

client.on("interactionCreate", async (interaction) => {
  try {
    // ── Button: Verify + Show Self-Role Menu ──
    if (interaction.isButton() && (interaction.customId === "verify_btn" || interaction.customId.startsWith("verify_btn_"))) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const guild = interaction.guild;
      const member = interaction.member;

      // Locate verified role via ID or broad keyword matching
      let verifiedRole = null;
      if (interaction.customId.startsWith("verify_btn_")) {
        const targetRoleId = interaction.customId.replace("verify_btn_", "");
        verifiedRole = guild.roles.cache.get(targetRoleId);
      }
      if (!verifiedRole) {
        verifiedRole = guild.roles.cache.find(
          (r) =>
            r.name.toLowerCase().includes("mahasiswa") ||
            r.name.toLowerCase().includes("student") ||
            r.name.toLowerCase().includes("member") ||
            r.name.toLowerCase().includes("verified") ||
            r.name.toLowerCase().includes("peserta") ||
            r.name.toLowerCase().includes("warga") ||
            r.name.toLowerCase().includes("siswa")
        );
      }

      // Check if user is staff/admin
      const isStaffOrAdmin = member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.roles.cache.some((r) =>
          r.name.toLowerCase().includes("owner") ||
          r.name.toLowerCase().includes("admin") ||
          r.name.toLowerCase().includes("mod") ||
          r.name.toLowerCase().includes("staff")
        );

      // Remove unverified role if exists
      const unverifiedRole = guild.roles.cache.find(
        (r) =>
          r.name.toLowerCase().includes("unverified") ||
          r.name.toLowerCase().includes("unverify") ||
          r.name.toLowerCase().includes("belum") ||
          r.name.toLowerCase().includes("not verified")
      );
      if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
        await member.roles.remove(unverifiedRole, "Verified").catch(() => {});
      }

      // Find self-role menus and general chat to show clickable links
      const selfRoleCh = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && (
          c.name.toLowerCase().includes("role") ||
          c.name.toLowerCase().includes("pick") ||
          c.name.toLowerCase().includes("pilih") ||
          c.name.toLowerCase().includes("ambil") ||
          c.name.toLowerCase().includes("kelompok")
        )
      );
      const generalCh = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildText &&
        (c.name.toLowerCase().includes("general") || c.name.toLowerCase().includes("chat") || c.name.toLowerCase().includes("obrolan"))
      );

      let extraMsg = "";
      if (selfRoleCh) {
        extraMsg += `\n\n🎭 Ambil role kelompok, notifikasi, dan identitas di <#${selfRoleCh.id}>!`;
      }
      if (generalCh) {
        extraMsg += `\n💬 Mulai ngobrol seru bareng member lain di <#${generalCh.id}>!`;
      }

      if (!verifiedRole) {
        return interaction.editReply({ content: "❌ Verified role not found. Contact admin." });
      }

      // If user is staff/admin, assign role too so they can access public category channels if their staff role lacks Admin perm
      if (isStaffOrAdmin) {
        if (!member.roles.cache.has(verifiedRole.id)) {
          await member.roles.add(verifiedRole, "Staff verify & access").catch(() => {});
        }
        await interaction.editReply({
          content: `✅ Status Staff/Admin terkonfirmasi! Role **${verifiedRole.name}** aktif & channel terbuka.${extraMsg}`,
        });
        await botLog(guild, `🛡️ **${member.user.tag}** (Staff) verified`);
        return;
      }

      if (member.roles.cache.has(verifiedRole.id)) {
        return interaction.editReply({ content: "✅ Kamu sudah terverifikasi!" });
      }

      await member.roles.add(verifiedRole, "Self-verify").catch(() => {});

      await interaction.editReply({
        content: `✅ Terverifikasi! Kamu dapat role **${verifiedRole.name}**.${extraMsg}\n\nSelamat bergabung di komunitas! 🎉`,
      });

      await botLog(guild, `✅ **${member.user.tag}** verified`);
      return;
    }

    // ── Select Menu: Self-roles ──
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith("selfrole_")) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const member = interaction.member;
      const guild = interaction.guild;
      const selectedIds = interaction.values;
      const allOptionIds = interaction.component.options.map((o) => o.value);

      for (const roleId of allOptionIds) {
        const role = guild.roles.cache.get(roleId);
        if (!role) continue;
        if (selectedIds.includes(roleId) && !member.roles.cache.has(roleId)) {
          await member.roles.add(role, "Self-role select").catch(() => {});
        } else if (!selectedIds.includes(roleId) && member.roles.cache.has(roleId)) {
          await member.roles.remove(role, "Self-role deselect").catch(() => {});
        }
      }

      const names = selectedIds.map((id) => guild.roles.cache.get(id)?.name || id).join(", ");
      await botLog(guild, `🎭 **${member.user.tag}** updated roles: ${names || "(cleared)"}`);
      return interaction.editReply({
        content: selectedIds.length ? `🎭 Role kamu berhasil diupdate: **${names}**` : "🎭 Semua role dari menu ini telah dilepas.",
      });
    }

    // ── Button: Confirm Setup ──
    if (interaction.isButton() && interaction.customId.startsWith("confirm_setup_")) {
      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ Hanya Bot Owner atau Administrator yang boleh apply template.", flags: MessageFlags.Ephemeral });
      }
      const code = interaction.customId.replace("confirm_setup_", "");
      let pending = pendingSetups.get(code);
      if (!pending) {
        const saved = loadTemplate(code);
        if (saved) pending = { template: saved.template, userId: interaction.user.id };
      }
      if (!pending) {
        return interaction.reply({ content: "❌ Template tidak ditemukan.", flags: MessageFlags.Ephemeral });
      }
      pendingSetups.delete(code);

      await interaction.deferUpdate();
      await interaction.editReply({
        embeds: [makeEmbed("⏳ Applying...", `Setting up template \`${code}\`...\nIni bisa makan waktu 1-2 menit. Jangan close Discord.`, 0xf39c12)],
        components: [],
      }).catch(() => {});

      let lastUpdate = Date.now();
      const stats = await applyTemplate(interaction.guild, pending.template, async (msg) => {
        if (Date.now() - lastUpdate > 3000) {
          await interaction.editReply({ embeds: [makeEmbed("⏳ Applying...", msg, 0xf39c12)] }).catch(() => {});
          lastUpdate = Date.now();
        }
      });

      appliedTemplates.set(interaction.guild.id, code);

      await interaction.editReply({
        embeds: [
          makeEmbed("✅ Setup Selesai!", [
            `📋 **${stats.roles}** roles`,
            `📁 **${stats.categories}** categories`,
            `📝 **${stats.channels}** channels`,
            stats.verifiedRole ? `✅ Verified role: **${stats.verifiedRole}**` : "",
            "", "**Auto-configured:**",
            "🎭 Self-role menus", "✅ Verify button", "👋 Welcome & 📜 Rules embeds",
            "⚙️ Server settings (notif: mentions only, verify: medium)",
            "🛡️ Auto-mod (anti-spam, anti-mention)",
            "➕ Temp voice channels",
            "📝 Bot logging",
          ].filter(Boolean).join("\n"), 0x2ecc71),
          companionBotEmbed(stats.verifiedRole),
        ],
        components: [companionBotActionRow()],
      }).catch((e) => console.error("editReply final setup:", e.message));
      return;
    }

    // ── Button: Cancel Setup ──
    if (interaction.isButton() && interaction.customId.startsWith("cancel_setup_")) {
      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ Hanya Bot Owner atau Administrator yang boleh cancel setup.", flags: MessageFlags.Ephemeral });
      }
      const code = interaction.customId.replace("cancel_setup_", "");
      pendingSetups.delete(code);
      await interaction.update({ embeds: [makeEmbed("❌ Dibatalkan", "Setup dibatalkan.", 0xe74c3c)], components: [] }).catch(() => {});
      return;
    }

    // ── Button: Confirm Clear ──
    if (interaction.isButton() && interaction.customId.startsWith("confirm_clear_")) {
      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ Hanya Bot Owner atau Administrator yang boleh clear template.", flags: MessageFlags.Ephemeral });
      }
      const code = interaction.customId.replace("confirm_clear_", "");
      let pending = pendingClears.get(code);
      if (!pending) {
        const saved = loadTemplate(code);
        if (saved) pending = { template: saved.template, userId: interaction.user.id };
      }
      if (!pending) {
        return interaction.reply({ content: "❌ Template tidak ditemukan.", flags: MessageFlags.Ephemeral });
      }
      pendingClears.delete(code);

      await interaction.deferUpdate();
      await interaction.editReply({
        embeds: [makeEmbed("🗑️ Clearing...", `Menghapus template \`${code}\`...\nJangan close Discord.`, 0xf39c12)],
        components: [],
      }).catch(() => {});

      const stats = await clearTemplate(interaction.guild, pending.template);
      appliedTemplates.delete(interaction.guild.id);

      await interaction.editReply({
        embeds: [makeEmbed("✅ Clear Selesai!", [
          `🗑️ **${stats.roles}** roles dihapus`,
          `📁 **${stats.categories}** categories dihapus`,
          `📝 **${stats.channels}** channels dihapus`,
          `🛡️ **${stats.autoMod}** auto-mod rules dihapus`,
        ].join("\n"), 0x2ecc71)],
        components: [],
      }).catch((e) => console.error("editReply final clear:", e.message));
      return;
    }

    // ── Button: Cancel Clear ──
    if (interaction.isButton() && interaction.customId.startsWith("cancel_clear_")) {
      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ Hanya Bot Owner atau Administrator yang boleh cancel clear.", flags: MessageFlags.Ephemeral });
      }
      const code = interaction.customId.replace("cancel_clear_", "");
      pendingClears.delete(code);
      await interaction.update({ embeds: [makeEmbed("❌ Dibatalkan", "Clear dibatalkan.", 0xe74c3c)], components: [] }).catch(() => {});
      return;
    }

    // ── Button: View Companion Guide ──
    if (interaction.isButton() && interaction.customId === "view_companion_guide") {
      await interaction.reply({ embeds: [carlBotGuideEmbed()], flags: MessageFlags.Ephemeral });
      return;
    }

    // ── Slash Commands ──
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    // Public command: /bots
    if (commandName === "bots") {
      await interaction.reply({
        embeds: [botsEmbed(), companionBotEmbed()],
        components: [companionBotActionRow()],
      });
      return;
    }

    // Protected commands: Bot Owner & Administrator only
    if (!isAuthorized(interaction)) {
      return interaction.reply({
        content: "❌ Command ini hanya dapat digunakan oleh **Bot Owner** atau **Administrator** server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // /generate
    if (commandName === "generate") {
      const desc = interaction.options.getString("deskripsi");
      await interaction.deferReply();
      await interaction.editReply({ embeds: [makeEmbed("🤖 Generating...", `*"${desc}"*\n⏳ Tunggu AI mikir...`, 0xf39c12)] });

      const { template } = await generateTemplate(desc, async (status) => {
        await interaction.editReply({ embeds: [makeEmbed("🤖 Generating...", `*"${desc}"*\n${status}`, 0xf39c12)] }).catch(() => {});
      });

      const code = saveTemplate(template, desc);
      const preview = formatPreview(template);

      const descContent = [
        `📋 Kode: **\`${code}\`**`,
        `📝 ${desc.slice(0, 100)}`, "",
        preview.slice(0, 3500), "",
        `Apply: \`/setup kode:${code}\``,
        `Revisi: \`/revise kode:${code} feedback:...\``,
        `Hapus: \`/clear-setup kode:${code}\``,
      ].join("\n").slice(0, 4090);

      const embed = makeEmbed("✅ Template Generated!", descContent, 0x2ecc71);

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // /revise
    if (commandName === "revise") {
      const code = interaction.options.getString("kode");
      const feedback = interaction.options.getString("feedback");
      const saved = loadTemplate(code);
      if (!saved) return interaction.reply({ content: `❌ Template \`${code}\` tidak ditemukan.`, flags: MessageFlags.Ephemeral });

      await interaction.deferReply();
      await interaction.editReply({ embeds: [makeEmbed("🔄 Revising...", `Merevisi template \`${code}\`...\n💬 *"${feedback}"*`, 0xf39c12)] });

      const { template } = await reviseTemplate(saved.template, feedback, async (status) => {
        await interaction.editReply({ embeds: [makeEmbed("🔄 Revising...", status, 0xf39c12)] }).catch(() => {});
      });

      const newCode = saveTemplate(template, `${saved.description} [revised: ${feedback.slice(0, 50)}]`);
      const preview = formatPreview(template);

      const descContent = [
        `📋 Kode baru: **\`${newCode}\`** (dari \`${code}\`)`,
        `💬 Revisi: ${feedback.slice(0, 80)}`, "",
        preview.slice(0, 3500), "",
        `Apply: \`/setup kode:${newCode}\``,
      ].join("\n").slice(0, 4090);

      const embed = makeEmbed("✅ Template Revised!", descContent, 0x2ecc71);

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // /templates
    if (commandName === "templates") {
      const list = listTemplates();
      if (!list.length) return interaction.reply({ content: "📭 Belum ada template. Pakai `/generate` dulu.", flags: MessageFlags.Ephemeral });
      let desc = "";
      for (const t of list) {
        const line = `**\`${t.code}\`** — ${t.description.slice(0, 50)}${t.description.length > 50 ? "..." : ""}\n`;
        if (desc.length + line.length > 3900) { desc += "_...dan lainnya_\n"; break; }
        desc += line;
      }
      desc += `\nPakai: \`/setup kode:KODE\``;
      await interaction.reply({ embeds: [makeEmbed("📋 Template Tersedia", desc)] });
      return;
    }

    // /setup — with duplicate detection + confirm
    if (commandName === "setup") {
      const code = interaction.options.getString("kode");
      const saved = loadTemplate(code);
      if (!saved) return interaction.reply({ content: `❌ Template \`${code}\` tidak ditemukan.`, flags: MessageFlags.Ephemeral });

      await interaction.deferReply();

      // Duplicate detection
      const existingCode = appliedTemplates.get(interaction.guild.id);
      let warning = "";
      if (existingCode) {
        warning = `\n\n⚠️ **Template \`${existingCode}\` sudah pernah di-apply ke server ini.**\nLakukan \`/clear-setup kode:${existingCode}\` dulu kalau mau ganti, atau lanjut apply (bisa duplikat).\n`;
      }

      // Check if category names already exist
      const existingCats = [];
      await interaction.guild.channels.fetch().catch(() => {});
      for (const cat of saved.template.categories || []) {
        if (interaction.guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === cat.name)) {
          existingCats.push(cat.name);
        }
      }
      if (existingCats.length) {
        warning += `\n⚠️ **${existingCats.length} category sudah ada** di server (bisa duplikat):\n${existingCats.slice(0, 5).join(", ")}\n`;
      }

      const preview = formatPreview(saved.template);
      const embed = makeEmbed(`⚠️ Confirm Setup — \`${code}\``, [
        `📝 ${(saved.description || "").slice(0, 80)}`,
        warning, "",
        preview.slice(0, 2500), "",
        "**Klik ✅ Apply untuk mulai setup, atau ❌ Cancel untuk batal.**",
      ].join("\n").slice(0, 4090), 0xf39c12);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`confirm_setup_${code}`).setLabel("✅ Apply").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`cancel_setup_${code}`).setLabel("❌ Cancel").setStyle(ButtonStyle.Danger),
      );

      pendingSetups.set(code, { template: saved.template, userId: interaction.user.id });
      await interaction.editReply({ embeds: [embed], components: [row] });
      return;
    }

    // /clear-setup
    if (commandName === "clear-setup") {
      const code = interaction.options.getString("kode");
      const saved = loadTemplate(code);
      if (!saved) return interaction.reply({ content: `❌ Template \`${code}\` tidak ditemukan.`, flags: MessageFlags.Ephemeral });

      await interaction.deferReply();

      const embed = makeEmbed(`⚠️ Confirm Clear — \`${code}\``, [
        `📝 ${(saved.description || "").slice(0, 80)}`, "",
        "**Ini akan MENGHAPUS:**",
        "• Semua channels & categories dari template",
        "• Semua roles dari template",
        "• Auto-mod rules yang dibuat bot", "",
        "Klik 🗑️ Clear untuk lanjut, atau ❌ Cancel untuk batal.",
      ].join("\n"), 0xe74c3c);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`confirm_clear_${code}`).setLabel("🗑️ Clear").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`cancel_clear_${code}`).setLabel("❌ Cancel").setStyle(ButtonStyle.Secondary),
      );

      pendingClears.set(code, { template: saved.template, userId: interaction.user.id });
      await interaction.editReply({ embeds: [embed], components: [row] });
      return;
    }

    // /delete-template
    if (commandName === "delete-template") {
      const code = interaction.options.getString("kode");
      if (code.toLowerCase() === "all") {
        const count = deleteTemplate("ALL");
        await interaction.reply({ embeds: [makeEmbed("🗑️ Semua Template Dihapus", `Berhasil menghapus ${count} template dari penyimpanan.`, 0x2ecc71)] });
        return;
      }
      if (deleteTemplate(code)) {
        await interaction.reply({ embeds: [makeEmbed("🗑️ Template Dihapus", `Template \`${code}\` berhasil dihapus.`, 0x2ecc71)] });
      } else {
        await interaction.reply({ content: `❌ Template \`${code}\` tidak ditemukan.`, flags: MessageFlags.Ephemeral });
      }
      return;
    }

    // /bots
    if (commandName === "bots") {
      await interaction.reply({ embeds: [botsEmbed()] });
      return;
    }

  } catch (err) {
    console.error(err);
    if (err.code === 10062) return;
    try {
      const msg = `❌ Error: ${(err.message || "Unknown").slice(0, 200)}`;
      if (interaction.replied || interaction.deferred) await interaction.editReply(msg).catch(() => {});
      else await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    } catch (_) {}
  }
});

client.login(process.env.DISCORD_TOKEN);
