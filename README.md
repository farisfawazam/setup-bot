# 🤖 Setup Bot — Discord Server Template Generator & 24/7 Companion Ecosystem

Bot Discord AI canggih (via 9Router) untuk merancang, mengedit, menerapkan, dan membersihkan struktur server Discord bertaraf enterprise (10.000 - 50.000+ member) dalam hitungan detik.

Mendukung semua tema: **Gaming & Esports, Akademik / Kampus, Streamer / Content Creator, Komunitas Anime, Developer & Tech, Roleplay (GTA/FiveM), Bisnis, dan Hobi**.

---

## ⚡ Fitur Utama & Standar Enterprise V4

- 🧠 **AI Server Architect 2-Step**: Merancang struktur server lengkap dari deskripsi bebas dengan piramida role 5-tier (Staff -> VIP -> Base Member -> Self-Roles -> Unverified).
- 📁 **Category-Sync Permissions**: Pengaturan izin diatur pada level Kategori (`gate`, `public`, `staff`, `vip`). Channel otomatis mewarisi izin (Status: **Synced**) tanpa bentrok atau rate limit.
- 🏛️ **Role-Specific Category Isolation**: Deteksi cerdas nama kategori terhadap self-role (misal: `KELAS IF - 2 - KA` vs `KELAS IF - 2 - KM`). Kategori kelas/kelompok otomatis dikunci khusus pemegang role tersebut (+ Dosen/Staff).
- 👑 **Isolasi Role Staff & Admin**: Admin dan Staff tidak tercampur dengan role Member biasa. Bebas badge berantakan di profil.
- ⚡ **Auto-Role & Auto-Strip Unverified**:
  - Member baru otomatis diberi role unverified saat bergabung.
  - Saat member menyelesaikan verifikasi (baik via tombol bot atau Carl-bot), role unverified **otomatis dicopot** seketika (`guildMemberUpdate`).
- 🤖 **24/7 Companion Bot Ecosystem**:
  - Selesai setup, bot otomatis menampilkan rekomendasi dan tombol invite bot 24/7 (Carl-bot, Dyno, VoiceMaster).
  - Tombol interaktif **`📖 Panduan Setup 24/7`** langsung menyajikan panduan setup (tanpa perlu setting manual rumit).
  - Role bot otomatis diberi izin `EmbedLinks`, `SendMessages`, dan `AddReactions` di channel gate agar Carl-bot tidak terblokir.
- 🔊 **Voice User Limits & Temp VC (Join-to-Create)**: Mendukung batas kuota room (Duo: 2, Squad: 5) serta integrasi Join-to-Create bawaan & VoiceMaster 24/7.
- 🎭 **Multi-Category Self-Roles**: Dropdown interaktif lengkap (Single-choice & Multi-choice) untuk pembagian kelompok, kelas, atau identitas.
- 🛡️ **Auto-Mod 3 Lapis (Anti-Spam, Anti-Mention, Anti-Scam)**: Proteksi otomatis terhadap spam chat, mention massal (max 5), dan phishing link/fake nitro, dengan bypass khusus untuk tim Staff.

---

## 📋 Daftar Slash Command (All-in-One Suite)

### 🤖 AI Assistant & Utility (Semua Member)
| Command | Parameter | Fungsi |
|---|---|---|
| `/ask` | `pertanyaan` | Tanya AI Raviel tentang kodingan, gaming, info, tugas, atau hal umum |
| `/ping` | - | Cek latensi WebSocket dan respon Discord API bot |
| `/serverinfo` | - | Tampilkan info, statistik member, channel, dan boost level server |
| `/userinfo` | `target` (opsional) | Tampilkan info profil akun Discord, role, dan tanggal join |
| `/remind` | `menit`, `pesan` | Pasang alarm pengingat otomatis (via DM/mention) |
| `/bots` | - | Menampilkan bot rekomendasi 24/7 & panduan setup |

### 🛡️ Moderasi & Staff Suite (Moderator / Staff)
| Command | Parameter | Fungsi |
|---|---|---|
| `/say` | `pesan`, `channel` (opsional) | Kirim pesan / pengumuman resmi atas nama bot |
| `/purge` | `jumlah` (1-100) | Bersihkan pesan massal di channel |
| `/kick` | `target`, `alasan` (opsional) | Keluarkan member dari server |
| `/ban` | `target`, `alasan` (opsional) | Ban member dari server |
| `/timeout` | `target`, `menit`, `alasan` (opsional) | Mute / timeout sementara member |
| `/warn` | `target`, `alasan` | Beri peringatan resmi ke member (+ log staff) |

### ⚙️ Template & Server Architect (Owner & Administrator)
| Command | Parameter | Fungsi |
|---|---|---|
| `/generate` | `deskripsi` | Merancang template server baru dengan AI |
| `/revise` | `kode`, `feedback` | Merevisi template yang sudah ada dengan catatan spesifik |
| `/setup` | `kode` | Menampilkan pratinjau & tombol apply ke server |
| `/clear-setup` | `kode` | Menghapus channel, role, dan auto-mod milik template |
| `/templates` | - | Melihat daftar template yang tersimpan |
| `/delete-template` | `kode` | Menghapus template dari penyimpanan bot (dukung `kode:all`) |

---

## 🚀 Panduan Penggunaan Cepat

### 1. Generate Template Baru
```text
/generate deskripsi:bikin server untuk matkul web project, matkul ini hanya untuk 2 kelas saja yaitu IF - 2 - KA dan IF - 2 - KM
```
Bot akan membalas dengan ringkasan struktur server dan memberikan **Kode Template 6 Karakter** (misal: `ZU8XNY`).

### 2. Revisi Template (Opsional)
```text
/revise kode:ZU8XNY feedback:pisahkan section antar kelas dan rapikan channel voice
```

### 3. Terapkan ke Server (`/setup`)
```text
/setup kode:ZU8XNY
```
Klik tombol hijau **✅ Apply Setup**. Bot akan membuat seluruh role, channel, izin sinkron, embed panduan, dan auto-mod dalam ~1 menit.

---

## 🤖 Menjalankan Server 24/7 Tanpa Laptop Nyala

Setelah `/setup` selesai, server siap dijalankan 24/7 menggunakan bot pendamping gratis:

1. **Carl-bot (Verify & Pembagian Kelas 24/7)**:
   - Verify Gate di `#✅verify`:
     ```text
     !rr aio #✅verify #2ecc71 "Verifikasi Mahasiswa | Klik ✅ untuk membuka akses kuliah"
     ✅ @✅ Mahasiswa
     ```
   - Kunci 1 Kelas di `#🎭pilih-role`:
     ```text
     !rr aiou #🎭pilih-role #3498db "Pilih Kelas | Pilih kelas paralel yang kamu ambil"
     💻 @🎓 IF - 2 - KA
     🖥️ @🎓 IF - 2 - KM
     ```
   - Auto-role saat join: `!autorole add @⏳ Belum Verifikasi`

2. **VoiceMaster (Temp Voice 24/7)**:
   - Ketik `/setup default` di Discord.
   - Masukkan parameter: `editable: True`, `category: RUANG SUARA & MEET`, `permission: category`.

---

## 🛠️ Instalasi & Konfigurasi Mandiri

### 1. Prasyarat
- Node.js versi 20 atau lebih tinggi
- 9Router aktif (port `20128`) dengan model `ag/gemini-3.8-flash`
- Token Bot Discord dari Discord Developer Portal

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
NINEROUTER_KEY=sk-xxxx
AI_MODEL=ag/gemini-3.8-flash
```

### 4. Menjalankan Bot
```bash
# Register slash commands
node deploy-commands.js

# Jalankan bot
node index.js
```
