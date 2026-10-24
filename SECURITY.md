<div align="center">

# 🛡️ KEBIJAKAN KEAMANAN / SECURITY POLICY
### Sistem Informasi Batalyon Wira Satya Akpol 1996

**[🇮🇩 Bahasa Indonesia](#-kebijakan-keamanan-bahasa-indonesia)** · **[🇬🇧 English Version](#-security-policy-english-version)**

</div>

---

<a id="-kebijakan-keamanan-bahasa-indonesia"></a>

# 🇮🇩 Kebijakan Keamanan (Bahasa Indonesia)

Platform **Sistem Informasi Batalyon Wira Satya Akpol 1996** dirancang dengan standar keamanan berlapis (*Defense in Depth*) dan prinsip hak akses minimum (*Least Privilege*). Seluruh konfigurasi sensitif dan kredensial produksi diisolasi sepenuhnya dari repositori publik (*Zero Data Leak Policy*).

## 1. Versi yang Didukung

| Versi | Status Dukungan | Catatan Keamanan |
| :--- | :--- | :--- |
| `v1.x (main)` | ✅ Didukung Aktif | Pembaruan keamanan & perbaikan kritis |
| `< v1.0` | ❌ Tidak Didukung | Telah dimigrasikan ke arsitektur modular 4-tier |

## 2. Arsitektur Keamanan & Proteksi Data

### A. Autentikasi Multi-Faktor & Kontrol Akses Berjenjang (RBAC)
- **Matriks Otoritas Berjenjang**: Pemisahan hak akses tegas antara `SUPERADMIN`, `KETUA`, `SEKRETARIS`, `BENDAHARA`, dan `ANGGOTA` (beserta akun pendamping `ADC`).
- **Autentikasi Biometrik (FIDO2 / WebAuthn) & PIN Keamanan**: Mendukung penguncian aksi sensitif dengan PIN dan biometrik perangkat.
- **Audit Log Terpusat**: Setiap aktivitas manajemen pengguna, penghapusan/pemulihan akun, perubahan role, reset kata sandi, serta aktivitas delegasi Ajudan (ADC) tercatat otomatis beserta cap waktu dan identitas pelaksana.

### B. Isolasi Variabel Lingkungan & Zero Data Leak
- Kredensial basis data, kunci penandatanganan sesi (`JWT_SECRET`), dan kunci layanan penyimpanan objek tidak pernah disimpan di dalam kode sumber publik.
- Gunakan berkas `.env` lokal (diabaikan oleh `.gitignore`) atau pengelola *Secret* pada platform hosting produksi.

### C. Isolasi Jaringan Kontainer & Penyimpanan Objek
- **Private Docker Bridge (`wirasatya-net`)**: Layanan basis data dan penyimpanan objek berjalan di jaringan internal kontainer.
- **Pemisahan Bucket MinIO S3**: Dokumen internal (`wirasatya-documents`) dikunci dari akses anonim dan hanya dapat diakses melalui *Presigned URL* berumur terbatas.

## 3. Prosedur Pelaporan Kerentanan Secara Tertutup

> [!CAUTION]
> **JANGAN** membuka *Public Issue* atau *Discussion* terbuka di GitHub untuk melaporkan celah keamanan.

1. Gunakan fitur **GitHub Private Vulnerability Reporting** pada tab **Security** → **Report a vulnerability** di repositori [https://github.com/omeko11/wirasatya96](https://github.com/omeko11/wirasatya96).
2. Sertakan deskripsi teknis kerentanan, langkah reproduksi (*Proof of Concept*), dan dampak potensial.
3. Tim pengembang akan meninjau laporan secara tertutup dalam waktu **1 × 24 jam**.

---
---

<a id="-security-policy-english-version"></a>

# 🇬🇧 Security Policy (English Version)

The **Wira Satya 1996 Alumni Information System** is engineered following **Defense in Depth** and **Least Privilege** security principles. All production credentials and sensitive configurations are strictly isolated from the public repository (**Zero Data Leak Policy**).

## 1. Supported Versions

| Version | Support Status | Security Notes |
| :--- | :--- | :--- |
| `v1.x (main)` | ✅ Actively Supported | Production & critical security patches |
| `< v1.0` | ❌ Unsupported | Migrated to the 4-tier decoupled architecture |

## 2. Security Architecture & Data Protection

### A. Multi-Factor Authentication & Hierarchical RBAC
- **Authority Matrix**: Strict separation of duties across `SUPERADMIN`, `KETUA` (Chairman), `SEKRETARIS` (Secretary), `BENDAHARA` (Treasurer), and `ANGGOTA` (Member / `ADC` Delegation).
- **FIDO2 / WebAuthn Biometrics & Security PIN**: Supports hardware-backed biometric authentication and PIN verification for sensitive actions.
- **Tamper-Evident Audit Logging**: Every user management operation, account deletion/restoration, role modification, password reset, and Aide-de-Camp (ADC) delegated action is automatically recorded with actor identity and timestamp.

### B. Environment Isolation & Zero Data Leak
- Database credentials, session signing keys (`JWT_SECRET`), and storage keys are never hardcoded into public source files.
- Always configure secrets via a local `.env` file (excluded by `.gitignore`) or your cloud provider's secret manager.

### C. Container Network Segmentation & S3 Bucket Policies
- **Private Docker Bridge (`wirasatya-net`)**: PostgreSQL and MinIO services communicate over an isolated virtual bridge network.
- **Bucket Access Control**: Internal documents (`wirasatya-documents`) enforce zero anonymous public access and require time-limited **Presigned URLs**.

## 3. Private Vulnerability Reporting

> [!CAUTION]
> **DO NOT** open a public GitHub Issue or Discussion to report a security vulnerability.

1. Use **GitHub Private Vulnerability Reporting** by navigating to the **Security** tab → **Report a vulnerability** at [https://github.com/omeko11/wirasatya96](https://github.com/omeko11/wirasatya96).
2. Include a clear description of the issue, reproduction steps (PoC), and potential impact.
3. Our maintainers will acknowledge your report within **24 hours** and coordinate remediation prior to any public disclosure.
