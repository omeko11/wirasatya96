import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { AnggotaWiraSatya } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const polda = searchParams.get('polda');
  const search = searchParams.get('q')?.toLowerCase();

  let members = serverStore.getMembers();

  if (polda && polda !== 'SEMUA') {
    members = members.filter((m) => m.polda.toUpperCase() === polda.toUpperCase());
  }

  if (search) {
    members = members.filter(
      (m) =>
        m.namaLengkap.toLowerCase().includes(search) ||
        m.nrp.includes(search) ||
        m.jabatanTerakhir.toLowerCase().includes(search) ||
        m.satuanKerja.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ success: true, count: members.length, data: members, members });
}

export async function POST(req: NextRequest) {
  try {
    const session = serverStore.getSession();
    if (session && session.role !== 'SUPERADMIN' && session.role !== 'SEKRETARIAT') {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin (Superadmin) dan Kesekretariatan yang dapat menambahkan anggota baru.' },
        { status: 403 }
      );
    }

    const member: AnggotaWiraSatya = await req.json();
    if (!member.nrp || !member.namaLengkap) {
      return NextResponse.json({ success: false, message: 'NRP dan Nama Lengkap wajib diisi' }, { status: 400 });
    }

    const saved = serverStore.saveMember(member);
    return NextResponse.json({ success: true, message: 'Data anggota berhasil disimpan', data: saved });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data anggota', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const member: AnggotaWiraSatya = await req.json();
    const session = serverStore.getSession();

    // Role check: Only SUPERADMIN and SEKRETARIAT can edit other members' profiles; other roles can only edit their own NRP
    if (session && !['SUPERADMIN', 'SEKRETARIAT'].includes(session.role) && session.nrp !== member.nrp) {
      return NextResponse.json(
        { success: false, message: 'Akses Ditolak: Hanya Admin dan Kesekretariatan yang berwenang memperbarui profil anggota lain.' },
        { status: 403 }
      );
    }

    const saved = serverStore.saveMember(member);
    return NextResponse.json({ success: true, message: 'Data anggota berhasil diperbarui', data: saved });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui data anggota', error }, { status: 500 });
  }
}
