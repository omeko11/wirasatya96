import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nrp, userId, mfaMethod } = body;

    const identifier = userId || nrp;
    if (!identifier) {
      return NextResponse.json({ success: false, message: 'NRP atau ID Akun diperlukan' }, { status: 400 });
    }

    const user = serverStore.authenticate(identifier);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Akun personel tidak ditemukan' }, { status: 404 });
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
