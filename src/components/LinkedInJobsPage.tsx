'use client';

import React, { useState, useMemo } from 'react';
import { AuthUser, AnggotaWiraSatya, RiwayatJabatanLeting, FungsiPolri } from '@/types';
import { INITIAL_RIWAYAT_JABATAN } from '@/data/mockJabatan';
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
  X
} from 'lucide-react';

interface LinkedInJobsPageProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  onOpenFormWizard?: () => void;
  onSelectMember?: (member: AnggotaWiraSatya) => void;
}

export const LinkedInJobsPage: React.FC<LinkedInJobsPageProps> = ({
  currentUser,
  members,
  onOpenFormWizard,
  onSelectMember,
}) => {
  const [selectedFungsi, setSelectedFungsi] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [jabatanList, setJabatanList] = useState<RiwayatJabatanLeting[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wirasatya96_riwayat_jabatan');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_RIWAYAT_JABATAN;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newJabatan, setNewJabatan] = useState({
    jabatan: '',
    satker: '',
    polda: 'POLDA METRO JAYA',
    fungsiPolri: 'RESERSE' as FungsiPolri,
    tahunMulai: 2024,
    uraianTugas: '',
    prestasiOperasional: '',
    dasarTR: '',
  });

  const filteredJabatan = useMemo(() => {
    return jabatanList.filter((item) => {
      const matchesSearch = 
        item.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.namaPerwira.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.satker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.polda.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.dasarTR && item.dasarTR.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFungsi = selectedFungsi === 'SEMUA' || item.fungsiPolri === selectedFungsi;
      return matchesSearch && matchesFungsi;
    });
  }, [jabatanList, searchQuery, selectedFungsi]);

  const handleAddJabatanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJabatan.jabatan || !newJabatan.satker) return;

    const entry: RiwayatJabatanLeting = {
      id: `jab-${Date.now()}`,
      perwiraNrp: currentUser.nrp,
      namaPerwira: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
      pangkat: currentUser.pangkat,
      avatarUrl: currentUser.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      jabatan: newJabatan.jabatan,
      satker: newJabatan.satker,
      polda: newJabatan.polda,
      fungsiPolri: newJabatan.fungsiPolri,
      tahunMulai: Number(newJabatan.tahunMulai),
      isCurrent: true,
      uraianTugas: newJabatan.uraianTugas,
      prestasiOperasional: newJabatan.prestasiOperasional,
      dasarTR: newJabatan.dasarTR || `ST/${Math.floor(1000 + Math.random() * 9000)}/X/KEP./2024`,
    };

    const updated = [entry, ...jabatanList];
    setJabatanList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_riwayat_jabatan', JSON.stringify(updated));
    }
    setIsAddModalOpen(false);
    setNewJabatan({
      jabatan: '',
      satker: '',
      polda: 'POLDA METRO JAYA',
      fungsiPolri: 'RESERSE',
      tahunMulai: 2024,
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
            {/* Bareskrim Red & Gold Header */}
            <div className="h-16 bg-gradient-to-r from-red-950 via-red-900 to-amber-900 relative" />

            <div className="px-5 pb-5 relative">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow-md mx-auto -mt-8 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2 leading-tight">
                {currentUser.nama.replace(/\(.*?\)/g, '').trim()}
              </h3>
              <p className="text-xs font-semibold text-red-800 mt-0.5">
                {currentUser.pangkat} &bull; {currentUser.satker || 'Bareskrim Polri'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Alumni Batalyon Wira Satya Akpol 1996
              </p>

              {/* Action: Tambah Jabatan Baru */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full mt-4 py-2 px-3 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Catat Riwayat Jabatan Baru</span>
              </button>

              <button
                onClick={onOpenFormWizard}
                className="w-full mt-2 py-1.5 px-3 rounded-lg border border-red-800/40 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors"
              >
                Perbarui Data Kedinasan
              </button>
            </div>
          </div>

          {/* Statistik Penugasan Letting 96 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-red-800" />
              Statistik Tour of Duty Letting 96
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">Total Perwira Aktif:</span>
                <span className="font-bold text-slate-900">286 Perwira</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                <span className="text-red-900 font-medium">Bareskrim & Reserse:</span>
                <span className="font-bold text-red-900">84 Perwira</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                <span className="text-amber-900 font-medium">Intelijen Keamanan:</span>
                <span className="font-bold text-amber-900">38 Perwira</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                <span className="text-blue-900 font-medium">Korlantas / Lalu Lintas:</span>
                <span className="font-bold text-blue-900">46 Perwira</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50">
                <span className="text-emerald-900 font-medium">Kapolres & Pimpinan Wilayah:</span>
                <span className="font-bold text-emerald-900">72 Perwira</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
                <span className="text-purple-900 font-medium">Lemdiklat & Sespim:</span>
                <span className="font-bold text-purple-900">46 Perwira</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Sumber: Surat Telegram Kapolri (TR Mutasi Pati/Pamen Polri) & Data Mandiri Letting 96.
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER / MAIN FEED (lg:col-span-8): RIWAYAT JABATAN STREAM   */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Top Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-800" />
                  Riwayat Jabatan & Penugasan Alumni Wira Satya 96
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arsip tour of duty, jabatan strategis kewilayahan, dan promosi 286 perwira leting Akpol 1996
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari jabatan, satker, nama, TR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800/30 focus:border-red-800"
                />
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
            {filteredJabatan.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Tidak ditemukan riwayat jabatan yang sesuai kriteria pencarian.
              </div>
            ) : (
              filteredJabatan.map((item) => {
                const badge = getFungsiBadge(item.fungsiPolri);
                const matchedMember = members.find((m) => m.nrp === item.perwiraNrp);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:border-red-800/40 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        {/* Perwira Avatar */}
                        <div 
                          onClick={() => matchedMember && onSelectMember && onSelectMember(matchedMember)}
                          className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0 cursor-pointer hover:border-red-800 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}
                            alt={item.namaPerwira}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          {/* Jabatan Title */}
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 hover:text-red-800 transition-colors">
                            {item.jabatan}
                          </h2>

                          {/* Perwira Name & Rank */}
                          <div 
                            onClick={() => matchedMember && onSelectMember && onSelectMember(matchedMember)}
                            className="text-xs font-semibold text-red-900 hover:underline cursor-pointer flex items-center gap-1.5 mt-0.5"
                          >
                            <span>{item.namaPerwira}</span>
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
                        {item.isCurrent ? (
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

                    {/* Footer / TR & Actions */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:ml-[62px] flex-wrap gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Dasar: <span className="text-slate-600 font-semibold">{item.dasarTR || '-'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {matchedMember && (
                          <button
                            onClick={() => onSelectMember && onSelectMember(matchedMember)}
                            className="px-3 py-1.5 rounded-lg border border-red-800/40 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Lihat Profil Perwira</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {matchedMember?.noHp && (
                          <a
                            href={`https://wa.me/${matchedMember.noHp.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20Komandan%20${encodeURIComponent(item.namaPerwira)}%2C%20salam%20Wira%20Satya%2096`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Hubungi Rekan</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-900 text-white">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Catat Riwayat Jabatan / Mutasi Baru</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJabatanSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Jabatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dirreskrimum Polda Metro Jaya / Kapolrestabes..."
                  value={newJabatan.jabatan}
                  onChange={(e) => setNewJabatan({ ...newJabatan, jabatan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan Kerja (Satker) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Ditreskrimum / Bareskrim Polri"
                    value={newJabatan.satker}
                    onChange={(e) => setNewJabatan({ ...newJabatan, satker: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Polda / Mabes *</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: POLDA METRO JAYA / MABES POLRI"
                    value={newJabatan.polda}
                    onChange={(e) => setNewJabatan({ ...newJabatan, polda: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                  />
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
                  Simpan Riwayat Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
