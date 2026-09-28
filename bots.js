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
    .setTitle("📖 Panduan Lengkap Setup Bot Pendamping 24/7")
    .setDescription("Server sudah disiapkan dengan sistem Category-Sync & permission yang kompatibel 100% dengan bot di bawah:")
    .addFields(
      {
        name: "0️⃣ Urutan Role Discord (PENTING)",
        value: "Masuk ke **Server Settings** → **Roles** → Geser role **Carl-bot** ke posisi paling atas (di bawah role Dosen/Admin). Carl-bot tidak bisa memberi role jika posisinya berada di bawah role Mahasiswa.",
        inline: false,
      },
      {
        name: "1️⃣ Verify Gate 24/7 di #✅verify (Carl-bot)",
        value:
          "1. Buka channel `#✅verify` lalu ketik: `!rr make`\n" +
          "2. Channel target: ketik `#✅verify`\n" +
          "3. Judul: `Verifikasi Mahasiswa | Klik ✅ untuk membuka akses kuliah`\n" +
          "4. Warna: `#2ecc71`\n" +
          "5. Emoji & Role: ketik `✅ @🎓 Mahasiswa` lalu `done`\n" +
          "6. **Set Type Verify**: ketik `!rr type 4` (agar sekali klik langsung terverifikasi permanen walau un-react).",
        inline: false,
      },
      {
        name: "2️⃣ Dropdown / Pilih Kelas di #🎭pilih-kelas (Carl-bot)",
        value:
          "1. Buka channel `#🎭pilih-kelas` lalu ketik: `!rr make`\n" +
          "2. Masukkan opsi kelas:\n" +
          "   `🏷️ @🏷️ IF-2-KA`\n" +
          "   `🔖 @🏷️ IF-2-KM`\n" +
          "3. Ketik `done` lalu ketik `!rr type 2` (Unique Mode: mahasiswa hanya bisa memilih salah satu kelas).",
        inline: false,
      },
      {
        name: "3️⃣ Auto-Role Member Baru (Dyno)",
        value:
          "1. Buka dashboard `dyno.gg` → pilih server\n" +
          "2. Masuk ke tab **Modules** → **Autoroles**\n" +
          "3. Tambahkan role: **⏳ Unverified** (agar tiap akun baru otomatis dapat role unverified saat pertama kali join).",
        inline: false,
      },
      {
        name: "4️⃣ Temp Voice 24/7 (VoiceMaster)",
        value:
          "1. Invite VoiceMaster lewat tombol di atas\n" +
          "2. Ketik `/setup` di channel chat\n" +
          "3. Pilih `#➕create-room` sebagai channel Join to Create.",
        inline: false,
      }
    )
    .setColor(0x2ecc71)
    .setFooter({ text: "Sistem Category-Sync • 100% Synced • Siap pakai 24/7" });
}
