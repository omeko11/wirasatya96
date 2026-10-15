'use client';

import React from 'react';
import { BookOpen, UserPlus, BarChart3, ShieldCheck, KeyRound, UserCheck } from 'lucide-react';
import { AuthUser, UserRole } from '@/types';

interface NavbarProps {
  activeTab: 'direktori' | 'form' | 'dashboard';
  setActiveTab: (tab: 'direktori' | 'form' | 'dashboard') => void;
  totalMembers: number;
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalMembers,
  currentUser,
  onOpenAuthModal,
}) => {
  const isLeadership = currentUser.role !== 'ANGGOTA';

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
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('direktori')}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-polri-gold to-polri-goldDark flex items-center justify-center shadow-lg border border-yellow-200">
                <ShieldCheck className="w-6 h-6 text-polri-navy" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-white text-base sm:text-lg tracking-wide">
                    WIRA SATYA 96
                  </h1>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-polri-gold/20 text-polri-gold border border-polri-gold/40">
                    Batalyon 1996
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden sm:block">
                  Sistem Informasi Kesejahteraan & Direktori Purna Tugas
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('direktori')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'direktori'
                    ? 'bg-polri-gold text-polri-navy shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Buku Saku
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-current ml-0.5">
                  {totalMembers}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'form'
                    ? 'bg-polri-gold text-polri-navy shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {currentUser.role === 'ANGGOTA' ? 'Perbarui Data Saya' : 'Pendataan Anggota'}
              </button>

              {isLeadership && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-polri-gold text-polri-navy shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard {currentUser.role === 'KETUA' ? 'Ketua' : currentUser.role === 'BENDAHARA' ? 'Bendahara' : 'Kesekretariatan'}
                </button>
              )}
            </nav>

            {/* Auth / Role Switcher Header Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all text-xs"
                title="Ganti Akun / Simulasi Hak Akses Role"
              >
                <div className="text-right hidden sm:block">
                  <span className="font-bold text-xs block text-slate-100 line-clamp-1 max-w-[140px]">
                    {currentUser.nama.split(',')[0]}
                  </span>
                  <span
                    className={`inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded border ${
                      roleColors[currentUser.role].badge
                    }`}
                  >
                    {roleColors[currentUser.role].text}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-polri-gold text-polri-navy flex items-center justify-center font-extrabold">
                  <UserCheck className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar (App-like feel on mobile phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-polri-navy border-t border-slate-700/80 px-2 py-1 shadow-2xl">
        <div className={`grid ${isLeadership ? 'grid-cols-4' : 'grid-cols-3'} gap-1`}>
          <button
            onClick={() => setActiveTab('direktori')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
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
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeTab === 'form'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 mb-0.5" />
            <span>{currentUser.role === 'ANGGOTA' ? 'Data Saya' : 'Pendataan'}</span>
          </button>

          {isLeadership && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'text-polri-gold font-bold bg-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-0.5" />
              <span>Dashboard</span>
            </button>
          )}

          <button
            onClick={onOpenAuthModal}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white"
          >
            <KeyRound className="w-4 h-4 mb-0.5" />
            <span>Akun</span>
          </button>
        </div>
      </div>
    </>
  );
};
