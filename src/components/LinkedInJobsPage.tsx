'use client';

import React, { useState, useMemo } from 'react';
import { AuthUser, AnggotaWiraSatya, RiwayatJabatanLeting, FungsiPolri } from '@/types';
import {
  DAFTAR_38_POLDA,
  getSatkerUtamaByWilayah,
  getSubSatkerOptionsBySatker,
} from '@/data/polriStructure';
import {
  getAvatarUrl,
  getOrBuildUserProfile,
  resolveAvatarUrl,
  formatJabatanWithSatker,
  detectStatusKedinasan,
  extractCleanJabatanTitle,
  stripRankFromName,
  getActiveAdcSessionFromStorage,
  recordAdcActivityToAuditLog,
  getPangkatRankOrder,
  getLevelSatkerOrder,
  getRoleRankOrder,
  getStatusKedinasanOrder,
  isSuperadminAccount,
} from '@/lib/avatarUtils';
import {
  getJabatanGroupsForPangkat,
  isStandardPolriJabatan,
  isOfficerRankIpdaUp,
  EXTERNAL_JABATAN_SENTINEL,
  classifyJabatanForStats,
} from '@/data/polriJabatan';
import { MetaVerifiedBadge, resolveRoleForBadge } from './MetaVerifiedBadge';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Search, 
  PlusCircle,
  Award,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Phone,
  Info,
  X,
  ArrowUpDown,
} from 'lucide-react';

interface LinkedInJobsPageProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  onOpenFormWizard?: () => void;
  onSelectMember?: (member: AnggotaWiraSatya) => void;
  onOpenChat?: (member: AnggotaWiraSatya) => void;
  onUpdateMemberJabatan?: (nrp: string, jabatan: string, satker: string, polda: string) => void;
}

function inferFungsiPolri(jabatan: string, satker: string, polda: string): FungsiPolri {
  const text = `${jabatan} ${satker} ${polda}`.toUpperCase();
  if (text.includes('RESKRIM') || text.includes('BARESKRIM') || text.includes('NARKOBA') || text.includes('DITTIPID') || text.includes('SIBER') || text.includes('DENSUS')) {
    return 'RESERSE';
  }
  if (text.includes('INTEL') || text.includes('BAINTELKAM')) {
    return 'INTELKAM';
  }
  if (text.includes('LANTAS') || text.includes('KORLANTAS') || text.includes('PJR')) {
    return 'LANTAS';
  }
  if (text.includes('BRIMOB') || text.includes('SAMAPTA') || text.includes('SABHARA') || text.includes('BAHARKAM') || text.includes('POLAIR') || text.includes('GEGANA') || text.includes('PELOPOR')) {
    return 'BRIMOB_SABHARA';
  }
  if (text.includes('LEMDIKLAT') || text.includes('SESPIM') || text.includes('AKPOL') || text.includes('STIK') || text.includes('WIDYAISWARA') || text.includes('SPN') || text.includes('PUSDIK')) {
    return 'LEMDIKLAT';
  }
  if (text.includes('KEMENTERIAN') || text.includes('BNN') || text.includes('KPK') || text.includes('BNPT') || text.includes('DIVHUMAS') || text.includes('HUBINTER') || text.includes('PURNA')) {
    return 'LUAR_STRUKTUR';
  }
  return 'KEWILAYAHAN';
}

export const LinkedInJobsPage: React.FC<LinkedInJobsPageProps> = ({
  currentUser,
  members,
  onOpenFormWizard,
  onSelectMember,
  onOpenChat,
  onUpdateMemberJabatan,
}) => {
  const [selectedFungsi, setSelectedFungsi] = useState<string>('SEMUA');
  const [selectedPolda, setSelectedPolda] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'STATUS' | 'PANGKAT' | 'LEVEL_SATKER' | 'NRP' | 'NAMA' | 'ROLE'>('DEFAULT');
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const myProfile = useMemo(() => getOrBuildUserProfile(currentUser, members), [currentUser, members]);
  const myAvatarUrl = resolveAvatarUrl(myProfile.fotoUrl, currentUser.fotoUrl);

  const [customJabatanList, setCustomJabatanList] = useState<RiwayatJabatanLeting[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wirasatya96_riwayat_jabatan_v4');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((j: RiwayatJabatanLeting) => ({
              ...j,
              avatarUrl: getAvatarUrl(j.avatarUrl),
            }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const jabatanList = useMemo(() => {
    const visibleMembers = members.filter(
      (m) => !isSuperadminAccount(m.nrp, (m as { role?: string }).role)
    );
    const visibleCustom = customJabatanList.filter(
      (j) => !isSuperadminAccount(j.perwiraNrp)
    );

    const memberEntries: RiwayatJabatanLeting[] = visibleMembers.map((m) => {
      const statusKedinasan = detectStatusKedinasan(
        m.statusKedinasan || m.statusDinas,
        m.jabatanTerakhir || m.jabatan,
        m.jenisAnggota
      );
      const cleanJab = extractCleanJabatanTitle(m.jabatanTerakhir || m.jabatan) || 'Perwira Menengah Polri';
      const stk = m.satuanKerja || m.satker || 'Mabes Polri';
      const pld = m.polda || 'MABES POLRI';
      const uraianTugas =
        statusKedinasan === 'ALMARHUM'
          ? `Almarhum • Jabatan terakhir pada ${stk} (${pld}).`
          : statusKedinasan === 'PURNA_TUGAS'
          ? `Purna Tugas Polri • Jabatan terakhir pada ${stk} (${pld}).`
          : statusKedinasan === 'PTDH'
          ? `PTDH • Jabatan terakhir pada ${stk} (${pld}).`
          : `Penugasan aktif pada ${stk} (${pld}).`;
      return {
        id: `jab-member-${m.nrp}`,
        perwiraNrp: m.nrp,
        namaPerwira: m.namaLengkap,
        pangkat: m.pangkat,
        avatarUrl: getAvatarUrl(m.fotoUrl),
        jabatan: cleanJab,
        satker: stk,
        polda: pld,
        fungsiPolri: inferFungsiPolri(cleanJab, stk, pld),
        tahunMulai: 2024,
        isCurrent: statusKedinasan === 'AKTIF',
        statusKedinasan,
        uraianTugas,
        dasarTR: 'Data Direktori & UKP',
      };
    });
    return [...visibleCustom, ...memberEntries];
  }, [customJabatanList, members]);

  const [selectedKategoriJabatan, setSelectedKategoriJabatan] = useState<string>('SEMUA');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewExternalJabatan, setIsNewExternalJabatan] = useState(false);
  const [newJabatan, setNewJabatan] = useState({
    jabatan: '',
    polda: 'MABES POLRI',
    satkerUtama: 'BARESKRIM POLRI',
    subSatker: 'Pimpinan / Staf Utama Satker',
    fungsiPolri: 'RESERSE' as FungsiPolri,
    tahunMulai: 2026,
    uraianTugas: '',
    prestasiOperasional: '',
    dasarTR: '',
  });

  const jabatanCategoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    jabatanList.forEach((item) => {
      const cat = classifyJabatanForStats(
        item.jabatan,
        item.pangkat,
        item.polda === 'KEMEN/LEMBAGA' ? 'KEMEN/LEMBAGA' : undefined
      );
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jabatanList]);

  const filteredJabatan = useMemo(() => {
    return jabatanList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.jabatan.toLowerCase().includes(q) ||
        item.namaPerwira.toLowerCase().includes(q) ||
        item.perwiraNrp.toLowerCase().includes(q) ||
        item.satker.toLowerCase().includes(q) ||
        item.polda.toLowerCase().includes(q) ||
        (item.dasarTR && item.dasarTR.toLowerCase().includes(q));

      const matchesFungsi = selectedFungsi === 'SEMUA' || item.fungsiPolri === selectedFungsi;
      const matchesPolda = selectedPolda === 'SEMUA' || item.polda.toUpperCase() === selectedPolda.toUpperCase();
      const itemCat = classifyJabatanForStats(
        item.jabatan,
        item.pangkat,
        item.polda === 'KEMEN/LEMBAGA' ? 'KEMEN/LEMBAGA' : undefined
      );
      const matchesKategori = selectedKategoriJabatan === 'SEMUA' || itemCat === selectedKategoriJabatan;
      return matchesSearch && matchesFungsi && matchesPolda && matchesKategori;
    });
  }, [jabatanList, searchQuery, selectedFungsi, selectedPolda, selectedKategoriJabatan]);

  const sortedJabatan = useMemo(() => {
    const cmpStatus = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting) =>
      getStatusKedinasanOrder(a.statusKedinasan) - getStatusKedinasanOrder(b.statusKedinasan);
    const cmpPangkat = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting) =>
      getPangkatRankOrder(a.pangkat) - getPangkatRankOrder(b.pangkat);
    const cmpLevelSatker = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting) =>
      getLevelSatkerOrder(a.satker, a.polda, a.jabatan) - getLevelSatkerOrder(b.satker, b.polda, b.jabatan);
    const cmpNrp = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting) => {
      const nA = Number(String(a.perwiraNrp || '').replace(/\D/g, '')) || 0;
      const nB = Number(String(b.perwiraNrp || '').replace(/\D/g, '')) || 0;
      if (nA !== nB) return nA - nB;
      return String(a.perwiraNrp || '').localeCompare(String(b.perwiraNrp || ''));
    };
    const cmpNama = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting) =>
      (stripRankFromName(a.namaPerwira) || a.namaPerwira).localeCompare(
        stripRankFromName(b.namaPerwira) || b.namaPerwira,
        'id'
      );
    const cmpRole = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting) =>
      getRoleRankOrder(resolveRoleForBadge(a.perwiraNrp)) -
      getRoleRankOrder(resolveRoleForBadge(b.perwiraNrp));

    const comparePair = (a: RiwayatJabatanLeting, b: RiwayatJabatanLeting): number => {
      let res = 0;
      if (sortBy === 'DEFAULT' || sortBy === 'STATUS') {
        // 1. Almarhum -> 2. Purna Tugas -> 3. PTDH -> 4. Masih Aktif
        const statusDiff = cmpStatus(a, b);
        if (statusDiff !== 0) {
          res = statusDiff;
        } else {
          const st = a.statusKedinasan || 'AKTIF';
          if (st === 'ALMARHUM' || st === 'PURNA_TUGAS' || st === 'PTDH') {
            // Untuk Almarhum, Purna, dan PTDH: NRP paling kecil berada di urutan paling atas
            res =
              cmpNrp(a, b) ||
              cmpPangkat(a, b) ||
              cmpLevelSatker(a, b) ||
              cmpNama(a, b) ||
              cmpRole(a, b);
          } else {
            // Untuk yang Masih Aktif: Pangkat (Jenderal -> Bharada) -> Level Satker -> NRP (kecil -> besar) -> Nama -> Role
            res =
              cmpPangkat(a, b) ||
              cmpLevelSatker(a, b) ||
              cmpNrp(a, b) ||
              cmpNama(a, b) ||
              cmpRole(a, b);
          }
        }
      } else if (sortBy === 'PANGKAT') {
        res =
          cmpPangkat(a, b) ||
          cmpStatus(a, b) ||
          cmpLevelSatker(a, b) ||
          cmpNrp(a, b) ||
          cmpNama(a, b) ||
          cmpRole(a, b);
      } else if (sortBy === 'LEVEL_SATKER') {
        res =
          cmpLevelSatker(a, b) ||
          cmpStatus(a, b) ||
          cmpPangkat(a, b) ||
          cmpNrp(a, b) ||
          cmpNama(a, b) ||
          cmpRole(a, b);
      } else if (sortBy === 'NRP') {
        res =
          cmpNrp(a, b) ||
          cmpStatus(a, b) ||
          cmpPangkat(a, b) ||
          cmpLevelSatker(a, b) ||
          cmpNama(a, b) ||
          cmpRole(a, b);
      } else if (sortBy === 'NAMA') {
        res =
          cmpNama(a, b) ||
          cmpStatus(a, b) ||
          cmpPangkat(a, b) ||
          cmpLevelSatker(a, b) ||
          cmpNrp(a, b) ||
          cmpRole(a, b);
      } else if (sortBy === 'ROLE') {
        res =
          cmpRole(a, b) ||
          cmpStatus(a, b) ||
          cmpPangkat(a, b) ||
          cmpLevelSatker(a, b) ||
          cmpNrp(a, b) ||
          cmpNama(a, b);
      }
      return sortDesc ? res : -res;
    };

    return [...filteredJabatan].sort(comparePair);
  }, [filteredJabatan, sortBy, sortDesc]);

  const handleAddJabatanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackGroups = getJabatanGroupsForPangkat(currentUser.pangkat, currentUser.nrp);
    const effectiveJabatan =
      newJabatan.jabatan.trim() ||
      (!isNewExternalJabatan ? fallbackGroups[0]?.options[0] || 'Staf' : '');
    if (!effectiveJabatan) return;

    const composedSatker =
      newJabatan.subSatker && newJabatan.subSatker !== 'Pimpinan / Staf Utama Satker'
        ? `${newJabatan.subSatker} - ${newJabatan.satkerUtama}`
        : newJabatan.satkerUtama;

    const entry: RiwayatJabatanLeting = {
      id: `jab-${Date.now()}`,
      perwiraNrp: currentUser.nrp,
      namaPerwira: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
      pangkat: currentUser.pangkat,
      avatarUrl: getAvatarUrl(currentUser.fotoUrl),
      jabatan: effectiveJabatan,
      satker: composedSatker,
      polda: newJabatan.polda,
      fungsiPolri: newJabatan.fungsiPolri,
      tahunMulai: Number(newJabatan.tahunMulai),
      isCurrent: true,
      uraianTugas: newJabatan.uraianTugas,
      prestasiOperasional: newJabatan.prestasiOperasional,
      dasarTR: newJabatan.dasarTR || `ST/${Math.floor(1000 + Math.random() * 9000)}/X/KEP./2026`,
    };

    const updated = [entry, ...customJabatanList];
    setCustomJabatanList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_riwayat_jabatan_v4', JSON.stringify(updated));
    }

    if (getActiveAdcSessionFromStorage()) {
      recordAdcActivityToAuditLog({
        action: 'AKTIVITAS_ADC',
        details: 'Menambahkan/memperbarui riwayat jabatan: ' + effectiveJabatan + ' pada ' + composedSatker,
      });
    }

    // Sync active jabatan/satker/polda to members & users database
    if (onUpdateMemberJabatan) {
      onUpdateMemberJabatan(currentUser.nrp, effectiveJabatan, composedSatker, newJabatan.polda);
    }

    setIsAddModalOpen(false);
    setNewJabatan({
      jabatan: '',
      polda: 'MABES POLRI',
      satkerUtama: 'BARESKRIM POLRI',
      subSatker: 'Pimpinan / Staf Utama Satker',
      fungsiPolri: 'RESERSE',
      tahunMulai: 2026,
      uraianTugas: '',
      prestasiOperasional: '',
      dasarTR: '',
    });
  };

  const getFungsiBadge = (fungsi: FungsiPolri) => {
    switch (fungsi) {
      case 'RESERSE':
        return { label: 'Bareskrim / Reserse', bg: 'bg-red-50 text-red-800 border-red-200' };
      case 'INTELKAM':
        return { label: 'Intelkam', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'LANTAS':
        return { label: 'Lalu Lintas', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'BRIMOB_SABHARA':
        return { label: 'Brimob / Sabhara', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'KEWILAYAHAN':
        return { label: 'Kewilayahan (Polda/Polres)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'LEMDIKLAT':
        return { label: 'Lemdiklat / Sespim', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'LUAR_STRUKTUR':
        return { label: 'Luar Struktur / Humas', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Polri', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT RAIL (lg:col-span-4): PROFIL & STATISTIK PENUGASAN     */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* User Career Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-center">
            {/* Polri Cover Header synced with Profile */}
            <div className="h-16 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 relative overflow-hidden">
              {(myProfile.coverUrl || currentUser.coverUrl) !== 'none' && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={myProfile.coverUrl || currentUser.coverUrl || '/default-cover.jpg'}
                  alt="Sampul Polri"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>

            <div className="px-5 pb-5 relative">
              <div 
                onClick={() => onSelectMember && onSelectMember(myProfile)}
                className="w-16 h-16 rounded-full border-2 border-white shadow-md mx-auto -mt-8 overflow-hidden bg-white cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={myAvatarUrl}
                  alt={myProfile.namaLengkap || currentUser.nama}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 
                onClick={() => onSelectMember && onSelectMember(myProfile)}
                className="text-sm font-bold text-slate-900 hover:text-red-900 cursor-pointer mt-2 leading-tight flex items-center justify-center gap-1"
              >
                <span className="truncate">{(myProfile.namaLengkap || currentUser.nama).replace(/\(.*?\)/g, '').trim()}</span>
                <MetaVerifiedBadge role={currentUser.role} nrp={currentUser.nrp} size="sm" />
              </h3>
              <p className="text-xs font-semibold text-red-800 mt-0.5 truncate" title={`${myProfile.pangkat || currentUser.pangkat} • ${formatJabatanWithSatker(myProfile.jabatanTerakhir, myProfile.satuanKerja || currentUser.satker)}`}>
                {myProfile.pangkat || currentUser.pangkat} &bull; {formatJabatanWithSatker(myProfile.jabatanTerakhir, myProfile.satuanKerja || currentUser.satker)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {myProfile.polda || 'MABES POLRI'}
              </p>

              {/* Action: Tambah Jabatan Baru */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full mt-4 py-2 px-3 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Jabatan</span>
              </button>

              <button
                onClick={onOpenFormWizard}
                className="w-full mt-2 py-1.5 px-3 rounded-lg border border-red-800/40 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors"
              >
                Perbarui Data Kedinasan
              </button>
            </div>
          </div>

          {/* Statistik Tour of Duty (Dynamic from Real Data & Synced with 7 Fungsi Filter) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                <Building2 className="w-4 h-4 text-red-800 flex-shrink-0" />
                <span className="sm:hidden">TOD</span>
                <span className="hidden sm:inline">Tour of Duty</span>
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedFungsi !== 'SEMUA' && (
                  <button
                    type="button"
                    onClick={() => setSelectedFungsi('SEMUA')}
                    className="text-[10px] font-bold text-red-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
                <span
                  title="Statistik penempatan dan riwayat jabatan personel (Klik untuk memfilter)"
                  className="text-slate-400 hover:text-slate-600 cursor-help"
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                {
                  key: 'SEMUA',
                  label: 'Total Tercatat:',
                  count: jabatanList.length,
                  baseCls: 'bg-slate-50 hover:bg-slate-100 text-slate-700',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-slate-600',
                  countCls: 'text-slate-900',
                },
                {
                  key: 'RESERSE',
                  label: '🔍 Bareskrim & Reserse:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'RESERSE').length,
                  baseCls: 'bg-red-50 hover:bg-red-100/80 text-red-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-red-900 font-medium',
                  countCls: 'text-red-900',
                },
                {
                  key: 'INTELKAM',
                  label: '🛡️ Intelijen Keamanan:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'INTELKAM').length,
                  baseCls: 'bg-amber-50 hover:bg-amber-100/80 text-amber-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-amber-900 font-medium',
                  countCls: 'text-amber-900',
                },
                {
                  key: 'LANTAS',
                  label: '🚦 Korlantas / Lalu Lintas:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'LANTAS').length,
                  baseCls: 'bg-blue-50 hover:bg-blue-100/80 text-blue-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-blue-900 font-medium',
                  countCls: 'text-blue-900',
                },
                {
                  key: 'BRIMOB_SABHARA',
                  label: '⚡ Brimob & Sabhara:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'BRIMOB_SABHARA').length,
                  baseCls: 'bg-slate-100 hover:bg-slate-200/80 text-slate-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-slate-800 font-medium',
                  countCls: 'text-slate-900',
                },
                {
                  key: 'KEWILAYAHAN',
                  label: '🏛️ Kapolres & Kewilayahan:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'KEWILAYAHAN').length,
                  baseCls: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-emerald-900 font-medium',
                  countCls: 'text-emerald-900',
                },
                {
                  key: 'LEMDIKLAT',
                  label: '🎓 Lemdiklat & Sespim:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'LEMDIKLAT').length,
                  baseCls: 'bg-purple-50 hover:bg-purple-100/80 text-purple-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-purple-900 font-medium',
                  countCls: 'text-purple-900',
                },
                {
                  key: 'LUAR_STRUKTUR',
                  label: '🇮🇩 Luar Struktur & Humas:',
                  count: jabatanList.filter((j) => j.fungsiPolri === 'LUAR_STRUKTUR').length,
                  baseCls: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900',
                  activeCls: 'bg-red-800 text-white ring-2 ring-red-800/30',
                  textCls: 'text-indigo-900 font-medium',
                  countCls: 'text-indigo-900',
                },
              ].map((row) => {
                const isSelected = selectedFungsi === row.key;
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() =>
                      setSelectedFungsi(isSelected && row.key !== 'SEMUA' ? 'SEMUA' : row.key)
                    }
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected ? row.activeCls : row.baseCls
                    }`}
                  >
                    <span className={`truncate pr-2 ${isSelected ? 'text-white font-bold' : row.textCls}`}>
                      {row.label}
                    </span>
                    <span className={`font-bold flex-shrink-0 ${isSelected ? 'text-white' : row.countCls}`}>
                      {row.count} Jabatan
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
              Sumber: TR Mutasi &amp; Data Mandiri
            </div>
          </div>

          {/* Rekapitulasi Hitungan Kategori Jabatan Organisasi Polri */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="truncate">Rekap Kategori Jabatan</span>
              </h4>
              {selectedKategoriJabatan !== 'SEMUA' && (
                <button
                  type="button"
                  onClick={() => setSelectedKategoriJabatan('SEMUA')}
                  className="text-[10px] font-bold text-red-700 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5 text-xs">
              {jabatanCategoryStats.map(([cat, count]) => {
                const isSelected = selectedKategoriJabatan === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedKategoriJabatan(isSelected ? 'SEMUA' : cat)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-red-800 text-white font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate pr-2 text-[11px]">{cat}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER / MAIN FEED (lg:col-span-8): RIWAYAT JABATAN STREAM   */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Top Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col gap-3">
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 truncate">
                  <Briefcase className="w-5 h-5 text-red-800 flex-shrink-0" />
                  <span className="truncate">Riwayat Jabatan ({sortedJabatan.length})</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Penempatan aktif di Mabes Polri &amp; 38 Polda &bull; Urutan Default: Almarhum (NRP Terkecil) &rarr; Purna Tugas &rarr; PTDH &rarr; Masih Aktif
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
                {/* Sorting Button & Dropdown (Far Left before Filter Wilayah & Searchbox) */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 min-w-0 max-w-full">
                  <ArrowUpDown className="w-3.5 h-3.5 text-red-800 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1 min-w-0 flex-1 truncate"
                    title="Urutkan Daftar Riwayat Jabatan"
                  >
                    <option value="DEFAULT">Default (Almarhum [NRP Kecil] → Purna → PTDH → Aktif)</option>
                    <option value="STATUS">By Status (Almarhum → Purna → PTDH → Aktif)</option>
                    <option value="PANGKAT">By Pangkat (Jenderal Polisi → Bharada)</option>
                    <option value="LEVEL_SATKER">By Level Satker (Mabes → Polda → Polres → Polsek)</option>
                    <option value="NRP">By NRP (Angka Kecil → Besar)</option>
                    <option value="NAMA">By Nama (A → Z)</option>
                    <option value="ROLE">By Role (Superadmin → Anggota)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortDesc((prev) => !prev)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-colors whitespace-nowrap shrink-0"
                    title={sortDesc ? 'Urutan Menurun (Descending) — Klik untuk Ascending' : 'Urutan Menaik (Ascending) — Klik untuk Descending'}
                  >
                    {sortDesc ? '↓ Desc' : '↑ Asc'}
                  </button>
                </div>

                <select
                  value={selectedPolda}
                  onChange={(e) => setSelectedPolda(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-800/30"
                >
                  <option value="SEMUA">Filter Wilayah (Semua)</option>
                  {DAFTAR_38_POLDA.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, NRP, jabatan, satker..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800/30 focus:border-red-800"
                  />
                </div>
              </div>
            </div>

            {/* Filter Pills based on Police Functions */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pt-1 pb-1">
              {[
                { key: 'SEMUA', label: 'Semua' },
                { key: 'RESERSE', label: '🔍 Reserse' },
                { key: 'INTELKAM', label: '🛡️ Intelkam' },
                { key: 'LANTAS', label: '🚦 Lantas' },
                { key: 'BRIMOB_SABHARA', label: '⚡ Brimob' },
                { key: 'KEWILAYAHAN', label: '🏛️ Wilayah' },
                { key: 'LEMDIKLAT', label: '🎓 Lemdiklat' },
                { key: 'LUAR_STRUKTUR', label: '🇮🇩 Luar Struktur' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSelectedFungsi(f.key)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    selectedFungsi === f.key
                      ? 'bg-red-800 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jabatan Cards Stream */}
          <div className="space-y-3">
            {sortedJabatan.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Tidak ditemukan riwayat jabatan yang sesuai kriteria pencarian.
              </div>
            ) : (
              sortedJabatan.map((item) => {
                const badge = getFungsiBadge(item.fungsiPolri);
                const matchedMember = members.find((m) => m.nrp === item.perwiraNrp);
                const angkatanRole = resolveRoleForBadge(item.perwiraNrp);
                const jabatanAngkatanBadge =
                  angkatanRole === 'KETUA'
                    ? { label: 'Jabatan Angkatan: Ketua Angkatan', cls: 'bg-red-100 text-red-900 border-red-300' }
                    : angkatanRole === 'SEKRETARIAT'
                    ? { label: 'Jabatan Angkatan: Sekretaris Angkatan', cls: 'bg-amber-100 text-amber-900 border-amber-300' }
                    : angkatanRole === 'BENDAHARA'
                    ? { label: 'Jabatan Angkatan: Bendahara Angkatan', cls: 'bg-amber-100 text-amber-900 border-amber-300' }
                    : null;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:border-red-800/40 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Perwira Avatar */}
                        <div 
                          onClick={() => matchedMember && onSelectMember && onSelectMember(matchedMember)}
                          className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0 cursor-pointer hover:border-red-800 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.avatarUrl || '/default-avatar.png'}
                            alt={item.namaPerwira}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          {/* Perwira Name (Bold Black) + Verified Badge + Pangkat + Jabatan Angkatan */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2
                              onClick={() => matchedMember && onSelectMember && onSelectMember(matchedMember)}
                              className="text-sm sm:text-base font-bold text-slate-900 hover:text-red-800 cursor-pointer transition-colors"
                            >
                              {stripRankFromName(item.namaPerwira) || item.namaPerwira}
                            </h2>
                            <MetaVerifiedBadge nrp={item.perwiraNrp} size="xs" />
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                              {item.pangkat}
                            </span>
                            {jabatanAngkatanBadge && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${jabatanAngkatanBadge.cls}`}
                              >
                                {jabatanAngkatanBadge.label}
                              </span>
                            )}
                          </div>

                          {/* Jabatan Organisasi Polri (Red) & NRP */}
                          <div className="text-xs flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="font-semibold text-red-900">
                              {item.statusKedinasan === 'ALMARHUM' || item.statusKedinasan === 'PURNA_TUGAS' || item.statusKedinasan === 'PTDH'
                                ? `Eks ${extractCleanJabatanTitle(item.jabatan)}`
                                : extractCleanJabatanTitle(item.jabatan)}
                            </span>
                            <span className="text-slate-400 font-normal">&bull;</span>
                            <span className="text-slate-600 font-normal">NRP {item.perwiraNrp}</span>
                          </div>

                          {/* Satker & Polda */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {item.satker}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.polda}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {item.statusKedinasan === 'ALMARHUM' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            🕊️ Almarhum / Gugur
                          </span>
                        ) : item.statusKedinasan === 'PURNA_TUGAS' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            🎖️ Purna Tugas / Pensiun
                          </span>
                        ) : item.statusKedinasan === 'PTDH' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            ⚠️ PTDH
                          </span>
                        ) : item.isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Menjabat Sekarang
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {item.tahunMulai} - {item.tahunSelesai || 'Selesai'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Uraian Tugas */}
                    {item.uraianTugas && (
                      <p className="text-xs text-slate-700 mt-3 pl-0 sm:pl-[62px] leading-relaxed">
                        {item.uraianTugas}
                      </p>
                    )}

                    {/* Prestasi Operasional / Inovasi */}
                    {item.prestasiOperasional && (
                      <div className="mt-2.5 sm:ml-[62px] p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                        <Award className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Prestasi Operasional / Inovasi: </span>
                          <span>{item.prestasiOperasional}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer / TR & Quick Actions (Profil, Obrolan Cepat, WhatsApp) */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:ml-[62px] flex-wrap gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Dasar: <span className="text-slate-600 font-semibold">{item.dasarTR || '-'}</span>
                      </span>

                      <div className="flex items-center gap-2 flex-wrap">
                        {matchedMember && (
                          <button
                            onClick={() => onSelectMember && onSelectMember(matchedMember)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Lihat Profil</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {matchedMember && onOpenChat && item.statusKedinasan !== 'ALMARHUM' && (
                          <button
                            onClick={() => onOpenChat(matchedMember)}
                            className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Obrolan Cepat</span>
                          </button>
                        )}
                        {matchedMember?.noHp && item.statusKedinasan !== 'ALMARHUM' && (
                          <a
                            href={`https://wa.me/${matchedMember.noHp.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20Komandan%20${encodeURIComponent(item.namaPerwira)}%2C%20salam%20Wira%20Satya%2096`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL: TAMBAH RIWAYAT JABATAN BARU (MUTASI / PROMOSI)          */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 pt-16 pb-20 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-900 text-white">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Tambah Jabatan</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJabatanSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">
                    Jabatan Organisasi Polri <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {isOfficerRankIpdaUp(currentUser.pangkat)
                      ? `Standar ${currentUser.pangkat}`
                      : 'Staf / ADC'}
                  </span>
                </div>
                {(() => {
                  const groups = getJabatanGroupsForPangkat(currentUser.pangkat, currentUser.nrp);
                  const curVal = newJabatan.jabatan.trim();
                  const isStd = isStandardPolriJabatan(curVal, currentUser.pangkat, currentUser.nrp);
                  const selectVal = isNewExternalJabatan
                    ? EXTERNAL_JABATAN_SENTINEL
                    : isStd
                    ? curVal
                    : groups[0]?.options[0] || 'Staf';

                  return (
                    <>
                      <select
                        value={selectVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === EXTERNAL_JABATAN_SENTINEL) {
                            setIsNewExternalJabatan(true);
                            setNewJabatan({ ...newJabatan, jabatan: '', fungsiPolri: 'LUAR_STRUKTUR' });
                          } else {
                            setIsNewExternalJabatan(false);
                            setNewJabatan({ ...newJabatan, jabatan: val });
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-red-800 focus:outline-none"
                      >
                        {groups.map((grp) => (
                          <optgroup key={grp.group} label={grp.group}>
                            {grp.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        <optgroup label="Penugasan Luar Struktur (Eksternal Polri)">
                          <option value={EXTERNAL_JABATAN_SENTINEL}>
                            Penugasan Luar Struktur (Eksternal Polri) — Tulis Sendiri
                          </option>
                        </optgroup>
                      </select>

                      {isNewExternalJabatan && (
                        <input
                          type="text"
                          required
                          placeholder="Ketik nama jabatan eksternal (misal BNN, KPK, BNPT, Kementerian)..."
                          value={newJabatan.jabatan}
                          onChange={(e) => setNewJabatan({ ...newJabatan, jabatan: e.target.value })}
                          className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                        />
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. Wilayah Induk (Mabes / 38 Polda) *</label>
                  <select
                    value={newJabatan.polda}
                    onChange={(e) => {
                      const w = e.target.value;
                      const satkers = getSatkerUtamaByWilayah(w);
                      const firstS = satkers[0] || w;
                      const subs = getSubSatkerOptionsBySatker(w, firstS);
                      setNewJabatan({
                        ...newJabatan,
                        polda: w,
                        satkerUtama: firstS,
                        subSatker: subs[0] || 'Pimpinan / Staf Utama Satker',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  >
                    {DAFTAR_38_POLDA.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Master Satker Utama (Satker / Polres) *</label>
                  <select
                    value={newJabatan.satkerUtama}
                    onChange={(e) => {
                      const s = e.target.value;
                      const subs = getSubSatkerOptionsBySatker(newJabatan.polda, s);
                      setNewJabatan({
                        ...newJabatan,
                        satkerUtama: s,
                        subSatker: subs[0] || 'Pimpinan / Staf Utama Satker',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  >
                    {getSatkerUtamaByWilayah(newJabatan.polda).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">3. Sub-Satker / Direktorat / Bagian / ADC</label>
                  <select
                    value={newJabatan.subSatker}
                    onChange={(e) => setNewJabatan({ ...newJabatan, subSatker: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  >
                    {getSubSatkerOptionsBySatker(newJabatan.polda, newJabatan.satkerUtama).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fungsi Kepolisian</label>
                  <select
                    value={newJabatan.fungsiPolri}
                    onChange={(e) => setNewJabatan({ ...newJabatan, fungsiPolri: e.target.value as FungsiPolri })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  >
                    <option value="RESERSE">Reserse / Bareskrim</option>
                    <option value="INTELKAM">Intelijen Keamanan</option>
                    <option value="LANTAS">Lalu Lintas</option>
                    <option value="BRIMOB_SABHARA">Brimob & Sabhara</option>
                    <option value="KEWILAYAHAN">Kewilayahan (Polda/Polres)</option>
                    <option value="LEMDIKLAT">Lemdiklat / Sespim</option>
                    <option value="LUAR_STRUKTUR">Luar Struktur / Humas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Mulai Menjabat</label>
                  <input
                    type="number"
                    value={newJabatan.tahunMulai}
                    onChange={(e) => setNewJabatan({ ...newJabatan, tahunMulai: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dasar Surat Telegram Kapolri (TR)</label>
                <input
                  type="text"
                  placeholder="Misal: ST/1422/VI/KEP./2024"
                  value={newJabatan.dasarTR}
                  onChange={(e) => setNewJabatan({ ...newJabatan, dasarTR: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian Tugas Pokok</label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan tanggung jawab operasional dan pembinaan..."
                  value={newJabatan.uraianTugas}
                  onChange={(e) => setNewJabatan({ ...newJabatan, uraianTugas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prestasi Operasional / Kasus Menonjol</label>
                <textarea
                  rows={2}
                  placeholder="Pengungkapan kasus menonjol, inovasi pelayanan, atau penghargaan pimpinan..."
                  value={newJabatan.prestasiOperasional}
                  onChange={(e) => setNewJabatan({ ...newJabatan, prestasiOperasional: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold shadow-md"
                >
                  Simpan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
