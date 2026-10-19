-- ============================================================================
-- SETUP TABEL CLOUD DATABASE SUPABASE - WIRA SATYA 96 (AKPOL 1996)
-- Cara pakai:
-- 1. Buka Supabase Dashboard -> menu kiri "SQL Editor" (ikon >_)
-- 2. Klik "+ New query", tempel (paste) seluruh isi file ini, lalu klik "Run"
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ws96_records (
  collection TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection, record_id)
);

CREATE INDEX IF NOT EXISTS idx_ws96_records_collection
  ON public.ws96_records (collection);

CREATE INDEX IF NOT EXISTS idx_ws96_records_updated_at
  ON public.ws96_records (updated_at DESC);

-- Aktifkan Row Level Security (RLS) dengan akses penuh untuk API aplikasi WS96
ALTER TABLE public.ws96_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws96_cloud_full_access" ON public.ws96_records;
CREATE POLICY "ws96_cloud_full_access"
  ON public.ws96_records
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.ws96_records TO anon, authenticated, service_role;
