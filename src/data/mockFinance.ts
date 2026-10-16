import { KasTransaction, IuranAnggota, FinanceSummary, AssetPortfolioItem } from '@/types';
import { AKPOL_1996_IURAN } from './akpol1996Alumni';

export const INITIAL_FINANCE_SUMMARY: FinanceSummary = {
  saldoUtama: 0,
  kasSosialKesehatan: 0,
  kasDukaCita: 0,
  danaAbadiInvestasi: 0,
  totalValuasiAset: 0,
  totalPemasukanBulanIni: 0,
  totalPengeluaranBulanIni: 0,
  persentaseIuranTerkumpul: 0,
};

export const INITIAL_TRANSACTIONS: KasTransaction[] = [];

export const INITIAL_ASSETS: AssetPortfolioItem[] = [];


export const INITIAL_IURAN_LIST: IuranAnggota[] = [...AKPOL_1996_IURAN];

