import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

// POST /api/auth/set-password - First-time password setup after Superadmin approval
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nrp, password, mfaMethod } = body;

    if (!nrp || !password) {
      return NextResponse.json(
        { success: false, message: 'NRP dan kata sandi baru diperlukan.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal harus terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const result = serverStore.setPassword(nrp, password, mfaMethod || 'PIN');

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil disimpan. Akun Anda telah aktif!',
      user: result.user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menetapkan kata sandi', error },
      { status: 500 }
    );
  }
}
