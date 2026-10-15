export type UserRole = 'SUPERADMIN' | 'KETUA' | 'SEKRETARIAT' | 'BENDAHARA' | 'ANGGOTA';

export type UserAccountStatus = 
  | 'PENDING_VERIFIKASI'
  | 'DISETUJUI_BELUM_PASSWORD'
  | 'AKTIF'
  | 'DITOLAK';

export type MfaMethod = 'BIOMETRIC' | 'GOOGLE_AUTH' | 'EMAIL_OTP' | 'PIN';

export interface PendingRegistration {
  id: string;
  nrp: string;
  nama: string;
  pangkat: string;
  satker: string;
  polda: string;
  noHp: string;
  email: string;
  secondaryEmail?: string;
  alasanDaftar?: string;
  status: UserAccountStatus;
  password?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface AuthUser {
  id: string;
  nrp: string;
  nama: string;
  pangkat: string;
  email: string;
  secondaryEmail?: string;
  noHp?: string;
  role: UserRole;
  profileId: string;
  mfaEnabled: boolean;
  mfaMethod: MfaMethod;
  fotoUrl?: string;
  satker?: string;
  polda?: string;
  status?: UserAccountStatus;
  password?: string;
}

export interface Anak {
  id: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  status: 'PELAJAR' | 'BEKERJA' | 'BELUM BEKERJA';
  biayaPendidikanTahunan?: '< 5.000.000' | '5.000.000 S.D. 25.000.000' | '> 25.000.000';
}

export interface TanggunganLain {
  jumlah: number;
  rincian: string;
  masaTanggungan: '< 5 TAHUN' | '5-10 TAHUN' | '> 10 TAHUN';
  adaSakitKhusus: boolean;
  rincianSakitKhusus?: string;
}

export interface AnggotaWiraSatya {
  id: string;
  // Modul 1: Identitas & Kedinasan
  nrp: string;
  namaLengkap: string;
  pangkat: string;
  jabatanTerakhir: string;
  satuanKerja: string;
  tipeSatker?: 'MABES' | 'POLDA' | 'POLRES/TA/BES' | 'KEMEN/LEMBAGA' | 'PURNA TUGAS' | 'POLSEK';
  satkerMabes?: string;
  subSatker?: string;
  namaPolres?: string;
  namaPolsek?: string;
  jenisAnggota?: 'ANGGOTA POLRI';
  polda: string;
  pendidikanTerakhir: string;
  nomorKtp?: string;
  tempatLahir: string;
  tanggalLahir: string;
  usia: number;
  jenisKelamin: 'LAKI-LAKI' | 'PEREMPUAN';
  noHp: string;
  email?: string;
  secondaryEmail?: string;
  kontakAdc?: string;
  namaAdc?: string;
  fotoUrl?: string;
  alamatTempatTinggal: string;
  statusTempatTinggal: 'MILIK PRIBADI' | 'RUMAH KELUARGA' | 'DINAS' | 'SEWA/KONTRAK';

  // Modul 2: Data Keluarga & Tanggungan
  statusPerkawinan: 'MENIKAH' | 'BELUM MENIKAH' | 'DUDA/JANDA';
  namaIstri?: string;
  tempatLahirIstri?: string;
  tanggalLahirIstri?: string;
  usiaIstri?: number;
  kontakIstri?: string;
  jumlahAnak: number;
  daftarAnak: Anak[];
  tanggunganLain?: TanggunganLain;

  // Modul 3: Persiapan Purna Tugas & Usaha
  tahunPurnaTugas: number;
  sisaTahunDinas: number;
  alamatPurnaTugas: string;
  statusRumahPurnaTugas: 'MILIK PRIBADI' | 'RUMAH KELUARGA' | 'DINAS' | 'SEWA/KONTRAK';
  detailSewaPurnaTugas?: string;
  biayaSewaTahunan?: string;
  sudahPembekalan: 'SUDAH' | 'BELUM';
  rencanaAktivitas: ('USAHA SENDIRI' | 'BEKERJA KEMBALI' | 'BERTANI/BERKEBUN' | 'MENGURUS KELUARGA')[];
  jenisUsaha?: string;
  statusUsaha?: 'SUDAH JALAN' | 'DALAM PERSIAPAN' | 'MASIH RENCANA';
  kebutuhanPembekalan?: ('MODAL' | 'PELATIHAN' | 'PENDAMPINGAN' | 'TIDAK PERLU')[];
  sumberPenghasilanPasca: ('DANA PENSIUN' | 'USAHA' | 'INVESTASI')[];
  kecukupanDanaPensiun: 'SANGAT CUKUP' | 'CUKUP' | 'KURANG';
  kesiapanPensiun: 'SANGAT SIAP' | 'SIAP' | 'KURANG SIAP' | 'BELUM SIAP';
  perasaanPensiun: 'TENANG' | 'OPTIMIS' | 'CEMAS' | 'RAGU';
  dukunganKeluarga: 'SANGAT MENDUKUNG' | 'MENDUKUNG' | 'KURANG MENDUKUNG';

  // Modul 4: Riwayat Kesehatan
  adaPenyakitKronis: 'ADA' | 'TIDAK ADA';
  kondisiKesehatan: 'SANGAT BAIK' | 'BAIK' | 'CUKUP' | 'PERLU PERHATIAN KHUSUS' | 'SAKIT';
  daftarPenyakit?: string[];
  lamaMenderita?: string;
  kondisiSaatIni?: string;
  penangananPengobatan?: string;
  biayaPengobatanDitanggung?: 'DITANGGUNG BPJS/ASURANSI' | '5.000.000 S.D. 10.000.000' | 'DI ATAS 10.000.000';
  asuransiAktif: ('ASURANSI KESEHATAN' | 'ASURANSI JIWA' | 'BPJS' | 'TIDAK ADA')[];
  rutinMcu: 'YA' | 'TIDAK';
  mcuTerakhir?: '< 6 BULAN' | '6-12 BULAN' | '> 1 TAHUN';
  kebutuhanPersiapanKesehatan?: string[];
  harapanLayananKesehatan?: string;
  harapanDukunganLeting?: string;

  createdAt: string;
  updatedAt: string;
}

export const DAFTAR_PANGKAT_POLRI = [
  // Perwira Tinggi (PATI)
  'Jenderal Polisi',
  'Komjen Pol',
  'Irjen Pol',
  'Brigjen Pol',
  // Perwira Menengah (PAMEN)
  'Kombes Pol',
  'AKBP',
  'Kompol',
  // Perwira Pertama (PAMA)
  'AKP',
  'Iptu',
  'Ipda',
  // Bintara (Pendukung Staf / ADC / Operator)
  'Aiptu',
  'Aipda',
  'Bripka',
  'Brigpol',
  'Briptu',
  'Bripda',
  // Tamtama (ADC / Pengawal / Staf Pendukung)
  'Abrip',
  'Abriptu',
  'Abripda',
  'Bharaka',
  'Bharatu',
  'Bharada',
  // ASN / PNS Polri (ADC / Staf Kesekretariatan & Administrasi)
  'Pembina / ASN Polri',
  'Penata / ASN Polri',
  'Pengatur / ASN Polri',
  'ASN / PNS Polri',
] as const;

// Modul Kebendaharaan & Portofolio Aset Paguyuban Wira Satya 1996
export type TransactionType = 'MASUK' | 'KELUAR';

export type TransactionCategory = 
  | 'IURAN_WAJIB_BULANAN' 
  | 'SUMBANGAN_SUKARELA' 
  | 'SANTUNAN_KESEHATAN' 
  | 'SANTUNAN_DUKA_CITA' 
  | 'BANTUAN_PENDIDIKAN_ANAK' 
  | 'OPERASIONAL_PAGUYUBAN' 
  | 'KEGIATAN_REUNI_LETING'
  | 'PEMBELIAN_ASET_INVESTASI'
  | 'PENCAIRAN_ASET_INVESTASI';

export type AssetCategory =
  | 'SURAT_BERHARGA'
  | 'VALUTA_ASING'
  | 'CRYPTO'
  | 'LOGAM_MULIA_ASET';

export interface AssetPortfolioItem {
  id: string;
  kodeAset: string;
  namaAset: string;
  kategori: AssetCategory;
  satuan: string; // 'Unit/Lembar' | 'USD' | 'SGD' | 'EUR' | 'BTC' | 'ETH' | 'USDT' | 'Gram'
  jumlahUnit: number;
  nilaiPerolehanIdr: number;
  estimasiNilaiIdr: number;
  kustodianLokasi: string; // Bank / Sekuritas / Wallet / Brankas
  nomorSeriAtauWallet?: string;
  tanggalPerolehan: string;
  keterangan?: string;
  dicatatOleh: string;
  updatedAt: string;
}

export interface KasTransaction {
  id: string;
  tanggal: string;
  jenis: TransactionType;
  kategori: TransactionCategory;
  nominal: number;
  keterangan: string;
  pihakTerkait?: string;
  nrpTerkait?: string;
  dicatatOleh: string;
  nomorReferensi: string;
  createdAt: string;
}

export interface IuranAnggota {
  id: string;
  nrp: string;
  namaLengkap: string;
  pangkat: string;
  polda: string;
  tahun: number;
  totalTagihan: number; // misal Rp 3.000.000 / tahun (250.000/bln)
  totalTerbayar: number;
  status: 'LUNAS' | 'SEBAGIAN' | 'BELUM_BAYAR';
  bulanTerbayar: number[]; // Array bulan 1-12
  terakhirBayar?: string;
}

export interface FinanceSummary {
  saldoUtama: number;
  kasSosialKesehatan: number;
  kasDukaCita: number;
  danaAbadiInvestasi: number;
  totalValuasiAset?: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  persentaseIuranTerkumpul: number;
}

// ==============================================================
// MODUL FEED SILATURAHMI & POSTING LETING 96 (LINKEDIN STYLE)
// ==============================================================
export interface PostComment {
  id: string;
  authorName: string;
  authorPangkat: string;
  authorAvatar: string;
  authorNrp?: string;
  content: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorPangkat: string;
  authorJabatan: string;
  authorAvatar: string;
  authorNrp?: string;
  badgeLabel?: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  repostsCount: number;
  isReposted?: boolean;
  comments: PostComment[];
  impressionsCount?: number;
  category?: 'MOTIVASI' | 'KENAIKAN_PANGKAT' | 'BAKSOS' | 'REUNI' | 'KABAR_LETING' | 'UMUM';
  pinned?: boolean;
  userReaction?: 'like' | 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';
  reactionCounts?: {
    like: number;
    celebrate: number;
    support: number;
    love: number;
    insightful: number;
    funny: number;
  };
}

export type ReactionType = 'like' | 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';

// ==============================================================
// MODUL RIWAYAT JABATAN & PENUGASAN INTERNAL LETING 96
// ==============================================================
export type FungsiPolri = 
  | 'RESERSE' 
  | 'INTELKAM' 
  | 'LANTAS' 
  | 'BRIMOB_SABHARA' 
  | 'LEMDIKLAT' 
  | 'KEWILAYAHAN' 
  | 'LUAR_STRUKTUR';

export interface RiwayatJabatanLeting {
  id: string;
  perwiraNrp: string;
  namaPerwira: string;
  pangkat: string;
  avatarUrl: string;
  jabatan: string;
  satker: string;
  polda: string;
  fungsiPolri: FungsiPolri;
  tahunMulai: number;
  tahunSelesai?: number;
  isCurrent: boolean;
  uraianTugas: string;
  prestasiOperasional?: string;
  dasarTR?: string;
}

// ==============================================================
// MODUL PESAN & OBROLAN LETING 96 (MESSAGING)
// ==============================================================
export interface ChatMessage {
  id: string;
  senderNrp: string;
  senderName: string;
  senderPangkat?: string;
  senderAvatar?: string;
  receiverNrp: string;
  receiverName?: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
}


