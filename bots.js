import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const recommendedBots = [
  { name: "Carl-bot", desc: "Reaction roles 24/7, verify gate, logging", invite: "https://carl.gg/invite", emoji: "🔧" },
  { name: "Dyno", desc: "Auto-roles saat join, auto-mod, moderation", invite: "https://dyno.gg/invite", emoji: "⚡" },
  { name: "ProBot", desc: "Welcome image, auto-role 24/7, anti-raid", invite: "https://probot.io/invite", emoji: "🛡️" },
  { name: "VoiceMaster", desc: "Temp voice channels (join-to-create) 24/7", invite: "https://discord.com/oauth2/authorize?client_id=472911936951156740&scope=bot&permissions=285215760", emoji: "🔊" },
  { name: "MEE6", desc: "Auto-mod, leveling, custom commands", invite: "https://mee6.xyz/add", emoji: "🤖" },
  { name: "Ticket Tool", desc: "Sistem tiket pengaduan / asistensi tugas", invite: "https://tickettool.xyz/invite", emoji: "🎫" },
];

export function botsEmbed() {
  const embed = new EmbedBuilder()
    .setTitle("🤖 Recommended 24/7 Companion Bots")
    .setDescription("Bot rekomendasi untuk backup verify, role, dan temp voice saat bot utama offline:")
    .setColor(0x5865f2);

  for (const bot of recommendedBots) {
    embed.addFields({ name: `${bot.emoji} ${bot.name}`, value: `${bot.desc}\n[Invite](${bot.invite})`, inline: true });
  }
  embed.setFooter({ text: "Invite satu-satu, setup via dashboard masing-masing bot." });
  return embed;
}

export function companionBotEmbed(verifiedRoleName = "Member") {
  return new EmbedBuilder()
    .setTitle("🤖 Saran Bot Pendamping 24/7 (Verify & Role)")
    .setDescription(
      "Supaya sistem **Verify**, **Pilih Role**, dan **Temp Voice** tetap aktif 24 jam nonstop tanpa menunggu laptop kamu online, sangat disarankan menambahkan bot publik berikut:"
    )
    .addFields(
      {
        name: "1. 🔧 Carl-bot (Spesialis Verify & Reaction Roles 24/7)",
        value:
          `• **Untuk Verify**: Pasang reaction role di channel \`#✅verify\` agar member dapat role **${verifiedRoleName}** saat klik emoji/tombol.\n` +
          "• **Untuk Dropdown/Pilih Kelas**: Pasang reaction role di \`#🎭pilih-kelas\` untuk pembagian kelompok/kelas paralel.",
        inline: false,
      },
      {
        name: "2. ⚡ Dyno / ProBot (Auto-Role Saat Join)",
        value: "• Otomatis memberikan role saat mahasiswa baru join ke server.",
        inline: false,
      },
      {
        name: "3. 🔊 VoiceMaster (Temp Voice 24/7)",
        value: "• Pengganti fitur \`➕create-room\` agar mahasiswa bisa buat ruang voice diskusi kapan saja.",
        inline: false,
      }
    )
    .setColor(0x3498db)
    .setFooter({ text: "Klik tombol di bawah untuk invite bot pendamping langsung ke server dosen" });
}

export function companionBotActionRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Invite Carl-bot (Verify & Role)")
      .setStyle(ButtonStyle.Link)
      .setURL("https://carl.gg/invite"),
    new ButtonBuilder()
      .setLabel("Invite Dyno (Auto-Role)")
      .setStyle(ButtonStyle.Link)
      .setURL("https://dyno.gg/invite"),
    new ButtonBuilder()
      .setLabel("Invite VoiceMaster (Temp VC)")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com/oauth2/authorize?client_id=472911936951156740&scope=bot&permissions=285215760"),
    new ButtonBuilder()
      .setCustomId("view_companion_guide")
      .setLabel("📖 Panduan Setup 24/7")
      .setStyle(ButtonStyle.Primary)
  );
}

export function carlBotGuideEmbed() {
  return new EmbedBuilder()
    .setTitle("📖 Panduan Setup Bot 24/7 (Tanpa Prefix / Web GUI)")
    .setDescription("Discord bot modern memakai Dashboard Web atau Slash Command `/` (tanpa prefix `!` atau `?`):")
    .addFields(
      {
        name: "0️⃣ Izin & Urutan Role (WAJIB)",
        value:
          "1. Buka **Server Settings** → **Roles** → klik role **Carl-bot**.\n" +
          "2. Tab **Permissions** → scroll paling bawah → centang **Administrator** → Simpan *(agar bebas embed tautan/embed links)*.\n" +
          "3. Geser posisi role **Carl-bot** ke atas role **Mahasiswa**.",
        inline: false,
      },
      {
        name: "1️⃣ Verify Gate di #✅verify (Dashboard carl.gg)",
        value:
          "1. Buka [carl.gg](https://carl.gg) → Login → Pilih Server\n" +
          "2. Klik menu **Reaction Roles** → **Create new reaction role**\n" +
          "3. Pilih Channel: `#✅verify`\n" +
          "4. Mode: pilih **Verify** *(sekali klik permanen)*\n" +
          "5. Emoji & Role: pilih `✅` dan `@🎓 Mahasiswa`\n" +
          "6. Klik **Create**.",
        inline: false,
      },
      {
        name: "2️⃣ Pilih Kelas di #🎭pilih-kelas (Dashboard carl.gg)",
        value:
          "1. Di [carl.gg](https://carl.gg) → Reaction Roles → **Create new reaction role**\n" +
          "2. Pilih Channel: `#🎭pilih-kelas`\n" +
          "3. Mode: pilih **Unique** *(hanya bisa pilih 1 kelas)*\n" +
          "4. Tambahkan emoji & role kelas:\n" +
          "   • `🏷️` ➔ `@🏷️ IF-2-KA`\n" +
          "   • `🔖` ➔ `@🏷️ IF-2-KM`\n" +
          "5. Klik **Create**.",
        inline: false,
      },
      {
        name: "3️⃣ Auto-Role Member Baru (Dyno Slash Command)",
        value:
          "Ketik slash command di chat:\n" +
          "`/autorole add role:@⏳ Unverified`\n" +
          "*(Atau via web [dyno.gg](https://dyno.gg) → Modules → Autoroles)*",
        inline: false,
      },
      {
        name: "4️⃣ Temp Voice 24/7 (VoiceMaster Slash Command)",
        value:
          "Ketik slash command di chat:\n" +
          "`/setup` ➔ pilih channel `#➕create-room`.",
        inline: false,
      }
    )
    .setColor(0x2ecc71)
    .setFooter({ text: "100% Bebas Prefix • Native Discord Slash / Dashboard" });
}
