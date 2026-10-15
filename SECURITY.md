# Kebijakan Keamanan (Security Policy)

Platform **Sistem Informasi Batalyon Wira Satya Akpol 1996** menyimpan data strategis para perwira menengah (Pamen) dan perwira tinggi (Pati) Polri, mencakup riwayat kedinasan SIPP, penempatan satker, data keluarga, atensi kesehatan khusus, serta transparansi perbendaharaan kas paguyuban. Oleh karena itu, keamanan data dan kerahasiaan informasi menjadi prioritas tertinggi dalam pengembangan sistem ini.

---

## 1. Versi yang Didukung (Supported Versions)

Pembaruan keamanan dan patch kerentanan secara aktif diberikan pada branch utama (`main`) dan rilis produksi terkini:

| Versi | Status Dukungan | Catatan Keamanan |
|---|---|---|
| `v1.0.x (Current / main)` | ✅ Didukung Aktif | Produksi & Pembaruan Kritis |
| `< v1.0.0 (Legacy Prototype)` | ❌ Tidak Didukung | Migrasi ke arsitektur modular 4-tier |

---

## 2. Arsitektur Keamanan & Proteksi Data

Sistem menerapkan prinsip *Defense in Depth* dan *Least Privilege*:

### A. Autentikasi Multi-Faktor (MFA) & FIDO2 WebAuthn
- **Multi-Role Access Control (RBAC)**: Pemisahan hak akses berjenjang (`KETUA`, `SEKRETARIS`, `BENDAHARA`, `ANGGOTA`).
- **WebAuthn / Biometrik (Touch ID / Face ID / Windows Hello)**: Mendukung autentikasi aman tanpa kata sandi menggunakan standar FIDO2.
- **PIN Enkripsi & Password Hashing**: Kredensial pengguna di-hash secara aman menggunakan algoritma Argon2 / Bcrypt.

### B. Isolasi Jaringan Kontainer (Network Segmentation)
- **Private Docker Bridge (`wirasatya-net`)**: Database PostgreSQL (`port 5432`) dan Object Storage MinIO (`port 9000`) diisolasi dalam jaringan privat virtual Docker.
- Port database tidak diekspos langsung ke internet publik pada lingkungan deployment produksi; komunikasi database hanya diizinkan melalui backend Express API.

### C. Kebijakan Object Storage (MinIO S3 Buckets)
- **Bucket Publik**: `wirasatya-avatars` dan `wirasatya-posts` dikonfigurasi dengan kebijakan *read-only public download* khusus untuk render media gambar.
- **Bucket Privat (Zero Public Access)**: `wirasatya-documents` dikunci sepenuhnya (`anonymous set none`). Akses dokumen Surat Telegram (TR) dan bukti transfer kas wajib menggunakan **Presigned URL** berumur terbatas (*time-limited token expiration*).

### D. Perlindungan Privasi Data Pribadi (UU PDP)
- Data rekam medis dan atensi kesehatan khusus (Modul 4) hanya dapat diakses oleh pemilik akun dan Pengurus Bidang Kesejahteraan/Ketua dengan audit log tercatat.

---

## 3. Pelaporan Kerentanan (Reporting a Vulnerability)

Kami sangat menghargai kontribusi dari komunitas keamanan siber dan para perwira pemerhati IT dalam menjaga integritas sistem ini.

> [!CAUTION]
> **PENTING: JANGAN** membuka *Public Issue* atau *Discussion* terbuka di GitHub untuk melaporkan celah keamanan atau kerentanan.

### Prosedur Pelaporan Tertutup:
1. **GitHub Private Vulnerability Advisory**: Buka tab **Security** → **Report a vulnerability** pada repositori [https://github.com/omeko11/wirasatya96](https://github.com/omeko11/wirasatya96).
2. **Kirimkan rincian mencakup**:
   - Deskripsi kerentanan dan potensi dampaknya (*impact*).
   - Langkah-langkah reproduksi (*proof of concept* / PoC).
   - Saran mitigasi atau patch jika tersedia.
3. Tim pengembang akan memberikan konfirmasi penerimaan laporan dalam waktu **1 x 24 jam**, dan patch rilis akan diprioritaskan sebelum detail teknis dipublikasikan.
