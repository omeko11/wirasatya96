import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function POST() {
  serverStore.setSession(null);
  return NextResponse.json({ success: true, message: 'Berhasil logout' });
}
