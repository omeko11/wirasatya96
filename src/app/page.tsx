'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, AppTab } from '@/components/Navbar';
import { BukuSaku } from '@/components/BukuSaku';
import { FormWizard } from '@/components/FormWizard';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { BendaharaPortal } from '@/components/BendaharaPortal';
import { RoleSwitcherModal } from '@/components/RoleSwitcherModal';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { PRESET_USERS } from '@/data/mockUsers';
import { INITIAL_FINANCE_SUMMARY, INITIAL_TRANSACTIONS, INITIAL_IURAN_LIST } from '@/data/mockFinance';
import { AnggotaWiraSatya, AuthUser, KasTransaction, IuranAnggota, FinanceSummary } from '@/types';
import { ShieldCheck, UserCheck, KeyRound, LogOut, ExternalLink } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AppTab>('direktori');
  const [members, setMembers] = useState<AnggotaWiraSatya[]>(INITIAL_MEMBERS);
  const [currentUser, setCurrentUser] = useState<AuthUser>(PRESET_USERS[0]); // Default Superadmin
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Financial State
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>(INITIAL_FINANCE_SUMMARY);
  const [transactions, setTransactions] = useState<KasTransaction[]>(INITIAL_TRANSACTIONS);
  const [iuranList, setIuranList] = useState<IuranAnggota[]>(INITIAL_IURAN_LIST);

  // Load from localStorage or API on initial mount
  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem('ws96_active_user') || localStorage.getItem('wirasatya96_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.nrp) {
          setCurrentUser(parsed);
        }
      } catch (err) {
        console.error('Failed to parse user session', err);
      }
    }

    // Load Members
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

    // Load Finance
    const savedFinance = localStorage.getItem('wirasatya96_finance');
    if (savedFinance) {
      try {
        const parsed = JSON.parse(savedFinance);
        if (parsed.summary) setFinanceSummary(parsed.summary);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.iuranList) setIuranList(parsed.iuranList);
      } catch (err) {
        console.error('Failed to parse saved finance data', err);
      }
    }
  }, []);

  // Save member profile
  const handleSaveMember = async (newMember: AnggotaWiraSatya) => {
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

    // Try sync with API
    try {
      await fetch('/api/members', {
        method: existingIndex >= 0 ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
    } catch (err) {
      console.log('Saved to local storage, API sync skipped', err);
    }
  };

  // Add new cash transaction
  const handleAddTransaction = async (trxData: Omit<KasTransaction, 'id' | 'createdAt'>) => {
    const newTrx: KasTransaction = {
      ...trxData,
      id: 'trx-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    const updatedTrxList = [newTrx, ...transactions];
    setTransactions(updatedTrxList);

    // Update balances
    const updatedSummary = { ...financeSummary };
    if (newTrx.jenis === 'MASUK') {
      updatedSummary.saldoUtama += newTrx.nominal;
      updatedSummary.totalPemasukanBulanIni += newTrx.nominal;
      if (newTrx.kategori === 'SANTUNAN_KESEHATAN' || newTrx.kategori === 'SUMBANGAN_SUKARELA') {
        updatedSummary.kasSosialKesehatan += newTrx.nominal;
      }
    } else {
      updatedSummary.saldoUtama -= newTrx.nominal;
      updatedSummary.totalPengeluaranBulanIni += newTrx.nominal;
      if (newTrx.kategori === 'SANTUNAN_KESEHATAN') {
        updatedSummary.kasSosialKesehatan -= newTrx.nominal;
      } else if (newTrx.kategori === 'SANTUNAN_DUKA_CITA') {
        updatedSummary.kasDukaCita -= newTrx.nominal;
      }
    }
    setFinanceSummary(updatedSummary);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'wirasatya96_finance',
        JSON.stringify({ summary: updatedSummary, transactions: updatedTrxList, iuranList })
      );
    }

    // Try sync with API
    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trxData),
      });
    } catch (err) {
      console.log('Saved to local storage, API sync skipped', err);
    }
  };

  // Pay membership dues
  const handlePayIuran = async (nrp: string, nominal: number) => {
    const updatedList = iuranList.map((i) => {
      if (i.nrp === nrp) {
        const nextTerbayar = i.totalTerbayar + nominal;
        return {
          ...i,
          totalTerbayar: nextTerbayar,
          terakhirBayar: new Date().toISOString().split('T')[0],
          status: (nextTerbayar >= i.totalTagihan ? 'LUNAS' : 'SEBAGIAN') as 'LUNAS' | 'SEBAGIAN',
          bulanTerbayar: nextTerbayar >= i.totalTagihan ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : i.bulanTerbayar,
        };
      }
      return i;
    });
    setIuranList(updatedList);

    // Also record transaction
    const target = iuranList.find((i) => i.nrp === nrp);
    handleAddTransaction({
      nomorReferensi: 'WS96-IUR-' + Date.now().toString().slice(-4),
      tanggal: new Date().toISOString().split('T')[0],
      jenis: 'MASUK',
      kategori: 'IURAN_WAJIB_BULANAN',
      nominal: nominal,
      keterangan: `Pembayaran Iuran Wajib Leting oleh ${target?.namaLengkap || nrp}`,
      pihakTerkait: target?.namaLengkap || nrp,
      nrpTerkait: nrp,
      dicatatOleh: currentUser.nama,
    });

    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PAY_IURAN', nrp, nominal }),
      });
    } catch (err) {
      console.log('Saved to local storage, API sync skipped', err);
    }
  };

  // Switch role or user
  const handleSelectUser = (user: AuthUser) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ws96_active_user', JSON.stringify(user));
      localStorage.setItem('wirasatya96_current_user', JSON.stringify(user));
    }
    // Redirect if Anggota is on leadership tab
    if (user.role === 'ANGGOTA' && activeTab === 'dashboard') {
      setActiveTab('direktori');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('ws96_active_user');
    localStorage.removeItem('ws96_mfa_verified');
    router.push('/login');
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
        onLogout={handleLogout}
      />

      {/* Role Banner Notification Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 text-polri-gold font-bold flex-shrink-0 text-[11px]">
              <UserCheck className="w-3.5 h-3.5" />
              Sesi:
            </span>
            <span className="text-slate-200 text-xs truncate font-medium">
              {currentUser.nama.replace(/\(.*?\)/g, '').split(',')[0].trim()} ({currentUser.pangkat})
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-polri-gold border border-polri-gold/30 flex-shrink-0">
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 text-xs">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-polri-gold hover:text-yellow-300 text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              <KeyRound className="w-3 h-3" />
              <span>Ganti Role</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => router.push('/login')}
              className="text-slate-400 hover:text-white text-[11px] font-medium hidden sm:flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Portal Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: BUKU SAKU */}
        {activeTab === 'direktori' && (
          <BukuSaku
            members={members}
            onAddNew={() => setActiveTab('form')}
          />
        )}

        {/* TAB 2: DATA MANDIRI / PROFIL */}
        {activeTab === 'form' && (
          <FormWizard
            currentUser={currentUser}
            existingMember={currentMemberProfile}
            onSave={handleSaveMember}
            onCancel={() => setActiveTab('direktori')}
          />
        )}

        {/* TAB 3: PORTAL KEBENDAHARAAN */}
        {activeTab === 'bendahara' && (
          <BendaharaPortal
            currentUser={currentUser}
            members={members}
            financeSummary={financeSummary}
            transactions={transactions}
            iuranList={iuranList}
            onAddTransaction={handleAddTransaction}
            onPayIuran={handlePayIuran}
          />
        )}

        {/* TAB 4: EKSEKUTIF & KESEKRETARIATAN */}
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
          <div className="flex items-center gap-3 text-slate-400">
            <span>Sistem Informasi Kesejahteraan & Direktori Purna Tugas</span>
            <span>&bull;</span>
            <button onClick={handleLogout} className="hover:text-red-400 font-semibold flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
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
