'use client';

import React, { useState, useEffect } from 'react';
import {
  AuthUser,
  KasTransaction,
  IuranAnggota,
  FinanceSummary,
  AnggotaWiraSatya,
  TransactionType,
  TransactionCategory,
  AssetPortfolioItem,
  AssetCategory,
} from '@/types';
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
  Users,
  Coins,
  Briefcase,
  Trash2,
  Eye,
} from 'lucide-react';

interface BendaharaPortalProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  financeSummary: FinanceSummary;
  transactions: KasTransaction[];
  iuranList: IuranAnggota[];
  assets?: AssetPortfolioItem[];
  onAddTransaction: (trx: Omit<KasTransaction, 'id' | 'createdAt'>) => void;
  onPayIuran: (nrp: string, nominal: number) => void;
  onAddAsset?: (asset: Omit<AssetPortfolioItem, 'id' | 'updatedAt'>) => void;
  onDeleteAsset?: (id: string) => void;
}

const ASSET_CATEGORY_LABELS: Record<AssetCategory, { label: string; badge: string; defaultSatuan: string; placeholderNama: string; placeholderKustodian: string }> = {
  SURAT_BERHARGA: {
    label: 'Surat Berharga / Deposito',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultSatuan: 'Lembar/Bilyet',
    placeholderNama: 'Contoh: SBN ORI025 / Deposito Bank Mandiri',
    placeholderKustodian: 'Contoh: Bank Mandiri Prioritas / BRI Sekuritas',
  },
  VALUTA_ASING: {
    label: 'Valuta Asing (Valas)',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultSatuan: 'USD',
    placeholderNama: 'Contoh: Kas Cadangan USD / SGD Paguyuban',
    placeholderKustodian: 'Contoh: Rekening Valas BNI / Brankas Bendahara',
  },
  CRYPTO: {
    label: 'Aset Digital / Crypto',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    defaultSatuan: 'BTC',
    placeholderNama: 'Contoh: Bitcoin (BTC) / Tether (USDT) Treasury',
    placeholderKustodian: 'Contoh: Cold Wallet Ledger / Indodax / Tokocrypto',
  },
  LOGAM_MULIA_ASET: {
    label: 'Logam Mulia & Aset Lainnya',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    defaultSatuan: 'Gram',
    placeholderNama: 'Contoh: Emas Antam CertiEye / Inventaris',
    placeholderKustodian: 'Contoh: Safe Deposit Box (SDB) BCA',
  },
};

const SATUAN_OPTIONS_BY_CATEGORY: Record<AssetCategory, string[]> = {
  SURAT_BERHARGA: ['Lembar/Bilyet', 'Unit', 'Lot'],
  VALUTA_ASING: ['USD', 'SGD', 'EUR', 'SAR', 'AUD', 'JPY'],
  CRYPTO: ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB'],
  LOGAM_MULIA_ASET: ['Gram', 'Keping', 'Unit'],
};

export const BendaharaPortal: React.FC<BendaharaPortalProps> = ({
  currentUser,
  members,
  financeSummary,
  transactions,
  iuranList,
  assets: propAssets,
  onAddTransaction,
  onPayIuran,
  onAddAsset,
  onDeleteAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'bukuKas' | 'aset' | 'iuran' | 'santunan' | 'pendidikan'>('bukuKas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');

  // Local synced state for assets if parent doesn't pass them
  const [localAssets, setLocalAssets] = useState<AssetPortfolioItem[]>(propAssets || []);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<'SEMUA' | AssetCategory>('SEMUA');

  useEffect(() => {
    if (propAssets) {
      setLocalAssets(propAssets);
    } else {
      fetch('/api/finance')
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data && Array.isArray(res.data.assets)) {
            setLocalAssets(res.data.assets);
          }
        })
        .catch(() => {});
    }
  }, [propAssets]);

  // Modal State for New Cash Transaction (BENDAHARA ONLY)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxJenis, setTrxJenis] = useState<TransactionType>('MASUK');
  const [trxKategori, setTrxKategori] = useState<TransactionCategory>('IURAN_WAJIB_BULANAN');
  const [trxNominal, setTrxNominal] = useState<number>(3000000);
  const [trxKeterangan, setTrxKeterangan] = useState('');
  const [trxPihak, setTrxPihak] = useState('');
  const [trxNrp, setTrxNrp] = useState('');

  // Modal State for New Asset Portfolio Item (BENDAHARA ONLY)
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [astNama, setAstNama] = useState('');
  const [astKategori, setAstKategori] = useState<AssetCategory>('SURAT_BERHARGA');
  const [astSatuan, setAstSatuan] = useState('Lembar/Bilyet');
  const [astJumlah, setAstJumlah] = useState<number>(1);
  const [astNilaiBeli, setAstNilaiBeli] = useState<number>(10000000);
  const [astEstimasiIdr, setAstEstimasiIdr] = useState<number>(10000000);
  const [astKustodian, setAstKustodian] = useState('');
  const [astNomorSeri, setAstNomorSeri] = useState('');
  const [astKeterangan, setAstKeterangan] = useState('');

  // Modal Pay Iuran (BENDAHARA ONLY)
  const [payIuranModal, setPayIuranModal] = useState<IuranAnggota | null>(null);
  const [payNominal, setPayNominal] = useState<number>(1500000);

  // STRICT PERMISSION RULES:
  // 1. Penginputan data Kas, Iuran, & Aset murni hanya boleh dilakukan oleh BENDAHARA
  const canInputFinance = currentUser.role === 'BENDAHARA';
  // 2. Rekap / Unduh Laporan CSV/Excel hanya boleh dilakukan oleh BENDAHARA dan KETUA
  const canRekapFinance = currentUser.role === 'BENDAHARA' || currentUser.role === 'KETUA';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalValuasiAset = localAssets.reduce((sum, a) => sum + (Number(a.estimasiNilaiIdr) || 0), 0);
  const totalKekayaanGabungan = (financeSummary.saldoUtama || 0) + totalValuasiAset;

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchType = selectedFilter === 'SEMUA' || t.jenis === selectedFilter;
    const matchSearch =
      t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nomorReferensi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.pihakTerkait && t.pihakTerkait.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  // Filtered assets
  const filteredAssets = localAssets.filter((a) => {
    return assetCategoryFilter === 'SEMUA' || a.kategori === assetCategoryFilter;
  });

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputFinance) {
      alert('Akses Ditolak: Penginputan transaksi kas hanya dapat dilakukan oleh Bendahara.');
      return;
    }
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
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputFinance) {
      alert('Akses Ditolak: Pencatatan aset hanya dapat dilakukan oleh Bendahara.');
      return;
    }
    if (!astNama.trim() || !astEstimasiIdr) {
      alert('Mohon lengkapi nama aset dan estimasi nilai Rupiah.');
      return;
    }

    const payload: Omit<AssetPortfolioItem, 'id' | 'updatedAt'> = {
      kodeAset: 'WS96-AST-' + Date.now().toString().slice(-4),
      namaAset: astNama.trim(),
      kategori: astKategori,
      satuan: astSatuan,
      jumlahUnit: Number(astJumlah) || 1,
      nilaiPerolehanIdr: Number(astNilaiBeli) || Number(astEstimasiIdr),
      estimasiNilaiIdr: Number(astEstimasiIdr),
      kustodianLokasi: astKustodian.trim() || 'Bendahara Paguyuban',
      nomorSeriAtauWallet: astNomorSeri.trim() || '-',
      tanggalPerolehan: new Date().toISOString().split('T')[0],
      keterangan: astKeterangan.trim(),
      dicatatOleh: currentUser.nama,
    };

    if (onAddAsset) {
      onAddAsset(payload);
    } else {
      try {
        const res = await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_ASSET',
            actorRole: currentUser.role,
            ...payload,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setLocalAssets((prev) => [data.data, ...prev]);
        }
      } catch {
        // Fallback local
      }
    }

    setIsAssetModalOpen(false);
    setAstNama('');
    setAstKustodian('');
    setAstNomorSeri('');
    setAstKeterangan('');
  };

  const handleRemoveAsset = async (id: string) => {
    if (!canInputFinance) return;
    if (onDeleteAsset) {
      onDeleteAsset(id);
    } else {
      try {
        const res = await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'DELETE_ASSET',
            actorRole: currentUser.role,
            id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setLocalAssets((prev) => prev.filter((a) => a.id !== id));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleConfirmPayIuran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputFinance || !payIuranModal) return;
    onPayIuran(payIuranModal.nrp, Number(payNominal));
    setPayIuranModal(null);
  };

  const handleExportFinanceCSV = () => {
    if (!canRekapFinance) {
      alert('Akses Ditolak: Rekap laporan kas & aset hanya dapat diunduh oleh Bendahara dan Ketua.');
      return;
    }

    const trxHeaders = ['TIPE DATA', 'Nomor Referensi / Kode', 'Tanggal', 'Jenis / Kategori', 'Sub-Kategori / Satuan', 'Unit', 'Nominal / Estimasi IDR', 'Pihak / Kustodian', 'Keterangan', 'Dicatat Oleh'];
    const trxRows = transactions.map((t) => [
      '"TRANSAKSI_KAS"',
      `"${t.nomorReferensi}"`,
      `"${t.tanggal}"`,
      `"${t.jenis}"`,
      `"${t.kategori}"`,
      '1',
      t.nominal,
      `"${t.pihakTerkait || '-'}"`,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      `"${t.dicatatOleh}"`,
    ]);

    const assetRows = localAssets.map((a) => [
      '"PORTOFOLIO_ASET"',
      `"${a.kodeAset}"`,
      `"${a.tanggalPerolehan}"`,
      `"${a.kategori}"`,
      `"${a.satuan}"`,
      a.jumlahUnit,
      a.estimasiNilaiIdr,
      `"${(a.kustodianLokasi || '-').replace(/"/g, '""')}"`,
      `"${(a.namaAset + (a.keterangan ? ' - ' + a.keterangan : '')).replace(/"/g, '""')}"`,
      `"${a.dicatatOleh}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [trxHeaders.join(','), ...trxRows.map((e) => e.join(',')), ...assetRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kas_dan_Aset_WiraSatya96_${new Date().toISOString().split('T')[0]}.csv`);
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

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 md:p-7 rounded-2xl border border-emerald-700/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2.5">
            <Wallet className="w-3.5 h-3.5" />
            Arus Kas &amp; Portofolio Aset Wira Satya 1996
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Pembukuan Kas, Iuran &amp; Portofolio Aset (Surat Berharga / Valas / Crypto)
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Dikelola oleh Bendahara. Penginputan data kas dan aset khusus <b className="text-emerald-300">Bendahara</b>, rekap laporan khusus <b className="text-amber-300">Bendahara &amp; Ketua</b>, sedangkan seluruh anggota lainnya dapat menyimak secara transparan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canInputFinance ? (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                + Input Transaksi Kas
              </button>
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all"
              >
                <Coins className="w-4 h-4" />
                + Input Aset / Valas / Crypto
              </button>
            </>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-white/10 text-slate-200 text-xs flex items-center gap-2 border border-white/15">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>
                Mode Simak (Read-Only) &bull; Input Khusus <b>Bendahara</b>
              </span>
            </div>
          )}

          {canRekapFinance && (
            <button
              onClick={handleExportFinanceCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition-all"
              title="Khusus Bendahara & Ketua"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Rekap Kas &amp; Aset (CSV)
            </button>
          )}
        </div>
      </div>

      {/* KPI Financial & Asset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo Kas Tunai (IDR Likuid) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Saldo Kas Tunai (IDR)</span>
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

        {/* 2. Total Valuasi Portofolio Aset (Surat Berharga / Valas / Crypto) */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Valuasi Portofolio Aset</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Coins className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-blue-900 block">
              {formatRupiah(totalValuasiAset)}
            </span>
            <span className="text-xs text-blue-700 font-medium block mt-1">
              {localAssets.length} instrumen (Surat Berharga, Valas, Crypto, Emas)
            </span>
          </div>
        </div>

        {/* 3. Total Kekayaan Gabungan (Kas + Aset) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Total Kas + Aset</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-950 block">
              {formatRupiah(totalKekayaanGabungan)}
            </span>
            <span className="text-xs text-amber-800 font-medium block mt-1">
              Akumulasi kas likuid &amp; nilai pasar aset
            </span>
          </div>
        </div>

        {/* 4. Alokasi Kas Sosial & Santunan */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">Alokasi Sosial &amp; Santunan</span>
            <span className="p-2 rounded-xl bg-red-100 text-red-700">
              <Heart className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-red-900 block">
              {formatRupiah(financeSummary.kasSosialKesehatan)}
            </span>
            <span className="text-xs text-red-600 font-medium block mt-1">
              Atensi medis &amp; tali asih rekan leting
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
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Buku Kas Tunai ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('aset')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'aset'
                ? 'bg-blue-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Portofolio Aset: Surat Berharga / Valas / Crypto ({localAssets.length})
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
            Iuran Leting ({iuranList.length})
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
            Santunan Rekan Sakit ({chronicIllMembers.length})
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
            Data Pendidikan Anak
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: BUKU KAS & RIWAYAT TRANSAKSI                            */}
        {/* ============================================================== */}
        {activeTab === 'bukuKas' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi, keterangan, no ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-slate-900"
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
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal &amp; Ref</th>
                    <th className="px-4 py-3">Jenis &amp; Kategori</th>
                    <th className="px-4 py-3">Keterangan &amp; Pihak Terkait</th>
                    <th className="px-4 py-3 text-right">Nominal (IDR)</th>
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
                        Belum ada transaksi kas yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PORTOFOLIO ASET (SURAT BERHARGA / VALAS / CRYPTO)       */}
        {/* ============================================================== */}
        {activeTab === 'aset' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 border border-blue-200 rounded-xl p-4">
              <div>
                <h4 className="text-xs font-extrabold text-blue-950">
                  Inventaris Aset Likuid Non-Rupiah &amp; Surat Berharga
                </h4>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Pencatatan kepemilikan Surat Berharga (SBN/Deposito), Valuta Asing (USD/SGD/EUR), Aset Kripto (BTC/USDT), dan Logam Mulia milik paguyuban.
                </p>
              </div>
              {canInputFinance && (
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm flex-shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  + Catat Aset Baru
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setAssetCategoryFilter('SEMUA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                  assetCategoryFilter === 'SEMUA'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semua Aset ({localAssets.length})
              </button>
              {(['SURAT_BERHARGA', 'VALUTA_ASING', 'CRYPTO', 'LOGAM_MULIA_ASET'] as AssetCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAssetCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                    assetCategoryFilter === cat
                      ? 'bg-blue-800 text-white border-blue-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {ASSET_CATEGORY_LABELS[cat].label} ({localAssets.filter((a) => a.kategori === cat).length})
                </button>
              ))}
            </div>

            {/* Asset Table */}
            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Kode &amp; Tanggal</th>
                    <th className="px-4 py-3">Nama Instrumen &amp; Kategori</th>
                    <th className="px-4 py-3">Kuantitas / Unit</th>
                    <th className="px-4 py-3">Kustodian / Wallet / Lokasi</th>
                    <th className="px-4 py-3 text-right">Nilai Perolehan (IDR)</th>
                    <th className="px-4 py-3 text-right">Estimasi Valuasi (IDR)</th>
                    {canInputFinance && <th className="px-4 py-3 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map((ast) => {
                    const selisih = (ast.estimasiNilaiIdr || 0) - (ast.nilaiPerolehanIdr || 0);
                    return (
                      <tr key={ast.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 block">{ast.kodeAset}</span>
                          <span className="text-[10px] text-slate-400">{ast.tanggalPerolehan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{ast.namaAset}</span>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded border text-[10px] font-bold ${
                              ASSET_CATEGORY_LABELS[ast.kategori]?.badge || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ASSET_CATEGORY_LABELS[ast.kategori]?.label || ast.kategori}
                          </span>
                          {ast.keterangan && (
                            <span className="block text-[11px] text-slate-500 mt-0.5">{ast.keterangan}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-black text-slate-900 text-sm">
                            {ast.jumlahUnit} {ast.satuan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800 block">{ast.kustodianLokasi}</span>
                          {ast.nomorSeriAtauWallet && ast.nomorSeriAtauWallet !== '-' && (
                            <span className="font-mono text-[10px] text-slate-500 block">
                              Ref/Wallet: {ast.nomorSeriAtauWallet}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-slate-600">
                          {formatRupiah(ast.nilaiPerolehanIdr)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="font-black text-blue-900 text-sm block">
                            {formatRupiah(ast.estimasiNilaiIdr)}
                          </span>
                          {selisih !== 0 && (
                            <span
                              className={`text-[10px] font-bold ${
                                selisih > 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {selisih > 0 ? '+' : ''}
                              {formatRupiah(selisih)}
                            </span>
                          )}
                        </td>
                        {canInputFinance && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveAsset(ast.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Aset (Khusus Bendahara)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan={canInputFinance ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
                        Belum ada aset Surat Berharga, Valas, atau Crypto yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MANAJEMEN IURAN WAJIB LETING                            */}
        {/* ============================================================== */}
        {activeTab === 'iuran' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold block mb-1">📌 Iuran Wajib Leting (Rp 250.000 / Bulan):</span>
                Pencatatan penerimaan iuran hanya dilakukan oleh <b>Bendahara</b>. Anggota dapat memantau status pembayarannya secara langsung di tabel ini.
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[11px] text-emerald-700 font-semibold block">Tingkat Kepatuhan</span>
                <span className="text-xl font-black text-emerald-900">
                  {iuranList.length > 0
                    ? `${((iuranList.filter((i) => i.status === 'LUNAS').length / iuranList.length) * 100).toFixed(1)}% Lunas`
                    : '0% Terdata'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Perwira &amp; NRP</th>
                    <th className="px-4 py-3">Pangkat &amp; Satker</th>
                    <th className="px-4 py-3">Target Iuran 2026</th>
                    <th className="px-4 py-3">Terbayar</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    {canInputFinance && <th className="px-4 py-3 text-center">Input Bendahara</th>}
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
                      {canInputFinance && (
                        <td className="px-4 py-3 text-center">
                          {iur.status !== 'LUNAS' ? (
                            <button
                              onClick={() => {
                                setPayIuranModal(iur);
                                setPayNominal(iur.totalTagihan - iur.totalTerbayar);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-colors"
                            >
                              Catat Bayar
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lunas
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {iuranList.length === 0 && (
                    <tr>
                      <td colSpan={canInputFinance ? 6 : 5} className="px-4 py-8 text-center text-slate-400">
                        Belum ada data kewajiban iuran perwira yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SANTUNAN KESEHATAN                                      */}
        {/* ============================================================== */}
        {activeTab === 'santunan' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
              <span className="font-bold block mb-1">❤️ Alokasi Santunan Medis dari Kas:</span>
              Daftar rekan yang membutuhkan atensi medis. Pencatatan penyaluran dana santunan dilakukan oleh <b>Bendahara</b>.
            </div>

            {chronicIllMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chronicIllMembers.map((m) => (
                  <div key={m.id} className="p-5 rounded-xl border border-red-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                          {m.kondisiKesehatan}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{m.namaLengkap}</h4>
                        <p className="text-xs text-slate-500">
                          {m.pangkat} — {m.polda}
                        </p>
                      </div>

                      {canInputFinance && (
                        <button
                          onClick={() => {
                            setTrxJenis('KELUAR');
                            setTrxKategori('SANTUNAN_KESEHATAN');
                            setTrxNominal(10000000);
                            setTrxPihak(m.namaLengkap);
                            setTrxNrp(m.nrp);
                            setTrxKeterangan(
                              `Penyaluran santunan kesehatan untuk ${m.namaLengkap} (${m.daftarPenyakit?.join(', ') || 'Medis'})`
                            );
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          Salurkan Santunan
                        </button>
                      )}
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-slate-200 rounded-xl">
                Tidak ada rekan yang terdaftar membutuhkan atensi medis khusus saat ini.
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: BEBAN PENDIDIKAN PUTRA/PUTRI                            */}
        {/* ============================================================== */}
        {activeTab === 'pendidikan' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-purple-800 block">Total Anak Pelajar / Kuliah</span>
                <span className="text-2xl font-black text-purple-900 mt-1 block">{collegeChildren.length} Anak</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-amber-800 block">Biaya Tinggi (&gt; 25jt/thn)</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">
                  {collegeChildren.filter((c) => c.biayaPendidikanTahunan === '> 25.000.000').length} Anak
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <span className="text-xs font-bold text-blue-800 block">Biaya Menengah (5-25jt/thn)</span>
                <span className="text-2xl font-black text-blue-900 mt-1 block">
                  {collegeChildren.filter((c) => c.biayaPendidikanTahunan === '5.000.000 S.D. 25.000.000').length} Anak
                </span>
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
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-800">
                          {c.biayaPendidikanTahunan || '5.000.000 S.D. 25.000.000'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {collegeChildren.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        Belum ada data tanggungan pendidikan anak yang diinputkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CATAT TRANSAKSI KAS (KHUSUS BENDAHARA)                */}
      {/* ============================================================== */}
      {isModalOpen && canInputFinance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                Input Transaksi Kas (Otoritas Bendahara)
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="IURAN_WAJIB_BULANAN">Iuran Wajib Bulanan</option>
                    <option value="SUMBANGAN_SUKARELA">Sumbangan Sukarela</option>
                    <option value="SANTUNAN_KESEHATAN">Santunan / Bantuan Medis</option>
                    <option value="SANTUNAN_DUKA_CITA">Santunan Duka Cita</option>
                    <option value="BANTUAN_PENDIDIKAN_ANAK">Bantuan Biaya Pendidikan</option>
                    <option value="PEMBELIAN_ASET_INVESTASI">Pembelian Aset / Investasi</option>
                    <option value="PENCAIRAN_ASET_INVESTASI">Pencairan / Dividen Aset</option>
                    <option value="OPERASIONAL_PAGUYUBAN">Operasional Paguyuban</option>
                    <option value="KEGIATAN_REUNI_LETING">Kegiatan Leting</option>
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-black text-slate-900"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pihak Terkait (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Nama Rekan / Bank"
                    value={trxPihak}
                    onChange={(e) => setTrxPihak(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NRP Terkait (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 74080123"
                    value={trxNrp}
                    onChange={(e) => setTrxNrp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
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

      {/* ============================================================== */}
      {/* MODAL 2: CATAT PORTOFOLIO ASET BARU (KHUSUS BENDAHARA)         */}
      {/* ============================================================== */}
      {isAssetModalOpen && canInputFinance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-300" />
                Catat Aset Baru (Surat Berharga / Valas / Crypto)
              </h3>
              <button onClick={() => setIsAssetModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Aset</label>
                  <select
                    value={astKategori}
                    onChange={(e) => {
                      const nextCat = e.target.value as AssetCategory;
                      setAstKategori(nextCat);
                      setAstSatuan(ASSET_CATEGORY_LABELS[nextCat].defaultSatuan);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-blue-950"
                  >
                    <option value="SURAT_BERHARGA">Surat Berharga / Deposito</option>
                    <option value="VALUTA_ASING">Valuta Asing (USD / SGD / EUR)</option>
                    <option value="CRYPTO">Aset Digital / Crypto (BTC / USDT)</option>
                    <option value="LOGAM_MULIA_ASET">Logam Mulia / Aset Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Uang / Satuan Unit</label>
                  <select
                    value={astSatuan}
                    onChange={(e) => setAstSatuan(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    {SATUAN_OPTIONS_BY_CATEGORY[astKategori].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Aset / Instrumen</label>
                <input
                  type="text"
                  required
                  placeholder={ASSET_CATEGORY_LABELS[astKategori].placeholderNama}
                  value={astNama}
                  onChange={(e) => setAstNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah ({astSatuan})</label>
                  <input
                    type="number"
                    required
                    step="any"
                    min={0.0001}
                    value={astJumlah}
                    onChange={(e) => setAstJumlah(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Beli (IDR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50000}
                    value={astNilaiBeli}
                    onChange={(e) => setAstNilaiBeli(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valuasi Saat Ini (IDR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50000}
                    value={astEstimasiIdr}
                    onChange={(e) => setAstEstimasiIdr(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-black text-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kustodian / Bank / Platform</label>
                  <input
                    type="text"
                    required
                    placeholder={ASSET_CATEGORY_LABELS[astKategori].placeholderKustodian}
                    value={astKustodian}
                    onChange={(e) => setAstKustodian(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Bilyet / Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Opsional (No. Seri / Wallet)"
                    value={astNomorSeri}
                    onChange={(e) => setAstNomorSeri(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Jatuh tempo Oktober 2027 / Kupon 6.25% p.a."
                  value={astKeterangan}
                  onChange={(e) => setAstKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold shadow-md transition-colors"
                >
                  Simpan ke Portofolio Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CATAT PEMBAYARAN IURAN (KHUSUS BENDAHARA)             */}
      {/* ============================================================== */}
      {payIuranModal && canInputFinance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-300" />
                Catat Pembayaran Iuran (Bendahara)
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
                  NRP: {payIuranModal.nrp} &bull; {payIuranModal.polda}
                </span>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                  <span>
                    Tagihan: <b>{formatRupiah(payIuranModal.totalTagihan)}</b>
                  </span>
                  <span>
                    Sudah Bayar: <b className="text-emerald-700">{formatRupiah(payIuranModal.totalTerbayar)}</b>
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Setoran yang Diterima</label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={payNominal}
                  onChange={(e) => setPayNominal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-black text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Jumlah yang dibukukan: {formatRupiah(payNominal)}
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
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
