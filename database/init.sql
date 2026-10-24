-- ==============================================================================
-- WIRA SATYA 96 - POSTGRESQL DATABASE INITIALIZATION SCHEMA
-- Sistem Informasi Internal, Direktori 38 Polda, Kas & Alumni Network
-- Batalyon Akpol 1996 (#SelaluBahagia)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'PENGURUS', 'ANGGOTA');
CREATE TYPE fungsi_polri AS ENUM (
  'WASUM',
  'RENA',
  'OPS',
  'LEMDIKLAT',
  'RESERSE',
  'INTELKAM',
  'HARKAM',
  'BRIMOB',
  'SLOG',
  'SAHLI',
  'LANTAS',
  'DENSUS',
  'HUMAS',
  'PROPAM',
  'HUKUM',
  'HUBINTER',
  'TIK',
  'SDM',
  'TASPIDKOR',
  'KEU',
  'DOKKES',
  'LITBANG',
  'SEJARAH',
  'SETUM',
  'YANMA',
  'SPRIPIM',
  'KEWILAYAHAN',
  'LUAR_STRUKTUR'
);
CREATE TYPE reaction_type AS ENUM (
  'like', 
  'celebrate', 
  'support', 
  'love', 
  'insightful', 
  'funny'
);
CREATE TYPE transaksi_tipe AS ENUM ('MASUK', 'KELUAR');
CREATE TYPE status_verifikasi AS ENUM ('VERIFIED', 'PENDING', 'REJECTED');
CREATE TYPE kondisi_kesehatan AS ENUM ('DIRAWAT', 'PEMULIHAN', 'SEMBUH', 'KRITIS');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'ANGGOTA',
  is_active BOOLEAN DEFAULT TRUE,
  fido2_passkey_enabled BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  nama_lengkap VARCHAR(255) NOT NULL,
  pangkat VARCHAR(50) NOT NULL,
  nrp VARCHAR(30) UNIQUE,
  jabatan VARCHAR(255) NOT NULL,
  satker VARCHAR(255) NOT NULL,
  polda VARCHAR(100) NOT NULL,
  polda_id VARCHAR(50),
  angkatan INT DEFAULT 1996,
  batalyon VARCHAR(100) DEFAULT 'Wira Satya',
  sub_batalyon VARCHAR(50) DEFAULT 'Wira Satya A',
  no_hp VARCHAR(30),
  alamat TEXT,
  foto_url TEXT,
  banner_url TEXT,
  bio TEXT,
  status_iuran_2026 VARCHAR(50) DEFAULT 'LUNAS',
  total_rekan_leting INT DEFAULT 261,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. POLDA DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS polda_directory (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  wilayah VARCHAR(100) NOT NULL,
  alamat_mapolda TEXT,
  total_alumni_96 INT DEFAULT 0,
  kapolda_nama VARCHAR(255),
  kapolda_pangkat VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RIWAYAT JABATAN & PENUGASAN LETING 96 (TOUR OF DUTY)
CREATE TABLE IF NOT EXISTS riwayat_jabatan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nama_perwira VARCHAR(255) NOT NULL,
  pangkat VARCHAR(50) NOT NULL,
  jabatan VARCHAR(255) NOT NULL,
  satker VARCHAR(255) NOT NULL,
  polda VARCHAR(100) NOT NULL,
  polda_id VARCHAR(50) REFERENCES polda_directory(id) ON DELETE SET NULL,
  fungsi fungsi_polri DEFAULT 'RESERSE',
  periode VARCHAR(50) NOT NULL,
  dasar_tr VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  pencapaian TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. POSTS / FEEDS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_pangkat VARCHAR(50) NOT NULL,
  author_jabatan VARCHAR(255),
  author_avatar TEXT,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reposts_count INT DEFAULT 0,
  visibility VARCHAR(50) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. POST REACTIONS TABLE (Multi-reactions)
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, user_id)
);

-- 8. POST COMMENTS TABLE (Nested Comments)
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_pangkat VARCHAR(50) NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. KAS & KEUANGAN TABLE
CREATE TABLE IF NOT EXISTS kas_transaksi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tipe transaksi_tipe NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  nominal NUMERIC(15, 2) NOT NULL,
  keterangan TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  bukti_transfer_url TEXT,
  status_verifikasi status_verifikasi DEFAULT 'VERIFIED',
  verifikator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ATENSI KESEHATAN TABLE
CREATE TABLE IF NOT EXISTS atensi_kesehatan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nama_pasien VARCHAR(255) NOT NULL,
  hubungan VARCHAR(50) NOT NULL,
  diagnosa VARCHAR(255) NOT NULL,
  rumah_sakit VARCHAR(255) NOT NULL,
  kota VARCHAR(100) NOT NULL,
  kondisi kondisi_kesehatan DEFAULT 'DIRAWAT',
  kontak_pendamping VARCHAR(50),
  kebutuhan_khusus TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. MESSAGING TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_nrp ON profiles(nrp);
CREATE INDEX IF NOT EXISTS idx_profiles_polda_id ON profiles(polda_id);
CREATE INDEX IF NOT EXISTS idx_riwayat_fungsi ON riwayat_jabatan(fungsi);
CREATE INDEX IF NOT EXISTS idx_riwayat_polda_id ON riwayat_jabatan(polda_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_kas_transaksi_tanggal ON kas_transaksi(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_atensi_kesehatan_kondisi ON atensi_kesehatan(kondisi);

-- ==============================================================================
-- SEED INITIAL DATA FOR DEVELOPMENT / DEMO ENVIRONMENT (SANITIZED PUBLIC SAMPLE)
-- ==============================================================================

-- 1. Seed Polda Directory (Sample Reference)
INSERT INTO polda_directory (id, name, wilayah, alamat_mapolda, total_alumni_96, kapolda_nama, kapolda_pangkat) VALUES
('polda-metro-jaya', 'Polda Metro Jaya', 'DKI Jakarta', 'Jakarta Selatan', 0, '-', 'Irjen Pol'),
('polda-jawa-barat', 'Polda Jawa Barat', 'Jawa Barat', 'Bandung', 0, '-', 'Irjen Pol'),
('polda-jawa-tengah', 'Polda Jawa Tengah', 'Jawa Tengah', 'Semarang', 0, '-', 'Irjen Pol'),
('polda-jawa-timur', 'Polda Jawa Timur', 'Jawa Timur', 'Surabaya', 0, '-', 'Irjen Pol'),
('bareskrim-mabes', 'Mabes Polri', 'DKI Jakarta', 'Jakarta Selatan', 0, '-', 'Komjen Pol')
ON CONFLICT (id) DO NOTHING;

-- Note: Production user accounts and officer profiles are managed via encrypted
-- environment seeds and verified onboarding workflows (see SECURITY.md).
