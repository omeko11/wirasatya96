# Catatan Keputusan Arsitektur / Architecture Decision Records (ADR) - Wira Satya 96 (WS96) - Paguyuban Alumni Akpol 1996

> 🌐 **Daftar Isi / Sections:** [**🇮🇩 Bagian I: Bahasa Indonesia**](#-bagian-i-catatan-keputusan-arsitektur-rekayasa-bahasa-indonesia) &nbsp;|&nbsp; [**🇬🇧 Part II: English Version**](#-part-ii-system-architecture--engineering-decision-records-english)

---

## 🇮🇩 Bagian I: Catatan Keputusan Arsitektur Rekayasa (Bahasa Indonesia)

Dokumen ini merangkum pola arsitektur inti dan keputusan rekayasa utama (**Architecture Decision Records / ADR**) yang memungkinkan portal **Wira Satya 96 (WS96)** menyajikan direktori **261 rekan seangkatan Akpol 1996** di seluruh **38 Polda**, **Mabes Polri**, **Luar Struktur**, dan **28 Fungsi Kepolisian** dengan sinkronisasi *cloud real-time*, isolasi keamanan akun **Ajudan/ADC**, serta tampilan yang ergonomis di layar HP maupun komputer.

### ADR-001: Arsitektur Sinkronisasi Hibrida (*Cloud-First State* dengan *Fallback Cache* Lokal)
- **Konteks**: Anggota Paguyuban Wira Satya 96 yang berdinas di berbagai kewilayahan membutuhkan pembaruan data profil, kabar kegiatan, dan laporan Dana Sosial yang langsung tersinkronisasi lintas perangkat (HP & laptop), namun tetap dapat dibuka dengan cepat saat berada di area dengan sinyal seluler terbatas.
- **Keputusan**: Menerapkan mesin sinkronisasi dua lapis pada `src/utils/cloudSync.ts`:
  1. **Penyimpanan Terpusat & WebSocket Realtime (`public.ws96_app_state` di Supabase PostgreSQL)**: Menyimpan seluruh perubahan profil, riwayat jabatan, transaksi Buku Kas, dan kiriman linimasa secara terpusat serta menyebarkannya seketika ke seluruh perangkat aktif melalui **Supabase Realtime (`postgres_changes`)**.
  2. **Cache Penyimpanan Lokal Tangguh**: Menyimpan salinan *state* terakhir di peramban untuk pemuatan antarmuka instan ($<50\text{ milidetik}$) dan ketahanan baca saat luring (*offline fallback*).
- **Dampak**: Pembaruan data dari satu HP atau laptop langsung tampil di perangkat anggota lain dalam hitungan milidetik tanpa risiko kehilangan data.

### ADR-002: Delegasi Terbatas melalui *Mode Pendamping (Ajudan / ADC)* dengan Isolasi Keuangan Mutlak
- **Konteks**: Banyak anggota Batalyon Wira Satya 96 yang mengemban jabatan strategis (*Pati & Pamen Polri*) sehingga memiliki keterbatasan waktu untuk memperbarui foto profil dan riwayat mutasi jabatan secara mandiri, namun informasi keuangan paguyuban (**Dana Sosial, Dana Investasi & Buku Kas**) bersifat internal bagi anggota.
- **Keputusan**: Membangun mekanisme autentikasi khusus **Ajudan / ADC (`adcList`)** di mana Ajudan yang didaftarkan dapat masuk menggunakan NRP Ajudan (`WS96@<NRP_ADC>`). Sistem secara otomatis mengaktifkan **`isCompanionMode (Mode Pendamping)`** yang:
  - Mengizinkan pembaruan foto profil, biodata, dan riwayat jabatan atas nama pimpinan yang didampingi.
  - Menyembunyikan dan mengunci secara mutlak seluruh menu serta tab **Dana Sosial, Investasi, dan Buku Kas**.
- **Dampak**: Kelengkapan data 261 personel selalu terjaga mutakhir dengan bantuan Ajudan tanpa mengorbankan privasi keuangan paguyuban.

### ADR-003: Pemisahan Buku Kas Dua Kamar (*Dana Sosial Sukarela* vs. *Dana Investasi & Aset*)
- **Konteks**: Pencampuran antara dana sumbangan sosial sukarela (*Santunan Anak Yatim, Besuk Rekan Sakit, Tali Asih Duka Cita, Baksos*) dengan dana investasi produktif paguyuban berpotensi menimbulkan kebingungan dalam pelaporan Bendahara.
- **Keputusan**: Memisahkan struktur data dan tampilan ke dalam **4 Kartu Ringkasan Utama** serta **2 Kamar Buku Kas (`SOSIAL` & `INVESTASI`)**, dilengkapi fitur ekspor **CSV (Excel) ber-BOM UTF-8** sekali klik dan pembatasan tombol kelola khusus untuk peran **Bendahara**, **Ketua/Wakil**, dan **Admin**.
- **Dampak**: Transparansi keuangan 100% mudah dipahami oleh seluruh anggota dan memudahkan rekapitulasi periodik Bendahara.

### ADR-004: Taksonomi Penugasan 38 Polda, Luar Struktur & 28 Fungsi Kepolisian (*Tour of Duty*)
- **Konteks**: Alumni Akpol 1996 tersebar di berbagai Satker Mabes Polri, 38 Polda jajaran, Kementerian/Lembaga (*Luar Struktur*), serta 28 fungsi teknis kepolisian.
- **Keputusan**: Menetapkan pengurutan berjenjang otomatis (`Status Kedinasan: Aktif → Purna → PTDH → Almarhum` → `Jenjang Pangkat` → `Level Satker` → `NRP`) dan memetakan seluruh riwayat jabatan ke dalam **28 Kategori Fungsi Kepolisian** disertai fitur pintar **Rekan Satu Wilayah** pada halaman profil.
- **Dampak**: Anggota yang sedang berdinas ke suatu wilayah dapat menemukan rekan seangkatan di wilayah atau fungsi tersebut dalam satu sentuhan.

### ADR-005: Ergonomi *Mobile-First* dengan Kartu Akordeon Ringkas di Layar HP
- **Konteks**: Sebagian besar anggota mengakses aplikasi melalui layar HP. Menampilkan seluruh rincian kartu samping (*Atensi Kesehatan* & *Dana Sosial*) secara terbuka di layar HP membuat halaman Beranda terlalu panjang untuk digulir.
- **Keputusan**: Menerapkan komponen akordeon responsif pada tampilan HP (kartu informasi tampil ringkas berupa judul dan baru membuka detail serta tombol navigasi saat disentuh), serta menjaga urutan bagian bawah Beranda tetap menampilkan kartu semboyan **`#SELALUBAHAGIA`** diikuti identitas resmi **`BATALYON WIRA SATYA 1996`** di posisi paling bawah.
- **Dampak**: Navigasi satu tangan di layar HP menjadi sangat ringkas, rapi, dan tidak melelahkan mata.

---

## 🇬🇧 Part II: System Architecture & Engineering Decision Records (English)

This section summarizes the core architectural patterns and key engineering decisions (**ADRs**) behind the **Wira Satya 96 (WS96)** digital pocketbook and governance portal.

### ADR-001: Hybrid Cloud-First State Synchronization with Local Cache Fallback (`cloudSync.ts`)
- **Context**: Alumni serving across 38 regional jurisdictions require real-time synchronization of profile updates, timeline announcements, and social fund ledgers across smartphones and laptops, with instant UI loading even on unstable mobile networks.
- **Decision**: Pair a centralized **Supabase PostgreSQL (`public.ws96_app_state`)** store and **Supabase Realtime WebSockets (`postgres_changes`)** with a local browser cache fallback and **Supabase Storage (`ws96-media`)** CDN uploads.
- **Impact**: Sub-50ms initial UI hydration and instant cross-device state propagation without data loss.

### ADR-002: Delegated Aide-de-Camp (`Mode Pendamping / ADC`) with Strict Treasury Isolation
- **Context**: Senior police officers (*Pati & Pamen*) often delegate administrative profile maintenance to their Aide-de-Camp (*Ajudan/ADC*), while battalion financial records (*Dana Sosial & Buku Kas*) must remain confidential to alumni members.
- **Decision**: Support dedicated ADC login credentials (`WS96@<NRP_ADC>`) that activate **`isCompanionMode`**, granting profile and career update permissions on behalf of the principal officer while strictly redacting and locking all financial views.
- **Impact**: High directory data freshness without compromising internal financial privacy.

### ADR-003: Dual-Chamber Financial Ledger (`Dana Sosial` vs. `Dana Investasi`)
- **Decision**: Strictly separate voluntary social solidarity milestones (*Orphan Scholarship, Medical Support, Bereavement, Baksos*) from productive investment assets across two distinct cash book chambers (`SOSIAL` & `INVESTASI`), paired with role-gated Bendahara CRUD tools and one-click UTF-8 BOM CSV (Excel) export.

### ADR-004: 38-Polda Jurisdiction & 28 Polri Function Taxonomy (`Tour of Duty`)
- **Decision**: Map all 261 alumni across **Mabes Polri**, **38 Polda**, **Luar Struktur**, and **28 Police Functional Categories**, sorted deterministically by service status (`AKTIF` → `PURNA_TUGAS` → `PTDH` → `ALMARHUM`), rank tier, and Satker level, complete with automatic same-region colleague discovery (*Rekan Satu Wilayah*).

### ADR-005: Mobile-First Collapsible Accordion Cards & Bottom-Anchored Identity
- **Decision**: Render sidebar widgets (*Atensi Kesehatan* & *Dana Sosial*) as compact tap-to-expand headers on mobile viewports while anchoring the `#SELALUBAHAGIA` motto card and `BATALYON WIRA SATYA 1996` identity footer at the bottom of the mobile home view.
