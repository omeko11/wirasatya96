'use client';

/**
 * Wira Satya 96 — Offline-First Synchronization Engine & HTTP Cache Interceptor
 *
 * Fitur:
 * 1. Deteksi otomatis jaringan (`online` / `offline`) + Mode Simulasi Offline untuk pengujian.
 * 2. Outbox Queue Persisten (`ws96_offline_outbox_v1`) untuk semua operasi tulis (`POST`, `PUT`, `DELETE`)
 *    ke `/api/members`, `/api/users`, `/api/finance`, `/api/posts`, `/api/messages`.
 * 3. Snapshot Read Cache (`ws96_offline_http_cache_v1`) untuk melayani `GET /api/*` saat internet terputus.
 * 4. Rekonsiliasi & Sinkronisasi Otomatis (FIFO Replay) begitu kembali Online + flush Redis Cache.
 */

export interface OfflineOutboxItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: string | null;
  label: string;
  createdAt: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  lastError?: string;
}

export interface OfflineSyncState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  outbox: OfflineOutboxItem[];
  lastSyncedAt: string | null;
  lastSyncCount: number;
  redisCacheHitRate: string;
  redisDriver: string;
  lastCacheStatus: 'HIT' | 'MISS' | 'OFFLINE_SNAPSHOT';
}

const OUTBOX_STORAGE_KEY = 'ws96_offline_outbox_v1';
const HTTP_SNAPSHOT_KEY = 'ws96_offline_http_cache_v1';
const SIMULATED_OFFLINE_KEY = 'ws96_simulated_offline_v1';
const LAST_SYNCED_KEY = 'ws96_last_synced_at_v1';

let isInterceptorInstalled = false;
let nativeFetch: typeof window.fetch | null = null;
let isFlushingQueue = false;

function describeEndpointAction(endpoint: string, method: string, rawBody: string | null): string {
  try {
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    if (endpoint.includes('/api/members')) {
      return `Simpan Profil: ${parsed.namaLengkap || parsed.nrp || 'Personel'}`;
    }
    if (endpoint.includes('/api/users')) {
      if (method === 'DELETE') return `Hapus User (${endpoint.split('nrp=')[1] || ''})`;
      return `Update Akun User: ${parsed.nama || parsed.nrp || 'Pengguna'}`;
    }
    if (endpoint.includes('/api/finance')) {
      if (parsed.action === 'UPDATE_FINANCE_CONFIG') {
        return `Update Tarif Iuran Wajib (Rp ${Number(parsed.iuranWajibPerBulan || 0).toLocaleString('id-ID')})`;
      }
      if (parsed.action === 'PAY_IURAN') {
        return `Bayar Iuran NRP ${parsed.nrp}`;
      }
      if (parsed.action === 'ADD_ASSET') {
        return `Tambah Aset: ${parsed.namaAset}`;
      }
      return `Mutasi Kas ${parsed.jenis || ''}: Rp ${Number(parsed.nominal || 0).toLocaleString('id-ID')}`;
    }
    if (endpoint.includes('/api/posts')) {
      if (parsed.action === 'LIKE') return 'Suka Postingan Beranda';
      if (parsed.action === 'COMMENT') return 'Komentar Postingan Beranda';
      return 'Buat Postingan Baru di Beranda';
    }
    if (endpoint.includes('/api/messages')) {
      return `Kirim Pesan ke NRP ${parsed.receiverNrp || ''}`;
    }
  } catch {
    // Fallback
  }
  return `${method} ${endpoint}`;
}

export function getOutboxQueue(): OfflineOutboxItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOutboxQueue(queue: OfflineOutboxItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('ws96_offline_state_changed'));
  } catch {
    // Ignore storage quota errors
  }
}

export function isSimulatedOfflineActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
}

export function setSimulatedOfflineActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  if (active) {
    localStorage.setItem(SIMULATED_OFFLINE_KEY, 'true');
  } else {
    localStorage.removeItem(SIMULATED_OFFLINE_KEY);
  }
  window.dispatchEvent(new CustomEvent('ws96_offline_state_changed'));
  if (!active && navigator.onLine) {
    void flushOfflineOutboxQueue();
  }
}

export function isEffectivelyOnline(): boolean {
  if (typeof window === 'undefined') return true;
  if (isSimulatedOfflineActive()) return false;
  return navigator.onLine;
}

function saveHttpSnapshot(url: string, payload: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanKey = url.split('?')[0];
    const raw = localStorage.getItem(HTTP_SNAPSHOT_KEY);
    const map: Record<string, { updatedAt: string; payload: unknown }> = raw ? JSON.parse(raw) : {};
    map[cleanKey] = {
      updatedAt: new Date().toISOString(),
      payload,
    };
    localStorage.setItem(HTTP_SNAPSHOT_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors for large snapshots
  }
}

function readHttpSnapshot(url: string): unknown | null {
  if (typeof window === 'undefined') return null;
  try {
    const cleanKey = url.split('?')[0];
    const raw = localStorage.getItem(HTTP_SNAPSHOT_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map?.[cleanKey]?.payload ?? null;
  } catch {
    return null;
  }
}

export function enqueueOfflineMutation(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body: string | null
): OfflineOutboxItem {
  const queue = getOutboxQueue();
  const item: OfflineOutboxItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    endpoint,
    method,
    body,
    label: describeEndpointAction(endpoint, method, body),
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'PENDING',
  };
  queue.push(item);
  saveOutboxQueue(queue);
  return item;
}

export function clearOfflineOutboxQueue(): void {
  saveOutboxQueue([]);
}

export async function flushOfflineOutboxQueue(): Promise<{
  syncedCount: number;
  remainingCount: number;
}> {
  if (typeof window === 'undefined' || isFlushingQueue) {
    return { syncedCount: 0, remainingCount: getOutboxQueue().length };
  }
  if (!isEffectivelyOnline()) {
    return { syncedCount: 0, remainingCount: getOutboxQueue().length };
  }

  const queue = getOutboxQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, remainingCount: 0 };
  }

  isFlushingQueue = true;
  window.dispatchEvent(new CustomEvent('ws96_offline_sync_started'));

  const fetchFn = nativeFetch || window.fetch.bind(window);
  const remaining: OfflineOutboxItem[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      const res = await fetchFn(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'X-WS96-Offline-Replay': 'true',
        },
        body: item.body ?? undefined,
      });

      if (res.ok || (res.status >= 400 && res.status < 500)) {
        // 2xx succeeded; 4xx validation error shouldn't block queue forever
        syncedCount += 1;
      } else {
        remaining.push({
          ...item,
          retryCount: item.retryCount + 1,
          status: 'FAILED',
          lastError: `HTTP ${res.status}`,
        });
      }
    } catch (err) {
      remaining.push({
        ...item,
        retryCount: item.retryCount + 1,
        status: 'FAILED',
        lastError: err instanceof Error ? err.message : 'Network error',
      });
    }
  }

  saveOutboxQueue(remaining);

  if (syncedCount > 0) {
    const nowIso = new Date().toISOString();
    localStorage.setItem(LAST_SYNCED_KEY, nowIso);
    try {
      await fetchFn('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: 'ws96:' }),
      });
    } catch {
      // Ignore
    }
    window.dispatchEvent(
      new CustomEvent('ws96_offline_sync_completed', {
        detail: { syncedCount, remainingCount: remaining.length, syncedAt: nowIso },
      })
    );
  }

  isFlushingQueue = false;
  window.dispatchEvent(new CustomEvent('ws96_offline_state_changed'));
  return { syncedCount, remainingCount: remaining.length };
}

export function installOfflineSyncInterceptor(): void {
  if (typeof window === 'undefined' || isInterceptorInstalled) return;
  isInterceptorInstalled = true;
  nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || 'GET').toUpperCase();
    const isApiCall = url.startsWith('/api/') || url.includes('/api/');
    const isCacheOrAuthCall = url.includes('/api/auth/login') || url.includes('/api/cache');

    if (!isApiCall || isCacheOrAuthCall) {
      return nativeFetch!(input, init);
    }

    const online = isEffectivelyOnline();

    // Handle Write Operations (POST / PUT / DELETE) when Offline
    if (!online && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      const rawBody = typeof init?.body === 'string' ? init.body : null;
      const queued = enqueueOfflineMutation(url, method as 'POST' | 'PUT' | 'DELETE', rawBody);
      let parsedBody: Record<string, unknown> = {};
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        parsedBody = {};
      }

      const syntheticPayload = {
        success: true,
        offlineQueued: true,
        queueId: queued.id,
        message: 'Disimpan ke Mode Offline — otomatis disinkronkan saat koneksi kembali.',
        data: parsedBody,
        post: parsedBody,
      };

      return new Response(JSON.stringify(syntheticPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-WS96-Offline-Queued': 'true',
        },
      });
    }

    // Handle GET when Simulated Offline
    if (!online && method === 'GET') {
      const snapshot = readHttpSnapshot(url);
      if (snapshot) {
        return new Response(JSON.stringify(snapshot), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-WS96-Cache': 'OFFLINE_SNAPSHOT',
          },
        });
      }
    }

    // Online path: try native fetch, fallback to offline queue/snapshot on network failure
    try {
      const response = await nativeFetch!(input, init);

      if (method === 'GET' && response.ok) {
        const clone = response.clone();
        clone
          .json()
          .then((json) => {
            saveHttpSnapshot(url, json);
            const cacheHeader = response.headers.get('X-WS96-Cache');
            if (cacheHeader) {
              window.dispatchEvent(
                new CustomEvent('ws96_cache_telemetry', {
                  detail: {
                    status: cacheHeader,
                    layer: response.headers.get('X-WS96-Cache-Layer') || 'L1_MEMORY',
                    url,
                  },
                })
              );
            }
          })
          .catch(() => {});
      }

      return response;
    } catch (networkError) {
      // Network failed unexpectedly during write -> queue in outbox
      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        const rawBody = typeof init?.body === 'string' ? init.body : null;
        const queued = enqueueOfflineMutation(url, method as 'POST' | 'PUT' | 'DELETE', rawBody);
        let parsedBody: Record<string, unknown> = {};
        try {
          parsedBody = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          parsedBody = {};
        }
        return new Response(
          JSON.stringify({
            success: true,
            offlineQueued: true,
            queueId: queued.id,
            message: 'Jaringan terputus: Perubahan masuk antrean Mode Offline & akan disinkronkan otomatis.',
            data: parsedBody,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-WS96-Offline-Queued': 'true',
            },
          }
        );
      }

      if (method === 'GET') {
        const snapshot = readHttpSnapshot(url);
        if (snapshot) {
          return new Response(JSON.stringify(snapshot), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-WS96-Cache': 'OFFLINE_SNAPSHOT',
            },
          });
        }
      }

      throw networkError;
    }
  };

  window.addEventListener('online', () => {
    window.dispatchEvent(new CustomEvent('ws96_offline_state_changed'));
    void flushOfflineOutboxQueue();
  });

  window.addEventListener('offline', () => {
    window.dispatchEvent(new CustomEvent('ws96_offline_state_changed'));
  });
}

export function getLastSyncedAt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNCED_KEY);
}
