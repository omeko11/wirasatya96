# Lisensi Paguyuban, NDA, SLA & Tata Kelola Keamanan / Institutional License, NDA, SLA & Security Policy - Wira Satya 96 (WS96) - Paguyuban Alumni Akpol 1996

> 🌐 **Pilih Bahasa / Select Language:** [**🇮🇩 Bagian I: Bahasa Indonesia (Lengkap)**](#-bagian-i-lisensi-paguyuban-nda-sla--keamanan-bahasa-indonesia) &nbsp;|&nbsp; [**🇬🇧 Part II: English Version (Complete)**](#-part-ii-institutional-license-nda-sla--security-english)

---

## 🇮🇩 Bagian I: Lisensi Paguyuban, NDA, SLA & Keamanan (Bahasa Indonesia)

**Hak Cipta © 2026 Eko Agung (`@omeko42`)** - [GitHub](https://github.com/omeko42) | [LinkedIn](https://www.linkedin.com/in/omeko42/)  
**Paguyuban Alumni Akademi Kepolisian (Akpol) Tahun 1996 — Batalyon Wira Satya (WS96)**  
*Seluruh Hak Dilindungi Undang-Undang (All Rights Reserved).*

---

### 1. Hak Cipta Rekayasa & Kepemilikan Arsitektur
Kode sumber aplikasi, rancangan struktur direktori **261 personel & 28 fungsi kepolisian**, sistem transparansi **Dana Sosial & Buku Kas Dua Kamar**, modul delegasi **Mode Pendamping (*Ajudan/ADC*)**, mesin sinkronisasi *cloud real-time*, serta seluruh dokumentasi teknis pada repositori **`Wira Satya 96 (WS96)`** ini dirancang dan dibangun oleh **Eko Agung (`@omeko42`)** untuk mendukung transformasi digital, silaturahmi, dan tata kelola **Paguyuban Alumni Akpol 1996 — Batalyon Wira Satya**.

### 2. Hak Penggunaan Resmi Paguyuban Wira Satya 96
**Paguyuban Alumni Akademi Kepolisian (Akpol) Tahun 1996 — Batalyon Wira Satya** beserta seluruh jajaran **Pengurus Inti (*Ketua, Wakil Ketua, Sekretaris, Bendahara*)** dan **Anggota Alumni** memiliki hak penuh untuk menggunakan, mengoperasikan, dan memanfaatkan aplikasi ini bagi kepentingan komunikasi internal, pemetaan penugasan kedinasan, pemantauan kesejahteraan keluarga besar (*Anev*), serta transparansi pengelolaan Dana Sosial & Kas angkatan.

### 3. Perjanjian Kerahasiaan & Kepatuhan Sanitasi Data (*Non-Disclosure Agreement / NDA*)
Seluruh pengelolaan aplikasi maupun publikasi kode sumber pada repositori ini tunduk secara ketat pada ketentuan **Perjanjian Kerahasiaan (*Non-Disclosure Agreement / NDA*)** dan peraturan perundang-undangan Republik Indonesia (**UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi / UU PDP** serta **UU ITE**):

| Kategori Objek | Status Kerahasiaan (NDA) | Ketentuan Hukum & Teknis |
| :--- | :--- | :--- |
| **Kredensial Pribadi & Transaksi Keuangan Riil** (*Kata Sandi Pribadi, PIN 6-Angka, Kunci Biometrik, & Mutasi Rekening Bank*) | 🔴 **RAHASIA PENUH (*Strictly Confidential under NDA*)** | **Dilarang keras** dibocorkan atau dipublikasikan ke luar lingkungan resmi Paguyuban WS96. Repositori GitHub ini **0% memuat kata sandi pribadi atau dokumen laporan bank internal**. |
| **Kunci Rahasia Server & Infrastruktur** (*`SUPABASE_SERVICE_ROLE_KEY`, Password DB, & File `.env` Lokal*) | 🔴 **RAHASIA INFRASTRUKTUR (*Strictly Confidential under NDA*)** | Dilindungi oleh kebijakan *Zero-Secret Commit*. Seluruh variabel lingkungan produksi disuntikkan secara terisolasi pada server *deployment*. |
| **Akses Mode Pendamping (`Ajudan / ADC`)** | 🟡 **TERBATAS SESUAI WEWENANG** | Akun Ajudan (`WS96@<NRP_ADC>`) hanya diizinkan memperbarui biodata dan riwayat jabatan pimpinan yang didampingi, serta **terkunci mutlak dari menu Dana Sosial & Kas**. |
| **Kerangka Arsitektur Aplikasi, Skema Migrasi SQL & Dokumentasi Rekayasa** *(Isi Repositori Ini)* | 🟢 **PUBLIKASI PORTOFOLIO TERBATAS (*Sanitized Portfolio Reference*)** | Diizinkan untuk ditinjau sebagai referensi rekayasa perangkat lunak (*Full-Stack Engineering & System Architecture*) dengan tetap menghormati hak cipta. |

### 4. Standar Tingkat Layanan Operasional (*Service Level Agreement / SLA*)
Dalam operasional produksi di atas jaringan **Vercel Edge Network** dan **Supabase Cloud PostgreSQL**, portal **Wira Satya 96 (WS96)** menerapkan target **Standar Tingkat Layanan (SLA)** berikut:

| Parameter Layanan (SLA) | Target Metrik Produksi | Mekanisme Rekayasa Pendukung |
| :--- | :--- | :--- |
| **Ketersediaan Layanan (*System Uptime SLA*)** | **`99,9%` (*High Availability*)** | Hosting terdistribusi di atas **Vercel Global Edge CDN** dengan *fallback cache* lokal di peramban HP maupun laptop. |
| **Kecepatan Sinkronisasi Lintas Perangkat (*Realtime Sync SLA*)** | **`< 300 milidetik`** | Saluran **Supabase Realtime WebSockets (`postgres_changes`)** yang langsung menyebarkan perubahan profil, kas, dan berita ke seluruh perangkat aktif. |
| **Kecepatan Pencarian Direktori & 28 Fungsi (*Search SLA*)** | **`< 50 milidetik` (*Instan*)** | Pengindeksan dan penyaringan memori klien teroptimasi (`useMemo`) lintas 261 profil, 38 Polda, dan 28 fungsi kepolisian. |
| **Pemulihan & Ketahanan Data (*Data Durability*)** | **Cadangan Otomatis Cloud + Cache Lokal** | Penyimpanan terpusat di PostgreSQL (`public.ws96_app_state`) serta ekspor laporan keuangan ke **CSV (Excel)** kapan saja oleh Bendahara/Sekretaris. |

### 5. Arsitektur Keamanan Multi-Faktor & Kriptografi
Portal **Wira Satya 96 (WS96)** menerapkan pertahanan berlapis (*Defense-in-Depth*) yang mencakup:
1. **Autentikasi Biometrik Perangkat Keras (WebAuthn / FIDO2 Passkey)**: Mendukung login cepat menggunakan Sidik Jari atau Pengenalan Wajah di HP maupun laptop.
2. **Verifikasi Dua Langkah (MFA)**: Mendukung **TOTP 2FA (RFC 6238)** melalui Google/Microsoft Authenticator, **PIN Keamanan 6-Angka**, **OTP Email**, serta **Captcha Hybrid (Proof-of-Work SHA-256 + SVG)**.
3. **Otorisasi Cabut Akses Gawai Terpercaya**: Setiap anggota dapat memantau daftar perangkat yang pernah masuk dan mencabut akses gawai secara mandiri melalui menu **Pengaturan & Keamanan**.

### 6. Pembatasan & Larangan Keras (*Strict Prohibitions*)
Perangkat lunak ini **BUKAN** perangkat lunak bebas komersial (*bukan MIT / Apache Open-Source*). Tanpa izin tertulis dari Pemegang Hak Cipta dan/atau Pengurus Resmi Paguyuban Wira Satya 96, pihak mana pun di luar ketentuan Pasal 2 **DILARANG KERAS**:
1. **Memperjualbelikan (*Commercialization Prohibited*)**: Menyalin, mengemas ulang, menyewakan, atau menjual kode sumber maupun desain sistem di dalam repositori ini untuk keuntungan komersial pihak ketiga.
2. **Memalsukan Atribut Paguyuban / Institusi (*Impersonation Prohibited*)**: Menggunakan nama, lambang, atau identitas **Batalyon Wira Satya 1996 (WS96)** maupun **Polri** untuk membuat aplikasi tiruan yang menyesatkan.
3. **Klaim Kepemilikan Tanpa Atribusi (*Plagiarism Prohibited*)**: Menghapus atribusi hak cipta pengembang (`@omeko42`) atau mengklaim arsitektur sistem ini sebagai karya pihak lain.

---

## 🇬🇧 Part II: Institutional License, NDA, SLA & Security (English)

**Copyright © 2026 Eko Agung (`@omeko42`)** - [GitHub](https://github.com/omeko42) | [LinkedIn](https://www.linkedin.com/in/omeko42/)  
**Paguyuban Alumni Akademi Kepolisian (Akpol) Class of 1996 — Batalyon Wira Satya (WS96)**  
*All Rights Reserved.*

---

### 1. Engineering Copyright & Architectural Ownership
The application source code, 261-officer & 28-function directory engine, dual-chamber financial & social fund ledger, delegated Aide-de-Camp (`Mode Pendamping / ADC`) isolation engine, real-time cloud synchronization layer, and technical documentation contained in this **`Wira Satya 96 (WS96)`** repository were architected and engineered by **Eko Agung (`@omeko42`)** for **Paguyuban Alumni Akpol 1996 — Batalyon Wira Satya**.

### 2. Official Community Usage Rights (Paguyuban Wira Satya 96)
**Paguyuban Alumni Akademi Kepolisian (Akpol) Tahun 1996 — Batalyon Wira Satya**, including its **Executive Board (*Ketua, Wakil Ketua, Sekretaris, Bendahara*)** and all registered alumni members, holds full rights to operate and utilize this portal for internal communication, assignment tracking, family welfare monitoring (*Anev*), and transparent social fund governance.

### 3. Non-Disclosure Agreement (NDA) & Data Sanitization Covenant
Both production operations and the publication of sanitized architectural code in this repository are governed by strict **Non-Disclosure Agreement (NDA)** covenants and Indonesian statutory regulations (**Law No. 27/2022 on Personal Data Protection / UU PDP** and **UU ITE**):

| Asset Category | Confidentiality Classification (NDA) | Legal & Technical Enforcement |
| :--- | :--- | :--- |
| **Personal Credentials & Private Banking Records** (*Personal Passwords, 6-Digit PINs, Biometric Keys & Bank Statements*) | 🔴 **STRICTLY CONFIDENTIAL (*Protected under NDA*)** | **Strictly prohibited** from unauthorized extraction or public disclosure. This GitHub repository contains **0% personal passwords or private bank statements**. |
| **Server Secrets & Infrastructure Keys** (*`SUPABASE_SERVICE_ROLE_KEY`, DB Passwords & Local `.env` Files*) | 🔴 **INFRASTRUCTURE SECRET (*Protected under NDA*)** | Enforced via our *Zero-Secret Commit Policy*. All runtime secrets are injected exclusively via isolated deployment environment variables. |
| **Delegated Aide-de-Camp Access (`Mode Pendamping / ADC`)** | 🟡 **ROLE-RESTRICTED DELEGATION** | ADC accounts (`WS96@<NRP_ADC>`) are strictly limited to updating their principal officer's biography and career history, and are **automatically locked out of all financial menus (`Dana Sosial & Kas`)**. |
| **Sanitized Application Architecture, SQL Migrations & Engineering Docs** *(This Repository)* | 🟢 **AUTHORIZED PORTFOLIO REFERENCE** | Publicly viewable strictly for software engineering portfolio evaluation and architectural review with proper attribution. |

### 4. Operational Service Level Agreement (SLA) Standards

| SLA Dimension | Production Target | Underlying Architectural Guarantee |
| :--- | :--- | :--- |
| **System Availability (*Uptime SLA*)** | **`99.9%` High Availability** | Distributed hosting on the **Vercel Global Edge Network** paired with resilient local browser cache fallback. |
| **Cross-Device Synchronization Latency** | **`< 300 ms`** | Real-time **Supabase WebSockets (`postgres_changes`)** broadcasting profile, ledger, and timeline updates across smartphones and desktops. |
| **Directory & 28-Function Search Latency** | **`< 50 ms` (*Instant*)** | Memoized client-side indexing across 261 officers, 38 Polda jurisdictions, and 28 Polri functional categories. |
| **Data Durability & Audit Export** | **Cloud PostgreSQL + Instant CSV Export** | Centralized JSONB state persistence (`public.ws96_app_state`) plus one-click UTF-8 BOM CSV (Excel) export for board auditing. |

### 5. Multi-Factor Security & Cryptographic Architecture
1. **FIDO2 / WebAuthn Biometric Passkeys**: Native hardware-bound fingerprint and facial recognition login on smartphones and laptops.
2. **Multi-Factor Authentication (MFA) Matrix**: Supports **RFC 6238 TOTP 2FA**, **6-Digit Security PIN**, **Email OTP**, and **Hybrid SHA-256 Proof-of-Work + SVG Captcha**.
3. **Self-Service Trusted Device Revocation**: Members can audit and revoke active device sessions at any time via the Security Settings panel.

### 6. Strict Prohibitions & Disclaimer
This software is **NOT** licensed under a permissive commercial open-source license (*not MIT / Apache*). Without prior written authorization from the Copyright Holder (`@omeko42`) and/or official **Paguyuban Wira Satya 96** leadership, any party outside Article 2 is **STRICTLY PROHIBITED** from commercial redistribution, institutional impersonation, or unattributed misappropriation.
