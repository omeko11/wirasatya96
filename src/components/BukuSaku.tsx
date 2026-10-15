'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AnggotaWiraSatya, AuthUser, FeedPost, PostComment, FinanceSummary, IuranAnggota, KasTransaction } from '@/types';
import { INITIAL_FEED_POSTS } from '@/data/mockPosts';
import { getAvatarUrl, getOrBuildUserProfile } from '@/lib/avatarUtils';
import { LinkedInProfileView } from './LinkedInProfileView';
import { LinkedInPostCard } from './LinkedInPostCard';
import { CreatePostModal } from './CreatePostModal';
import { MetaVerifiedBadge } from './MetaVerifiedBadge';
import {
  Phone,
  Heart,
  Image as ImageIcon,
  Wallet,
  Newspaper,
  Video,
  PenSquare,
  Briefcase,
  Search,
  ChevronRight,
  Info,
} from 'lucide-react';

interface BukuSakuProps {
  members: AnggotaWiraSatya[];
  onAddNew: () => void;
  currentUser: AuthUser;
  onEditMember?: (member: AnggotaWiraSatya) => void;
  onOpenChat?: (member: AnggotaWiraSatya) => void;
  onNavigateToJabatan?: () => void;
  onNavigateToBendahara?: () => void;
  onNavigateToUsers?: () => void;
  financeSummary?: FinanceSummary;
  transactions?: KasTransaction[];
  iuranList?: IuranAnggota[];
  externalPosts?: FeedPost[];
  onPostsChange?: (posts: FeedPost[]) => void;
  externalSearch?: string;
  impersonatorUser?: AuthUser | null;
  onStopImpersonating?: () => void;
  onImpersonateUser?: (user: AuthUser) => void;
}

export const BukuSaku: React.FC<BukuSakuProps> = ({
  members,
  currentUser,
  onEditMember,
  onOpenChat,
  onNavigateToJabatan,
  onNavigateToBendahara,
  financeSummary,
  transactions = [],
  iuranList = [],
  externalPosts,
  onPostsChange,
  externalSearch = '',
}) => {
  const [selectedMember, setSelectedMember] = useState<AnggotaWiraSatya | null>(null);

  // Cashflow & Aset widget state fetched from /api/finance
  const [apiKasMasuk, setApiKasMasuk] = useState<number | null>(null);
  const [apiKasKeluar, setApiKasKeluar] = useState<number | null>(null);
  const [apiSaldoKas, setApiSaldoKas] = useState<number | null>(null);
  const [apiNilaiAset, setApiNilaiAset] = useState<number | null>(null);
  const [iuranWajibPerBulan, setIuranWajibPerBulan] = useState<number>(250000);

  useEffect(() => {
    let mounted = true;
    fetch('/api/finance')
      .then((res) => res.json())
      .then((res) => {
        if (!mounted || !res) return;
        const payload = res.data || res;
        if (typeof payload.totalKasMasuk === 'number') {
          setApiKasMasuk(payload.totalKasMasuk);
        } else if (Array.isArray(payload.transactions)) {
          const inflow = payload.transactions
            .filter((t: KasTransaction) => t.jenis === 'MASUK')
            .reduce((s: number, t: KasTransaction) => s + (Number(t.nominal) || 0), 0);
          setApiKasMasuk(inflow);
        }

        if (typeof payload.totalKasKeluar === 'number') {
          setApiKasKeluar(payload.totalKasKeluar);
        } else if (Array.isArray(payload.transactions)) {
          const outflow = payload.transactions
            .filter((t: KasTransaction) => t.jenis === 'KELUAR')
            .reduce((s: number, t: KasTransaction) => s + (Number(t.nominal) || 0), 0);
          setApiKasKeluar(outflow);
        }

        if (payload.summary?.saldoUtama !== undefined) {
          setApiSaldoKas(payload.summary.saldoUtama);
        }
        if (payload.summary?.totalValuasiAset !== undefined) {
          setApiNilaiAset(payload.summary.totalValuasiAset);
        } else if (typeof payload.totalValuasiAset === 'number') {
          setApiNilaiAset(payload.totalValuasiAset);
        }

        const cfgIuran =
          payload.financeConfig?.iuranWajibPerBulan ??
          res.financeConfig?.iuranWajibPerBulan ??
          payload.summary?.iuranWajibPerBulan;
        if (typeof cfgIuran === 'number' && cfgIuran > 0) {
          setIuranWajibPerBulan(cfgIuran);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [financeSummary, transactions.length]);

  const computedKasMasuk = useMemo(() => {
    if (transactions.length > 0) {
      return transactions
        .filter((t) => t.jenis === 'MASUK')
        .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
    }
    if (apiKasMasuk !== null) return apiKasMasuk;
    return financeSummary?.totalPemasukanBulanIni || 0;
  }, [transactions, apiKasMasuk, financeSummary]);

  const computedKasKeluar = useMemo(() => {
    if (transactions.length > 0) {
      return transactions
        .filter((t) => t.jenis === 'KELUAR')
        .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
    }
    if (apiKasKeluar !== null) return apiKasKeluar;
    return Math.abs(financeSummary?.totalPengeluaranBulanIni || 0);
  }, [transactions, apiKasKeluar, financeSummary]);

  const displaySaldoKas = financeSummary?.saldoUtama ?? apiSaldoKas ?? 0;
  const displayNilaiAset = financeSummary?.totalValuasiAset ?? apiNilaiAset ?? 0;

  // Social Feed States
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    if (externalPosts && externalPosts.length > 0) return externalPosts;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wirasatya96_feed_posts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: FeedPost) => ({
              ...p,
              authorAvatar: getAvatarUrl(p.authorAvatar),
            }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_FEED_POSTS;
  });

  useEffect(() => {
    if (externalPosts && externalPosts.length > 0) {
      setPosts(externalPosts);
    }
  }, [externalPosts]);

  const [feedCategoryFilter, setFeedCategoryFilter] = useState<string>('SEMUA');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [memberOverrides, setMemberOverrides] = useState<Record<string, AnggotaWiraSatya>>({});

  const effectiveMembers = useMemo(
    () => members.map((m) => memberOverrides[m.nrp] || memberOverrides[m.id] || m),
    [members, memberOverrides]
  );

  // Public directory members (hide Superadmin 98010710 from non-Superadmin viewers)
  const publicMembers = useMemo(
    () =>
      effectiveMembers.filter(
        (m) =>
          m.nrp !== '98010710' ||
          currentUser?.nrp === '98010710' ||
          currentUser?.role === 'SUPERADMIN'
      ),
    [effectiveMembers, currentUser?.nrp, currentUser?.role]
  );

  // Current logged in member profile
  const currentMemberObj = useMemo(
    () => getOrBuildUserProfile(currentUser, effectiveMembers),
    [currentUser, effectiveMembers]
  );

  // Current logged in member's Iuran 2026 status
  const myIuran = useMemo(
    () => iuranList.find((i) => i.nrp === currentUser.nrp),
    [iuranList, currentUser.nrp]
  );

  const syncPosts = (updated: FeedPost[]) => {
    setPosts(updated);
    if (onPostsChange) onPostsChange(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_feed_posts', JSON.stringify(updated));
    }
  };

  // Feed Actions (Persisted to /api/posts)
  const handleCreatePost = async (
    newPostData: Omit<FeedPost, 'id' | 'createdAt' | 'likesCount' | 'repostsCount' | 'comments'>
  ) => {
    const newPost: FeedPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: 'Baru saja',
      likesCount: 0,
      isLiked: false,
      repostsCount: 0,
      isReposted: false,
      impressionsCount: 1,
      comments: [],
    };
    const updated = [newPost, ...posts];
    syncPosts(updated);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', ...newPostData }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        syncPosts(data.posts);
      }
    } catch {
      // fallback to local state
    }
  };

  const handleLikeToggle = async (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextIsLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextIsLiked,
          likesCount: nextIsLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
        };
      }
      return p;
    });
    syncPosts(updated);

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LIKE', postId }),
      });
    } catch {
      // ignore
    }
  };

  const handleRepost = async (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextIsReposted = !p.isReposted;
        return {
          ...p,
          isReposted: nextIsReposted,
          repostsCount: nextIsReposted ? p.repostsCount + 1 : Math.max(0, p.repostsCount - 1),
        };
      }
      return p;
    });
    syncPosts(updated);

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REPOST', postId }),
      });
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      authorName: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
      authorPangkat: currentUser.pangkat,
      authorAvatar: getAvatarUrl(currentMemberObj?.fotoUrl || currentUser.fotoUrl),
      authorNrp: currentUser.nrp,
      content: commentText,
      createdAt: 'Baru saja',
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });
    syncPosts(updated);

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COMMENT',
          postId,
          authorName: newComment.authorName,
          authorPangkat: newComment.authorPangkat,
          authorAvatar: newComment.authorAvatar,
          authorNrp: newComment.authorNrp,
          content: commentText,
        }),
      });
    } catch {
      // ignore
    }
  };

  const handleAuthorClick = (authorNrp?: string) => {
    if (!authorNrp) return;
    if (authorNrp === currentUser.nrp) {
      setSelectedMember(getOrBuildUserProfile(currentUser, members));
      return;
    }
    const found = members.find((m) => m.nrp === authorNrp);
    if (found) setSelectedMember(found);
  };

  const filteredPosts = useMemo(() => {
    if (feedCategoryFilter === 'SEMUA') return posts;
    return posts.filter((p) => p.category === feedCategoryFilter);
  }, [posts, feedCategoryFilter]);

  // Quick search results when user types in top navbar search
  const quickSearchResults = useMemo(() => {
    const q = externalSearch.trim().toLowerCase();
    if (!q) return [];
    return publicMembers
      .filter(
        (m) =>
          m.namaLengkap.toLowerCase().includes(q) ||
          m.nrp.includes(q) ||
          m.jabatanTerakhir.toLowerCase().includes(q) ||
          m.satuanKerja.toLowerCase().includes(q) ||
          m.polda.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [publicMembers, externalSearch]);

  const formatWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Portal%20Alumni%20Akpol%201996%20Wira%20Satya`;
  };

  const formatRupiah = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Find members needing health attention
  const healthAttentionMembers = useMemo(() => {
    return publicMembers
      .filter(
        (m) =>
          m.adaPenyakitKronis === 'ADA' ||
          (m.daftarPenyakit && m.daftarPenyakit.length > 0) ||
          m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' ||
          m.kondisiKesehatan === 'SAKIT'
      )
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = {
          'PERLU PERHATIAN KHUSUS': 1,
          SAKIT: 2,
          CUKUP: 3,
          BAIK: 4,
          'SANGAT BAIK': 5,
        };
        const pA = priorityOrder[a.kondisiKesehatan] || 99;
        const pB = priorityOrder[b.kondisiKesehatan] || 99;
        return pA - pB;
      });
  }, [publicMembers]);

  if (selectedMember) {
    const extraProfileProps = {
      memberRole: selectedMember.nrp === currentUser?.nrp ? currentUser?.role : undefined,
      onUpdateMemberDirect: async (updated: AnggotaWiraSatya) => {
        setMemberOverrides((prev) => ({
          ...prev,
          [updated.nrp]: updated,
          [updated.id]: updated,
        }));
        setSelectedMember(updated);
      },
    };
    return (
      <LinkedInProfileView
        member={selectedMember}
        currentUser={currentUser}
        onClose={() => setSelectedMember(null)}
        onEditProfile={() => onEditMember && onEditMember(selectedMember)}
        onOpenChat={onOpenChat}
        allMembers={publicMembers}
        onSelectMember={(m) => setSelectedMember(m)}
        {...(extraProfileProps as Record<string, unknown>)}
      />
    );
  }

  const miniCardCoverUrl = currentMemberObj?.coverUrl || currentUser?.coverUrl;

  return (
    <div className="font-sans text-slate-900 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================ */}
        {/* 1. LEFT RAIL (lg:col-span-3): PROFILE SNAPSHOT               */}
        {/* ============================================================ */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4">
          {/* User Mini Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-center">
            <div className="h-16 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 relative overflow-hidden">
              {miniCardCoverUrl !== 'none' && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={miniCardCoverUrl || '/default-cover.jpg'}
                  alt="Sampul Polri"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="px-4 pb-4 relative">
              <div
                onClick={() => setSelectedMember(currentMemberObj)}
                className="w-16 h-16 rounded-full border-2 border-white shadow-md mx-auto -mt-8 overflow-hidden bg-white cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatarUrl(currentMemberObj?.fotoUrl || currentUser.fotoUrl)}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <h3
                onClick={() => setSelectedMember(currentMemberObj)}
                className="text-sm font-bold text-slate-900 hover:text-red-900 cursor-pointer mt-2 leading-tight flex items-center justify-center gap-1"
              >
                <span className="truncate">
                  {(currentMemberObj?.namaLengkap || currentUser.nama).replace(/\(.*?\)/g, '').trim()}
                </span>
                <MetaVerifiedBadge role={currentUser?.role} nrp={currentUser?.nrp} size="md" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser.nrp === '98010710' || currentUser.role === 'SUPERADMIN'
                  ? `${currentUser.pangkat || 'Briptu'} • ${currentMemberObj?.jabatanTerakhir || 'Lead Developer — Bareskrim Polri'}`
                  : `${currentUser.pangkat} • Alumni Akpol 1996`}
              </p>

              {/* Metrics */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Rekan Letting:</span>
                  <span className="font-bold text-red-900">{publicMembers.length} Perwira</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Satker / Wilayah:</span>
                  <span className="font-bold text-slate-700 truncate max-w-[130px]">
                    {currentUser.polda || 'MABES POLRI'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Hak Akses:</span>
                  <span className="font-bold text-slate-900">
                    {currentUser.role === 'SEKRETARIAT' ? 'Sekretaris' : currentUser.role}
                  </span>
                </div>
                {myIuran && (
                  <div
                    onClick={() => onNavigateToBendahara && onNavigateToBendahara()}
                    className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100 cursor-pointer hover:text-slate-800"
                    title="Klik untuk melihat rincian di menu Arus Kas"
                  >
                    <span>Iuran 2026 Saya:</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        myIuran.status === 'LUNAS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : myIuran.status === 'SEBAGIAN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {myIuran.status}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedMember(currentMemberObj)}
                className="w-full mt-3 py-1.5 px-3 rounded-lg border border-red-800 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors"
              >
                Lihat Profil Saya
              </button>

              {onNavigateToJabatan && (
                <button
                  onClick={onNavigateToJabatan}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5 text-red-800" />
                  <span>Lihat Daftar Jabatan ({publicMembers.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-300/40 text-center">
            <span className="text-[11px] font-extrabold text-amber-900 tracking-wider">
              #SELALUBAHAGIA
            </span>
            <p className="text-[10px] text-amber-800 mt-0.5">
              Guyub, Peduli, &amp; Mengabdi Sejak 1996
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CENTER FEED (lg:col-span-6): MURNI FEED BERANDA           */}
        {/* ============================================================ */}
        <div className="order-1 lg:order-2 lg:col-span-6 space-y-4">
          {/* Quick Search Results if user typed in Navbar Search */}
          {externalSearch.trim() !== '' && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-red-800" />
                  Hasil Pencarian Cepat: &ldquo;{externalSearch}&rdquo;
                </span>
                {onNavigateToJabatan && (
                  <button
                    onClick={onNavigateToJabatan}
                    className="text-red-800 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Buka Menu Jabatan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {quickSearchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {quickSearchResults.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="py-2 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getAvatarUrl(m.fotoUrl)}
                          alt={m.namaLengkap}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                            <span className="truncate">{m.namaLengkap}</span>
                            <MetaVerifiedBadge nrp={m.nrp} size="sm" />
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {m.pangkat} &bull; NRP {m.nrp} &bull; {m.jabatanTerakhir}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded flex-shrink-0">
                        Lihat Profil
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2">
                  Tidak ditemukan perwira dengan kata kunci tersebut.
                </p>
              )}
            </div>
          )}

          {/* Post/Update Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarUrl(currentMemberObj?.fotoUrl || currentUser.fotoUrl)}
                alt={currentUser.nama}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0 bg-white"
              />
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 rounded-full text-left text-xs text-slate-500 font-medium transition-colors border border-slate-200 hover:text-slate-800"
              >
                Mulai buat posting atau bagikan kabar leting...
              </button>
            </div>

            <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600 px-1 sm:px-2">
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center gap-2 hover:text-red-900 transition-colors p-1"
              >
                <ImageIcon className="w-4 h-4 text-red-800" />
                <span>Foto</span>
              </button>
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center gap-2 hover:text-emerald-600 transition-colors p-1"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>Video</span>
              </button>
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center gap-2 hover:text-amber-600 transition-colors p-1"
              >
                <PenSquare className="w-4 h-4 text-amber-600" />
                <span>Tulis Artikel</span>
              </button>
            </div>
          </div>

          {/* Feed Header & Category Filter Chips */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Newspaper className="w-4 h-4 text-red-800" />
                <span>Linimasa ({filteredPosts.length})</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {[
                  { key: 'SEMUA', label: 'Semua' },
                  { key: 'MOTIVASI', label: 'Motivasi' },
                  { key: 'KENAIKAN_PANGKAT', label: 'Kenaikan Pangkat' },
                  { key: 'BAKSOS', label: 'Baksos' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setFeedCategoryFilter(cat.key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                      feedCategoryFilter === cat.key
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Posts List */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <LinkedInPostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLikeToggle={handleLikeToggle}
                    onRepost={handleRepost}
                    onAddComment={handleAddComment}
                    onAuthorClick={handleAuthorClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
                <p className="text-slate-600 text-xs">Belum ada postingan pada kategori ini.</p>
                <button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="text-xs font-bold text-red-900 hover:underline"
                >
                  + Buat Postingan Baru
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. RIGHT RAIL (lg:col-span-3): ATENSI KESEHATAN & TREASURY   */}
        {/* ============================================================ */}
        <div className="order-3 lg:order-3 lg:col-span-3 space-y-4">
          {/* Widget 1: Atensi Rekan Sakit */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                Atensi Kesehatan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold border border-red-200">
                {healthAttentionMembers.filter(
                  (m) => m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT'
                ).length || healthAttentionMembers.length}{' '}
                Prioritas
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Program kepedulian bagi rekan yang memerlukan doa, atensi medis, dan bantuan:
            </p>

            {healthAttentionMembers.length > 0 ? (
              <div className="space-y-2.5">
                {healthAttentionMembers.map((m) => {
                  const isUrgent =
                    m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT';
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isUrgent ? 'bg-red-50/70 border-red-200/90 shadow-sm' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          onClick={() => setSelectedMember(m)}
                          className="text-xs font-bold text-slate-900 hover:text-red-900 cursor-pointer truncate max-w-[140px] flex items-center gap-1"
                          title={m.namaLengkap}
                        >
                          <span className="truncate">{m.namaLengkap.split(',')[0]}</span>
                          <MetaVerifiedBadge nrp={m.nrp} size="xs" />
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${
                            isUrgent ? 'bg-red-600 text-white shadow-sm' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                          {isUrgent ? 'ATENSI KHUSUS' : 'TERPANTAU'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-600 line-clamp-2">
                        <span className="text-slate-500 font-semibold">Diagnosa: </span>
                        <b>{(m.daftarPenyakit || []).join(', ') || 'Dalam Pemulihan'}</b>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200/60">
                        <a
                          href={formatWaUrl(m.noHp)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Kirim Doa &amp; Semangat
                        </a>
                        <button
                          onClick={() => setSelectedMember(m)}
                          className="text-[10px] font-bold text-red-900 hover:underline"
                        >
                          Detail Medis →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                Tidak ada rekan yang membutuhkan atensi medis khusus.
              </div>
            )}
          </div>

          {/* Widget 2: Status Kas & Aset (Cashflow & Aset Summary) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kas &amp; Aset</span>
                <span title="Ringkasan saldo kas tunai, arus kas masuk/keluar, dan portofolio aset">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">2026</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Saldo Kas Tunai:</span>
                <span className="font-bold text-slate-900">{formatRupiah(displaySaldoKas)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kas Masuk (Inflow):</span>
                <span className="font-bold text-emerald-700">+ {formatRupiah(computedKasMasuk)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kas Keluar (Outflow):</span>
                <span className="font-bold text-red-700">- {formatRupiah(computedKasKeluar)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nilai Aset Berharga:</span>
                <span className="font-bold text-blue-700">{formatRupiah(displayNilaiAset)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Iuran Wajib / Bulan:</span>
                <span className="font-bold text-slate-800">
                  Rp {(iuranWajibPerBulan || 250000).toLocaleString('id-ID')} / Perwira
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              {onNavigateToBendahara && (
                <button
                  onClick={onNavigateToBendahara}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors"
                >
                  Detail Arus Kas →
                </button>
              )}
              <span
                className="text-[11px] text-slate-400 flex items-center justify-center gap-1"
                title="Pencatatan kas masuk, kas keluar, iuran wajib, dan portofolio aset dikelola secara transparan oleh Bendahara Batalyon Wira Satya 96."
              >
                <span>Dikelola oleh Bendahara</span>
                <Info className="w-3 h-3 text-slate-400 inline" />
              </span>
            </div>
          </div>

          {/* Widget 3: Tour of Duty (TOD) Ringkas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-red-800" />
                <span className="sm:hidden">TOD</span>
                <span className="hidden sm:inline">Tour of Duty</span>
                <span title="Sebaran penempatan personel aktif di Mabes Polri, 38 Polda, dan Luar Struktur">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </span>
              <span className="text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-full">
                {publicMembers.length} Perwira
              </span>
            </div>
            {onNavigateToJabatan && (
              <button
                onClick={onNavigateToJabatan}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-colors"
              >
                Lihat Direktori →
              </button>
            )}
          </div>

          {/* Widget 4: Info Footer */}
          <div className="text-[11px] text-slate-400 text-center space-y-1 p-2">
            <p className="font-bold text-slate-600">BATALYON WIRA SATYA 1996</p>
            <p>Akademi Kepolisian Republik Indonesia</p>
            <p className="text-[10px]">Portal Internal Alumni &copy; 2026</p>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        currentUser={currentUser}
        onSubmitPost={handleCreatePost}
      />
    </div>
  );
};
