-- ============================================================================
-- SUPABASE MULTI-TABLE SCHEMA SETUP - WIRA SATYA 96 (AKPOL 1996)
-- Memisahkan setiap modul ke tabel khusus dengan kolom terstruktur agar mudah
-- dibaca, difilter, dan dikelola di Supabase Table Editor.
-- ============================================================================

-- 1. TABEL DIREKTORI ALUMNI (ws96_members)
CREATE TABLE IF NOT EXISTS public.ws96_members (
  nrp               TEXT PRIMARY KEY,
  nama_lengkap      TEXT NOT NULL DEFAULT '',
  pangkat           TEXT NOT NULL DEFAULT '',
  jabatan_terakhir  TEXT NOT NULL DEFAULT '',
  satuan_kerja      TEXT NOT NULL DEFAULT '',
  polda             TEXT NOT NULL DEFAULT '',
  status_kedinasan  TEXT NOT NULL DEFAULT 'AKTIF',
  no_hp             TEXT NOT NULL DEFAULT '',
  email             TEXT NOT NULL DEFAULT '',
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL AKUN LOGIN & HAK AKSES PENGGUNA (ws96_users)
CREATE TABLE IF NOT EXISTS public.ws96_users (
  nrp         TEXT PRIMARY KEY,
  nama        TEXT NOT NULL DEFAULT '',
  pangkat     TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'ANGGOTA',
  satker      TEXT NOT NULL DEFAULT '',
  polda       TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  password    TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'AKTIF',
  is_adc      BOOLEAN NOT NULL DEFAULT FALSE,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL STATUS IURAN WAJIB ANGGOTA (ws96_iuran)
CREATE TABLE IF NOT EXISTS public.ws96_iuran (
  nrp             TEXT PRIMARY KEY,
  nama_lengkap    TEXT NOT NULL DEFAULT '',
  pangkat         TEXT NOT NULL DEFAULT '',
  polda           TEXT NOT NULL DEFAULT '',
  tahun           INTEGER NOT NULL DEFAULT 2026,
  total_tagihan   BIGINT NOT NULL DEFAULT 3000000,
  total_terbayar  BIGINT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'BELUM_BAYAR',
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABEL MUTASI TRANSAKSI KAS MASUK & KELUAR (ws96_transactions)
CREATE TABLE IF NOT EXISTS public.ws96_transactions (
  id               TEXT PRIMARY KEY,
  nomor_referensi  TEXT NOT NULL DEFAULT '',
  tanggal          TEXT NOT NULL DEFAULT '',
  jenis            TEXT NOT NULL DEFAULT 'MASUK',
  kategori         TEXT NOT NULL DEFAULT '',
  nominal          BIGINT NOT NULL DEFAULT 0,
  keterangan       TEXT NOT NULL DEFAULT '',
  pihak_terkait    TEXT NOT NULL DEFAULT '',
  dicatat_oleh     TEXT NOT NULL DEFAULT '',
  payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABEL POSTINGAN & KABAR BERANDA (ws96_posts)
CREATE TABLE IF NOT EXISTS public.ws96_posts (
  id              TEXT PRIMARY KEY,
  author_nrp      TEXT NOT NULL DEFAULT '',
  author_name     TEXT NOT NULL DEFAULT '',
  author_pangkat  TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'MOTIVASI',
  content         TEXT NOT NULL DEFAULT '',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT '',
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABEL PESAN / OBROLAN LETING (ws96_messages)
CREATE TABLE IF NOT EXISTS public.ws96_messages (
  id             TEXT PRIMARY KEY,
  sender_nrp     TEXT NOT NULL DEFAULT '',
  sender_name    TEXT NOT NULL DEFAULT '',
  receiver_nrp   TEXT NOT NULL DEFAULT '',
  receiver_name  TEXT NOT NULL DEFAULT '',
  text           TEXT NOT NULL DEFAULT '',
  timestamp      TEXT NOT NULL DEFAULT '',
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  payload        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABEL PORTOFOLIO ASET PAGUYUBAN (ws96_assets)
CREATE TABLE IF NOT EXISTS public.ws96_assets (
  id                  TEXT PRIMARY KEY,
  kode_aset           TEXT NOT NULL DEFAULT '',
  nama_aset           TEXT NOT NULL DEFAULT '',
  kategori            TEXT NOT NULL DEFAULT '',
  jumlah_unit         NUMERIC NOT NULL DEFAULT 1,
  estimasi_nilai_idr  BIGINT NOT NULL DEFAULT 0,
  kustodian_lokasi    TEXT NOT NULL DEFAULT '',
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABEL AUDIT LOG AKTIVITAS PENGURUS & ADC (ws96_audit_logs)
CREATE TABLE IF NOT EXISTS public.ws96_audit_logs (
  id           TEXT PRIMARY KEY,
  action       TEXT NOT NULL DEFAULT '',
  actor_nrp    TEXT NOT NULL DEFAULT '',
  actor_name   TEXT NOT NULL DEFAULT '',
  actor_role   TEXT NOT NULL DEFAULT '',
  target_nrp   TEXT NOT NULL DEFAULT '',
  target_nama  TEXT NOT NULL DEFAULT '',
  details      TEXT NOT NULL DEFAULT '',
  timestamp    TEXT NOT NULL DEFAULT '',
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABEL KONFIGURASI SISTEM & RINGKASAN KAS (ws96_config)
CREATE TABLE IF NOT EXISTS public.ws96_config (
  config_key   TEXT PRIMARY KEY,
  description  TEXT NOT NULL DEFAULT '',
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- AKTIFKAN RLS & POLICY AKSES API UNTUK KE-9 TABEL
-- ============================================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ws96_members',
    'ws96_users',
    'ws96_iuran',
    'ws96_transactions',
    'ws96_posts',
    'ws96_messages',
    'ws96_assets',
    'ws96_audit_logs',
    'ws96_config'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I_full_access" ON public.%I;', t, t);
    EXECUTE format(
      'CREATE POLICY "%I_full_access" ON public.%I FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================================
-- MIGRASI OTOMATIS DARI TABEL LAMA (ws96_records) JIKA ADA, LALU HAPUS ws96_records
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ws96_records'
  ) THEN
    -- Pindahkan members
    INSERT INTO public.ws96_members (nrp, nama_lengkap, pangkat, jabatan_terakhir, satuan_kerja, polda, status_kedinasan, no_hp, email, payload, updated_at)
    SELECT
      record_id,
      COALESCE(payload->>'namaLengkap', ''),
      COALESCE(payload->>'pangkat', ''),
      COALESCE(payload->>'jabatanTerakhir', ''),
      COALESCE(payload->>'satuanKerja', ''),
      COALESCE(payload->>'polda', ''),
      COALESCE(payload->>'statusKedinasan', payload->>'statusDinas', 'AKTIF'),
      COALESCE(payload->>'noHp', ''),
      COALESCE(payload->>'email', ''),
      payload,
      updated_at
    FROM public.ws96_records
    WHERE collection = 'members'
    ON CONFLICT (nrp) DO UPDATE SET
      nama_lengkap = EXCLUDED.nama_lengkap,
      pangkat = EXCLUDED.pangkat,
      jabatan_terakhir = EXCLUDED.jabatan_terakhir,
      satuan_kerja = EXCLUDED.satuan_kerja,
      polda = EXCLUDED.polda,
      status_kedinasan = EXCLUDED.status_kedinasan,
      no_hp = EXCLUDED.no_hp,
      email = EXCLUDED.email,
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at;

    -- Pindahkan users
    INSERT INTO public.ws96_users (nrp, nama, pangkat, role, satker, polda, email, password, status, is_adc, payload, updated_at)
    SELECT
      record_id,
      COALESCE(payload->>'nama', ''),
      COALESCE(payload->>'pangkat', ''),
      COALESCE(payload->>'role', 'ANGGOTA'),
      COALESCE(payload->>'satker', ''),
      COALESCE(payload->>'polda', ''),
      COALESCE(payload->>'email', ''),
      COALESCE(payload->>'password', ''),
      COALESCE(payload->>'status', 'AKTIF'),
      COALESCE((payload->>'isAdcAccount')::boolean, false),
      payload,
      updated_at
    FROM public.ws96_records
    WHERE collection = 'users'
    ON CONFLICT (nrp) DO UPDATE SET
      nama = EXCLUDED.nama,
      pangkat = EXCLUDED.pangkat,
      role = EXCLUDED.role,
      satker = EXCLUDED.satker,
      polda = EXCLUDED.polda,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      status = EXCLUDED.status,
      is_adc = EXCLUDED.is_adc,
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at;

    -- Pindahkan iuran
    INSERT INTO public.ws96_iuran (nrp, nama_lengkap, pangkat, polda, tahun, total_tagihan, total_terbayar, status, payload, updated_at)
    SELECT
      record_id,
      COALESCE(payload->>'namaLengkap', ''),
      COALESCE(payload->>'pangkat', ''),
      COALESCE(payload->>'polda', ''),
      COALESCE((payload->>'tahun')::int, 2026),
      COALESCE((payload->>'totalTagihan')::bigint, 3000000),
      COALESCE((payload->>'totalTerbayar')::bigint, 0),
      COALESCE(payload->>'status', 'BELUM_BAYAR'),
      payload,
      updated_at
    FROM public.ws96_records
    WHERE collection = 'iuran'
    ON CONFLICT (nrp) DO UPDATE SET
      nama_lengkap = EXCLUDED.nama_lengkap,
      pangkat = EXCLUDED.pangkat,
      polda = EXCLUDED.polda,
      tahun = EXCLUDED.tahun,
      total_tagihan = EXCLUDED.total_tagihan,
      total_terbayar = EXCLUDED.total_terbayar,
      status = EXCLUDED.status,
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at;

    -- Pindahkan meta ke ws96_config
    INSERT INTO public.ws96_config (config_key, description, payload, updated_at)
    SELECT
      record_id,
      CASE record_id
        WHEN 'financeSummary' THEN 'Ringkasan Saldo Kas & Pemasukan/Pengeluaran'
        WHEN 'financeConfig' THEN 'Pengaturan Tarif Iuran Wajib & Kategori Cashflow'
        WHEN 'deletedNrps' THEN 'Daftar NRP yang Dihapus / Non-1996'
        WHEN 'auditLogs' THEN 'Snapshot Cadangan Log Audit'
        WHEN 'assets' THEN 'Snapshot Cadangan Portofolio Aset'
        WHEN 'registrations' THEN 'Data Antrean Verifikasi & Registrasi Akun'
        ELSE 'Konfigurasi Sistem WS96'
      END,
      payload,
      updated_at
    FROM public.ws96_records
    WHERE collection = 'meta'
    ON CONFLICT (config_key) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at;

    -- Unpack auditLogs array ke tabel ws96_audit_logs
    INSERT INTO public.ws96_audit_logs (id, action, actor_nrp, actor_name, actor_role, target_nrp, target_nama, details, timestamp, payload)
    SELECT
      COALESCE(elem->>'id', 'log-' || md5(elem::text)),
      COALESCE(elem->>'action', ''),
      COALESCE(elem->>'actorNrp', ''),
      COALESCE(elem->>'actorName', elem->>'actorNama', ''),
      COALESCE(elem->>'actorRole', ''),
      COALESCE(elem->>'targetNrp', ''),
      COALESCE(elem->>'targetNama', elem->>'targetName', ''),
      COALESCE(elem->>'details', ''),
      COALESCE(elem->>'timestamp', ''),
      elem
    FROM public.ws96_records r,
         jsonb_array_elements(CASE WHEN jsonb_typeof(r.payload) = 'array' THEN r.payload ELSE '[]'::jsonb END) AS elem
    WHERE r.collection = 'meta' AND r.record_id = 'auditLogs'
    ON CONFLICT (id) DO NOTHING;

    -- Unpack assets array ke tabel ws96_assets
    INSERT INTO public.ws96_assets (id, kode_aset, nama_aset, kategori, jumlah_unit, estimasi_nilai_idr, kustodian_lokasi, payload)
    SELECT
      COALESCE(elem->>'id', 'ast-' || md5(elem::text)),
      COALESCE(elem->>'kodeAset', ''),
      COALESCE(elem->>'namaAset', ''),
      COALESCE(elem->>'kategori', ''),
      COALESCE((elem->>'jumlahUnit')::numeric, 1),
      COALESCE((elem->>'estimasiNilaiIdr')::bigint, 0),
      COALESCE(elem->>'kustodianLokasi', ''),
      elem
    FROM public.ws96_records r,
         jsonb_array_elements(CASE WHEN jsonb_typeof(r.payload) = 'array' THEN r.payload ELSE '[]'::jsonb END) AS elem
    WHERE r.collection = 'meta' AND r.record_id = 'assets'
    ON CONFLICT (id) DO NOTHING;

    -- Hapus tabel tunggal ws96_records agar sidebar Table Editor bersih
    DROP TABLE public.ws96_records;
  END IF;
END $$;
