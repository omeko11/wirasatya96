'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const STORAGE_VERSION = 'ws96_akpol96_real_v10';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AppTab>('direktori');
  const [members, setMembers] = useState<AnggotaWiraSatya[]>(INITIAL_MEMBERS);
  const [currentUser, setCurrentUser] = useState<AuthUser>(PRESET_USERS[0]); // Default Superadmin
  const [impersonatorUser, setImpersonatorUser] = useState<AuthUser | null>(null);
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

  // Helper to refresh pending verification count & synced data
  const fetchPendingVerificationCount = useCallback(() => {
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
  }, []);

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

    // Load Impersonator User if Superadmin is currently impersonating someone
    const savedImpersonator = localStorage.getItem('ws96_impersonator_user');
    if (savedImpersonator) {
      try {
        const parsedImp = JSON.parse(savedImpersonator);
        if (parsedImp && parsedImp.nrp) {
          setImpersonatorUser({
            ...parsedImp,
            fotoUrl: getAvatarUrl(parsedImp.fotoUrl),
          });
        }
      } catch (err) {
        console.error('Failed to parse impersonator session', err);
      }
    }

    // Load User and sanitize any legacy Unsplash avatar URL
    const savedUser =
      localStorage.getItem('ws96_auth_user') ||
      localStorage.getItem('ws96_active_user') ||
      localStorage.getItem('wirasatya96_current_user');
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
          localStorage.setItem('ws96_auth_user', JSON.stringify(sanitizedUser));
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

    fetchPendingVerificationCount();

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
  }, [fetchPendingVerificationCount]);

  // Superadmin Impersonate User handler
  const handleImpersonateUser = (targetUser: AuthUser) => {
    const sanitizedTarget: AuthUser = {
      ...targetUser,
      fotoUrl: getAvatarUrl(targetUser.fotoUrl),
    };
    if (!impersonatorUser) {
      setImpersonatorUser(currentUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ws96_impersonator_user', JSON.stringify(currentUser));
      }
    }
    setCurrentUser(sanitizedTarget);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ws96_auth_user', JSON.stringify(sanitizedTarget));
      localStorage.setItem('ws96_active_user', JSON.stringify(sanitizedTarget));
      localStorage.setItem('wirasatya96_current_user', JSON.stringify(sanitizedTarget));
    }
    setViewingMember(null);
    setEditingMember(null);
    setIsVerificationModalOpen(false);
    setActiveTab('direktori');

    fetch(`/api/messages?userNrp=${encodeURIComponent(sanitizedTarget.nrp)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  };

  // Stop Impersonating and restore Superadmin session
  const handleStopImpersonating = () => {
    if (!impersonatorUser) return;
    const restoredUser: AuthUser = {
      ...impersonatorUser,
      fotoUrl: getAvatarUrl(impersonatorUser.fotoUrl),
    };
    setCurrentUser(restoredUser);
    setImpersonatorUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ws96_impersonator_user');
      localStorage.setItem('ws96_auth_user', JSON.stringify(restoredUser));
      localStorage.setItem('ws96_active_user', JSON.stringify(restoredUser));
      localStorage.setItem('wirasatya96_current_user', JSON.stringify(restoredUser));
    }
    setViewingMember(null);
    fetchPendingVerificationCount();
    fetch(`/api/messages?userNrp=${encodeURIComponent(restoredUser.nrp)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  };

  // Start editing a specific member (Admin/Sekretaris or self)
  const handleStartEditMember = (member: AnggotaWiraSatya) => {
    if (!['SUPERADMIN', 'SEKRETARIAT'].includes(currentUser.role) && member.nrp !== currentUser.nrp) {
      return;
    }
    setViewingMember(null);
    setEditingMember(member);
    setActiveTab('form');
  };

  // Add a new member (Strictly Admin & Sekretaris only)
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
        localStorage.setItem('ws96_auth_user', JSON.stringify(updatedUser));
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

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('ws96_auth_user');
    localStorage.removeItem('ws96_active_user');
    localStorage.removeItem('wirasatya96_current_user');
    localStorage.removeItem('ws96_impersonator_user');
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

  // Synchronized live notifications for the top running-text ticker
  const liveTickerNotifications = React.useMemo(() => {
    const items: { id: string; badge: string; text: string; onClick: () => void }[] = [];

    // 1. Pending Verification Alert for Admin & Sekretaris
    if (
      (currentUser.role === 'SUPERADMIN' || currentUser.role === 'SEKRETARIAT') &&
      pendingVerificationCount > 0
    ) {
      items.push({
        id: `ticker-verif-${pendingVerificationCount}`,
        badge: '[Verifikasi User]',
        text: `${pendingVerificationCount} pendaftar baru menunggu persetujuan di menu User`,
        onClick: () => {
          setViewingMember(null);
          setActiveTab('users');
        },
      });
    }

    // 2. Incoming Direct Messages
    const incomingMsgs = messages
      .filter((m) => m.receiverNrp === currentUser.nrp)
      .slice(-3)
      .reverse();
    incomingMsgs.forEach((msg) => {
      items.push({
        id: `ticker-msg-${msg.id}`,
        badge: `[Pesan Masuk • ${msg.senderName}]`,
        text: `"${msg.text}"`,
        onClick: () => {
          setViewingMember(null);
          setActiveTab('pesan');
        },
      });
    });

    // 3. Health Attention Alerts
    const healthMembers = members.filter(
      (m) =>
        m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' ||
        m.kondisiKesehatan === 'SAKIT' ||
        m.adaPenyakitKronis === 'ADA' ||
        (m.daftarPenyakit && m.daftarPenyakit.length > 0)
    );
    healthMembers.forEach((m) => {
      const diagnosa =
        m.daftarPenyakit && m.daftarPenyakit.length > 0
          ? m.daftarPenyakit.join(', ')
          : m.kondisiKesehatan;
      items.push({
        id: `ticker-health-${m.nrp}`,
        badge: '[Atensi Kesehatan]',
        text: `${m.namaLengkap} (${m.polda}) — ${diagnosa}`,
        onClick: () => {
          setViewingMember(null);
          setActiveTab('notifikasi');
        },
      });
    });

    // 4. Recent Treasury Cashflow Transactions
    transactions.slice(0, 4).forEach((trx) => {
      const rp = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(trx.nominal || 0);
      items.push({
        id: `ticker-trx-${trx.id}`,
        badge: trx.jenis === 'MASUK' ? '[Kas Masuk]' : '[Kas Keluar]',
        text: `${rp} — ${trx.keterangan} (${trx.tanggal})`,
        onClick: () => {
          setViewingMember(null);
          setActiveTab('bendahara');
        },
      });
    });

    // 5. Recent Portfolio Assets
    assets.slice(0, 2).forEach((ast) => {
      items.push({
        id: `ticker-ast-${ast.id}`,
        badge: '[Portofolio Aset]',
        text: `${ast.namaAset} (${ast.jumlahUnit} ${ast.satuan})`,
        onClick: () => {
          setViewingMember(null);
          setActiveTab('bendahara');
        },
      });
    });

    // 6. Recent Feed Posts
    posts.slice(0, 3).forEach((post) => {
      const snippet = post.content.length > 70 ? `${post.content.slice(0, 70)}...` : post.content;
      items.push({
        id: `ticker-post-${post.id}`,
        badge: `[Linimasa • ${post.authorName}]`,
        text: snippet,
        onClick: () => {
          setViewingMember(null);
          setActiveTab('direktori');
        },
      });
    });

    if (items.length === 0) {
      items.push({
        id: 'ticker-empty',
        badge: '[Notifikasi]',
        text: 'Belum ada notifikasi baru saat ini — Klik untuk membuka pusat Notifikasi',
        onClick: () => {
          setViewingMember(null);
          setActiveTab('notifikasi');
        },
      });
    }

    return items;
  }, [
    currentUser.role,
    currentUser.nrp,
    pendingVerificationCount,
    messages,
    members,
    transactions,
    assets,
    posts,
  ]);

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
        onOpenVerificationModal={() => {
          setViewingMember(null);
          setActiveTab('users');
        }}
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
        impersonatorUser={impersonatorUser}
        onStopImpersonating={handleStopImpersonating}
      />

      {/* Top Red Ribbon: [Green Lamp Beacon] Online | Running Text Notifikasi */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-900/40 text-slate-200 text-xs py-1.5 px-3 sm:px-6 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 text-[11px]">
          {/* Left: Green Lamp Beacon + Online */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </span>
            <span className="text-emerald-400 font-extrabold tracking-wide">Online</span>
          </div>

          {/* Divider | */}
          <span className="text-red-400/50 font-bold shrink-0 select-none">|</span>

          {/* Right: Synchronized Notification Running Text */}
          <div className="flex-1 overflow-hidden relative">
            <div className="ws96-marquee items-center gap-8 whitespace-nowrap">
              {[...liveTickerNotifications, ...liveTickerNotifications].map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={item.onClick}
                  className="inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
                  title="Klik untuk membuka detail notifikasi"
                >
                  <span className="font-bold text-amber-300">{item.badge}</span>
                  <span>{item.text}</span>
                  <span className="text-red-400/50 mx-3 select-none">&bull;</span>
                </button>
              ))}
            </div>
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
            memberRole={viewingMember.nrp === currentUser.nrp ? currentUser.role : undefined}
            onClose={() => setViewingMember(null)}
            onEditProfile={(targetMember) => {
              handleStartEditMember(targetMember || viewingMember);
            }}
            onOpenChat={handleOpenChatWithMember}
            allMembers={members}
            onSelectMember={(m) => setViewingMember(m)}
            onUpdateMemberDirect={(updated) => {
              setMembers((prev) =>
                prev.map((m) => (m.nrp === updated.nrp || m.id === updated.id ? updated : m))
              );
              setViewingMember(updated);
              if (updated.nrp === currentUser.nrp) {
                const nextUser: AuthUser = {
                  ...currentUser,
                  nama: updated.namaLengkap,
                  pangkat: updated.pangkat,
                  fotoUrl: updated.fotoUrl,
                  coverUrl: updated.coverUrl,
                  bio: updated.bio,
                };
                setCurrentUser(nextUser);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('ws96_auth_user', JSON.stringify(nextUser));
                  localStorage.setItem('ws96_active_user', JSON.stringify(nextUser));
                  localStorage.setItem('wirasatya96_current_user', JSON.stringify(nextUser));
                }
              }
            }}
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
                onNavigateToUsers={() => setActiveTab('users')}
                financeSummary={financeSummary}
                transactions={transactions}
                iuranList={iuranList}
                externalPosts={posts}
                onPostsChange={setPosts}
                externalSearch={navbarSearchQuery}
                impersonatorUser={impersonatorUser}
                onStopImpersonating={handleStopImpersonating}
                onImpersonateUser={handleImpersonateUser}
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

            {/* TAB 4: PESAN & OBROLAN LETING (MESSAGING) */}
            {activeTab === 'pesan' && (
              <LinkedInMessagingPage
                currentUser={currentUser}
                members={members}
                initialTargetMember={messagingTargetMember}
                onSelectMember={(m) => setViewingMember(m)}
              />
            )}

            {/* TAB 5: NOTIFIKASI ANGKATAN (NOTIFICATIONS) */}
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
                onOpenVerificationModal={() => {
                  setViewingMember(null);
                  setActiveTab('users');
                }}
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

            {/* TAB 8: EKSEKUTIF & SEKRETARIS */}
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

            {/* TAB 10: MANAJEMEN USER (FULL-PAGE VIEW) */}
            {activeTab === 'users' && (
              <AdminVerificationModal
                isOpen={true}
                asPage={true}
                onClose={() => setActiveTab('direktori')}
                adminName={currentUser.nama}
                currentUserRole={currentUser?.role}
                currentUserNrp={currentUser?.nrp}
                onImpersonateUser={handleImpersonateUser}
                onOpenFullWizard={handleAddNewMember}
                onEditMemberByNrp={(nrp) => {
                  const found = members.find((m) => m.nrp === nrp);
                  if (found) {
                    handleStartEditMember(found);
                  }
                }}
                onVerificationUpdate={fetchPendingVerificationCount}
              />
            )}
          </>
        )}
      </main>

      {/* Manajemen Pengguna & Verifikasi Modal (Fallback if opened as modal) */}
      <AdminVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        adminName={currentUser.nama}
        currentUserRole={currentUser?.role}
        currentUserNrp={currentUser?.nrp}
        onImpersonateUser={handleImpersonateUser}
        onOpenFullWizard={handleAddNewMember}
        onEditMemberByNrp={(nrp) => {
          const found = members.find((m) => m.nrp === nrp);
          if (found) {
            handleStartEditMember(found);
          }
        }}
        onVerificationUpdate={fetchPendingVerificationCount}
      />

      {/* Alumnus Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={fetchPendingVerificationCount}
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
