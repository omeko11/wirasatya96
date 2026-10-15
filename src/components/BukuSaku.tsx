'use client';

import React, { useState, useMemo } from 'react';
import { AnggotaWiraSatya, AuthUser, DAFTAR_PANGKAT_POLRI, FeedPost, PostComment } from '@/types';
import { DAFTAR_38_POLDA } from '@/data/polriStructure';
import { INITIAL_FEED_POSTS } from '@/data/mockPosts';
import { LinkedInProfileView } from './LinkedInProfileView';
import { LinkedInPostCard } from './LinkedInPostCard';
import { CreatePostModal } from './CreatePostModal';
import { 
  Search, 
  Phone, 
  Shield, 
  Heart, 
  Filter, 
  UserPlus, 
  Image as ImageIcon, 
  Wallet,
  Newspaper,
  Users,
  Video,
  PenSquare,
  Edit3,
  MessageSquare
} from 'lucide-react';

interface BukuSakuProps {
  members: AnggotaWiraSatya[];
  onAddNew: () => void;
  currentUser: AuthUser;
  onEditMember?: (member: AnggotaWiraSatya) => void;
  onOpenChat?: (member: AnggotaWiraSatya) => void;
  externalSearch?: string;
}

export const BukuSaku: React.FC<BukuSakuProps> = ({ 
  members, 
  onAddNew, 
  currentUser,
  onEditMember,
  onOpenChat,
  externalSearch = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolda, setSelectedPolda] = useState<string>('SEMUA');
  const [selectedPangkat, setSelectedPangkat] = useState<string>('SEMUA');
  const [selectedMember, setSelectedMember] = useState<AnggotaWiraSatya | null>(null);

  // Social Feed States (LinkedIn Feed System)
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wirasatya96_feed_posts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_FEED_POSTS;
  });

  const [activeCenterTab, setActiveCenterTab] = useState<'feed' | 'direktori'>('feed');
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<string>('SEMUA');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Feed Actions
  const handleCreatePost = (newPostData: Omit<FeedPost, 'id' | 'createdAt' | 'likesCount' | 'repostsCount' | 'comments'>) => {
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
    setPosts(updated);
    setActiveCenterTab('feed');
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_feed_posts', JSON.stringify(updated));
    }
  };

  const handleLikeToggle = (postId: string) => {
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
    setPosts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_feed_posts', JSON.stringify(updated));
    }
  };

  const handleRepost = (postId: string) => {
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
    setPosts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_feed_posts', JSON.stringify(updated));
    }
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      authorName: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
      authorPangkat: currentUser.pangkat,
      authorAvatar: currentMemberObj?.fotoUrl || currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
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
    setPosts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_feed_posts', JSON.stringify(updated));
    }
  };

  const handleAuthorClick = (authorNrp?: string) => {
    if (!authorNrp) return;
    const found = members.find((m) => m.nrp === authorNrp);
    if (found) setSelectedMember(found);
  };

  const filteredPosts = useMemo(() => {
    if (feedCategoryFilter === 'SEMUA') return posts;
    return posts.filter((p) => p.category === feedCategoryFilter);
  }, [posts, feedCategoryFilter]);

  // Sync external search from navbar
  const activeSearch = externalSearch || searchTerm;

  // Extract unique Poldas for filter
  const poldaList = useMemo(() => {
    const existingPoldas = Array.from(new Set(members.map((m) => m.polda))).filter(Boolean);
    const remainingPoldas = DAFTAR_38_POLDA.filter(
      (p) => !existingPoldas.some((ep) => ep.toUpperCase() === p.toUpperCase())
    );
    return ['SEMUA', ...existingPoldas, ...remainingPoldas];
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const search = activeSearch.toLowerCase();
      const matchSearch =
        m.namaLengkap.toLowerCase().includes(search) ||
        m.nrp.includes(activeSearch) ||
        m.jabatanTerakhir.toLowerCase().includes(search) ||
        m.satuanKerja.toLowerCase().includes(search) ||
        (m.subSatker && m.subSatker.toLowerCase().includes(search)) ||
        (m.satkerMabes && m.satkerMabes.toLowerCase().includes(search)) ||
        (m.namaPolres && m.namaPolres.toLowerCase().includes(search)) ||
        (m.namaPolsek && m.namaPolsek.toLowerCase().includes(search));

      const matchPolda = 
        selectedPolda === 'SEMUA' || 
        m.polda.toUpperCase() === selectedPolda.toUpperCase() ||
        (selectedPolda.toUpperCase().includes('MABES') && m.polda.toUpperCase().includes('MABES'));

      const matchPangkat = selectedPangkat === 'SEMUA' || m.pangkat === selectedPangkat;

      return matchSearch && matchPolda && matchPangkat;
    });
  }, [members, activeSearch, selectedPolda, selectedPangkat]);

  const formatWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Direktori%20Alumni%20Akpol%201996%20Wira%20Satya`;
  };

  // Find members needing health attention (from Modul 4) and prioritize urgent cases
  const healthAttentionMembers = useMemo(() => {
    return members
      .filter((m) => m.adaPenyakitKronis === 'ADA' || (m.daftarPenyakit && m.daftarPenyakit.length > 0) || m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT')
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = {
          'PERLU PERHATIAN KHUSUS': 1,
          'SAKIT': 2,
          'CUKUP': 3,
          'BAIK': 4,
          'SANGAT BAIK': 5,
        };
        const pA = priorityOrder[a.kondisiKesehatan] || 99;
        const pB = priorityOrder[b.kondisiKesehatan] || 99;
        return pA - pB;
      });
  }, [members]);

  // Current logged in member profile if exists
  const currentMemberObj = members.find((m) => m.nrp === currentUser.nrp) || members[0];

  // IF A MEMBER IS SELECTED, SHOW LINKEDIN FULL PROFILE VIEW
  if (selectedMember) {
    return (
      <LinkedInProfileView
        member={selectedMember}
        currentUser={currentUser}
        onClose={() => setSelectedMember(null)}
        onEditProfile={() => onEditMember && onEditMember(selectedMember)}
        onOpenChat={onOpenChat}
        allMembers={members}
        onSelectMember={(m) => setSelectedMember(m)}
      />
    );
  }

  return (
    <div className="font-sans text-slate-900 pb-20">
      
      {/* ============================================================== */}
      {/* 3-COLUMN LINKEDIN FEED LAYOUT (MATCHING USER SCREENSHOTS)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* 1. LEFT RAIL (lg:col-span-3): PROFILE SNAPSHOT & FILTERS    */}
        {/* ============================================================ */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4">
          
          {/* User Mini Profile Card (Exact User Screenshot media_1792053907699_1addcb0f.png) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-center">
            
            {/* Header cover background - Bareskrim Red / Gold */}
            <div className="h-16 bg-gradient-to-r from-red-950 via-red-900 to-amber-900 relative" />

            {/* Avatar overlapping */}
            <div className="px-4 pb-4 relative">
              <div 
                onClick={() => currentMemberObj ? setSelectedMember(currentMemberObj) : onAddNew()}
                className="w-16 h-16 rounded-full border-2 border-white shadow-md mx-auto -mt-8 overflow-hidden bg-slate-100 cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.fotoUrl || currentMemberObj?.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <h3 
                onClick={() => currentMemberObj ? setSelectedMember(currentMemberObj) : onAddNew()}
                className="text-sm font-bold text-slate-900 hover:text-red-900 cursor-pointer mt-2 leading-tight"
              >
                {currentUser.nama.replace(/\(.*?\)/g, '').trim()}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser.nrp === '98010710' ? 'Briptu • Lead Developer' : `${currentUser.pangkat} • Alumni Akpol 1996`}
              </p>

              {/* Metrics (Exact screenshot match) */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Rekan Letting:</span>
                  <span className="font-bold text-red-900">{members.length} Perwira</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Status Iuran 2026:</span>
                  <span className="font-bold text-slate-700">
                    {currentUser.role === 'SUPERADMIN' ? '-' : 'Lunas'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Hak Akses:</span>
                  <span className="font-bold text-slate-900">{currentUser.role}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => currentMemberObj ? setSelectedMember(currentMemberObj) : onAddNew()}
                className="w-full mt-3 py-1.5 px-3 rounded-lg border border-red-800 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors"
              >
                {currentMemberObj ? 'Lihat Profil Saya' : 'Lengkapi Profil Saya'}
              </button>
            </div>
          </div>

          {/* Quick Filter Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter Sebaran Leting
              </span>
              {(selectedPolda !== 'SEMUA' || selectedPangkat !== 'SEMUA' || activeSearch) && (
                <button
                  onClick={() => {
                    setSelectedPolda('SEMUA');
                    setSelectedPangkat('SEMUA');
                    setSearchTerm('');
                  }}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Filter 1: Polda */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Wilayah / Polda:
              </label>
              <select
                value={selectedPolda}
                onChange={(e) => setSelectedPolda(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-red-800"
              >
                {poldaList.map((p) => (
                  <option key={p} value={p}>
                    {p === 'SEMUA' ? '🌐 Semua 38 Polda & Mabes' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Pangkat */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Hierarki Pangkat:
              </label>
              <select
                value={selectedPangkat}
                onChange={(e) => setSelectedPangkat(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-red-800"
              >
                <option value="SEMUA">⭐ Semua Pangkat Perwira</option>
                {DAFTAR_PANGKAT_POLRI.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-300/40 text-center">
            <span className="text-[11px] font-extrabold text-amber-900 tracking-wider">
              #SELALUBAHAGIA
            </span>
            <p className="text-[10px] text-amber-800 mt-0.5">
              Guyub, Peduli, & Mengabdi Sejak 1996
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. CENTER FEED (lg:col-span-6): DIRECTORY STREAM & CARDS    */}
        {/* ============================================================ */}
        <div className="order-1 lg:order-2 lg:col-span-6 space-y-4">
          
          {/* Post/Update Box (matching LinkedIn's "Mulai posting" Box from user screenshot) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentMemberObj?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                alt={currentUser.nama}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 rounded-full text-left text-xs text-slate-500 font-medium transition-colors border border-slate-200 hover:text-slate-800"
              >
                Mulai buat posting atau bagikan kabar leting...
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600 px-1 sm:px-2">
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
              <button 
                onClick={onAddNew}
                className="flex items-center gap-2 hover:text-purple-600 transition-colors p-1 hidden sm:inline-flex"
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span>Pendataan</span>
              </button>
            </div>
          </div>

          {/* Feed Mode Switcher (Feed Silaturahmi vs Direktori Perwira) */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveCenterTab('feed')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeCenterTab === 'feed'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Feed ({posts.length})</span>
            </button>
            <button
              onClick={() => setActiveCenterTab('direktori')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeCenterTab === 'direktori'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Direktori ({filteredMembers.length})</span>
            </button>
          </div>

          {/* TAB 1: SOCIAL FEED STREAM (POSTINGAN LINKEDIN) */}
          {activeCenterTab === 'feed' && (
            <div className="space-y-4">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap pl-1">Filter:</span>
                {[
                  { key: 'SEMUA', label: 'Semua Feed' },
                  { key: 'MOTIVASI', label: '⭐ Motivasi' },
                  { key: 'KENAIKAN_PANGKAT', label: '🎖️ Kenaikan Pangkat' },
                  { key: 'BAKSOS', label: '🤝 Baksos & Peduli' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setFeedCategoryFilter(cat.key)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      feedCategoryFilter === cat.key
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
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
          )}

          {/* TAB 2: DIREKTORI 38 WILAYAH */}
          {activeCenterTab === 'direktori' && (
            <div className="space-y-4">

          {/* Search Box & Results Counter */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama perwira, jabatan, atau satuan kerja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                <b>{filteredMembers.length}</b> perwira
              </span>
              {['SUPERADMIN', 'KETUA', 'SEKRETARIAT'].includes(currentUser.role) && (
                <button
                  onClick={onAddNew}
                  className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
                  title="Tambah Anggota Baru"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">+ Input Anggota</span>
                </button>
              )}
            </div>
          </div>

          {/* Member Feed Cards (LinkedIn-style Connection Cards) */}
          {filteredMembers.length > 0 ? (
            <div className="space-y-3.5">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Mini card cover */}
                <div className="h-16 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 relative">
                  <span className="absolute top-2 right-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur text-[10px] font-bold text-amber-300 border border-white/20">
                    {member.pangkat}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-5 pb-5 pt-0 relative">
                  
                  <div className="flex items-start justify-between -mt-8 mb-2">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
                        alt={member.namaLengkap}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow bg-slate-100 cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                      />
                      <span className="w-4 h-4 rounded-full bg-red-800 text-white flex items-center justify-center absolute bottom-0 right-0 border border-white text-[9px] font-bold">
                        ✓
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-900 border border-red-200 mt-2">
                      {member.polda}
                    </span>
                  </div>

                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 
                      onClick={() => setSelectedMember(member)}
                      className="text-base font-bold text-slate-900 hover:text-red-900 cursor-pointer"
                    >
                      {member.namaLengkap}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {member.jabatanTerakhir}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {member.satuanKerja} {member.subSatker ? `(${member.subSatker})` : ''} &bull; NRP {member.nrp}
                    </p>
                  </div>

                  {/* Mutual Leting Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Alumni Batalyon Wira Satya 1996 &bull; Purna {member.tahunPurnaTugas}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3.5 flex items-center gap-2 pt-1 flex-wrap">
                    <a
                      href={formatWaUrl(member.noHp)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-3 rounded-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </a>

                    {currentUser.nrp !== member.nrp && onOpenChat && (
                      <button
                        onClick={() => onOpenChat(member)}
                        className="py-1.5 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Buka Obrolan Leting Langsung"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Obrolan</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedMember(member)}
                      className="py-1.5 px-3.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Profil
                    </button>

                    {/* Role-based Edit: Pengurus (Sekretariat/Ketua/Superadmin) can edit any member, or user editing self */}
                    {(['SUPERADMIN', 'KETUA', 'SEKRETARIAT'].includes(currentUser.role) || currentUser.nrp === member.nrp) && onEditMember && (
                      <button
                        onClick={() => onEditMember(member)}
                        className="py-1.5 px-3 rounded-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1"
                        title={currentUser.nrp === member.nrp ? 'Edit Profil Saya' : `Edit Data Anggota (${currentUser.role})`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {member.kontakAdc && (
                      <a
                        href={formatWaUrl(member.kontakAdc)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold hidden sm:inline-flex items-center gap-1"
                        title={`ADC: ${member.namaAdc || 'Ajudan'}`}
                      >
                        <span>ADC</span>
                      </a>
                    )}
                  </div>

                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-slate-700 text-xs font-semibold">Belum ada data perwira alumni terdaftar.</p>
              <p className="text-slate-400 text-[11px]">Silakan masukkan data melalui formulir pendataan SIPP atau registrasi alumni.</p>
              {['SUPERADMIN', 'KETUA', 'SEKRETARIAT'].includes(currentUser.role) && (
                <button
                  onClick={onAddNew}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Input Anggota Baru</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>

        {/* ============================================================ */}
        {/* 3. RIGHT RAIL (lg:col-span-3): ATENSI KESEHATAN & TREASURY   */}
        {/* ============================================================ */}
        <div className="order-3 lg:order-3 lg:col-span-3 space-y-4">
          
          {/* Widget 1: Atensi Rekan Sakit & Solidaritas Leting (Modul 4) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                Atensi Kesehatan Leting
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold border border-red-200">
                {healthAttentionMembers.filter(m => m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT').length || healthAttentionMembers.length} Prioritas
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Program kepedulian leting bagi rekan yang memerlukan doa, atensi medis khusus, dan bantuan:
            </p>

            {healthAttentionMembers.length > 0 ? (
              <div className="space-y-2.5">
                {healthAttentionMembers.map((m) => {
                  const isUrgent = m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT';
                  return (
                    <div 
                      key={m.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        isUrgent 
                          ? 'bg-red-50/70 border-red-200/90 shadow-sm' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span 
                          onClick={() => setSelectedMember(m)}
                          className="text-xs font-bold text-slate-900 hover:text-red-900 cursor-pointer truncate max-w-[140px]"
                          title={m.namaLengkap}
                        >
                          {m.namaLengkap.split(',')[0]}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${
                          isUrgent 
                            ? 'bg-red-600 text-white shadow-sm' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
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
                          <Phone className="w-3 h-3" /> Kirim Doa & Semangat
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

          {/* Widget 2: Status Arus Kas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Arus Kas
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">2026</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Saldo Kas Utama:</span>
                <span className="font-bold text-slate-900">Rp 0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Alokasi Rekan Sakit:</span>
                <span className="font-bold text-emerald-600">Rp 0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Iuran Wajib / Bulan:</span>
                <span className="font-bold text-slate-800">Rp 250.000 / Perwira</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block text-center">
                Dikelola oleh Bendahara
              </span>
            </div>
          </div>

          {/* Widget 3: Info Footer LinkedIn Style */}
          <div className="text-[11px] text-slate-400 text-center space-y-1 p-2">
            <p className="font-bold text-slate-600">BATALYON WIRA SATYA 1996</p>
            <p>Akademi Kepolisian Republik Indonesia</p>
            <p className="text-[10px]">Portal Internal Alumni &copy; 2026</p>
          </div>

        </div>

      </div>

      {/* LinkedIn Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        currentUser={currentUser}
        onSubmitPost={handleCreatePost}
      />

    </div>
  );
};
