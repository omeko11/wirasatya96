import { KasTransaction, IuranAnggota, FinanceSummary } from '@/types';

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

export const INITIAL_IURAN_LIST: IuranAnggota[] = [];
