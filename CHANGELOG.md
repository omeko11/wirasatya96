# Riwayat Perubahan / Changelog - Wira Satya 96 (WS96) - Paguyuban Alumni Akpol 1996

> 🌐 **Daftar Isi / Sections:** [**🇮🇩 Bagian I: Bahasa Indonesia**](#-bagian-i-riwayat-perubahan--evolusi-platform-bahasa-indonesia) &nbsp;|&nbsp; [**🇬🇧 Part II: English Version**](#-part-ii-platform-changelog--release-history-english)

---

## 🇮🇩 Bagian I: Riwayat Perubahan & Evolusi Platform (Bahasa Indonesia)

Seluruh tonggak pencapaian arsitektur, rilis fitur, dan penyempurnaan rekayasa pada portal **Wira Satya 96 (WS96)** — **Paguyuban Alumni Akademi Kepolisian (Akpol) Tahun 1996 Batalyon Wira Satya** — didokumentasikan di dalam berkas ini.

### [v2.0.0] - Oktober 2026 (Rilis Produksi Cloud Terpadu — Tahap 4)
#### Ditambahkan (*Added*)
- **Sinkronisasi Cloud Real-Time & Penyimpanan Media Terpusat (`cloudSync.ts`)**:
  - Integrasi penuh dengan **Supabase PostgreSQL (`public.ws96_app_state`)** dan **Supabase Realtime WebSockets (`postgres_changes`)** sehingga perubahan profil, riwayat jabatan, transaksi Buku Kas, dan kiriman berita langsung tampil serentak di seluruh HP maupun komputer anggota.
  - Penyimpanan foto profil, gambar sampul, dan media kegiatan pada **Supabase Storage Bucket (`ws96-media`)** dengan *fallback* otomatis.
- **Direktori Terverifikasi 261 Personel, 38 Polda & 28 Fungsi Kepolisian (*Tour of Duty*)**:
  - Pemutakhiran basis data **261 alumni Batalyon Wira Satya 1996** (`src/data/akpol1996Alumni.ts`) lintas **Mabes Polri**, **38 Polda Jajaran**, dan **Luar Struktur** (*BNN, BIN, KPK, Kementerian/Lembaga*).
  - Pemetaan ke dalam **28 Kategori Fungsi Kepolisian** beserta rekapitulasi kategori jabatan dan fitur pintar **Rekan Satu Wilayah**.
- **Transparansi Keuangan Dua Kamar (*Dana Sosial & Dana Investasi*) & Menu Anev Pengurus**:
  - Pemisahan transparan antara **Program Solidaritas Dana Sosial** (*Santunan Anak Yatim, Besuk Rekan Sakit, Tali Asih Duka Cita, Baksos*) dan **Portofolio Dana Investasi & Buku Kas**, dilengkapi fitur unduh laporan **CSV (Excel)** sekali klik.
  - Menu **Anev & Statistik Pengurus** (*khusus Ketua, Wakil Ketua, Sekretaris/Admin, dan Bendahara*) yang mencakup 5 tab strategis: *Kesehatan, Hunian & Purna Tugas, Katalog Usaha, Sebaran Wilayah, serta Pendidikan & Pensiun*.
- **Mode Pendamping (*Ajudan / ADC*) & Keamanan Multi-Faktor (MFA)**:
  - Fitur delegasi akun **Ajudan (`WS96@<NRP_ADC>`)** untuk membantu pembaruan biodata dan jabatan pimpinan dengan penguncian otomatis dari menu keuangan (`Dana Sosial & Kas`).
  - Dukungan **WebAuthn / FIDO2 Biometric Passkey** (*Sidik Jari / Wajah*), **TOTP 2FA**, **PIN Keamanan 6-Angka**, **OTP Email**, **Kelola Gawai Terpercaya**, serta **Captcha Hybrid (PoW + SVG)**.

#### Diperbaiki & Dioptimalkan (*Fixed & Optimized*)
- **Ergonomi Tampilan Layar HP (*Mobile-First Beranda*)**:
  - Menyederhanakan kartu samping (*Atensi Kesehatan* & *Dana Sosial*) pada layar HP menjadi *header* akordeon ringkas yang baru membuka detail saat disentuh.
  - Menata urutan tampilan bawah pada menu Beranda di HP agar selalu menampilkan kartu semboyan **`#SELALUBAHAGIA`** diikuti identitas resmi **`BATALYON WIRA SATYA 1996`** di posisi paling bawah.
- **Sinkronisasi Otomatis Hak Akses Pengurus Inti**:
  - Memastikan peran kepengurusan (`KETUA`, `SEKRETARIS`, `BENDAHARA`, `ADMIN`) pada *seed* direktori selalu tersinkronisasi dengan *state* penyimpanan awan sehingga menu **Anev** dan tombol kelola **Bendahara** tampil konsisten di seluruh perangkat.

### [v1.0.0 - Tahap Historis 1–3] - Pra-2025 s/d Awal 2026
- **Tahap 1**: Buku saku cetak fisik dan rekapitulasi file Excel statis yang cepat usang saat terjadi mutasi jabatan.
- **Tahap 2**: Komunikasi mengandalkan grup WhatsApp tunggal di mana pengumuman penting pengurus dan kabar kesehatan rekan sering tertumpuk percakapan harian.
- **Tahap 3**: Prototipe awal berbasis penyimpanan peramban lokal (*single-device localStorage*) sebelum ditingkatkan menjadi arsitektur *cloud real-time* **Wira Satya 96 (WS96) v2.0**.

---

## 🇬🇧 Part II: Platform Changelog & Release History (English)

### [v2.0.0] - 2026-10 (Current Cloud Production Release — Stage 4)
#### Added
- **Real-Time Cloud State & Media Synchronization (`cloudSync.ts`)**: Full integration with **Supabase PostgreSQL (`public.ws96_app_state`)**, **Supabase Realtime WebSockets**, and **Supabase Storage (`ws96-media`)** for instant multi-device state and photo synchronization across smartphones and desktops.
- **Verified 261-Personnel Directory, 38-Polda Mapping & 28 Polri Functions**: Comprehensive assignment directory covering Mabes Polri, 38 Regional Police Commands (*Polda*), External Agencies (*Luar Struktur*), and all 28 Police Functional Categories (*Tour of Duty*).
- **Dual-Chamber Financial Ledger & Executive Anev Dashboard**: Transparent separation of voluntary social solidarity milestones (*Dana Sosial*) and battalion investments (*Dana Investasi*), one-click CSV (Excel) export, and a 5-tab **Anev & Statistik** dashboard for board leadership.
- **Delegated Aide-de-Camp (`ADC`) Mode & Multi-Factor Security Suite**: Dedicated `WS96@<NRP_ADC>` companion login with strict financial lockout, alongside **WebAuthn Biometric Passkeys**, **TOTP 2FA**, **6-Digit Security PIN**, **Email OTP**, and **Trusted Device Revocation**.

#### Fixed & Optimized
- **Mobile-First Ergonomics & Accordion Cards**: Implemented collapsible header-only accordion cards on mobile viewports (*Atensi Kesehatan* & *Dana Sosial*) and anchored the `#SELALUBAHAGIA` motto card and `BATALYON WIRA SATYA 1996` footer at the bottom of the mobile home layout.
- **Canonical Board Role Reconciliation**: Ensured canonical executive roles (`KETUA`, `SEKRETARIS`, `BENDAHARA`, `ADMIN`) automatically reconcile across cached and cloud-persisted states so board menus (`Anev` and treasury controls) remain consistently accessible.
