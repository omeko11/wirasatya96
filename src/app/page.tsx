'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, AppTab } from '@/components/Navbar';
import { BukuSaku } from '@/components/BukuSaku';
import { FormWizard } from '@/components/FormWizard';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { BendaharaPortal } from '@/components/BendaharaPortal';
import { AdminVerificationModal } from '@/components/AdminVerificationModal';
import { RegistrationModal } from '@/components/RegistrationModal';
import { LinkedInChatDock } from '@/components/LinkedInChatDock';
import { LinkedInMessagingPage } from '@/components/LinkedInMessagingPage';
import { LinkedInJobsPage } from '@/components/LinkedInJobsPage';
import { LinkedInNotificationsPage } from '@/components/LinkedInNotificationsPage';
import { LinkedInSettingsPage } from '@/components/LinkedInSettingsPage';
import { LinkedInProfileView } from '@/components/LinkedInProfileView';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { PRESET_USERS } from '@/data/mockUsers';
import { INITIAL_FEED_POSTS } from '@/data/mockPosts';
import { INITIAL_FINANCE_SUMMARY, INITIAL_TRANSACTIONS, INITIAL_IURAN_LIST, INITIAL_ASSETS } from '@/data/mockFinance';
import { AnggotaWiraSatya, AuthUser, KasTransaction, IuranAnggota, FinanceSummary, AssetPortfolioItem, FeedPost, ChatMessage } from '@/types';
import { getAvatarUrl, getOrBuildUserProfile } from '@/lib/avatarUtils';

const STORAGE_VERSION = 'ws96_akpol96_real_v9';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AppTab>('direktori');
  const [members, setMembers] = useState<AnggotaWiraSatya[]>(INITIAL_MEMBERS);
  const [currentUser, setCurrentUser] = useState<AuthUser>(PRESET_USERS[0]); // Default Superadmin
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
  const [navbarSearchQuery, setNavbarSearchQuery] = useState('');
  const [viewingMember, setViewingMember] = useState<AnggotaWiraSatya | null>(null);
  const [editingMember, setEditingMember] = useState<AnggotaWiraSatya | null | 'NEW'>(null);
  const [messagingTargetMember, setMessagingTargetMember] = useState<AnggotaWiraSatya | null>(null);

  // Social Feed & Messaging State
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Financial & Asset Portfolio State
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>(INITIAL_FINANCE_SUMMARY);
  const [transactions, setTransactions] = useState<KasTransaction[]>(INITIAL_TRANSACTIONS);
  const [assets, setAssets] = useState<AssetPortfolioItem[]>(INITIAL_ASSETS);
  const [iuranList, setIuranList] = useState<IuranAnggota[]>(INITIAL_IURAN_LIST);

  // Load from localStorage or API on initial mount
  useEffect(() => {
    // Purge stale dummy caches from previous versions
    const currentVersion = localStorage.getItem('ws96_storage_version');
    if (currentVersion !== STORAGE_VERSION) {
      localStorage.removeItem('wirasatya96_members');
      localStorage.removeItem('wirasatya96_feed_posts');
      localStorage.removeItem('wirasatya96_riwayat_jabatan');
      localStorage.removeItem('wirasatya96_finance');
      localStorage.removeItem('ws96_messages_cache');
      localStorage.setItem('ws96_storage_version', STORAGE_VERSION);
    }

    // Load User and sanitize any legacy Unsplash avatar URL
    const savedUser = localStorage.getItem('ws96_active_user') || localStorage.getItem('wirasatya96_current_user');
    let activeNrp = PRESET_USERS[0].nrp;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.nrp) {
          activeNrp = parsed.nrp;
          const sanitizedUser: AuthUser = {
            ...parsed,
            fotoUrl: getAvatarUrl(parsed.fotoUrl),
          };
          setCurrentUser(sanitizedUser);
          localStorage.setItem('ws96_active_user', JSON.stringify(sanitizedUser));
          localStorage.setItem('wirasatya96_current_user', JSON.stringify(sanitizedUser));
        }
      } catch (err) {
        console.error('Failed to parse user session', err);
      }
    }

    // Load Members (only use cache if it already has all 164+ AKPOL 96 officers)
    const savedMembers = localStorage.getItem('wirasatya96_members');
    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length >= 160) {
          const sanitizedMembers = parsed.map((m: AnggotaWiraSatya) => ({
            ...m,
            fotoUrl: getAvatarUrl(m.fotoUrl),
          }));
          setMembers(sanitizedMembers);
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
        if (parsed.assets) setAssets(parsed.assets);
        if (parsed.iuranList && parsed.iuranList.length >= 160) setIuranList(parsed.iuranList);
      } catch (err) {
        console.error('Failed to parse saved finance data', err);
      }
    }

    // Refresh members from API store
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        const list = data.members || data.data;
        if (data.success && Array.isArray(list) && list.length > 0) {
          const sanitizedMembers = list.map((m: AnggotaWiraSatya) => ({
            ...m,
            fotoUrl: getAvatarUrl(m.fotoUrl),
          }));
          setMembers(sanitizedMembers);
          localStorage.setItem('wirasatya96_members', JSON.stringify(sanitizedMembers));
        }
      })
      .catch(() => {});

    // Refresh feed posts from API store
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
          localStorage.setItem('wirasatya96_feed_posts', JSON.stringify(data.posts));
        }
      })
      .catch(() => {});

    // Refresh finance & assets from API store
    fetch('/api/finance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.summary) setFinanceSummary(res.data.summary);
          if (Array.isArray(res.data.transactions)) setTransactions(res.data.transactions);
          if (Array.isArray(res.data.assets)) setAssets(res.data.assets);
          if (Array.isArray(res.data.iuranList) && res.data.iuranList.length > 0) {
            setIuranList(res.data.iuranList);
          }
        }
      })
      .catch(() => {});

    // Refresh pending verification count
    fetch('/api/auth/register')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.registrations)) {
          const count = data.registrations.filter((r: any) => r.status === 'PENDING_VERIFIKASI').length;
          setPendingVerificationCount(count);
        }
      })
      .catch(() => {});

    // Refresh messages for active user
    const refreshMessages = () => {
      fetch(`/api/messages?userNrp=${encodeURIComponent(activeNrp)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        })
        .catch(() => {});
    };
    refreshMessages();
    window.addEventListener('ws96_messages_updated', refreshMessages);
    return () => window.removeEventListener('ws96_messages_updated', refreshMessages);
  }, []);

  // Start editing a specific member (Admin/Sekretariat or self)
  const handleStartEditMember = (member: AnggotaWiraSatya) => {
    if (!['SUPERADMIN', 'SEKRETARIAT'].includes(currentUser.role) && member.nrp !== currentUser.nrp) {
      return;
    }
    setViewingMember(null);
    setEditingMember(member);
    setActiveTab('form');
  };

  // Add a new member (Strictly Admin & Kesekretariatan only)
  const handleAddNewMember = () => {
    if (!['SUPERADMIN', 'SEKRETARIAT'].includes(currentUser.role)) {
      return;
    }
    setViewingMember(null);
    setEditingMember('NEW');
    setActiveTab('form');
  };

  // Open direct chat with an alumnus
  const handleOpenChatWithMember = (member: AnggotaWiraSatya) => {
    setViewingMember(null);
    setMessagingTargetMember(member);
    setActiveTab('pesan');
  };

  // Save member profile
  const handleSaveMember = async (newMember: AnggotaWiraSatya) => {
    const cleanMember: AnggotaWiraSatya = {
      ...newMember,
      fotoUrl: getAvatarUrl(newMember.fotoUrl),
    };
    const existingIndex = members.findIndex((m) => m.nrp === cleanMember.nrp);
    let updatedList: AnggotaWiraSatya[];
    if (existingIndex >= 0) {
      updatedList = [...members];
      updatedList[existingIndex] = { ...cleanMember, id: members[existingIndex].id || cleanMember.id || ('ws-' + Date.now()) };
    } else {
      const createdMember: AnggotaWiraSatya = {
        ...cleanMember,
        id: cleanMember.id || ('ws-' + Date.now()),
      };
      updatedList = [createdMember, ...members];
    }
    setMembers(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_members', JSON.stringify(updatedList));
    }

    // If the user updated their own profile, sync currentUser as well
    if (cleanMember.nrp === currentUser.nrp) {
      const updatedUser: AuthUser = {
        ...currentUser,
        nama: cleanMember.namaLengkap,
        pangkat: cleanMember.pangkat,
        satker: cleanMember.satuanKerja,
        polda: cleanMember.polda,
        fotoUrl: getAvatarUrl(cleanMember.fotoUrl),
      };
      setCurrentUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ws96_active_user', JSON.stringify(updatedUser));
        localStorage.setItem('wirasatya96_current_user', JSON.stringify(updatedUser));
      }
    }

    setEditingMember(null);
    setViewingMember(cleanMember);
    setActiveTab('direktori');

    // Try sync with API
    try {
      await fetch('/api/members', {
        method: existingIndex >= 0 ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanMember),
      });
    } catch (err) {
      console.log('Saved to local storage, API sync skipped', err);
    }
  };

  // Add new cash transaction (Strictly BENDAHARA only)
  const handleAddTransaction = async (trxData: Omit<KasTransaction, 'id' | 'createdAt'>) => {
    if (currentUser.role !== 'BENDAHARA') return;

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
        JSON.stringify({ summary: updatedSummary, transactions: updatedTrxList, assets, iuranList })
      );
    }

    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trxData, actorRole: currentUser.role }),
      });
    } catch (err) {
      console.log('Saved to local storage, API sync skipped', err);
    }
  };

  // Add new portfolio asset (Strictly BENDAHARA only)
  const handleAddAsset = async (assetData: Omit<AssetPortfolioItem, 'id' | 'updatedAt'>) => {
    if (currentUser.role !== 'BENDAHARA') return;

    const newAsset: AssetPortfolioItem = {
      ...assetData,
      id: 'ast-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    const updatedAssets = [newAsset, ...assets];
    setAssets(updatedAssets);

    const totalValuasiAset = updatedAssets.reduce((sum, a) => sum + (Number(a.estimasiNilaiIdr) || 0), 0);
    const updatedSummary: FinanceSummary = {
      ...financeSummary,
      totalValuasiAset,
      danaAbadiInvestasi: totalValuasiAset,
    };
    setFinanceSummary(updatedSummary);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'wirasatya96_finance',
        JSON.stringify({ summary: updatedSummary, transactions, assets: updatedAssets, iuranList })
      );
    }

    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_ASSET', actorRole: currentUser.role, ...assetData }),
      });
    } catch (err) {
      console.log('Saved asset to local storage, API sync skipped', err);
    }
  };

  // Delete portfolio asset (Strictly BENDAHARA only)
  const handleDeleteAsset = async (id: string) => {
    if (currentUser.role !== 'BENDAHARA') return;

    const updatedAssets = assets.filter((a) => a.id !== id);
    setAssets(updatedAssets);

    const totalValuasiAset = updatedAssets.reduce((sum, a) => sum + (Number(a.estimasiNilaiIdr) || 0), 0);
    const updatedSummary: FinanceSummary = {
      ...financeSummary,
      totalValuasiAset,
      danaAbadiInvestasi: totalValuasiAset,
    };
    setFinanceSummary(updatedSummary);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'wirasatya96_finance',
        JSON.stringify({ summary: updatedSummary, transactions, assets: updatedAssets, iuranList })
      );
    }

    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ASSET', actorRole: currentUser.role, id }),
      });
    } catch (err) {
      console.log('Deleted asset in local storage', err);
    }
  };

  // Pay membership dues (Strictly BENDAHARA only)
  const handlePayIuran = async (nrp: string, nominal: number) => {
    if (currentUser.role !== 'BENDAHARA') return;

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
        body: JSON.stringify({ action: 'PAY_IURAN', actorRole: currentUser.role, nrp, nominal, dicatatOleh: currentUser.nama }),
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

  // Find or construct logged-in user profile
  const currentMemberProfile = React.useMemo(
    () => getOrBuildUserProfile(currentUser, members),
    [currentUser, members]
  );

  // Compute live unread messages & notifications count for Navbar
  const unreadMessagesCount = React.useMemo(
    () => messages.filter((m) => m.receiverNrp === currentUser.nrp && !m.isRead).length,
    [messages, currentUser.nrp]
  );

  const unreadNotificationsCount = React.useMemo(() => {
    const healthCount = members.filter(
      (m) => m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT'
    ).length;
    const verifCount =
      currentUser.role === 'SUPERADMIN' || currentUser.role === 'SEKRETARIAT'
        ? pendingVerificationCount
        : 0;
    return healthCount + verifCount + unreadMessagesCount;
  }, [members, currentUser.role, pendingVerificationCount, unreadMessagesCount]);

  // Update active member's jabatan & satker when a new mutation is recorded in Menu Jabatan
  const handleUpdateMemberJabatan = async (
    nrp: string,
    jabatanBaru: string,
    satkerBaru: string,
    poldaBaru: string
  ) => {
    const target = members.find((m) => m.nrp === nrp);
    if (!target) return;
    const updatedMember: AnggotaWiraSatya = {
      ...target,
      jabatanTerakhir: jabatanBaru,
      satuanKerja: satkerBaru,
      polda: poldaBaru,
    };
    const updatedList = members.map((m) => (m.nrp === nrp ? updatedMember : m));
    setMembers(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_members', JSON.stringify(updatedList));
    }
    try {
      await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f2ee] selection:bg-red-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setViewingMember(null);
          if (tab !== 'form') {
            setEditingMember(null);
          }
          setActiveTab(tab);
        }}
        totalMembers={members.length}
        currentUser={currentUser}
        members={members}
        onSelectMember={(m) => setViewingMember(m)}
        onOpenChat={handleOpenChatWithMember}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        pendingVerificationCount={pendingVerificationCount}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onLogout={handleLogout}
        onSearchChange={setNavbarSearchQuery}
        onViewMyProfile={() => {
          const myProfile = getOrBuildUserProfile(currentUser, members);
          setViewingMember(myProfile);
        }}
      />

      {/* Official Platform Sub-header - Prestigious Bareskrim Theme */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-900/40 text-slate-300 text-xs py-1 px-4 sm:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-amber-400 font-extrabold tracking-wide">BATALYON WIRA SATYA 1996</span>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 hidden sm:inline font-medium">Sistem Informasi Alumni & Soliditas Bhayangkara #SelaluBahagia</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[10px] sm:text-[11px]">
            <span>Terhubung: <b className="text-slate-200">{members.length} Perwira</b></span>
            <span>&bull;</span>
            <span>38 Polda & Mabes Polri</span>
            {(currentUser.role === 'SUPERADMIN' || currentUser.role === 'SEKRETARIAT') && (
              <>
                <span className="hidden sm:inline">&bull;</span>
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="text-amber-300 hover:text-white font-bold transition-colors hidden sm:inline-flex items-center gap-1"
                >
                  + Manajemen User
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 pb-24 md:pb-6">
        {/* VIEWING SPECIFIC PROFILE (VIA NAVBAR SAYA / CONNECTION CARDS) */}
        {viewingMember ? (
          <LinkedInProfileView
            member={viewingMember}
            currentUser={currentUser}
            onClose={() => setViewingMember(null)}
            onEditProfile={(targetMember) => {
              handleStartEditMember(targetMember || viewingMember);
            }}
            onOpenChat={handleOpenChatWithMember}
            allMembers={members}
            onSelectMember={(m) => setViewingMember(m)}
          />
        ) : (
          <>
            {/* TAB 1: FEED BERANDA */}
            {activeTab === 'direktori' && (
              <BukuSaku
                members={members}
                onAddNew={handleAddNewMember}
                currentUser={currentUser}
                onEditMember={handleStartEditMember}
                onOpenChat={handleOpenChatWithMember}
                onNavigateToJabatan={() => setActiveTab('purnaTugas')}
                onNavigateToBendahara={() => setActiveTab('bendahara')}
                financeSummary={financeSummary}
                iuranList={iuranList}
                externalPosts={posts}
                onPostsChange={setPosts}
                externalSearch={navbarSearchQuery}
              />
            )}

            {/* TAB 2: RIWAYAT JABATAN & PENUGASAN LETING 96 */}
            {activeTab === 'purnaTugas' && (
              <LinkedInJobsPage
                currentUser={currentUser}
                members={members}
                onOpenFormWizard={() => handleStartEditMember(currentMemberProfile)}
                onSelectMember={(m) => setViewingMember(m)}
                onOpenChat={handleOpenChatWithMember}
                onUpdateMemberJabatan={handleUpdateMemberJabatan}
              />
            )}

            {/* TAB 4: PESAN & OBROLAN LETING (MESSAGING - USER SCREENSHOT 1) */}
            {activeTab === 'pesan' && (
              <LinkedInMessagingPage
                currentUser={currentUser}
                members={members}
                initialTargetMember={messagingTargetMember}
                onSelectMember={(m) => setViewingMember(m)}
              />
            )}

            {/* TAB 5: NOTIFIKASI ANGKATAN (NOTIFICATIONS - USER SCREENSHOT 4) */}
            {activeTab === 'notifikasi' && (
              <LinkedInNotificationsPage
                currentUser={currentUser}
                members={members}
                transactions={transactions}
                assets={assets}
                posts={posts}
                messages={messages}
                pendingVerificationCount={pendingVerificationCount}
                onNavigateToTab={(t) => {
                  setViewingMember(null);
                  setActiveTab(t as AppTab);
                }}
                onViewMyProfile={() => {
                  setViewingMember(getOrBuildUserProfile(currentUser, members));
                }}
                onSelectMember={(m) => setViewingMember(m)}
                onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
              />
            )}

            {/* TAB 6: DATA MANDIRI / PROFIL */}
            {activeTab === 'form' && (
              <FormWizard
                currentUser={currentUser}
                existingMember={
                  editingMember === 'NEW'
                    ? undefined
                    : editingMember !== null
                    ? editingMember
                    : currentMemberProfile
                }
                onSave={handleSaveMember}
                onCancel={() => {
                  setEditingMember(null);
                  setActiveTab('direktori');
                }}
              />
            )}

            {/* TAB 7: PORTAL KEBENDAHARAAN & PORTOFOLIO ASET */}
            {activeTab === 'bendahara' && (
              <BendaharaPortal
                currentUser={currentUser}
                members={members}
                financeSummary={financeSummary}
                transactions={transactions}
                assets={assets}
                iuranList={iuranList}
                onAddTransaction={handleAddTransaction}
                onPayIuran={handlePayIuran}
                onAddAsset={handleAddAsset}
                onDeleteAsset={handleDeleteAsset}
              />
            )}

            {/* TAB 8: EKSEKUTIF & KESEKRETARIATAN */}
            {activeTab === 'dashboard' && currentUser.role !== 'ANGGOTA' && (
              <ExecutiveDashboard
                members={members}
                currentUser={currentUser}
              />
            )}

            {/* TAB 9: PENGATURAN & PRIVASI (FIDO2 / PASSKEY / KEAMANAN) */}
            {activeTab === 'pengaturan' && (
              <LinkedInSettingsPage
                currentUser={currentUser}
                onClose={() => setActiveTab('direktori')}
                onNavigateToTab={(t) => {
                  setViewingMember(null);
                  setActiveTab(t as AppTab);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Manajemen Pengguna & Verifikasi Modal (Hanya Admin & Kesekretariatan) */}
      <AdminVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        adminName={currentUser.nama}
        onOpenFullWizard={handleAddNewMember}
        onEditMemberByNrp={(nrp) => {
          const found = members.find((m) => m.nrp === nrp);
          if (found) {
            handleStartEditMember(found);
          }
        }}
        onVerificationUpdate={() => {
          fetch('/api/auth/register')
            .then((res) => res.json())
            .then((data) => {
              if (data.success && Array.isArray(data.registrations)) {
                const count = data.registrations.filter((r: any) => r.status === 'PENDING_VERIFIKASI').length;
                setPendingVerificationCount(count);
              }
            })
            .catch(() => {});
          fetch('/api/members')
            .then((res) => res.json())
            .then((data) => {
              const list = data.members || data.data;
              if (data.success && Array.isArray(list)) {
                setMembers(list);
                localStorage.setItem('wirasatya96_members', JSON.stringify(list));
              }
            })
            .catch(() => {});
          fetch('/api/finance')
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.data) {
                if (data.data.iuranList) setIuranList(data.data.iuranList);
              }
            })
            .catch(() => {});
        }}
      />

      {/* Alumnus Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          fetch('/api/auth/register')
            .then((res) => res.json())
            .then((data) => {
              if (data.success && Array.isArray(data.registrations)) {
                const count = data.registrations.filter((r: any) => r.status === 'PENDING_VERIFIKASI').length;
                setPendingVerificationCount(count);
              }
            })
            .catch(() => {});
        }}
      />

      {/* LinkedIn Floating Messenger Dock at Bottom Right */}
      <LinkedInChatDock 
        members={members} 
        currentUserName={currentUser.nama} 
        currentUserNrp={currentUser.nrp} 
      />
    </div>
  );
}
