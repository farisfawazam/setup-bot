import "dotenv/config";

const NINEROUTER_URL = process.env.NINEROUTER_URL || "http://localhost:20128";
const NINEROUTER_KEY = process.env.NINEROUTER_KEY || "";
const MODEL = process.env.AI_MODEL || "ag/gemini-3.8-flash";

const PROMPT_ENGINEER_SYSTEM = `Kamu adalah Chief Discord Server Architect berstandar enterprise internasional (spesialis server 50.000+ member).
Tugasmu: Menerima deskripsi user dan merancang blueprint arsitektur server yang sangat terorganisir, estetis, dan fungsional.
Server BISA TEMA APA SAJA (gaming, kampus/perkuliahan, streamer, komunitas anime, tech/developer, roleplay, bisnis, dll).

PANDUAN ARSITEKTUR KELAS TINGGI:
1. ROLE HIERARCHY PIRAMIDA 5-TIER:
   - Tier 1: Staff Roles (👑 Owner, 🛡️ Head Admin, ⚔️ Moderator) -> isStaff: true, hoist: true.
     * Moderator HANYA punya izin moderasi (ManageMessages, MuteMembers, MoveMembers). DILARANG Administrator.
     * Admin/Owner berizin Administrator.
     * Akun Staff BUKAN Member biasa.
   - Tier 2: VIP / Supporter / Server Booster -> hoist: true, isVip: true.
   - Tier 3: Base Verified Member (contoh: "✅ Member", "🎓 Mahasiswa", "🎮 Gamer Warga") -> isVerified: true, hoist: true.
   - Tier 4: Self-Roles (3-4 kategori dropdown interaktif: Notifikasi Ping, Platform/Perangkat, Minat/Divisi, Warna Nametag) -> hoist: false.
   - Tier 5: Gatekeeper -> "⏳ Unverified", isUnverified: true, hoist: false.

2. CATEGORY-SYNC ACCESS ARCHITECTURE:
   - "gate": Gerbang masuk (rules, verify, announcements, roles). Terbuka untuk dibaca @everyone, tapi dilarang kirim pesan.
   - "public": Ruang obrolan, diskusi topik, media, bot commands, voice lounge. Khusus verified member (@everyone di-lockdown).
   - "vip": Ruang eksklusif supporter/VIP (jika ada).
   - "staff": Ruang koordinasi staff, mod discussion, bot audit log. Terkunci untuk staff.
   - Seluruh channel mewarisi (inherit) permission dari kategori agar UI Discord menampilkan status "Synced".

3. CHANNELS, SLOWMODE & VOICE LIMITS:
   - Kategori ber-border estetis: ╔═══ 📌 PUSAT INFO ═══╗, ╠═══ 💬 COMMUNITY ═══╣, ╚═══ 🛡️ STAFF HQ ═══╝.
   - Channel: emoji kecil + slug pendek. Contoh: "📜rules", "✅verify", "💬general-chat", "📸media-share", "💡suggestions", "🤖bot-commands".
   - Slowmode presisi: suggestions (15s), media-share (5s), general-chat (0-3s).
   - Voice room spesifik dengan userLimit:
     * "➕create-room" (isTempVoiceGenerator: true)
     * Duo Room (userLimit: 2)
     * Trio Room (userLimit: 3)
     * Squad Room (userLimit: 5)
     * General Lounge (userLimit: 0)
   - Wajib ada "🤖bot-log" di kategori staff.

4. EMBED BERKUALITAS:
   - Welcome embed dengan petunjuk onboarding 3 langkah.
   - Rules embed dengan 5-8 aturan terstruktur dan sistem sanksi bertingkat (Peringatan -> Timeout -> Ban).

5. ADAPTASI DOMAIN SPESIFIK:
   - GAMING/ESPORTS: Channel LFG mabar, scrim, open recruitment, clip montage, voice duo/squad/war-room. Self-roles: Game titles, role in-game/lanes, rank tier.
   - AKADEMIK/KAMPUS/KELAS: Channel materi-kuliah, tugas-tanya-jawab, info-akademik, study-room voice (userLimit: 2/4), library silent room. Jika user menyebut KELOMPOK (misal kelompok 1-5, kelompok tugas, kelompok belajar), WAJIB buat:
     1. Kategori Self-Roles "👥 Kelompok Tugas" dengan opsi (Kelompok 1, Kelompok 2, Kelompok 3, dst.) dan flag singleChoice: true agar murid/mahasiswa bisa memilih kelompok sendiri via dropdown menu.
     2. Kategori channel "👥 RUANG KELOMPOK" dengan channel diskusi tiap kelompok (misal 💬kelompok-1 s/d 💬kelompok-5) dan voice room.
   - TECH/DEVELOPER: Channel tech-stack (frontend, backend, devops, AI), code-showcase, help-desk, pair-programming voice (userLimit: 2). Self-roles: Bahasa pemrograman, OS/Platform.
   - STREAMER/CREATOR: Channel live-alert, content-announcements, clip-submissions, fan-art, VIP/booster lounge. Self-roles: Platform nonton, alert notification.
   - ROLEPLAY (FiveM/GTA): Channel IC (in-character) vs OOC (out-of-character), dispatch, civilian chat, faction categories. Self-roles: Fraksi (Police, EMS, Gang, Citizen).
   - ANIME/KOMUNITAS: Channel anime-discussion, manga-spoilers, cosplay-art, music lounge voice. Self-roles: Genre favorit, event alert.

OUTPUT: Rencana blueprint teks detail dalam bahasa Indonesia. BUKAN JSON. Rancang dokumen arsitektur terlengkap.`;

const GENERATOR_SYSTEM = `Kamu adalah Lead Discord Template JSON Generator. Ubah brief architect menjadi JSON valid sesuai standar berikut.

SCHEMA SPESIFIKASI LENGKAP:
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
      "category": "🔔 Notifikasi",
      "description": "Pilih notifikasi yang ingin kamu dapatkan",
      "roles": [
        { "name": "📢 Pengumuman", "color": "#f39c12", "emoji": "📢" },
        { "name": "🎉 Event Komunitas", "color": "#e91e63", "emoji": "🎉" },
        { "name": "🎮 Ping Mabar", "color": "#2ecc71", "emoji": "🎮" }
      ]
    },
    {
      "category": "💻 Platform / Device",
      "description": "Pilih perangkat utama kamu",
      "roles": [
        { "name": "🖥️ PC Player", "color": "#3498db", "emoji": "🖥️" },
        { "name": "📱 Mobile Player", "color": "#2ecc71", "emoji": "📱" },
        { "name": "🎮 Console Player", "color": "#9b59b6", "emoji": "🎮" }
      ]
    },
    {
      "category": "🎨 Warna Nametag",
      "description": "Pilih warna nama akunmu",
      "roles": [
        { "name": "🔴 Crimson Red", "color": "#e74c3c", "emoji": "🔴" },
        { "name": "🔵 Ocean Blue", "color": "#3498db", "emoji": "🔵" },
        { "name": "🟣 Royal Violet", "color": "#9b59b6", "emoji": "🟣" },
        { "name": "🟢 Emerald Green", "color": "#2ecc71", "emoji": "🟢" }
      ]
    }
  ],
  "categories": [
    {
      "name": "╔═══ 📌 PUSAT INFORMASI ═══╗",
      "access": "gate",
      "channels": [
        { "name": "📜rules", "type": "text", "readOnly": true, "topic": "Tata tertib dan peraturan komunitas", "visibleToUnverified": true },
        { "name": "✅verify", "type": "text", "isVerifyChannel": true, "topic": "Klik tombol untuk verifikasi dan membuka channel server", "visibleToUnverified": true },
        { "name": "👋welcome", "type": "text", "readOnly": true, "topic": "Sambut kehadiran member baru" },
        { "name": "🎭roles", "type": "text", "readOnly": true, "topic": "Pilih notifikasi, platform, dan warna nametag" }
      ]
    },
    {
      "name": "╠═══ 💬 COMMUNITY LOUNGE ═══╣",
      "access": "public",
      "channels": [
        { "name": "💬general-chat", "type": "text", "topic": "Ruang obrolan utama member", "slowmode": 3 },
        { "name": "📸media-share", "type": "text", "topic": "Berbagi gambar, screenshot, dan video clip", "slowmode": 5 },
        { "name": "💡suggestions", "type": "text", "topic": "Saran dan ide untuk kemajuan server", "slowmode": 15 },
        { "name": "🤖bot-commands", "type": "text", "topic": "Gunakan command bot di sini agar chat umum tetap rapi", "slowmode": 3 }
      ]
    },
    {
      "name": "╠═══ 🔊 SUARA & NONGKRONG ═══╣",
      "access": "public",
      "channels": [
        { "name": "➕create-room", "type": "voice", "isTempVoiceGenerator": true, "topic": "Masuk untuk otomatis membuat voice room privat" },
        { "name": "🔊duo-1", "type": "voice", "userLimit": 2 },
        { "name": "🔊squad-1", "type": "voice", "userLimit": 5 },
        { "name": "🔊lounge-umum", "type": "voice", "userLimit": 0 }
      ]
    },
    {
      "name": "╚═══ 🛡️ STAFF HQ ═══╝",
      "access": "staff",
      "channels": [
        { "name": "🔒staff-chat", "type": "text", "staffOnly": true, "topic": "Koordinasi tim internal dan moderator" },
        { "name": "🤖bot-log", "type": "text", "staffOnly": true, "topic": "Catatan log audit sistem dan moderasi" }
      ]
    }
  ],
  "welcomeEmbed": {
    "title": "Selamat Datang di Komunitas!",
    "description": "Senang kamu bergabung bersama kami! Ikuti 3 langkah awal ini:",
    "color": "#5865f2",
    "fields": [
      { "name": "1️⃣ Baca Peraturan", "value": "Cek channel rules untuk tata tertib.", "inline": false },
      { "name": "2️⃣ Verifikasi Akun", "value": "Klik tombol hijau di channel verify.", "inline": false },
      { "name": "3️⃣ Ambil Role", "value": "Pilih notifikasi, platform, dan warna di channel roles.", "inline": false }
    ]
  },
  "rulesEmbed": {
    "title": "📜 Tata Tertib & Peraturan Komunitas",
    "description": "Patuhi aturan di bawah demi kenyamanan dan keamanan seluruh member:",
    "color": "#e74c3c",
    "rules": [
      "Saling menghargai sesama member. Dilarang keras ujaran kebencian, SARA, diskriminasi, atau pelecehan.",
      "Dilarang spamming, flood chat, promosi/iklan tanpa izin (melalui DM maupun channel), dan link phishing/scam.",
      "Gunakan channel sesuai dengan fungsi dan topik pembicaraan.",
      "Dilarang menyebarkan konten NSFW, pornografi, gore, atau materi ilegal.",
      "Gunakan bot hanya di channel bot-commands.",
      "Sanksi pelanggaran bertingkat: Peringatan (Warn) → Timeout/Mute → Kick → Permanent Ban.",
      "Keputusan dan tindakan tim Moderator/Admin bersifat final."
    ]
  }
}

ATURAN KETAT GENERATOR:
- HANYA output JSON valid murni (tanpa tanda kutip tiga markdown, tanpa teks pembuka/penutup).
- Setiap kategori HARUS punya field "access" ("gate", "public", "staff", atau "vip").
- HARUS ada role dengan "isVerified": true.
- HARUS ada role dengan "isUnverified": true.
- HARUS ada role staff dengan "isStaff": true. Role Moderator TIDAK boleh memiliki izin Administrator.
- Voice channels boleh memiliki "userLimit" (angka 0 untuk tak terbatas, 2 untuk duo, 5 untuk squad).
- HARUS ada channel "✅verify" dengan "isVerifyChannel": true di kategori ber-access "gate".
- HARUS ada channel voice "➕create-room" dengan "isTempVoiceGenerator": true.
- HARUS ada channel "🤖bot-log" di kategori ber-access "staff".
- Setiap role yang dipilih sendiri oleh user (kelompok tugas, mata kuliah, game, role in-game, notifikasi, platform, nametag) HARUS berada di "selfRoles", BUKAN di "roles" biasa.
- Jika ada "selfRoles", HARUS ada channel "🎭roles" atau "🎭pilih-role" dengan "isSelfRolesChannel": true di kategori "gate" agar menu dropdown otomatis diposting.
- Untuk kategori kelompok/tim/divisi di mana satu member hanya boleh ikut 1 kelompok, set "singleChoice": true pada kategori self-role tersebut.
- Format channel: emoji kecil + slug pendek tanpa pemisah pemboros karakter.`;

const REVISE_SYSTEM = `Kamu adalah Lead Discord Template Architect PRO.
Tugasmu: Menerima template JSON server saat ini dan merevisi template tersebut sesuai feedback user.

ATURAN REVISI:
- Pertahankan struktur schema yang ada (access: gate/public/staff/vip, roles flags isStaff/isVerified/isUnverified, userLimit).
- Modifikasi channel/kategori/role/embed sesuai catatan perbaikan user.
- Pastikan tetap menghasilkan JSON valid murni tanpa markdown fence dan tanpa teks lain.`;

async function chat(systemPrompt, userMessage) {
  const headers = { "Content-Type": "application/json" };
  if (NINEROUTER_KEY) headers["Authorization"] = `Bearer ${NINEROUTER_KEY}`;

  let res;
  try {
    res = await fetch(`${NINEROUTER_URL}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });
  } catch (err) {
    throw new Error(`Koneksi AI gagal (${NINEROUTER_URL}): ${err.message}. Pastikan 9Router / AI server aktif.`);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

function extractJSON(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace < lastBrace + 1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function sanitize(template) {
  template.roles = template.roles || [];
  template.categories = template.categories || [];
  template.selfRoles = template.selfRoles || [];

  let hasVerified = false;
  let hasUnverified = false;
  let hasStaff = false;

  for (const role of template.roles) {
    role.name = (role.name || "Role").slice(0, 100);
    if (!role.color) role.color = "#99aab5";
    if (!role.permissions) role.permissions = [];
    if (role.hoist === undefined) role.hoist = false;
    if (role.isVerified) hasVerified = true;
    if (role.isUnverified) hasUnverified = true;
    if (role.isStaff) hasStaff = true;
  }

  // Ensure Base Member exists
  if (!hasVerified && template.roles.length) {
    const candidate = template.roles.find((r) => !r.isStaff && !r.permissions?.includes("Administrator"));
    if (candidate) {
      candidate.isVerified = true;
      candidate.hoist = true;
    } else {
      template.roles.push({
        name: "✅ Member",
        color: "#2ecc71",
        permissions: [],
        hoist: true,
        isVerified: true,
      });
    }
  }

  // Ensure Unverified role exists
  if (!hasUnverified) {
    template.roles.push({
      name: "⏳ Unverified",
      color: "#7f8c8d",
      permissions: [],
      hoist: false,
      isUnverified: true,
    });
  }

  // Ensure Staff role exists
  if (!hasStaff && template.roles.length) {
    template.roles[0].isStaff = true;
  }

  // Auto-promote group/kelompok roles from template.roles into selfRoles
  const groupRoles = [];
  template.roles = (template.roles || []).filter((r) => {
    if (r.isStaff || r.isVerified || r.isUnverified || r.permissions?.includes("Administrator")) {
      return true;
    }
    if (/kelompok\s*\d+|group\s*\d+|tim\s*\d+/i.test(r.name)) {
      groupRoles.push({ name: r.name, color: r.color || "#3498db", emoji: "👥" });
      return false;
    }
    return true;
  });

  if (groupRoles.length > 0) {
    const existingGroupCat = template.selfRoles.find((c) => /kelompok|group|tim/i.test(c.category));
    if (!existingGroupCat) {
      template.selfRoles.unshift({
        category: "👥 Kelompok Tugas",
        description: "Pilih salah satu kelompok kamu",
        singleChoice: true,
        roles: groupRoles,
      });
    }
  }

  // Self roles validation (Discord limit: max 25 options per menu)
  for (const cat of template.selfRoles) {
    cat.category = (cat.category || "Roles").slice(0, 100);
    cat.description = (cat.description || "").slice(0, 100);
    cat.roles = (cat.roles || []).slice(0, 25);
    for (const r of cat.roles) {
      r.name = (r.name || "Role").slice(0, 100);
      if (!r.color) r.color = "#99aab5";
      if (!r.emoji) r.emoji = "⚪";
    }
  }

  // Categories & Channels validation
  let hasTempVoice = false;
  let hasVerifyChannel = false;
  let hasBotLog = false;
  let hasSelfRolesChannel = false;

  for (const cat of template.categories) {
    cat.name = (cat.name || "Category").slice(0, 100);
    const catLower = (cat.name || "").toLowerCase();
    if (!cat.access) {
      if (catLower.includes("staff") || catLower.includes("admin") || catLower.includes("mod")) {
        cat.access = "staff";
      } else if (catLower.includes("gate") || catLower.includes("info") || catLower.includes("utama") || catLower.includes("welcome")) {
        cat.access = "gate";
      } else if (catLower.includes("vip") || catLower.includes("booster")) {
        cat.access = "vip";
      } else {
        cat.access = "public";
      }
    }

    for (const ch of cat.channels || []) {
      ch.name = (ch.name || "channel").slice(0, 100);
      if (ch.topic) ch.topic = ch.topic.slice(0, 1024);
      if (!ch.type) ch.type = "text";
      if (ch.slowmode === undefined) ch.slowmode = 0;
      if (ch.type === "voice" && ch.userLimit !== undefined) {
        ch.userLimit = Math.max(0, Math.min(99, parseInt(ch.userLimit, 10) || 0));
      }
      if (ch.isTempVoiceGenerator) hasTempVoice = true;
      if (ch.isVerifyChannel) hasVerifyChannel = true;
      if (ch.name.includes("bot-log") || ch.name.includes("log-bot")) hasBotLog = true;
      if (
        ch.isSelfRolesChannel ||
        ch.name.toLowerCase().includes("role") ||
        ch.name.toLowerCase().includes("pick") ||
        ch.name.toLowerCase().includes("pilih") ||
        ch.name.toLowerCase().includes("ambil") ||
        ch.name.toLowerCase().includes("kelompok")
      ) {
        hasSelfRolesChannel = true;
        ch.isSelfRolesChannel = true;
      }
    }
  }

  // Ensure self-roles channel exists if template has selfRoles
  if (template.selfRoles && template.selfRoles.length > 0 && !hasSelfRolesChannel) {
    let gateCat = template.categories.find((c) => c.access === "gate") || template.categories[0];
    if (gateCat) {
      gateCat.channels.push({
        name: "🎭roles",
        type: "text",
        readOnly: true,
        isSelfRolesChannel: true,
        topic: "Pilih role kelompok, notifikasi, dan identitas diri",
      });
      hasSelfRolesChannel = true;
    }
  }

  // Ensure at least one temp voice generator
  if (!hasTempVoice) {
    for (const cat of template.categories) {
      const vc = (cat.channels || []).find((c) => c.type === "voice");
      if (vc) {
        cat.channels.unshift({
          name: "➕create-room",
          type: "voice",
          isTempVoiceGenerator: true,
          topic: "Join di sini untuk otomatis buat temporary room",
        });
        hasTempVoice = true;
        break;
      }
    }
  }

  // Ensure verify channel
  if (!hasVerifyChannel && template.categories.length) {
    template.categories[0].channels.push({
      name: "✅verify",
      type: "text",
      isVerifyChannel: true,
      topic: "Verifikasi akun untuk membuka server",
      visibleToUnverified: true,
    });
  }

  // Ensure bot-log channel in staff category
  if (!hasBotLog) {
    let staffCat = template.categories.find((c) => c.access === "staff");
    if (!staffCat) {
      staffCat = {
        name: "╚═══ 🛡️ STAFF HQ ═══╝",
        access: "staff",
        channels: [],
      };
      template.categories.push(staffCat);
    }
    staffCat.channels.push({
      name: "🤖bot-log",
      type: "text",
      staffOnly: true,
      topic: "Log aktivitas bot dan moderasi",
    });
  }

  // Embeds
  if (!template.welcomeEmbed) {
    template.welcomeEmbed = {
      title: "Selamat Datang!",
      description: "Selamat datang di server!",
      color: "#5865f2",
      fields: [],
    };
  }
  if (!template.rulesEmbed) {
    template.rulesEmbed = {
      title: "📜 Rules",
      description: "Patuhi aturan server demi kenyamanan bersama:",
      color: "#e74c3c",
      rules: ["Hormati semua member", "Dilarang spamming", "Dilarang konten NSFW/SARA"],
    };
  }

  return template;
}

export async function generateTemplate(description, onProgress) {
  if (onProgress) onProgress("🧠 AI sedang analisa & expand arsitektur server...");
  const brief = await chat(
    PROMPT_ENGINEER_SYSTEM,
    `Buatkan brief blueprint arsitektur Discord server profesional untuk: ${description}`
  );

  if (onProgress) onProgress("⚙️ AI sedang generate template & category-sync layout...");
  const content = await chat(
    GENERATOR_SYSTEM,
    `Ini brief dari architect, generate template JSON lengkap:\n\n${brief}`
  );

  const jsonStr = extractJSON(content);
  const template = sanitize(JSON.parse(jsonStr));
  return { template, brief };
}

export async function reviseTemplate(existingTemplate, feedback, onProgress) {
  if (onProgress) onProgress("🧠 AI sedang mempelajari template & feedback revisi...");
  const userMessage = `Template saat ini:\n${JSON.stringify(existingTemplate, null, 2)}\n\nFeedback / Permintaan revisi:\n"${feedback}"\n\nGenerate JSON template hasil revisi.`;

  const content = await chat(REVISE_SYSTEM, userMessage);
  const jsonStr = extractJSON(content);
  const template = sanitize(JSON.parse(jsonStr));
  return { template };
}

export async function askAI(question) {
  const systemPrompt = `Kamu adalah Raviel Ivansia, asisten AI Discord serbaguna berstandar tinggi.
Kamu bisa melayani server komunitas apa saja: gaming, programming/tech, kampus/sekolah, anime, bisnis, roleplay, atau tongkrongan santai.
Panduan respon:
- Jawab dengan ramah, akurat, ringkas, dan solutif.
- Gunakan bahasa yang sama dengan user (Bahasa Indonesia secara default).
- Jika user tanya teknis/koding (Laravel, JS, Python, SQL, Git, dsb), berikan snippet kode bersih dan penjelasan to-the-point.
- Jika user tanya game, lore anime, ide, atau obrolan santai, jawab dengan gaya interaktif dan relevan.
- Gunakan format markdown Discord yang rapi (bold, bullet points, code block). Batasi panjang teks agar pas dalam satu embed.`;
  return await chat(systemPrompt, question);
}
