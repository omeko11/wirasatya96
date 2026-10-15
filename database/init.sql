-- ==============================================================================
-- WIRA SATYA 96 - POSTGRESQL DATABASE INITIALIZATION SCHEMA
-- Sistem Informasi Internal, Direktori 38 Polda, Kas & Alumni Network
-- Batalyon Akpol 1996 (#SelaluBahagia)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'PENGURUS', 'ANGGOTA');
CREATE TYPE fungsi_polri AS ENUM (
  'RESERSE', 
  'INTELKAM', 
  'LANTAS', 
  'BRIMOB_SABHARA', 
  'LEMDIKLAT', 
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
  total_rekan_leting INT DEFAULT 286,
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
-- SEED INITIAL DATA FOR BATALYON WIRA SATYA 1996
-- ==============================================================================

-- 1. Seed Polda Directory
INSERT INTO polda_directory (id, name, wilayah, alamat_mapolda, total_alumni_96, kapolda_nama, kapolda_pangkat) VALUES
('polda-metro-jaya', 'Polda Metro Jaya', 'DKI Jakarta', 'Jl. Jenderal Sudirman No.55, Jakarta Selatan', 42, 'Irjen Pol Karyoto, S.I.K.', 'Irjen Pol'),
('polda-jawa-barat', 'Polda Jawa Barat', 'Jawa Barat', 'Jl. Soekarno-Hatta No.748, Bandung', 28, 'Irjen Pol Dr. Akhmad Wiyagus, S.I.K., M.Si., M.M.', 'Irjen Pol'),
('polda-jawa-tengah', 'Polda Jawa Tengah', 'Jawa Tengah', 'Jl. Pahlawan No.1, Semarang', 25, 'Irjen Pol Ribut Hari Wibowo, S.H., S.I.K.', 'Irjen Pol'),
('polda-jawa-timur', 'Polda Jawa Timur', 'Jawa Timur', 'Jl. Ahmad Yani No.116, Surabaya', 34, 'Irjen Pol Drs. Imam Sugianto, M.Si.', 'Irjen Pol'),
('polda-sumut', 'Polda Sumatera Utara', 'Sumatera Utara', 'Jl. Sisingamangaraja KM 10.5, Medan', 22, 'Irjen Pol Whisnu Hermawan Februanto, S.I.K., M.H.', 'Irjen Pol'),
('polda-bali', 'Polda Bali', 'Bali', 'Jl. W.R. Supratman No.7, Denpasar', 14, 'Irjen Pol Daniel Adityajaya, S.H., S.I.K., M.Si.', 'Irjen Pol'),
('bareskrim-mabes', 'Bareskrim Mabes Polri', 'Mabes Polri', 'Jl. Trunojoyo No.3, Kebayoran Baru, Jakarta Selatan', 38, 'Komjen Pol Drs. Wahyu Widada, M.Phil.', 'Komjen Pol')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Users
INSERT INTO users (id, username, email, password_hash, role, fido2_passkey_enabled, two_factor_enabled) VALUES
('11111111-1111-1111-1111-111111111111', 'ekoagung', 'agungkrisdianto96@gmail.com', '$2a$12$e8w.XvjUeK0k0.WiraSatya96SuperSecretHashValueEkoDev', 'SUPERADMIN', TRUE, TRUE),
('22222222-2222-2222-2222-222222222222', 'iqbal96', 'm.iqbal96@polri.go.id', '$2a$12$e8w.XvjUeK0k0.WiraSatya96SuperSecretHashValueIqbal', 'PENGURUS', FALSE, TRUE),
('33333333-3333-3333-3333-333333333333', 'hengki96', 'hengki.haryadi96@polri.go.id', '$2a$12$e8w.XvjUeK0k0.WiraSatya96SuperSecretHashValueHengki', 'ANGGOTA', FALSE, TRUE),
('44444444-4444-4444-4444-444444444444', 'adesafri96', 'ade.safri96@polri.go.id', '$2a$12$e8w.XvjUeK0k0.WiraSatya96SuperSecretHashValueAdeSafri', 'ANGGOTA', FALSE, FALSE)
ON CONFLICT (username) DO NOTHING;

-- 3. Seed Profiles (Matching Screenshot Eko Agung)
INSERT INTO profiles (user_id, nama_lengkap, pangkat, nrp, jabatan, satker, polda, polda_id, angkatan, batalyon, no_hp, alamat, foto_url, status_iuran_2026, total_rekan_leting, bio) VALUES
('11111111-1111-1111-1111-111111111111', 'Eko Agung', 'Briptu', '96081299', 'Developer', 'Dittipidsiber Bareskrim Polri', 'Mabes Polri', 'bareskrim-mabes', 1996, 'Wira Satya', '0812-9696-1996', 'Kebayoran Baru, Jakarta Selatan', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', '-', 286, 'Superadministrator & Developer Platform Alumni Wira Satya 96. Selalu Bahagia!'),
('22222222-2222-2222-2222-222222222222', 'Irjen Pol Dr. H. Mohammad Iqbal, S.I.K., M.H.', 'Irjen Pol', '70070451', 'Kapolda Riau', 'Polda Riau', 'Polda Riau', 'bareskrim-mabes', 1996, 'Wira Satya', '0811-9600-001', 'Pekanbaru, Riau', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', 'LUNAS', 286, 'Ketua Angkatan Alumni Akpol 1996 Wira Satya. Mengabdi untuk Polri dan NKRI.'),
('33333333-3333-3333-3333-333333333333', 'Brigjen Pol Hengki Haryadi, S.I.K., M.H.', 'Brigjen Pol', '74100234', 'Dirtipidum Bareskrim Polri', 'Dittipidum Bareskrim', 'Mabes Polri', 'bareskrim-mabes', 1996, 'Wira Satya', '0812-9600-002', 'Jakarta Selatan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', 'LUNAS', 286, 'Direktur Tindak Pidana Umum Bareskrim Polri. Alumni Wira Satya 96.'),
('44444444-4444-4444-4444-444444444444', 'Kombes Pol Ade Safri Simanjuntak, S.I.K., M.Si.', 'Kombes Pol', '74120345', 'Dirreskrimsus Polda Metro Jaya', 'Ditreskrimsus', 'Polda Metro Jaya', 'polda-metro-jaya', 1996, 'Wira Satya', '0813-9600-003', 'Jakarta', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', 'LUNAS', 286, 'Dirreskrimsus Polda Metro Jaya. Penegakan hukum berkeadilan dan humanis.')
ON CONFLICT (user_id) DO NOTHING;

-- 4. Seed Riwayat Jabatan Leting 96 (Tour of Duty Internal)
INSERT INTO riwayat_jabatan (user_id, nama_perwira, pangkat, jabatan, satker, polda, polda_id, fungsi, periode, dasar_tr, deskripsi, pencapaian, is_current) VALUES
('33333333-3333-3333-3333-333333333333', 'Brigjen Pol Hengki Haryadi, S.I.K., M.H.', 'Brigjen Pol', 'Dirtipidum Bareskrim Polri', 'Bareskrim Mabes Polri', 'Mabes Polri', 'bareskrim-mabes', 'RESERSE', '2023 - Sekarang', 'ST/2864/XII/KEP./2023', 'Memimpin penindakan kejahatan pidana umum transnasional dan atensi publik nasional.', 'Pengungkapan sindikat TPPO internasional dan reformasi digitalisasi penyidikan Reserse.', TRUE),
('44444444-4444-4444-4444-444444444444', 'Kombes Pol Ade Safri Simanjuntak, S.I.K., M.Si.', 'Kombes Pol', 'Dirreskrimsus Polda Metro Jaya', 'Ditreskrimsus Polda Metro Jaya', 'Polda Metro Jaya', 'polda-metro-jaya', 'RESERSE', '2023 - Sekarang', 'ST/1395/VI/KEP./2023', 'Memimpin pengusutan tipidkor, perbankan, dan cyber crime di wilayah hukum Polda Metro Jaya.', 'Penuntasan perkara korupsi strategis dan digital forensik terintegrasi.', TRUE),
('11111111-1111-1111-1111-111111111111', 'Eko Agung', 'Briptu', 'Developer & Superadmin', 'Dittipidsiber Bareskrim Polri', 'Mabes Polri', 'bareskrim-mabes', 'RESERSE', '2024 - Sekarang', 'SPRIN/096/WS96/BARESKRIM/2024', 'Pengembangan platform terpadu Direktori 38 Polda, Kas Yayasan, dan Jejaring Letting Wira Satya 96.', 'Modernisasi sistem pendataan digital 286 perwira alumni Akpol 1996.', TRUE)
ON CONFLICT DO NOTHING;

-- 5. Seed Initial Posts with Reactions & Comments
INSERT INTO posts (id, author_id, author_name, author_pangkat, author_jabatan, author_avatar, content, likes_count, comments_count, reposts_count) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', '33333333-3333-3333-3333-333333333333', 'Brigjen Pol Hengki Haryadi, S.I.K., M.H.', 'Brigjen Pol', 'Dirtipidum Bareskrim Polri', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', 'Alhamdulillah, puji syukur ke hadirat Tuhan Yang Maha Esa. Hari ini Dittipidum Bareskrim Polri berhasil menuntaskan operasi penegakan hukum transnasional dan perlindungan PMI. Terima kasih tak terhingga atas doa restu dan dukungan solid dari seluruh abang dan rekan-rekan Letting Wira Satya 1996 di seluruh penjuru Tanah Air. Tetap semangat, jaga integritas Bhayangkara, dan #SelaluBahagia!', 48, 12, 5),
('bbbb2222-bbbb-2222-bbbb-222222222222', '11111111-1111-1111-1111-111111111111', 'Eko Agung', 'Briptu', 'Developer • Dittipidsiber Bareskrim Polri', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', 'Siap Jenderal dan Komandan sekalian! Pembaruan Sistem Informasi Batalyon Wira Satya 96 telah live dengan tampilan Bareskrim Deep Crimson Red, integrasi Riwayat Jabatan Leting, sistem reaksi multi-emoji, dan modul transparansi kas. Mohon koreksi dan arahannya.', 32, 8, 3)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Post Reactions
INSERT INTO post_reactions (post_id, user_id, reaction) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'celebrate'),
('aaaa1111-aaaa-1111-aaaa-111111111111', '22222222-2222-2222-2222-222222222222', 'support'),
('aaaa1111-aaaa-1111-aaaa-111111111111', '44444444-4444-4444-4444-444444444444', 'like'),
('bbbb2222-bbbb-2222-bbbb-222222222222', '33333333-3333-3333-3333-333333333333', 'insightful')
ON CONFLICT DO NOTHING;

-- 7. Seed Comments
INSERT INTO post_comments (id, post_id, parent_id, author_id, author_name, author_pangkat, author_avatar, content, likes_count) VALUES
('cccc1111-cccc-1111-cccc-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', NULL, '44444444-4444-4444-4444-444444444444', 'Kombes Pol Ade Safri Simanjuntak, S.I.K., M.Si.', 'Kombes Pol', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', 'Mantap Jenderal Hengki! Salut atas dedikasi dan ketegasannya. Salam hormat dari jajaran Polda Metro Jaya. Wira Satya 96 selalu terdepan!', 6),
('cccc2222-cccc-2222-cccc-222222222222', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'cccc1111-cccc-1111-cccc-111111111111', '33333333-3333-3333-3333-333333333333', 'Brigjen Pol Hengki Haryadi, S.I.K., M.H.', 'Brigjen Pol', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', 'Siap Ndan Ade Safri, terima kasih banyak sinergi lapangannya!', 4)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Kas Transaksi
INSERT INTO kas_transaksi (tipe, kategori, nominal, keterangan, tanggal, status_verifikasi) VALUES
('MASUK', 'Iuran Wajib Bulanan', 28600000.00, 'Iuran bulanan perwira leting Oktober 2026 (286 Perwira)', '2026-10-01', 'VERIFIED'),
('MASUK', 'Sumbangan Sukarela', 50000000.00, 'Donasi santunan sosial dan kas taktis dari alumni Jakarta', '2026-10-05', 'VERIFIED'),
('KELUAR', 'Bantuan Kesehatan Leting', 15000000.00, 'Santunan pengobatan dan rawat inap keluarga Kombes Pol Budi H. di RS Siloam', '2026-10-10', 'VERIFIED'),
('MASUK', 'Iuran Wajib Bulanan', 842500000.00, 'Saldo kumulatif Kas Yayasan Batalyon Wira Satya 96', '2026-10-14', 'VERIFIED')
ON CONFLICT DO NOTHING;
