export interface JabatanGroupOption {
  group: string;
  options: string[];
}

export const EXTERNAL_JABATAN_SENTINEL = '__EKSTERNAL_POLRI__';

export const OFFICER_RANKS_IPDA_UP = [
  'Jenderal Polisi',
  'Komjen Pol',
  'Irjen Pol',
  'Brigjen Pol',
  'Kombes Pol',
  'AKBP',
  'Kompol',
  'AKP',
  'Iptu',
  'Ipda',
];

/**
 * Mengecek apakah pangkat termasuk Perwira Polri (IPDA ke atas s/d JENDERAL POLISI).
 */
export function isOfficerRankIpdaUp(pangkat?: string | null): boolean {
  if (!pangkat) return false;
  const clean = pangkat.trim().toLowerCase().replace(/\./g, '');
  return OFFICER_RANKS_IPDA_UP.some(
    (r) => r.toLowerCase().replace(/\./g, '') === clean || clean.startsWith(r.toLowerCase().replace(/\./g, ''))
  );
}

/**
 * Daftar Standar Jabatan Organisasi Polri berdasarkan Pangkat (IPDA s/d JENDERAL POLISI)
 * mengacu pada Perpol Nomor 4 Tahun 2025 (SOTK Mabes Polri, Bareskrim Polri, Kortastipidkor Polri)
 * serta Perkap SOTK Tingkat Polda / Polres / Polsek.
 */
export const STANDAR_JABATAN_BY_PANGKAT: Record<string, JabatanGroupOption[]> = {
  'Jenderal Polisi': [
    {
      group: 'Unsur Pimpinan Mabes Polri (Eselon I A)',
      options: ['Kapolri', 'Pati Mabes Polri'],
    },
  ],
  'Komjen Pol': [
    {
      group: 'Unsur Pimpinan & Pengawas Mabes Polri (Eselon I A)',
      options: [
        'Wakapolri',
        'Irwasum Polri',
        'Astamaops Kapolri',
        'Astamarena Kapolri',
      ],
    },
    {
      group: 'Unsur Pelaksana Tugas Pokok & Pendukung Mabes Polri (Perpol 4/2025)',
      options: [
        'Kabareskrim Polri',
        'Kabaintelkam Polri',
        'Kabaharkam Polri',
        'Dankorbrimob Polri',
        'Kalemdiklat Polri',
        'Kakorlantas Polri',
      ],
    },
    {
      group: 'Fungsional & Pati Mabes Polri',
      options: ['Analis Kebijakan Utama', 'Pati Mabes Polri'],
    },
  ],
  'Irjen Pol': [
    {
      group: 'Unsur Pimpinan & Pembantu Pimpinan Mabes Polri (Perpol 4/2025 - Eselon I A / I B)',
      options: [
        'Wakabareskrim Polri',
        'Kakortastipidkor Polri',
        'Wairwasum Polri',
        'Waastamaops Kapolri',
        'Waastamarena Kapolri',
        'As SDM Kapolri',
        'Aslog Kapolri',
        'Kadivpropam Polri',
        'Kadivkum Polri',
        'Kadivhumas Polri',
        'Kadivhubinter Polri',
        'Kadiv TIK Polri',
        'Sahli Kapolri',
        'Koorsahli Kapolri',
      ],
    },
    {
      group: 'Unsur Pelaksana Tugas Pokok & Pendukung Mabes Polri',
      options: [
        'Wakabaintelkam Polri',
        'Wakabaharkam Polri',
        'Kakorlantas Polri',
        'Wadankorbrimob Polri',
        'Kadensus 88 AT Polri',
        'Kakorbinmas Baharkam Polri',
        'Kakorsabhara Baharkam Polri',
        'Kakorpolairud Baharkam Polri',
        'Wakalemdiklat Polri',
        'Gubernur Akpol',
        'Kasespim Lemdiklat Polri',
        'Kastik Lemdiklat Polri',
        'Kapusdokkes Polri',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda)',
      options: ['Kapolda'],
    },
    {
      group: 'Jabatan Fungsional Utama & Pati',
      options: [
        'Widyaiswara Kepolisian Utama Tk. I',
        'Penyidik Tindak Pidana Utama Tk. I',
        'Auditor Kepolisian Utama Tk. I',
        'Dosen Kepolisian Utama Tk. I',
        'Analis Kebijakan Utama',
        'Pati Mabes Polri',
      ],
    },
  ],
  'Brigjen Pol': [
    {
      group: 'Bareskrim Polri & Kortastipidkor Polri (Perpol 4/2025 - Eselon II A)',
      options: [
        'Wakakortastipidkor Polri',
        'Karowassidik Bareskrim Polri',
        'Karobinopsnal Bareskrim Polri',
        'Karorenmin Bareskrim Polri',
        'Karokorwas PPNS Bareskrim Polri',
        'Kapuslabfor Bareskrim Polri',
        'Kapusiknas Bareskrim Polri',
        'Kapusident Bareskrim Polri',
        'Dirtipidum Bareskrim Polri',
        'Dirtipideksus Bareskrim Polri',
        'Dirtipidnarkoba Bareskrim Polri',
        'Dirtipidter Bareskrim Polri',
        'Dirtipidsiber Bareskrim Polri',
        'Dirtipid PPA dan PPO Bareskrim Polri',
        'Dircegah Kortastipidkor Polri',
        'Dirtindak Kortastipidkor Polri',
        'Dir P2A Kortastipidkor Polri',
      ],
    },
    {
      group: 'Unsur Pengawas, Pembantu Pimpinan & Pelaksana Mabes Polri (Eselon II A)',
      options: [
        'Irwil Itwasum Polri',
        'Irwil I Itwasum Polri',
        'Irwil II Itwasum Polri',
        'Irwil III Itwasum Polri',
        'Irwil IV Itwasum Polri',
        'Irwil V Itwasum Polri',
        'Karobinkar SSDM Polri',
        'Karodalpers SSDM Polri',
        'Karojianstra SSDM Polri',
        'Karowatpers SSDM Polri',
        'Karopsi SSDM Polri',
        'Karopaminal Divpropam Polri',
        'Karoprovos Divpropam Polri',
        'Karowabprof Divpropam Polri',
        'Karopenmas Divhumas Polri',
        'Karo PID Divhumas Polri',
        'Karomulmed Divhumas Polri',
        'Karomisinter Divhubinter Polri',
        'Karokersin Divhubinter Polri',
        'Karobankum Divkum Polri',
        'Karokermaluhkum Divkum Polri',
        'Karotekkom Div TIK Polri',
        'Karotekinfo Div TIK Polri',
        'Karo Mabes Polri',
        'Direktur Mabes Polri',
        'Kapuskeu Polri',
        'Kapuslitbang Polri',
        'Kapusjarah Polri',
        'Karumkit Bhayangkara Tk. I',
        'Danpasgegana Korbrimob Polri',
        'Danpaspelopor Korbrimob Polri',
        'Danpasbrimob Korbrimob Polri',
        'Wagub Akpol',
        'Kasespimti Lemdiklat Polri',
        'Kasespimmen Lemdiklat Polri',
        'Wakaket STIK Lemdiklat Polri',
        'Kasetukpa Lemdiklat Polri',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda)',
      options: ['Wakapolda'],
    },
    {
      group: 'Jabatan Fungsional Utama Tk. II & Pati',
      options: [
        'Penyidik Tindak Pidana Utama Tk. II',
        'Widyaiswara Kepolisian Utama Tk. II',
        'Auditor Kepolisian Utama Tk. II',
        'Dosen Kepolisian Utama Tk. II',
        'Analis Kebijakan Utama',
        'Pati Polri',
      ],
    },
  ],
  'Kombes Pol': [
    {
      group: 'Bareskrim Polri & Kortastipidkor Polri (Perpol 4/2025 - Eselon II B)',
      options: [
        'Wadirtipidum Bareskrim Polri',
        'Wadirtipideksus Bareskrim Polri',
        'Wadirtipidnarkoba Bareskrim Polri',
        'Wadirtipidter Bareskrim Polri',
        'Wadirtipidsiber Bareskrim Polri',
        'Wadirtipid PPA dan PPO Bareskrim Polri',
        'Wadircegah Kortastipidkor Polri',
        'Wadirtindak Kortastipidkor Polri',
        'Wadir P2A Kortastipidkor Polri',
        'Kasubdit (Tingkat Mabes / Bareskrim / Kortastipidkor)',
        'Kasatresmob Bareskrim Polri',
        'Kabagrenmin (Tingkat Mabes / Bareskrim / Kortastipidkor)',
        'Kabagops Kortastipidkor Polri',
        'Kabagwasbantek Kortastipidkor Polri',
        'Kabagren Rorenmin Bareskrim Polri',
        'Kabagbinfung Rorenmin Bareskrim Polri',
        'Kabagsumda Rorenmin Bareskrim Polri',
        'Kabagtahti Rorenmin Bareskrim Polri',
        'Kabagrenopsnal Robinopsnal Bareskrim Polri',
        'Kabagkerma Robinopsnal Bareskrim Polri',
        'Kabaganev Robinopsnal Bareskrim Polri',
        'Kabagmon Robinopsnal Bareskrim Polri',
        'Kabagyanmas Robinopsnal Bareskrim Polri',
        'Kabagmindik Rowassidik Bareskrim Polri',
        'Kabagvisilap Rowassidik Bareskrim Polri',
        'Kabagwassidik Rokorwas PPNS Bareskrim Polri',
        'Kabagbin PPNS Rokorwas PPNS Bareskrim Polri',
        'Kabagbanops Rokorwas PPNS Bareskrim Polri',
        'Kabagminpers PPNS Rokorwas PPNS Bareskrim Polri',
        'Sespuslabfor Bareskrim Polri',
        'Sespusiknas Bareskrim Polri',
        'Sespusident Bareskrim Polri',
        'Kabagjemenmut Puslabfor Bareskrim Polri',
        'Kabiddokupalfor Puslabfor Bareskrim Polri',
        'Kabidbalmetfor Puslabfor Bareskrim Polri',
        'Kabidfiskomfor Puslabfor Bareskrim Polri',
        'Kabidkimbiofor Puslabfor Bareskrim Polri',
        'Kabidnarkobafor Puslabfor Bareskrim Polri',
        'Kabidbangsis Pusiknas Bareskrim Polri',
        'Kabidyaninfokrim Pusiknas Bareskrim Polri',
        'Kabidkerma Pusiknas Bareskrim Polri',
        'Kabid PDAKT Pusiknas Bareskrim Polri',
        'Tim Analis Bid PDAKT Pusiknas Bareskrim Polri',
        'Kabagsisinfo Pusident Bareskrim Polri',
        'Kabiddaktium Pusident Bareskrim Polri',
        'Kabiddaktikrim Pusident Bareskrim Polri',
        'Kabidtopol Pusident Bareskrim Polri',
      ],
    },
    {
      group: 'Tingkat Mabes Polri Lainnya (Eselon II B)',
      options: [
        'Kabag (Tingkat Mabes Polri)',
        'Kasubdit (Tingkat Mabes Polri)',
        'Kabid (Tingkat Mabes Polri)',
        'Sespus (Sekretaris Pusat Mabes Polri)',
        'Koorspripim Polri',
        'Kasetum Polri',
        'Kayanma Polri',
        'Kapusdik Lemdiklat Polri',
        'Auditor Itwil Itwasum Polri',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda & Polrestabes/Polresta/Metro)',
      options: [
        'Irwasda Polda',
        'Karo Ops Polda',
        'Karo Rena Polda',
        'Karo SDM Polda',
        'Karo Log Polda',
        'Dirintelkam Polda',
        'Dirreskrimum Polda',
        'Dirreskrimsus Polda',
        'Dirresnarkoba Polda',
        'Dirsiber Polda',
        'Dirbinmas Polda',
        'Dirsamapta / Dirsabhara Polda',
        'Dirlantas Polda',
        'Dirpamobvit Polda',
        'Dirpolairud Polda',
        'Dirtahti Polda',
        'Dansatbrimob Polda',
        'Kabidpropam Polda',
        'Kabidhumas Polda',
        'Kabidkum Polda',
        'Kabid TIK Polda',
        'Kabiddokkes Polda',
        'Kabidkeu Polda',
        'Kabidlabfor Polda',
        'Ka SPN Polda',
        'Kapolrestabes',
        'Kapolresta',
        'Kapolres Metro',
      ],
    },
    {
      group: 'Jabatan Fungsional Madya & Pamen',
      options: [
        'Penyidik Tindak Pidana Madya',
        'Auditor Kepolisian Madya',
        'Analis Kebijakan Madya',
        'Dosen Kepolisian Madya',
        'Widyaiswara Muda',
        'Pamen Mabes Polri / Polda',
      ],
    },
  ],
  AKBP: [
    {
      group: 'Tingkat Mabes Polri (Perpol 4/2025 - Eselon III A)',
      options: [
        'Kanit Subdit (Bareskrim / Kortastipidkor / Mabes Polri)',
        'Kasubbagrenmin (Bareskrim / Kortastipidkor / Mabes Polri)',
        'Kasubbagopsnal (Bareskrim / Mabes Polri)',
        'Kasubbagren (Bareskrim / Kortastipidkor / Mabes Polri)',
        'Kasubbagsumda (Bareskrim / Kortastipidkor / Mabes Polri)',
        'Kasubbagbinfung (Bareskrim / Kortastipidkor / Mabes Polri)',
        'Kasubbag (Tingkat Biro / Pusat / Bagian Mabes Polri)',
        'Kasubbid (Puslabfor / Pusiknas / Pusident / Mabes Polri)',
        'Kasikeu Kortastipidkor Polri',
        'Kataud Bareskrim Polri',
        'Ka Tim Monitor Robinopsnal Bareskrim Polri',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda & Polres - Eselon III A)',
      options: [
        'Kapolres',
        'Wakapolrestabes / Wakapolresta / Wakapolres Metro',
        'Wadir (Wakil Direktur Polda)',
        'Kasubdit (Ditreskrimum / Ditreskrimsus / Ditresnarkoba / Ditsiber / Ditintelkam / Ditlantas / Ditbinmas / Ditsamapta / Ditpamobvit / Ditpolairud Polda)',
        'Kabagbinopsnal (Biro Ops / Direktorat Polda)',
        'Kabagdalops Roops Polda',
        'Kabagbinkar Ro SDM Polda',
        'Kabagdalpers Ro SDM Polda',
        'Kabagpsi Ro SDM Polda',
        'Kabagwatpers Ro SDM Polda',
        'Kabagfaskon Ro Sarpras / Log Polda',
        'Kabag RBP Rorena Polda',
        'Kabagrenprogar Rorena Polda',
        'Kabagwassidik Direktorat Polda',
        'Kabaganalis Ditintelkam Polda',
        'Kasubbid (Bidpropam / Bidhumas / Bidkum / Bid TIK / Biddokkes / Bidkeu Polda)',
        'Kaden Gegana Satbrimob Polda',
        'Kaden Pelopor Satbrimob Polda',
        'Ka SPKT Polda',
        'Kakorsis SPN Polda',
        'Kasat PJR Ditlantas Polda',
        'Kasat Rolda Ditpolair Polda',
      ],
    },
    {
      group: 'Jabatan Fungsional & Pamen',
      options: [
        'Penyidik Tindak Pidana Madya / Muda',
        'Auditor Kepolisian Muda',
        'Analis Kebijakan Muda',
        'Dosen Kepolisian Muda',
        'Pamen Polri',
      ],
    },
  ],
  Kompol: [
    {
      group: 'Tingkat Mabes Polri (Perpol 4/2025 - Eselon III B)',
      options: [
        'Kasubnit Subdit (Bareskrim / Kortastipidkor / Mabes Polri)',
        'Kaurmin (Bagian / Bidang / Satresmob Mabes Polri)',
        'Kaurtu (Biro / Pusat / Direktorat Mabes Polri)',
        'Kaurkeu (Urkeu Bareskrim / Puslabfor / Pusiknas / Pusident / Mabes Polri)',
        'Kaur (Bidang Puslabfor / Pusident / Mabes Polri)',
        'Paur (Subbagian / Subbidang Tingkat Mabes Polri)',
        'Kataud Kortastipidkor Polri',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda / Polres / Polsek - Eselon III B)',
      options: [
        'Wakapolres',
        'Kabag Ops Polres',
        'Kabag Ren Polres',
        'Kabag SDM Polres',
        'Kabag Log Polres',
        'Kasat (Tingkat Polrestabes / Polresta / Polres Metro)',
        'Kapolsek (Polsek Urban / Metro)',
        'Kanit Subdit Polda',
        'Kasi (Tingkat Polda / Polrestabes)',
        'Kaur Subbag Polda',
        'Penyidik Tindak Pidana Muda / Pertama',
        'Pamen Polri',
      ],
    },
  ],
  AKP: [
    {
      group: 'Tingkat Mabes Polri (Perpol 4/2025 - Eselon IV A)',
      options: [
        'Panit Subdit (Bareskrim / Kortastipidkor / Satresmob / Mabes Polri)',
        'Pamin (Tingkat Mabes Polri)',
        'Paur (Puslabfor / Pusiknas / Pusident / Mabes Polri)',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda / Polres / Polsek - Eselon IV A)',
      options: [
        'Kasat Reskrim Polres',
        'Kasat Lantas Polres',
        'Kasat Intelkam Polres',
        'Kasat Resnarkoba Polres',
        'Kasat Samapta Polres',
        'Kasat Binmas Polres',
        'Kasat Polair Polres',
        'Kasat Tahti Polres',
        'Kapolsek',
        'Wakapolsek (Urban / Metro)',
        'Kanit (Tingkat Polda / Polres / Polsek)',
        'Kasi Propam Polres',
        'Kasi Humas Polres',
        'Kasi Kum Polres',
        'Kasiwas Polres',
        'Danki Brimob / Dalmas',
        'Penyidik Tindak Pidana Pertama',
        'Pama Polri',
      ],
    },
  ],
  Iptu: [
    {
      group: 'Tingkat Mabes Polri (Perpol 4/2025 - Eselon IV B)',
      options: [
        'Pamin (Urkeu / Urtu / Taud / Set / Bag / Direktorat Mabes Polri)',
        'Panit (Tingkat Mabes Polri)',
        'Paur (Tingkat Mabes Polri)',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda / Polres / Polsek - Eselon IV B)',
      options: [
        'Kapolsek (Polsek Rural / Prarural)',
        'Wakapolsek',
        'Kanit Reskrim',
        'Kanit Intelkam',
        'Kanit Lantas',
        'Kanit Samapta',
        'Kanit Binmas',
        'Kanit Provos',
        'Kanit Regident',
        'Kanit Gakkum',
        'Kanit SPKT',
        'Kasubnit',
        'KBO (Kaur Bin Opsnal) Satuan Polres',
        'Danton Brimob / Dalmas',
        'Pama Polri',
      ],
    },
  ],
  Ipda: [
    {
      group: 'Tingkat Mabes Polri (Perpol 4/2025 - Eselon IV B)',
      options: [
        'Pamin (Urkeu / Urtu / Taud / Set / Bag / Direktorat Mabes Polri)',
        'Panit (Tingkat Mabes Polri)',
        'Paur (Tingkat Mabes Polri)',
      ],
    },
    {
      group: 'Tingkat Kewilayahan (Polda / Polres / Polsek - Eselon IV B)',
      options: [
        'Kapolsek (Polsek Prarural)',
        'Wakapolsek',
        'Kanit Reskrim',
        'Kanit Intelkam',
        'Kanit Lantas',
        'Kanit Samapta',
        'Kanit Binmas',
        'Kanit Provos',
        'Kanit SPKT',
        'Kasubnit',
        'KBO (Kaur Bin Opsnal) Satuan Polres',
        'Panit Opsnal',
        'Danton Brimob / Dalmas',
        'Pama Polri',
      ],
    },
  ],
};

/**
 * Untuk pangkat selain IPDA ke atas (Bintara, Tamtama, ASN/PNS), pilihan di dalam struktur Polri
 * cukup Staf atau ADC (serta opsi Eksternal Polri untuk ketik manual).
 */
export const NON_OFFICER_JABATAN_GROUPS: JabatanGroupOption[] = [
  {
    group: 'Jabatan Pelaksana / Pendamping Dalam Struktur Polri',
    options: ['Staf', 'ADC'],
  },
];

/**
 * Mengembalikan grup pilihan dropdown Jabatan berdasarkan pangkat.
 */
export function getJabatanGroupsForPangkat(
  pangkat?: string | null,
  nrp?: string | null
): JabatanGroupOption[] {
  const cleanRank = (pangkat || '').trim();
  if (isOfficerRankIpdaUp(cleanRank)) {
    // Match exact rank key
    const matchedKey =
      OFFICER_RANKS_IPDA_UP.find(
        (r) => r.toLowerCase().replace(/\./g, '') === cleanRank.toLowerCase().replace(/\./g, '')
      ) || 'Kombes Pol';
    const baseGroups = STANDAR_JABATAN_BY_PANGKAT[matchedKey] || STANDAR_JABATAN_BY_PANGKAT['Kombes Pol'];
    return [
      ...baseGroups,
      {
        group: 'Staf / Pendamping Dalam Struktur Polri',
        options: ['Staf', 'ADC'],
      },
    ];
  }

  // Selain IPDA ke atas (Bintara, Tamtama, ASN/PNS) -> cukup Staf atau ADC
  return NON_OFFICER_JABATAN_GROUPS;
}

/**
 * Mengecek apakah suatu string jabatan ada di daftar pilihan dropdown standar untuk pangkat tersebut.
 */
export function isStandardPolriJabatan(
  jabatan?: string | null,
  pangkat?: string | null,
  nrp?: string | null
): boolean {
  if (!jabatan || !jabatan.trim()) return false;
  const trimmed = jabatan.trim();
  const groups = getJabatanGroupsForPangkat(pangkat, nrp);
  return groups.some((g) => g.options.includes(trimmed));
}

/**
 * Mengkategorikan jabatan personel untuk keperluan perhitungan statistik (Tour of Duty & Anev)
 * agar tidak salah hitung meskipun ada penugasan luar struktur atau jabatan spesifik kewilayahan.
 */
export function classifyJabatanForStats(
  jabatan?: string | null,
  pangkat?: string | null,
  tipeSatker?: string | null
): string {
  const j = (jabatan || '').trim();
  const jLower = j.toLowerCase();

  if (!isOfficerRankIpdaUp(pangkat)) {
    if (jLower.includes('adc') || jLower.includes('ajudan') || jLower.includes('spri') || jLower.includes('walpri')) {
      return 'ADC / Ajudan';
    }
    return 'Staf / Pelaksana';
  }

  if (
    tipeSatker === 'KEMEN/LEMBAGA' ||
    jLower.includes('bnn') ||
    jLower.includes('kpk') ||
    jLower.includes('bnpt') ||
    jLower.includes('bin ') ||
    jLower.includes('bakamla') ||
    jLower.includes('kementerian') ||
    jLower.includes('deputi') ||
    jLower.includes('eksternal')
  ) {
    return 'Penugasan Luar Struktur (Eksternal Polri)';
  }

  if (jLower.startsWith('kapolri') || jLower.startsWith('wakapolri')) return 'Pimpinan Polri (Kapolri/Wakapolri)';
  if (jLower.startsWith('kapolda') || jLower.startsWith('wakapolda')) return 'Kapolda / Wakapolda';
  if (
    jLower.startsWith('kabareskrim') ||
    jLower.startsWith('wakabareskrim') ||
    jLower.startsWith('kakortastipidkor') ||
    jLower.startsWith('wakakortastipidkor') ||
    jLower.startsWith('kabaintelkam') ||
    jLower.startsWith('kabaharkam') ||
    jLower.startsWith('kalemdiklat') ||
    jLower.startsWith('dankorbrimob') ||
    jLower.startsWith('kakorlantas') ||
    jLower.startsWith('kadensus') ||
    jLower.startsWith('irwasum') ||
    jLower.startsWith('astama') ||
    jLower.startsWith('as sdm') ||
    jLower.startsWith('aslog') ||
    jLower.startsWith('kadiv')
  ) {
    return 'Pimpinan Satker Mabes (Kaba/Kakor/Kadiv/As)';
  }
  if (jLower.startsWith('karo') || jLower.startsWith('irwil') || jLower.startsWith('irwasda') || jLower.startsWith('kapus') || jLower.startsWith('sespus')) {
    return 'Karo / Irwil / Irwasda / Kapus';
  }
  if (jLower.startsWith('dir') || jLower.startsWith('wadir')) {
    return 'Direktur / Wakil Direktur (Mabes & Polda)';
  }
  if (jLower.startsWith('kapolrestabes') || jLower.startsWith('kapolresta') || jLower.startsWith('kapolres') || jLower.startsWith('wakapolres')) {
    return 'Kapolres / Kapolrestabes / Wakapolres';
  }
  if (jLower.startsWith('kasubdit')) {
    return 'Kasubdit (Mabes & Polda)';
  }
  if (jLower.startsWith('kabag')) {
    return 'Kabag (Mabes, Polda & Polres)';
  }
  if (jLower.startsWith('kabid') || jLower.startsWith('kasubbid')) {
    return 'Kabid / Kasubbid (Mabes & Polda)';
  }
  if (jLower.startsWith('kaden') || jLower.startsWith('dansat') || jLower.startsWith('danpas') || jLower.startsWith('kasat')) {
    return 'Dansat / Kaden / Kasat';
  }
  if (jLower.startsWith('kasubbag') || jLower.startsWith('kaur') || jLower.startsWith('paur') || jLower.startsWith('pamin')) {
    return 'Kasubbag / Kaur / Paur / Pamin';
  }
  if (jLower.startsWith('kapolsek') || jLower.startsWith('wakapolsek') || jLower.startsWith('kanit') || jLower.startsWith('kasubnit') || jLower.startsWith('panit')) {
    return 'Kapolsek / Kanit / Kasubnit / Panit';
  }
  if (jLower.includes('penyidik') || jLower.includes('widyaiswara') || jLower.includes('auditor') || jLower.includes('analis') || jLower.includes('dosen')) {
    return 'Jabatan Fungsional (Penyidik/Auditor/Analis/Dosen)';
  }
  if (jLower === 'adc' || jLower.includes('ajudan')) {
    return 'ADC / Ajudan';
  }
  return 'Perwira / Staf Polri';
}
