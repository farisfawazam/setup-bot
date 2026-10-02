# 🚀 Panduan Menjalankan Setup Bot di VPS (RAM 1 GB)

Panduan lengkap menjalankan Setup Bot di VPS Linux (Ubuntu / Debian / CentOS / AlmaLinux) agar aktif 24/7 di background tanpa terpengaruh saat terminal SSH ditutup.

---

## 1. Persiapan VPS & Optimasi RAM 1 GB

RAM 1 GB sangat hemat dan stabil untuk bot ini (konsumsi bot hanya ~60-100 MB).

Sebelum memulai, sangat disarankan membuat file **SWAP 1 GB - 2 GB** agar terhindar dari crash memori (Out-Of-Memory / OOM Killer):

```bash
# Buat Swap 1 GB
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Update sistem & pasang Node.js v20 & Git
apt update && apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Periksa versi Node.js (minimal v18/v20):
```bash
node -v
npm -v
```

---

## 2. Clone Repositori & Pasang Dependensi

```bash
git clone https://github.com/farisfawazam/setup-bot.git ~/setup-bot
cd ~/setup-bot
npm install --production
```

---

## 3. Konfigurasi Environment (`.env`)

Salin template `.env.example`:
```bash
cp .env.example .env
nano .env
```

Isi variabel:
- `DISCORD_TOKEN`: Token bot Anda dari [Discord Developer Portal](https://discord.com/developers/applications).
- `NINEROUTER_URL`: Alamat URL AI Gateway Anda (misal `http://localhost:20128` jika 9Router jalan di VPS yang sama, atau IP server 9Router Anda).
- `NINEROUTER_KEY`: API Key jika diperlukan.
- `AI_MODEL`: `ag/gemini-3.8-flash`.

Simpan dengan menekan `Ctrl + O`, lalu `Enter`, lalu keluar dengan `Ctrl + X`.

---

## 4. Deploy Slash Commands ke Discord

Daftarkan perintah slash command ke Discord:
```bash
chmod +x bot.sh
./bot.sh deploy
```

---

## 5. Cara Menjalankan Bot di Background (Pilih Salah Satu)

### Opsi A: Menggunakan Script Bawaan `./bot.sh` (Paling Praktis)

Script `./bot.sh` sudah terintegrasi manajemen PID, background process, dan auto-logging:

```bash
# Jalankan bot di background (aman di-close terminal SSH)
./bot.sh start

# Cek status bot & pemakaian RAM
./bot.sh status

# Lihat log realtime (Tekan Ctrl+C untuk keluar, bot tetap online)
./bot.sh log

# Restart bot
./bot.sh restart

# Hentikan bot
./bot.sh stop
```

---

### Opsi B: Menggunakan PM2 (Process Manager Populer)

PM2 otomatis menghidupkan bot kembali jika terjadi error atau server VPS reboot.

```bash
# Pasang PM2 global
npm install -g pm2

# Jalankan dengan konfigurasi ramah RAM 1 GB
pm2 start ecosystem.config.cjs

# Cek status & konsumsi memori
pm2 status

# Pantau log
pm2 logs setup-bot

# Aktifkan auto-start saat VPS reboot
pm2 startup
pm2 save
```

---

### Opsi C: Menggunakan Systemd Service (Native Linux)

Jika Anda ingin bot terdaftar sebagai layanan resmi Linux OS:

```bash
# Sesuaikan WorkingDirectory dan ExecStart pada file jika perlu
cp setup-bot.service /etc/systemd/system/setup-bot.service

# Reload daemon dan aktifkan
systemctl daemon-reload
systemctl enable setup-bot
systemctl start setup-bot

# Cek status
systemctl status setup-bot

# Cek log
journalctl -u setup-bot -f
```

---

## 6. Tabel Perintah Cepat

| Kebutuhan | Perintah di VPS |
|---|---|
| Jalankan Bot (Background) | `./bot.sh start` *atau* `pm2 start ecosystem.config.cjs` |
| Cek Status & RAM | `./bot.sh status` *atau* `pm2 status` |
| Monitor Log | `./bot.sh log` *atau* `pm2 logs` |
| Matikan Bot | `./bot.sh stop` *atau* `pm2 stop setup-bot` |
| Restart Bot | `./bot.sh restart` *atau* `pm2 restart setup-bot` |
| Update Slash Commands | `./bot.sh deploy` |
| Update Kode Terbaru | `git pull origin main && ./bot.sh restart` |
