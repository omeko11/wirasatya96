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
import { OfflineSyncBanner } from '@/components/OfflineSyncBanner';
import { isEffectivelyOnline, getOutboxQueue } from '@/lib/offlineSyncEngine';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { PRESET_USERS } from '@/data/mockUsers';
import { INITIAL_FEED_POSTS } from '@/data/mockPosts';
import { INITIAL_FINANCE_SUMMARY, INITIAL_TRANSACTIONS, INITIAL_IURAN_LIST, INITIAL_ASSETS } from '@/data/mockFinance';
import { AnggotaWiraSatya, AuthUser, KasTransaction, IuranAnggota, FinanceSummary, AssetPortfolioItem, FeedPost, ChatMessage } from '@/types';
import {
  getAvatarUrl,
  resolveAvatarUrl,
  isCustomAvatarUrl,
  getOrBuildUserProfile,
  calculateRetirement58,
  stripRankFromName,
  getActiveAdcSessionFromStorage,
  recordAdcActivityToAuditLog,
} from '@/lib/avatarUtils';

const STORAGE_VERSION = 'ws96_akpol96_real_v11';

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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const syncNetworkBadge = () => {
      setIsOnlineStatus(isEffectivelyOnline());
      setPendingSyncCount(getOutboxQueue().length);
    };
    syncNetworkBadge();
    window.addEventListener('ws96_offline_state_changed', syncNetworkBadge);
    window.addEventListener('online', syncNetworkBadge);
    window.addEventListener('offline', syncNetworkBadge);
    return () => {
      window.removeEventListener('ws96_offline_state_changed', syncNetworkBadge);
      window.removeEventListener('online', syncNetworkBadge);
      window.removeEventListener('offline', syncNetworkBadge);
    };
  }, []);

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
    const readDeletedSet = (extraDeleted?: string[]): Set<string> => {
      if (typeof window === 'undefined') return new Set();
      try {
        const raw = localStorage.getItem('ws96_deleted_nrps_v1');
        const parsed: string[] = raw ? JSON.parse(raw) : [];
        const combined = [...parsed, ...(Array.isArray(extraDeleted) ? extraDeleted : [])]
          .map((n) => String(n).trim())
          .filter((n) => n && n !== '98010710');
        const set = new Set(combined);
        if (set.size > 0) {
          localStorage.setItem('ws96_deleted_nrps_v1', JSON.stringify(Array.from(set)));
        }
        return set;
      } catch {
        return new Set();
      }
    };

    fetch('/api/auth/register')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.registrations)) {
          const deletedSet = readDeletedSet();
          let regOverrides: Record<string, any> = {};
          if (typeof window !== 'undefined') {
            try {
              const rawROv = localStorage.getItem('ws96_reg_overrides_v1');
              if (rawROv) regOverrides = JSON.parse(rawROv) || {};
            } catch {
              regOverrides = {};
            }
          }
          const count = data.registrations
            .filter((r: any) => !deletedSet.has(String(r.nrp || '').trim()))
            .map((r: any) => (regOverrides[r.nrp] ? { ...r, ...regOverrides[r.nrp] } : r))
            .filter((r: any) => r.status === 'PENDING_VERIFIKASI').length;
          setPendingVerificationCount(count);
        }
      })
      .catch(() => {});

    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        const usersList = data.users || data.data;
        if (data.success && Array.isArray(usersList)) {
          const deletedSet = readDeletedSet(data.deletedNrps);
          let userOverrides: Record<string, any> = {};
          if (typeof window !== 'undefined') {
            try {
              const rawUOv = localStorage.getItem('ws96_user_overrides_v1');
              if (rawUOv) userOverrides = JSON.parse(rawUOv) || {};
            } catch {
              userOverrides = {};
            }
          }
          const roleMap: Record<string, string> = {};
          usersList.forEach((u: AuthUser) => {
            if (deletedSet.has((u.nrp || '').trim()) || (u.oldNrp && deletedSet.has(u.oldNrp.trim()))) {
              return;
            }
            const ov =
              userOverrides[u.nrp] ||
              Object.values(userOverrides).find(
                (item: any) =>
                  item &&
                  (item.oldNrp === u.nrp ||
                    (u.id && item.id === u.id) ||
                    (item.nama &&
                      u.nama &&
                      item.nama.trim().toLowerCase() === u.nama.trim().toLowerCase()))
              );
            const effectiveNrp = ov?.nrp || u.nrp;
            const effectiveRole = ov?.role || u.role;
            if (effectiveNrp && effectiveRole && !deletedSet.has(effectiveNrp)) {
              roleMap[effectiveNrp] = effectiveRole;
            }
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('ws96_role_map', JSON.stringify(roleMap));
            window.dispatchEvent(new Event('ws96_roles_updated'));
          }
          setCurrentUser((prev) => {
            const matched = usersList.find(
              (u: AuthUser) =>
                u.nrp === prev.nrp ||
                (prev.oldNrp && u.nrp === prev.oldNrp) ||
                (u.id && u.id === prev.id)
            );
            const ov =
              userOverrides[prev.nrp] ||
              (prev.oldNrp ? userOverrides[prev.oldNrp] : undefined);
            if (!matched && !ov) return prev;
            const mergedSource = { ...(matched || {}), ...(ov || {}) };
            const nextUser: AuthUser = {
              ...prev,
              ...mergedSource,
              nrp: mergedSource.nrp || prev.nrp,
              nama:
                (mergedSource.nrp || prev.nrp) === '98010710' &&
                (mergedSource.nama === 'Eko Agung' || mergedSource.nama === 'Eko Agung Krisdianto')
                  ? 'Eko Agung Krisdianto, S.Kom.'
                  : mergedSource.nama || prev.nama,
              pangkat: mergedSource.pangkat || prev.pangkat,
              fotoUrl: resolveAvatarUrl(mergedSource.fotoUrl, prev.fotoUrl),
              coverUrl:
                mergedSource.coverUrl && mergedSource.coverUrl !== '/default-cover.jpg'
                  ? mergedSource.coverUrl
                  : prev.coverUrl || mergedSource.coverUrl,
            };
            if (typeof window !== 'undefined') {
              localStorage.setItem('ws96_auth_user', JSON.stringify(nextUser));
              localStorage.setItem('ws96_active_user', JSON.stringify(nextUser));
              localStorage.setItem('wirasatya96_current_user', JSON.stringify(nextUser));
            }
            return nextUser;
          });
        }
      })
      .catch(() => {});

    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        const list = data.members || data.data;
        if (data.success && Array.isArray(list) && list.length > 0) {
          const deletedSet = readDeletedSet(data.deletedNrps);
          let authUser: AuthUser | null = null;
          let memberOverrides: Record<string, AnggotaWiraSatya> = {};
          let userOverrides: Record<string, any> = {};
          if (typeof window !== 'undefined') {
            const rawAuth = localStorage.getItem('ws96_auth_user');
            if (rawAuth) {
              try {
                authUser = JSON.parse(rawAuth);
              } catch {
                authUser = null;
              }
            }
            const rawOverrides = localStorage.getItem('ws96_member_overrides_v1');
            if (rawOverrides) {
              try {
                memberOverrides = JSON.parse(rawOverrides) || {};
              } catch {
                memberOverrides = {};
              }
            }
            const rawUserOverrides = localStorage.getItem('ws96_user_overrides_v1');
            if (rawUserOverrides) {
              try {
                userOverrides = JSON.parse(rawUserOverrides) || {};
              } catch {
                userOverrides = {};
              }
            }
          }

          const isMemberTombstoned = (m: { nrp?: string; oldNrp?: string; id?: string }) => {
            const cleanNrp = (m.nrp || '').trim();
            const cleanOld = (m.oldNrp || '').trim();
            const cleanFromId = m.id?.startsWith('ws-') ? m.id.slice(3).trim() : '';
            return Boolean(
              (cleanNrp && deletedSet.has(cleanNrp)) ||
              (cleanOld && deletedSet.has(cleanOld)) ||
              (cleanFromId && deletedSet.has(cleanFromId))
            );
          };

          // Filter out tombstoned members; if server still had one (cold instance), sync DELETE in background
          const activeServerList = (list as AnggotaWiraSatya[]).filter((m) => {
            if (isMemberTombstoned(m)) {
              fetch(`/api/users?nrp=${encodeURIComponent(m.nrp)}`, { method: 'DELETE' }).catch(() => {});
              return false;
            }
            return true;
          });

          const sanitizedMembers = activeServerList.map((m: AnggotaWiraSatya) => {
            const localOverride =
              memberOverrides[m.nrp] ||
              (m.oldNrp ? memberOverrides[m.oldNrp] : undefined) ||
              Object.values(memberOverrides).find(
                (ov) =>
                  ov &&
                  (ov.oldNrp === m.nrp ||
                    ov.id === m.id ||
                    (ov.namaLengkap &&
                      m.namaLengkap &&
                      ov.namaLengkap.trim().toLowerCase() === m.namaLengkap.trim().toLowerCase()))
              );
            const uOverride =
              userOverrides[m.nrp] ||
              (m.oldNrp ? userOverrides[m.oldNrp] : undefined) ||
              (localOverride?.nrp ? userOverrides[localOverride.nrp] : undefined) ||
              Object.values(userOverrides).find(
                (ov: any) =>
                  ov &&
                  (ov.oldNrp === m.nrp ||
                    ov.id === `u-${m.nrp}` ||
                    ov.profileId === m.id ||
                    (ov.nama &&
                      m.namaLengkap &&
                      ov.nama.trim().toLowerCase() === m.namaLengkap.trim().toLowerCase()))
              );

            let baseMember: AnggotaWiraSatya = localOverride
              ? {
                  ...m,
                  ...localOverride,
                  nrp: localOverride.nrp || m.nrp,
                  oldNrp: localOverride.oldNrp || m.oldNrp || (localOverride.nrp && localOverride.nrp !== m.nrp ? m.nrp : undefined),
                  fotoUrl: resolveAvatarUrl(localOverride.fotoUrl, m.fotoUrl),
                  coverUrl:
                    localOverride.coverUrl && localOverride.coverUrl !== '/default-cover.jpg'
                      ? localOverride.coverUrl
                      : m.coverUrl || localOverride.coverUrl,
                }
              : m;

            if (uOverride) {
              const effectiveNrp = uOverride.nrp || baseMember.nrp;
              const effectiveBirth = uOverride.tanggalLahir || baseMember.tanggalLahir;
              const calc58 = calculateRetirement58(effectiveBirth || undefined, effectiveNrp);
              baseMember = {
                ...baseMember,
                nrp: effectiveNrp,
                oldNrp: uOverride.oldNrp || baseMember.oldNrp || (effectiveNrp !== m.nrp ? m.nrp : undefined),
                namaLengkap: uOverride.nama || baseMember.namaLengkap,
                pangkat: uOverride.pangkat || baseMember.pangkat,
                satuanKerja: uOverride.satker || baseMember.satuanKerja,
                polda: uOverride.polda || baseMember.polda,
                jabatanTerakhir: uOverride.jabatanTerakhir || baseMember.jabatanTerakhir,
                tanggalLahir: calc58.tanggalLahir,
                usia: calc58.usiaTahun,
                tahunPurnaTugas: calc58.tahunPurnaTugas,
                sisaTahunDinas: calc58.sisaTahunDinas,
                email: uOverride.email || baseMember.email,
                secondaryEmail:
                  uOverride.secondaryEmail !== undefined ? uOverride.secondaryEmail : baseMember.secondaryEmail,
                noHp: uOverride.noHp || baseMember.noHp,
              };
            }

            if (baseMember.jabatanTerakhir === 'Lead Developer') {
              baseMember = { ...baseMember, jabatanTerakhir: 'Staf' };
            }
            const cleanBaseName = stripRankFromName(baseMember.namaLengkap);
            if (cleanBaseName && cleanBaseName !== baseMember.namaLengkap) {
              baseMember = { ...baseMember, namaLengkap: cleanBaseName };
            }

            if (authUser && (baseMember.nrp === authUser.nrp || (authUser.oldNrp && baseMember.nrp === authUser.oldNrp))) {
              const merged: AnggotaWiraSatya = {
                ...baseMember,
                nrp: authUser.nrp || baseMember.nrp,
                pangkat: authUser.pangkat || baseMember.pangkat,
                satuanKerja: authUser.satker || baseMember.satuanKerja,
                polda: authUser.polda || baseMember.polda,
                fotoUrl: resolveAvatarUrl(baseMember.fotoUrl, authUser.fotoUrl),
                coverUrl:
                  baseMember.coverUrl && baseMember.coverUrl !== '/default-cover.jpg'
                    ? baseMember.coverUrl
                    : authUser.coverUrl || baseMember.coverUrl,
              };
              if (
                localOverride ||
                uOverride ||
                (isCustomAvatarUrl(authUser.fotoUrl) &&
                  (!m.fotoUrl || m.fotoUrl === '/default-avatar.png' || !isCustomAvatarUrl(m.fotoUrl)))
              ) {
                fetch('/api/members', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(merged),
                }).catch(() => {});
              }
              return merged;
            }

            if (localOverride || uOverride) {
              fetch('/api/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(baseMember),
              }).catch(() => {});
              if (uOverride) {
                fetch('/api/users', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    nrp: uOverride.oldNrp || m.nrp,
                    originalNrp: uOverride.oldNrp || m.nrp,
                    oldNrp: uOverride.oldNrp || m.nrp,
                    newNrp: baseMember.nrp,
                    ...uOverride,
                  }),
                }).catch(() => {});
              }
            }

            return {
              ...baseMember,
              fotoUrl: getAvatarUrl(baseMember.fotoUrl),
            };
          });

          // Append any locally created members missing from a cold-started serverless instance
          const existingMemberNrps = new Set<string>();
          sanitizedMembers.forEach((sm) => {
            if (sm.nrp) existingMemberNrps.add(sm.nrp.trim());
            if (sm.oldNrp) existingMemberNrps.add(sm.oldNrp.trim());
            if (sm.id?.startsWith('ws-')) existingMemberNrps.add(sm.id.slice(3).trim());
          });

          Object.values(memberOverrides).forEach((mOv) => {
            if (!mOv || !mOv.nrp || !mOv.namaLengkap) return;
            const cleanNrp = mOv.nrp.trim();
            const cleanOld = (mOv.oldNrp || '').trim();
            if (isMemberTombstoned(mOv)) return;
            if (!existingMemberNrps.has(cleanNrp) && (!cleanOld || !existingMemberNrps.has(cleanOld))) {
              existingMemberNrps.add(cleanNrp);
              sanitizedMembers.unshift({
                ...mOv,
                fotoUrl: getAvatarUrl(mOv.fotoUrl),
              });
              fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mOv),
              }).catch(() => {});
            }
          });

          setMembers(sanitizedMembers);
          setViewingMember((prev) =>
            prev
              ? sanitizedMembers.find((sm: AnggotaWiraSatya) => sm.nrp === prev.nrp || sm.id === prev.id) || null
              : null
          );
          localStorage.setItem('wirasatya96_members', JSON.stringify(sanitizedMembers));
        }
      })
      .catch(() => {});

    fetch('/api/finance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          let localFin: any = null;
          if (typeof window !== 'undefined') {
            try {
              const rawFin = localStorage.getItem('wirasatya96_finance');
              if (rawFin) localFin = JSON.parse(rawFin);
            } catch {
              localFin = null;
            }
          }
          const serverTrx: KasTransaction[] = Array.isArray(res.data.transactions) ? res.data.transactions : [];
          const localTrx: KasTransaction[] = Array.isArray(localFin?.transactions) ? localFin.transactions : [];
          // If server cold-started with 0 transactions while local browser has saved transactions, keep local & re-sync
          if (serverTrx.length === 0 && localTrx.length > 0) {
            setTransactions(localTrx);
            if (localFin?.summary) setFinanceSummary(localFin.summary);
          } else {
            if (res.data.summary) setFinanceSummary(res.data.summary);
            if (Array.isArray(res.data.transactions)) setTransactions(res.data.transactions);
          }

          const serverAssets: AssetPortfolioItem[] = Array.isArray(res.data.assets) ? res.data.assets : [];
          const localAssets: AssetPortfolioItem[] = Array.isArray(localFin?.assets) ? localFin.assets : [];
          if (serverAssets.length === 0 && localAssets.length > 0) {
            setAssets(localAssets);
          } else if (Array.isArray(res.data.assets)) {
            setAssets(res.data.assets);
          }

          let savedCfg: any = null;
          if (typeof window !== 'undefined') {
            try {
              const rawCfg = localStorage.getItem('ws96_finance_config_v1');
              if (rawCfg) savedCfg = JSON.parse(rawCfg);
              else if (localFin?.financeConfig) savedCfg = localFin.financeConfig;
            } catch {
              savedCfg = null;
            }
          }

          const serverCfg = res.data.financeConfig || res.financeConfig;
          const isServerDefaultCfg =
            !serverCfg || serverCfg.updatedBy === 'Sistem Default Kebendaharaan WS96';
          const hasCustomLocalCfg =
            savedCfg &&
            Number(savedCfg.iuranWajibPerBulan) > 0 &&
            savedCfg.updatedBy &&
            savedCfg.updatedBy !== 'Sistem Default Kebendaharaan WS96';

          const effectiveIuranPerBulan =
            isServerDefaultCfg && hasCustomLocalCfg
              ? Number(savedCfg.iuranWajibPerBulan)
              : Number(serverCfg?.iuranWajibPerBulan) || 250000;

          if (Array.isArray(res.data.iuranList) && res.data.iuranList.length > 0) {
            const annualTarget = effectiveIuranPerBulan * 12;
            const syncedIuran = res.data.iuranList.map((item: IuranAnggota) => {
              const status: IuranAnggota['status'] =
                item.totalTerbayar >= annualTarget
                  ? 'LUNAS'
                  : item.totalTerbayar > 0
                  ? 'SEBAGIAN'
                  : 'BELUM_BAYAR';
              return { ...item, totalTagihan: annualTarget, status };
            });
            setIuranList(syncedIuran);
          }

          if (isServerDefaultCfg && hasCustomLocalCfg && savedCfg) {
            fetch('/api/finance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'UPDATE_FINANCE_CONFIG',
                actorRole: 'SUPERADMIN',
                iuranWajibPerBulan: savedCfg.iuranWajibPerBulan,
                tahunBuku: savedCfg.tahunBuku,
                subKategoriMasuk: savedCfg.subKategoriMasuk,
                subKategoriKeluar: savedCfg.subKategoriKeluar,
                updatedBy: savedCfg.updatedBy,
              }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load from localStorage or API on initial mount
  useEffect(() => {
    // Non-destructively record storage version and clean legacy rank prefixes in cached overrides
    const currentVersion = localStorage.getItem('ws96_storage_version');
    if (currentVersion !== STORAGE_VERSION) {
      localStorage.removeItem('wirasatya96_members');
      try {
        const rawUOv = localStorage.getItem('ws96_user_overrides_v1');
        if (rawUOv) {
          const parsedUOv = JSON.parse(rawUOv) || {};
          Object.keys(parsedUOv).forEach((k) => {
            if (parsedUOv[k]?.nama) {
              parsedUOv[k].nama = stripRankFromName(parsedUOv[k].nama) || parsedUOv[k].nama;
            }
          });
          localStorage.setItem('ws96_user_overrides_v1', JSON.stringify(parsedUOv));
        }
        const rawMOv = localStorage.getItem('ws96_member_overrides_v1');
        if (rawMOv) {
          const parsedMOv = JSON.parse(rawMOv) || {};
          Object.keys(parsedMOv).forEach((k) => {
            if (parsedMOv[k]?.namaLengkap) {
              parsedMOv[k].namaLengkap = stripRankFromName(parsedMOv[k].namaLengkap) || parsedMOv[k].namaLengkap;
            }
          });
          localStorage.setItem('ws96_member_overrides_v1', JSON.stringify(parsedMOv));
        }
      } catch {
        // ignore storage parse error
      }
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
          if (
            parsed.nrp === '98010710' &&
            (parsed.nama === 'Eko Agung' || parsed.nama === 'Eko Agung Krisdianto')
          ) {
            parsed.nama = 'Eko Agung Krisdianto, S.Kom.';
            parsed.pangkat = parsed.pangkat || 'Briptu';
          }
          if (parsed.nama) {
            parsed.nama = stripRankFromName(parsed.nama) || parsed.nama;
          }
          const sanitizedUser: AuthUser = {
            ...parsed,
            fotoUrl: getAvatarUrl(parsed.fotoUrl),
            coverUrl: parsed.coverUrl,
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

    // Load Members while respecting tombstoned NRPs
    const rawDeletedOnMount = localStorage.getItem('ws96_deleted_nrps_v1');
    let deletedOnMount = new Set<string>();
    if (rawDeletedOnMount) {
      try {
        const parsedDel: string[] = JSON.parse(rawDeletedOnMount);
        deletedOnMount = new Set(parsedDel.map((n) => String(n).trim()).filter(Boolean));
      } catch {
        deletedOnMount = new Set();
      }
    }

    const savedMembers = localStorage.getItem('wirasatya96_members');
    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          const sanitizedMembers = parsed
            .filter(
              (m: AnggotaWiraSatya) =>
                !deletedOnMount.has((m.nrp || '').trim()) &&
                !(m.oldNrp && deletedOnMount.has(m.oldNrp.trim()))
            )
            .map((m: AnggotaWiraSatya) => ({
              ...m,
              namaLengkap: stripRankFromName(m.namaLengkap) || m.namaLengkap,
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
        if (parsed.iuranList && parsed.iuranList.length >= 10) {
          setIuranList(
            parsed.iuranList.filter((i: IuranAnggota) => !deletedOnMount.has((i.nrp || '').trim()))
          );
        }
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

    const handleUserUpdatedEvent = () => {
      const latestAuth = localStorage.getItem('ws96_auth_user');
      if (latestAuth) {
        try {
          const parsedLatest = JSON.parse(latestAuth);
          if (parsedLatest && parsedLatest.nrp) {
            setCurrentUser({
              ...parsedLatest,
              fotoUrl: getAvatarUrl(parsedLatest.fotoUrl),
            });
          }
        } catch {
          // ignore
        }
      }
    };

    const handleUserDeletedEvent = (evt: Event) => {
      const customEvt = evt as CustomEvent<{ nrps?: string[] }>;
      const nrps = customEvt.detail?.nrps || [];
      if (nrps.length === 0) return;
      const delSet = new Set(nrps.map((n) => String(n).trim()).filter(Boolean));
      setMembers((prev) =>
        prev.filter(
          (m) => !delSet.has((m.nrp || '').trim()) && !(m.oldNrp && delSet.has(m.oldNrp.trim()))
        )
      );
      setIuranList((prev) => prev.filter((i) => !delSet.has((i.nrp || '').trim())));
      setViewingMember((prev) =>
        prev && (delSet.has((prev.nrp || '').trim()) || (prev.oldNrp && delSet.has(prev.oldNrp.trim())))
          ? null
          : prev
      );
    };

    window.addEventListener('ws96_messages_updated', refreshMessages);
    window.addEventListener('ws96_user_updated', handleUserUpdatedEvent);
    window.addEventListener('ws96_user_deleted', handleUserDeletedEvent);
    return () => {
      window.removeEventListener('ws96_messages_updated', refreshMessages);
      window.removeEventListener('ws96_user_updated', handleUserUpdatedEvent);
      window.removeEventListener('ws96_user_deleted', handleUserDeletedEvent);
    };
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

  // Start editing a specific member (Admin/Sekretaris, self, or ADC of that Alumni)
  const handleStartEditMember = (member: AnggotaWiraSatya) => {
    const isAdcOfTarget =
      Boolean(currentUser.isAdcAccount && currentUser.adcOfNrp && currentUser.adcOfNrp === member.nrp);
    if (
      !['SUPERADMIN', 'SEKRETARIAT'].includes(currentUser.role) &&
      member.nrp !== currentUser.nrp &&
      !isAdcOfTarget
    ) {
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

  // Persist member override in localStorage so Vercel cold-starts never wipe user edits
  const persistMemberOverride = (member: AnggotaWiraSatya) => {
    if (typeof window === 'undefined') return;
    try {
      const calc58 = calculateRetirement58(member.tanggalLahir, member.nrp);
      const normalizedMember: AnggotaWiraSatya = {
        ...member,
        tanggalLahir: calc58.tanggalLahir,
        usia: calc58.usiaTahun,
        tahunPurnaTugas: calc58.tahunPurnaTugas,
        sisaTahunDinas: calc58.sisaTahunDinas,
      };
      const raw = localStorage.getItem('ws96_member_overrides_v1');
      const map: Record<string, AnggotaWiraSatya> = raw ? JSON.parse(raw) : {};
      if (normalizedMember.oldNrp && normalizedMember.oldNrp !== normalizedMember.nrp) {
        delete map[normalizedMember.oldNrp];
      }
      map[normalizedMember.nrp] = normalizedMember;
      localStorage.setItem('ws96_member_overrides_v1', JSON.stringify(map));

      // Also sync ws96_user_overrides_v1 so Manajemen User ("Edit Pengguna") stays 100% consistent
      const rawUserOv = localStorage.getItem('ws96_user_overrides_v1');
      const userMap: Record<string, any> = rawUserOv ? JSON.parse(rawUserOv) : {};
      const existingUOv =
        userMap[normalizedMember.nrp] ||
        (normalizedMember.oldNrp ? userMap[normalizedMember.oldNrp] : undefined) ||
        {};
      if (normalizedMember.oldNrp && normalizedMember.oldNrp !== normalizedMember.nrp) {
        delete userMap[normalizedMember.oldNrp];
      }
      const parentPassword =
        existingUOv.password ||
        (currentUser.nrp === normalizedMember.nrp ? currentUser.password : undefined);
      const nowIso = new Date().toISOString();

      userMap[normalizedMember.nrp] = {
        ...existingUOv,
        oldNrp: existingUOv.oldNrp || normalizedMember.oldNrp || normalizedMember.nrp,
        nrp: normalizedMember.nrp,
        nama: normalizedMember.namaLengkap,
        pangkat: normalizedMember.pangkat,
        satker: normalizedMember.satuanKerja,
        polda: normalizedMember.polda,
        jabatanTerakhir: normalizedMember.jabatanTerakhir,
        tanggalLahir: calc58.tanggalLahir,
        tempatLahir: normalizedMember.tempatLahir,
        email: normalizedMember.email || existingUOv.email || `${normalizedMember.nrp}@polri.go.id`,
        secondaryEmail:
          normalizedMember.secondaryEmail !== undefined
            ? normalizedMember.secondaryEmail
            : existingUOv.secondaryEmail,
        noHp: normalizedMember.noHp || existingUOv.noHp,
        fotoUrl: normalizedMember.fotoUrl,
        ...(normalizedMember.coverUrl ? { coverUrl: normalizedMember.coverUrl } : {}),
        ...(parentPassword ? { password: parentPassword, status: 'AKTIF' } : {}),
        updatedAt: nowIso,
      };

      // Also auto-generate / sync ADC accounts in ws96_user_overrides_v1 so ADC can login with NRP ADC + Alumni Password
      const activeAdcNrps = new Set<string>();
      if (Array.isArray(normalizedMember.daftarAdc)) {
        normalizedMember.daftarAdc.forEach((adc) => {
          const cleanAdcNrp = (adc.nrp || '').trim();
          if (!cleanAdcNrp || cleanAdcNrp === normalizedMember.nrp) return;
          activeAdcNrps.add(cleanAdcNrp);
          const existingAdcOv = userMap[cleanAdcNrp] || {};
          userMap[cleanAdcNrp] = {
            ...existingAdcOv,
            id: existingAdcOv.id || `u-adc-${cleanAdcNrp}`,
            profileId: normalizedMember.id || `ws-${normalizedMember.nrp}`,
            nrp: cleanAdcNrp,
            nama: (adc.nama || `ADC ${normalizedMember.namaLengkap}`).trim(),
            pangkat: adc.pangkat || 'Briptu',
            role: 'ANGGOTA',
            jabatanTerakhir: 'ADC',
            tanggalLahir: adc.tanggalLahir,
            satker: normalizedMember.satuanKerja,
            polda: normalizedMember.polda,
            email: (adc.email || `${cleanAdcNrp}@polri.go.id`).trim(),
            noHp: adc.noHp || '',
            fotoUrl: existingAdcOv.fotoUrl || '/default-avatar.png',
            isAdcAccount: true,
            adcOfNrp: normalizedMember.nrp,
            adcOfNama: normalizedMember.namaLengkap,
            adcOfPangkat: normalizedMember.pangkat,
            ...(parentPassword ? { password: parentPassword, status: 'AKTIF' } : {}),
            updatedAt: nowIso,
          };
        });
      }

      // Remove obsolete ADC overrides for this Alumni
      Object.keys(userMap).forEach((key) => {
        const item = userMap[key];
        if (
          item?.isAdcAccount &&
          (item.adcOfNrp === normalizedMember.nrp ||
            (normalizedMember.oldNrp && item.adcOfNrp === normalizedMember.oldNrp)) &&
          !activeAdcNrps.has(item.nrp)
        ) {
          delete userMap[key];
        }
      });

      localStorage.setItem('ws96_user_overrides_v1', JSON.stringify(userMap));
    } catch {
      // ignore
    }
  };

  // Save member profile
  const handleSaveMember = async (newMember: AnggotaWiraSatya) => {
    const prevEditing = editingMember !== 'NEW' && editingMember ? editingMember : null;
    const calc58 = calculateRetirement58(newMember.tanggalLahir, newMember.nrp);
    const preservedOldNrp =
      newMember.oldNrp ||
      prevEditing?.oldNrp ||
      (prevEditing && prevEditing.nrp !== newMember.nrp ? prevEditing.nrp : undefined);

    const cleanMember: AnggotaWiraSatya = {
      ...newMember,
      ...(preservedOldNrp ? { oldNrp: preservedOldNrp } : {}),
      tanggalLahir: calc58.tanggalLahir,
      usia: calc58.usiaTahun,
      tahunPurnaTugas: calc58.tahunPurnaTugas,
      sisaTahunDinas: calc58.sisaTahunDinas,
      fotoUrl: getAvatarUrl(newMember.fotoUrl),
    };
    const existingIndex = members.findIndex(
      (m) =>
        m.nrp === cleanMember.nrp ||
        (preservedOldNrp && m.nrp === preservedOldNrp) ||
        (cleanMember.id && m.id === cleanMember.id)
    );
    let updatedList: AnggotaWiraSatya[];
    if (existingIndex >= 0) {
      updatedList = [...members];
      updatedList[existingIndex] = {
        ...cleanMember,
        id: members[existingIndex].id || cleanMember.id || ('ws-' + Date.now()),
      };
    } else {
      const createdMember: AnggotaWiraSatya = {
        ...cleanMember,
        id: cleanMember.id || ('ws-' + Date.now()),
      };
      updatedList = [createdMember, ...members];
      if (typeof window !== 'undefined') {
        try {
          const rawDeleted = localStorage.getItem('ws96_deleted_nrps_v1');
          if (rawDeleted) {
            const parsedDeleted: string[] = JSON.parse(rawDeleted);
            const nextDeleted = parsedDeleted.filter((n) => n !== cleanMember.nrp);
            localStorage.setItem('ws96_deleted_nrps_v1', JSON.stringify(nextDeleted));
          }
        } catch {
          // ignore
        }
      }
    }
    setMembers(updatedList);
    persistMemberOverride(cleanMember);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_members', JSON.stringify(updatedList));
    }

    // If the user updated their own profile, sync currentUser as well
    if (
      cleanMember.nrp === currentUser.nrp ||
      (preservedOldNrp && preservedOldNrp === currentUser.nrp)
    ) {
      const updatedUser: AuthUser = {
        ...currentUser,
        nrp: cleanMember.nrp,
        ...(preservedOldNrp ? { oldNrp: preservedOldNrp } : {}),
        nama: cleanMember.namaLengkap,
        pangkat: cleanMember.pangkat,
        satker: cleanMember.satuanKerja,
        polda: cleanMember.polda,
        jabatanTerakhir: cleanMember.jabatanTerakhir,
        tanggalLahir: cleanMember.tanggalLahir,
        tempatLahir: cleanMember.tempatLahir,
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

    if (getActiveAdcSessionFromStorage()) {
      recordAdcActivityToAuditLog({
        action: 'AKTIVITAS_ADC',
        details: `Menyimpan pembaruan profil & data kedinasan Pimpinan ${cleanMember.pangkat} ${cleanMember.namaLengkap}`,
      });
    }

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

  // Add new cash transaction (BENDAHARA & SUPERADMIN)
  const handleAddTransaction = async (trxData: Omit<KasTransaction, 'id' | 'createdAt'>) => {
    if (currentUser.role !== 'BENDAHARA' && currentUser.role !== 'SUPERADMIN') return;

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

  // Add new portfolio asset (BENDAHARA & SUPERADMIN)
  const handleAddAsset = async (assetData: Omit<AssetPortfolioItem, 'id' | 'updatedAt'>) => {
    if (currentUser.role !== 'BENDAHARA' && currentUser.role !== 'SUPERADMIN') return;

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

  // Delete portfolio asset (BENDAHARA & SUPERADMIN)
  const handleDeleteAsset = async (id: string) => {
    if (currentUser.role !== 'BENDAHARA' && currentUser.role !== 'SUPERADMIN') return;

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

  // Pay membership dues (BENDAHARA & SUPERADMIN)
  const handlePayIuran = async (nrp: string, nominal: number) => {
    if (currentUser.role !== 'BENDAHARA' && currentUser.role !== 'SUPERADMIN') return;

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
    localStorage.removeItem('ws96_adc_session');
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
    persistMemberOverride(updatedMember);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wirasatya96_members', JSON.stringify(updatedList));
    }
    if (getActiveAdcSessionFromStorage()) {
      recordAdcActivityToAuditLog({
        action: 'AKTIVITAS_ADC',
        details: `Memperbarui jabatan Pimpinan menjadi ${jabatanBaru} pada ${satkerBaru} (${poldaBaru})`,
      });
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

      {/* Top Red Ribbon: [Live Sync & Redis Cache Beacon] Online/Offline | Running Text Notifikasi */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-900/40 text-slate-200 text-xs py-1.5 px-3 sm:px-6 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 text-[11px]">
          {/* Left: Interactive Lamp Beacon + Online/Offline Sync Status */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0 hover:opacity-90 transition cursor-pointer"
            title="Klik untuk membuka status Redis Cache & Mode Offline Tersinkronisasi"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnlineStatus ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isOnlineStatus
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                }`}
              />
            </span>
            <span
              className={`font-extrabold tracking-wide ${
                isOnlineStatus ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {isOnlineStatus ? 'Online' : 'Mode Offline'}
            </span>
            {pendingSyncCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                {pendingSyncCount} Sync
              </span>
            )}
          </button>

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

      {/* Offline Sync Alert Bar & Redis Cache Telemetry Modal */}
      <OfflineSyncBanner
        onSyncCompleted={fetchPendingVerificationCount}
        isModalOpenExternal={isSyncModalOpen}
        onCloseModalExternal={() => setIsSyncModalOpen(false)}
      />

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
              persistMemberOverride(updated);
              if (getActiveAdcSessionFromStorage()) {
                recordAdcActivityToAuditLog({
                  action: 'AKTIVITAS_ADC',
                  details: `Memperbarui profil langsung Pimpinan ${updated.pangkat} ${updated.namaLengkap}`,
                });
              }
              setMembers((prev) => {
                const nextList = prev.map((m) => (m.nrp === updated.nrp || m.id === updated.id ? updated : m));
                if (typeof window !== 'undefined') {
                  localStorage.setItem('wirasatya96_members', JSON.stringify(nextList));
                }
                return nextList;
              });
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

      {/* Floating Messenger Launcher & Pop-up Module at Bottom Right */}
      {activeTab !== 'pesan' && (
        <LinkedInChatDock
          members={members}
          currentUserName={currentUser.nama}
          currentUserNrp={currentUser.nrp}
          onOpenFullMessaging={() => {
            setViewingMember(null);
            setActiveTab('pesan');
          }}
        />
      )}
    </div>
  );
}
