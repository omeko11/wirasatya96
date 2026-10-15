'use client';

import React, { useState, useMemo } from 'react';
import { AnggotaWiraSatya, AuthUser, DAFTAR_PANGKAT_POLRI } from '@/types';
import { DAFTAR_38_POLDA } from '@/data/polriStructure';
import { LinkedInProfileView } from './LinkedInProfileView';
import { 
  Search, 
  Phone, 
  Shield, 
  Heart, 
  Filter,
  UserPlus,
  Image as ImageIcon,
  Sparkles,
  Wallet
} from 'lucide-react';

interface BukuSakuProps {
  members: AnggotaWiraSatya[];
  onAddNew: () => void;
  currentUser: AuthUser;
  onEditMember?: (member: AnggotaWiraSatya) => void;
  externalSearch?: string;
}

export const BukuSaku: React.FC<BukuSakuProps> = ({ 
  members, 
  onAddNew, 
  currentUser,
  onEditMember,
  externalSearch = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolda, setSelectedPolda] = useState<string>('SEMUA');
  const [selectedPangkat, setSelectedPangkat] = useState<string>('SEMUA');
  const [selectedMember, setSelectedMember] = useState<AnggotaWiraSatya | null>(null);

  // Sync external search from navbar
  const activeSearch = externalSearch || searchTerm;

  // Extract unique Poldas for filter
  const poldaList = useMemo(() => {
    const existingPoldas = Array.from(new Set(members.map((m) => m.polda))).filter(Boolean);
    const remainingPoldas = DAFTAR_38_POLDA.filter(
      (p) => !existingPoldas.some((ep) => ep.toUpperCase() === p.toUpperCase())
    );
    return ['SEMUA', ...existingPoldas, ...remainingPoldas];
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const search = activeSearch.toLowerCase();
      const matchSearch =
        m.namaLengkap.toLowerCase().includes(search) ||
        m.nrp.includes(activeSearch) ||
        m.jabatanTerakhir.toLowerCase().includes(search) ||
        m.satuanKerja.toLowerCase().includes(search) ||
        (m.subSatker && m.subSatker.toLowerCase().includes(search)) ||
        (m.satkerMabes && m.satkerMabes.toLowerCase().includes(search)) ||
        (m.namaPolres && m.namaPolres.toLowerCase().includes(search)) ||
        (m.namaPolsek && m.namaPolsek.toLowerCase().includes(search));

      const matchPolda = 
        selectedPolda === 'SEMUA' || 
        m.polda.toUpperCase() === selectedPolda.toUpperCase() ||
        (selectedPolda.toUpperCase().includes('MABES') && m.polda.toUpperCase().includes('MABES'));

      const matchPangkat = selectedPangkat === 'SEMUA' || m.pangkat === selectedPangkat;

      return matchSearch && matchPolda && matchPangkat;
    });
  }, [members, activeSearch, selectedPolda, selectedPangkat]);

  const formatWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Direktori%20Alumni%20Akpol%201996%20Wira%20Satya`;
  };

  // Find members needing health attention (from Modul 4)
  const healthAttentionMembers = useMemo(() => {
    return members.filter((m) => m.adaPenyakitKronis === 'ADA' || (m.daftarPenyakit && m.daftarPenyakit.length > 0));
  }, [members]);

  // Current logged in member profile if exists
  const currentMemberObj = members.find((m) => m.nrp === currentUser.nrp) || members[0];

  // IF A MEMBER IS SELECTED, SHOW LINKEDIN FULL PROFILE VIEW
  if (selectedMember) {
    return (
      <LinkedInProfileView
        member={selectedMember}
        currentUser={currentUser}
        onClose={() => setSelectedMember(null)}
        onEditProfile={() => onEditMember && onEditMember(selectedMember)}
        allMembers={members}
        onSelectMember={(m) => setSelectedMember(m)}
      />
    );
  }

  return (
    <div className="font-sans text-slate-900 pb-20">
      
      {/* ============================================================== */}
      {/* 3-COLUMN LINKEDIN FEED LAYOUT (MATCHING USER SCREENSHOTS)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* 1. LEFT RAIL (lg:col-span-3): PROFILE SNAPSHOT & FILTERS    */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* User Mini Profile Card (Exact LinkedIn Left Rail) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-center">
            
            {/* Header cover background */}
            <div className="h-16 bg-gradient-to-r from-polri-navy via-slate-800 to-polri-goldDark relative" />

            {/* Avatar overlapping */}
            <div className="px-4 pb-4 relative">
              <div 
                onClick={() => setSelectedMember(currentMemberObj)}
                className="w-16 h-16 rounded-full border-2 border-white shadow-md mx-auto -mt-8 overflow-hidden bg-slate-100 cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentMemberObj?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <h3 
                onClick={() => setSelectedMember(currentMemberObj)}
                className="text-sm font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer mt-2 leading-tight"
              >
                {currentUser.nama.split('(')[0].trim()}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser.pangkat} &bull; Alumni Akpol 1996
              </p>

              {/* Metrics */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Rekan Letting:</span>
                  <span className="font-bold text-[#0a66c2]">286 Perwira</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Status Iuran 2026:</span>
                  <span className="font-bold text-emerald-600">Lunas</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Hak Akses:</span>
                  <span className="font-bold text-slate-800">{currentUser.role}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedMember(currentMemberObj)}
                className="w-full mt-3 py-1.5 px-3 rounded-lg border border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50 font-bold text-xs transition-colors"
              >
                Lihat Profil Saya
              </button>
            </div>
          </div>

          {/* Quick Filter Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter Sebaran Leting
              </span>
              {(selectedPolda !== 'SEMUA' || selectedPangkat !== 'SEMUA' || activeSearch) && (
                <button
                  onClick={() => {
                    setSelectedPolda('SEMUA');
                    setSelectedPangkat('SEMUA');
                    setSearchTerm('');
                  }}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Filter 1: Polda */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Wilayah / Polda:
              </label>
              <select
                value={selectedPolda}
                onChange={(e) => setSelectedPolda(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              >
                {poldaList.map((p) => (
                  <option key={p} value={p}>
                    {p === 'SEMUA' ? '🌐 Semua 38 Polda & Mabes' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Pangkat */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Hierarki Pangkat:
              </label>
              <select
                value={selectedPangkat}
                onChange={(e) => setSelectedPangkat(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              >
                <option value="SEMUA">⭐ Semua Pangkat Perwira</option>
                {DAFTAR_PANGKAT_POLRI.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-300/40 text-center">
            <span className="text-[11px] font-extrabold text-amber-900 tracking-wider">
              #SELALUBAHAGIA
            </span>
            <p className="text-[10px] text-amber-800 mt-0.5">
              Guyub, Peduli, & Mengabdi Sejak 1996
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. CENTER FEED (lg:col-span-6): DIRECTORY STREAM & CARDS    */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Post/Update Box (matching LinkedIn's "Mulai posting" Box) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentMemberObj?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                alt={currentUser.nama}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
              <button
                onClick={onAddNew}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 rounded-full text-left text-xs text-slate-500 font-medium transition-colors border border-slate-200"
              >
                Bagikan mutasi, penempatan baru, atau kabar rekan leting...
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600 px-2">
              <button 
                onClick={onAddNew}
                className="flex items-center gap-2 hover:text-[#0a66c2] transition-colors p-1"
              >
                <UserPlus className="w-4 h-4 text-[#0a66c2]" />
                <span>Pendataan Baru</span>
              </button>
              <button 
                onClick={() => alert('Fitur unggah dokumentasi angkatan aktif.')}
                className="flex items-center gap-2 hover:text-emerald-600 transition-colors p-1"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Dokumentasi</span>
              </button>
              <button 
                onClick={() => alert('Solidaritas leting: Hubungi Bendahara / Kesekretariatan untuk penyaluran bantuan sosial.')}
                className="flex items-center gap-2 hover:text-amber-600 transition-colors p-1"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Solidaritas Leting</span>
              </button>
            </div>
          </div>

          {/* Search Box & Results Counter */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama perwira, jabatan, atau satuan kerja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              <b>{filteredMembers.length}</b> perwira
            </span>
          </div>

          {/* Member Feed Cards (LinkedIn-style Connection Cards) */}
          <div className="space-y-3.5">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Mini card cover */}
                <div className="h-16 bg-gradient-to-r from-slate-900 via-polri-navy to-slate-800 relative">
                  <span className="absolute top-2 right-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur text-[10px] font-bold text-amber-300 border border-white/20">
                    {member.pangkat}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-5 pb-5 pt-0 relative">
                  
                  <div className="flex items-start justify-between -mt-8 mb-2">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
                        alt={member.namaLengkap}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow bg-slate-100 cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                      />
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center absolute bottom-0 right-0 border border-white text-[9px] font-bold">
                        ✓
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 mt-2">
                      {member.polda}
                    </span>
                  </div>

                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 
                      onClick={() => setSelectedMember(member)}
                      className="text-base font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer"
                    >
                      {member.namaLengkap}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {member.jabatanTerakhir}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {member.satuanKerja} {member.subSatker ? `(${member.subSatker})` : ''} &bull; NRP {member.nrp}
                    </p>
                  </div>

                  {/* Mutual Leting Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Alumni Batalyon Wira Satya 1996 &bull; Purna {member.tahunPurnaTugas}</span>
                  </div>

                  {/* Action Buttons (matching LinkedIn Connect / Message buttons) */}
                  <div className="mt-3.5 flex items-center gap-2 pt-1">
                    <a
                      href={formatWaUrl(member.noHp)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Kirim Pesan WA</span>
                    </a>

                    <button
                      onClick={() => setSelectedMember(member)}
                      className="py-1.5 px-4 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Lihat Profil Lengkap
                    </button>

                    {member.kontakAdc && (
                      <a
                        href={formatWaUrl(member.kontakAdc)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold hidden sm:inline-flex items-center gap-1"
                        title={`ADC: ${member.namaAdc || 'Ajudan'}`}
                      >
                        <span>ADC</span>
                      </a>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ============================================================ */}
        {/* 3. RIGHT RAIL (lg:col-span-3): ATENSI KESEHATAN & TREASURY   */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Widget 1: Atensi Rekan Sakit & Solidaritas Leting (Modul 4) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                Atensi Kesehatan Leting
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                {healthAttentionMembers.length} Perwira
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Rekan satu leting yang membutuhkan dukungan moril & perhatian sosial:
            </p>

            <div className="space-y-3">
              {healthAttentionMembers.map((m) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span 
                      onClick={() => setSelectedMember(m)}
                      className="text-xs font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer truncate max-w-[140px]"
                    >
                      {m.namaLengkap.split(',')[0]}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                      {m.kondisiKesehatan}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 line-clamp-1">
                    Diagnosa: <b>{(m.daftarPenyakit || []).join(', ') || 'Dalam Pemulihan'}</b>
                  </div>
                  <a
                    href={formatWaUrl(m.noHp)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 pt-1"
                  >
                    <Phone className="w-3 h-3" /> Kirim Doa & Semangat
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Status Kas Yayasan & Iuran */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Kas Yayasan Leting 1996
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">2026</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Saldo Kas Utama:</span>
                <span className="font-bold text-slate-900">Rp 185.000.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Alokasi Rekan Sakit:</span>
                <span className="font-bold text-emerald-600">Rp 45.000.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Iuran Wajib / Bulan:</span>
                <span className="font-bold text-slate-800">Rp 250.000 / Perwira</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block text-center">
                Dikelola transparan oleh Bendahara Batalyon
              </span>
            </div>
          </div>

          {/* Widget 3: Info Footer LinkedIn Style */}
          <div className="text-[11px] text-slate-400 text-center space-y-1 p-2">
            <p className="font-bold text-slate-600">BATALYON WIRA SATYA 1996</p>
            <p>Akademi Kepolisian Republik Indonesia</p>
            <p className="text-[10px]">Portal Internal Alumni &copy; 2026</p>
          </div>

        </div>

      </div>

    </div>
  );
};
