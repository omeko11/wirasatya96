import { RiwayatJabatanLeting, FungsiPolri } from '@/types';
import { RAW_AKPOL_1996_ALUMNI } from './akpol1996Alumni';

function inferFungsiPolri(jabatan: string): FungsiPolri {
  const upper = jabatan.toUpperCase();
  if (upper.includes('RESKRIM') || upper.includes('NARKOBA') || upper.includes('TIPID') || upper.includes('DENSUS')) {
    return 'RESERSE';
  }
  if (upper.includes('INTEL')) {
    return 'INTELKAM';
  }
  if (upper.includes('LANTAS') || upper.includes('PJR')) {
    return 'LANTAS';
  }
  if (upper.includes('BRIMOB') || upper.includes('GEGANA') || upper.includes('PELOPOR') || upper.includes('SABHARA') || upper.includes('DALMAS')) {
    return 'BRIMOB_SABHARA';
  }
  if (upper.includes('LEMDIK') || upper.includes('STIK') || upper.includes('PUSDIK') || upper.includes('AKPOL') || upper.includes('SPN')) {
    return 'LEMDIKLAT';
  }
  if (upper.includes('BNN') || upper.includes('KPK') || upper.includes('HUBINTER')) {
    return 'LUAR_STRUKTUR';
  }
  return 'KEWILAYAHAN';
}

export const INITIAL_RIWAYAT_JABATAN: RiwayatJabatanLeting[] = RAW_AKPOL_1996_ALUMNI.map((item) => {
  const nrp = `7409${String(item.no).padStart(4, '0')}`;
  return {
    id: `jab-${nrp}`,
    perwiraNrp: nrp,
    namaPerwira: item.nama,
    pangkat: 'Kombes Pol',
    avatarUrl: '/default-avatar.png',
    jabatan: item.jabatan,
    satker: item.satker,
    polda: item.polda,
    fungsiPolri: inferFungsiPolri(item.jabatan),
    tahunMulai: 2024,
    isCurrent: true,
    uraianTugas: `Penugasan Perwira Menengah Alumni Akpol 1996 Batalyon Wira Satya pada ${item.satker} (${item.polda}).`,
    dasarTR: 'Data UKP Sementara Akpol 1996',
  };
});
