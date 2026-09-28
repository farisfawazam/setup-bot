# 🤖 Setup Bot — Discord Server Template Generator

Bot Discord AI canggih (via 9Router) untuk merancang, mengedit, menerapkan, dan membersihkan struktur server Discord bertaraf enterprise (10.000 - 50.000+ member) dalam hitungan detik.

Mendukung semua tema: **Gaming & Esports, Akademik / Kampus, Streamer / Content Creator, Komunitas Anime, Developer & Tech, Roleplay (GTA/FiveM), Bisnis, dan Hobi**.

---

## ⚡ Fitur Utama & Standar Enterprise V3

- 🧠 **AI Server Architect 2-Step**: Merancang struktur server lengkap dari deskripsi bebas dengan piramida role 5-tier.
- 📁 **Category-Sync Permissions**: Pengaturan izin diatur pada Kategori (Gate, Public, VIP, Staff). Channel otomatis tersinkronisasi (Synced) tanpa bentrok izin.
- 👑 **Isolasi Role Staff & Admin**: Admin dan Staff tidak tercampur dengan role Member biasa. Profil tetap bersih dan badge teratur.
- 🔊 **Voice User Limits & Temp VC**: Mendukung batas kuota room (Duo: 2, Squad: 5) serta sistem Join-to-Create (`➕create-room`) yang otomatis terhapus saat kosong.
- 🎭 **Multi-Category Self-Roles**: Dropdown interaktif lengkap (Notifikasi Ping, Platform/Perangkat, Minat/Divisi Game, Warna Nametag).
- 💡 **Auto Starter Guides**: Channel interaktif seperti `#suggestions` dan `#bot-commands` otomatis dilengkapi pesan panduan resmi dari bot.
- 🔗 **Clickable Channel Mentions**: Setelah klik `✅ Verify`, bot langsung memberikan tautan biru interaktif (`#roles` & `#general-chat`) untuk memudahkan onboarding member baru.
- 🛡️ **Auto-Mod 3 Lapis (Anti-Spam, Anti-Mention, Anti-Scam)**: Proteksi otomatis terhadap spam chat, mention massal, dan phishing link/fake nitro, dengan pengecualian khusus untuk tim Staff.

---

## 📋 Daftar Command

| Command | Parameter | Fungsi | Izin |
|---|---|---|---|
| `/generate` | `deskripsi` | Merancang template server baru dengan AI | Semua Member |
| `/revise` | `kode`, `feedback` | Merevisi template yang sudah ada dengan catatan spesifik | Semua Member |
| `/setup` | `kode` | Menampilkan pratinjau & tombol apply ke server | Administrator |
| `/clear-setup` | `kode` | Menghapus channel, role, dan auto-mod milik template | Administrator |
| `/templates` | - | Melihat daftar template yang tersimpan | Semua Member |
| `/delete-template` | `kode` | Menghapus template dari penyimpanan bot | Semua Member |
| `/bots` | - | Menampilkan rekomendasi bot pelengkap server | Semua Member |

---

## 🚀 Panduan Penggunaan

### 1. Generate Template Baru
Ketik slash command di Discord:
```
/generate deskripsi:server esport mobile legends dan pubg mobile indonesia dengan scrim harian, open recruit, clip montage, dan mabar
```
Bot akan membalas dengan ringkasan struktur server dan memberikan **Kode Template 6 Karakter** (misal: `A8F2K9`).

### 2. Revisi Template (Opsional)
Jika ingin mengubah atau menambahkan hal baru:
```
/revise kode:A8F2K9 feedback:tambahkan kategori turnamen mingguan dan kurangi channel voice
```
Bot akan menghasilkan kode template baru hasil revisi.

### 3. Terapkan ke Server (`/setup`)
Jalankan di server yang ingin ditata:
```
/setup kode:A8F2K9
```
Bot akan memvalidasi kondisi server dan menampilkan ringkasan beserta tombol:
- Klik **✅ Apply Setup** untuk memulai pembuatan role, izin, kategori, dan channel.
- Klik **❌ Cancel** untuk membatalkan.

### 4. Reset Server (`/clear-setup`)
Jika ingin membersihkan template yang pernah dibuat:
```
/clear-setup kode:A8F2K9
```
Konfirmasi dengan mengklik tombol **🗑️ Clear Everything**.

---

## 🛠️ Instalasi & Konfigurasi Mandiri

### 1. Prasyarat
- Node.js versi 20 atau lebih tinggi
- 9Router aktif (port `20128`) dengan model `ag/gemini-3.8-flash`
- Akun Bot Discord dari Discord Developer Portal

### 2. Konfigurasi Bot di Discord Developer Portal
Pastikan bot mengaktifkan seluruh **Privileged Gateway Intents**:
- ✅ **Server Members Intent**
- ✅ **Message Content Intent**

Berikan izin **Administrator** pada invite link bot, dan pastikan di server Discord:
> ⚠️ **PENTING:** Tarik role bot ke **posisi paling atas** dalam daftar role server agar bot dapat mengelola izin dan peran lain tanpa error `Hierarchy`.

### 3. Setup File `.env`
```env
DISCORD_TOKEN=your_bot_token_here
NINEROUTER_URL=http://localhost:20128
NINEROUTER_KEY=your_9router_key_if_any
AI_MODEL=ag/gemini-3.8-flash
```

### 4. Menjalankan Bot
```bash
# Deploy slash commands
node deploy-commands.js

# Jalankan bot
node index.js
```
