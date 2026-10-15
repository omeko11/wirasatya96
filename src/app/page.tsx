'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BukuSaku } from '@/components/BukuSaku';
import { FormWizard } from '@/components/FormWizard';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { AnggotaWiraSatya } from '@/types';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'direktori' | 'form' | 'dashboard'>('direktori');
  const [members, setMembers] = useState<AnggotaWiraSatya[]>(INITIAL_MEMBERS);

  // Load from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('wirasatya96_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      } catch (err) {
        console.error('Failed to parse saved members', err);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-polri-gold selection:text-polri-navy">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalMembers={members.length}
      />

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
            onSave={handleSaveMember}
            onCancel={() => setActiveTab('direktori')}
          />
        )}

        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            members={members}
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
    </div>
  );
}
