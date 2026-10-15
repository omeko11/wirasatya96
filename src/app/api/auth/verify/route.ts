import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

// POST /api/auth/verify - Superadmin/Sekretariat approves or rejects registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nrp, action, verifierName } = body;

    const targetId = id || nrp;
    if (!targetId || !action) {
      return NextResponse.json(
        { success: false, message: 'ID/NRP dan aksi (APPROVE / REJECT) wajib disertakan.' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { success: false, message: 'Aksi tidak valid. Pilih APPROVE atau REJECT.' },
        { status: 400 }
      );
    }

    const result = serverStore.verifyRegistration(
      targetId,
      action,
      verifierName || 'Superadmin WS96'
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses verifikasi', error },
      { status: 500 }
    );
  }
}
