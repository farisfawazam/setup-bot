# Setup Bot — Discord Server Template Generator

## Overview
Bot Discord universal berbasis AI (via 9Router) untuk generate, revise, apply, dan clear template server lengkap berstandar enterprise internasional (spesialisasi komunitas 10.000 - 50.000+ member).
Mendukung semua tema: gaming & esports, kampus/akademik, streamer, anime, programming/developer, roleplay, komunitas hobi, bisnis, dll.

## Tech Stack
- **Runtime:** Node.js v20+ (ESM)
- **Library:** discord.js v14.27
- **AI Gateway:** 9Router (`http://localhost:20128/v1`) — OpenAI compatible
- **Model Default:** `ag/gemini-3.8-flash` (via env `AI_MODEL`)

## Project Structure
```
C:\Users\User\setup-bot\
├── .env                  # Token bot Discord & config 9Router
├── .gitignore            # Ignore node_modules, templates, .env
├── package.json          # "setup-bot", ESM modules
├── index.js              # Event handlers, commands, Category-Sync engine, starter guides, voice limits
├── ai.js                 # 2-step AI pipeline (architect brief -> JSON template) + /revise pipeline
├── store.js              # Template storage engine (JSON CRUD in templates/)
├── bots.js               # Embed generator bot rekomendasi eksternal
├── deploy-commands.js    # Script register slash commands ke Discord REST API
├── CONTEXT.md            # Dokumentasi sistem & arsitektur teknis
├── README.md             # Petunjuk instalasi & penggunaan untuk user
└── templates/            # Direktori penyimpanan template (format: [KODE].json)
```

## Slash Commands (18 All-in-One Commands)

### 🤖 AI Assistant & Utility (Semua Member)
| Command | Deskripsi | Akses |
|---|---|---|
| `/ask pertanyaan:...` | Tanya AI Raviel tentang kodingan, game, tugas, atau hal umum | Semua member |
| `/ping` | Cek latensi WebSocket & respon Discord API bot | Semua member |
| `/serverinfo` | Statistik & info lengkap server (member, roles, boost, channels) | Semua member |
| `/userinfo [target:...]` | Detail profil akun, avatar, role, dan tanggal join | Semua member |
| `/remind menit:... pesan:...` | Alarm timer pengingat otomatis via DM/channel | Semua member |
| `/bots` | Rekomendasi bot pelengkap server & panduan setup 24/7 | Semua member |

### 🛡️ Moderasi & Staff Suite (Moderator / Staff)
| Command | Deskripsi | Akses |
|---|---|---|
| `/say pesan:... [channel:...]` | Kirim pesan / pengumuman resmi atas nama bot | Staff / Mod |
| `/purge jumlah:...` | Hapus pesan massal bersih (1 - 100 pesan) | Staff / Mod |
| `/kick target:... [alasan:...]` | Kick member dari server | Staff / Mod |
| `/ban target:... [alasan:...]` | Ban member dari server | Staff / Mod |
| `/timeout target:... menit:... [alasan:...]` | Mute / timeout sementara member | Staff / Mod |
| `/warn target:... alasan:...` | Beri peringatan resmi ke member (+ log staff) | Staff / Mod |

### ⚙️ Template & Server Architect Engine (Admin / Owner)
| Command | Deskripsi | Akses |
|---|---|---|
| `/generate deskripsi:...` | AI 2-step merancang template server dari nol | Admin / Owner |
| `/revise kode:... feedback:...` | AI memodifikasi template yang ada berdasarkan catatan revisi | Admin / Owner |
| `/setup kode:...` | Menampilkan preview + tombol konfirmasi apply ke guild | Admin / Owner |
| `/clear-setup kode:...` | Menghapus channel, role, dan auto-mod rules milik template | Admin / Owner |
| `/templates` | Daftar semua template lokal yang tersimpan | Admin / Owner |
| `/delete-template kode:...` | Menghapus file template dari penyimpanan lokal | Admin / Owner |

## Template JSON Schema (V3 Enterprise)
```json
{
  "roles": [
    { "name": "👑 Server Owner", "color": "#e74c3c", "permissions": ["Administrator"], "hoist": true, "isStaff": true },
    { "name": "🛡️ Head Admin", "color": "#e67e22", "permissions": ["Administrator"], "hoist": true, "isStaff": true },
    { "name": "⚔️ Moderator", "color": "#3498db", "permissions": ["ManageMessages", "MuteMembers", "MoveMembers"], "hoist": true, "isStaff": true },
    { "name": "💎 VIP Member", "color": "#9b59b6", "permissions": [], "hoist": true, "isVip": true },
    { "name": "✅ Member", "color": "#2ecc71", "permissions": [], "hoist": true, "isVerified": true },
    { "name": "⏳ Unverified", "color": "#7f8c8d", "permissions": [], "hoist": false, "isUnverified": true }
  ],
  "selfRoles": [
    {
      "category": "🔔 Notifikasi Ping",
      "description": "Pilih alert yang ingin diikuti",
      "roles": [
        { "name": "📢 Pengumuman", "color": "#f39c12", "emoji": "📢" },
        { "name": "🎉 Event", "color": "#e91e63", "emoji": "🎉" },
        { "name": "🎮 Mabar / LFG", "color": "#2ecc71", "emoji": "🎮" }
      ]
    },
    {
      "category": "💻 Platform / Device",
      "description": "Pilih platform bermain utama",
      "roles": [
        { "name": "🖥️ PC", "color": "#3498db", "emoji": "🖥️" },
        { "name": "📱 Mobile", "color": "#2ecc71", "emoji": "📱" }
      ]
    }
  ],
  "categories": [
    {
      "name": "╔═══ 📌 PUSAT INFORMASI ═══╗",
      "access": "gate",
      "channels": [
        { "name": "📜rules", "type": "text", "readOnly": true, "topic": "Aturan komunitas", "visibleToUnverified": true },
        { "name": "✅verify", "type": "text", "isVerifyChannel": true, "topic": "Verifikasi akun untuk akses server", "visibleToUnverified": true },
        { "name": "👋welcome", "type": "text", "readOnly": true },
        { "name": "🎭roles", "type": "text", "readOnly": true }
      ]
    },
    {
      "name": "╠═══ 💬 COMMUNITY LOUNGE ═══╣",
      "access": "public",
      "channels": [
        { "name": "💬general-chat", "type": "text", "topic": "Obrolan santai", "slowmode": 3 },
        { "name": "📸media-share", "type": "text", "topic": "Share clip & media", "slowmode": 5 },
        { "name": "💡suggestions", "type": "text", "topic": "Kotak saran komunitas", "slowmode": 15 },
        { "name": "🤖bot-commands", "type": "text", "topic": "Command bot", "slowmode": 3 }
      ]
    },
    {
      "name": "╠═══ 🔊 SUARA & MABAR ═══╣",
      "access": "public",
      "channels": [
        { "name": "➕create-room", "type": "voice", "isTempVoiceGenerator": true },
        { "name": "🔊duo-1", "type": "voice", "userLimit": 2 },
        { "name": "🔊squad-1", "type": "voice", "userLimit": 5 },
        { "name": "🔊lounge-umum", "type": "voice", "userLimit": 0 }
      ]
    },
    {
      "name": "╚═══ 🛡️ STAFF HQ ═══╝",
      "access": "staff",
      "channels": [
        { "name": "🔒staff-chat", "type": "text", "staffOnly": true },
        { "name": "🤖bot-log", "type": "text", "staffOnly": true }
      ]
    }
  ],
  "welcomeEmbed": {
    "title": "Selamat Datang!",
    "description": "Selamat bergabung di server!",
    "color": "#5865f2",
    "fields": [
      { "name": "1️⃣ Aturan", "value": "Cek rules", "inline": false },
      { "name": "2️⃣ Verifikasi", "value": "Klik verify", "inline": false },
      { "name": "3️⃣ Roles", "value": "Ambil self-roles", "inline": false }
    ]
  },
  "rulesEmbed": {
    "title": "📜 Tata Tertib & Peraturan Komunitas",
    "description": "Patuhi aturan demi kenyamanan bersama:",
    "color": "#e74c3c",
    "rules": [
      "Hormati semua member. Dilarang ujaran kebencian, SARA, dan pelecehan.",
      "Dilarang spamming, iklan tanpa izin, dan link scam/phishing.",
      "Gunakan channel sesuai dengan topiknya.",
      "Dilarang konten NSFW/ilegal.",
      "Sanksi bertingkat: Warn → Timeout → Kick → Ban.",
      "Keputusan Staff bersifat mutlak."
    ]
  }
}
```

## Arsitektur & Logika Kunci

### 1. Piramida Role 5-Tier & Isolasi Staff
- **Staff (Tier 1)**: Owner -> Head Admin -> Moderator. Moderator tidak memiliki izin `Administrator`, hanya izin moderasi (`ManageMessages`, `MuteMembers`, `MoveMembers`).
- **Isolasi Akun Staff**: Akun staff/admin dipisahkan dari role Member umum, namun saat klik tombol verify bot tetap memberi role verified untuk keperluan testing/akses channel.
- **Member Join & Auto-Role**: Akun bot dan staff dikecualikan dari role `Unverified`. Member umum otomatis ditempel role unverified saat bergabung.
- **Auto-Strip Unverified (`guildMemberUpdate`)**: Saat member mendapatkan role terverifikasi (dari tombol verifikasi bot atau Carl-bot), bot otomatis mencopot role unverified.

### 2. Category-Sync Permission Engine & Role Isolation
- Pengaturan izin diatur di level Kategori (`gate`, `public`, `staff`, `vip`).
- Channel mewarisi izin kategori secara otomatis (status **Synced** di UI Discord).
- **Role-Specific Category Isolation**: Nama kategori secara otomatis dicocokkan dengan nama self-role (misal: `KELAS IF - 2 - KA` vs `KELAS IF - 2 - KM`). Kategori yang cocok otomatis dikunci khusus untuk pemegang role tersebut (+ Dosen/Staff) dan menutup akses role verified umum.
- Role companion bot otomatis diberi izin `EmbedLinks`, `SendMessages`, dan `AddReactions` di kategori gate & `#✅verify` agar tidak terhalang saat bertugas.
- Dilengkapi jeda `sleep(250)` per pembuatan channel untuk proteksi Discord 429.

### 3. Companion Bot Ecosystem (24/7 Gratis)
- Menghadirkan bot eksternal (Carl-bot, Dyno, VoiceMaster) agar server berjalan 24/7 tanpa perlu laptop host online terus-menerus.
- Selesai setup, bot langsung mengirimkan embed rekomendasi companion bot lengkap dengan action row tombol invite direct URL dan tombol interaktif `📖 Panduan Setup 24/7`.

### 4. Voice User Limits & Temp VC (Join-to-Create)
- Voice room mendukung `userLimit` presisi (Duo: 2, Trio: 3, Squad: 4/5, Lounge: 0).
- Channel `➕create-room` otomatis membuat private room bagi user dan menghapusnya saat kosong.
- Dilengkapi integrasi VoiceMaster (`/setup default`) untuk persistensi 24/7.
- Dilengkapi null-guard fetch member jika cache voice Discord kosong.

### 5. Interactive Channel Starter Guides & Clickable Mentions
- Channel `#suggestions` dan `#bot-commands` otomatis dikirimi embed panduan penggunaan saat setup selesai.
- Tombol `✅ Verify` menggunakan dynamic role binding (`verify_btn_<roleId>`) dengan fallback regex keyword, dan membalas dengan mention link channel biru interaktif (`<#channelId>`) mengarahkan langsung ke channel roles dan general chat.

### 6. Auto-Mod 3 Lapis & Staff Exemption
- `Setup Bot: Anti-Spam`
- `Setup Bot: Anti-Mention` (maksimal 5 mention)
- `Setup Bot: Anti-Scam` (keyword filter untuk free nitro, steam gift, crypto scam)
- Seluruh aturan Auto-Mod mengecualikan role Staff (`exemptRoles: staffRoleIds`).

### 7. Server Kuliah Web Project (Guild: 1550332936493076660) & Bot Identity
- **Identitas Bot**: `Raviel Ivansia` (Avatar HD: anime Raviel Ivansia dari *SSS-Class Suicide Hunter*, rambut putih, mata merah).
- **Template Aktif**: `templates/ZU8XNY.json` (Aturan 1: "Ganti nama server dengan Nama lengkap anda sesuai dengan nama asli.").
- **Jadwal Perkuliahan**:
  - Channel `#📅jadwal-ka` (`1554301847907606628`) & `#📅jadwal-km` (`1554305253560553543`) ter-pin dengan master schedule embed clean blockquote.
  - 26 Discord Native Scheduled Events (13 sesi KA, 13 sesi KM) berulang mingguan (weekly recurrence). Start time dimajukan H-30 menit sebelum jam kuliah asli agar event pasti LIVE sebelum kelas mulai.

## Operasional

```powershell
# Deploy slash commands
node deploy-commands.js

# Jalankan bot
node index.js

# Restart bot tanpa mematikan 9Router:
taskkill /F /PID (Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*setup-bot*index.js*' } | Select-Object -ExpandProperty ProcessId)
node index.js
```
