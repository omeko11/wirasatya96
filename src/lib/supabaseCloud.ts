// ============================================================================
// SUPABASE CLOUD PERSISTENCE ENGINE - WIRA SATYA 96 (AKPOL 1996)
// Menyimpan data secara granular (per-baris / per-NRP / per-ID) di PostgreSQL
// Supabase agar aman untuk Multiple Input bersamaan dari banyak HP & Laptop.
// ============================================================================

export const SUPABASE_PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pdjuiicfchuawoqsybpt.supabase.co';

export const SUPABASE_API_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkanVpaWNmY2h1YXdvcXN5YnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTQyNDAsImV4cCI6MjEwNzk3MDI0MH0.5vcpctMgop_eIG0P9-YsroU59hCqpbFkFuTIrWyUR_g';

export const SUPABASE_TABLE = 'ws96_records';

export interface SupabaseRecordRow<T = unknown> {
  collection: string;
  record_id: string;
  payload: T;
  updated_at?: string;
}

function getHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SUPABASE_API_KEY,
    Authorization: `Bearer ${SUPABASE_API_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * Mengecek apakah tabel `public.ws96_records` sudah tersedia di Supabase.
 */
export async function checkSupabaseTableStatus(): Promise<{
  connected: boolean;
  tableReady: boolean;
  rowCount?: number;
  error?: string;
}> {
  try {
    const url = `${SUPABASE_PROJECT_URL}/rest/v1/${SUPABASE_TABLE}?select=record_id&limit=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders({ Prefer: 'count=exact' }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        connected: true,
        tableReady: false,
        error: `HTTP ${res.status}: ${errText}`,
      };
    }

    const contentRange = res.headers.get('content-range') || '';
    const totalMatch = contentRange.match(/\/(\d+)$/);
    const rowCount = totalMatch ? parseInt(totalMatch[1], 10) : 0;

    return {
      connected: true,
      tableReady: true,
      rowCount,
    };
  } catch (err) {
    return {
      connected: false,
      tableReady: false,
      error: String(err),
    };
  }
}

/**
 * Mengambil seluruh baris dari tabel `ws96_records` di Supabase dengan paginasi otomatis.
 */
export async function fetchAllSupabaseRecords(): Promise<SupabaseRecordRow[] | null> {
  try {
    const allRows: SupabaseRecordRow[] = [];
    const pageSize = 1000;
    let offset = 0;

    while (offset < 10000) {
      const url = `${SUPABASE_PROJECT_URL}/rest/v1/${SUPABASE_TABLE}?select=collection,record_id,payload,updated_at&order=collection.asc,record_id.asc&limit=${pageSize}&offset=${offset}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) {
        return null;
      }

      const page: SupabaseRecordRow[] = await res.json();
      if (!Array.isArray(page) || page.length === 0) {
        break;
      }

      allRows.push(...page);
      if (page.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    return allRows;
  } catch {
    return null;
  }
}

/**
 * Menyimpan / memperbarui (Upsert) satu baris data secara granular di Supabase.
 * Sangat aman untuk multiple input bersamaan dari banyak HP karena hanya mengupdate record_id terkait.
 */
export async function upsertSupabaseRecord(
  collection: string,
  recordId: string,
  payload: unknown
): Promise<boolean> {
  if (!collection || !recordId) return false;
  try {
    const url = `${SUPABASE_PROJECT_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=collection,record_id`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders({
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify([
        {
          collection,
          record_id: String(recordId).trim(),
          payload,
          updated_at: new Date().toISOString(),
        },
      ]),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Menyimpan banyak baris sekaligus (Batch Upsert) ke Supabase.
 */
export async function upsertSupabaseBatch(rows: SupabaseRecordRow[]): Promise<boolean> {
  if (!Array.isArray(rows) || rows.length === 0) return true;
  try {
    const chunkSize = 200;
    const nowIso = new Date().toISOString();
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize).map((r) => ({
        collection: r.collection,
        record_id: String(r.record_id).trim(),
        payload: r.payload,
        updated_at: r.updated_at || nowIso,
      }));

      const url = `${SUPABASE_PROJECT_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=collection,record_id`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders({
          Prefer: 'resolution=merge-duplicates,return=minimal',
        }),
        body: JSON.stringify(chunk),
        cache: 'no-store',
      });

      if (!res.ok) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Menghapus satu baris spesifik dari Supabase.
 */
export async function deleteSupabaseRecord(
  collection: string,
  recordId: string
): Promise<boolean> {
  if (!collection || !recordId) return false;
  try {
    const url = `${SUPABASE_PROJECT_URL}/rest/v1/${SUPABASE_TABLE}?collection=eq.${encodeURIComponent(
      collection
    )}&record_id=eq.${encodeURIComponent(String(recordId).trim())}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders({ Prefer: 'return=minimal' }),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}
