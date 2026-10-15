'use client';

import React from 'react';
import { BookOpen, UserPlus, BarChart3, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'direktori' | 'form' | 'dashboard';
  setActiveTab: (tab: 'direktori' | 'form' | 'dashboard') => void;
  totalMembers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, totalMembers }) => {
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'direktori'
                    ? 'bg-polri-gold text-polri-navy font-bold shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Buku Saku Digital
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/20 text-current ml-1">
                  {totalMembers}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'form'
                    ? 'bg-polri-gold text-polri-navy font-bold shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Formulir Pendataan
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-polri-gold text-polri-navy font-bold shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-polri-navyLight'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard Pengurus
              </button>
            </nav>

            {/* Slogan Badge */}
            <div className="flex items-center">
              <span className="text-xs italic font-semibold text-polri-gold border border-polri-gold/40 px-2.5 py-1 rounded-full bg-black/30">
                #SelaluBahagia
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar (App-like feel on mobile phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-polri-navy border-t border-slate-700/80 px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'direktori'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Buku Saku</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'form'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-5 h-5 mb-0.5" />
            <span>Pendataan</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'text-polri-gold font-bold bg-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </>
  );
};
