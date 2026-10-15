import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nrp, userId, username, identifier, mfaMethod } = body;

    const targetId = identifier || username || userId || nrp;
    if (!targetId) {
      return NextResponse.json({ success: false, message: 'NRP atau Email dinas diperlukan' }, { status: 400 });
    }

    const user = serverStore.authenticate(targetId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Personel alumni tidak terdaftar di sistem' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Login berhasil sebagai ${user.nama} (${user.role})`,
      user,
      mfaVerified: !!mfaMethod,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server saat login', error }, { status: 500 });
  }
}
