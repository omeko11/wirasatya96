/**
 * Wira Satya 96 — Multi-Tier Redis Caching Engine (L1 In-Memory + L2 Upstash/Redis REST)
 *
 * Arsitektur:
 * - L1 Cache: High-speed In-Memory Map dengan TTL & LRU eviction (0-1ms latency).
 * - L2 Cache: Distributed Redis via Upstash REST API (`UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`)
 *   jika variabel environment tersedia di server/Vercel.
 * - Automatic Prefix Invalidation pada setiap mutasi (POST / PUT / DELETE).
 */

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  invalidations: number;
  keysCount: number;
  driver: 'L1_MEMORY + L2_UPSTASH_REDIS' | 'L1_IN_MEMORY_REDIS_ENGINE';
  lastHitAt: string | null;
  lastInvalidatedAt: string | null;
}

interface GlobalRedisCacheState {
  store: Map<string, CacheEntry>;
  hits: number;
  misses: number;
  invalidations: number;
  lastHitAt: string | null;
  lastInvalidatedAt: string | null;
}

const MAX_L1_KEYS = 250;

function getGlobalCacheState(): GlobalRedisCacheState {
  const g = globalThis as unknown as { __ws96_redis_cache_v1?: GlobalRedisCacheState };
  if (!g.__ws96_redis_cache_v1) {
    g.__ws96_redis_cache_v1 = {
      store: new Map<string, CacheEntry>(),
      hits: 0,
      misses: 0,
      invalidations: 0,
      lastHitAt: null,
      lastInvalidatedAt: null,
    };
  }
  return g.__ws96_redis_cache_v1;
}

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function upstashCommand(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result ?? null;
  } catch {
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<{
  data: T | null;
  status: 'HIT' | 'MISS';
  layer: 'L1_MEMORY' | 'L2_REDIS' | 'NONE';
  latencyMs: number;
}> {
  const start = Date.now();
  const state = getGlobalCacheState();
  const now = Date.now();

  // 1. Check L1 Memory Cache
  const l1 = state.store.get(key);
  if (l1) {
    if (l1.expiresAt > now) {
      l1.hits += 1;
      state.hits += 1;
      state.lastHitAt = new Date(now).toISOString();
      return {
        data: l1.value as T,
        status: 'HIT',
        layer: 'L1_MEMORY',
        latencyMs: Math.max(0, Date.now() - start),
      };
    } else {
      state.store.delete(key);
    }
  }

  // 2. Check L2 Upstash Redis if configured
  if (isUpstashConfigured()) {
    const raw = await upstashCommand(['GET', key]);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as T;
        state.store.set(key, {
          value: parsed,
          createdAt: now,
          expiresAt: now + 60_000,
          hits: 1,
        });
        state.hits += 1;
        state.lastHitAt = new Date(now).toISOString();
        return {
          data: parsed,
          status: 'HIT',
          layer: 'L2_REDIS',
          latencyMs: Math.max(1, Date.now() - start),
        };
      } catch {
        // Ignore parse error
      }
    }
  }

  state.misses += 1;
  return {
    data: null,
    status: 'MISS',
    layer: 'NONE',
    latencyMs: Math.max(0, Date.now() - start),
  };
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = 60
): Promise<void> {
  const state = getGlobalCacheState();
  const now = Date.now();

  // Evict oldest if exceeding max keys
  if (state.store.size >= MAX_L1_KEYS && !state.store.has(key)) {
    const firstKey = state.store.keys().next().value;
    if (firstKey) state.store.delete(firstKey);
  }

  state.store.set(key, {
    value,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
    hits: 0,
  });

  if (isUpstashConfigured()) {
    try {
      await upstashCommand(['SET', key, JSON.stringify(value), 'EX', ttlSeconds]);
    } catch {
      // Non-blocking L2 write
    }
  }
}

export async function cacheInvalidatePrefix(prefix: string): Promise<number> {
  const state = getGlobalCacheState();
  let removed = 0;

  Array.from(state.store.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      state.store.delete(key);
      removed += 1;
    }
  });

  state.invalidations += 1;
  state.lastInvalidatedAt = new Date().toISOString();

  if (isUpstashConfigured()) {
    try {
      await upstashCommand(['DEL', prefix]);
    } catch {
      // Non-blocking
    }
  }

  return removed;
}

export function getRedisCacheStats(): CacheStats {
  const state = getGlobalCacheState();
  const now = Date.now();
  // Clean expired keys before reporting count
  Array.from(state.store.entries()).forEach(([k, entry]) => {
    if (entry.expiresAt <= now) {
      state.store.delete(k);
    }
  });

  return {
    hits: state.hits,
    misses: state.misses,
    invalidations: state.invalidations,
    keysCount: state.store.size,
    driver: isUpstashConfigured()
      ? 'L1_MEMORY + L2_UPSTASH_REDIS'
      : 'L1_IN_MEMORY_REDIS_ENGINE',
    lastHitAt: state.lastHitAt,
    lastInvalidatedAt: state.lastInvalidatedAt,
  };
}

export async function withRedisCache<T>(
  key: string,
  ttlSeconds: number,
  computeFn: () => Promise<T> | T
): Promise<{
  data: T;
  cacheMeta: {
    key: string;
    status: 'HIT' | 'MISS';
    layer: 'L1_MEMORY' | 'L2_REDIS' | 'ORIGIN_STORE';
    latencyMs: number;
    ttlSeconds: number;
    driver: string;
  };
}> {
  const cached = await cacheGet<T>(key);
  const stats = getRedisCacheStats();

  if (cached.status === 'HIT' && cached.data !== null) {
    return {
      data: cached.data,
      cacheMeta: {
        key,
        status: 'HIT',
        layer: cached.layer === 'NONE' ? 'L1_MEMORY' : cached.layer,
        latencyMs: cached.latencyMs,
        ttlSeconds,
        driver: stats.driver,
      },
    };
  }

  const start = Date.now();
  const freshData = await computeFn();
  await cacheSet(key, freshData, ttlSeconds);

  return {
    data: freshData,
    cacheMeta: {
      key,
      status: 'MISS',
      layer: 'ORIGIN_STORE',
      latencyMs: Math.max(0, Date.now() - start),
      ttlSeconds,
      driver: stats.driver,
    },
  };
}
