import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { withRedisCache, cacheInvalidatePrefix } from '@/lib/redisCache';
import { stripRankFromName } from '@/lib/avatarUtils';
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
      auditLogs: serverStore.getAuditLogs(),
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
      action?: string;
      snapshotUser?: AuthUser;
      satker?: string;
      polda?: string;
      password?: string;
      noHp?: string;
      secondaryEmail?: string;
      actorRole?: string;
      actorNrp?: string;
      actorName?: string;
    } = await req.json();

    const callerRole = (req.headers.get('x-ws96-role') || body.actorRole || 'SUPERADMIN') as UserRole;
    if (callerRole && callerRole !== 'SUPERADMIN' && callerRole !== 'SEKRETARIAT' && callerRole !== 'KETUA') {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses Ditolak: Hanya Superadmin, Ketua Angkatan, dan Sekretaris yang dapat mengelola pengguna.',
        },
        { status: 403 }
      );
    }

    if (body.action === 'RESTORE_USER' && body.snapshotUser) {
      const restored = serverStore.restoreDeletedUser(body.snapshotUser, {
        actorNrp: body.actorNrp,
        actorName: body.actorName,
        actorRole: callerRole,
      });
      if (!restored.success) {
        return NextResponse.json(restored, { status: 400 });
      }
      await cacheInvalidatePrefix('ws96:users:');
      await cacheInvalidatePrefix('ws96:members:');
      await cacheInvalidatePrefix('ws96:finance:');
      return NextResponse.json({
        ...restored,
        auditLogs: serverStore.getAuditLogs(),
      });
    }

    if (!body.nrp || !body.nama) {
      return NextResponse.json({ success: false, message: 'NRP dan Nama wajib diisi' }, { status: 400 });
    }

    const cleanNrp = body.nrp.trim();
    const cleanNama = stripRankFromName(body.nama.trim()) || body.nama.trim();
    const newUser: AuthUser & {
      satker?: string;
      polda?: string;
      password?: string;
      noHp?: string;
      secondaryEmail?: string;
    } = {
      id: 'u-' + cleanNrp,
      nrp: cleanNrp,
      nama: cleanNama,
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
    serverStore.addAuditLog({
      action: 'TAMBAH_USER',
      actorNrp: body.actorNrp || '98010710',
      actorName: body.actorName || 'Admin / Sekretaris',
      actorRole: callerRole,
      targetNrp: created.nrp,
      targetName: created.nama,
      targetPangkat: created.pangkat,
      targetRole: created.role,
      details: `Menambahkan pengguna baru pada satker ${created.satker || 'Mabes Polri'} (${created.polda || 'MABES POLRI'})`,
    });

    await cacheInvalidatePrefix('ws96:users:');
    await cacheInvalidatePrefix('ws96:members:');
    return NextResponse.json({
      success: true,
      message: `Pengguna ${created.nama} (NRP ${created.nrp}) berhasil ditambahkan.`,
      data: created,
      auditLogs: serverStore.getAuditLogs(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal membuat akun pengguna', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nrp,
      actorRole,
      actorNrp,
      actorName,
      ...updates
    } = body;
    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
    }

    if (updates.nama && typeof updates.nama === 'string') {
      updates.nama = stripRankFromName(updates.nama.trim()) || updates.nama.trim();
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

    const isRoleOnlyUpdate =
      updates.role !== undefined &&
      updates.nama === undefined &&
      updates.newNrp === undefined &&
      updates.jabatanTerakhir === undefined;

    serverStore.addAuditLog({
      action: isRoleOnlyUpdate ? 'UBAH_ROLE' : 'EDIT_USER',
      actorNrp: actorNrp || '98010710',
      actorName: actorName || 'Admin / Sekretaris',
      actorRole: (actorRole as UserRole) || 'SUPERADMIN',
      targetNrp: updated.nrp,
      targetName: updated.nama,
      targetPangkat: updated.pangkat,
      targetRole: updated.role,
      details: isRoleOnlyUpdate
        ? `Mengubah role akses menjadi ${updated.role}`
        : `Memperbarui data pengguna (${updated.pangkat} • ${updated.jabatanTerakhir || updated.satker || 'Mabes Polri'}${
            updates.newNrp && updates.newNrp !== nrp ? ` • NRP ${nrp} → ${updates.newNrp}` : ''
          })`,
    });

    await cacheInvalidatePrefix('ws96:users:');
    await cacheInvalidatePrefix('ws96:members:');
    await cacheInvalidatePrefix('ws96:finance:');
    await cacheInvalidatePrefix('ws96:posts:');

    return NextResponse.json({
      success: true,
      message: `Data pengguna ${updated.nama} (NRP ${updated.nrp}) berhasil diperbarui.`,
      data: updated,
      auditLogs: serverStore.getAuditLogs(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui pengguna', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let nrp = searchParams.get('nrp');
    let actorNrp = searchParams.get('actorNrp') || undefined;
    let actorName = searchParams.get('actorName') || undefined;
    let actorRole = (searchParams.get('actorRole') as UserRole) || undefined;
    let reason = searchParams.get('reason') || undefined;

    try {
      const body = await req.json();
      if (body) {
        if (!nrp && body.nrp) nrp = body.nrp;
        if (body.actorNrp) actorNrp = body.actorNrp;
        if (body.actorName) actorName = body.actorName;
        if (body.actorRole) actorRole = body.actorRole;
        if (body.reason) reason = body.reason;
      }
    } catch {
      // Optional JSON body
    }

    if (!nrp) {
      return NextResponse.json({ success: false, message: 'NRP wajib disertakan' }, { status: 400 });
    }

    const result = serverStore.deleteUser(nrp, {
      actorNrp,
      actorName,
      actorRole,
      reason,
    });
    if (!result.success) {
      return NextResponse.json(result, { status: 403 });
    }

    await cacheInvalidatePrefix('ws96:users:');
    await cacheInvalidatePrefix('ws96:members:');
    await cacheInvalidatePrefix('ws96:finance:');
    return NextResponse.json({
      ...result,
      auditLogs: serverStore.getAuditLogs(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus pengguna', error }, { status: 500 });
  }
}

