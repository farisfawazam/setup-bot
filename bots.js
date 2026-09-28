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
    .setTitle("📖 Panduan Singkat Setup Bot 24/7")
    .setDescription("Ikuti langkah berikut agar server bisa jalan otomatis selamanya tanpa laptop kamu nyala:")
    .addFields(
      {
        name: "0️⃣ Urutan Role (Wajib)",
        value: "Masuk ke **Server Settings** → **Roles** → Geser role **Carl-bot** ke posisi paling atas (di bawah role Owner/Admin).",
        inline: false,
      },
      {
        name: "1️⃣ Pasang Verify 24/7 di #✅verify (Carl-bot)",
        value:
          "1. Buka channel `#✅verify`\n" +
          "2. Ketik: `!rr make`\n" +
          "3. Saat ditanya channel, ketik: `#✅verify`\n" +
          "4. Saat ditanya judul/pesan, ketik:\n" +
          "   `Verifikasi Mahasiswa | Klik emoji di bawah untuk membuka akses server!`\n" +
          "5. Saat ditanya warna hex, ketik: `#2ecc71`\n" +
          "6. Saat ditanya emoji & role, ketik:\n" +
          "   `✅ @🎓 Mahasiswa`\n" +
          "7. Ketik: `done`",
        inline: false,
      },
      {
        name: "2️⃣ Pasang Pemilihan Kelas di #🎭pilih-kelas (Carl-bot)",
        value:
          "1. Buka channel `#🎭pilih-kelas`\n" +
          "2. Ketik: `!rr make`\n" +
          "3. Ikuti alurnya, masukkan emoji dan role masing-masing kelas:\n" +
          "   `🏷️ @🏷️ IF-2-KA`\n" +
          "   `🏷️ @🏷️ IF-2-KM`\n" +
          "4. Ketik: `done`",
        inline: false,
      },
      {
        name: "3️⃣ Pasang Temp Voice 24/7 (VoiceMaster)",
        value:
          "1. Invite VoiceMaster lewat tombol di atas\n" +
          "2. Ketik `/setup` di channel chat\n" +
          "3. VoiceMaster otomatis membuat channel `Join to Create` 24 jam nonstop.",
        inline: false,
      }
    )
    .setColor(0x2ecc71)
    .setFooter({ text: "Sistem Discord native • 100% gratis • 24/7 tanpa perlu laptop nyala" });
}
