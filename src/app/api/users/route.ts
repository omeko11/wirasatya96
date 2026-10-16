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

    const body: Partial<AuthUser> & {
      satker?: string;
      polda?: string;
      password?: string;
      noHp?: string;
      secondaryEmail?: string;
    } = await req.json();
    if (!body.nrp || !body.nama) {
      return NextResponse.json({ success: false, message: 'NRP dan Nama wajib diisi' }, { status: 400 });
    }

    const cleanNrp = body.nrp.trim();
    const newUser: AuthUser & {
      satker?: string;
      polda?: string;
      password?: string;
      noHp?: string;
      secondaryEmail?: string;
    } = {
      id: 'u-' + cleanNrp,
      nrp: cleanNrp,
      nama: body.nama.trim(),
      pangkat: body.pangkat || 'Kombes Pol',
      email: body.email?.trim() || `${cleanNrp}@polri.go.id`,
      secondaryEmail: body.secondaryEmail ? body.secondaryEmail.trim() : undefined,
      role: (body.role as UserRole) || 'ANGGOTA',
      profileId: 'ws-' + cleanNrp,
      mfaEnabled: body.mfaEnabled ?? false,
      mfaMethod: body.mfaMethod || 'PIN',
      satker: body.satker || 'Mabes Polri',
      polda: body.polda || 'MABES POLRI',
      password: body.password || undefined,
      noHp: body.noHp || '',
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
    const body = await req.json();
    const { nrp, ...updates } = body;
    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
    }

    const session = serverStore.getSession();
    const isAdminOrSekretariat = !session || session.role === 'SUPERADMIN' || session.role === 'SEKRETARIAT';
    const isSelfSecurityUpdate =
      session &&
      session.nrp === nrp &&
      updates.role === undefined;

    if (!isAdminOrSekretariat && !isSelfSecurityUpdate) {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin dan Kesekretariatan yang dapat mengubah role atau data pengguna lain.' },
        { status: 403 }
      );
    }

    const targetNrpForEmail = String(updates.newNrp || nrp).trim();
    if (updates.email !== undefined && typeof updates.email === 'string') {
      updates.email = updates.email.trim() || `${targetNrpForEmail}@polri.go.id`;
    }
    if (updates.secondaryEmail !== undefined && typeof updates.secondaryEmail === 'string') {
      updates.secondaryEmail = updates.secondaryEmail.trim();
    }

    const updated = serverStore.updateUser(nrp, updates);
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message:
            updates.newNrp && updates.newNrp !== nrp
              ? `Gagal mengubah NRP ke ${updates.newNrp}: NRP baru sudah digunakan atau pengguna tidak ditemukan.`
              : 'Pengguna tidak ditemukan',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Data pengguna ${updated.nama} (NRP ${updated.nrp}) berhasil diperbarui.`,
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
