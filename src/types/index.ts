export type UserRole = 'SUPERADMIN' | 'KETUA' | 'SEKRETARIAT' | 'BENDAHARA' | 'ANGGOTA';

export type MfaMethod = 'BIOMETRIC' | 'GOOGLE_AUTH' | 'EMAIL_OTP' | 'PIN';

export interface AuthUser {
  id: string;
  nrp: string;
  nama: string;
  pangkat: string;
  email: string;
  role: UserRole;
  profileId: string;
  mfaEnabled: boolean;
  mfaMethod: MfaMethod;
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
  tipeSatker?: 'MABES' | 'POLDA' | 'POLRES/TA/BES' | 'POLSEK';
  satkerMabes?: string;
  subSatker?: string;
  namaPolres?: string;
  namaPolsek?: string;
  jenisAnggota?: 'ANGGOTA POLRI' | 'ASN POLRI';
  polda: string;
  pendidikanTerakhir: string;
  nomorKtp?: string;
  tempatLahir: string;
  tanggalLahir: string;
  usia: number;
  jenisKelamin: 'LAKI-LAKI' | 'PEREMPUAN';
  noHp: string;
  email?: string;
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
  // Bintara Tinggi & Bintara
  'Aiptu',
  'Aipda',
  'Bripka',
  'Brigpol',
  'Briptu',
  'Bripda',
  // Tamtama
  'Abrip',
  'Abriptu',
  'Abripda',
  'Bharaka',
  'Bharatu',
  'Bharada',
] as const;

// Modul Kebendaharaan Paguyuban Wira Satya 1996
export type TransactionType = 'MASUK' | 'KELUAR';

export type TransactionCategory = 
  | 'IURAN_WAJIB_BULANAN' 
  | 'SUMBANGAN_SUKARELA' 
  | 'SANTUNAN_KESEHATAN' 
  | 'SANTUNAN_DUKA_CITA' 
  | 'BANTUAN_PENDIDIKAN_ANAK' 
  | 'OPERASIONAL_PAGUYUBAN' 
  | 'KEGIATAN_REUNI_LETING';

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
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  persentaseIuranTerkumpul: number;
}
