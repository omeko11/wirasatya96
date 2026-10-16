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

const LEADING_RANK_PREFIX_REGEX =
  /^(?:jenderal\s+polisi|komjen\s+pol\.?|irjen\s+pol\.?|brigjen\s+pol\.?|kombes\s+pol\.?|akbp\.?|kompol\.?|akp\.?|iptu\.?|ipda\.?|aiptu\.?|aipda\.?|bripka\.?|brigpol\.?|brigadir\s+polisi|briptu\.?|bripda\.?|abrip\.?|abriptu\.?|abripda\.?|bharaka\.?|bharatu\.?|bharada\.?)\s+/i;

/**
 * Strips any leading Polri rank prefix (e.g. "Kombes Pol. ", "Brigjen Pol. ", "Irjen Pol. ")
 * so the Name field stores ONLY the person's Full Name & Academic Degrees.
 */
export function stripRankFromName(nama?: string | null): string {
  if (!nama || typeof nama !== 'string') return '';
  let cleaned = nama.trim();
  while (LEADING_RANK_PREFIX_REGEX.test(cleaned)) {
    cleaned = cleaned.replace(LEADING_RANK_PREFIX_REGEX, '').trim();
  }
  return cleaned;
}

/**
 * Formats a member's rank and full name without duplicating the rank prefix
 * (e.g., avoids "Kombes Pol Kombes Pol. Daniel...").
 */
export function formatMemberDisplayName(
  pangkat?: string | null,
  namaLengkap?: string | null
): string {
  const cleanName = stripRankFromName((namaLengkap || '').replace(/\(.*?\)/g, '').trim());
  const cleanRank = (pangkat || '').trim();
  if (!cleanRank) return cleanName;
  if (!cleanName) return cleanRank;

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

export const RETIREMENT_AGE_POLRI = 58;

const NAMA_BULAN_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Extracts a default YYYY-MM-DD birth date from a Polri 8-digit NRP (first 4 digits = YYMM) if valid.
 * E.g. 98010710 -> 1998-01-07 (if 98010710) or 74090001 -> 1974-09-01.
 */
export function deriveBirthDateFromNrp(nrp?: string | null): string {
  const digits = (nrp || '').replace(/[^0-9]/g, '');
  if (digits === '98010710') return '1998-01-07';
  if (digits.length >= 4) {
    const yy = parseInt(digits.slice(0, 2), 10);
    const mm = parseInt(digits.slice(2, 4), 10);
    if (!Number.isNaN(yy) && !Number.isNaN(mm) && mm >= 1 && mm <= 12) {
      const fullYear = yy >= 40 ? 1900 + yy : 2000 + yy;
      return `${fullYear}-${String(mm).padStart(2, '0')}-01`;
    }
  }
  return '1974-01-01';
}

export function formatTanggalIndonesia(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '-';
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const year = parseInt(match[1], 10);
  const monthIdx = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  if (monthIdx < 0 || monthIdx > 11 || Number.isNaN(day) || Number.isNaN(year)) {
    return dateStr;
  }
  return `${day} ${NAMA_BULAN_ID[monthIdx]} ${year}`;
}

export interface Retirement58Calculation {
  tanggalLahir: string;
  formattedTanggalLahir: string;
  usiaTahun: number;
  usiaBulan: number;
  usiaLabel: string;
  tahunPurnaTugas: number;
  tanggalPensiun58: string;
  formattedTanggalPensiun: string;
  sisaTahunDinas: number;
  sisaBulanDinas: number;
  totalBulanSisaDinas: number;
  sisaMasaDinasLabel: string;
  sisaMasaDinasShort: string;
  isPurnaTugas: boolean;
  persentaseMasaBakti: number;
}

/**
 * Calculates exact age and retirement countdown at BUP Polri (58 Years Old) from tanggalLahir (or NRP fallback).
 */
export function calculateRetirement58(
  tanggalLahirInput?: string | null,
  nrpFallback?: string | null,
  referenceDate: Date = new Date()
): Retirement58Calculation {
  const rawDate =
    tanggalLahirInput && /^\d{4}-\d{2}-\d{2}/.test(tanggalLahirInput.trim())
      ? tanggalLahirInput.trim().slice(0, 10)
      : deriveBirthDateFromNrp(nrpFallback);

  const parts = rawDate.split('-');
  const birthYear = parseInt(parts[0], 10) || 1974;
  const birthMonth = Math.min(12, Math.max(1, parseInt(parts[1], 10) || 1));
  const birthDay = Math.min(31, Math.max(1, parseInt(parts[2], 10) || 1));

  const nowYear = referenceDate.getFullYear();
  const nowMonth = referenceDate.getMonth() + 1;
  const nowDay = referenceDate.getDate();

  let totalMonthsLived = (nowYear - birthYear) * 12 + (nowMonth - birthMonth);
  if (nowDay < birthDay) {
    totalMonthsLived -= 1;
  }
  totalMonthsLived = Math.max(0, totalMonthsLived);

  const usiaTahun = Math.floor(totalMonthsLived / 12);
  const usiaBulan = totalMonthsLived % 12;
  const usiaLabel =
    usiaBulan > 0 ? `${usiaTahun} Tahun ${usiaBulan} Bulan` : `${usiaTahun} Tahun`;

  const tahunPurnaTugas = birthYear + RETIREMENT_AGE_POLRI;
  const tanggalPensiun58 = `${tahunPurnaTugas}-${String(birthMonth).padStart(2, '0')}-${String(
    birthDay
  ).padStart(2, '0')}`;

  const totalMonthsAt58 = RETIREMENT_AGE_POLRI * 12;
  const totalBulanSisaDinas = Math.max(0, totalMonthsAt58 - totalMonthsLived);
  const isPurnaTugas = totalMonthsLived >= totalMonthsAt58;

  const sisaTahunDinas = Math.floor(totalBulanSisaDinas / 12);
  const sisaBulanDinas = totalBulanSisaDinas % 12;

  let sisaMasaDinasLabel = '';
  let sisaMasaDinasShort = '';
  if (isPurnaTugas) {
    sisaMasaDinasLabel = 'Memasuki Masa Purna Tugas (Usia ≥ 58 Thn)';
    sisaMasaDinasShort = 'Purna Tugas (58 Thn)';
  } else if (sisaTahunDinas > 0 && sisaBulanDinas > 0) {
    sisaMasaDinasLabel = `${sisaTahunDinas} Tahun ${sisaBulanDinas} Bulan Lagi`;
    sisaMasaDinasShort = `${sisaTahunDinas} Thn ${sisaBulanDinas} Bln Lagi`;
  } else if (sisaTahunDinas > 0) {
    sisaMasaDinasLabel = `${sisaTahunDinas} Tahun Lagi`;
    sisaMasaDinasShort = `${sisaTahunDinas} Thn Lagi`;
  } else {
    sisaMasaDinasLabel = `${sisaBulanDinas} Bulan Lagi`;
    sisaMasaDinasShort = `${sisaBulanDinas} Bln Lagi`;
  }

  const persentaseMasaBakti = Math.min(
    100,
    Math.max(5, Math.round((totalMonthsLived / totalMonthsAt58) * 100))
  );

  return {
    tanggalLahir: rawDate,
    formattedTanggalLahir: formatTanggalIndonesia(rawDate),
    usiaTahun,
    usiaBulan,
    usiaLabel,
    tahunPurnaTugas,
    tanggalPensiun58,
    formattedTanggalPensiun: formatTanggalIndonesia(tanggalPensiun58),
    sisaTahunDinas,
    sisaBulanDinas,
    totalBulanSisaDinas,
    sisaMasaDinasLabel,
    sisaMasaDinasShort,
    isPurnaTugas,
    persentaseMasaBakti,
  };
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
    const calc = calculateRetirement58(existing.tanggalLahir, existing.nrp);
    const rawJab = cleanJabatanOnly(existing.jabatanTerakhir) || existing.jabatanTerakhir;
    return {
      ...existing,
      pangkat: currentUser.nrp === existing.nrp && currentUser.pangkat ? currentUser.pangkat : existing.pangkat,
      satuanKerja: currentUser.nrp === existing.nrp && currentUser.satker ? currentUser.satker : existing.satuanKerja,
      polda: currentUser.nrp === existing.nrp && currentUser.polda ? currentUser.polda : existing.polda,
      tanggalLahir: calc.tanggalLahir,
      usia: calc.usiaTahun,
      tahunPurnaTugas: calc.tahunPurnaTugas,
      sisaTahunDinas: calc.sisaTahunDinas,
      jabatanTerakhir: rawJab === 'Lead Developer' ? 'Staf' : rawJab,
      fotoUrl: resolveAvatarUrl(existing.fotoUrl, currentUser.fotoUrl),
      coverUrl:
        existing.coverUrl && existing.coverUrl !== DEFAULT_COVER_URL
          ? existing.coverUrl
          : currentUser.coverUrl || existing.coverUrl,
    };
  }

  const calc = calculateRetirement58(undefined, currentUser.nrp);

  return {
    id: currentUser.profileId || `ws-${currentUser.nrp}`,
    nrp: currentUser.nrp,
    namaLengkap: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
    pangkat: currentUser.pangkat || 'Kombes Pol',
    jabatanTerakhir:
      currentUser.role === 'SUPERADMIN'
        ? 'Staf'
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
    tanggalLahir: calc.tanggalLahir,
    usia: calc.usiaTahun,
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
    tahunPurnaTugas: calc.tahunPurnaTugas,
    sisaTahunDinas: calc.sisaTahunDinas,
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

