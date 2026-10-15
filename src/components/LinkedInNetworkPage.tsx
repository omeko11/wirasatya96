'use client';

import React, { useState } from 'react';
import { AuthUser, AnggotaWiraSatya } from '@/types';
import { 
  Users, 
  Shield, 
  Calendar, 
  Phone, 
  Building,
  HeartHandshake
} from 'lucide-react';

interface LinkedInNetworkPageProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  onSelectMember: (member: AnggotaWiraSatya) => void;
}

interface InvitationItem {
  id: string;
  senderName: string;
  senderPangkat: string;
  senderJabatan: string;
  senderAvatar: string;
  type: string;
  timeAgo: string;
}

export const LinkedInNetworkPage: React.FC<LinkedInNetworkPageProps> = ({
  currentUser,
  members,
  onSelectMember,
}) => {
  const [activeTab, setActiveTab] = useState<'kembangkan' | 'update'>('kembangkan');
  const [searchPolda, setSearchPolda] = useState('SEMUA');
  const [invitations, setInvitations] = useState<InvitationItem[]>([
    {
      id: 'inv-1',
      senderName: 'Irjen Pol. Achmad Kartiko, S.I.K., M.H.',
      senderPangkat: 'Irjen Pol',
      senderJabatan: 'Ketua Batalyon Wira Satya 96',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
      type: 'Mengundang Anda ke Tim Koordinasi Bakti Sosial & Solidaritas Leting',
      timeAgo: '1 hari yang lalu',
    },
    {
      id: 'inv-2',
      senderName: 'Kombes Pol. Hadi Wicaksono, S.I.K., M.H.',
      senderPangkat: 'Kombes Pol',
      senderJabatan: 'Kesekretariatan Batalyon 96',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      type: 'Mengundang verifikasi kelengkapan berkas SIPP dan data keluarga',
      timeAgo: '3 hari yang lalu',
    },
    {
      id: 'inv-3',
      senderName: 'Kombes Pol. Bambang Prasetyo, S.H.',
      senderPangkat: 'Kombes Pol',
      senderJabatan: 'Bendahara Batalyon 96',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      type: 'Mengundang ke grup koordinasi iuran tahunan kas yayasan 1996',
      timeAgo: '5 hari yang lalu',
    }
  ]);

  const handleAcceptInvite = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    alert('Undangan koordinasi leting telah diterima!');
  };

  const handleIgnoreInvite = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredMembers = members.filter((m) => {
    if (searchPolda === 'SEMUA') return true;
    return m.polda.toUpperCase() === searchPolda.toUpperCase();
  });

  return (
    <div className="max-w-7xl mx-auto py-2 font-sans text-slate-900 pb-20">
      
      {/* 2-Column LinkedIn Network Layout (1:1 with user screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT RAIL (lg:col-span-4): MANAGE MY NETWORK                 */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Kelola Jaringan Leting
              </h3>
              <span className="text-[10px] font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded">
                {currentUser.role}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <button 
                onClick={() => setSearchPolda('SEMUA')}
                className="w-full py-2 px-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-red-800" />
                  <span>Koneksi Rekan Leting</span>
                </div>
                <span className="font-bold text-slate-900">{members.length}</span>
              </button>

              <button 
                onClick={() => setSearchPolda('POLDA METRO JAYA')}
                className="w-full py-2 px-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Polda Metro Jaya</span>
                </div>
                <span className="font-bold text-slate-900">
                  {members.filter(m => m.polda.includes('METRO')).length || 18}
                </span>
              </button>

              <button 
                onClick={() => setSearchPolda('MABES POLRI')}
                className="w-full py-2 px-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Mabes Polri</span>
                </div>
                <span className="font-bold text-slate-900">
                  {members.filter(m => m.polda.includes('MABES')).length || 32}
                </span>
              </button>

              <div className="w-full py-2 px-2.5 flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Agenda Reuni & Temu Letting</span>
                </div>
                <span className="font-bold text-slate-900">3 Acara</span>
              </div>

              <div className="w-full py-2 px-2.5 flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-4 h-4 text-red-500" />
                  <span>Yayasan Wira Satya 96</span>
                </div>
                <span className="font-bold text-slate-900">Aktif</span>
              </div>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-polri-navy text-white rounded-xl shadow-sm text-center space-y-1">
            <span className="text-[11px] font-black text-amber-300 tracking-wider">
              BATALYON WIRA SATYA AKPOL 1996
            </span>
            <p className="text-xs font-medium text-slate-200">
              Guyub, Peduli, dan Mengabdi Untuk Negeri #SelaluBahagia
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* CENTER / MAIN CONTENT (lg:col-span-8): INVITATIONS & PEERS   */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Sub-tabs: Kembangkan vs Kejar Ketinggalan (Exact match to screenshot 3) */}
          <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('kembangkan')}
              className={`py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'kembangkan'
                  ? 'border-[#01754f] text-[#01754f]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Kembangkan Silaturahmi
            </button>
            <button
              onClick={() => setActiveTab('update')}
              className={`py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'update'
                  ? 'border-[#01754f] text-[#01754f]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Update Penugasan Leting
            </button>
          </div>

          {/* Card 1: Undangan & Koordinasi Leting (Exact match to screenshot 3) */}
          {invitations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Undangan & Koordinasi Angkatan ({invitations.length})
                </h3>
                <span className="text-xs text-red-900 font-semibold hover:underline cursor-pointer">
                  Tampilkan semua
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={inv.senderAvatar}
                        alt={inv.senderName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {inv.senderName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{inv.senderJabatan}</p>
                        <p className="text-xs text-slate-700 mt-1 leading-snug">{inv.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleIgnoreInvite(inv.id)}
                        className="px-4 py-1.5 rounded-full border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors"
                      >
                        Abaikan
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(inv.id)}
                        className="px-4 py-1.5 rounded-full border border-red-800 bg-white hover:bg-red-50 text-xs font-bold text-red-900 transition-colors"
                      >
                        Terima
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 2: Rekan Leting yang Mungkin Ingin Anda Hubungi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rekan Leting Wira Satya 96 ({filteredMembers.length} Perwira)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terhubung dan pererat silaturahmi dengan rekan satu angkatan di seluruh Indonesia.
                </p>
              </div>

              {searchPolda !== 'SEMUA' && (
                <button
                  onClick={() => setSearchPolda('SEMUA')}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Grid of Connection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col text-center"
                >
                  {/* Top Cover */}
                  <div className="h-14 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 relative">
                    <span className="absolute top-1.5 right-2 px-2 py-0.2 rounded-full bg-black/40 text-[9px] font-bold text-amber-300">
                      {member.pangkat}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-3 pt-0 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar */}
                      <div 
                        onClick={() => onSelectMember(member)}
                        className="w-14 h-14 rounded-full border-2 border-white shadow mx-auto -mt-7 overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'}
                          alt={member.namaLengkap}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h4 
                        onClick={() => onSelectMember(member)}
                        className="text-xs font-bold text-slate-900 hover:text-red-900 cursor-pointer mt-2 line-clamp-1"
                        title={member.namaLengkap}
                      >
                        {member.namaLengkap.split(',')[0]}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {member.jabatanTerakhir}
                      </p>
                      <p className="text-[10px] font-semibold text-red-900 mt-0.5">
                        {member.polda}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-400">
                        <span>Alumni Akpol 1996 &bull; Purna {member.tahunPurnaTugas}</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${member.noHp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1 px-2 rounded-full border border-red-800 text-red-900 hover:bg-red-50 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Kirim WA</span>
                      </a>
                      <button
                        onClick={() => onSelectMember(member)}
                        className="py-1 px-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        Profil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
