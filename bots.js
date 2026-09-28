import { EmbedBuilder } from "discord.js";

export const recommendedBots = [
  { name: "MEE6", desc: "Auto-mod, leveling, welcome", invite: "https://mee6.xyz/add", emoji: "🤖" },
  { name: "Carl-bot", desc: "Reaction roles, logging, custom cmd", invite: "https://carl.gg/invite", emoji: "🔧" },
  { name: "ProBot", desc: "Welcome image, auto-role, anti-raid", invite: "https://probot.io/invite", emoji: "🛡️" },
  { name: "Jockie Music", desc: "Music player, multi-instance", invite: "https://discord.com/oauth2/authorize?client_id=411916947773587456&permissions=36702208&scope=bot", emoji: "🎵" },
  { name: "Tatsu", desc: "Leveling, economy, profile cards", invite: "https://tatsu.gg/invite", emoji: "📊" },
  { name: "GiveawayBot", desc: "Giveaway + timer + reroll", invite: "https://discord.com/oauth2/authorize?client_id=294882584201003009&permissions=76800&scope=bot", emoji: "🎉" },
  { name: "Dyno", desc: "Moderation, auto-mod, logging", invite: "https://dyno.gg/invite", emoji: "⚡" },
  { name: "Ticket Tool", desc: "Ticket system untuk support", invite: "https://tickettool.xyz/invite", emoji: "🎫" },
];

export function botsEmbed() {
  const embed = new EmbedBuilder()
    .setTitle("🤖 Recommended Bots")
    .setDescription("Klik link untuk invite ke server:")
    .setColor(0x5865f2);

  for (const bot of recommendedBots) {
    embed.addFields({ name: `${bot.emoji} ${bot.name}`, value: `${bot.desc}\n[Invite](${bot.invite})`, inline: true });
  }
  embed.setFooter({ text: "Invite satu-satu, setup via dashboard masing-masing bot." });
  return embed;
}
