'use client';

import React from 'react';
import { 
  Home, 
  UserCheck, 
  Wallet, 
  BarChart3, 
  Search, 
  LogOut, 
  Bell, 
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { AuthUser, UserRole } from '@/types';

export type AppTab = 'direktori' | 'form' | 'bendahara' | 'dashboard';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  totalMembers: number;
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onSearchChange?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalMembers,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSearchChange,
}) => {
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

  return (
    <>
      {/* LinkedIn-Style Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
            
            {/* Left: LinkedIn-Style Logo + Search Box */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
              
              {/* WS96 Squircle Brand Logo (matches LinkedIn 'in' box) */}
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

            {/* Right: LinkedIn Stacked Nav Items (Icon above label) */}
            <nav className="flex items-center gap-1 sm:gap-3 lg:gap-5 flex-shrink-0">
              
              {/* 1. Halaman Utama / Direktori */}
              <button
                onClick={() => setActiveTab('direktori')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'direktori'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Home className="w-5 h-5" />
                  <span className="w-2 h-2 rounded-full bg-[#0a66c2] absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Halaman Utama</span>
              </button>

              {/* 2. Pendataan / Profil Saya */}
              <button
                onClick={() => setActiveTab('form')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'form'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">
                  {currentUser.role === 'ANGGOTA' ? 'Profil Saya' : 'Pendataan'}
                </span>
              </button>

              {/* 3. Kebendaharaan / Kas Leting */}
              <button
                onClick={() => setActiveTab('bendahara')}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center transition-all border-b-2 ${
                  activeTab === 'bendahara'
                    ? 'border-[#0a66c2] text-[#0a66c2] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">Kebendaharaan</span>
              </button>

              {/* 4. Anev Leting (Leadership) */}
              {isLeadership && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center transition-all border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'border-slate-900 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 hidden sm:block whitespace-nowrap">
                    {currentUser.role === 'KETUA' ? 'Executive' : 'Anev Leting'}
                  </span>
                </button>
              )}

              {/* 5. Notifikasi Angkatan */}
              <button
                onClick={() => alert(`Notifikasi Paguyuban: ${totalMembers} Perwira telah terdata di SIPP Alumni Akpol 1996. Program iuran 2026 dan santunan rekan sakit aktif.`)}
                className="hidden md:flex flex-col items-center justify-center px-2 py-1 min-w-[56px] text-center text-slate-500 hover:text-slate-900 border-b-2 border-transparent transition-all"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1.5">
                    3
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">Notifikasi</span>
              </button>

              {/* Vertical Divider */}
              <div className="h-7 w-px bg-slate-200 hidden sm:block" />

              {/* 6. Saya (Current User Profile Dropdown Pill) */}
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                title="Ganti Peran / Kelola Akun"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-300 flex-shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <span className="font-bold text-xs block text-slate-800 truncate max-w-[100px] whitespace-nowrap">
                    {cleanDisplayName}
                  </span>
                  <span className={`inline-block text-[8px] uppercase font-extrabold px-1 rounded border leading-tight ${roleBadgeColors[currentUser.role]}`}>
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  title="Keluar dari Portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

            </nav>

          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar (LinkedIn Style for Phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`flex flex-col items-center justify-center py-1.5 text-[10px] transition-colors ${
              activeTab === 'direktori' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center justify-center py-1.5 text-[10px] transition-colors ${
              activeTab === 'form' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <UserPlus className="w-4 h-4 mb-0.5" />
            <span>Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('bendahara')}
            className={`flex flex-col items-center justify-center py-1.5 text-[10px] transition-colors ${
              activeTab === 'bendahara' ? 'text-[#0a66c2] font-bold' : 'text-slate-500'
            }`}
          >
            <Wallet className="w-4 h-4 mb-0.5" />
            <span>Kas</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="flex flex-col items-center justify-center py-1.5 text-[10px] text-slate-500 hover:text-slate-900 transition-colors"
          >
            <UserCheck className="w-4 h-4 mb-0.5" />
            <span>Akun</span>
          </button>
        </div>
      </div>
    </>
  );
};
