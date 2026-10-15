import { KasTransaction, IuranAnggota, FinanceSummary } from '@/types';
import { AKPOL_1996_IURAN } from './akpol1996Alumni';

export const INITIAL_FINANCE_SUMMARY: FinanceSummary = {
  saldoUtama: 0,
  kasSosialKesehatan: 0,
  kasDukaCita: 0,
  danaAbadiInvestasi: 0,
  totalPemasukanBulanIni: 0,
  totalPengeluaranBulanIni: 0,
  persentaseIuranTerkumpul: 0,
};

export const INITIAL_TRANSACTIONS: KasTransaction[] = [];

export const INITIAL_IURAN_LIST: IuranAnggota[] = [
  {
    id: 'iur-98010710',
    nrp: '98010710',
    namaLengkap: 'Eko Agung',
    pangkat: 'Briptu',
    polda: 'MABES POLRI',
    tahun: 2026,
    bulanTerbayar: [],
    totalTagihan: 3000000,
    totalTerbayar: 0,
    status: 'BELUM_BAYAR',
  },
  {
    id: 'iur-980107102',
    nrp: '980107102',
    namaLengkap: 'Eko_2',
    pangkat: 'Irjen Pol',
    polda: 'MABES POLRI',
    tahun: 2026,
    bulanTerbayar: [],
    totalTagihan: 3000000,
    totalTerbayar: 0,
    status: 'BELUM_BAYAR',
  },
  {
    id: 'iur-980107103',
    nrp: '980107103',
    namaLengkap: 'Eko_3',
    pangkat: 'Brigjen Pol',
    polda: 'MABES POLRI',
    tahun: 2026,
    bulanTerbayar: [],
    totalTagihan: 3000000,
    totalTerbayar: 0,
    status: 'BELUM_BAYAR',
  },
  {
    id: 'iur-980107104',
    nrp: '980107104',
    namaLengkap: 'Eko_4',
    pangkat: 'Kombes Pol',
    polda: 'MABES POLRI',
    tahun: 2026,
    bulanTerbayar: [],
    totalTagihan: 3000000,
    totalTerbayar: 0,
    status: 'BELUM_BAYAR',
  },
  {
    id: 'iur-980107105',
    nrp: '980107105',
    namaLengkap: 'Eko_5',
    pangkat: 'Kombes Pol',
    polda: 'POLDA METRO JAYA',
    tahun: 2026,
    bulanTerbayar: [],
    totalTagihan: 3000000,
    totalTerbayar: 0,
    status: 'BELUM_BAYAR',
  },
  ...AKPOL_1996_IURAN,
];
