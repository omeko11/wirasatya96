import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { withRedisCache, cacheInvalidatePrefix } from '@/lib/redisCache';
import { AuthUser, UserRole } from '@/types';

export async function GET() {
  const { data: users, cacheMeta } = await withRedisCache<AuthUser[]>(
    'ws96:users:all',
    90,
    () => serverStore.getUsers()
  );

  return NextResponse.json(
    {
      success: true,
      count: users.length,
      data: users,
      users,
      deletedNrps: serverStore.getDeletedNrps(),
      cache: cacheMeta,
    },
    {
      headers: {
        'X-WS96-Cache': cacheMeta.status,
        'X-WS96-Cache-Layer': cacheMeta.layer,
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<AuthUser> & {
      satker?: string;
      polda?: string;
      password?: string;
      noHp?: string;
      secondaryEmail?: string;
      actorRole?: string;
    } = await req.json();

    const callerRole = req.headers.get('x-ws96-role') || body.actorRole || 'SUPERADMIN';
    if (callerRole && callerRole !== 'SUPERADMIN' && callerRole !== 'SEKRETARIAT') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin (Superadmin) dan Sekretaris yang dapat menambahkan pengguna.' },
        { status: 403 }
      );
    }

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
      jabatanTerakhir: body.jabatanTerakhir,
      tanggalLahir: body.tanggalLahir,
      password: body.password || undefined,
      status: body.password ? 'AKTIF' : body.status || 'DISETUJUI_BELUM_PASSWORD',
      noHp: body.noHp || '',
    };

    const created = serverStore.addUser(newUser);
    await cacheInvalidatePrefix('ws96:users:');
    await cacheInvalidatePrefix('ws96:members:');
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
    const { nrp, actorRole: _ignoredActorRole, ...updates } = body;
    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
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
              : 'Pengguna tidak ditemukan atau telah dihapus',
        },
        { status: 400 }
      );
    }

    await cacheInvalidatePrefix('ws96:users:');
    await cacheInvalidatePrefix('ws96:members:');
    await cacheInvalidatePrefix('ws96:finance:');
    await cacheInvalidatePrefix('ws96:posts:');

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
    const { searchParams } = new URL(req.url);
    const nrp = searchParams.get('nrp');
    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
    }

    const result = serverStore.deleteUser(nrp);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    await cacheInvalidatePrefix('ws96:users:');
    await cacheInvalidatePrefix('ws96:members:');
    await cacheInvalidatePrefix('ws96:finance:');
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus pengguna', error }, { status: 500 });
  }
}
