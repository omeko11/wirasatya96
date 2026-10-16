import { NextRequest, NextResponse } from 'next/server';
import { getRedisCacheStats, cacheInvalidatePrefix } from '@/lib/redisCache';

export async function GET() {
  const stats = getRedisCacheStats();
  return NextResponse.json({
    success: true,
    stats,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prefix = typeof body?.prefix === 'string' ? body.prefix : 'ws96:';
    const removed = await cacheInvalidatePrefix(prefix);
    const stats = getRedisCacheStats();
    return NextResponse.json({
      success: true,
      message: `Cache Redis berhasil di-flush (${removed} key dibersihkan).`,
      removed,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membersihkan cache Redis', error: String(error) },
      { status: 500 }
    );
  }
}
