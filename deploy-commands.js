import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from "discord.js";
import "dotenv/config";

const commands = [
  // ─── AI Template Engine (Original Core) ───
  new SlashCommandBuilder()
    .setName("generate")
    .setDescription("Generate template server pakai AI — deskripsikan server impianmu")
    .addStringOption((o) => o.setName("deskripsi").setDescription("Deskripsi server yang kamu mau").setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("revise")
    .setDescription("Revisi template yang sudah ada dengan feedback AI")
    .addStringOption((o) => o.setName("kode").setDescription("Kode template yang ingin direvisi").setRequired(true))
    .addStringOption((o) => o.setName("feedback").setDescription("Apa yang ingin diubah/ditambah/dikurangi?").setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup server dari template (Admin only, with confirm)")
    .addStringOption((o) => o.setName("kode").setDescription("Kode template dari /generate").setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("clear-setup")
    .setDescription("Hapus semua channel & role dari template (Admin only, with confirm)")
    .addStringOption((o) => o.setName("kode").setDescription("Kode template yang mau di-clear").setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("templates")
    .setDescription("Lihat daftar template yang sudah di-generate")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("delete-template")
    .setDescription("Hapus template dari daftar (tidak hapus channel/role di server)")
    .addStringOption((o) => o.setName("kode").setDescription("Kode template yang mau dihapus").setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("bots")
    .setDescription("Lihat daftar bot recommended untuk server")
    .toJSON(),

  // ─── AI Assistant & Smart Helper ───
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Tanya asisten AI Raviel tentang apa saja (koding, gaming, info, tugas, umum)")
    .addStringOption((o) => o.setName("pertanyaan").setDescription("Pertanyaan yang ingin kamu tanyakan ke AI").setRequired(true))
    .toJSON(),

  // ─── Utility & Info ───
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek latensi WebSocket dan respon Discord API bot")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Tampilkan statistik dan informasi lengkap server ini")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Tampilkan detail profil member Discord")
    .addUserOption((o) => o.setName("target").setDescription("Member yang ingin dilihat profilnya (default: diri sendiri)"))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Pasang alarm pengingat waktu otomatis (gaming, tugas, meeting, dll)")
    .addIntegerOption((o) => o.setName("menit").setDescription("Berapa menit dari sekarang (contoh: 15, 60)").setRequired(true).setMinValue(1).setMaxValue(10080))
    .addStringOption((o) => o.setName("pesan").setDescription("Pesan pengingat").setRequired(true))
    .toJSON(),

  // ─── Staff & Moderation Suite ───
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Kirim pesan atau pengumuman resmi atas nama bot (Khusus Staff)")
    .addStringOption((o) => o.setName("pesan").setDescription("Isi pesan yang ingin dikirim").setRequired(true))
    .addChannelOption((o) => o.setName("channel").setDescription("Channel tujuan (default: channel saat ini)").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Hapus pesan massal di channel ini secara bersih (Khusus Staff)")
    .addIntegerOption((o) => o.setName("jumlah").setDescription("Jumlah pesan yang ingin dihapus (1 - 100)").setRequired(true).setMinValue(1).setMaxValue(100))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Keluarkan member dari server (Khusus Staff)")
    .addUserOption((o) => o.setName("target").setDescription("Member yang akan di-kick").setRequired(true))
    .addStringOption((o) => o.setName("alasan").setDescription("Alasan kick"))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban member dari server (Khusus Staff)")
    .addUserOption((o) => o.setName("target").setDescription("Member yang akan di-ban").setRequired(true))
    .addStringOption((o) => o.setName("alasan").setDescription("Alasan ban"))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Mute / timeout sementara member (Khusus Staff)")
    .addUserOption((o) => o.setName("target").setDescription("Member yang akan di-timeout").setRequired(true))
    .addIntegerOption((o) => o.setName("menit").setDescription("Durasi timeout dalam menit").setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption((o) => o.setName("alasan").setDescription("Alasan timeout"))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Beri peringatan resmi ke member (Khusus Staff)")
    .addUserOption((o) => o.setName("target").setDescription("Member yang akan diperingatkan").setRequired(true))
    .addStringOption((o) => o.setName("alasan").setDescription("Alasan peringatan").setRequired(true))
    .toJSON(),
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const app = await rest.get(Routes.oauth2CurrentApplication());
console.log(`Deploying ${commands.length} command(s) for ${app.name}...`);
await rest.put(Routes.applicationCommands(app.id), { body: commands });
console.log("Done deploying all-in-one commands!");
