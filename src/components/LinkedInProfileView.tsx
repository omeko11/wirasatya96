'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AnggotaWiraSatya,
  AuthUser,
  FeedPost,
  UserRole,
} from '@/types';
import {
  getAvatarUrl,
  resolveAvatarUrl,
  formatMemberDisplayName,
  DEFAULT_AVATAR_URL,
  DEFAULT_COVER_URL,
} from '@/lib/avatarUtils';
import { MetaVerifiedBadge, resolveRoleForBadge } from '@/components/MetaVerifiedBadge';
import {
  Shield,
  MapPin,
  Building2,
  Phone,
  Edit3,
  Heart,
  Users,
  Briefcase,
  GraduationCap,
  Share2,
  Clock,
  Home,
  Award,
  Plus,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Mail,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export interface LinkedInProfileViewProps {
  member: AnggotaWiraSatya;
  currentUser: AuthUser;
  memberRole?: UserRole;
  onEditProfile?: (targetMember?: AnggotaWiraSatya) => void;
  onUpdateMemberDirect?: (updated: AnggotaWiraSatya) => Promise<void> | void;
  onOpenChat?: (member: AnggotaWiraSatya) => void;
  onClose?: () => void;
  allMembers?: AnggotaWiraSatya[];
  onSelectMember?: (member: AnggotaWiraSatya) => void;
}

const COVER_PRESETS = [
  {
    id: 'preset:bareskrim-dark',
    label: 'Tactical Bareskrim Dark',
    subtitle: 'Hitam Taktis & Aksen Emas Komando',
    previewClass: 'bg-gradient-to-r from-slate-950 via-red-950 to-slate-900',
  },
  {
    id: 'preset:mabes-gold',
    label: 'Presisi Gold Mabes',
    subtitle: 'Marun Presisi & Emas Kehormatan Polri',
    previewClass: 'bg-gradient-to-r from-amber-900 via-red-900 to-slate-950',
  },
  {
    id: 'preset:tactical-navy',
    label: 'Cyber Command Blue',
    subtitle: 'Biru Navy Siber & Infrastruktur Digital',
    previewClass: 'bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950',
  },
  {
    id: DEFAULT_COVER_URL,
    label: 'Klasik Wira Satya',
    subtitle: 'Sampul Resmi Standar Portal',
    previewClass: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900',
  },
];

export const LinkedInProfileView: React.FC<LinkedInProfileViewProps> = ({
  member,
  currentUser,
  memberRole,
  onEditProfile,
  onUpdateMemberDirect,
  onOpenChat,
  onClose,
  allMembers = [],
  onSelectMember,
}) => {
  const [localMember, setLocalMember] = useState<AnggotaWiraSatya>(() => ({
    ...member,
    fotoUrl:
      member.nrp === currentUser.nrp
        ? resolveAvatarUrl(member.fotoUrl, currentUser.fotoUrl)
        : getAvatarUrl(member.fotoUrl),
    coverUrl:
      member.nrp === currentUser.nrp
        ? member.coverUrl && member.coverUrl !== DEFAULT_COVER_URL
          ? member.coverUrl
          : currentUser.coverUrl || member.coverUrl
        : member.coverUrl,
  }));
  const [userPosts, setUserPosts] = useState<FeedPost[]>([]);

  // Interactive UI states
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [draftBio, setDraftBio] = useState(member.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const peersSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalMember({
      ...member,
      fotoUrl:
        member.nrp === currentUser.nrp
          ? resolveAvatarUrl(member.fotoUrl, currentUser.fotoUrl)
          : getAvatarUrl(member.fotoUrl),
      coverUrl:
        member.nrp === currentUser.nrp
          ? member.coverUrl && member.coverUrl !== DEFAULT_COVER_URL
            ? member.coverUrl
            : currentUser.coverUrl || member.coverUrl
          : member.coverUrl,
    });
    setDraftBio(member.bio || '');
  }, [member, currentUser.nrp, currentUser.fotoUrl, currentUser.coverUrl]);

  const isLeadership = ['SUPERADMIN', 'SEKRETARIAT'].includes(currentUser.role);
  const isOwnProfile = currentUser.nrp === localMember.nrp;
  const isSelf = isOwnProfile;
  const isOwner = isOwnProfile;
  const canEdit = isLeadership || isOwnProfile;
  const canManageProfile = isOwnProfile || canEdit;

  // Accurate Role & Personnel Classification (No dummy Akpol 1996 labels on non-Akpol96 users)
  const effectiveRole = resolveRoleForBadge(localMember.nrp, memberRole);
  const isSuperadminDev =
    localMember.nrp === '98010710' || effectiveRole === 'SUPERADMIN';
  const isNonAkpolRank =
    [
      'Briptu',
      'Brigpol',
      'Bripka',
      'Aipda',
      'Aiptu',
      'Bripda',
      'Bharada',
      'Bharatu',
      'Bharaka',
      'Abripda',
      'Abriptu',
      'Abrip',
      'Ipda',
      'Iptu',
      'AKP',
      'Kompol',
      'Pembina / ASN Polri',
      'Penata / ASN Polri',
      'Pengatur / ASN Polri',
      'ASN / PNS Polri',
    ].includes(localMember.pangkat) ||
    (localMember.jenisAnggota as string) === 'ASN / PNS POLRI' ||
    localMember.pendidikanTerakhir?.toLowerCase().includes('informatika');
  const isAkpol96Alumni = !isSuperadminDev && !isNonAkpolRank;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wirasatya96_feed_posts');
      if (saved) {
        try {
          const parsed: FeedPost[] = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setUserPosts(parsed.filter((p) => p.authorNrp === localMember.nrp));
          }
        } catch {
          // ignore
        }
      }
    }
  }, [localMember.nrp]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const persistMemberUpdate = async (
    patch: Partial<AnggotaWiraSatya>,
    notificationText: string
  ) => {
    const updated: AnggotaWiraSatya = {
      ...localMember,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    setLocalMember(updated);
    setIsSaving(true);

    try {
      // Sync localStorage auth session if updating own profile
      if (typeof window !== 'undefined' && currentUser.nrp === updated.nrp) {
        const rawAuth = localStorage.getItem('ws96_auth_user');
        if (rawAuth) {
          try {
            const parsedAuth = JSON.parse(rawAuth);
            const nextAuth = {
              ...parsedAuth,
              fotoUrl: updated.fotoUrl,
              coverUrl: updated.coverUrl,
              bio: updated.bio,
            };
            localStorage.setItem('ws96_auth_user', JSON.stringify(nextAuth));
            localStorage.setItem('ws96_active_user', JSON.stringify(nextAuth));
            localStorage.setItem('wirasatya96_current_user', JSON.stringify(nextAuth));
            window.dispatchEvent(new Event('ws96_user_updated'));
          } catch {
            // ignore
          }
        }
      }

      await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (onUpdateMemberDirect) {
        await onUpdateMemberDirect(updated);
      }

      triggerToast(notificationText);
    } catch {
      triggerToast('Perubahan disimpan secara lokal');
    } finally {
      setIsSaving(false);
    }
  };

  // Client-side image resize helper for Cover Banner (max 1280x420, JPEG 0.82)
  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetW = Math.min(img.width, 1280);
        const scale = targetW / img.width;
        const targetH = Math.min(Math.round(img.height * scale), 420);
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Center crop vertically if tall image
          const sourceH = targetH / scale;
          const sy = Math.max(0, (img.height - sourceH) / 2);
          ctx.drawImage(img, 0, sy, img.width, sourceH, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          persistMemberUpdate({ coverUrl: dataUrl }, 'Gambar sampul profil berhasil diperbarui');
        }
        setShowCoverMenu(false);
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Client-side image resize helper for Avatar (square 320x320, JPEG 0.85)
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 320;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          persistMemberUpdate({ fotoUrl: dataUrl }, 'Foto profil berhasil diperbarui');
        }
        setShowAvatarMenu(false);
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const displayMemberNameWithRank = formatMemberDisplayName(
    localMember.pangkat,
    localMember.namaLengkap
  );

  const resolvedMemberAvatar =
    localMember.nrp === currentUser.nrp
      ? resolveAvatarUrl(localMember.fotoUrl, currentUser.fotoUrl)
      : getAvatarUrl(localMember.fotoUrl);

  const getWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20${encodeURIComponent(
      displayMemberNameWithRank
    )}%2C%20mohon%20izin%20menghubungi%20dari%20Portal%20Wira%20Satya%2096`;
  };

  const getDefaultBioText = (): string => {
    if (isSuperadminDev) {
      return `${displayMemberNameWithRank} (NRP ${localMember.nrp}) bertugas pada ${localMember.satuanKerja} (${localMember.polda}) sebagai ${localMember.jabatanTerakhir}. Berlatar belakang pendidikan ${localMember.pendidikanTerakhir}, bertanggung jawab atas arsitektur sistem, keamanan data, dan pengelolaan infrastruktur digital portal Wira Satya 96.`;
    }
    if (!isAkpol96Alumni) {
      return `${displayMemberNameWithRank} (NRP ${localMember.nrp}) berdinas aktif pada ${localMember.satuanKerja} (${localMember.polda}) dengan jabatan ${localMember.jabatanTerakhir}. Lulusan ${localMember.pendidikanTerakhir || 'Pendidikan Polri'}.`;
    }
    return `${displayMemberNameWithRank} adalah Perwira Polri alumni Akademi Kepolisian (Akpol) Tahun 1996 Batalyon Wira Satya yang saat ini mengemban amanah sebagai ${localMember.jabatanTerakhir} pada ${localMember.satuanKerja} (${localMember.polda}).`;
  };

  const displayedBio =
    localMember.bio && localMember.bio.trim().length > 0
      ? localMember.bio
      : getDefaultBioText();

  const getPersonnelCategoryLabel = (): string => {
    if (isSuperadminDev) return 'PERSONEL POLRI • LEAD DEVELOPER / SUPERADMIN';
    if (effectiveRole === 'KETUA') return 'PERWIRA TINGGI POLRI • KETUA ANGKATAN';
    if (effectiveRole === 'SEKRETARIAT') return 'PERWIRA POLRI • SEKRETARIS ANGKATAN';
    if (effectiveRole === 'BENDAHARA') return 'PERWIRA POLRI • BENDAHARA ANGKATAN';
    if (isAkpol96Alumni) return 'PERWIRA POLRI • ALUMNI AKPOL 1996';
    return `${localMember.jenisAnggota || 'PERSONEL POLRI'} • STAF / PENDUKUNG`;
  };

  const getBadgeStatusDescription = (): { label: string; colorClass: string } => {
    if (effectiveRole === 'SUPERADMIN') {
      return {
        label: 'Badge Hitam — Superadmin',
        colorClass: 'bg-slate-900 text-white border-slate-700',
      };
    }
    if (effectiveRole === 'KETUA') {
      return {
        label: 'Badge Merah — Ketua Angkatan',
        colorClass: 'bg-red-50 text-red-800 border-red-200',
      };
    }
    if (effectiveRole === 'SEKRETARIAT' || effectiveRole === 'BENDAHARA') {
      return {
        label: 'Badge Kuning Emas — Pejabat Angkatan',
        colorClass: 'bg-amber-50 text-amber-900 border-amber-300',
      };
    }
    return {
      label: 'Anggota Terdaftar',
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  };

  const officialEmail = localMember.email || `${localMember.nrp}@polri.go.id`;
  const secondaryEmail =
    localMember.secondaryEmail ||
    (localMember.nrp === '98010710' ? 'agungkrisdianto98@gmail.com' : '—');

  const copyToClipboard = (key: string, val: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(val);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Find other peers in the same Polda
  const peersInSamePolda = allMembers
    .filter((m) => m.id !== localMember.id && m.polda === localMember.polda)
    .slice(0, 4);

  // Render Cover Banner Visual
  const renderCoverBannerContent = () => {
    const rawCover =
      localMember.coverUrl && localMember.coverUrl !== DEFAULT_COVER_URL
        ? localMember.coverUrl
        : localMember.nrp === currentUser.nrp
        ? currentUser.coverUrl || localMember.coverUrl
        : localMember.coverUrl;
    const cover = rawCover?.trim();

    if (cover === 'none') {
      return (
        <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      );
    }

    if (cover === 'preset:bareskrim-dark') {
      return (
        <div className="w-full h-full bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      );
    }

    if (cover === 'preset:mabes-gold') {
      return (
        <div className="w-full h-full bg-gradient-to-r from-amber-900 via-red-900 to-slate-950 relative">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fde68a_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      );
    }

    if (cover === 'preset:tactical-navy') {
      return (
        <div className="w-full h-full bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      );
    }

    const imgSrc = cover && cover.length > 0 ? cover : DEFAULT_COVER_URL;
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={imgSrc}
        alt="Sampul Profil"
        className="w-full h-full object-cover"
      />
    );
  };

  const badgeStatus = getBadgeStatusDescription();

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 font-sans text-slate-900 space-y-4 relative">
      {/* Hidden File Inputs for Cover & Avatar */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFileSelect}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Floating Feedback Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb / Back button if presented inside a modal */}
      {onClose && (
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Direktori Personel</span>
            <span>/</span>
            <span className="font-bold text-slate-900 inline-flex items-center gap-1">
              {displayMemberNameWithRank}
              <MetaVerifiedBadge nrp={localMember.nrp} role={effectiveRole} size="xs" />
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ← Kembali ke Direktori
          </button>
        </div>
      )}

      {/* Main Grid: Left Column (Profile Canvas) + Right Column (LinkedIn Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ============================================================== */}
        {/* LEFT / CENTER COLUMN (2 COLS): LINKEDIN MAIN PROFILE FEED      */}
        {/* ============================================================== */}
        <div className="lg:col-span-2 space-y-4">
          {/* 1. HERO PROFILE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible relative">
            {/* Cover Banner Image */}
            <div className="h-44 sm:h-52 w-full bg-slate-900 relative overflow-hidden rounded-t-2xl">
              {renderCoverBannerContent()}

              {/* Top-left dynamic Satker • Polda overlay badge */}
              <div className="absolute top-3 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5 shadow-lg tracking-wide">
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {(localMember.satuanKerja || 'MABES POLRI').toUpperCase()} •{' '}
                    {(localMember.polda || 'MABES POLRI').toUpperCase()}
                  </span>
                </span>
              </div>

              {/* Top-right interactive Edit Sampul button */}
              {canManageProfile && (
                <div className="absolute top-3 right-4 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCoverMenu((prev) => !prev);
                      setShowAvatarMenu(false);
                    }}
                    className="px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white border border-white/25 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    title="Ubah atau Hapus Gambar Sampul"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Sampul</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cover Editor Popover / Menu */}
            {canManageProfile && showCoverMenu && (
              <div className="
                absolute top-14 right-4 z-40 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 text-xs
              ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-red-800" />
                    Sampul Profil
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCoverMenu(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Upload Sampul</span>
                </button>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Tema Sampul:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {COVER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          persistMemberUpdate(
                            { coverUrl: preset.id },
                            `Tema sampul "${preset.label}" diterapkan`
                          );
                          setShowCoverMenu(false);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition-all cursor-pointer"
                      >
                        <div
                          className={`w-10 h-6 rounded-md ${preset.previewClass} border border-white/20 shrink-0 shadow-inner`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-xs truncate">
                            {preset.label}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {preset.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      persistMemberUpdate(
                        { coverUrl: 'none' },
                        'Gambar sampul berhasil dihapus'
                      );
                      setShowCoverMenu(false);
                    }}
                    className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Sampul</span>
                  </button>
                  {isSaving && (
                    <span className="text-[11px] text-slate-400 italic">Menyimpan...</span>
                  )}
                </div>
              </div>
            )}

            {/* Avatar & Headline Info Section */}
            <div className="px-6 pb-6 pt-0 relative">
              {/* Profile Avatar overlapping banner */}
              <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedMemberAvatar}
                    alt={localMember.namaLengkap}
                    onClick={() => {
                      if (canManageProfile) {
                        setShowAvatarMenu((prev) => !prev);
                        setShowCoverMenu(false);
                      }
                    }}
                    className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl bg-white ${
                      canManageProfile ? 'cursor-pointer group-hover:brightness-95 transition-all' : ''
                    }`}
                  />

                  {canManageProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu((prev) => !prev);
                        setShowCoverMenu(false);
                      }}
                      className="w-9 h-9 rounded-full bg-slate-900 hover:bg-red-900 text-white flex items-center justify-center absolute bottom-1.5 right-1.5 border-2 border-white shadow-lg transition-colors cursor-pointer"
                      title="Ubah atau Hapus Foto Profil"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                    </button>
                  )}

                  {/* Avatar Popover Menu */}
                  {canManageProfile && showAvatarMenu && (
                    <div className="absolute left-0 top-full mt-2 z-40 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-900">Foto Profil</span>
                        <button
                          type="button"
                          onClick={() => setShowAvatarMenu(false)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ganti Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          persistMemberUpdate(
                            { fotoUrl: DEFAULT_AVATAR_URL },
                            'Foto profil direset ke standar'
                          );
                          setShowAvatarMenu(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <button
                    onClick={() => onEditProfile && onEditProfile(localMember)}
                    className="p-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Edit Profil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name & Headline */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight inline-flex items-center gap-1.5">
                      <span>{displayMemberNameWithRank}</span>
                      <MetaVerifiedBadge
                        nrp={localMember.nrp}
                        role={effectiveRole}
                        size="lg"
                      />
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      NRP {localMember.nrp}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 leading-snug">
                    {(localMember.jabatanTerakhir || '')
                      .toLowerCase()
                      .includes((localMember.satuanKerja || '').toLowerCase())
                      ? localMember.jabatanTerakhir
                      : `${localMember.jabatanTerakhir} — ${localMember.satuanKerja}`}
                  </p>

                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {localMember.polda} • NRP {localMember.nrp}
                    </span>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => setShowContactModal(true)}
                      className="text-red-900 font-bold hover:underline cursor-pointer"
                    >
                      Info Kontak
                    </button>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-2 border-t border-slate-100">
                {localMember.noHp && (
                  <a
                    href={getWaUrl(localMember.noHp)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 rounded-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {!isSelf && onOpenChat && (
                  <button
                    onClick={() => onOpenChat(localMember)}
                    className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Kirim Pesan</span>
                  </button>
                )}

                {canEdit ? (
                  <button
                    onClick={() => onEditProfile && onEditProfile(localMember)}
                    className="px-4 py-2 rounded-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profil</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-medium px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                    Mode Lihat
                  </span>
                )}

                {localMember.kontakAdc && (
                  <a
                    href={getWaUrl(localMember.kontakAdc)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>ADC: {localMember.namaAdc || 'Ajudan'}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Info Kontak</span>
                </button>
              </div>

              {/* Status Purna & Kesehatan Highlights Card */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Purna Tugas:
                    </span>
                    <span className="font-bold text-slate-900">
                      {localMember.tahunPurnaTugas} ({localMember.sisaTahunDinas} Thn Lagi)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Kondisi Kesehatan:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {localMember.kondisiKesehatan}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Status Otoritas:
                    </span>
                    <span className="font-bold text-amber-800 inline-flex items-center gap-1">
                      <span>{badgeStatus.label}</span>
                      <MetaVerifiedBadge
                        nrp={localMember.nrp}
                        role={effectiveRole}
                        size="xs"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SECTION: TENTANG (Fixes Crossed-Out Area #3) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Tentang
              </h2>
              {canManageProfile && !isEditingBio && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftBio(localMember.bio || getDefaultBioText());
                    setIsEditingBio(true);
                  }}
                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-red-800" />
                  <span>Edit Ringkasan</span>
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-3 pt-1">
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan ringkasan profil, riwayat penugasan, atau bidang keahlian..."
                  className="w-full rounded-xl border border-slate-300 focus:border-red-800 focus:ring-2 focus:ring-red-800/20 p-3 text-xs sm:text-sm text-slate-800 leading-relaxed outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftBio(getDefaultBioText())}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ringkasan Otomatis</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await persistMemberUpdate(
                          { bio: draftBio.trim() },
                          'Ringkasan berhasil disimpan'
                        );
                        setIsEditingBio(false);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {displayedBio}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                🎓 {localMember.pendidikanTerakhir || 'Pendidikan Polri'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                🛡️ Pangkat: {localMember.pangkat}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                🏛️ {localMember.satuanKerja}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                📍 {localMember.polda}
              </span>
            </div>
          </div>

          {/* SECTION: UNGGAHAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Unggahan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {userPosts.length} unggahan dipublikasikan
                </p>
              </div>

              {isOwner && (
                <button
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className="px-4 py-1.5 rounded-full border border-red-800 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Unggahan</span>
                </button>
              )}
            </div>

            {userPosts.length > 0 ? (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvedMemberAvatar}
                        alt={localMember.namaLengkap}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-white"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 inline-flex items-center gap-1">
                          <span>{displayMemberNameWithRank}</span>
                          <MetaVerifiedBadge
                            nrp={localMember.nrp}
                            role={effectiveRole}
                            size="sm"
                          />
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {post.createdAt}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        👍 {post.likesCount} suka &bull; {post.comments.length} komentar
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 text-center text-xs text-slate-500">
                Belum ada unggahan dari personel ini.
              </div>
            )}
          </div>

          {/* 3. SECTION: JEJAK KEDINASAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-polri-navy" />
                Jejak Kedinasan
              </h2>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Tipe: {localMember.tipeSatker || 'POLDA'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-polri-navy text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {localMember.jabatanTerakhir}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700">
                    {localMember.satuanKerja}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {localMember.polda} &bull; Sub Satker:{' '}
                    <span className="font-semibold text-blue-700">
                      {localMember.subSatker || '-'}
                    </span>
                  </p>
                  {localMember.namaPolres && (
                    <p className="text-[11px] text-slate-600">
                      Satwil / Komando:{' '}
                      <span className="font-semibold text-slate-800">
                        {localMember.namaPolres}
                      </span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 pt-1">
                    Tempat Tinggal: <b>{localMember.statusTempatTinggal}</b> (
                    {localMember.alamatTempatTinggal})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SECTION: KELUARGA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-polri-navy" />
                Keluarga
              </h2>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Status: {localMember.statusPerkawinan}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Nama Pasangan:</span>
                <span className="font-bold text-slate-900">
                  {localMember.namaIstri || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Kontak Pasangan:</span>
                <span className="font-semibold text-slate-900">
                  {localMember.kontakIstri || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Jumlah Anak:</span>
                <span className="font-bold text-blue-700">
                  {localMember.jumlahAnak || 0} Anak
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggungan Lain:</span>
                <span className="font-semibold text-slate-800">
                  {localMember.tanggunganLain?.jumlah || 0} Orang (
                  {localMember.tanggunganLain?.rincian || 'Tidak ada'})
                </span>
              </div>
            </div>

            {/* List of Children */}
            {localMember.daftarAnak && localMember.daftarAnak.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Putra-Putri:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {localMember.daftarAnak.map((anak, idx) => (
                    <div
                      key={anak.id || idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">
                            {anak.nama || `Anak ke-${idx + 1}`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {anak.status} • Lahir: {anak.tanggalLahir || '-'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200">
                        {anak.biayaPendidikanTahunan
                          ? `Biaya: ${anak.biayaPendidikanTahunan}`
                          : 'Pelajar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. SECTION: KESEHATAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Kesehatan
              </h2>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  localMember.adaPenyakitKronis === 'ADA'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Penyakit Kronis: {localMember.adaPenyakitKronis}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Kondisi Kesehatan:</span>
                <span className="font-bold text-slate-900">
                  {localMember.kondisiKesehatan}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Rutin MCU:</span>
                <span className="font-semibold text-slate-900">
                  {localMember.rutinMcu === 'YA' ? 'Ya (Rutin)' : 'Tidak'} • MCU:{' '}
                  {localMember.mcuTerakhir || '-'}
                </span>
              </div>
            </div>

            {/* Diagnosa Penyakit */}
            {localMember.daftarPenyakit && localMember.daftarPenyakit.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-700 block">
                  Diagnosa Medis:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {localMember.daftarPenyakit.map((p, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 font-bold text-[11px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {localMember.harapanDukunganLeting && (
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">
                  Catatan Dukungan:
                </span>
                <p className="text-slate-700 italic">
                  &ldquo;{localMember.harapanDukunganLeting}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* 6. SECTION: PURNA TUGAS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-polri-goldDark" />
                Purna Tugas
              </h2>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Pensiun {localMember.tahunPurnaTugas}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Rencana Pasca Purna:</span>
                <span className="font-bold text-slate-900">
                  {(localMember.rencanaAktivitas || []).join(', ') || 'USAHA SENDIRI'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Rumah Purna Tugas:</span>
                <span className="font-semibold text-slate-900">
                  {localMember.statusRumahPurnaTugas}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Kesiapan Pensiun:</span>
                <span className="font-semibold text-slate-900">
                  {localMember.kesiapanPensiun} ({localMember.perasaanPensiun})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Dana Pensiun:</span>
                <span className="font-semibold text-slate-900">
                  {localMember.kecukupanDanaPensiun}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT SIDEBAR (1 COL): LINKEDIN WIDGETS & REKAN DIREKTORI     */}
        {/* ============================================================== */}
        <div className="space-y-4">
          {/* Widget 1: Info Akun (Fixes Crossed-Out Area #4) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="font-bold text-slate-900 text-sm inline-flex items-center gap-1.5">
                <span>Info Akun</span>
                <MetaVerifiedBadge
                  nrp={localMember.nrp}
                  role={effectiveRole}
                  size="sm"
                />
              </span>
              <Shield className="w-4 h-4 text-slate-500" />
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Kategori Personel:
              </span>
              <span className="font-extrabold text-slate-900">
                {getPersonnelCategoryLabel()}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Pendidikan Terakhir:
              </span>
              <span className="font-bold text-slate-800">
                {localMember.pendidikanTerakhir || '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Email Dinas:</span>
              <span className="font-mono font-semibold text-slate-800 break-all">
                {officialEmail}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Email Sekunder:</span>
              <span className="font-mono font-semibold text-slate-700 break-all">
                {secondaryEmail}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-slate-500 block text-[11px] mb-1">
                Status Verifikasi:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${badgeStatus.colorClass}`}
              >
                <MetaVerifiedBadge
                  nrp={localMember.nrp}
                  role={effectiveRole}
                  size="xs"
                />
                <span>{badgeStatus.label}</span>
              </span>
            </div>
          </div>

          {/* Widget 2: Rekan Direktori */}
          <div
            ref={peersSectionRef}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Rekan Direktori
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500">
              Personel satu wilayah ({localMember.polda}):
            </p>

            <div className="space-y-3 pt-1">
              {peersInSamePolda.length > 0 ? (
                peersInSamePolda.map((peer) => (
                  <div
                    key={peer.id}
                    className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAvatarUrl(peer.fotoUrl)}
                      alt={peer.namaLengkap}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        onClick={() => onSelectMember && onSelectMember(peer)}
                        className="text-xs font-bold text-slate-900 truncate hover:text-red-900 cursor-pointer inline-flex items-center gap-1 max-w-full"
                      >
                        <span className="truncate">
                          {formatMemberDisplayName(peer.pangkat, peer.namaLengkap)}
                        </span>
                        <MetaVerifiedBadge nrp={peer.nrp} size="sm" />
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {peer.jabatanTerakhir} &bull; {peer.satuanKerja}
                      </p>
                      {peer.noHp && (
                        <a
                          href={getWaUrl(peer.noHp)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-900 hover:underline"
                        >
                          <Phone className="w-2.5 h-2.5" /> Hubungi WA
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada personel lain di wilayah {localMember.polda}.
                </p>
              )}
            </div>
          </div>

          {/* Widget 3: Direktori & Kas */}
          <div className="bg-gradient-to-br from-slate-900 to-polri-navy rounded-2xl p-5 text-white shadow-md space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              PORTAL WIRA SATYA 96
            </span>
            <h4 className="font-bold text-sm text-white">
              Direktori & Kas
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Data personel terhubung langsung dengan basis data terpusat Wira Satya 96, komunikasi internal, serta layanan solidaritas anggota.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-amber-300 font-bold">#SelaluBahagia</span>
              <span className="text-slate-400">Wira Satya 96</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL INFO KONTAK (Fixes Crossed-Out Area #2)                  */}
      {/* ============================================================== */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedMemberAvatar}
                  alt={localMember.namaLengkap}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0 bg-white"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate inline-flex items-center gap-1.5">
                    <span className="truncate">{displayMemberNameWithRank}</span>
                    <MetaVerifiedBadge
                      nrp={localMember.nrp}
                      role={effectiveRole}
                      size="sm"
                    />
                  </h3>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Info Kontak
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    Nama & Pangkat
                  </span>
                  <span className="font-bold text-slate-900 inline-flex items-center gap-1">
                    {displayMemberNameWithRank}
                    <MetaVerifiedBadge
                      nrp={localMember.nrp}
                      role={effectiveRole}
                      size="xs"
                    />
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                  NRP {localMember.nrp}
                </span>
              </div>

              <div className="pb-2.5 border-b border-slate-100">
                <span className="text-[11px] text-slate-500 block">
                  Satker & Wilayah
                </span>
                <span className="font-bold text-slate-800">
                  {localMember.satuanKerja} • {localMember.polda}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-500 block">
                    Email Dinas
                  </span>
                  <span className="font-mono font-semibold text-slate-900 break-all">
                    {officialEmail}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('email', officialEmail)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 shrink-0 cursor-pointer"
                  title="Salin Email Dinas"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-500 block">
                    Email Sekunder
                  </span>
                  <span className="font-mono font-semibold text-slate-800 break-all">
                    {secondaryEmail}
                  </span>
                </div>
                {secondaryEmail !== '—' && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard('secEmail', secondaryEmail)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 shrink-0 cursor-pointer"
                    title="Salin Email Sekunder"
                  >
                    {copiedField === 'secEmail' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    WhatsApp / HP
                  </span>
                  <span className="font-bold text-slate-900">
                    {localMember.noHp || '—'}
                  </span>
                </div>
                {localMember.noHp && (
                  <a
                    href={getWaUrl(localMember.noHp)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">
                  Alamat Domisili
                </span>
                <span className="font-semibold text-slate-800">
                  {localMember.alamatTempatTinggal || '—'} (
                  {localMember.statusTempatTinggal})
                </span>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const summary = `${displayMemberNameWithRank} (NRP: ${localMember.nrp})\nSatker: ${localMember.satuanKerja} - ${localMember.polda}\nWA: ${localMember.noHp || '-'}\nEmail Dinas: ${officialEmail}`;
                  copyToClipboard('all', summary);
                  triggerToast('Data kontak disalin');
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-red-800" />
                <span>
                  {copiedField === 'all' ? 'Tersalin!' : 'Salin Kontak'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
