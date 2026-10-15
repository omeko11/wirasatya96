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
  ArrowDownRight,
  PlusCircle,
  Download,
  Heart,
  GraduationCap,
  Search,
  Filter,
  X,
  CreditCard,
  CheckCircle2,
  Users,
  Coins,
  Briefcase,
  Trash2,
  Eye,
  Info,
  Settings,
  Plus,
} from 'lucide-react';

export interface FinanceCategoryOption {
  code: string;
  label: string;
}

export interface FinanceConfig {
  iuranWajibPerBulan: number;
  tahunBuku: number;
  subKategoriMasuk: FinanceCategoryOption[];
  subKategoriKeluar: FinanceCategoryOption[];
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_FINANCE_CONFIG: FinanceConfig = {
  iuranWajibPerBulan: 250000,
  tahunBuku: 2026,
  subKategoriMasuk: [
    { code: 'IURAN_WAJIB_BULANAN', label: 'Iuran Wajib Bulanan Anggota' },
    { code: 'SUMBANGAN_SUKARELA', label: 'Sumbangan Sukarela / Donasi Leting' },
    { code: 'PENCAIRAN_ASET_INVESTASI', label: 'Bagi Hasil / Pencairan Aset Berharga (SBN/Valas/Crypto)' },
    { code: 'DANA_KEGIATAN_REUNI', label: 'Sumbangan Khusus Kegiatan / Reuni' },
    { code: 'PEMASUKAN_LAINNYA', label: 'Penerimaan Kas Lainnya' },
  ],
  subKategoriKeluar: [
    { code: 'SANTUNAN_KESEHATAN', label: 'Santunan Kesehatan / Rekan Sakit' },
    { code: 'SANTUNAN_DUKA_CITA', label: 'Santunan Duka Cita Keluarga Besar' },
    { code: 'BANTUAN_PENDIDIKAN_ANAK', label: 'Bantuan Pendidikan Putra-Putri Leting' },
    { code: 'PEMBELIAN_ASET_INVESTASI', label: 'Pembelian Aset Berharga (SBN / Valas / Crypto / Emas)' },
    { code: 'OPERASIONAL_PAGUYUBAN', label: 'Operasional & Kesekretariatan Paguyuban' },
    { code: 'KEGIATAN_REUNI_LETING', label: 'Biaya Kegiatan Reuni & Silaturahmi Leting' },
    { code: 'PENGELUARAN_LAINNYA', label: 'Pengeluaran Kas Lainnya' },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem Default Kebendaharaan WS96',
};

interface BendaharaPortalProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  financeSummary: FinanceSummary;
  transactions: KasTransaction[];
  iuranList: IuranAnggota[];
  assets?: AssetPortfolioItem[];
  financeConfig?: FinanceConfig;
  onAddTransaction: (trx: Omit<KasTransaction, 'id' | 'createdAt'> & { jumlahBulanIuran?: number }) => void;
  onPayIuran: (nrp: string, nominal: number) => void;
  onAddAsset?: (asset: Omit<AssetPortfolioItem, 'id' | 'updatedAt'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateFinanceConfig?: (config: FinanceConfig) => void;
}

const ASSET_CATEGORY_LABELS: Record<
  AssetCategory,
  { label: string; badge: string; defaultSatuan: string; placeholderNama: string; placeholderKustodian: string }
> = {
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
  financeConfig: propFinanceConfig,
  onAddTransaction,
  onPayIuran,
  onAddAsset,
  onDeleteAsset,
  onUpdateFinanceConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'bukuKas' | 'aset' | 'iuran' | 'santunan' | 'pendidikan'>('bukuKas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');
  const [showReadOnlyInfo, setShowReadOnlyInfo] = useState(false);

  // Local synced state for finance data & config
  const [localSummary, setLocalSummary] = useState<FinanceSummary & { totalKasMasuk?: number; totalKasKeluar?: number }>(
    financeSummary
  );
  const [localTransactions, setLocalTransactions] = useState<KasTransaction[]>(transactions || []);
  const [localIuranList, setLocalIuranList] = useState<IuranAnggota[]>(iuranList || []);
  const [localAssets, setLocalAssets] = useState<AssetPortfolioItem[]>(propAssets || []);
  const [financeConfig, setFinanceConfig] = useState<FinanceConfig>(propFinanceConfig || DEFAULT_FINANCE_CONFIG);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<'SEMUA' | AssetCategory>('SEMUA');

  useEffect(() => {
    setLocalSummary(financeSummary);
  }, [financeSummary]);

  useEffect(() => {
    setLocalTransactions(transactions || []);
  }, [transactions]);

  useEffect(() => {
    setLocalIuranList(iuranList || []);
  }, [iuranList]);

  useEffect(() => {
    if (propAssets) {
      setLocalAssets(propAssets);
    }
  }, [propAssets]);

  useEffect(() => {
    if (propFinanceConfig) {
      setFinanceConfig(propFinanceConfig);
    }
  }, [propFinanceConfig]);

  // Fetch latest finance state and config from API
  useEffect(() => {
    fetch('/api/finance')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const payload = res.data || res;
          if (payload.summary) setLocalSummary(payload.summary);
          if (Array.isArray(payload.transactions)) setLocalTransactions(payload.transactions);
          if (Array.isArray(payload.assets)) setLocalAssets(payload.assets);
          if (Array.isArray(payload.iuranList) && payload.iuranList.length > 0) {
            setLocalIuranList(payload.iuranList);
          } else if (Array.isArray(payload.iuran) && payload.iuran.length > 0) {
            setLocalIuranList(payload.iuran);
          }
          if (payload.financeConfig) {
            setFinanceConfig(payload.financeConfig);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Modal State for Cascading Cashflow Input (BENDAHARA & SUPERADMIN)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxJenis, setTrxJenis] = useState<TransactionType>('MASUK');
  const [trxKategori, setTrxKategori] = useState<string>('IURAN_WAJIB_BULANAN');
  const [trxNominal, setTrxNominal] = useState<number>(250000);
  const [trxTanggal, setTrxTanggal] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [trxReferensi, setTrxReferensi] = useState<string>('');
  const [trxKeterangan, setTrxKeterangan] = useState('');
  const [trxPihak, setTrxPihak] = useState('');
  const [trxNrp, setTrxNrp] = useState('');
  const [jumlahBulanIuran, setJumlahBulanIuran] = useState<number>(1);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  // Modal State for Pengaturan Kebendaharaan (Tarif Iuran Wajib & Master Kategori Cashflow)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [draftIuranPerBulan, setDraftIuranPerBulan] = useState<number>(DEFAULT_FINANCE_CONFIG.iuranWajibPerBulan);
  const [draftTahunBuku, setDraftTahunBuku] = useState<number>(DEFAULT_FINANCE_CONFIG.tahunBuku);
  const [draftSubMasuk, setDraftSubMasuk] = useState<FinanceCategoryOption[]>(DEFAULT_FINANCE_CONFIG.subKategoriMasuk);
  const [draftSubKeluar, setDraftSubKeluar] = useState<FinanceCategoryOption[]>(DEFAULT_FINANCE_CONFIG.subKategoriKeluar);
  const [newMasukLabel, setNewMasukLabel] = useState('');
  const [newKeluarLabel, setNewKeluarLabel] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Modal State for New Asset Portfolio Item (BENDAHARA & SUPERADMIN)
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

  // Modal Pay Iuran (BENDAHARA & SUPERADMIN)
  const [payIuranModal, setPayIuranModal] = useState<IuranAnggota | null>(null);
  const [payNominal, setPayNominal] = useState<number>(250000);

  // PERMISSION RULES:
  const userRole = currentUser.role;
  const canInputKas = userRole === 'BENDAHARA' || userRole === 'SUPERADMIN';
  const canRekap = userRole === 'BENDAHARA' || userRole === 'KETUA' || userRole === 'SUPERADMIN';
  const canInputFinance = canInputKas;
  const canRekapFinance = canRekap;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Compute Cashflow Summary from transactions & assets
  const totalKasMasuk = localTransactions
    .filter((t) => t.jenis === 'MASUK')
    .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
  const totalKasKeluar = localTransactions
    .filter((t) => t.jenis === 'KELUAR')
    .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
  const effectiveSaldoKas =
    localTransactions.length > 0 ? totalKasMasuk - totalKasKeluar : localSummary.saldoUtama || 0;
  const totalValuasiAset = localAssets.reduce((sum, a) => sum + (Number(a.estimasiNilaiIdr) || 0), 0);
  const totalKekayaanGabungan = effectiveSaldoKas + totalValuasiAset;

  const lunasCount = localIuranList.filter((i) => i.status === 'LUNAS').length;
  const sebagianCount = localIuranList.filter((i) => i.status === 'SEBAGIAN').length;
  const iuranCompliancePct =
    localIuranList.length > 0 ? ((lunasCount / localIuranList.length) * 100).toFixed(1) : '0.0';

  const getCategoryLabel = (code: string) => {
    const foundMasuk = financeConfig.subKategoriMasuk.find((c) => c.code === code);
    if (foundMasuk) return foundMasuk.label;
    const foundKeluar = financeConfig.subKategoriKeluar.find((c) => c.code === code);
    if (foundKeluar) return foundKeluar.label;
    return code.replace(/_/g, ' ');
  };

  // Filtered transactions
  const filteredTransactions = localTransactions.filter((t) => {
    const matchType = selectedFilter === 'SEMUA' || t.jenis === selectedFilter;
    const matchSearch =
      t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nomorReferensi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.pihakTerkait && t.pihakTerkait.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  // Filtered assets
  const filteredAssets = localAssets.filter((a) => {
    return assetCategoryFilter === 'SEMUA' || a.kategori === assetCategoryFilter;
  });

  const handleOpenMutasiModal = (defaultJenis: TransactionType = 'MASUK', defaultKategori?: string) => {
    setTrxJenis(defaultJenis);
    const list = defaultJenis === 'MASUK' ? financeConfig.subKategoriMasuk : financeConfig.subKategoriKeluar;
    const chosenCat = defaultKategori || list[0]?.code || (defaultJenis === 'MASUK' ? 'IURAN_WAJIB_BULANAN' : 'SANTUNAN_KESEHATAN');
    setTrxKategori(chosenCat);
    setJumlahBulanIuran(1);
    setTrxNominal(
      defaultJenis === 'MASUK' && chosenCat === 'IURAN_WAJIB_BULANAN'
        ? financeConfig.iuranWajibPerBulan
        : 1000000
    );
    setTrxTanggal(new Date().toISOString().split('T')[0]);
    setTrxReferensi('WS96-KAS-' + Date.now().toString().slice(-4));
    setTrxKeterangan('');
    setTrxPihak('');
    setTrxNrp('');
    setMemberSearchQuery('');
    setIsModalOpen(true);
  };

  const handleOpenConfigModal = () => {
    setDraftIuranPerBulan(financeConfig.iuranWajibPerBulan || 250000);
    setDraftTahunBuku(financeConfig.tahunBuku || 2026);
    setDraftSubMasuk([...(financeConfig.subKategoriMasuk || DEFAULT_FINANCE_CONFIG.subKategoriMasuk)]);
    setDraftSubKeluar([...(financeConfig.subKategoriKeluar || DEFAULT_FINANCE_CONFIG.subKategoriKeluar)]);
    setNewMasukLabel('');
    setNewKeluarLabel('');
    setIsConfigModalOpen(true);
  };

  const handleAddSubKategori = (jenis: 'MASUK' | 'KELUAR') => {
    const rawLabel = jenis === 'MASUK' ? newMasukLabel.trim() : newKeluarLabel.trim();
    if (!rawLabel) return;
    const generatedCode = rawLabel
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || ('KATEGORI_' + Date.now().toString().slice(-4));

    if (jenis === 'MASUK') {
      if (!draftSubMasuk.some((c) => c.code === generatedCode)) {
        setDraftSubMasuk([...draftSubMasuk, { code: generatedCode, label: rawLabel }]);
      }
      setNewMasukLabel('');
    } else {
      if (!draftSubKeluar.some((c) => c.code === generatedCode)) {
        setDraftSubKeluar([...draftSubKeluar, { code: generatedCode, label: rawLabel }]);
      }
      setNewKeluarLabel('');
    }
  };

  const handleRemoveSubKategori = (jenis: 'MASUK' | 'KELUAR', code: string) => {
    if (jenis === 'MASUK') {
      if (draftSubMasuk.length <= 1) return;
      setDraftSubMasuk(draftSubMasuk.filter((c) => c.code !== code));
    } else {
      if (draftSubKeluar.length <= 1) return;
      setDraftSubKeluar(draftSubKeluar.filter((c) => c.code !== code));
    }
  };

  const handleSaveFinanceConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputKas) return;
    setIsSavingConfig(true);

    const nextIuran = Math.max(10000, Number(draftIuranPerBulan) || 250000);
    const nextTahun = Number(draftTahunBuku) || 2026;

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_FINANCE_CONFIG',
          actorRole: currentUser.role,
          iuranWajibPerBulan: nextIuran,
          tahunBuku: nextTahun,
          subKategoriMasuk: draftSubMasuk,
          subKategoriKeluar: draftSubKeluar,
          updatedBy: currentUser.nama,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedCfg: FinanceConfig = data.financeConfig || data.data?.financeConfig || {
          iuranWajibPerBulan: nextIuran,
          tahunBuku: nextTahun,
          subKategoriMasuk: draftSubMasuk,
          subKategoriKeluar: draftSubKeluar,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.nama,
        };
        setFinanceConfig(updatedCfg);
        if (onUpdateFinanceConfig) onUpdateFinanceConfig(updatedCfg);

        const nextIuranList: IuranAnggota[] =
          data.iuranList ||
          data.iuran ||
          data.data?.iuranList ||
          localIuranList.map((item) => {
            const totalTagihan = nextIuran * 12;
            const status =
              item.totalTerbayar >= totalTagihan
                ? 'LUNAS'
                : item.totalTerbayar > 0
                ? 'SEBAGIAN'
                : 'BELUM_BAYAR';
            return { ...item, tahun: nextTahun, totalTagihan, status };
          });
        setLocalIuranList(nextIuranList);

        if (data.summary || data.data?.summary) {
          setLocalSummary(data.summary || data.data.summary);
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'wirasatya96_finance',
            JSON.stringify({
              summary: data.summary || localSummary,
              transactions: localTransactions,
              assets: localAssets,
              iuranList: nextIuranList,
              financeConfig: updatedCfg,
            })
          );
        }
      }
    } catch {
      // Fallback local update
      const updatedCfg: FinanceConfig = {
        iuranWajibPerBulan: nextIuran,
        tahunBuku: nextTahun,
        subKategoriMasuk: draftSubMasuk,
        subKategoriKeluar: draftSubKeluar,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.nama,
      };
      setFinanceConfig(updatedCfg);
    } finally {
      setIsSavingConfig(false);
      setIsConfigModalOpen(false);
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputKas) {
      alert('Akses Ditolak: Penginputan transaksi kas hanya dapat dilakukan oleh Bendahara atau Superadmin.');
      return;
    }
    if (!trxNominal || !trxKeterangan) {
      alert('Mohon isi nominal dan keterangan transaksi.');
      return;
    }

    const refCode = trxReferensi.trim() || 'WS96-KAS-' + Date.now().toString().slice(-4);
    const tanggalStr = trxTanggal || new Date().toISOString().split('T')[0];
    const bulanCount =
      trxJenis === 'MASUK' && trxKategori === 'IURAN_WAJIB_BULANAN' && trxNrp
        ? Math.max(1, Number(jumlahBulanIuran) || 1)
        : 0;

    const trxPayload = {
      nomorReferensi: refCode,
      tanggal: tanggalStr,
      jenis: trxJenis,
      kategori: trxKategori as TransactionCategory,
      nominal: Number(trxNominal),
      keterangan: trxKeterangan.trim(),
      pihakTerkait: trxPihak.trim() || '-',
      nrpTerkait: trxNrp.trim() || '',
      dicatatOleh: currentUser.nama,
      ...(bulanCount > 0 ? { jumlahBulanIuran: bulanCount } : {}),
    };

    onAddTransaction(trxPayload);

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_TRANSACTION',
          actorRole: currentUser.role,
          ...trxPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.transactions)) setLocalTransactions(data.transactions);
        if (Array.isArray(data.iuranList)) setLocalIuranList(data.iuranList);
        if (data.summary) setLocalSummary(data.summary);
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'wirasatya96_finance',
            JSON.stringify({
              summary: data.summary || localSummary,
              transactions: data.transactions || localTransactions,
              assets: localAssets,
              iuranList: data.iuranList || localIuranList,
              financeConfig,
            })
          );
        }
      }
    } catch {
      // Fallback local state update
      const fallbackTrx: KasTransaction = {
        ...trxPayload,
        id: 'trx-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      setLocalTransactions((prev) => [fallbackTrx, ...prev]);
    }

    setIsModalOpen(false);
    setTrxKeterangan('');
    setTrxPihak('');
    setTrxNrp('');
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputKas) {
      alert('Akses Ditolak: Pencatatan aset hanya dapat dilakukan oleh Bendahara atau Superadmin.');
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
    }

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
        setLocalAssets((prev) => {
          if (prev.some((a) => a.kodeAset === data.data.kodeAset)) return prev;
          return [data.data, ...prev];
        });
        if (data.summary) setLocalSummary(data.summary);
      }
    } catch {
      // Fallback local
    }

    setIsAssetModalOpen(false);
    setAstNama('');
    setAstKustodian('');
    setAstNomorSeri('');
    setAstKeterangan('');
  };

  const handleRemoveAsset = async (id: string) => {
    if (!canInputKas) return;
    if (onDeleteAsset) {
      onDeleteAsset(id);
    }
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
        if (data.summary) setLocalSummary(data.summary);
      }
    } catch {
      setLocalAssets((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleConfirmPayIuran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInputKas || !payIuranModal) return;
    const targetNrp = payIuranModal.nrp;
    const amount = Number(payNominal);
    onPayIuran(targetNrp, amount);
    setPayIuranModal(null);

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAY_IURAN',
          actorRole: currentUser.role,
          nrp: targetNrp,
          nominal: amount,
          dicatatOleh: currentUser.nama,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.iuranList)) setLocalIuranList(data.iuranList);
        if (Array.isArray(data.transactions)) setLocalTransactions(data.transactions);
        if (data.summary) setLocalSummary(data.summary);
      }
    } catch {
      // ignore
    }
  };

  const handleExportFinanceCSV = () => {
    if (!canRekap) {
      alert('Akses Ditolak: Rekap laporan kas & aset hanya dapat diunduh oleh Bendahara, Ketua, dan Superadmin.');
      return;
    }

    const trxHeaders = [
      'TIPE DATA',
      'Nomor Referensi / Kode',
      'Tanggal',
      'Jenis / Kategori',
      'Sub-Kategori / Satuan',
      'Unit',
      'Nominal / Estimasi IDR',
      'Pihak / Kustodian',
      'Keterangan',
      'Dicatat Oleh',
    ];
    const trxRows = localTransactions.map((t) => [
      '"TRANSAKSI_KAS"',
      `"${t.nomorReferensi}"`,
      `"${t.tanggal}"`,
      `"${t.jenis}"`,
      `"${getCategoryLabel(t.kategori).replace(/"/g, '""')}"`,
      '1',
      t.nominal,
      `"${(t.pihakTerkait || '-').replace(/"/g, '""')}"`,
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

  const filteredMemberOptions = members.filter(
    (m) =>
      !memberSearchQuery.trim() ||
      m.namaLengkap.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.nrp.includes(memberSearchQuery.trim())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 sm:p-5 rounded-2xl border border-emerald-700/40 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Wallet className="w-5 h-5" />
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Kas &amp; Aset
            </h2>
            <span
              className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 text-amber-300 inline-flex items-center justify-center cursor-help text-[11px] font-bold"
              title="Pembukuan arus kas masuk/keluar, iuran wajib, dan portofolio aset berharga (SBN, Valas, Crypto, Emas)."
            >
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canInputKas ? (
            <>
              <button
                onClick={() => handleOpenMutasiModal('MASUK')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                + Kas
              </button>
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all"
              >
                <Coins className="w-4 h-4" />
                + Aset
              </button>
              <button
                onClick={handleOpenConfigModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs border border-amber-400/30 transition-all"
                title="Pengaturan Iuran & Kategori Kas"
              >
                <Settings className="w-4 h-4" />
                Atur
              </button>
            </>
          ) : (
            <div
              className="relative inline-flex items-center gap-1.5"
              onMouseEnter={() => setShowReadOnlyInfo(true)}
              onMouseLeave={() => setShowReadOnlyInfo(false)}
            >
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-100 text-xs font-bold inline-flex items-center gap-1.5 border border-white/15">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Read-Only
              </span>
              <button
                type="button"
                onClick={() => setShowReadOnlyInfo((v) => !v)}
                aria-label="Informasi Hak Akses Kebendaharaan"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-amber-300 flex items-center justify-center border border-white/20 transition-all"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {showReadOnlyInfo && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-xl bg-slate-950/95 text-slate-100 text-[11px] leading-relaxed border border-amber-500/40 shadow-2xl z-40">
                  <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Akses Kebendaharaan
                  </div>
                  Input kas masuk/keluar, pengaturan iuran wajib, dan portofolio aset dikelola khusus oleh{' '}
                  <b className="text-emerald-300">Bendahara</b>.
                </div>
              )}
            </div>
          )}

          {canRekap && (
            <button
              onClick={handleExportFinanceCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition-all"
              title="Unduh Rekap Kas & Aset (CSV)"
            >
              <Download className="w-4 h-4 text-amber-300" />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* Top KPI Cards — Cashflow Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo Kas Tunai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Saldo Kas Tunai</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {formatRupiah(effectiveSaldoKas)}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Kas + Aset:</span>
              <span className="font-bold text-slate-800">{formatRupiah(totalKekayaanGabungan)}</span>
            </div>
          </div>
        </div>

        {/* 2. Arus Kas (Cashflow) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-red-50/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Arus Kas (Cashflow)</span>
            <div className="flex items-center gap-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700" title="Total Kas Masuk">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="p-1.5 rounded-lg bg-red-100 text-red-700" title="Total Kas Keluar">
                <ArrowDownRight className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/70 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-800">Kas Masuk</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700">
                + {formatRupiah(totalKasMasuk)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-red-50/80 border border-red-200/70 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-red-800">Kas Keluar</span>
              <span className="text-xs sm:text-sm font-black text-red-600">
                - {formatRupiah(totalKasKeluar)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Nilai Aset Berharga */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Portofolio Aset</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Coins className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-blue-950 block">
              {formatRupiah(totalValuasiAset)}
            </span>
            <span className="text-[11px] text-blue-700 font-medium block mt-1.5">
              {localAssets.length} instrumen (SBN, Valas, Crypto, Emas)
            </span>
          </div>
        </div>

        {/* 4. Iuran Wajib */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-950">Iuran Wajib</span>
              {canInputKas && (
                <button
                  type="button"
                  onClick={handleOpenConfigModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  ⚙️ Atur
                </button>
              )}
            </div>
            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                {formatRupiah(financeConfig.iuranWajibPerBulan)}{' '}
                <span className="text-xs font-bold text-slate-500">/ Bulan</span>
              </span>
              <span className="text-[11px] text-amber-800 font-semibold block mt-1.5">
                Target {financeConfig.tahunBuku}: {formatRupiah(financeConfig.iuranWajibPerBulan * 12)} / Thn &bull;{' '}
                <b>{iuranCompliancePct}% Lunas</b> ({lunasCount} Lunas, {sebagianCount} Cicil)
              </span>
            </div>
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
            Buku Kas ({localTransactions.length})
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
            Portofolio ({localAssets.length})
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
            Iuran Wajib ({localIuranList.length})
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
            Santunan ({chronicIllMembers.length})
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
            Pendidikan Anak
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
                  placeholder="Cari transaksi, kategori, keterangan, no ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 font-semibold">Arus Kas:</span>
                  {(['SEMUA', 'MASUK', 'KELUAR'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        selectedFilter === filter
                          ? filter === 'MASUK'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : filter === 'KELUAR'
                            ? 'bg-red-700 text-white border-red-700'
                            : 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {filter === 'MASUK' ? 'SALDO MASUK' : filter === 'KELUAR' ? 'SALDO KELUAR' : 'SEMUA'}
                    </button>
                  ))}
                </div>

                {canInputKas && (
                  <button
                    onClick={() => handleOpenMutasiModal('MASUK')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Catat Mutasi Kas
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal &amp; Ref</th>
                    <th className="px-4 py-3">Jenis &amp; Sub-Kategori Cashflow</th>
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
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              trx.jenis === 'MASUK'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {trx.jenis === 'MASUK' ? 'SALDO MASUK' : 'SALDO KELUAR'}
                          </span>
                          <span className="text-slate-800 font-bold text-[11px]">
                            {getCategoryLabel(trx.kategori)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-medium text-slate-900 block">{trx.keterangan}</span>
                        {trx.pihakTerkait && trx.pihakTerkait !== '-' && (
                          <span className="text-[11px] text-blue-700 font-semibold">
                            Terkait: {trx.pihakTerkait} {trx.nrpTerkait ? `(NRP ${trx.nrpTerkait})` : ''}
                          </span>
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
              {canInputKas && (
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
                    {canInputKas && <th className="px-4 py-3 text-center">Aksi</th>}
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
                        {canInputKas && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveAsset(ast.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Aset (Bendahara / Superadmin)"
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
                      <td colSpan={canInputKas ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
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
                <span className="font-bold block mb-1">
                  📌 Iuran Wajib Leting ({formatRupiah(financeConfig.iuranWajibPerBulan)} / Bulan &bull;{' '}
                  {formatRupiah(financeConfig.iuranWajibPerBulan * 12)} / Tahun {financeConfig.tahunBuku}):
                </span>
                Pencatatan penerimaan iuran dan perubahan tarif iuran bulanan dikelola oleh <b>Bendahara / Superadmin</b>. Anggota dapat memantau status pembayarannya secara langsung di tabel ini.
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {canInputKas && (
                  <button
                    type="button"
                    onClick={handleOpenConfigModal}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition-all"
                  >
                    ⚙️ Ubah Tarif Iuran
                  </button>
                )}
                <div className="text-right">
                  <span className="text-[11px] text-emerald-700 font-semibold block">Tingkat Kepatuhan</span>
                  <span className="text-xl font-black text-emerald-900">{iuranCompliancePct}% Lunas</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Perwira &amp; NRP</th>
                    <th className="px-4 py-3">Pangkat &amp; Satker</th>
                    <th className="px-4 py-3">Target Iuran {financeConfig.tahunBuku}</th>
                    <th className="px-4 py-3">Terbayar</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    {canInputKas && <th className="px-4 py-3 text-center">Input Bendahara</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localIuranList.map((iur) => (
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
                        <span className="block text-[10px] text-slate-400 font-normal">
                          12 &times; {formatRupiah(financeConfig.iuranWajibPerBulan)}
                        </span>
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
                      {canInputKas && (
                        <td className="px-4 py-3 text-center">
                          {iur.status !== 'LUNAS' ? (
                            <button
                              onClick={() => {
                                setPayIuranModal(iur);
                                setPayNominal(
                                  Math.max(
                                    financeConfig.iuranWajibPerBulan,
                                    iur.totalTagihan - iur.totalTerbayar
                                  )
                                );
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
                  {localIuranList.length === 0 && (
                    <tr>
                      <td colSpan={canInputKas ? 6 : 5} className="px-4 py-8 text-center text-slate-400">
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
              Daftar rekan yang membutuhkan atensi medis. Pencatatan penyaluran dana santunan dilakukan oleh <b>Bendahara / Superadmin</b>.
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

                      {canInputKas && (
                        <button
                          onClick={() => {
                            setTrxJenis('KELUAR');
                            setTrxKategori('SANTUNAN_KESEHATAN');
                            setTrxNominal(10000000);
                            setTrxTanggal(new Date().toISOString().split('T')[0]);
                            setTrxReferensi('WS96-SNT-' + Date.now().toString().slice(-4));
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
      {/* MODAL 1: CASCADING CASHFLOW INPUT (CATAT MUTASI KAS)           */}
      {/* ============================================================== */}
      {isModalOpen && canInputKas && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  Catat Mutasi Kas &amp; Cashflow (Otoritas Bendahara / Superadmin)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pilih arah arus kas terlebih dahulu, lalu tentukan sub-kategori dan nominal.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 text-xs">
              {/* STEP 1: PILIH JENIS TRANSAKSI CASHFLOW */}
              <div className="space-y-1.5">
                <label className="block font-extrabold text-slate-800 uppercase tracking-wide text-[11px]">
                  Step 1: Pilih Jenis Transaksi Cashflow
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTrxJenis('MASUK');
                      const firstMasuk = financeConfig.subKategoriMasuk[0]?.code || 'IURAN_WAJIB_BULANAN';
                      setTrxKategori(firstMasuk);
                      if (firstMasuk === 'IURAN_WAJIB_BULANAN') {
                        setTrxNominal(financeConfig.iuranWajibPerBulan * jumlahBulanIuran);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                      trxJenis === 'MASUK'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`p-2 rounded-lg ${
                        trxJenis === 'MASUK' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-black block text-xs">SALDO MASUK / INFLOW</span>
                      <span className="text-[10px] opacity-80 block">Penerimaan Kas &amp; Iuran</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrxJenis('KELUAR');
                      const firstKeluar = financeConfig.subKategoriKeluar[0]?.code || 'SANTUNAN_KESEHATAN';
                      setTrxKategori(firstKeluar);
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                      trxJenis === 'KELUAR'
                        ? 'border-red-600 bg-red-50 text-red-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`p-2 rounded-lg ${
                        trxJenis === 'KELUAR' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ArrowDownRight className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-black block text-xs">SALDO KELUAR / OUTFLOW</span>
                      <span className="text-[10px] opacity-80 block">Pengeluaran &amp; Santunan</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* STEP 2: PILIH SUB-KATEGORI CASHFLOW (DYNAMICALLY FILTERED BY STEP 1) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-800 uppercase tracking-wide text-[11px]">
                    Step 2: Pilih Sub-Kategori Cashflow ({trxJenis === 'MASUK' ? 'Inflow' : 'Outflow'})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleOpenConfigModal();
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    + Kelola Master Kategori
                  </button>
                </div>

                <select
                  value={trxKategori}
                  onChange={(e) => {
                    const nextCode = e.target.value;
                    setTrxKategori(nextCode);
                    if (trxJenis === 'MASUK' && nextCode === 'IURAN_WAJIB_BULANAN') {
                      setTrxNominal(financeConfig.iuranWajibPerBulan * jumlahBulanIuran);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-slate-50/70 focus:ring-2 focus:ring-slate-900"
                >
                  {(trxJenis === 'MASUK' ? financeConfig.subKategoriMasuk : financeConfig.subKategoriKeluar).map(
                    (opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label} ({opt.code})
                      </option>
                    )
                  )}
                </select>

                {/* Special Iuran Wajib Bulanan Synchronizer Box */}
                {trxJenis === 'MASUK' && trxKategori === 'IURAN_WAJIB_BULANAN' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-950 text-[11px]">
                        🔄 Sinkronisasi Otomatis Buku Iuran Perwira (Opsional)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Tarif: {formatRupiah(financeConfig.iuranWajibPerBulan)} / bln
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                          Cari / Pilih Perwira Penyetor
                        </label>
                        <input
                          type="text"
                          placeholder="Ketik nama atau NRP..."
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs mb-1.5"
                        />
                        <select
                          value={trxNrp}
                          onChange={(e) => {
                            const selectedNrp = e.target.value;
                            setTrxNrp(selectedNrp);
                            const found = members.find((m) => m.nrp === selectedNrp);
                            if (found) {
                              setTrxPihak(found.namaLengkap);
                              setTrxKeterangan(
                                `Pembayaran Iuran Wajib Bulanan (${jumlahBulanIuran} bulan) oleh ${found.namaLengkap}`
                              );
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-semibold text-xs"
                        >
                          <option value="">-- Pilih Perwira (Atau Isi Manual) --</option>
                          {filteredMemberOptions.slice(0, 170).map((m) => (
                            <option key={m.nrp} value={m.nrp}>
                              {m.namaLengkap} ({m.nrp})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                          Jumlah Bulan Iuran
                        </label>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {[1, 3, 6, 12].map((bln) => (
                            <button
                              key={bln}
                              type="button"
                              onClick={() => {
                                setJumlahBulanIuran(bln);
                                setTrxNominal(financeConfig.iuranWajibPerBulan * bln);
                                if (trxPihak) {
                                  setTrxKeterangan(`Pembayaran Iuran Wajib Bulanan (${bln} bulan) oleh ${trxPihak}`);
                                }
                              }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                                jumlahBulanIuran === bln
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              {bln} Bln
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={jumlahBulanIuran}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            setJumlahBulanIuran(val);
                            setTrxNominal(financeConfig.iuranWajibPerBulan * val);
                            if (trxPihak) {
                              setTrxKeterangan(`Pembayaran Iuran Wajib Bulanan (${val} bulan) oleh ${trxPihak}`);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: NOMINAL, TANGGAL, PIHAK TERKAIT & KETERANGAN */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block font-extrabold text-slate-800 uppercase tracking-wide text-[11px]">
                  Step 3: Nominal (Rp), Tanggal, Pihak Terkait &amp; Keterangan
                </label>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700">Nominal Transaksi (Rupiah)</span>
                    <span className="text-[11px] font-extrabold text-emerald-700">
                      {formatRupiah(trxNominal)}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={trxNominal}
                    onChange={(e) => setTrxNominal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-900"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {[
                      financeConfig.iuranWajibPerBulan,
                      financeConfig.iuranWajibPerBulan * 6,
                      financeConfig.iuranWajibPerBulan * 12,
                      5000000,
                      10000000,
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTrxNominal(preset)}
                        className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                      >
                        {formatRupiah(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                    <input
                      type="date"
                      required
                      value={trxTanggal}
                      onChange={(e) => setTrxTanggal(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Referensi Bukti</label>
                    <input
                      type="text"
                      placeholder="WS96-KAS-..."
                      value={trxReferensi}
                      onChange={(e) => setTrxReferensi(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pihak / Perwira Terkait</label>
                    <input
                      type="text"
                      placeholder="Contoh: Nama Perwira / Bank / Vendor"
                      value={trxPihak}
                      onChange={(e) => setTrxPihak(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NRP Terkait (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 74090001"
                      value={trxNrp}
                      onChange={(e) => setTrxNrp(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan / Referensi</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Rincian lengkap sumber penerimaan atau keperluan pengeluaran kas..."
                    value={trxKeterangan}
                    onChange={(e) => setTrxKeterangan(e.target.value)}
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
                  className={`px-5 py-2 rounded-lg text-white font-bold shadow-md transition-colors ${
                    trxJenis === 'MASUK'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Simpan {trxJenis === 'MASUK' ? 'Saldo Masuk' : 'Saldo Keluar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CATAT PORTOFOLIO ASET BARU (BENDAHARA & SUPERADMIN)   */}
      {/* ============================================================== */}
      {isAssetModalOpen && canInputKas && (
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
                    step="any"
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
                    step="any"
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
      {/* MODAL 3: CATAT PEMBAYARAN IURAN (BENDAHARA & SUPERADMIN)       */}
      {/* ============================================================== */}
      {payIuranModal && canInputKas && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-300" />
                Catat Pembayaran Iuran (Bendahara / Superadmin)
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
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[1, 3, 6, 12].map((bln) => {
                    const nom = financeConfig.iuranWajibPerBulan * bln;
                    return (
                      <button
                        key={bln}
                        type="button"
                        onClick={() => setPayNominal(nom)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]"
                      >
                        {bln} Bln ({formatRupiah(nom)})
                      </button>
                    );
                  })}
                </div>
                <input
                  type="number"
                  min={1}
                  step="any"
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

      {/* ============================================================== */}
      {/* MODAL 4: PENGATURAN KEBENDAHARAAN (TARIF IURAN & KATEGORI)     */}
      {/* ============================================================== */}
      {isConfigModalOpen && canInputKas && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  Pengaturan Iuran &amp; Kategori Kas
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Perubahan tarif iuran otomatis memperbarui target tahunan seluruh anggota.
                </p>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFinanceConfig} className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Bagian 1: Tarif Iuran Wajib Bulanan */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 text-xs">
                    1. Tarif Iuran Wajib Bulanan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-bold text-[10px]">
                    Target Tahunan: {formatRupiah((Number(draftIuranPerBulan) || 0) * 12)} / Tahun
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Nominal Iuran Wajib Bulanan (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={draftIuranPerBulan}
                      onChange={(e) => setDraftIuranPerBulan(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-sm font-black text-slate-900"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[200000, 250000, 300000, 500000, 1000000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDraftIuranPerBulan(preset)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition-all ${
                            draftIuranPerBulan === preset
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {formatRupiah(preset)} / bln
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahun Buku</label>
                    <input
                      type="number"
                      required
                      min={2024}
                      max={2035}
                      value={draftTahunBuku}
                      onChange={(e) => setDraftTahunBuku(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Master Sub-Kategori Saldo Masuk & Saldo Keluar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sub-Kategori Saldo Masuk */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                  <div className="font-extrabold text-emerald-950 flex items-center justify-between">
                    <span>2A. Kategori Kas Masuk</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {draftSubMasuk.length} Kategori
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {draftSubMasuk.map((cat) => (
                      <div
                        key={cat.code}
                        className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-emerald-200/80"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">{cat.label}</span>
                          <span className="font-mono text-[9px] text-slate-400">{cat.code}</span>
                        </div>
                        {cat.code !== 'IURAN_WAJIB_BULANAN' && draftSubMasuk.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubKategori('MASUK', cat.code)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Hapus Sub-Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Tambah sub-kategori masuk..."
                      value={newMasukLabel}
                      onChange={(e) => setNewMasukLabel(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubKategori('MASUK')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                </div>

                {/* Sub-Kategori Saldo Keluar */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-3">
                  <div className="font-extrabold text-red-950 flex items-center justify-between">
                    <span>2B. Kategori Kas Keluar</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {draftSubKeluar.length} Kategori
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {draftSubKeluar.map((cat) => (
                      <div
                        key={cat.code}
                        className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-red-200/80"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">{cat.label}</span>
                          <span className="font-mono text-[9px] text-slate-400">{cat.code}</span>
                        </div>
                        {draftSubKeluar.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubKategori('KELUAR', cat.code)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Hapus Sub-Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Tambah sub-kategori keluar..."
                      value={newKeluarLabel}
                      onChange={(e) => setNewKeluarLabel(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-red-300 bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubKategori('KELUAR')}
                      className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500">
                  Terakhir diperbarui: <b>{financeConfig.updatedBy}</b>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-md transition-colors"
                  >
                    {isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

