import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

// GET /api/auth/register - List registrations (for Superadmin/Sekretariat)
export async function GET() {
  try {
    await serverStore.ensureSynced();
    const registrations = serverStore.getRegistrations();
    return NextResponse.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pendaftaran', error },
      { status: 500 }
    );
  }
}

// POST /api/auth/register - Register new alumnus account
export async function POST(req: NextRequest) {
  try {
    await serverStore.ensureSynced();
    const body = await req.json();
    const { nrp, nama, pangkat, satker, polda, noHp, email, secondaryEmail, alasanDaftar } = body;

    if (!nrp || !nama || !satker || !polda) {
      return NextResponse.json(
        { success: false, message: 'NRP, Nama Lengkap, Satker, dan Polda wajib diisi.' },
        { status: 400 }
      );
    }

    const result = serverStore.registerUser({
      nrp: nrp.trim(),
      nama: nama.trim(),
      pangkat: pangkat || 'Kombes Pol',
      satker: satker.trim(),
      polda: polda || 'MABES POLRI',
      noHp: noHp ? noHp.trim() : '-',
      email: email ? email.trim() : `${nrp.trim()}@polri.go.id`,
      secondaryEmail: secondaryEmail ? secondaryEmail.trim() : undefined,
      alasanDaftar,
    });

    await serverStore.flushCloud();

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses pendaftaran', error },
      { status: 500 }
    );
  }
}
