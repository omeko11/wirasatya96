'use client';

import React, { useState } from 'react';
import { AuthUser, KasTransaction, IuranAnggota, FinanceSummary, AnggotaWiraSatya, TransactionType, TransactionCategory } from '@/types';
import { 
  Wallet, 
  ArrowUpRight, 
  PlusCircle, 
  Download, 
  Heart, 
  GraduationCap, 
  Shield,
  ShieldCheck, 
  Search,
  Filter,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  Users
} from 'lucide-react';

interface BendaharaPortalProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  financeSummary: FinanceSummary;
  transactions: KasTransaction[];
  iuranList: IuranAnggota[];
  onAddTransaction: (trx: Omit<KasTransaction, 'id' | 'createdAt'>) => void;
  onPayIuran: (nrp: string, nominal: number) => void;
}

export const BendaharaPortal: React.FC<BendaharaPortalProps> = ({
  currentUser,
  members,
  financeSummary,
  transactions,
  iuranList,
  onAddTransaction,
  onPayIuran,
}) => {
  const [activeTab, setActiveTab] = useState<'bukuKas' | 'iuran' | 'santunan' | 'pendidikan'>('bukuKas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');

  // Modal State for New Transaction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxJenis, setTrxJenis] = useState<TransactionType>('MASUK');
  const [trxKategori, setTrxKategori] = useState<TransactionCategory>('IURAN_WAJIB_BULANAN');
  const [trxNominal, setTrxNominal] = useState<number>(3000000);
  const [trxKeterangan, setTrxKeterangan] = useState('');
  const [trxPihak, setTrxPihak] = useState('');
  const [trxNrp, setTrxNrp] = useState('');

  // Modal Pay Iuran
  const [payIuranModal, setPayIuranModal] = useState<IuranAnggota | null>(null);
  const [payNominal, setPayNominal] = useState<number>(1500000);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchType = selectedFilter === 'SEMUA' || t.jenis === selectedFilter;
    const matchSearch =
      t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nomorReferensi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.pihakTerkait && t.pihakTerkait.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxNominal || !trxKeterangan) {
      alert('Mohon isi nominal dan keterangan transaksi.');
      return;
    }

    onAddTransaction({
      nomorReferensi: 'WS96-KAS-' + Date.now().toString().slice(-4),
      tanggal: new Date().toISOString().split('T')[0],
      jenis: trxJenis,
      kategori: trxKategori,
      nominal: Number(trxNominal),
      keterangan: trxKeterangan,
      pihakTerkait: trxPihak || '-',
      nrpTerkait: trxNrp || '',
      dicatatOleh: currentUser.nama,
    });

    setIsModalOpen(false);
    setTrxKeterangan('');
    setTrxPihak('');
    setTrxNrp('');
    alert('Transaksi kas berhasil dibukukan.');
  };

  const handleConfirmPayIuran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payIuranModal) return;
    onPayIuran(payIuranModal.nrp, Number(payNominal));
    setPayIuranModal(null);
    alert(`Pembayaran iuran ${payIuranModal.namaLengkap} sebesar ${formatRupiah(payNominal)} berhasil dicatat!`);
  };

  const handleExportFinanceCSV = () => {
    const headers = ['Nomor Referensi', 'Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Pihak Terkait', 'Keterangan', 'Dicatat Oleh'];
    const rows = transactions.map((t) => [
      `"${t.nomorReferensi}"`,
      `"${t.tanggal}"`,
      `"${t.jenis}"`,
      `"${t.kategori}"`,
      t.nominal,
      `"${t.pihakTerkait || '-'}"`,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      `"${t.dicatatOleh}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kas_WiraSatya96_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chronic ill members linked from Modul 4
  const chronicIllMembers = members.filter(
    (m) => m.adaPenyakitKronis === 'ADA' || m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT'
  );

  // Education burden linked from Modul 2
  const collegeChildren = members.flatMap((m) =>
    (m.daftarAnak || [])
      .filter((a) => a.status === 'PELAJAR')
      .map((a) => ({
        ...a,
        namaOrangTua: m.namaLengkap,
        pangkatOrangTua: m.pangkat,
        poldaOrangTua: m.polda,
      }))
  );

  const canManageFinance = currentUser.role === 'BENDAHARA' || currentUser.role === 'SUPERADMIN';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-polri-navy to-slate-900 p-6 md:p-8 rounded-2xl border border-polri-gold/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-3">
            <Wallet className="w-3.5 h-3.5" />
            Portal Resmi Kebendaharaan & Kas Batalyon Wira Satya 1996
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Pengelolaan Kas, Iuran & Solidaritas Finansial
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Transparansi pembukuan kas paguyuban, penerimaan iuran wajib alumni, alokasi santunan medis rekan leting, dan subsidi pendidikan putra/putri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageFinance ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-polri-gold hover:bg-polri-goldDark text-polri-navy font-extrabold text-xs shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Catat Transaksi Kas
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-white/10 text-slate-200 text-xs flex items-center gap-2 border border-white/15">
              <Shield className="w-4 h-4 text-polri-gold" />
              <span>Otoritas Transaksi: Khusus Bendahara</span>
            </div>
          )}

          <button
            onClick={handleExportFinanceCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh Rekap Excel / CSV
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Kas Utama */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Saldo Kas Utama</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {formatRupiah(financeSummary.saldoUtama)}
            </span>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-600 font-semibold">
              <span className="inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{formatRupiah(financeSummary.totalPemasukanBulanIni)}
              </span>
              <span className="text-slate-400">bulan ini</span>
            </div>
          </div>
        </div>

        {/* Kas Sosial & Kesehatan */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">Kas Sosial & Santunan</span>
            <span className="p-2 rounded-xl bg-red-100 text-red-700">
              <Heart className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-red-900 block">
              {formatRupiah(financeSummary.kasSosialKesehatan)}
            </span>
            <span className="text-xs text-red-600 font-medium block mt-1">
              Khusus pengobatan & atensi leting sakit
            </span>
          </div>
        </div>

        {/* Kas Duka Cita & Tali Asih */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Kas Duka Cita & Tali Asih</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-900 block">
              {formatRupiah(financeSummary.kasDukaCita)}
            </span>
            <span className="text-xs text-amber-700 font-medium block mt-1">
              Siap salur untuk musibah / duka
            </span>
          </div>
        </div>

        {/* Dana Abadi / Investasi Leting */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Dana Abadi / Koperasi</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-blue-900 block">
              {formatRupiah(financeSummary.danaAbadiInvestasi)}
            </span>
            <span className="text-xs text-blue-600 font-medium block mt-1">
              Pengembangan usaha bersama pasca pensiun
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bukuKas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'bukuKas'
                ? 'bg-polri-navy text-polri-gold shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Buku Kas & Riwayat Transaksi ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('iuran')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'iuran'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            Iuran Wajib Leting 2026 ({iuranList.length} Terdata)
          </button>

          <button
            onClick={() => setActiveTab('santunan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'santunan'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Heart className="w-4 h-4" />
            Alokasi Santunan Rekan Sakit ({chronicIllMembers.length})
          </button>

          <button
            onClick={() => setActiveTab('pendidikan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'pendidikan'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Analisis Beban Pendidikan Putra/Putri
          </button>
        </div>

        {/* TAB 1: BUKU KAS & RIWAYAT TRANSAKSI */}
        {activeTab === 'bukuKas' && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi, keterangan, no ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-polri-navy"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Tipe:</span>
                {(['SEMUA', 'MASUK', 'KELUAR'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      selectedFilter === filter
                        ? 'bg-polri-navy text-white border-polri-navy'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal & Ref</th>
                    <th className="px-4 py-3">Jenis & Kategori</th>
                    <th className="px-4 py-3">Keterangan & Pihak Terkait</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3">Dicatat Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{trx.tanggal}</span>
                        <span className="text-[10px] font-mono text-slate-400">{trx.nomorReferensi}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trx.jenis === 'MASUK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {trx.jenis}
                          </span>
                          <span className="text-slate-600 font-medium text-[11px]">
                            {trx.kategori.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-medium text-slate-900 block">{trx.keterangan}</span>
                        {trx.pihakTerkait && trx.pihakTerkait !== '-' && (
                          <span className="text-[11px] text-blue-700">Terkait: {trx.pihakTerkait}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span
                          className={`font-black text-sm ${
                            trx.jenis === 'MASUK' ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {trx.jenis === 'MASUK' ? '+' : '-'} {formatRupiah(trx.nominal)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {trx.dicatatOleh}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada transaksi kas yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN IURAN WAJIB LETING */}
        {activeTab === 'iuran' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold block mb-1">📌 Kebijakan Iuran Batalyon Wira Satya 1996:</span>
                Besaran iuran wajib leting adalah Rp 250.000 / bulan (Rp 3.000.000 / tahun). Iuran diperuntukkan bagi operasional paguyuban, santunan sakit, dan kas duka.
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[11px] text-emerald-700 font-semibold block">Tingkat Kepatuhan</span>
                <span className="text-xl font-black text-emerald-900">83.3% Lunas</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Perwira & NRP</th>
                    <th className="px-4 py-3">Pangkat & Satker</th>
                    <th className="px-4 py-3">Target Iuran 2026</th>
                    <th className="px-4 py-3">Terbayar</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {iuranList.map((iur) => (
                    <tr key={iur.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{iur.namaLengkap}</span>
                        <span className="text-[11px] text-slate-400 font-mono">NRP {iur.nrp}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-800 font-semibold block">{iur.pangkat}</span>
                        <span className="text-[11px] text-slate-500">{iur.polda}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {formatRupiah(iur.totalTagihan)}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {formatRupiah(iur.totalTerbayar)}
                        {iur.terakhirBayar && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Bayar: {iur.terakhirBayar}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            iur.status === 'LUNAS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : iur.status === 'SEBAGIAN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {iur.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {iur.status !== 'LUNAS' ? (
                          canManageFinance || iur.nrp === currentUser.nrp ? (
                            <button
                              onClick={() => {
                                setPayIuranModal(iur);
                                setPayNominal(iur.totalTagihan - iur.totalTerbayar);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-colors"
                            >
                              {canManageFinance ? 'Catat Bayar' : 'Bayar Iuran'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Belum Lunas
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SANTUNAN KESEHATAN (TERKONEKSI MODUL 4) */}
        {activeTab === 'santunan' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
              <span className="font-bold block mb-1">❤️ Alokasi Santunan Medis dari Kas Paguyuban:</span>
              Daftar di bawah ini disinkronisasi langsung dari data laporan kesehatan mandiri personel (Modul 4). Bendahara menyalurkan dana bantuan berdasarkan tingkat atensi medis.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chronicIllMembers.map((m) => (
                <div key={m.id} className="p-5 rounded-xl border border-red-200 bg-white shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                        {m.kondisiKesehatan}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{m.namaLengkap}</h4>
                      <p className="text-xs text-slate-500">{m.pangkat} — {m.polda}</p>
                    </div>

                    <button
                      onClick={() => {
                        setTrxJenis('KELUAR');
                        setTrxKategori('SANTUNAN_KESEHATAN');
                        setTrxNominal(10000000);
                        setTrxPihak(m.namaLengkap);
                        setTrxNrp(m.nrp);
                        setTrxKeterangan(`Penyaluran santunan kesehatan paguyuban untuk pengobatan ${m.daftarPenyakit?.join(', ')}`);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      Salurkan Santunan
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="text-slate-500 font-semibold block">Diagnosa Medis:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.daftarPenyakit?.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                    {m.kondisiSaatIni && (
                      <p className="text-slate-600 text-[11px] pt-1">
                        <b>Kondisi:</b> {m.kondisiSaatIni}
                      </p>
                    )}
                    {m.biayaPengobatanDitanggung && (
                      <p className="text-slate-600 text-[11px]">
                        <b>Status Biaya:</b> {m.biayaPengobatanDitanggung}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BEBAN PENDIDIKAN PUTRA/PUTRI (TERKONEKSI MODUL 2) */}
        {activeTab === 'pendidikan' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
              <span className="font-bold block mb-1">🎓 Pemetaan Tanggungan Pendidikan Anak Leting:</span>
              Membantu Bendahara dan Ketua Paguyuban mengevaluasi kemampuan finansial rekan seleting, terutama menjelang masa pensiun (usia 55-58) di mana anak masih membutuhkan biaya kuliah tinggi.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-purple-800 block">Total Anak Pelajar / Kuliah</span>
                <span className="text-2xl font-black text-purple-900 mt-1 block">{collegeChildren.length} Anak</span>
                <span className="text-[11px] text-purple-700">Tercatat dalam data leting</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-amber-800 block">Biaya Tinggi (&gt; 25jt/thn)</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">
                  {collegeChildren.filter((c) => c.biayaPendidikanTahunan === '> 25.000.000').length} Anak
                </span>
                <span className="text-[11px] text-amber-700">Prioritas beasiswa / subsidi leting</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-blue-800 block">Biaya Menengah (5-25jt/thn)</span>
                <span className="text-2xl font-black text-blue-900 mt-1 block">
                  {collegeChildren.filter((c) => c.biayaPendidikanTahunan === '5.000.000 S.D. 25.000.000').length} Anak
                </span>
                <span className="text-[11px] text-blue-700">SMA / Mahasiswa PTN</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Putra / Putri</th>
                    <th className="px-4 py-3">Orang Tua (Leting)</th>
                    <th className="px-4 py-3">Penempatan</th>
                    <th className="px-4 py-3">Estimasi Biaya Tahunan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {collegeChildren.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{c.nama || `Anak Pelajar (${idx + 1})`}</td>
                      <td className="px-4 py-3 text-slate-800">{c.namaOrangTua}</td>
                      <td className="px-4 py-3 text-slate-500">{c.poldaOrangTua}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            c.biayaPendidikanTahunan === '> 25.000.000'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.biayaPendidikanTahunan || '5.000.000 S.D. 25.000.000'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CATAT TRANSAKSI KAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-polri-navy p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-polri-gold" />
                Catat Transaksi Kas Batalyon 96
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi</label>
                  <select
                    value={trxJenis}
                    onChange={(e) => setTrxJenis(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-1 focus:ring-polri-navy"
                  >
                    <option value="MASUK">Pemasukan (KAS MASUK)</option>
                    <option value="KELUAR">Pengeluaran (KAS KELUAR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Transaksi</label>
                  <select
                    value={trxKategori}
                    onChange={(e) => setTrxKategori(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-1 focus:ring-polri-navy"
                  >
                    <option value="IURAN_WAJIB_BULANAN">Iuran Wajib Bulanan</option>
                    <option value="SUMBANGAN_SUKARELA">Sumbangan Sukarela Leting</option>
                    <option value="SANTUNAN_KESEHATAN">Santunan / Bantuan Medis</option>
                    <option value="SANTUNAN_DUKA_CITA">Santunan Duka Cita</option>
                    <option value="BANTUAN_PENDIDIKAN_ANAK">Bantuan Biaya Pendidikan</option>
                    <option value="OPERASIONAL_PAGUYUBAN">Operasional & Legal Paguyuban</option>
                    <option value="KEGIATAN_REUNI_LETING">Kegiatan Reuni & Silaturahmi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal (Rupiah)</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={50000}
                  value={trxNominal}
                  onChange={(e) => setTrxNominal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Terbilang: {formatRupiah(trxNominal)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Transaksi</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Rincian peruntukan atau sumber dana kas..."
                  value={trxKeterangan}
                  onChange={(e) => setTrxKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-polri-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pihak Terkait (Nama Rekan)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kombes Pol. ..."
                    value={trxPihak}
                    onChange={(e) => setTrxPihak(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-polri-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NRP Terkait (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 74080123"
                    value={trxNrp}
                    onChange={(e) => setTrxNrp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-polri-navy"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BAYAR IURAN */}
      {payIuranModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-300" />
                Catat Pembayaran Iuran Leting
              </h3>
              <button onClick={() => setPayIuranModal(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayIuran} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Nama Perwira:</span>
                <span className="font-bold text-slate-900 text-sm block">{payIuranModal.namaLengkap}</span>
                <span className="text-slate-400 text-[11px]">
                  NRP: {payIuranModal.nrp} • {payIuranModal.polda}
                </span>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                  <span>Tagihan: <b>{formatRupiah(payIuranModal.totalTagihan)}</b></span>
                  <span>Sudah Bayar: <b className="text-emerald-700">{formatRupiah(payIuranModal.totalTerbayar)}</b></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Pembayaran Sekarang</label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={payNominal}
                  onChange={(e) => setPayNominal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Jumlah yang disetorkan: {formatRupiah(payNominal)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayIuranModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
