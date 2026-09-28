import { REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";

const commands = [
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
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const app = await rest.get(Routes.oauth2CurrentApplication());
console.log(`Deploying ${commands.length} command(s) for ${app.name}...`);
await rest.put(Routes.applicationCommands(app.id), { body: commands });
console.log("Done!");
