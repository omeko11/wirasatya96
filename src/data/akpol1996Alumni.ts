import { AnggotaWiraSatya, AuthUser, IuranAnggota, PendingRegistration } from '@/types';
import { calculateRetirement58, stripRankFromName } from '@/lib/avatarUtils';

export interface RawAkpol96Officer {
  no: number;
  nama: string; // Hanya Nama Lengkap & Gelar Akademik (Tanpa Pangkat)
  pangkat: string; // Pangkat Saat Ini (Irjen Pol / Brigjen Pol / Kombes Pol / AKBP)
  nrp?: string; // NRP Asli 8 Digit (jika terverifikasi publik)
  tanggalLahir?: string; // YYYY-MM-DD
  tempatLahir?: string;
  jabatan: string; // Jabatan Saat Ini (Update 2024–2026)
  satker: string;
  polda: string;
  tipeSatker: 'MABES' | 'POLDA' | 'POLRES/TA/BES' | 'KEMEN/LEMBAGA';
}

export const RAW_AKPOL_1996_ALUMNI: RawAkpol96Officer[] = [
  { no: 1, nama: 'Boy Heriyanto, S.I.K.', pangkat: 'AKBP', jabatan: 'Almarhum (Eks Kasubdit 2 Ditreskrimum Polda Aceh)', satker: 'Ditreskrimum Polda Aceh', polda: 'POLDA ACEH', tipeSatker: 'POLDA' },
  { no: 2, nama: 'Deni Yuhasdi, S.H., S.I.K.', pangkat: 'Kombes Pol', nrp: '72050501', tanggalLahir: '1972-05-15', jabatan: 'Karorena Polda Sumatera Barat', satker: 'Rorena Polda Sumbar', polda: 'POLDA SUMATERA BARAT', tipeSatker: 'POLDA' },
  { no: 3, nama: 'Adarma Sinaga, S.I.K., M.Hum.', pangkat: 'Kombes Pol', tanggalLahir: '1974-04-28', jabatan: 'Dansat Brimob Polda Papua', satker: 'Satbrimob Polda Papua', polda: 'POLDA PAPUA', tipeSatker: 'POLDA' },
  { no: 4, nama: 'Enriko Sugiharto Silalahi, S.I.K., M.Kn.', pangkat: 'Kombes Pol', jabatan: 'Irbidjemenopsnal II Itwil IV Itwasum Polri', satker: 'Itwasum Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 5, nama: 'Herri Rio Prasetyo, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Pamen Lemdiklat Polri (Dik Sespimti)', satker: 'Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 6, nama: 'Petrus Canisius Elva Setyasto, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Auditor Kepolisian Madya Itwasda Polda Sulsel', satker: 'Itwasda Polda Sulsel', polda: 'POLDA SULAWESI SELATAN', tipeSatker: 'POLDA' },
  { no: 7, nama: 'Ary Donny Setiawan, S.I.K., M.H.', pangkat: 'Brigjen Pol', nrp: '75020377', tanggalLahir: '1975-02-15', jabatan: 'Direktur Aparatur Negara Deputi Bidang Intelijen BIN', satker: 'Badan Intelijen Negara (BIN)', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 8, nama: 'Ferry Raimond Ukoli, S.I.K.', pangkat: 'Kombes Pol', tempatLahir: 'Manado', jabatan: 'Karo Ops Polda Sulawesi Utara', satker: 'Roops Polda Sulut', polda: 'POLDA SULAWESI UTARA', tipeSatker: 'POLDA' },
  { no: 9, nama: 'Hadi Wicaksono, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Pamen Polda Riau', satker: 'Polda Riau', polda: 'POLDA RIAU', tipeSatker: 'POLDA' },
  { no: 10, nama: 'Puji Hendro Wibowo, S.H., S.I.K., CHRMP.', pangkat: 'Brigjen Pol', nrp: '75020376', tanggalLahir: '1975-02-15', jabatan: 'Kabag Opsnal dan TIK Korpolairud Baharkam Polri', satker: 'Korpolairud Baharkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 11, nama: 'Teguh Hardiyo Wibisono, S.I.K., M.Si.', pangkat: 'Kombes Pol', nrp: '73080754', tanggalLahir: '1973-08-15', jabatan: 'Analis Kebijakan Madya Bidang Brimob Korbrimob Polri', satker: 'Korbrimob Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 12, nama: 'Armaini, S.I.K., M.Si.', pangkat: 'Brigjen Pol', nrp: '74080668', tanggalLahir: '1974-08-18', tempatLahir: 'Banda Aceh', jabatan: 'Widyaiswara Kepolisian Utama Tk. II Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 13, nama: 'Berliando, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kepala BNNK Pekanbaru', satker: 'BNNK Pekanbaru', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 14, nama: 'Charles Panuju Sinaga, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabid Pemberantasan BNNP Sumatera Utara', satker: 'BNNP Sumatera Utara', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 15, nama: 'Danu Waspodo, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dansat Brimob Polda Gorontalo', satker: 'Satbrimob Polda Gorontalo', polda: 'POLDA GORONTALO', tipeSatker: 'POLDA' },
  { no: 16, nama: 'Andrie Satriagraha, S.H., S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Penata Kebijakan Kapolri Madya Tk. III', satker: 'Mabes Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 17, nama: 'Kamal Bahtiar, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Wadirbinmas Polda Jawa Timur', satker: 'Ditbinmas Polda Jatim', polda: 'POLDA JAWA TIMUR', tipeSatker: 'POLDA' },
  { no: 18, nama: 'Wibowo, S.I.K., M.Hum.', pangkat: 'Irjen Pol', nrp: '73090608', tanggalLahir: '1973-09-24', tempatLahir: 'Jakarta', jabatan: 'Widyaiswara Kepolisian Utama Tk. I Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 19, nama: 'Yoga Yulian, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Auditor Kepolisian Madya Tk. III Itwasda Polda Jambi', satker: 'Itwasda Polda Jambi', polda: 'POLDA JAMBI', tipeSatker: 'POLDA' },
  { no: 20, nama: 'Dr. FX. Bhirawa Braja Paksa, S.I.K., M.H.', pangkat: 'Brigjen Pol', nrp: '74080673', tanggalLahir: '1974-08-06', tempatLahir: 'Jakarta', jabatan: 'Widyaiswara Kepolisian Utama Tk. II Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 21, nama: 'Munggaran Kartayuga, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Log Rorenmin Lemdiklat Polri', satker: 'Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 22, nama: 'Andy Ervyn, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '73020675', tanggalLahir: '1973-02-27', tempatLahir: 'Jakarta', jabatan: 'Dirintelkam Polda Bali', satker: 'Ditintelkam Polda Bali', polda: 'POLDA BALI', tipeSatker: 'POLDA' },
  { no: 23, nama: 'Kristovo Arianto Widi Purnomo, S.I.K., S.H., M.Si.', pangkat: 'AKBP', jabatan: 'Almarhum (Eks Wadirresnarkoba Polda NTB)', satker: 'Ditresnarkoba Polda NTB', polda: 'POLDA NUSA TENGGARA BARAT', tipeSatker: 'POLDA' },
  { no: 24, nama: 'Mochamad Akbar, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Pamen Baintelkam Polri', satker: 'Baintelkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 25, nama: 'Mohamad Rendra Salipu, S.I.K., M.Si.', pangkat: 'Kombes Pol', nrp: '75050528', tanggalLahir: '1975-05-31', tempatLahir: 'Ambon', jabatan: 'Dansat Brimob Polda Sumatera Utara', satker: 'Satbrimob Polda Sumut', polda: 'POLDA SUMATERA UTARA', tipeSatker: 'POLDA' },
  { no: 26, nama: 'Sonny Mahar Budi Adityawan, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '75030458', tanggalLahir: '1975-03-08', jabatan: 'Kapolrestabes Palembang', satker: 'Polrestabes Palembang', polda: 'POLDA SUMATERA SELATAN', tipeSatker: 'POLRES/TA/BES' },
  { no: 27, nama: 'Yan Budi Jaya, S.I.K., M.M.', pangkat: 'Kombes Pol', jabatan: 'Dosen Utama STIK Lemdiklat Polri', satker: 'STIK Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 28, nama: 'Barliansyah, S.I.K., M.H.', pangkat: 'Kombes Pol', tanggalLahir: '1974-04-15', jabatan: 'Widyaiswara Kepolisian Madya Tk. III Sespimmen Lemdiklat Polri', satker: 'Sespimmen Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 29, nama: 'Hermawan, S.I.K., M.M.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit 1 Ditreskrimsus Polda Babel', satker: 'Ditreskrimsus Polda Babel', polda: 'POLDA KEP. BANGKA BELITUNG', tipeSatker: 'POLDA' },
  { no: 30, nama: 'Ivan Adhityas Nugraha, S.I.K., M.Si.', pangkat: 'Brigjen Pol', tanggalLahir: '1974-06-25', jabatan: 'Widyaiswara Kepolisian Utama Tk. II Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 31, nama: 'Kunto Adjie, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Bin Opsnal Ditpolair Polda Babel', satker: 'Ditpolair Polda Babel', polda: 'POLDA KEP. BANGKA BELITUNG', tipeSatker: 'POLDA' },
  { no: 32, nama: 'Purwanto, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit 2 Ditreskrimum Polda Babel', satker: 'Ditreskrimum Polda Babel', polda: 'POLDA KEP. BANGKA BELITUNG', tipeSatker: 'POLDA' },
  { no: 33, nama: 'Ronny Lumban Gaol, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dirsamapta Polda Bali', satker: 'Ditsamapta Polda Bali', polda: 'POLDA BALI', tipeSatker: 'POLDA' },
  { no: 34, nama: 'Udin Jaenuddin, S.I.K., M.H.', pangkat: 'Kombes Pol', tanggalLahir: '1971-01-15', jabatan: 'Inspektur Lemhannas RI', satker: 'Lemhannas RI', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 35, nama: 'Andhika Vishnu, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabidyanmas Baintelkam Polri', satker: 'Baintelkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 36, nama: 'Imam Suhadi, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dansatbantek Pasgegana Korbrimob Polri', satker: 'Korbrimob Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 37, nama: 'Andy Reynold Rumahorbo, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Navigator Laut Madya Tk. II Baharkam Polri', satker: 'Korpolairud Baharkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 38, nama: 'Didik Supranoto, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '72070705', tanggalLahir: '1972-07-15', jabatan: 'Kabid Humas Polda Sulawesi Selatan', satker: 'Bidhumas Polda Sulsel', polda: 'POLDA SULAWESI SELATAN', tipeSatker: 'POLDA' },
  { no: 39, nama: 'Dr. Faizal Ramadhani, S.Sos., S.I.K., M.H.', pangkat: 'Irjen Pol', nrp: '74100557', tanggalLahir: '1974-10-04', tempatLahir: 'Purworejo', jabatan: 'Widyaiswara Kepolisian Utama Tk. I Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 40, nama: 'Joko Tutukonoto, S.H., S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Karorena Polda Sulawesi Selatan', satker: 'Rorena Polda Sulsel', polda: 'POLDA SULAWESI SELATAN', tipeSatker: 'POLDA' },
  { no: 41, nama: 'Mohammad Renaldi, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit 1 Ditintelkam Polda Lampung', satker: 'Ditintelkam Polda Lampung', polda: 'POLDA LAMPUNG', tipeSatker: 'POLDA' },
  { no: 42, nama: 'Riyadi Nugroho, S.I.K.', pangkat: 'Kombes Pol', tempatLahir: 'Bandar Lampung', jabatan: 'Karo SDM Polda Sumatera Barat', satker: 'Biro SDM Polda Sumbar', polda: 'POLDA SUMATERA BARAT', tipeSatker: 'POLDA' },
  { no: 43, nama: 'Arie Ardian Rishadi, S.I.K., M.Si.', pangkat: 'Irjen Pol', nrp: '75020379', tanggalLahir: '1975-02-01', tempatLahir: 'Karawang', jabatan: 'Kakortastipidkor Polri', satker: 'Kortastipidkor Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 44, nama: 'Arsdo Ever Parlindungan Simatupang, S.I.K., S.H.', pangkat: 'Kombes Pol', tanggalLahir: '1973-01-22', tempatLahir: 'Jakarta', jabatan: 'Kabagkerma Robinopsnal Baharkam Polri', satker: 'Baharkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 45, nama: 'Dasuki Herlambang, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '74120638', tanggalLahir: '1972-12-10', tempatLahir: 'Medan', jabatan: 'Kabagbanops Densus 88 AT Polri', satker: 'Densus 88 AT Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 46, nama: 'Dr. Irvan Prawira Satyaputra, S.I.K., M.Si., C.P.H.R.', pangkat: 'Brigjen Pol', nrp: '75050526', tanggalLahir: '1975-05-19', tempatLahir: 'Sukabumi', jabatan: 'Karojianstra SSDM Polri', satker: 'SSDM Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 47, nama: 'Adiwijaya, S.I.K.', pangkat: 'Brigjen Pol', nrp: '74030649', tanggalLahir: '1974-03-15', jabatan: 'Widyaiswara Kepolisian Utama Tk. II Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 48, nama: 'Eka Mulyana, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '74030646', tanggalLahir: '1974-03-15', jabatan: 'Dirsamapta Polda Kalimantan Timur', satker: 'Ditsamapta Polda Kaltim', polda: 'POLDA KALIMANTAN TIMUR', tipeSatker: 'POLDA' },
  { no: 49, nama: 'Agung Kurniawan, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dirpamobvit Polda Bengkulu', satker: 'Ditpamobvit Polda Bengkulu', polda: 'POLDA BENGKULU', tipeSatker: 'POLDA' },
  { no: 50, nama: 'Budi Susarwo, S.I.K., S.H.', pangkat: 'Kombes Pol', jabatan: 'Auditor Kepolisian Madya Tk. III Itwasda Polda Jawa Barat', satker: 'Itwasda Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 51, nama: 'Didit Eko Herawanto, S.H., S.I.K.', pangkat: 'Kombes Pol', nrp: '74090553', tanggalLahir: '1974-09-15', jabatan: 'Wadirpolairud Polda Jawa Barat', satker: 'Ditpolairud Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 52, nama: 'Dr. Bagus Setiyono, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '72110543', tanggalLahir: '1972-11-15', jabatan: 'Dirpamobvit Polda Nusa Tenggara Barat', satker: 'Ditpamobvit Polda NTB', polda: 'POLDA NUSA TENGGARA BARAT', tipeSatker: 'POLDA' },
  { no: 53, nama: 'Deni Okvianto, S.I.K., S.H., M.H.', pangkat: 'Kombes Pol', nrp: '74100549', tanggalLahir: '1974-10-10', tempatLahir: 'Pekanbaru', jabatan: 'Almarhum (Wafat 27 Juni 2025 / Eks Dirreskrimsus Polda Jabar)', satker: 'Ditreskrimsus Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 54, nama: 'Esmed Eryadi, S.H., S.I.K., M.M.', pangkat: 'Brigjen Pol', nrp: '75060703', tanggalLahir: '1975-06-03', tempatLahir: 'Bengkulu Selatan', jabatan: 'Pati Divkum Polri (Penugasan Staf Khusus Ketua DPD RI)', satker: 'DPD RI / Divkum Polri', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 55, nama: 'Mukhamad Safei, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '75040492', tanggalLahir: '1975-04-15', jabatan: 'Karolog Polda Kalimantan Selatan', satker: 'Rolog Polda Kalsel', polda: 'POLDA KALIMANTAN SELATAN', tipeSatker: 'POLDA' },
  { no: 56, nama: 'Mustika Zaman, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '74090545', tanggalLahir: '1974-09-15', jabatan: 'Auditor Kepolisian Madya Tk. II Itwasum Polri', satker: 'Itwasum Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 57, nama: 'Nurbaja, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Jarlat Sespimma Sespim Lemdiklat Polri', satker: 'Sespimma Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 58, nama: 'Syahrial M. Said, S.I.K., S.H.', pangkat: 'Kombes Pol', jabatan: 'Analis Utama Puslitbang Polri', satker: 'Puslitbang Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 59, nama: 'Wahyu Imam Santoso, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Waka SPN Polda Banten', satker: 'SPN Polda Banten', polda: 'POLDA BANTEN', tipeSatker: 'POLDA' },
  { no: 60, nama: 'Wingky Adhityo Kusumo, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kaprodi Diploma Ditprog Sarjana STIK Lemdiklat Polri', satker: 'STIK Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 61, nama: 'Dodi Darjanto, S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '74120631', tanggalLahir: '1974-12-15', jabatan: 'Peneliti Ilmu Kepolisian Madya Puslitbang Polri', satker: 'Puslitbang Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 62, nama: 'Sarif Rahman, S.I.K., M.M.', pangkat: 'Kombes Pol', jabatan: 'Widyaiswara Kepolisian Madya Tk. I Sespimti Lemdiklat Polri', satker: 'Sespimti Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 63, nama: 'Agung Aristyawan Adhi, S.I.K., S.H., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabid Kerja Sama Bilateral Pasifik & Oseania Deputi II Kemenko Polkam RI', satker: 'Kemenko Polkam RI', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 64, nama: 'Dedy Sumarsono, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabidkum Polda Papua', satker: 'Bidkum Polda Papua', polda: 'POLDA PAPUA', tipeSatker: 'POLDA' },
  { no: 65, nama: 'Frenky Yusandhy, S.I.K., M.A.', pangkat: 'Kombes Pol', jabatan: 'Pamen Yanma Polri (Eks Ka SPN Polda Sumut)', satker: 'Yanma Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 66, nama: 'Wahyu Agung Jatmiko, S.H., S.I.K., M.Si.', pangkat: 'Kombes Pol', nrp: '74080674', tanggalLahir: '1974-08-15', jabatan: 'Kabagprodok Ropaminal Divpropam Polri', satker: 'Divpropam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 67, nama: 'Heru Budi Prasetyo, S.I.K., M.Hum.', pangkat: 'Kombes Pol', jabatan: 'Karo SDM Polda Jawa Timur', satker: 'Biro SDM Polda Jatim', polda: 'POLDA JAWA TIMUR', tipeSatker: 'POLDA' },
  { no: 68, nama: 'Mochamat Soenardi, S.I.K., M.Si.', pangkat: 'Kombes Pol', jabatan: 'Agen Intelijen Kepolisian Madya Tk. II Baintelkam Polri', satker: 'Baintelkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 69, nama: 'Muhammad Aldian, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Dirlantas Polda Jawa Tengah', satker: 'Ditlantas Polda Jateng', polda: 'POLDA JAWA TENGAH', tipeSatker: 'POLDA' },
  { no: 70, nama: 'Sucahyo Hadi, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Analis Kebijakan Madya Bidang Sespimmen Lemdiklat Polri', satker: 'Sespimmen Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 71, nama: 'Yandri Irsan, S.H., S.I.K., M.Si.', pangkat: 'Kombes Pol', nrp: '74090547', tanggalLahir: '1974-09-15', jabatan: 'Karolog Polda Metro Jaya', satker: 'Rolog Polda Metro Jaya', polda: 'POLDA METRO JAYA', tipeSatker: 'POLDA' },
  { no: 72, nama: 'Sumaryono, S.H., S.I.K., M.H.', pangkat: 'Brigjen Pol', nrp: '74090546', tanggalLahir: '1974-09-02', tempatLahir: 'Surabaya', jabatan: 'Karobinopsnal Bareskrim Polri', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 73, nama: 'Ahmad Yanuari Insan, S.I.K., M.Si.', pangkat: 'Kombes Pol', nrp: '75010581', tanggalLahir: '1975-01-15', jabatan: 'Dirlantas Polda Kalimantan Timur', satker: 'Ditlantas Polda Kaltim', polda: 'POLDA KALIMANTAN TIMUR', tipeSatker: 'POLDA' },
  { no: 74, nama: 'Jansen Avitus Panjaitan, S.I.K., M.H.', pangkat: 'Kombes Pol', tanggalLahir: '1975-08-01', tempatLahir: 'Medan', jabatan: 'Analis Kebijakan Madya Bidang PID Divhumas Polri', satker: 'Divhumas Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 75, nama: 'Muhammad Arif Sugiarto, S.I.K., M.P.P., M.H.', pangkat: 'Brigjen Pol', nrp: '75010582', tanggalLahir: '1975-01-15', jabatan: 'Widyaiswara Kepolisian Utama Tk. II Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 76, nama: 'Akmadi, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabid Humas Polda Riau', satker: 'Bidhumas Polda Riau', polda: 'POLDA RIAU', tipeSatker: 'POLDA' },
  { no: 77, nama: 'Parojahan Simanjuntak, S.I.K., M.E., M.H.', pangkat: 'Kombes Pol', nrp: '71090450', tanggalLahir: '1971-09-15', jabatan: 'Auditor Sispamobvitnas Madya Tk. I Baharkam Polri', satker: 'Baharkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 78, nama: 'Sigit Hari Wibowo, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Dirlantas Polda Papua Barat Daya', satker: 'Ditlantas Polda Papua Barat Daya', polda: 'POLDA PAPUA BARAT', tipeSatker: 'POLDA' },
  { no: 79, nama: 'Sony Sanjaya, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Bin Opsnal Ditresnarkoba Polda NTB', satker: 'Ditresnarkoba Polda NTB', polda: 'POLDA NUSA TENGGARA BARAT', tipeSatker: 'POLDA' },
  { no: 80, nama: 'Bambang Kusnarianto, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Tim Asistensi Puskeu Polri', satker: 'Puskeu Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 81, nama: 'Danang Beny Kuspriandono, S.I.K., M.H., CPM.', pangkat: 'Kombes Pol', tanggalLahir: '1975-02-15', jabatan: 'Analis Kebijakan Madya Bidang Watpers SSDM Polri', satker: 'SSDM Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 82, nama: 'I Ketut Agus Kusmayadi, S.I.K., S.H., M.H.', pangkat: 'Kombes Pol', nrp: '74080669', tanggalLahir: '1974-08-15', jabatan: 'Pemeriksa Propam Madya Tk. III Divpropam Polri', satker: 'Divpropam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 83, nama: 'Joko Bintoro, S.H., S.I.K., M.H.', pangkat: 'Kombes Pol', nrp: '73030682', tanggalLahir: '1973-03-15', jabatan: 'Dirpamobvit Polda Kalimantan Utara', satker: 'Ditpamobvit Polda Kaltara', polda: 'POLDA KALIMANTAN UTARA', tipeSatker: 'POLDA' },
  { no: 84, nama: 'Kuswoto, S.I.K.', pangkat: 'Kombes Pol', nrp: '74100559', tanggalLahir: '1974-10-15', jabatan: 'Kabag Jemen PB/J Roada B/J Slog Polri', satker: 'Slog Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 85, nama: 'Muhamad Erwin, S.I.K., S.H., M.Si.', pangkat: 'Kombes Pol', jabatan: 'Penata Kebijakan Kapolri Madya Tk. II Stamaops Polri', satker: 'Stamaops Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 86, nama: 'Mochammad Hari Mulyanto, S.I.K., M.M.', pangkat: 'Kombes Pol', jabatan: 'Widyaiswara Kepolisian Madya Tk. II Sespimmen Lemdiklat Polri', satker: 'Sespimmen Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 87, nama: 'Moh. Samsu Arifin, S.I.K., M.H.', pangkat: 'Brigjen Pol', jabatan: 'Kapusiknas Bareskrim Polri', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 88, nama: 'Erick Kadir Sully, S.I.K.', pangkat: 'Kombes Pol', nrp: '74090555', tanggalLahir: '1974-09-15', jabatan: 'Dirbinmas Polda Papua', satker: 'Ditbinmas Polda Papua', polda: 'POLDA PAPUA', tipeSatker: 'POLDA' },
  { no: 89, nama: 'Aman Guntoro, S.I.K., M.H.', pangkat: 'Kombes Pol', tanggalLahir: '1974-12-17', tempatLahir: 'Bogor', jabatan: 'Analis Kebijakan Madya Bidang Pidana Narkoba Bareskrim Polri', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 90, nama: 'Harold Wilson Huwae, S.I.K.', pangkat: 'Kombes Pol', tanggalLahir: '1974-08-15', tempatLahir: 'Ambon', jabatan: 'Kabag Jemenmutu Puslabfor Bareskrim Polri', satker: 'Puslabfor Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 91, nama: 'Komaruz Zaman, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Karo Ops Polda Nusa Tenggara Timur', satker: 'Roops Polda NTT', polda: 'POLDA NUSA TENGGARA TIMUR', tipeSatker: 'POLDA' },
  { no: 92, nama: 'Yanuar Widianto, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Analis Kebijakan Madya Bidang Ekonomi Baintelkam Polri', satker: 'Baintelkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 93, nama: 'Adhi Purboyo, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabiddaktikrim Pusinafis Bareskrim Polri', satker: 'Pusinafis Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 94, nama: 'Duhri Akbar Nur, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Analis Kebijakan Madya Bidang Pidum Bareskrim Polri', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 95, nama: 'Dwi Prihanto, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Auditor Kepolisian Madya Tk. III Itwasda Polda D.I. Yogyakarta', satker: 'Itwasda Polda DIY', polda: 'POLDA D.I. YOGYAKARTA', tipeSatker: 'POLDA' },
  { no: 96, nama: 'Zaenuddin Agus Binarto, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Auditor Kepolisian Madya Tk. III Itwasda Polda Sulawesi Selatan', satker: 'Itwasda Polda Sulsel', polda: 'POLDA SULAWESI SELATAN', tipeSatker: 'POLDA' },
  { no: 97, nama: 'Heru Pramukarno, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Invent Ropal Slog Polri', satker: 'Slog Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 98, nama: 'Kuntoro Hermawan Mangunwidjojo, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dirbinmas Polda Papua Barat Daya', satker: 'Ditbinmas Polda Papua Barat Daya', polda: 'POLDA PAPUA BARAT', tipeSatker: 'POLDA' },
  { no: 99, nama: 'Eri Dwi Hariyanto, S.I.K.', pangkat: 'Kombes Pol', tanggalLahir: '1975-01-24', tempatLahir: 'Magelang', jabatan: 'Pengawas Penyidikan Kepolisian Madya Tk. II Bareskrim Polri', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 100, nama: 'Yudi Gunawan, S.H., S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Wadirpolairud Polda Jawa Barat', satker: 'Ditpolairud Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 101, nama: 'Jansen Sitohang, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabidkum Polda Jawa Tengah', satker: 'Bidkum Polda Jateng', polda: 'POLDA JAWA TENGAH', tipeSatker: 'POLDA' },
  { no: 102, nama: 'Saiful Bahri, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Bin Opsnal Ditlantas Polda Gorontalo', satker: 'Ditlantas Polda Gorontalo', polda: 'POLDA GORONTALO', tipeSatker: 'POLDA' },
  { no: 103, nama: 'Antonius Danang Heruwibowo, S.H., S.I.K., M.M.', pangkat: 'Kombes Pol', jabatan: 'Penata Kebijakan Kapolri Madya Tk. II Sahli Kapolri', satker: 'Sahli Kapolri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 104, nama: 'Darmawan Affandy, S.I.K., M.M.', pangkat: 'Kombes Pol', jabatan: 'Analis Kebijakan Madya Bidang Sabhara Baharkam Polri (PPRA Lemhannas)', satker: 'Baharkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 105, nama: 'Dr. Pambudi, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabidkum Polda Bengkulu', satker: 'Bidkum Polda Bengkulu', polda: 'POLDA BENGKULU', tipeSatker: 'POLDA' },
  { no: 106, nama: 'Muhammad Ridwan, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Dansat Brimob Polda Kalimantan Barat', satker: 'Satbrimob Polda Kalbar', polda: 'POLDA KALIMANTAN BARAT', tipeSatker: 'POLDA' },
  { no: 107, nama: 'Raspani, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dirpolairud Polda Jawa Tengah', satker: 'Ditpolairud Polda Jateng', polda: 'POLDA JAWA TENGAH', tipeSatker: 'POLDA' },
  { no: 108, nama: 'Singgih Rachmanto, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabidkeu Polda Jawa Timur', satker: 'Bidkeu Polda Jatim', polda: 'POLDA JAWA TIMUR', tipeSatker: 'POLDA' },
  { no: 109, nama: 'Bramono Purnomo Nugroho, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Penata Kebijakan Kapolri Madya Tk. III Sahli Kapolri', satker: 'Sahli Kapolri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 110, nama: 'Dwi Yanto Nugroho, S.I.K., M.Han.', pangkat: 'Kombes Pol', jabatan: 'Dansat Brimob Polda Jawa Timur', satker: 'Satbrimob Polda Jatim', polda: 'POLDA JAWA TIMUR', tipeSatker: 'POLDA' },
  { no: 111, nama: 'Suroso, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit 4 Renakta Ditreskrimum Polda Kaltim', satker: 'Ditreskrimum Polda Kaltim', polda: 'POLDA KALIMANTAN TIMUR', tipeSatker: 'POLDA' },
  { no: 112, nama: 'Brury Soekotjo Adhyakso Putro, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Teknisi KBR Madya Tk. I Korbrimob Polri', satker: 'Korbrimob Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 113, nama: 'Guno Pitoyo, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Kabid Rikwastu Puslitbang Polri', satker: 'Puslitbang Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 114, nama: 'Joko Sadono, S.H., S.I.K., M.H., M.Han.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit Patroli Air Ditpolair Korpolairud Baharkam Polri', satker: 'Korpolairud Baharkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 115, nama: 'Sigit Kumoro, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabag Binopsnal Ditresnarkoba Polda Kalimantan Selatan', satker: 'Ditresnarkoba Polda Kalsel', polda: 'POLDA KALIMANTAN SELATAN', tipeSatker: 'POLDA' },
  { no: 116, nama: 'Dr. Hendra Wirawan, S.H., S.I.K., M.H.', pangkat: 'Brigjen Pol', tanggalLahir: '1974-08-15', jabatan: 'Wakapolda Kalimantan Tengah', satker: 'Polda Kalimantan Tengah', polda: 'POLDA KALIMANTAN TENGAH', tipeSatker: 'POLDA' },
  { no: 117, nama: 'Andy Nurwandy, S.I.K.', pangkat: 'AKBP', jabatan: 'Almarhum (Eks Kasubbid Oras Bid Yanmas Baintelkam Polri)', satker: 'Baintelkam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 118, nama: 'Budhi Rohmat, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabid Humas Polda Kalimantan Tengah', satker: 'Bidhumas Polda Kalteng', polda: 'POLDA KALIMANTAN TENGAH', tipeSatker: 'POLDA' },
  { no: 119, nama: 'Moh. Sjururi, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit 3 Ditintelkam Polda Kalteng', satker: 'Ditintelkam Polda Kalteng', polda: 'POLDA KALIMANTAN TENGAH', tipeSatker: 'POLDA' },
  { no: 120, nama: 'Muchtar Supiandi Siregar, S.I.K.', pangkat: 'AKBP', jabatan: 'Almarhum (Eks Wadirreskrimum Polda Sumatera Barat)', satker: 'Ditreskrimum Polda Sumbar', polda: 'POLDA SUMATERA BARAT', tipeSatker: 'POLDA' },
  { no: 121, nama: 'Steidy Raranta, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Almarhum (Eks Kabid Humas Polda Sulawesi Utara)', satker: 'Bidhumas Polda Sulut', polda: 'POLDA SULAWESI UTARA', tipeSatker: 'POLDA' },
  { no: 122, nama: 'Muhammad Nur Syam, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kasubdit 4 Renakta Ditreskrimum Polda Kalteng', satker: 'Ditreskrimum Polda Kalteng', polda: 'POLDA KALIMANTAN TENGAH', tipeSatker: 'POLDA' },
  { no: 123, nama: 'Abas Basuni, S.I.K., M.H.', pangkat: 'Brigjen Pol', jabatan: 'Kapusjarah Polri', satker: 'Pusjarah Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 124, nama: 'Hery Susanto, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Pamen Yanma Polri', satker: 'Yanma Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 125, nama: 'Ikhlas Putro Wasono, S.I.K., M.M.', pangkat: 'Kombes Pol', tanggalLahir: '1975-07-02', tempatLahir: 'Nabire', jabatan: 'Kabid APK Puskeu Polri', satker: 'Puskeu Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 126, nama: 'Teguh Priyambodo Nugroho, S.I.K.', pangkat: 'Kombes Pol', tanggalLahir: '1975-05-15', tempatLahir: 'Surabaya', jabatan: 'Kapolresta Banda Aceh', satker: 'Polresta Banda Aceh', polda: 'POLDA ACEH', tipeSatker: 'POLRES/TA/BES' },
  { no: 127, nama: 'Erwin Fardiansyah Tossin, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabidkeu Polda Jawa Barat', satker: 'Bidkeu Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 128, nama: 'Oki Waskito, S.H., S.I.K., M.Si.', pangkat: 'Kombes Pol', jabatan: 'Kabid TIK Polda Metro Jaya', satker: 'Bid TIK Polda Metro Jaya', polda: 'POLDA METRO JAYA', tipeSatker: 'POLDA' },
  { no: 129, nama: 'Daniel Widya Mucharam, S.I.K., M.P.A.', pangkat: 'Kombes Pol', tanggalLahir: '1975-05-02', tempatLahir: 'Sukabumi', jabatan: 'Karorena Polda Riau', satker: 'Rorena Polda Riau', polda: 'POLDA RIAU', tipeSatker: 'POLDA' },
  { no: 130, nama: 'Ayep Wahyu Gunawan, S.I.K., M.Hum.', pangkat: 'Brigjen Pol', jabatan: 'Karojakstra Stamarena Polri', satker: 'Stamarena Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 131, nama: 'Budi Utomo, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kasubbag Pam Bag Pamwal Roprovos Divpropam Polri', satker: 'Divpropam Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 132, nama: 'Alfis Suhaili, S.I.K., M.Si.', pangkat: 'Kombes Pol', nrp: '74070748', tanggalLahir: '1974-07-15', jabatan: 'Irwasda Polda Kalimantan Selatan', satker: 'Itwasda Polda Kalsel', polda: 'POLDA KALIMANTAN SELATAN', tipeSatker: 'POLDA' },
  { no: 133, nama: 'Asep Guntur Rahayu, S.I.K., S.Psi., M.H.', pangkat: 'Irjen Pol', tanggalLahir: '1974-01-25', tempatLahir: 'Majalengka', jabatan: 'Deputi Bidang Penindakan dan Eksekusi KPK RI', satker: 'Bareskrim Polri / KPK RI', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 134, nama: 'Bhakti Eri Nurmansyah, S.I.K., M.Si.', pangkat: 'Brigjen Pol', nrp: '73110597', tanggalLahir: '1973-11-15', jabatan: 'Direktur Pencegahan Kortastipidkor Polri', satker: 'Kortastipidkor Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 135, nama: 'Kristian Parluhutan Siagian, S.I.K., M.Si.', pangkat: 'Brigjen Pol', nrp: '74090560', tanggalLahir: '1974-09-29', tempatLahir: 'Tarutung', jabatan: 'Dirtipidnarkoba Bareskrim Polri', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 136, nama: 'Sugeng Sudarso, S.I.K., S.H., M.M.', pangkat: 'Kombes Pol', jabatan: 'Dirresnarkoba Polda Sulawesi Selatan', satker: 'Ditresnarkoba Polda Sulsel', polda: 'POLDA SULAWESI SELATAN', tipeSatker: 'POLDA' },
  { no: 137, nama: 'Dolifar Manurung, S.I.K., M.Si.', pangkat: 'Kombes Pol', jabatan: 'Widyaiswara Kepolisian Madya Tk. I Sespimti Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 138, nama: 'Purwanto Puji Sutan, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Irwasda Polda Sulawesi Tengah', satker: 'Itwasda Polda Sulteng', polda: 'POLDA SULAWESI TENGAH', tipeSatker: 'POLDA' },
  { no: 139, nama: 'Robert Da Costa, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Sespuslabfor Bareskrim Polri', satker: 'Puslabfor Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 140, nama: 'Syamsu Bair, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Pamen Bareskrim Polri (Penugasan Kemenparekraf)', satker: 'Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 141, nama: 'Rantau Isnur Eka, S.I.K., M.M., M.H., M.Han.', pangkat: 'Brigjen Pol', nrp: '74010597', tanggalLahir: '1974-01-15', jabatan: 'Pati Korbrimob Polri / Teknisi KBR Madya Korbrimob Polri', satker: 'Korps Brimob Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 142, nama: 'Ardiansyah Daulay, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Irbidjemenopsnal II Itwil III Itwasum Polri', satker: 'Itwasum Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 143, nama: 'Basya Radyananda, S.I.K., M.H.', pangkat: 'Kombes Pol', tanggalLahir: '1974-02-20', tempatLahir: 'Jakarta', jabatan: 'Karo Ops Polda Jawa Tengah', satker: 'Roops Polda Jateng', polda: 'POLDA JAWA TENGAH', tipeSatker: 'POLDA' },
  { no: 144, nama: 'John Huntal Sarjananto Sitanggang, S.I.K., M.Han.', pangkat: 'Brigjen Pol', tanggalLahir: '1974-06-14', jabatan: 'Danpas Brimob III Korbrimob Polri', satker: 'Korps Brimob Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 145, nama: 'Zuhdi Batubara, S.I.K., M.Han.', pangkat: 'Kombes Pol', jabatan: 'Dansat Brimob Polda Jawa Barat', satker: 'Satbrimob Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 146, nama: 'Bony Johannes Sanganadi Sirait, S.I.K., M.H.', pangkat: 'Brigjen Pol', nrp: '74040739', tanggalLahir: '1974-04-15', jabatan: 'Dosen Kepolisian Utama Tk. II STIK Lemdiklat Polri', satker: 'STIK Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 147, nama: 'Dr. Eko Suprihanto, S.H., S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Direktur Akademik Akpol Lemdiklat Polri', satker: 'Akpol Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 148, nama: 'Hendra Gunawan, S.I.K., M.Si.', pangkat: 'Kombes Pol', tanggalLahir: '1973-07-19', tempatLahir: 'Jakarta', jabatan: 'Analis Kebijakan Madya Bidang Dalpers SSDM Polri', satker: 'SSDM Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 149, nama: 'RM. Satrio Wibowo, S.I.K., M.H.', pangkat: 'Brigjen Pol', nrp: '74100558', tanggalLahir: '1974-10-15', jabatan: 'Kapusdiklantas Lemdiklat Polri', satker: 'Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 150, nama: 'Slamet Hermawan, S.I.K., M.M.', pangkat: 'Kombes Pol', nrp: '74090551', tanggalLahir: '1974-09-15', jabatan: 'Dansat Jibom Pasukan Gegana Korbrimob Polri', satker: 'Pasukan Gegana Korbrimob Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 151, nama: 'Teddy Mukmin Artono, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Plt. Kabagum Rorenmin Lemdiklat Polri', satker: 'Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 152, nama: 'Yoedhoro Anandoko, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Dosen Madya Dit Akademik Akpol Lemdiklat Polri', satker: 'Akpol Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 153, nama: 'Audie Carmy Wibisana, S.I.K.', pangkat: 'Kombes Pol', jabatan: 'Kabid Fiskomfor Puslabfor Bareskrim Polri', satker: 'Puslabfor Bareskrim Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 154, nama: 'Dani Hamdani, S.I.K., M.P.M.', pangkat: 'Brigjen Pol', tanggalLahir: '1974-10-18', tempatLahir: 'Bandung', jabatan: 'Sekretaris NCB Interpol Indonesia Divhubinter Polri', satker: 'Divhubinter Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 155, nama: 'Arly Jembar Jumhana, S.I.K., S.H., M.H.', pangkat: 'Kombes Pol', nrp: '74110459', tanggalLahir: '1974-11-04', jabatan: 'Dirresnarkoba Polda Jawa Barat', satker: 'Ditresnarkoba Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 156, nama: 'Raswanto Hadiwibowo, S.I.K., M.Si.', pangkat: 'Kombes Pol', jabatan: 'Auditor Kepolisian Madya Itwil III Itwasum Polri', satker: 'Itwasum Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 157, nama: 'Dr. Aswin Azhar Siregar, S.I.K., M.Si., M.Sc.Eng., Ph.D.', pangkat: 'Kombes Pol', nrp: '74120630', tanggalLahir: '1974-12-28', jabatan: 'Kabidproftek Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 158, nama: 'Yoga Prastowo, S.I.K., M.T.', pangkat: 'Kombes Pol', jabatan: 'Kabagbindik Sespimma Sespim Lemdiklat Polri', satker: 'Sespim Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 159, nama: 'Yusuf Sutejo, S.I.K., M.T.', pangkat: 'Kombes Pol', jabatan: 'Kasatgas Humas Operasi Damai Cartenz / Anjak Madya Divhumas Polri', satker: 'Divhumas Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 160, nama: 'Dr. Alexander Sabar, S.I.K., M.H.', pangkat: 'Irjen Pol', tanggalLahir: '1975-06-07', jabatan: 'Dirjen Pengawasan Ruang Digital Kemenkomdigi RI', satker: 'Kemenkomdigi RI / Densus 88 AT Polri', polda: 'MABES POLRI', tipeSatker: 'KEMEN/LEMBAGA' },
  { no: 161, nama: 'Dwight Jordan De Fretes, S.I.K.', pangkat: 'Brigjen Pol', jabatan: 'Direktur Penyidikan (Dirsidik) Densus 88 AT Polri', satker: 'Densus 88 AT Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 162, nama: 'Edward Indharmawan Eka Chandra, S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Dirpolairud Polda Jawa Barat', satker: 'Ditpolairud Polda Jabar', polda: 'POLDA JAWA BARAT', tipeSatker: 'POLDA' },
  { no: 163, nama: 'I Ketut Budi Hendrawan, S.H., S.I.K., M.H.', pangkat: 'Kombes Pol', jabatan: 'Penjamin Mutu Pendidikan Madya Tk. I Lemdiklat Polri', satker: 'Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
  { no: 164, nama: 'Slamet Riyadi, S.H.', pangkat: 'Kombes Pol', jabatan: 'Purna Bhakti Polri (Eks Dosen Utama STIK Lemdiklat Polri)', satker: 'STIK Lemdiklat Polri', polda: 'MABES POLRI', tipeSatker: 'MABES' },
];

export const AKPOL_1996_MEMBERS: AnggotaWiraSatya[] = RAW_AKPOL_1996_ALUMNI.map((item) => {
  const legacyNrp = `7409${String(item.no).padStart(4, '0')}`;
  const nrp = item.nrp || legacyNrp;
  const cleanNama = stripRankFromName(item.nama) || item.nama;
  const pangkat = item.pangkat || 'Kombes Pol';
  const retirementCalc = calculateRetirement58(item.tanggalLahir, nrp);
  const tanggalLahir = item.tanggalLahir || retirementCalc.tanggalLahir || '1974-09-15';

  return {
    id: `ws-${legacyNrp}`,
    nrp,
    ...(nrp !== legacyNrp ? { oldNrp: legacyNrp } : {}),
    namaLengkap: cleanNama,
    pangkat,
    jabatanTerakhir: item.jabatan,
    satuanKerja: item.satker,
    tipeSatker: item.tipeSatker,
    jenisAnggota: 'ALUMNI AKPOL 1996',
    polda: item.polda,
    pendidikanTerakhir: 'Akpol 1996 / S.I.K.',
    tempatLahir: item.tempatLahir || 'Indonesia',
    tanggalLahir,
    usia: retirementCalc.usiaTahun,
    jenisKelamin: 'LAKI-LAKI',
    noHp: '',
    email: `${nrp}@polri.go.id`,
    fotoUrl: '/default-avatar.png',
    alamatTempatTinggal: item.polda,
    statusTempatTinggal: 'MILIK PRIBADI',
    statusPerkawinan: 'MENIKAH',
    jumlahAnak: 2,
    daftarAnak: [],
    tahunPurnaTugas: retirementCalc.tahunPurnaTugas,
    sisaTahunDinas: retirementCalc.sisaTahunDinas,
    alamatPurnaTugas: item.polda,
    statusRumahPurnaTugas: 'MILIK PRIBADI',
    sudahPembekalan: 'SUDAH',
    rencanaAktivitas: ['USAHA SENDIRI'],
    sumberPenghasilanPasca: ['DANA PENSIUN'],
    kecukupanDanaPensiun: 'CUKUP',
    kesiapanPensiun: 'SIAP',
    perasaanPensiun: 'OPTIMIS',
    dukunganKeluarga: 'SANGAT MENDUKUNG',
    adaPenyakitKronis: 'TIDAK ADA',
    kondisiKesehatan: 'BAIK',
    daftarPenyakit: [],
    asuransiAktif: ['BPJS', 'ASABRI'],
    rutinMcu: 'YA',
    mcuTerakhir: '< 6 BULAN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export const AKPOL_1996_USERS: AuthUser[] = RAW_AKPOL_1996_ALUMNI.map((item) => {
  const legacyNrp = `7409${String(item.no).padStart(4, '0')}`;
  const nrp = item.nrp || legacyNrp;
  const cleanNama = stripRankFromName(item.nama) || item.nama;
  const pangkat = item.pangkat || 'Kombes Pol';
  const retirementCalc = calculateRetirement58(item.tanggalLahir, nrp);
  const tanggalLahir = item.tanggalLahir || retirementCalc.tanggalLahir || '1974-09-15';

  return {
    id: `u-${legacyNrp}`,
    nrp,
    ...(nrp !== legacyNrp ? { oldNrp: legacyNrp } : {}),
    nama: cleanNama,
    pangkat,
    email: `${nrp}@polri.go.id`,
    role: 'ANGGOTA',
    profileId: `ws-${legacyNrp}`,
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    satker: item.satker,
    jabatanTerakhir: item.jabatan,
    tanggalLahir,
    polda: item.polda,
    status: 'DISETUJUI_BELUM_PASSWORD',
  };
});

export const AKPOL_1996_REGISTRATIONS: PendingRegistration[] = RAW_AKPOL_1996_ALUMNI.map((item) => {
  const legacyNrp = `7409${String(item.no).padStart(4, '0')}`;
  const nrp = item.nrp || legacyNrp;
  const cleanNama = stripRankFromName(item.nama) || item.nama;
  const pangkat = item.pangkat || 'Kombes Pol';

  return {
    id: `reg-${legacyNrp}`,
    nrp,
    nama: cleanNama,
    pangkat,
    satker: item.satker,
    polda: item.polda,
    noHp: '',
    email: `${nrp}@polri.go.id`,
    alasanDaftar: 'Data Alumni Akpol 1996 Batalyon Wira Satya (Default Role: ANGGOTA)',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Eko Agung (Superadmin)',
  };
});

export const AKPOL_1996_IURAN: IuranAnggota[] = RAW_AKPOL_1996_ALUMNI.map((item) => {
  const legacyNrp = `7409${String(item.no).padStart(4, '0')}`;
  const nrp = item.nrp || legacyNrp;
  const cleanNama = stripRankFromName(item.nama) || item.nama;
  const pangkat = item.pangkat || 'Kombes Pol';

  return {
    id: `iur-${legacyNrp}`,
    nrp,
    namaLengkap: cleanNama,
    pangkat,
    polda: item.polda,
    tahun: 2026,
    bulanTerbayar: [],
    totalTagihan: 3000000,
    totalTerbayar: 0,
    status: 'BELUM_BAYAR',
  };
});
