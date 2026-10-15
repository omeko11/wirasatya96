'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Wallet, 
  BarChart3, 
  Search, 
  LogOut, 
  ChevronDown,
  KeyRound,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AuthUser, UserRole } from '@/types';

export type AppTab = 
  | 'direktori' 
  | 'jaringan' 
  | 'purnaTugas' 
  | 'pesan' 
  | 'notifikasi' 
  | 'form' 
  | 'bendahara' 
  | 'dashboard';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  totalMembers: number;
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onSearchChange?: (query: string) => void;
  onViewMyProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalMembers,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSearchChange,
  onViewMyProfile,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isLeadership = currentUser.role !== 'ANGGOTA';

  // Sanitize name for compact single-line display
  const cleanDisplayName = currentUser.nama
    .replace(/\(.*?\)/g, '')
    .split(',')[0]
    .trim();

  const roleBadgeColors: Record<UserRole, string> = {
    SUPERADMIN: 'bg-red-100 text-red-800 border-red-300',
    KETUA: 'bg-purple-100 text-purple-800 border-purple-300',
    SEKRETARIAT: 'bg-blue-100 text-blue-800 border-blue-300',
    BENDAHARA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ANGGOTA: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* LinkedIn-Style Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo + LinkedIn Search Box */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
              <div 
                onClick={() => setActiveTab('direktori')}
                className="w-9 h-9 rounded-md bg-[#0a66c2] hover:bg-[#004182] flex items-center justify-center text-white font-black text-sm shadow-sm cursor-pointer transition-colors flex-shrink-0"
                title="Portal Alumni Batalyon Wira Satya 1996"
              >
                WS
              </div>

              {/* LinkedIn Search Bar */}
              <div className="relative flex-1 hidden sm:block max-w-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari leting, polda, satker..."
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#edf3f8] border-none rounded-md text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0a66c2] transition-all"
                />
              </div>

              {/* Mobile text title */}
              <div className="sm:hidden">
                <span className="font-black text-xs text-[#0a66c2] block leading-tight">WIRA SATYA 96</span>
                <span className="text-[9px] text-slate-500 font-semibold">Alumni Akpol 1996</span>
              </div>
            </div>

            {/* Right: LinkedIn Stacked Nav Items (Matching All Screenshots) */}
            <nav className="flex items-center gap-0.5 sm:gap-2 lg:gap-4 flex-shrink-0">
              
              {/* 1. Halaman Utama */}
              <button
                onClick={() => setActiveTab('direktori')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'direktori'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Beranda & Feed Silaturahmi"
              >
                <div className="relative">
                  <Home className="w-5 h-5" />
                  <span className="w-2 h-2 rounded-full bg-[#0a66c2] absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Halaman Utama</span>
              </button>

              {/* 2. Jaringan (My Network - Screenshot 3) */}
              <button
                onClick={() => setActiveTab('jaringan')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'jaringan'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Jaringan Leting 96"
              >
                <div className="relative">
                  <Users className="w-5 h-5" />
                  <span className="px-1 py-0.2 rounded-full bg-blue-100 text-[#0a66c2] text-[8px] font-bold absolute -top-1 -right-2">
                    {totalMembers}
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Jaringan</span>
              </button>

              {/* 3. Pekerjaan / Purna Tugas (Jobs - Screenshot 2) */}
              <button
                onClick={() => setActiveTab('purnaTugas')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'purnaTugas'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Peluang & Sinergi Purna Tugas"
              >
                <Briefcase className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Pekerjaan</span>
              </button>

              {/* 4. Pesan (Messaging - Screenshot 1) */}
              <button
                onClick={() => setActiveTab('pesan')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'pesan'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Pesan & Obrolan Leting"
              >
                <div className="relative">
                  <MessageSquare className="w-5 h-5" />
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-2">
                    2
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Pesan</span>
              </button>

              {/* 5. Notifikasi (Notifications - Screenshot 4) */}
              <button
                onClick={() => setActiveTab('notifikasi')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'notifikasi'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Notifikasi & Atensi Leting"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-2">
                    4
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Notifikasi</span>
              </button>

              {/* Kebendaharaan (Always Accessible for Transparency) */}
              <button
                onClick={() => setActiveTab('bendahara')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'bendahara'
                    ? 'border-[#0a66c2] text-[#0a66c2] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Kas Yayasan & Iuran"
              >
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Kebendaharaan</span>
              </button>

              {/* Anev Leting (Leadership only) */}
              {isLeadership && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`hidden lg:flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center transition-all border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'border-slate-900 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                  title="Dashboard Eksekutif Batalyon"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 whitespace-nowrap">Anev Leting</span>
                </button>
              )}

              {/* Vertical Divider */}
              <div className="h-7 w-px bg-slate-200 hidden sm:block mx-1" />

              {/* 6. Saya (Exact LinkedIn Profile Dropdown - Screenshot 5) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex flex-col sm:flex-row items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                  title="Menu Akun Saya"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face'}
                    alt={cleanDisplayName}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-300 flex-shrink-0"
                  />
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] font-semibold text-slate-700 hidden sm:block whitespace-nowrap">
                      Saya
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </div>
                </button>

                {/* LinkedIn Profile Popover Menu (Matching User Screenshot 5) */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 text-xs text-slate-700 animate-fadeIn">
                    
                    {/* Top Mini Card */}
                    <div className="px-4 pb-3 border-b border-slate-100 flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                        alt={cleanDisplayName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {cleanDisplayName}
                          </h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.pangkat}</p>
                        <span className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border mt-1 ${roleBadgeColors[currentUser.role]}`}>
                          {currentUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border-b border-slate-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onViewMyProfile) onViewMyProfile();
                          else setActiveTab('direktori');
                        }}
                        className="w-full py-1.5 px-3 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50 font-bold text-xs transition-colors text-center"
                      >
                        Lihat profil
                      </button>
                    </div>

                    {/* Section: Akun */}
                    <div className="py-2 border-b border-slate-100">
                      <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Akun
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ganti Role Pengguna</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Demo</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Keamanan & FIDO2 Passkey</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('form');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#0a66c2]" />
                        <span>Formulir Pendataan SIPP</span>
                      </button>
                    </div>

                    {/* Section: Kelola */}
                    <div className="py-2 border-b border-slate-100">
                      <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Kelola
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('bendahara');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Transparansi Kas & Iuran Leting</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('jaringan');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>Koneksi Alumni 1996 ({totalMembers})</span>
                      </button>
                    </div>

                    {/* Section: Logout */}
                    {onLogout && (
                      <div className="pt-2 px-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout (Keluar)</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>

            </nav>

          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar (LinkedIn Style for Phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 text-[9px]">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'direktori' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Utama</span>
          </button>

          <button
            onClick={() => setActiveTab('jaringan')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'jaringan' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Jaringan</span>
          </button>

          <button
            onClick={() => setActiveTab('purnaTugas')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'purnaTugas' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>Karir</span>
          </button>

          <button
            onClick={() => setActiveTab('pesan')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'pesan' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span>Pesan</span>
          </button>

          <button
            onClick={() => setActiveTab('notifikasi')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'notifikasi' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <Bell className="w-4 h-4 mb-0.5" />
            <span>Notifikasi</span>
          </button>
        </div>
      </div>
    </>
  );
};
