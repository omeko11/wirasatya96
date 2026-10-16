import { RiwayatJabatanLeting, FungsiPolri } from '@/types';
import { RAW_AKPOL_1996_ALUMNI } from './akpol1996Alumni';

export function inferFungsiPolri(jabatan: string, satker = '', polda = ''): FungsiPolri {
  const t = `${jabatan} ${satker} ${polda}`.toUpperCase();
  if (
    t.includes('LUAR STRUKTUR') ||
    t.includes('BNN') ||
    t.includes('KPK') ||
    t.includes('BNPT') ||
    t.includes('BAKAMLA') ||
    t.includes('BIN ') ||
    t.includes('BADAN INTELIJEN NEGARA') ||
    t.includes('KEMENTERIAN') ||
    t.includes('KEMEN') ||
    t.includes('KOMDIGI') ||
    t.includes('IMIGRASI') ||
    t.includes('IMIPAS') ||
    t.includes('DPD RI') ||
    t.includes('DPR RI') ||
    t.includes('MPR RI') ||
    t.includes('LEMHANNAS') ||
    t.includes('WANTANNAS') ||
    t.includes('BSSN') ||
    t.includes('PPATK') ||
    t.includes('OMBUDSMAN') ||
    t.includes('SKK MIGAS') ||
    t.includes('OTORITA IKN') ||
    t.includes('BP2MI') ||
    t.includes('SEKMIL') ||
    t.includes('SETMILPRES')
  ) return 'LUAR_STRUKTUR';
  if (t.includes('SAHLI') || t.includes('STAF AHLI')) return 'SAHLI';
  if (t.includes('TASPIDKOR') || t.includes('KORTASTIPIDKOR') || t.includes('TIPIDKOR')) return 'TASPIDKOR';
  if (t.includes('DENSUS')) return 'DENSUS';
  if (t.includes('ITWAS') || t.includes('WASUM') || t.includes('IRWAS') || t.includes('IRWIL') || t.includes('AUDITOR KEPOLISIAN') || t.includes('INSPEKTUR')) return 'WASUM';
  if (t.includes('RENA') || t.includes('STAMARENA') || t.includes('SRENA')) return 'RENA';
  if (t.includes('LEMDIKLAT') || t.includes('SESPIM') || t.includes('AKPOL') || t.includes('STIK') || t.includes('SPN') || t.includes('PUSDIK') || t.includes('WIDYAISWARA') || t.includes('DOSEN')) return 'LEMDIKLAT';
  if (t.includes('PROPAM') || t.includes('WABPROF') || t.includes('PAMINAL') || t.includes('PROVOS')) return 'PROPAM';
  if (t.includes('HUMAS') || t.includes('PENMAS') || t.includes('PID')) return 'HUMAS';
  if (t.includes('HUKUM') || t.includes('DIVKUM') || t.includes('BIDKUM')) return 'HUKUM';
  if (t.includes('HUBINTER') || t.includes('INTERPOL') || t.includes('MHI')) return 'HUBINTER';
  if (t.includes('TIK')) return 'TIK';
  if (t.includes('SDM') || t.includes('SSDM') || t.includes('BINKAR') || t.includes('DALPERS') || t.includes('WATPERS') || t.includes('ROPSI') || t.includes('PSI BIRO')) return 'SDM';
  if (t.includes('KEU') || t.includes('PUSKEU') || t.includes('BIDKEU')) return 'KEU';
  if (t.includes('DOKKES') || t.includes('PUSDOKKES') || t.includes('BIDDOKKES') || t.includes('RS BHAYANGKARA') || t.includes('KESEHATAN')) return 'DOKKES';
  if (t.includes('LITBANG') || t.includes('PUSLITBANG')) return 'LITBANG';
  if (t.includes('SETUM') || t.includes('PUSJARAH')) return 'SETUM';
  if (t.includes('SPRIPIM') || t.includes('KOORSPRIPIM') || t.includes('YANMA') || t.includes('AJUDAN')) return 'SPRIPIM';
  if (t.includes('SLOG') || t.includes('ROLOG') || t.includes('SARPRAS') || t.includes('FASKON') || t.includes('BEKUM') || t.includes('ADA BARANG')) return 'SLOG';
  if (t.includes('BRIMOB') || t.includes('GEGANA') || t.includes('PELOPOR') || t.includes('PASBRIMOB')) return 'BRIMOB';
  if (t.includes('LANTAS') || t.includes('KORLANTAS') || t.includes('PJR') || t.includes('REGIDENT') || t.includes('GAKKUM') || t.includes('KAMSEL')) return 'LANTAS';
  if (t.includes('INTEL') || t.includes('BAINTELKAM') || t.includes('SOSBUD') || t.includes('KAMNEG') || t.includes('POLITIK') || t.includes('KAMSUS') || t.includes('SANDI')) return 'INTELKAM';
  if (t.includes('RESKRIM') || t.includes('BARESKRIM') || t.includes('NARKOBA') || t.includes('DITTIPID') || t.includes('SIBER') || t.includes('PUSIKNAS') || t.includes('LABFOR') || t.includes('PUSINAFIS') || t.includes('INAFIS') || t.includes('PPNS') || t.includes('TIPIDUM') || t.includes('TIPIDEKSUS') || t.includes('TIPIDTER') || t.includes('PPA DAN PPO') || t.includes('PENYIDIK') || t.includes('WASSIDIK')) return 'RESERSE';
  if (t.includes('BAHARKAM') || t.includes('HARKAM') || t.includes('SAMAPTA') || t.includes('SABHARA') || t.includes('PAMOBVIT') || t.includes('POLAIR') || t.includes('POLUDARA') || t.includes('BINMAS') || t.includes('KAKORBINMAS') || t.includes('SATWA')) return 'HARKAM';
  if (t.includes('SOPS') || t.includes('STAMAOPS') || t.includes('ROOPS') || t.includes('KARO OPS') || t.includes('KAROOPS') || t.includes('KABAGOPS') || t.includes('BAGOPS') || t.includes('KERMA') || t.includes('ROKERMA') || t.includes('BINOPSNAL') || t.includes('DALOPS') || t.includes('SIAGA')) return 'OPS';
  if (t.includes('KAPOLDA') || t.includes('WAKAPOLDA') || t.includes('KAPOLRES') || t.includes('WAKAPOLRES') || t.includes('KAPOLSEK') || t.includes('POLDA') || t.includes('POLRES') || t.includes('SPKT')) return 'KEWILAYAHAN';
  return 'OPS';
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
    fungsiPolri: inferFungsiPolri(item.jabatan, item.satker, item.polda),
    tahunMulai: 2024,
    isCurrent: true,
    uraianTugas: `Penugasan Perwira Menengah Alumni Akpol 1996 Batalyon Wira Satya pada ${item.satker} (${item.polda}).`,
    dasarTR: 'Data UKP Sementara Akpol 1996',
  };
});
