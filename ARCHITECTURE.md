# 🏛️ ARSITEKTUR SISTEM: BATALYON WIRA SATYA AKPOL 1996
**Blueprint Arsitektur Skala Ratusan Ribu Data, Multi-Tier Decoupled Microservice & Standar Keamanan Enterprise Institusi Kepolisian**

*Dokumen ini disusun mengacu pada standar rekayasa enterprise Bareskrim Polri (Crime Analytic System - CAS Reference Architecture) yang disesuaikan secara proporsional untuk kapasitas beban ratusan ribu data pada Sistem Informasi Paguyuban Alumni Akpol 1996 Wira Satya (#SelaluBahagia).*

---

## 1. Ikhtisar Arsitektur & Karakteristik Skala Data

Sistem Informasi Batalyon Wira Satya Akpol 1996 mengadopsi arsitektur **Multi-Tier Decoupled Architecture**. Berbeda dengan sistem analitik kriminal nasional (seperti CAS yang menampung jutaan Laporan Polisi), sistem paguyuban perwira ini diproyeksikan beroperasi pada kapasitas **ratusan ribu rekaman data (*hundreds of thousands of records*)**, yang meliputi:
* **286 Personel Perwira Alumni** beserta ~1.500 data anggota keluarga/tanggungan.
* **~5.000 riwayat mutasi jabatan, penempatan dinas, dan Surat Perintah (Sprint)** dari pangkat Ipda (1996) hingga Perwira Tinggi / Pamen (2026).
* **Ratusan ribu pesan obrolan leting & koordinasi realtime** dalam modul perpesanan dinas.
* **Puluhan ribu mutasi keuangan kas yayasan**: iuran wajib bulanan, sumbangan sukarela, serta santunan kesehatan dan duka cita leting.
* **Ribuan dokumen resmi paguyuban**: Surat Telegram (TR), Surat Keputusan (SK Batalyon), notulen konsolidasi leting, serta arsip digital bukti transfer kas.
* **Log audit keamanan autentikasi & aktivitas FIDO2/Passkey/MFA**.

Pemisahan lapisan (*layer decoupling*) memastikan bahwa pemrosesan dokumen Word dinas, rekapitulasi kas yayasan, dan linimasa direktori berjalan tanpa saling membebani (*zero-contention*).

---

## 2. Topologi Sistem & Diagram Jaringan Kontainer

```mermaid
flowchart TD
    subgraph Klien_Eksternal["Perangkat Pengguna / Klien"]
        PC["💻 Laptop / PC Perwira (Intranet / Web Browser)"]
        Mobile["📱 Smartphone / Tablet (Akses Seluler)"]
    end

    subgraph Perimeter_Gateway["Perimeter Gateway & Reverse Proxy (Port 443 / 80)"]
        Nginx["Nginx Ingress Gateway & SSL Termination\n(Strict HSTS, Anti-Cache, Rate Limiting)"]
    end

    subgraph Docker_Network["🐳 Private Docker Bridge Network: wirasatya-net"]
        subgraph Tier_FE["Lapisan Frontend & Dokumen"]
            FE["Next.js 14 App Router: ws96-web\n(React 18 + Tailwind CSS + Lucide Icons)"]
            OnlyOffice["Document Server: onlyoffice-ds\n(ONLYOFFICE Community Edition - Port 8080)"]
        end

        subgraph Tier_BE["Lapisan Backend & Logika Bisnis"]
            BE_API["Core API: ws96-api\n(Node.js / Express / TypeScript - Port 5000)"]
            SnapshotWorker["Pre-Aggregated Snapshot Engine\n(Anev Leting & Kas Yayasan)"]
            RedisCache["Cache & Session: ws96-redis\n(Redis In-Memory - Port 6379)"]
        end

        subgraph Tier_Data["Lapisan Basis Data & Penyimpanan"]
            PG_DB[("PostgreSQL 16 Alpine: ws96-db\n(Composite B-Tree Indexes - Port 5432)")]
            MinioStore["Object Storage: ws96-minio\n(MinIO S3 Buckets - Port 9000/9001)"]
        end
    end

    PC -->|HTTPS / Port 443| Nginx
    Mobile -->|HTTPS / Port 443| Nginx

    Nginx -->|Proxy HTTP :3000| FE
    Nginx -->|Proxy /onlyoffice| OnlyOffice
    Nginx -->|Proxy /api| BE_API

    FE -->|REST API + Bearer JWT| BE_API
    FE -->|Direct Attachment View / Socket| OnlyOffice
    BE_API -->|pg Connection Pool| PG_DB
    BE_API -->|Session & Cache Query| RedisCache
    BE_API -->|S3 Protocol Upload/Download| MinioStore
    SnapshotWorker -->|Background Materialization| PG_DB
    SnapshotWorker -->|Hot Cache Update| RedisCache
```

---

## 3. Rincian Lapisan Arsitektur (4-Tier Decoupled)

| Lapisan | Layanan & Port | Teknologi | Tanggung Jawab Utama | Sifat Akses |
|---|---|---|---|---|
| **Tier 1: Frontend** | `ws96-web`<br/>`:3000` | Next.js 14 App Router, React 18, Tailwind CSS | Antarmuka Buku Saku Digital, Linimasa Jaringan 286 Perwira, Form Wizard SIPP, Dashboard Anev, dan Obrolan Leting. Mengusung visual khas *Bareskrim Crimson Red*. | Publik via Nginx Proxy |
| **Tier 2: Core API** | `ws96-api`<br/>`:5000` | Express.js, TypeScript, JWT, S3 SDK, pg Pool | API Gateway modular, autentikasi terverifikasi, otorisasi RBAC berjenjang, validasi integritas SIPP Polri, dan orkestrasi perpesanan. | Terisolasi dalam `wirasatya-net` |
| **Tier 3: Basis Data** | `ws96-db`<br/>`:5432` | PostgreSQL 16 Alpine | Penyimpanan terstruktur data 286 alumni, keluarga, riwayat dinas 38 Polda/Mabes, neraca kas yayasan, dan log pendaftaran. | Terisolasi dalam `wirasatya-net` |
| **Tier 4: Object Storage** | `ws96-minio`<br/>`:9000 / :9001` | MinIO S3 Engine | Penyimpanan aset biner: foto perwira (`wirasatya-avatars`), dokumentasi giat (`wirasatya-posts`), dan dokumen dinas/bukti kas (`wirasatya-documents`). | S3 API internal & Console Admin |
| **Document Server** | `onlyoffice-ds`<br/>`:8080` | ONLYOFFICE Community Edition | Mesin penampil dan penyunting naskah dinas Word (`.docx`), rekapitulasi Excel (`.xlsx`), dan PDF dengan format Jukminu Polri. | Terhubung via Nginx `/onlyoffice` |
| **In-Memory Cache** | `ws96-redis`<br/>`:6379` | Redis Alpine | Cache snapshot agregasi Anev Leting, sesi aktif, dan antrean pesan obrolan realtime. | Terisolasi dalam `wirasatya-net` |

---

## 4. Pola Rekayasa Data Skala Ratusan Ribu (Design Patterns)

Mengadopsi praktik terbaik dari arsitektur CAS Bareskrim, sistem ini mengimplementasikan 4 pola kunci:

### Pola 1: Pre-Aggregated Snapshot Cache (Anev Leting & Kas Yayasan)
* **Konteks**: Modul *Anev Leting* dan *Transparansi Kas* menyajikan rekapitulasi sebaran perwira di 38 Polda, status persiapan pensiun, atensi kesehatan kritis, dan kalkulasi saldo kas.
* **Penerapan**: Kalkulasi berat (`SUM`, `COUNT GROUP BY polda`, `JOIN` riwayat jabatan) **tidak dihitung ulang secara live** saat seorang Jenderal atau Pamen membuka dasbor.
* **Mekanisme**: Background worker melakukan kalkulasi secara terjadwal (atau saat terjadi perubahan transaksi kas) dan menyimpannya di tabel/cache snapshot. Respons dasbor turun drastis dari **>2.000 ms menjadi <15 ms**.

### Pola 2: ONLYOFFICE Socket Optimization & Direct File Download
* **Konteks**: ONLYOFFICE Community Edition memiliki batasan 20 concurrent connection (soket).
* **Penerapan**:
  1. Frontend menjalankan `destroyEditor()` secara otomatis saat komponen di-unmount atau pengguna berpindah tab, sehingga kuota soket langsung terbebas untuk rekan leting lain.
  2. Menyediakan tombol **Direct Attachment Download (.docx / .pdf)** di tabel dokumen resmi. Anggota yang hanya ingin mencetak atau mengunduh surat dinas tidak perlu membuka canvas editor yang berat.
  3. Konfigurasi `forcesave: false` mencegah terjadinya UI freeze saat penyimpanan dokumen berlangsung di latar belakang.

### Pola 3: Hierarchical RBAC & Segregasi Akses Kedinasan
Data dan fitur dibatasi berdasarkan peran pengguna:
* **SUPERADMIN** (Pengembang & Bareskrim): Manajemen infrastruktur, database, dan otorisasi verifikasi anggota.
* **KETUA PAGUYUBAN**: Hak persetujuan program kerja, visibilitas eksekutif penuh pada Anev Leting, dan penetapan kebijakan yayasan.
* **SEKRETARIAT**: Pengelolaan formulir SIPP, verifikasi pendaftaran alumni baru, administrasi persuratan (TR & Sprint paguyuban), serta pemutakhiran direktori.
* **BENDAHARA**: Pengelolaan neraca kas yayasan, verifikasi iuran bulanan alumni, dan pencatatan santunan kesehatan/duka cita.
* **ANGGOTA (ALUMNI)**: Membaca direktori 286 perwira, mengobrol di Obrolan Leting, memutakhirkan profil mandiri, serta melihat laporan transparansi kas.

### Pola 4: Standar Integritas & Tamper-Evident Storage
* Setiap bukti transfer kas, dokumen Sprint, dan Surat Telegram yang diunggah ke MinIO S3 diberi penamaan berbasis hash kriptografis SHA-256:
  $$\text{WS96-}[\text{SHA256}_{8}\text{]-}[\text{TIMESTAMP}].\text{ext}$$
* Mencegah eksploitasi *Insecure Direct Object References (IDOR)* dan menjamin keaslian bukti keuangan paguyuban dari manipulasi eksternal.

---

## 5. Alur Keamanan & Onboarding Perwira Alumni (End-to-End Flow)

Sesuai standar operasional kedinasan, pendaftaran alumni tidak mengizinkan akses terbuka langsung (*no unverified open login*), melainkan melalui rantai verifikasi bertingkat:

```mermaid
sequenceDiagram
    autonumber
    actor Officer as 👮 Perwira Alumni (Pemohon)
    participant FE as 🌐 Frontend (/login)
    participant API as ⚡ Core API (/api/auth)
    participant DB as 🐘 Basis Data (Store)
    actor Admin as 🛡️ Superadmin / Sekretariat

    Officer->>FE: Buka Tab "Pendaftaran Anggota Baru"<br/>Isi NRP, Pangkat, Satker, Polda, WhatsApp, Email Dinas
    FE->>API: POST /api/auth/register
    API->>DB: Simpan data dengan status 'PENDING_VERIFIKASI'
    API-->>FE: Pendaftaran Berhasil Diajukan
    FE-->>Officer: Tampil Layar Konfirmasi: "Menunggu Verifikasi Pengurus"

    Note over Admin,API: Administrator menerima notifikasi antrean verifikasi di Navbar
    Admin->>FE: Buka "Verifikasi Pendaftaran" (AdminVerificationModal)
    Admin->>FE: Klik "Setujui Permohonan"
    FE->>API: POST /api/auth/verify (action: 'APPROVE')
    API->>DB: Update status ke 'DISETUJUI_BELUM_PASSWORD'<br/>Daftarkan profil ke direktori 286 perwira
    API-->>FE: Otorisasi Berhasil

    Officer->>FE: Masuk ke Halaman Login, input NRP Dinas
    FE->>API: POST /api/auth/login (hanya input NRP)
    API-->>FE: { requiresPasswordSetup: true, nama, pangkat }
    FE->>Officer: Buka Dialog: "Aktivasi Akun & Buat Kata Sandi Baru"
    Officer->>FE: Input Kata Sandi Baru & Pilih Metode MFA (PIN / FIDO2)
    FE->>API: POST /api/auth/set-password
    API->>DB: Set Password, simpan MFA, update status ke 'AKTIF'
    API-->>FE: Login Sukses (User Token)
    FE-->>Officer: Berhasil masuk ke akun pribadi (Buku Saku / Direktori)
```

---

## 6. Standar SOTK Satuan Kerja & Eliminasi Polsek

Mengikuti SOTK Polri mutakhir (Perpres No. 52/2010 jo No. 5/2017, Perpol No. 14/2018, dan Korps 2024):
* **Tingkat Mabes Polri**: Unsur Pimpinan, Pengawas (Itwasum, Propam), Pembantu Pimpinan (SSDM, Slog, Astamaops, Astamarena), Pelaksana Utama (Bareskrim, Baintelkam, Baharkam, Korbrimob, Korlantas, Kortastipidkor, Densus 88 AT), Pendukung (Lemdiklat, Pusdokkes, Puskeu).
* **Tingkat Polda**: 38 Polda seluruh Indonesia (Kapolda, Wakapolda, Ditreskrimum, Ditreskrimsus, Ditresnarkoba, Ditressiber, Biro SDM, SPN, Satbrimob).
* **Tingkat Polres**: Polrestabes, Polresta, Polres jajaran.
* **Penugasan Luar Struktur**: BIN, BNN, BNPT, Lemhannas RI, KPK, BSSN, Kemenko Polkam.
* **Purna Tugas**: Alumni Purnawirawan, Masa Persiapan Pensiun (MPP), dan wirausaha pasca-dinas.

> [!IMPORTANT]
> **Eliminasi Satker Polsek**: Karena seluruh alumni Batalyon Wira Satya Akpol 1996 saat ini telah mencapai masa dinas 30 tahun dan berada pada jenjang kepangkatan **Kombes Pol**, **Brigjen Pol**, **Irjen Pol**, atau Purna Tugas, maka penempatan tingkat Polsek (jenjang Pama Ipda s.d. AKP) **dieliminasi dari antarmuka formulir dan filter data** demi efisiensi query dan relevansi kepangkatan.

---

## 7. Ketahanan & Rencana Pemulihan Bencana (Disaster Recovery)

* **Daily Automated SQL Dumps**: Backup basis data otomatis ke volume terisolasi `./data_aplikasi/backups`.
* **MinIO Object Replication**: Sinkronisasi berkas dokumen dan foto antar-node cadangan via utility `mc mirror`.
* **Zero-Downtime Cache Fallback**: Jika koneksi jaringan database mengalami gangguan sesaat, client Next.js memanfaatkan cache lokal terenkripsi sehingga antarmuka tidak mengalami *crash* atau layar kosong.
