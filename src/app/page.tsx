'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BukuSaku } from '@/components/BukuSaku';
import { FormWizard } from '@/components/FormWizard';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { RoleSwitcherModal } from '@/components/RoleSwitcherModal';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { PRESET_USERS } from '@/data/mockUsers';
import { AnggotaWiraSatya, AuthUser } from '@/types';
import { ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'direktori' | 'form' | 'dashboard'>('direktori');
  const [members, setMembers] = useState<AnggotaWiraSatya[]>(INITIAL_MEMBERS);
  const [currentUser, setCurrentUser] = useState<AuthUser>(PRESET_USERS[0]); // Default to Ketua
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    const savedMembers = localStorage.getItem('wirasatya96_members');
    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      } catch (err) {
        console.error('Failed to parse saved members', err);
      }
    }

    const savedUser = localStorage.getItem('wirasatya96_current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.nrp) {
          setCurrentUser(parsedUser);
        }
      } catch (err) {
        console.error('Failed to parse saved user', err);
      }
    }
  }, []);

  // Save to localStorage when members state changes
  const handleSaveMember = (newMember: AnggotaWiraSatya) => {
    const existingIndex = members.findIndex((m) => m.nrp === newMember.nrp);
    let updatedList: AnggotaWiraSatya[];
    if (existingIndex >= 0) {
      updatedList = [...members];
      updatedList[existingIndex] = { ...newMember, id: members[existingIndex].id };
    } else {
      updatedList = [newMember, ...members];
    }
    setMembers(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_members', JSON.stringify(updatedList));
    }
  };

  const handleSelectUser = (user: AuthUser) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_current_user', JSON.stringify(user));
    }
    // If Anggota logs in and was on dashboard, redirect to direktori
    if (user.role === 'ANGGOTA' && activeTab === 'dashboard') {
      setActiveTab('direktori');
    }
  };

  // Find logged-in user profile if exists
  const currentMemberProfile = members.find((m) => m.nrp === currentUser.nrp);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-polri-gold selection:text-polri-navy">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalMembers={members.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Role Banner Notification Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-polri-gold font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              Sesi Login:
            </span>
            <span>
              {currentUser.nama} ({currentUser.pangkat}) &bull; Hak Akses: <b className="text-white uppercase">{currentUser.role}</b>
            </span>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-polri-gold hover:underline text-[11px] font-semibold flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3" />
            Ganti Peran / Login Akun Lain
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'direktori' && (
          <BukuSaku
            members={members}
            onAddNew={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'form' && (
          <FormWizard
            currentUser={currentUser}
            existingMember={currentMemberProfile}
            onSave={handleSaveMember}
            onCancel={() => setActiveTab('direktori')}
          />
        )}

        {activeTab === 'dashboard' && currentUser.role !== 'ANGGOTA' && (
          <ExecutiveDashboard
            members={members}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-polri-navy text-slate-400 py-6 border-t border-polri-gold/20 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-polri-gold" />
            <span className="font-semibold text-slate-200">
              Batalyon Wira Satya Akpol 1996 — #SelaluBahagia
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Sistem Informasi Kesejahteraan & Direktori Purna Tugas</span>
          </div>
        </div>
      </footer>

      {/* Role Switcher & Login Modal */}
      <RoleSwitcherModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onAddNewMemberAccount={(newM) => {
          const updated = [newM, ...members];
          setMembers(updated);
          if (typeof window !== 'undefined') {
            localStorage.setItem('wirasatya96_members', JSON.stringify(updated));
          }
        }}
      />
    </div>
  );
}
