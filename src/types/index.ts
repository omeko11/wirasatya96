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
  polda: string;
  pendidikanTerakhir: string;
  nomorKtp?: string;
  tempatLahir: string;
  tanggalLahir: string;
  usia: number;
  jenisKelamin: 'LAKI-LAKI' | 'PEREMPUAN';
  noHp: string;
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
