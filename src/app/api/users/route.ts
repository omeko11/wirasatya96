import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { AuthUser, UserRole } from '@/types';

export async function GET() {
  const users = serverStore.getUsers();
  return NextResponse.json({ success: true, count: users.length, data: users });
}

export async function POST(req: NextRequest) {
  try {
    const session = serverStore.getSession();
    if (session && session.role !== 'SUPERADMIN' && session.role !== 'SEKRETARIAT') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin (Superadmin) dan Kesekretariatan yang dapat menambahkan pengguna.' },
        { status: 403 }
      );
    }

    const body: Partial<AuthUser> & { satker?: string; polda?: string; password?: string } = await req.json();
    if (!body.nrp || !body.nama) {
      return NextResponse.json({ success: false, message: 'NRP dan Nama wajib diisi' }, { status: 400 });
    }

    const cleanNrp = body.nrp.trim();
    const newUser: AuthUser & { satker?: string; polda?: string; password?: string } = {
      id: 'u-' + cleanNrp,
      nrp: cleanNrp,
      nama: body.nama.trim(),
      pangkat: body.pangkat || 'Kombes Pol',
      email: body.email || `${cleanNrp}@wirasatya96.polri.go.id`,
      role: (body.role as UserRole) || 'ANGGOTA',
      profileId: 'ws-' + cleanNrp,
      mfaEnabled: true,
      mfaMethod: body.mfaMethod || 'PIN',
      satker: body.satker || 'Mabes Polri',
      polda: body.polda || 'Mabes Polri',
      password: body.password || undefined,
    };

    const created = serverStore.addUser(newUser);
    return NextResponse.json({
      success: true,
      message: `Pengguna ${created.nama} (NRP ${created.nrp}) berhasil ditambahkan.`,
      data: created,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal membuat akun pengguna', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = serverStore.getSession();
    if (session && session.role !== 'SUPERADMIN' && session.role !== 'SEKRETARIAT') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin dan Kesekretariatan yang dapat mengubah data pengguna.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nrp, ...updates } = body;
    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
    }

    const updated = serverStore.updateUser(nrp, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Data pengguna ${updated.nama} berhasil diperbarui.`,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui pengguna', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = serverStore.getSession();
    if (session && session.role !== 'SUPERADMIN' && session.role !== 'SEKRETARIAT') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin dan Kesekretariatan yang dapat menghapus pengguna.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const nrp = searchParams.get('nrp');
    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
    }

    const result = serverStore.deleteUser(nrp);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus pengguna', error }, { status: 500 });
  }
}
