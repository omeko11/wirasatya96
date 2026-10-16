import { AnggotaWiraSatya, AuthUser } from '@/types';

export const DEFAULT_AVATAR_URL = '/default-avatar.png';
export const DEFAULT_COVER_URL = '/default-cover.jpg';

/**
 * Ensures any empty or legacy dummy Unsplash avatar URL is replaced with the official Polri default avatar.
 */
export function getAvatarUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return DEFAULT_AVATAR_URL;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('images.unsplash.com')) {
    return DEFAULT_AVATAR_URL;
  }
  return trimmed;
}

/**
 * Ensures any empty or legacy dummy Unsplash cover URL is replaced with the official Polri default cover.
 */
export function getCoverUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return DEFAULT_COVER_URL;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('images.unsplash.com')) {
    return DEFAULT_COVER_URL;
  }
  return trimmed;
}

export function isCustomAvatarUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.length > 0 &&
    trimmed !== DEFAULT_AVATAR_URL &&
    !trimmed.includes('images.unsplash.com')
  );
}

/**
 * Picks the custom (non-default) avatar URL between two sources, falling back to DEFAULT_AVATAR_URL.
 */
export function resolveAvatarUrl(
  primaryUrl?: string | null,
  secondaryUrl?: string | null
): string {
  if (isCustomAvatarUrl(primaryUrl)) return primaryUrl!.trim();
  if (isCustomAvatarUrl(secondaryUrl)) return secondaryUrl!.trim();
  return DEFAULT_AVATAR_URL;
}

/**
 * Formats a member's rank and full name without duplicating the rank prefix
 * (e.g., avoids "Kombes Pol Kombes Pol. Daniel...").
 */
export function formatMemberDisplayName(
  pangkat?: string | null,
  namaLengkap?: string | null
): string {
  const cleanName = (namaLengkap || '').replace(/\(.*?\)/g, '').trim();
  const cleanRank = (pangkat || '').trim();
  if (!cleanRank) return cleanName;
  if (!cleanName) return cleanRank;

  const normName = cleanName.toLowerCase().replace(/\./g, '');
  const normRank = cleanRank.toLowerCase().replace(/\./g, '');
  if (normName.startsWith(normRank)) {
    return cleanName;
  }
  return `${cleanRank} ${cleanName}`;
}

/**
 * Strips any redundant " — <Satker>" suffix from a Jabatan string so the Jabatan field
 * only stores the organizational position title (e.g. "Lead Developer").
 */
export function cleanJabatanOnly(jabatan?: string | null): string {
  if (!jabatan || typeof jabatan !== 'string') return '';
  return jabatan.split(' — ')[0].trim();
}

/**
 * Combines a member's Jabatan Organisasi Polri and Satuan Kerja cleanly without duplicating Satker.
 */
export function formatJabatanWithSatker(
  jabatan?: string | null,
  satker?: string | null
): string {
  const cleanJab = cleanJabatanOnly(jabatan);
  const cleanSat = (satker || '').trim();
  if (!cleanJab && !cleanSat) return 'Mabes Polri';
  if (!cleanJab) return cleanSat;
  if (!cleanSat) return cleanJab;
  if (cleanJab.toLowerCase().includes(cleanSat.toLowerCase())) {
    return cleanJab;
  }
  return `${cleanJab} — ${cleanSat}`;
}

/**
 * Finds the current user's profile in the directory or constructs a valid profile object from AuthUser
 * so that "Lihat Profil" always works and preserves any custom uploaded photo/cover.
 */
export function getOrBuildUserProfile(
  currentUser: AuthUser,
  members: AnggotaWiraSatya[]
): AnggotaWiraSatya {
  const existing = members.find((m) => m.nrp === currentUser.nrp);
  if (existing) {
    return {
      ...existing,
      jabatanTerakhir: cleanJabatanOnly(existing.jabatanTerakhir) || existing.jabatanTerakhir,
      fotoUrl: resolveAvatarUrl(existing.fotoUrl, currentUser.fotoUrl),
      coverUrl:
        existing.coverUrl && existing.coverUrl !== DEFAULT_COVER_URL
          ? existing.coverUrl
          : currentUser.coverUrl || existing.coverUrl,
    };
  }

  return {
    id: currentUser.profileId || `ws-${currentUser.nrp}`,
    nrp: currentUser.nrp,
    namaLengkap: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
    pangkat: currentUser.pangkat || 'Kombes Pol',
    jabatanTerakhir:
      currentUser.role === 'SUPERADMIN'
        ? 'Lead Developer'
        : `Perwira ${currentUser.satker || 'Polri'}`,
    satuanKerja: currentUser.satker || 'Mabes Polri',
    tipeSatker:
      !currentUser.polda || currentUser.polda.toUpperCase().includes('MABES')
        ? 'MABES'
        : 'POLDA',
    satkerMabes: 'BARESKRIM POLRI',
    subSatker: currentUser.satker || '',
    jenisAnggota: 'ANGGOTA POLRI',
    polda: currentUser.polda || 'MABES POLRI',
    pendidikanTerakhir:
      currentUser.nrp === '98010710' || currentUser.role === 'SUPERADMIN'
        ? 'S1 Teknik Informatika'
        : 'Akpol / Perguruan Tinggi Ilmu Kepolisian',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1974-01-01',
    usia: 52,
    jenisKelamin: 'LAKI-LAKI',
    noHp: '',
    email: currentUser.email || `${currentUser.nrp}@polri.go.id`,
    fotoUrl: resolveAvatarUrl(currentUser.fotoUrl),
    coverUrl: currentUser.coverUrl,
    alamatTempatTinggal: currentUser.polda || 'Jakarta',
    statusTempatTinggal: 'MILIK PRIBADI',
    statusPerkawinan: 'MENIKAH',
    namaIstri: '',
    jumlahAnak: 0,
    daftarAnak: [],
    tahunPurnaTugas: 2032,
    sisaTahunDinas: 6,
    alamatPurnaTugas: currentUser.polda || 'Jakarta',
    statusRumahPurnaTugas: 'MILIK PRIBADI',
    sudahPembekalan: 'SUDAH',
    rencanaAktivitas: ['USAHA SENDIRI'],
    sumberPenghasilanPasca: ['DANA PENSIUN'],
    kecukupanDanaPensiun: 'CUKUP',
    kesiapanPensiun: 'SIAP',
    perasaanPensiun: 'OPTIMIS',
    dukunganKeluarga: 'SANGAT MENDUKUNG',
    adaPenyakitKronis: 'TIDAK ADA',
    kondisiKesehatan: 'SANGAT BAIK',
    daftarPenyakit: [],
    asuransiAktif: ['BPJS'],
    rutinMcu: 'YA',
    mcuTerakhir: '< 6 BULAN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
