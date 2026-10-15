import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { AuthUser } from '@/types';

export async function GET() {
  const users = serverStore.getUsers();
  return NextResponse.json({ success: true, count: users.length, data: users });
}

export async function POST(req: NextRequest) {
  try {
    const session = serverStore.getSession();
    if (session && session.role !== 'SUPERADMIN' && session.role !== 'SEKRETARIAT') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Kesekretariatan dan Superadmin yang dapat menambahkan akun.' },
        { status: 403 }
      );
    }

    const body: Partial<AuthUser> = await req.json();
    if (!body.nrp || !body.nama) {
      return NextResponse.json({ success: false, message: 'NRP dan Nama wajib diisi' }, { status: 400 });
    }

    const newUser: AuthUser = {
      id: 'u-' + (body.nrp || Date.now()),
      nrp: body.nrp,
      nama: body.nama,
      pangkat: body.pangkat || 'Kombes Pol',
      email: body.email || `${body.nrp}@wirasatya96.polri.go.id`,
      role: body.role || 'ANGGOTA',
      profileId: 'ws-' + body.nrp,
      mfaEnabled: true,
      mfaMethod: body.mfaMethod || 'PIN',
    };

    serverStore.addUser(newUser);
    return NextResponse.json({ success: true, message: 'Akun personel berhasil dibuat', data: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal membuat akun personel', error }, { status: 500 });
  }
}
