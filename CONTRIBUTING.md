# Pedoman Tata Kelola & Kontribusi / Governance & Contribution Guidelines - Wira Satya 96 (WS96) - Paguyuban Alumni Akpol 1996

> 🌐 **Daftar Isi / Sections:** [**🇮🇩 Bagian I: Bahasa Indonesia**](#-bagian-i-pedoman-tata-kelola--kontribusi-bahasa-indonesia) &nbsp;|&nbsp; [**🇬🇧 Part II: English Version**](#-part-ii-governance--contribution-guidelines-english)

---

## 🇮🇩 Bagian I: Pedoman Tata Kelola & Kontribusi (Bahasa Indonesia)

Dokumen ini mengatur standar teknis, keamanan, dan alur pemutakhiran data bagi **Tim Pengembang** serta **Pengurus Paguyuban Wira Satya 96 (*Ketua, Sekretaris, Bendahara*)** dan **Ajudan/ADC** dalam mengelola data direktori, laporan keuangan, maupun pengembangan fitur pada portal **Wira Satya 96 (WS96)**.

### 1. Alur Pemutakhiran Data Anggota & Mutasi Jabatan
Pembaruan data profil, foto terbaru, mutasi jabatan (*TR Mutasi*), maupun informasi keluarga di dalam portal **Wira Satya 96 (WS96)** dapat dilakukan melalui tiga jalur resmi:
1. **Pembaruan Mandiri oleh Anggota**: Masuk menggunakan NRP masing-masing → klik **"Lihat Profil Saya"** → klik **"Edit Profil"** atau **"Tambah Jabatan"**.
2. **Pembaruan melalui Ajudan / Pendamping (`Mode Pendamping / ADC`)**: Anggota yang sibuk berdinas dapat mendaftarkan NRP Ajudan pada profilnya. Ajudan masuk menggunakan `WS96@<NRP_ADC>` untuk membantu memperbarui foto dan riwayat jabatan pimpinan tanpa dapat membuka menu keuangan.
3. **Rekonsiliasi Terpusat oleh Sekretaris / Admin**: Sekretaris Paguyuban dapat memperbarui data personel, mengatur jabatan kepengurusan, serta membantu *reset* kata sandi anggota melalui menu **Kelola Akun**.

### 2. Standar Rekayasa Kode & Keamanan Repositori (Bagi Tim Pengembang)
Setiap perubahan pada kode sumber (`src/`) dan skema basis data (`supabase/`) wajib mematuhi prinsip berikut:
1. **Kebijakan Tanpa Rahasia (*Zero-Secret*) & Kepatuhan UU PDP**:
   - **Dilarang keras** melakukan *commit* file `.env`, kunci privat `SUPABASE_SERVICE_ROLE_KEY`, kata sandi basis data, sandi/PIN pribadi anggota, maupun dokumen paparan internal (`.pptx` / `.pdf`) ke dalam repositori Git publik.
   - Seluruh konfigurasi koneksi wajib dipanggil melalui variabel lingkungan (`import.meta.env.VITE_*`).
2. **Integritas Pembagian Hak Akses (RBAC) & Isolasi Kas**:
   - Menu **Anev & Statistik** wajib dibatasi hanya untuk peran Pengurus (`KETUA`, `WAKIL_KETUA`, `SEKRETARIS`, `BENDAHARA`, `ADMIN`) dan tertutup bagi akun Ajudan (`!isCompanionMode`).
   - Tombol pencatatan keuangan pada menu **Dana Sosial & Investasi** wajib dibatasi hanya untuk **Bendahara**, **Ketua/Wakil**, dan **Admin**.
3. **Kesesuaian Tampilan Layar HP (*Mobile-First Ergonomics*)**:
   - Setiap penambahan komponen baru pada halaman **Beranda** wajib menjaga kerapian tampilan di layar HP (menggunakan kartu akordeon ringkas untuk panel informasi samping serta mempertahankan posisi kartu `#SELALUBAHAGIA` dan identitas `BATALYON WIRA SATYA 1996` di bagian bawah).

---

## 🇬🇧 Part II: Governance & Contribution Guidelines (English)

This document defines the technical, security, and operational data maintenance standards for the **Development Team**, **Paguyuban Wira Satya 96 Executive Board (*Ketua, Sekretaris, Bendahara*)**, and authorized **Aides-de-Camp (*Ajudan/ADC*)** contributing to **Wira Satya 96 (WS96)**.

### 1. Personnel Directory & Career Mutation Update Workflows
Profile updates, official portrait uploads, career mutation updates (*TR Mutasi*), and family welfare updates can be performed through three authorized channels:
1. **Self-Service Member Update**: Log in with the officer's 8-digit NRP → open **"Lihat Profil Saya"** → click **"Edit Profil"** or **"Tambah Jabatan"**.
2. **Delegated Aide-de-Camp Update (`Mode Pendamping / ADC`)**: Registered ADCs log in using `WS96@<NRP_ADC>` to update their principal officer's biography, photo, and assignment history while remaining strictly locked out of financial menus (`Dana Sosial & Kas`).
3. **Centralized Board Administration (`Sekretaris / Admin`)**: The Secretary/Admin can manage all 261 personnel profiles, assign board roles, and assist with password resets via the account administration panel.

### 2. Engineering & Security Standards (For Developers)
1. **Strict Zero-Secret & UU PDP Compliance**: Never commit `.env` files, `SUPABASE_SERVICE_ROLE_KEY` secrets, database passwords, personal member credentials/PINs, or internal presentation decks (`.pptx`/`.pdf`) into Git. Always load runtime keys via `import.meta.env.VITE_*`.
2. **RBAC & Companion Mode Isolation Invariants**: Keep the **Anev & Statistik** view restricted to board roles (`KETUA`, `WAKIL_KETUA`, `SEKRETARIS`, `BENDAHARA`, `ADMIN`) and completely lock **Dana Sosial & Investasi** from `isCompanionMode` (ADC) sessions.
3. **Mobile-First Responsive Discipline**: Preserve compact tap-to-expand accordion headers on mobile viewports and maintain the bottom-anchored `#SELALUBAHAGIA` card and `BATALYON WIRA SATYA 1996` identity footer.
