'use client';

import React from 'react';
import { BookOpen, UserPlus, BarChart3, ShieldCheck, KeyRound, UserCheck, Wallet, LogOut } from 'lucide-react';
import { AuthUser, UserRole } from '@/types';

export type AppTab = 'direktori' | 'form' | 'bendahara' | 'dashboard';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  totalMembers: number;
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalMembers,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const isLeadership = currentUser.role !== 'ANGGOTA';

  // Sanitize name for compact single-line display in navbar
  const cleanDisplayName = currentUser.nama
    .replace(/\(.*?\)/g, '')
    .split(',')[0]
    .trim();

  const roleColors: Record<UserRole, { badge: string; text: string }> = {
    SUPERADMIN: { badge: 'bg-red-500/20 text-red-300 border-red-400/40', text: 'Superadmin Dev' },
    KETUA: { badge: 'bg-purple-500/20 text-purple-300 border-purple-400/40', text: 'Ketua Batalyon' },
    SEKRETARIAT: { badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40', text: 'Kesekretariatan' },
    BENDAHARA: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40', text: 'Bendahara' },
    ANGGOTA: { badge: 'bg-slate-500/20 text-slate-300 border-slate-400/40', text: 'Perwira Anggota' },
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-polri-navy border-b border-polri-gold/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('direktori')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-polri-gold to-polri-goldDark flex items-center justify-center shadow-md border border-yellow-200 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-polri-navy" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-white text-sm sm:text-base tracking-wide whitespace-nowrap">
                    WIRA SATYA 96
                  </h1>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-polri-gold/20 text-polri-gold border border-polri-gold/40 whitespace-nowrap">
                    Batalyon 1996
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden xl:block whitespace-nowrap">
                  Yayasan & Sistem Informasi Alumni Akpol 1996
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setActiveTab('direktori')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'direktori'
                    ? 'bg-polri-gold text-polri-navy shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Buku Saku</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-current ml-0.5 font-bold">
                  {totalMembers}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'form'
                    ? 'bg-polri-gold text-polri-navy shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{currentUser.role === 'ANGGOTA' ? 'Data Saya' : 'Pendataan'}</span>
              </button>

              <button
                onClick={() => setActiveTab('bendahara')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'bendahara'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Kebendaharaan</span>
              </button>

              {isLeadership && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'dashboard'
                      ? 'bg-polri-gold text-polri-navy shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{currentUser.role === 'KETUA' ? 'Executive' : currentUser.role === 'BENDAHARA' ? 'Ringkasan' : 'Anev Leting'}</span>
                </button>
              )}
            </nav>

            {/* Auth / Role Switcher Header Pill */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onOpenAuthModal}
                className="h-10 flex items-center gap-2 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all text-xs"
                title="Pusat Keamanan & Manajemen Akun"
              >
                <div className="text-right hidden sm:block leading-tight">
                  <span className="font-bold text-xs block text-slate-100 truncate max-w-[110px] whitespace-nowrap">
                    {cleanDisplayName}
                  </span>
                  <span
                    className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border leading-none whitespace-nowrap ${
                      roleColors[currentUser.role].badge
                    }`}
                  >
                    {roleColors[currentUser.role].text}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-md bg-polri-gold text-polri-navy flex items-center justify-center font-extrabold flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="h-10 px-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 transition-all text-xs flex items-center gap-1.5 flex-shrink-0"
                  title="Keluar dari Portal (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline text-[11px] font-bold">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar (App-like feel on mobile phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-polri-navy border-t border-slate-700/80 px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
              activeTab === 'direktori'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Buku Saku</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
              activeTab === 'form'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 mb-0.5" />
            <span>{currentUser.role === 'ANGGOTA' ? 'Data Saya' : 'Pendataan'}</span>
          </button>

          <button
            onClick={() => setActiveTab('bendahara')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
              activeTab === 'bendahara'
                ? 'text-emerald-400 font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 mb-0.5 text-emerald-400" />
            <span>Kas/Iuran</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span>Eksekutif</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white"
          >
            <KeyRound className="w-4 h-4 mb-0.5" />
            <span>Akun</span>
          </button>
        </div>
      </div>
    </>
  );
};
