/**
 * STRUKTUR ORGANISASI DAN TATA KERJA (SOTK) KEPOLISIAN NEGARA REPUBLIK INDONESIA
 * Berdasarkan Perpres No. 52/2010 jo Perpres No. 5/2017 & Perpol No. 14/2018 (Polda),
 * Perpol No. 2/2021 (Polres), dan Perpres 2024 terkait SOTK Mabes Polri & Korps Baru.
 * Disesuaikan khusus untuk Alumni Akpol 1996 Batalyon Wira Satya (Pamen Kombes Pol & Pati).
 * Polsek ditiadakan karena leting 1996 berpangkat senior (Kombes / Pati).
 */

// 1. Tipe Satuan Kerja yang Relevan untuk Alumni Akpol 1996
export const TIPE_SATKER_LIST = [
  'MABES',
  'POLDA',
  'POLRES/TA/BES',
  'KEMEN/LEMBAGA',
  'PURNA TUGAS',
] as const;

export type TipeSatker = (typeof TIPE_SATKER_LIST)[number];

// 2. Daftar Satker Mabes Polri (Unsur Pimpinan, Pengawas, Staf, Pelaksana Tugas Utama, & Pendukung)
export const SATKER_MABES_LIST = [
  'BARESKRIM POLRI',
  'BAINTELKAM POLRI',
  'BAHARKAM POLRI',
  'KORPS BRIMOB POLRI',
  'KORLANTAS POLRI',
  'DENSUS 88 AT POLRI',
  'KORTASTIPIDKOR POLRI',
  'ITWASUM POLRI',
  'ASTAMAOPS POLRI',
  'ASTAMARENA POLRI',
  'SSDM POLRI',
  'LOGISTIK POLRI (SLOG)',
  'DIVPROPAM POLRI',
  'DIVHUMAS POLRI',
  'DIVHUBINTER POLRI',
  'DIVKUM POLRI',
  'DIVTIK POLRI',
  'SAHLI POLRI',
  'LEMDIKLAT POLRI',
  'PUSDOKKES POLRI',
  'PUSKEU POLRI',
  'PUSLITBANG POLRI',
  'PUSJARAH POLRI',
  'SETUM POLRI',
  'SPRIPIM POLRI',
  'YANMA POLRI',
] as const;

export type SatkerMabes = (typeof SATKER_MABES_LIST)[number];

// 3. Sub-Satker Khusus Bareskrim Polri
export const SUB_SATKER_BARESKRIM = [
  'DITTIPIDUM',
  'DITTIPIDEKSUS',
  'DITTIPIDKOR',
  'DITTIPIDTER',
  'DITTIPIDSIBER',
  'DITTIPIDNARKOBA',
  'DITTIPID PPAPPO',
  'ROBINOPSNAL',
  'ROWASIDIK',
  'ROKORWAS PPNS',
  'RORENMIN',
  'PUSIKNAS',
  'PUSINAFIS',
  'PUSLABFOR',
] as const;

// 4. Sub-Satker Khusus Baintelkam Polri
export const SUB_SATKER_BAINTELKAM = [
  'DITPOLITIK',
  'DITEKONOMI',
  'DITSOSBUD',
  'DITKAMSUS',
  'DITKAMNEG',
  'BIRO ANALISIS',
  'BIRO RENMIN',
] as const;

// 5. Sub-Satker Khusus Baharkam Polri
export const SUB_SATKER_BAHARKAM = [
  'KORPOLAIRUD (DITPOLAIR & DITPOLUDARA)',
  'KORSABHARA (DITSAMAPTA & DITPAMOBVIT)',
  'DITBINMAS POLRI',
  'BIRO BINOPSNAL BAHARKAM',
  'BIRO RENMIN BAHARKAM',
] as const;

// 6. Sub-Satker Khusus Korps Brimob Polri
export const SUB_SATKER_KORBRIMOB = [
  'PASUKAN PELOPOR (PASPOR)',
  'PASUKAN GEGANA (PASGEGANA)',
  'PASUKAN BRIMOB I (WILAYAH BARAT)',
  'PASUKAN BRIMOB II (WILAYAH TENGAH)',
  'PASUKAN BRIMOB III (WILAYAH TIMUR)',
  'SATINTEL BRIMOB',
  'SATLAT BRIMOB',
  'BIRO RENMIN KORBRIMOB',
] as const;

// 7. Sub-Satker Khusus Korlantas Polri
export const SUB_SATKER_KORLANTAS = [
  'DITREGIDENT',
  'DITGAKKUM',
  'DITKAMSEL',
  'BAG OPS KORLANTAS',
  'BAG TIK KORLANTAS',
  'BAG RENMIN KORLANTAS',
] as const;

// 8. Sub-Satker Khusus Lemdiklat Polri
export const SUB_SATKER_LEMDIKLAT = [
  'SESPIM POLRI (SESPIMTI/SESPIMMEN/SESPIMMA)',
  'AKPOL (AKADEMI KEPOLISIAN)',
  'STIK - PTIK',
  'SETUKPA POLRI (SUKABUMI)',
  'DIKLAT RESERSE (MEGAMENDUNG)',
  'DIKLATSUS JATRANS',
  'PUSDIKINTEL',
  'PUSDIKLANTAS',
  'PUSDIKGASUM',
  'PUSDIKBRIMOB',
  'PUSDIKPOLAIR',
  'PUSDIKMIN',
  'PUSDIKBINMAS',
  'SEBASA (SEKOLAH BAHASA)',
  'SEPOLWAN',
  'RO BINKERMA / RO KURIKULUM',
] as const;

// 9. Sub-Satker Khusus SSDM Polri
export const SUB_SATKER_SSDM = [
  'BIRO BINKAR (Binkar)',
  'BIRO DALPERS (Dalpers)',
  'BIRO WATPERS (Watpers)',
  'BIRO PSIKOLOGI (Ropsi)',
  'BAG RENMIN SSDM',
] as const;

// 10. Sub-Satker Khusus Divpropam Polri
export const SUB_SATKER_DIVPROPAM = [
  'BIRO PAMINAL',
  'BIRO WABPROF',
  'BIRO PROVOS',
  'BAG RENMIN DIVPROPAM',
] as const;

// 11. Sub-Satker Khusus Divhumas Polri
export const SUB_SATKER_DIVHUMAS = [
  'BIRO PENMAS',
  'BIRO PID',
  'BIRO MULTIMEDIA',
  'BAG RENMIN DIVHUMAS',
] as const;

// 12. Sub-Satker Khusus Divhubinter Polri
export const SUB_SATKER_DIVHUBINTER = [
  'BAG NCB INTERPOL INDONESIA',
  'BAG KONVINTER',
  'BAG PERDAMI',
  'BAG RENMIN DIVHUBINTER',
] as const;

// 13. Sub-Satker Khusus Itwasum Polri
export const SUB_SATKER_ITWASUM = [
  'ITWIL I (INSPEKTORAT WILAYAH I)',
  'ITWIL II (INSPEKTORAT WILAYAH II)',
  'ITWIL III (INSPEKTORAT WILAYAH III)',
  'ITWIL IV (INSPEKTORAT WILAYAH IV)',
  'ITWIL V (INSPEKTORAT WILAYAH V)',
  'BAG RENMIN ITWASUM',
] as const;

// 14. Sub-Satker Khusus Densus 88 AT
export const SUB_SATKER_DENSUS88 = [
  'DITINTEL DENSUS 88',
  'DITPENINDAKAN DENSUS 88',
  'DITPENCEGAHAN DENSUS 88',
  'DITINVESTIGASI DENSUS 88',
  'SATGASWIL DENSUS 88',
] as const;

// 15. Sub-Satker Khusus Kortastipidkor Polri
export const SUB_SATKER_KORTASTIPIDKOR = [
  'DITPENCEGAHAN KORUPSI',
  'DITPENYIDIKAN KORUPSI',
  'DITPENELUSURAN & PENGAMANAN ASET',
  'BAG RENMIN',
] as const;

// 16. Sub-Satker Khusus Pusdokkes Polri
export const SUB_SATKER_PUSDOKKES = [
  'RS BHAYANGKARA TK. I R.S. SUKANTO',
  'BAG DOKPOL (Kedokteran Kepolisian)',
  'BAG KESPOL (Kesehatan Kepolisian)',
  'BAG MATFASKES',
] as const;

// 17. SOTK Tingkat Polda (Perpol No. 14 Tahun 2018)
export const SUB_SATKER_POLDA_LIST = [
  'PIMPINAN POLDA (KAPOLDA / WAKAPOLDA)',
  'DITRESKRIMUM (Reserse Kriminal Umum)',
  'DITRESKRIMSUS (Reserse Kriminal Khusus)',
  'DITRESNARKOBA (Reserse Narkoba)',
  'DITRESSIBER (Reserse Siber)',
  'DITINTELKAM (Intelijen & Keamanan)',
  'DITLANTAS (Lalu Lintas)',
  'DITSAMAPTA (Samapta)',
  'DITPOLAIRUD (Polair & Udara)',
  'DITBINMAS (Pembinaan Masyarakat)',
  'DITPAMOBVIT (Pengamanan Objek Vital)',
  'DITTAHTI (Tahanan & Barang Bukti)',
  'SATBRIMOB POLDA',
  'ITWASDA',
  'RO OPS (Biro Operasi)',
  'RO RENA (Biro Perencanaan)',
  'RO SDM (Biro Sumber Daya Manusia)',
  'RO LOG (Biro Logistik)',
  'BID PROPAM',
  'BID HUMAS',
  'BID KUM (Hukum)',
  'BID DOKKES (RS Bhayangkara)',
  'BID KEU (Keuangan)',
  'BID TIK',
  'SPN POLDA',
  'SETUM POLDA',
  'SPRIPIM POLDA',
  'YANMA POLDA',
  'LAINNYA',
] as const;

// 18. SOTK Tingkat Polres (Polres Metro / Polrestabes / Polresta / Polres) - Perpol No. 2 Tahun 2021
// Catatan: Akpol 1996 berdinas di Polres sebagai Kapolres/Wakapolres atau PJU Utama Polres.
export const SUB_SATKER_POLRES_LIST = [
  'KAPOLRES / KAPOLRESTABES / KAPOLRES METRO',
  'WAKAPOLRES / WAKAPOLRESTABES',
  'BAG OPS',
  'BAG REN',
  'BAG SDM',
  'BAG LOG',
  'SATRESKRIM',
  'SATRESNARKOBA',
  'SATINTELKAM',
  'SATLANTAS',
  'SATSAMAPTA',
  'SATBINMAS',
  'SATPOLAIRUD',
  'SATPAMOBVIT',
  'SATTAHTI',
  'SIWAS',
  'SIPROPAM',
  'SIHUMAS',
  'SIKUM',
  'SIKEU',
  'SITIK',
  'SIDOKKES',
  'SIUM',
  'SPKT',
  'LAINNYA',
] as const;

// 19. Penugasan Luar Struktur (Kementerian / Lembaga Negara)
export const DAFTAR_KEMEN_LEMBAGA = [
  'BADAN INTELIJEN NEGARA (BIN)',
  'BADAN NARKOTIKA NASIONAL (BNN)',
  'BADAN NASIONAL PENANGGULANGAN TERORISME (BNPT)',
  'LEMBAGA KETAHANAN NASIONAL (LEMHANNAS RI)',
  'KOMISI PEMBERANTASAN KORUPSI (KPK)',
  'BADAN SIBER DAN SANDI NEGARA (BSSN)',
  'KEMENKO POLKAM RI',
  'KEMENSETNEG / SETMILPRES RI',
  'BADAN KEAMANAN LAUT (BAKAMLA RI)',
  'KEMENTERIAN DALAM NEGERI (KEMENDAGRI)',
  'KEMENTERIAN HUKUM DAN HAM (KEMENKUMHAM)',
  'KEMENTERIAN ATR / BPN',
  'KEMENTERIAN BUMN',
  'KEMENTERIAN / LEMBAGA LAINNYA',
] as const;

// 20. Opsi Purna Tugas
export const STATUS_PURNA_TUGAS_LIST = [
  'PURNAWIRAWAN / PENSIUN POLRI',
  'MASA PERSIAPAN PENSIUN (MPP)',
  'WIRAUSAHA / EKSEKUTIF BISNIS',
  'KONSULTAN KEAMANAN / ADVOKAT',
  'AKADEMISI / DOSEN / PENELITI',
  'TOKOH MASYARAKAT / ORGANISASI SOSIAL',
] as const;

// 21. Helper untuk mendapatkan daftar Sub Satker Mabes secara dinamis
export function getSubSatkerForMabes(satkerMabes: string): readonly string[] {
  switch (satkerMabes) {
    case 'BARESKRIM POLRI':
      return SUB_SATKER_BARESKRIM;
    case 'BAINTELKAM POLRI':
      return SUB_SATKER_BAINTELKAM;
    case 'BAHARKAM POLRI':
      return SUB_SATKER_BAHARKAM;
    case 'KORPS BRIMOB POLRI':
      return SUB_SATKER_KORBRIMOB;
    case 'KORLANTAS POLRI':
      return SUB_SATKER_KORLANTAS;
    case 'LEMDIKLAT POLRI':
      return SUB_SATKER_LEMDIKLAT;
    case 'SSDM POLRI':
      return SUB_SATKER_SSDM;
    case 'DIVPROPAM POLRI':
      return SUB_SATKER_DIVPROPAM;
    case 'DIVHUMAS POLRI':
      return SUB_SATKER_DIVHUMAS;
    case 'DIVHUBINTER POLRI':
      return SUB_SATKER_DIVHUBINTER;
    case 'ITWASUM POLRI':
      return SUB_SATKER_ITWASUM;
    case 'DENSUS 88 AT POLRI':
      return SUB_SATKER_DENSUS88;
    case 'KORTASTIPIDKOR POLRI':
      return SUB_SATKER_KORTASTIPIDKOR;
    case 'PUSDOKKES POLRI':
      return SUB_SATKER_PUSDOKKES;
    default:
      return [];
  }
}

// @deprecated - Disimpan hanya untuk kompatibilitas data lama jika ada, tidak ditampilkan di form baru leting 1996
export const SUB_SATKER_POLSEK_LIST = [
  'UNIT RESKRIM',
  'UNIT INTELKAM',
  'UNIT LANTAS',
  'UNIT BINMAS',
  'UNIT SAMAPTA',
  'SPKT',
  'SIUM',
  'LAINNYA',
] as const;

// 22. Daftar 38 Polda Seluruh Indonesia
export const DAFTAR_38_POLDA = [
  'POLDA ACEH',
  'POLDA SUMATERA UTARA',
  'POLDA SUMATERA BARAT',
  'POLDA RIAU',
  'POLDA KEPULAUAN RIAU',
  'POLDA JAMBI',
  'POLDA BENGKULU',
  'POLDA SUMATERA SELATAN',
  'POLDA KEP. BANGKA BELITUNG',
  'POLDA LAMPUNG',
  'POLDA BANTEN',
  'POLDA METRO JAYA',
  'POLDA JAWA BARAT',
  'POLDA JAWA TENGAH',
  'POLDA D.I. YOGYAKARTA',
  'POLDA JAWA TIMUR',
  'POLDA BALI',
  'POLDA NUSA TENGGARA BARAT',
  'POLDA NUSA TENGGARA TIMUR',
  'POLDA KALIMANTAN BARAT',
  'POLDA KALIMANTAN TENGAH',
  'POLDA KALIMANTAN SELATAN',
  'POLDA KALIMANTAN TIMUR',
  'POLDA KALIMANTAN UTARA',
  'POLDA SULAWESI UTARA',
  'POLDA SULAWESI TENGAH',
  'POLDA SULAWESI SELATAN',
  'POLDA SULAWESI TENGGARA',
  'POLDA SULAWESI BARAT',
  'POLDA GORONTALO',
  'POLDA MALUKU',
  'POLDA MALUKU UTARA',
  'POLDA PAPUA',
  'POLDA PAPUA BARAT',
  'POLDA PAPUA BARAT DAYA',
  'POLDA PAPUA TENGAH',
  'POLDA PAPUA SELATAN',
  'POLDA PAPUA PEGUNUNGAN',
] as const;

export const JENIS_ANGGOTA_LIST = [
  'ANGGOTA POLRI',
] as const;

export type JenisAnggota = (typeof JENIS_ANGGOTA_LIST)[number];
