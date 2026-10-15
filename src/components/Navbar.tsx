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
  ShieldAlert,
  UserPlus,
  FileText,
  Settings,
  LayoutGrid,
  Heart,
  Scale,
  Building2,
  Lock
} from 'lucide-react';
import { AuthUser, UserRole } from '@/types';
import { WSLogo } from './WSLogo';

export type AppTab = 
  | 'direktori' 
  | 'jaringan' 
  | 'purnaTugas' 
  | 'pesan' 
  | 'notifikasi' 
  | 'form' 
  | 'bendahara' 
  | 'dashboard'
  | 'pengaturan';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  totalMembers: number;
  currentUser: AuthUser;
  onOpenAuthModal?: () => void;
  onOpenVerificationModal?: () => void;
  pendingVerificationCount?: number;
  onOpenRegisterModal?: () => void;
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
  onOpenVerificationModal,
  pendingVerificationCount = 0,
  onOpenRegisterModal,
  onLogout,
  onSearchChange,
  onViewMyProfile,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const appsMenuRef = useRef<HTMLDivElement>(null);
  const isLeadership = currentUser.role !== 'ANGGOTA';

  // Sanitize name for compact single-line display
  const cleanDisplayName = currentUser.nama
    .replace(/\(.*?\)/g, '')
    .split(',')[0]
    .trim();

  const roleBadgeColors: Record<UserRole, string> = {
    SUPERADMIN: 'bg-red-100 text-red-900 border-red-300',
    KETUA: 'bg-purple-100 text-purple-900 border-purple-300',
    SEKRETARIAT: 'bg-blue-100 text-blue-900 border-blue-300',
    BENDAHARA: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    ANGGOTA: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (appsMenuRef.current && !appsMenuRef.current.contains(e.target as Node)) {
        setIsAppsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Header Bar - Bareskrim Red Accents */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo + Bareskrim Red Search Box */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
              <WSLogo 
                size="sm"
                onClick={() => setActiveTab('direktori')}
              />

              {/* Search Bar */}
              <div className="relative flex-1 hidden sm:block max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari leting, polda, satker..."
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-transparent rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900 transition-all"
                />
              </div>

              {/* Mobile text title */}
              <div className="sm:hidden min-w-0">
                <span className="font-black text-xs text-red-900 block leading-tight truncate">WIRA SATYA 96</span>
                <span className="text-[10px] text-slate-500 font-semibold truncate block">Alumni Akpol 1996</span>
              </div>
            </div>

            {/* Right: Stacked Nav Items (Bareskrim Red Active Colors) */}
            <nav className="flex items-center gap-0.5 sm:gap-2 lg:gap-3 flex-shrink-0">
              
              {/* 1. Halaman Utama */}
              <button
                onClick={() => setActiveTab('direktori')}
                className={`hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'direktori'
                    ? 'border-red-900 text-red-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Beranda & Feed Silaturahmi"
              >
                <div className="relative">
                  <Home className="w-5 h-5" />
                  <span className="w-2 h-2 rounded-full bg-red-800 absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Halaman Utama</span>
              </button>

              {/* 2. Jaringan (My Network) */}
              <button
                onClick={() => setActiveTab('jaringan')}
                className={`hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'jaringan'
                    ? 'border-red-900 text-red-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Jaringan 286 Perwira"
              >
                <div className="relative">
                  <Users className="w-5 h-5" />
                  <span className="px-1 py-0.2 rounded-full bg-red-100 text-red-900 text-[8px] font-bold absolute -top-1 -right-2">
                    {totalMembers}
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Jaringan</span>
              </button>

              {/* 3. Riwayat Jabatan & Penugasan Leting 96 */}
              <button
                onClick={() => setActiveTab('purnaTugas')}
                className={`hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'purnaTugas'
                    ? 'border-red-900 text-red-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Riwayat Jabatan & Tour of Duty Leting 96"
              >
                <Briefcase className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Jabatan</span>
              </button>

              {/* 4. Pesan */}
              <button
                onClick={() => setActiveTab('pesan')}
                className={`hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'pesan'
                    ? 'border-red-900 text-red-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Pesan & Obrolan Leting"
              >
                <div className="relative">
                  <MessageSquare className="w-5 h-5" />
                  <span className="w-4 h-4 rounded-full bg-red-700 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-2">
                    2
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Pesan</span>
              </button>

              {/* 5. Notifikasi */}
              <button
                onClick={() => setActiveTab('notifikasi')}
                className={`hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'notifikasi'
                    ? 'border-red-900 text-red-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Notifikasi & Atensi Leting"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="w-4 h-4 rounded-full bg-red-700 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-2">
                    4
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Notifikasi</span>
              </button>

              {/* 6. Kebendaharaan */}
              <button
                onClick={() => setActiveTab('bendahara')}
                className={`hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[50px] sm:min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'bendahara'
                    ? 'border-amber-700 text-amber-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                title="Kas Yayasan & Iuran"
              >
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Kebendaharaan</span>
              </button>

              {/* Anev Leting (Leadership) */}
              {isLeadership && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`hidden lg:flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center transition-all border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'border-red-900 text-red-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                  title="Dashboard Eksekutif Batalyon"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 whitespace-nowrap">Anev Leting</span>
                </button>
              )}

              {/* Verifikasi Registrasi Alumni (Admin/Sekretariat Only) */}
              {(currentUser.role === 'SUPERADMIN' || currentUser.role === 'SEKRETARIAT') && onOpenVerificationModal && (
                <button
                  onClick={onOpenVerificationModal}
                  className="relative flex flex-col items-center justify-center px-1.5 py-1 text-slate-600 hover:text-red-900 transition-colors"
                  title="Verifikasi Pendaftaran Alumni Baru"
                >
                  <div className="relative">
                    <ShieldAlert className="w-5 h-5 text-red-800" />
                    {pendingVerificationCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-700 text-white text-[9px] font-extrabold flex items-center justify-center absolute -top-1 -right-2 ring-2 ring-white animate-pulse">
                        {pendingVerificationCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 whitespace-nowrap font-medium text-red-900">Verifikasi</span>
                </button>
              )}

              {/* Vertical Divider */}
              <div className="h-7 w-px bg-slate-200 hidden sm:block mx-1" />

              {/* 7. Saya (User Menu Popover) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex flex-col sm:flex-row items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                  title="Menu Akun Saya"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'}
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

                {/* Profile Popover Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 text-xs text-slate-700 animate-fadeIn">
                    
                    {/* Top Mini Card */}
                    <div className="px-4 pb-3 border-b border-slate-100 flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}
                        alt={cleanDisplayName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {cleanDisplayName}
                          </h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.pangkat} &bull; {currentUser.satker || 'Bareskrim Polri'}</p>
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
                        className="w-full py-1.5 px-3 rounded-full border border-red-800 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors text-center"
                      >
                        Lihat profil
                      </button>
                    </div>

                    {/* Section: Akun */}
                    <div className="py-2 border-b border-slate-100">
                      <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Akun
                      </div>
                      
                      {/* Pengaturan & Privasi (Opens Settings Page) */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('pengaturan');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5 text-red-800" />
                          <span className="font-semibold text-slate-900">Pengaturan & Privasi</span>
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-900">FIDO2</span>
                      </button>

                      {/* Verifikasi Anggota (Superadmin / Sekretariat) */}
                      {(currentUser.role === 'SUPERADMIN' || currentUser.role === 'SEKRETARIAT') && onOpenVerificationModal && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenVerificationModal();
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-red-50/80 flex items-center justify-between text-slate-700 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-800" />
                            <span className="font-semibold text-red-950">Verifikasi Pendaftaran</span>
                          </span>
                          {pendingVerificationCount > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-700 text-white animate-pulse">
                              {pendingVerificationCount} Baru
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">0</span>
                          )}
                        </button>
                      )}

                      {/* Pendaftaran Akun Alumni Baru */}
                      {onOpenRegisterModal && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenRegisterModal();
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                            <span>Pendaftaran Anggota Baru</span>
                          </span>
                          <span className="text-[10px] font-semibold text-red-800">Daftar</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('form');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
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
                        <span>Transparansi Kas Yayasan</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('purnaTugas');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-red-800" />
                        <span>Riwayat Jabatan Leting</span>
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
                          className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-700 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout (Keluar)</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* 8. 9-Dots Launcher: Layanan & Aplikasi Leting (Matching Screenshot media_1792052265738_38a565d7.png) */}
              <div className="relative hidden sm:block" ref={appsMenuRef}>
                <button
                  onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                  className="flex flex-col items-center justify-center px-1.5 py-1 text-slate-500 hover:text-slate-900 transition-colors"
                  title="Layanan & Aplikasi Batalyon"
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 whitespace-nowrap">Layanan</span>
                </button>

                {isAppsMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs text-slate-700 animate-fadeIn space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                        <LayoutGrid className="w-4 h-4 text-red-800" />
                        <span>Aplikasi Mandiri Leting 96</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => {
                            setIsAppsMenuOpen(false);
                            setActiveTab('direktori');
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-red-800/40 hover:bg-red-50/50 text-left transition-all"
                        >
                          <Building2 className="w-4 h-4 text-red-800 mb-1" />
                          <div className="font-bold text-slate-800 text-[11px]">Buku Saku 38 Polda</div>
                          <div className="text-[10px] text-slate-500">Direktori sebaran perwira</div>
                        </button>

                        <button
                          onClick={() => {
                            setIsAppsMenuOpen(false);
                            setActiveTab('purnaTugas');
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-red-800/40 hover:bg-red-50/50 text-left transition-all"
                        >
                          <Briefcase className="w-4 h-4 text-amber-700 mb-1" />
                          <div className="font-bold text-slate-800 text-[11px]">Riwayat Jabatan</div>
                          <div className="text-[10px] text-slate-500">Tour of duty & promosi</div>
                        </button>

                        <button
                          onClick={() => {
                            setIsAppsMenuOpen(false);
                            setActiveTab('bendahara');
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-red-800/40 hover:bg-red-50/50 text-left transition-all"
                        >
                          <Wallet className="w-4 h-4 text-emerald-700 mb-1" />
                          <div className="font-bold text-slate-800 text-[11px]">Kas Yayasan</div>
                          <div className="text-[10px] text-slate-500">Transparansi kebendaharaan</div>
                        </button>

                        <button
                          onClick={() => {
                            setIsAppsMenuOpen(false);
                            setActiveTab('pengaturan');
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-red-800/40 hover:bg-red-50/50 text-left transition-all"
                        >
                          <Lock className="w-4 h-4 text-purple-700 mb-1" />
                          <div className="font-bold text-slate-800 text-[11px]">Keamanan FIDO2</div>
                          <div className="text-[10px] text-slate-500">Passkey & Biometrik</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-800" />
                        <span>Sinergi Paguyuban Batalyon</span>
                      </h4>
                      <div className="space-y-1.5 pt-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">Satgas Kesehatan: </span>
                            <span className="text-slate-500">Pendampingan medis rekan dan keluarga</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">LBH Wira Satya: </span>
                            <span className="text-slate-500">Advokasi dan perlindungan hukum perwira</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </nav>

          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 pt-1.5 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-6 gap-0.5 text-[9px]">
          {/* 1. Beranda */}
          <button
            onClick={() => setActiveTab('direktori')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'direktori' ? 'text-red-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5 mb-0.5" />
              {activeTab === 'direktori' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-800 absolute -top-0.5 -right-0.5" />
              )}
            </div>
            <span>Beranda</span>
          </button>

          {/* 2. Jaringan */}
          <button
            onClick={() => setActiveTab('jaringan')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'jaringan' ? 'text-red-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5 mb-0.5" />
              <span className="px-1 rounded-full bg-red-100 text-red-900 text-[8px] font-bold absolute -top-1 -right-2">
                286
              </span>
            </div>
            <span>Jaringan</span>
          </button>

          {/* 3. Jabatan */}
          <button
            onClick={() => setActiveTab('purnaTugas')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'purnaTugas' ? 'text-red-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>Jabatan</span>
          </button>

          {/* 4. Kas 96 */}
          <button
            onClick={() => setActiveTab('bendahara')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'bendahara' ? 'text-red-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Kas 96</span>
          </button>

          {/* 5. Pesan */}
          <button
            onClick={() => setActiveTab('pesan')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'pesan' ? 'text-red-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="w-3.5 h-3.5 rounded-full bg-red-700 text-white text-[8px] font-bold flex items-center justify-center absolute -top-1 -right-2">
                2
              </span>
            </div>
            <span>Pesan</span>
          </button>

          {/* 6. Notifikasi */}
          <button
            onClick={() => setActiveTab('notifikasi')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'notifikasi' ? 'text-red-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 mb-0.5" />
              <span className="w-3.5 h-3.5 rounded-full bg-red-700 text-white text-[8px] font-bold flex items-center justify-center absolute -top-1 -right-2">
                4
              </span>
            </div>
            <span>Notif</span>
          </button>
        </div>
      </div>
    </>
  );
};
