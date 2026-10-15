# 🏛️ ARSITEKTUR SISTEM WIRA SATYA 96
**Spesifikasi Arsitektur 4-Tier Decoupled & Topologi Kontainer Platform Batalyon Wira Satya Akpol 1996 (#SelaluBahagia)**

---

## 1. Ringkasan Eksekutif (Executive Summary)

Platform **Sistem Informasi Batalyon Wira Satya Akpol 1996** dirancang dengan arsitektur modern berstandar enterprise yang mengusung prinsip **4-Tier Decoupled Architecture**. Setiap komponen (Frontend, Backend API, Database Relasional, dan Object Storage S3) beroperasi secara independen dalam kontainer Docker terisolasi dan berkomunikasi melalui protokol standar industri (HTTP/REST, TCP/PostgreSQL, dan S3 API).

Pemisahan ini menjamin:
- **Skalabilitas Horizontal**: Frontend dan Backend dapat di-scale secara mandiri.
- **Isolasi Keamanan**: Database dan penyimpanan dokumen tidak terpapar langsung ke jaringan publik.
- **Portabilitas Cloud-Native**: Dapat dijalankan di server lokal (Docker Compose / on-premise) maupun di-deploy ke cloud (Vercel, AWS ECS, Google Cloud Run, atau Kubernetes).

---

## 2. Diagram Konteks Sistem (System Topology)

```mermaid
graph TD
    subgraph ClientLayer["🌐 Klien & Pengguna"]
        DesktopUser["💻 Browser Desktop (Pamen/Pati)"]
        MobileUser["📱 Smartphone / Tablet"]
    end

    subgraph Tier1["1️⃣ PRESENTATION LAYER (Port 3000)"]
        FE["Next.js 14 App Router<br/>• Bareskrim Crimson Red Theme<br/>• Lucide React Icons<br/>• FIDO2 / WebAuthn Client<br/>• Tailwind CSS"]
    end

    subgraph DockerNetwork["🐳 Private Docker Bridge Network: wirasatya-net"]
        subgraph Tier2["2️⃣ APPLICATION / REST API (Port 5000)"]
            BE["Express.js + TypeScript<br/>• JWT Authentication & RBAC<br/>• SIPP Data Validation<br/>• MinIO S3 SDK Connector<br/>• pg Connection Pooling"]
        end

        subgraph Tier3["3️⃣ RELATIONAL DATABASE (Port 5432)"]
            DB[("PostgreSQL 16 Alpine<br/>• Database: wirasatya96<br/>• Schema init.sql<br/>• Relational Integrity & Indexes<br/>• Vol: ./data_aplikasi/postgres")]
        end

        subgraph Tier4["4️⃣ OBJECT STORAGE (Port 9000 / 9001)"]
            MinIO["MinIO S3 Server<br/>• Port 9000: S3 API<br/>• Port 9001: Web Console<br/>• Vol: ./data_aplikasi/minio"]
            
            subgraph Buckets["📦 S3 Buckets"]
                B1["wirasatya-avatars<br/>(Foto Profil Perwira - Public)"]
                B2["wirasatya-posts<br/>(Gambar Feed & Giat - Public)"]
                B3["wirasatya-documents<br/>(TR & Bukti Kas - Private)"]
            end
        end
    end

    DesktopUser -->|HTTPS :3000| FE
    MobileUser -->|HTTPS :3000| FE
    FE -->|REST API JSON :5000| BE
    BE -->|SQL via TCP :5432| DB
    BE -->|S3 Protocol :9000| MinIO
    MinIO --> B1
    MinIO --> B2
    MinIO --> B3
```

---

## 3. Rincian Komponen 4-Tier

| Tier | Layanan | Teknologi | Port | Fungsi Utama | Aksesibilitas |
|---|---|---|---|---|---|
| **Tier 1** | **Frontend (FE)** | Next.js 14 App Router, React 18, Tailwind CSS, Lucide | `3000` | Antarmuka interaktif bernuansa Bareskrim Crimson Red, Buku Saku Digital, Feed Silaturahmi multi-reaksi, Riwayat Jabatan Leting, Form SIPP, dan Manajemen Kas. | Publik via Web Browser (`http://localhost:3000`) |
| **Tier 2** | **Backend (BE)** | Node.js, Express, TypeScript, S3 SDK, pg Pool | `5000` | API Gateway RESTful modular (`/api/auth`, `/api/members`, `/api/posts`, `/api/finance`, `/api/storage`), autentikasi JWT, validasi SIPP, dan orkestrasi presigned URL. | Terhubung ke FE via internal/external proxy |
| **Tier 3** | **Database (DB)** | PostgreSQL 16 Alpine | `5432` | Penyimpanan data relasional terstruktur: identitas 286 perwira, riwayat dinas, penempatan 38 Polda/Mabes/Polres, data keluarga, data kas, dan linimasa postingan. | Privat dalam `wirasatya-net` |
| **Tier 4** | **Object Storage** | MinIO S3 Engine | `9000` (API)<br/>`9001` (GUI) | Penyimpanan aset biner tak terstruktur (foto profil, dokumentasi giat leting, lampiran PDF Surat Telegram/TR). | S3 API internal & Console admin |

---

## 4. Topologi Jaringan Kontainer & Docker Compose

Seluruh kontainer diorkestrasi menggunakan [docker-compose.yml](file:///d:/Project/KAP%20IDAH/wirasatya96/docker-compose.yml) yang terisolasi dalam satu virtual bridge network: `wirasatya-net`.

### Urutan Booting & Healthchecks (Boot Sequence):
1. **`postgres`** menyala pertama kali dan memvalidasi kesiapan socket database via `pg_isready`. Skema `database/init.sql` otomatis dieksekusi saat inisialisasi volume pertama.
2. **`minio`** menyala secara paralel dan memverifikasi kesiapan endpoint melalui `curl http://localhost:9000/minio/health/live`.
3. **`minio-init`** (kontainer pembantu) berjalan otomatis begitu MinIO *healthy*, mengonfigurasi alias `localminio`, membuat ketiga bucket (`wirasatya-avatars`, `wirasatya-posts`, `wirasatya-documents`), dan menerapkan hak akses download publik/privat.
4. **`backend`** menyala setelah `postgres` dan `minio` dalam status *healthy*, melakukan verifikasi koneksi pool dan memulai listening pada port 5000.
5. **`frontend`** menyala dan terhubung ke backend Express via variabel lingkungan `NEXT_PUBLIC_API_URL`.

### Volume Persistensi Data:
- Database PostgreSQL: `./data_aplikasi/postgres` → `/var/lib/postgresql/data`
- Object Storage MinIO: `./data_aplikasi/minio` → `/data`
- Direktori Cadangan Database: `./data_aplikasi/backups` → `/backups`

---

## 5. Alur Data End-to-End (Data Flow Scenarios)

### Skenario A: Unggah Media & Publikasi Linimasa (Social Feed Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Officer as 👮 Perwira / Alumni Leting
    participant FE as 🌐 Frontend (Next.js)
    participant BE as ⚡ Backend (Express API)
    participant MinIO as 🪣 MinIO S3
    participant DB as 🐘 PostgreSQL DB

    Officer->>FE: Buka modal "Buat Postingan", ketik giat & pilih foto
    FE->>BE: POST /api/storage/upload (Multipart Form Data)
    BE->>BE: Verifikasi JWT & ekstrak NRP Perwira
    BE->>MinIO: PutObject ke bucket 'wirasatya-posts'
    MinIO-->>BE: Status OK + Object Key / S3 URL
    FE->>BE: POST /api/posts (Kategori, Konten, Media URL)
    BE->>DB: INSERT INTO posts (...) VALUES (...)
    DB-->>BE: Record terbuat (post_id)
    BE-->>FE: HTTP 201 Created (Post object)
    FE-->>Officer: Postingan langsung tampil di linimasa Feed leting
```

---

### Skenario B: Pendataan SIPP Polri (Form Wizard Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 🛡️ Superadmin / Anggota
    participant FE as 🌐 Frontend (FormWizard)
    participant BE as ⚡ Backend API
    participant DB as 🐘 PostgreSQL DB

    Admin->>FE: Isi Formulir 4 Modul (SIPP, Keluarga, Purna Tugas, Kesehatan)
    Note over FE: Memilih Tipe Satker (Mabes / Polda / Polres / Kemen-Lembaga)<br/>Opsi Polsek sengaja dieliminasi (Kombes/Pati level)
    FE->>BE: POST /api/members (Payload Data Lengkap)
    BE->>BE: Validasi NRP, NIK, dan Hierarki Satker Resmi
    BE->>DB: UPSERT INTO members & profiles (NRP, Data Kedinasan, Tanggungan)
    DB-->>BE: Status Berhasil
    BE-->>FE: HTTP 200 OK
    FE-->>Admin: Notifikasi Sukses & Direktori Perwira terbarui
```

---

## 6. Standar SOTK Polri & Hirarki Satuan Kerja

Aplikasi mengintegrasikan struktur organisasi Polri mutakhir (Perpres No. 52/2010 jo Perpres No. 5/2017, Perpol No. 14/2018, Perpol No. 2/2021, dan pembentukan Korps 2024):

```mermaid
graph TD
    Polri["🏛️ KEPOLISIAN NEGARA REPUBLIK INDONESIA"]
    
    subgraph SOTKMabes["1. Tingkat Mabes Polri"]
        Pimpinan["Unsur Pimpinan<br/>(Kapolri & Wakapolri)"]
        Pengawas["Pengawas & Pembantu Pimpinan<br/>(Itwasum, Astamaops, Astamarena, SSDM, Slog, Divpropam, Divhumas, Divhubinter, Divkum, DivTIK, Sahli)"]
        Pelaksana["Pelaksana Tugas Utama<br/>(Bareskrim, Baintelkam, Baharkam, Korbrimob, Korlantas, Kortastipidkor, Densus 88 AT)"]
        Pendukung["Pendukung & Pelayanan<br/>(Lemdiklat, Pusdokkes, Puskeu, Puslitbang, Pusjarah, Spripim, Setum, Yanma)"]
    end

    subgraph SOTKPolda["2. Tingkat Polda (38 Wilayah)"]
        PoldaPim["Kapolda & Wakapolda"]
        DitPolda["Direktorat Operasional<br/>(Reskrimum, Reskrimsus, Resnarkoba, Ressiber, Lantas, Intelkam, Samapta, Polairud, Binmas, Pamobvit, Tahti, Satbrimob)"]
        BiroPolda["4 Biro Staf (Ro SDM, Ro Ops, Ro Rena, Ro Log)"]
        BidPolda["6 Bidang & Lembaga (Propam, Humas, Kum, Dokkes, Keu, TIK, SPN, Itwasda)"]
    end

    subgraph SOTKPolres["3. Tingkat Polres (Metro / Polrestabes / Polresta / Polres)"]
        Kapolres["Kapolres / Wakapolres"]
        BagPolres["4 Bagian (Bag Ops, Bag Ren, Bag SDM, Bag Log)"]
        SatPolres["Satuan Fungsi (Reskrim, Narkoba, Intelkam, Lantas, Samapta, Binmas, Polairud, Pamobvit, Tahti)"]
        SiPolres["Seksi Pelayanan & Pengawasan (Propam, Humas, Kum, Was, Keu, TIK, Dokkes, Umum, SPKT)"]
    end

    subgraph KemenLembaga["4. Penugasan Luar Struktur"]
        KL["BIN, BNN, BNPT, Lemhannas RI, KPK, BSSN, Kemenko Polkam, Setmilpres, Bakamla, Kemendagri"]
    end

    subgraph PurnaTugas["5. Bhayangkara Purna Tugas"]
        Purna["Purnawirawan, Masa Persiapan Pensiun (MPP), Wirausaha, Konsultan, Tokoh Masyarakat"]
    end

    Polri --> SOTKMabes
    Polri --> SOTKPolda
    Polri --> SOTKPolres
    Polri --> KemenLembaga
    Polri --> PurnaTugas
```

> [!NOTE]
> **Eliminasi Satker Polsek**: Karena seluruh alumni Akpol 1996 (Wira Satya 96) saat ini telah berdinas selama 30 tahun dan berada pada jenjang pangkat **Kombes Pol**, **Brigjen Pol**, **Irjen Pol**, atau Purna Tugas, maka penempatan Polsek (tingkat Pama Ipda/Iptu/AKP) **sengaja ditiadakan** dari antarmuka formulir dan filter untuk efisiensi serta relevansi data kedinasan.

---

## 7. Ketahanan Sistem & Pencadangan (Backup & Disaster Recovery)

- **Automated Database Dumps**: Script utilitas menghasilkan file SQL dump harian ke folder `./data_aplikasi/backups`.
- **MinIO Data Mirroring**: Folder data MinIO dapat disinkronkan secara periodik ke AWS S3 / Google Cloud Storage menggunakan perintah `mc mirror`.
- **Graceful Error Handling**: Jika koneksi backend ke database terputus sementara, frontend Next.js secara cerdas beralih ke cache data lokal tanpa membuat aplikasi *crash*.
