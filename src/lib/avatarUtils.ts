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

/**
 * Finds the current user's profile in the directory or constructs a valid profile object from AuthUser
 * so that "Lihat Profil" always works even when the directory is empty.
 */
export function getOrBuildUserProfile(
  currentUser: AuthUser,
  members: AnggotaWiraSatya[]
): AnggotaWiraSatya {
  const existing = members.find((m) => m.nrp === currentUser.nrp);
  if (existing) {
    return {
      ...existing,
      fotoUrl: getAvatarUrl(existing.fotoUrl || currentUser.fotoUrl),
    };
  }

  return {
    id: currentUser.profileId || `ws-${currentUser.nrp}`,
    nrp: currentUser.nrp,
    namaLengkap: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
    pangkat: currentUser.pangkat || 'Kombes Pol',
    jabatanTerakhir:
      currentUser.role === 'SUPERADMIN'
        ? 'Lead Developer & Superadmin Sistem Wira Satya 96'
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
    pendidikanTerakhir: 'Akpol / Perguruan Tinggi Ilmu Kepolisian',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1974-01-01',
    usia: 52,
    jenisKelamin: 'LAKI-LAKI',
    noHp: '',
    email: currentUser.email || '',
    fotoUrl: getAvatarUrl(currentUser.fotoUrl),
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
