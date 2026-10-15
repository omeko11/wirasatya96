'use client';

import React, { useState, useEffect } from 'react';
import { AuthUser, PendingRegistration, UserAccountStatus, UserRole, DAFTAR_PANGKAT_POLRI } from '@/types';
import { ROLE_PERMISSIONS } from '@/data/mockUsers';
import { SatkerBerjenjangModal, SatkerSelectionResult } from './SatkerBerjenjangModal';
import { MetaVerifiedBadge } from './MetaVerifiedBadge';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Search, 
  RotateCw,
  Phone,
  Mail,
  Building2,
  Clock,
  AlertCircle,
  Users,
  UserPlus,
  Trash2,
  FilePlus2,
  KeyRound,
  Pencil,
  Lock,
  Eye,
  EyeOff,
  IdCard,
  Check,
  Info
} from 'lucide-react';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  onVerificationUpdate?: () => void;
  onOpenFullWizard?: () => void;
  onEditMemberByNrp?: (nrp: string) => void;
  initialTab?: 'USERS' | 'VERIFICATION' | 'ADD_USER';
  asPage?: boolean;
  currentUserRole?: UserRole;
  currentUserNrp?: string;
  onImpersonateUser?: (user: AuthUser) => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ANGGOTA', label: 'Anggota (Alumni Wira Satya 96 / ADC)' },
  { value: 'SEKRETARIAT', label: 'Sekretaris (Admin Data & User)' },
  { value: 'BENDAHARA', label: 'Bendahara (Pengelola Kas & Aset)' },
  { value: 'KETUA', label: 'Ketua Paguyuban (Pengurus Pusat)' },
  { value: 'SUPERADMIN', label: 'Superadmin (Administrator Sistem)' },
];

const PANGKAT_OPTIONS = [...DAFTAR_PANGKAT_POLRI];

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  isOpen,
  onClose,
  adminName,
  onVerificationUpdate,
  onOpenFullWizard,
  onEditMemberByNrp,
  initialTab = 'USERS',
  asPage = false,
  currentUserRole,
  currentUserNrp,
  onImpersonateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'VERIFICATION' | 'ADD_USER'>(initialTab);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters for Users tab
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [updatingUserNrp, setUpdatingUserNrp] = useState<string | null>(null);

  // CAS-style Add User Modal state (when clicking "+ Tambah Pengguna")
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Edit User Modal state (inside Manajemen Pengguna)
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editPangkat, setEditPangkat] = useState('Kombes Pol');
  const [editRole, setEditRole] = useState<UserRole>('ANGGOTA');
  const [editPolda, setEditPolda] = useState('MABES POLRI');
  const [editSatkerUtama, setEditSatkerUtama] = useState('BARESKRIM POLRI');
  const [editSubSatker, setEditSubSatker] = useState('');
  const [editComposedSatker, setEditComposedSatker] = useState('BARESKRIM POLRI');
  const [editKodeSatker, setEditKodeSatker] = useState('060.01.00.01');
  const [editEmail, setEditEmail] = useState('');
  const [editSecondaryEmail, setEditSecondaryEmail] = useState('');
  const [editNoHp, setEditNoHp] = useState('');

  // Filters for Verification tab
  const [regSearch, setRegSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | UserAccountStatus>('PENDING_VERIFIKASI');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedApproveRoles, setSelectedApproveRoles] = useState<Record<string, UserRole>>({});

  // Add User Form state (CAS 2-Column Layout + Satker Berjenjang Modal)
  const [newNrp, setNewNrp] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newPangkat, setNewPangkat] = useState('Kombes Pol');
  const [newRole, setNewRole] = useState<UserRole>('ANGGOTA');
  const [newPolda, setNewPolda] = useState('');
  const [newSatkerUtama, setNewSatkerUtama] = useState('');
  const [newSubSatker, setNewSubSatker] = useState('');
  const [newComposedSatker, setNewComposedSatker] = useState('');
  const [newKodeSatker, setNewKodeSatker] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSecondaryEmail, setNewSecondaryEmail] = useState('');
  const [newNoHp, setNewNoHp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // CAS-Style "Pilih Satker Berjenjang" Modal State
  const [satkerPickerMode, setSatkerPickerMode] = useState<'ADD' | 'EDIT' | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const canImpersonate =
    currentUserRole === 'SUPERADMIN' ||
    currentUserNrp === '98010710' ||
    adminName.toLowerCase().includes('eko agung');

  const openSatkerPicker = (mode: 'ADD' | 'EDIT') => {
    setSatkerPickerMode(mode);
  };

  const handleApplySatkerFromModal = (result: SatkerSelectionResult) => {
    if (satkerPickerMode === 'EDIT') {
      setEditPolda(result.polda);
      setEditSatkerUtama(result.satkerUtama);
      setEditSubSatker(result.subSatker);
      setEditComposedSatker(result.composedSatker);
      setEditKodeSatker(result.kodeSatker);
    } else if (satkerPickerMode === 'ADD') {
      setNewPolda(result.polda);
      setNewSatkerUtama(result.satkerUtama);
      setNewSubSatker(result.subSatker);
      setNewComposedSatker(result.composedSatker);
      setNewKodeSatker(result.kodeSatker);
    }
    setSatkerPickerMode(null);
  };

  const handleNewNrpChange = (rawVal: string) => {
    const digitsOnly = rawVal.replace(/\D/g, '');
    const oldAutoEmail = `${newNrp}@polri.go.id`;
    setNewNrp(digitsOnly);
    if (!newEmail.trim() || newEmail.trim() === oldAutoEmail) {
      setNewEmail(digitsOnly ? `${digitsOnly}@polri.go.id` : '');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, regRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/auth/register'),
      ]);
      const usersData = await usersRes.json();
      const regData = await regRes.json();

      if (usersData.success && Array.isArray(usersData.data)) {
        setUsers(usersData.data);
      }
      if (regData.success && Array.isArray(regData.registrations)) {
        setRegistrations(regData.registrations);
      }
    } catch (err) {
      console.error('Failed to fetch user management data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen || asPage) {
      setActiveTab(initialTab);
      fetchAllData();
    }
  }, [isOpen, asPage, initialTab]);

  if (!isOpen && !asPage) return null;

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRoleChange = async (nrp: string, nextRole: UserRole) => {
    setUpdatingUserNrp(nrp);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrp, role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Role pengguna NRP ${nrp} berhasil diubah menjadi ${nextRole}.`, 'success');
        await fetchAllData();
        if (onVerificationUpdate) onVerificationUpdate();
      } else {
        showToast(data.message || 'Gagal mengubah role pengguna.', 'error');
      }
    } catch {
      showToast('Kesalahan jaringan saat mengubah role.', 'error');
    } finally {
      setUpdatingUserNrp(null);
    }
  };

  const handleStartEditUser = (u: AuthUser) => {
    const poldaVal = u.polda || 'MABES POLRI';
    const satkerVal = u.satker || 'BARESKRIM POLRI';
    const regMatch = registrations.find((r) => r.nrp === u.nrp);
    setEditingUser(u);
    setEditNama(u.nama);
    setEditPangkat(u.pangkat || 'Kombes Pol');
    setEditRole(u.role);
    setEditPolda(poldaVal);
    setEditSatkerUtama(satkerVal);
    setEditSubSatker('');
    setEditComposedSatker(satkerVal);
    setEditKodeSatker('060.01.00.01');
    setEditEmail(u.email || `${u.nrp}@polri.go.id`);
    setEditSecondaryEmail(u.secondaryEmail || regMatch?.secondaryEmail || '');
    setEditNoHp(u.noHp || regMatch?.noHp || '');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUserNrp(editingUser.nrp);
    const composedSatker =
      editComposedSatker ||
      (editSubSatker && editSubSatker !== 'Pimpinan / Staf Utama Satker'
        ? `${editSubSatker} - ${editSatkerUtama}`
        : editSatkerUtama) ||
      'MABES POLRI';

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nrp: editingUser.nrp,
          nama: editNama.trim(),
          pangkat: editPangkat,
          role: editRole,
          polda: editPolda || 'MABES POLRI',
          satker: composedSatker,
          email: editEmail.trim() || `${editingUser.nrp}@polri.go.id`,
          secondaryEmail: editSecondaryEmail.trim(),
          noHp: editNoHp.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Data, Email & Satker ${editNama} (NRP ${editingUser.nrp}) berhasil diperbarui.`, 'success');
        setEditingUser(null);
        await fetchAllData();
        if (onVerificationUpdate) onVerificationUpdate();
      } else {
        showToast(data.message || 'Gagal memperbarui data pengguna.', 'error');
      }
    } catch {
      showToast('Kesalahan jaringan saat menyimpan perubahan.', 'error');
    } finally {
      setUpdatingUserNrp(null);
    }
  };

  const handleDeleteUser = async (user: AuthUser) => {
    if (user.nrp === '98010710') {
      showToast('Akun Superadmin utama tidak dapat dihapus.', 'error');
      return;
    }
    setUpdatingUserNrp(user.nrp);
    try {
      const res = await fetch(`/api/users?nrp=${encodeURIComponent(user.nrp)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Pengguna ${user.nama} (NRP ${user.nrp}) berhasil dihapus.`, 'success');
        await fetchAllData();
        if (onVerificationUpdate) onVerificationUpdate();
      } else {
        showToast(data.message || 'Gagal menghapus pengguna.', 'error');
      }
    } catch {
      showToast('Kesalahan jaringan saat menghapus pengguna.', 'error');
    } finally {
      setUpdatingUserNrp(null);
    }
  };

  const handleVerify = async (reg: PendingRegistration, action: 'APPROVE' | 'REJECT') => {
    setActionLoadingId(reg.id);
    const assignedRole = selectedApproveRoles[reg.id] || 'ANGGOTA';
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reg.id,
          nrp: reg.nrp,
          action,
          role: assignedRole,
          verifierName: adminName || 'Admin / Sekretaris WS96',
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          action === 'APPROVE' 
            ? `Pendaftaran ${reg.nama} disetujui sebagai ${assignedRole}!` 
            : `Pendaftaran ${reg.nama} telah ditolak.`,
          'success'
        );
        await fetchAllData();
        if (onVerificationUpdate) onVerificationUpdate();
      } else {
        showToast(data.message || 'Gagal memproses verifikasi.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetAddUserForm = () => {
    setNewNrp('');
    setNewNama('');
    setNewEmail('');
    setNewSecondaryEmail('');
    setNewNoHp('');
    setNewPassword('');
    setNewConfirmPassword('');
    setNewRole('ANGGOTA');
    setNewPolda('');
    setNewSatkerUtama('');
    setNewSubSatker('');
    setNewComposedSatker('');
    setNewKodeSatker('');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNrp.trim() || !newNama.trim()) {
      showToast('NRP dan Nama Lengkap wajib diisi.', 'error');
      return;
    }
    if (!newPolda || !newComposedSatker) {
      showToast('Silakan pilih Satker Melekat terlebih dahulu melalui tombol Pilih Satker Berjenjang.', 'error');
      openSatkerPicker('ADD');
      return;
    }
    if (newPassword.trim() && newConfirmPassword.trim() && newPassword.trim() !== newConfirmPassword.trim()) {
      showToast('Konfirmasi Password tidak cocok dengan Password.', 'error');
      return;
    }

    const rawEmail = newEmail.trim();
    const resolvedEmail =
      !rawEmail
        ? `${newNrp.trim()}@polri.go.id`
        : /^\d+$/.test(rawEmail)
        ? `${rawEmail}@polri.go.id`
        : rawEmail;

    setCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nrp: newNrp.trim(),
          nama: newNama.trim(),
          pangkat: newPangkat,
          role: newRole,
          satker: newComposedSatker || newSatkerUtama || 'MABES POLRI',
          polda: newPolda || 'MABES POLRI',
          email: resolvedEmail,
          secondaryEmail: newSecondaryEmail.trim() || undefined,
          noHp: newNoHp.trim(),
          password: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Pengguna baru berhasil ditambahkan!', 'success');
        resetAddUserForm();
        setShowAddUserModal(false);
        await fetchAllData();
        if (onVerificationUpdate) onVerificationUpdate();
        setActiveTab('USERS');
      } else {
        showToast(data.message || 'Gagal menambahkan pengguna.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat menambahkan pengguna.', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const visibleRoleOptions = canImpersonate
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value !== 'SUPERADMIN');

  const visibleUsers = canImpersonate
    ? users
    : users.filter((u) => u.role !== 'SUPERADMIN' && u.nrp !== '98010710');

  const filteredUsers = visibleUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch =
      u.nama.toLowerCase().includes(q) ||
      u.nrp.toLowerCase().includes(q) ||
      (u.satker || '').toLowerCase().includes(q) ||
      (u.polda || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.secondaryEmail || '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  const filteredRegistrations = registrations.filter((r) => {
    if (!canImpersonate && r.nrp === '98010710') return false;
    const q = regSearch.toLowerCase();
    const matchesSearch = 
      r.nama.toLowerCase().includes(q) ||
      r.nrp.includes(q) ||
      r.satker.toLowerCase().includes(q) ||
      r.polda.toLowerCase().includes(q);
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  const pendingCount = registrations.filter(
    (r) => (canImpersonate || r.nrp !== '98010710') && r.status === 'PENDING_VERIFIKASI'
  ).length;

  const isUserAccountActive = (u: AuthUser, regInfo?: PendingRegistration): boolean => {
    if (
      u.status === 'AKTIF' ||
      regInfo?.status === 'AKTIF' ||
      u.nrp === '98010710' ||
      u.nrp === currentUserNrp ||
      Boolean(u.password || regInfo?.password)
    ) {
      return true;
    }
    if (typeof window !== 'undefined') {
      try {
        const savedAuth = localStorage.getItem('ws96_auth_user');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed?.nrp === u.nrp) return true;
        }
        const savedImp = localStorage.getItem('ws96_impersonator_user');
        if (savedImp) {
          const parsed = JSON.parse(savedImp);
          if (parsed?.nrp === u.nrp) return true;
        }
      } catch {
        // ignore
      }
    }
    return false;
  };

  // Shared 2-Column CAS Add User Form Content
  const renderCasAddUserForm = (onCancel: () => void) => (
    <form onSubmit={handleAddUser} autoComplete="off" className="space-y-5 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KOLOM KIRI: IDENTITAS & SATKER */}
        <div className="space-y-3.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 pb-1 border-b border-slate-100">
            <IdCard className="w-4 h-4" />
            <span>🪪 IDENTITAS &amp; SATKER</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap &amp; Gelar <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              name="ws96_new_nama"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              placeholder="Contoh: Kombes Pol. Budi Santoso, S.I.K."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              NRP / NIP (wajib angka) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              name="ws96_new_nrp"
              value={newNrp}
              onChange={(e) => handleNewNrpChange(e.target.value)}
              placeholder="Contoh: 98010710"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pangkat</label>
              <select
                value={newPangkat}
                onChange={(e) => setNewPangkat(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
              >
                {PANGKAT_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Role Akses <span className="text-red-600">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
              >
                {visibleRoleOptions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SATKER MELEKAT (ALA CAS) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Satker Melekat <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-col gap-2 min-w-0">
              <div
                onClick={() => openSatkerPicker('ADD')}
                className={`w-full min-w-0 overflow-hidden px-3 py-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-colors ${
                  newComposedSatker
                    ? 'bg-slate-50 border-slate-200 hover:border-blue-400'
                    : 'bg-slate-50 border-dashed border-slate-300 hover:border-blue-400'
                }`}
              >
                {newComposedSatker ? (
                  <>
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <span className="font-bold text-slate-900 block truncate text-[11px]">
                        {newComposedSatker}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                        <span className="truncate">{newPolda}</span>
                        {newKodeSatker && (
                          <span className="font-mono text-slate-400 shrink-0">({newKodeSatker})</span>
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                    <span>🔒 — Belum Memilih Satker —</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openSatkerPicker('ADD')}
                className="w-full px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Pilih Satker Berjenjang</span>
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: AKUN & KREDENSIAL */}
        <div className="space-y-3.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 pb-1 border-b border-slate-100">
            <Lock className="w-4 h-4" />
            <span>🔐 AKUN &amp; KREDENSIAL</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Dinas (@polri.go.id)
            </label>
            <input
              type="email"
              autoComplete="off"
              name="ws96_new_email_dinas"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onBlur={() => {
                if (/^\d+$/.test(newEmail.trim())) {
                  setNewEmail(`${newEmail.trim()}@polri.go.id`);
                }
              }}
              placeholder={newNrp ? `${newNrp}@polri.go.id` : 'nrp@polri.go.id'}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Sekunder / Pribadi <span className="text-slate-400 font-normal">(Opsional — misal Gmail, Yahoo)</span>
            </label>
            <input
              type="email"
              autoComplete="off"
              name="ws96_new_email_sekunder"
              value={newSecondaryEmail}
              onChange={(e) => setNewSecondaryEmail(e.target.value)}
              placeholder="Contoh: agungkrisdianto98@gmail.com"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp</label>
            <input
              type="tel"
              autoComplete="off"
              name="ws96_new_nohp"
              value={newNoHp}
              onChange={(e) => setNewNoHp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  name="ws96_new_password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kosongkan jika set mandiri"
                  className="w-full pl-3.5 pr-8 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  name="ws96_new_confirm_password"
                  value={newConfirmPassword}
                  onChange={(e) => setNewConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full pl-3.5 pr-8 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        {onOpenFullWizard ? (
          <button
            type="button"
            onClick={() => {
              setShowAddUserModal(false);
              if (!asPage) onClose();
              onOpenFullWizard();
            }}
            className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1.5"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Form Pendataan Lengkap (5 Tahap)</span>
          </button>
        ) : <span />}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-bold text-xs transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={creatingUser}
            className="px-5 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{creatingUser ? 'Menyimpan...' : 'Simpan Pengguna'}</span>
          </button>
        </div>
      </div>
    </form>
  );

  const innerContent = (
    <div
      className={
        asPage
          ? 'bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col'
          : 'bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp'
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-red-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/60 border border-red-700/50 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-1.5">
                <span>User</span>
                <span
                  title="Kelola daftar pengguna, hak akses role, impersonate, dan verifikasi pendaftaran"
                  className="inline-flex items-center text-slate-300 hover:text-white cursor-help"
                >
                  <Info className="w-4 h-4" />
                </span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                Otoritas: Sekretaris
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-extrabold animate-pulse">
                  {pendingCount} Menunggu Verifikasi
                </span>
              )}
            </div>
          </div>
        </div>
        {!asPage && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100 px-4 pt-2.5 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'USERS'
                ? 'bg-white text-red-900 border-slate-200 shadow-sm -mb-px pb-2.5'
                : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pengguna ({visibleUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'VERIFICATION'
                ? 'bg-white text-red-900 border-slate-200 shadow-sm -mb-px pb-2.5'
                : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi Pendaftaran</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="mb-1.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-800 hover:bg-slate-50 transition-colors"
          title="Segarkan data"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-800' : ''}`} />
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`py-2 px-4 text-xs font-semibold flex items-center gap-2 ${
          toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TAB 1: DAFTAR PENGGUNA */}
      {activeTab === 'USERS' && (
        <>
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari pengguna berdasarkan NRP, Nama, Email, Role, atau Satker..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | UserRole)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="ALL">Semua Role ({visibleUsers.length})</option>
                {canImpersonate && <option value="SUPERADMIN">Superadmin</option>}
                <option value="KETUA">Ketua Paguyuban</option>
                <option value="SEKRETARIAT">Sekretaris</option>
                <option value="BENDAHARA">Bendahara</option>
                <option value="ANGGOTA">Anggota</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  resetAddUserForm();
                  setShowAddUserModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Pengguna</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-sm">Tidak ada pengguna ditemukan</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const regInfo = registrations.find((r) => r.nrp === u.nrp);
                const isActive = isUserAccountActive(u, regInfo);
                const secondaryEmail = u.secondaryEmail || regInfo?.secondaryEmail;
                const showPangkat =
                  Boolean(u.pangkat) &&
                  !u.nama.toLowerCase().trim().startsWith((u.pangkat || '').toLowerCase().trim());

                return (
                  <div
                    key={u.nrp}
                    className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{u.nama}</span>
                          <MetaVerifiedBadge role={u.role} nrp={u.nrp} size="sm" />
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
                          NRP {u.nrp}
                          {showPangkat ? ` • ${u.pangkat}` : ''}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>Belum Aktivasi</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.satker || 'Mabes Polri'} &bull; {u.polda || 'MABES POLRI'}</span>
                        </span>
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-600">
                            {u.email || `${u.nrp}@polri.go.id`}
                          </span>
                          {secondaryEmail && (
                            <span className="text-slate-400">
                              ({secondaryEmail})
                            </span>
                          )}
                        </span>
                        {(u.noHp || regInfo?.noHp) && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.noHp || regInfo?.noHp}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Ubah Hak Akses / Role</label>
                        <select
                          value={u.role}
                          disabled={updatingUserNrp === u.nrp}
                          onChange={(e) => handleRoleChange(u.nrp, e.target.value as UserRole)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-800 disabled:opacity-50"
                        >
                          {visibleRoleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.value === 'SEKRETARIAT' ? 'SEKRETARIS' : opt.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {canImpersonate && u.nrp !== '98010710' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onImpersonateUser) {
                              onImpersonateUser(u);
                            }
                          }}
                          disabled={updatingUserNrp === u.nrp}
                          className="mt-4 px-2.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          title="Masuk sebagai akun ini (Impersonate Superadmin)"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Impersonate</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEditUser(u)}
                        disabled={updatingUserNrp === u.nrp}
                        className="mt-4 px-2.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Edit Data, Pangkat & Master Satker"
                      >
                        <Pencil className="w-3.5 h-3.5 text-red-800" />
                        <span>Edit</span>
                      </button>

                      {u.nrp !== '98010710' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          disabled={updatingUserNrp === u.nrp}
                          className="mt-4 p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* TAB 2: VERIFIKASI PENDAFTARAN */}
      {activeTab === 'VERIFICATION' && (
        <>
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="Cari antrean berdasarkan NRP, Nama, Satker, atau Polda..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setFilterStatus('PENDING_VERIFIKASI')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  filterStatus === 'PENDING_VERIFIKASI'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Menunggu ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('DISETUJUI_BELUM_PASSWORD')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filterStatus === 'DISETUJUI_BELUM_PASSWORD'
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Disetujui
              </button>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({registrations.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {filteredRegistrations.length === 0 ? (
              <div className="py-12 text-center">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-sm">Tidak ada pendaftaran dengan kriteria ini</p>
                <p className="text-xs text-slate-400 mt-1">
                  Semua alumni yang mendaftar telah diproses atau belum ada antrean baru.
                </p>
              </div>
            ) : (
              filteredRegistrations.map((reg) => (
                <div 
                  key={reg.id} 
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {reg.nama}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                          NRP {reg.nrp}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-900 font-bold border border-red-200">
                          {reg.pangkat}
                        </span>

                        {reg.status === 'PENDING_VERIFIKASI' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Menunggu Verifikasi
                          </span>
                        )}
                        {reg.status === 'DISETUJUI_BELUM_PASSWORD' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui (Belum Set Password)
                          </span>
                        )}
                        {reg.status === 'AKTIF' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Akun Aktif
                          </span>
                        )}
                        {reg.status === 'DITOLAK' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{reg.satker} &bull; {reg.polda}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{reg.noHp || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{reg.email}</span>
                          {reg.secondaryEmail && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                              &bull; Sekunder: {reg.secondaryEmail}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Diajukan: {new Date(reg.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        </div>
                      </div>

                      {reg.alasanDaftar && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                          &quot;{reg.alasanDaftar}&quot;
                        </p>
                      )}

                      {reg.verifiedBy && (
                        <p className="text-[11px] text-slate-400 pt-1">
                          Diverifikasi oleh: <strong className="text-slate-600">{reg.verifiedBy}</strong> pada {new Date(reg.verifiedAt || '').toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-stretch sm:items-end gap-2 pt-2 sm:pt-0 flex-shrink-0">
                      {reg.status === 'PENDING_VERIFIKASI' ? (
                        <>
                          <div className="w-full sm:w-44">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                              Tetapkan Role Saat Disetujui:
                            </label>
                            <select
                              value={selectedApproveRoles[reg.id] || 'ANGGOTA'}
                              onChange={(e) =>
                                setSelectedApproveRoles((prev) => ({
                                  ...prev,
                                  [reg.id]: e.target.value as UserRole,
                                }))
                              }
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                            >
                              {visibleRoleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.value === 'SEKRETARIAT' ? 'SEKRETARIS' : opt.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex sm:flex-row gap-2 w-full sm:w-44">
                            <button
                              onClick={() => handleVerify(reg, 'APPROVE')}
                              disabled={actionLoadingId === reg.id}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === reg.id ? '...' : 'Setujui'}</span>
                            </button>
                            <button
                              onClick={() => handleVerify(reg, 'REJECT')}
                              disabled={actionLoadingId === reg.id}
                              className="py-1.5 px-3 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        </>
                      ) : reg.status === 'DISETUJUI_BELUM_PASSWORD' ? (
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-blue-700 block">Siap Aktivasi</span>
                          <span className="text-[10px] text-slate-400">Menunggu alumni login &amp; buat password</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* TAB 3: TAMBAH PENGGUNA BARU (CAS 2-COLUMN LAYOUT) */}
      {activeTab === 'ADD_USER' && (
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold text-amber-900">
                  Penambahan Langsung oleh Sekretaris
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Akun yang ditambahkan di sini langsung terdaftar sebagai pengguna terverifikasi, masuk ke Direktori Anggota, dan terdaftar di Buku Kas/Iuran.
                </p>
              </div>
            </div>
            {renderCasAddUserForm(() => setActiveTab('USERS'))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL POPUP CAS: TAMBAH PENGGUNA                             */}
      {/* ============================================================ */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Tambah Pengguna Baru
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Lengkapi identitas, satker melekat berjenjang, serta email dinas &amp; sekunder personel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[82vh] overflow-y-auto">
              {renderCasAddUserForm(() => setShowAddUserModal(false))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL POPUP CAS: EDIT PENGGUNA & MASTER SATKER BERJENJANG     */}
      {/* ============================================================ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Edit Pengguna (NRP {editingUser.nrp})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Perbarui identitas, role akses, satker melekat berjenjang, atau kredensial kontak
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} autoComplete="off" className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* KOLOM KIRI: IDENTITAS & SATKER */}
                <div className="space-y-3.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 pb-1 border-b border-slate-100">
                    <IdCard className="w-4 h-4" />
                    <span>🪪 IDENTITAS &amp; SATKER</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pangkat</label>
                      <select
                        value={editPangkat}
                        onChange={(e) => setEditPangkat(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                      >
                        {PANGKAT_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Role Akses</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                      >
                        {visibleRoleOptions.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.value === 'SEKRETARIAT' ? 'SEKRETARIS' : r.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SATKER MELEKAT (ALA CAS) */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Satker Melekat</label>
                    <div className="flex flex-col gap-2 min-w-0">
                      <div
                        onClick={() => openSatkerPicker('EDIT')}
                        className="w-full min-w-0 overflow-hidden px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center gap-2 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <span className="font-bold text-slate-900 block truncate text-[11px]">
                            {editComposedSatker || editSatkerUtama}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                            <span className="truncate">{editPolda}</span>
                            {editKodeSatker && (
                              <span className="font-mono text-slate-400 shrink-0">({editKodeSatker})</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSatkerPicker('EDIT')}
                        className="w-full px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Pilih Satker Berjenjang</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: AKUN & KREDENSIAL */}
                <div className="space-y-3.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 pb-1 border-b border-slate-100">
                    <Lock className="w-4 h-4" />
                    <span>🔐 AKUN &amp; KREDENSIAL</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NRP / NIP (Terkunci)</label>
                    <input
                      type="text"
                      disabled
                      value={editingUser.nrp}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Dinas (@polri.go.id)</label>
                    <input
                      type="email"
                      autoComplete="off"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      onBlur={() => {
                        if (/^\d+$/.test(editEmail.trim())) {
                          setEditEmail(`${editEmail.trim()}@polri.go.id`);
                        }
                      }}
                      placeholder={`${editingUser.nrp}@polri.go.id`}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Sekunder / Pribadi <span className="text-slate-400 font-normal">(Opsional &amp; Editable)</span>
                    </label>
                    <input
                      type="email"
                      autoComplete="off"
                      value={editSecondaryEmail}
                      onChange={(e) => setEditSecondaryEmail(e.target.value)}
                      placeholder="Contoh: agungkrisdianto98@gmail.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp Aktif</label>
                    <input
                      type="tel"
                      autoComplete="off"
                      value={editNoHp}
                      onChange={(e) => setEditNoHp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {onEditMemberByNrp ? (
                  <button
                    type="button"
                    onClick={() => {
                      const targetNrp = editingUser.nrp;
                      setEditingUser(null);
                      if (!asPage) onClose();
                      onEditMemberByNrp(targetNrp);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1.5"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>Edit Biodata Lengkap (5 Tahap)</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updatingUserNrp === editingUser.nrp}
                    className="px-5 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{updatingUserNrp === editingUser.nrp ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL POPUP: PILIH SATKER BERJENJANG (ALA CAS / BDB)         */}
      {/* ============================================================ */}
      <SatkerBerjenjangModal
        isOpen={satkerPickerMode !== null}
        onClose={() => setSatkerPickerMode(null)}
        initialPolda={satkerPickerMode === 'EDIT' ? editPolda : newPolda}
        initialSatker={satkerPickerMode === 'EDIT' ? editSatkerUtama : newSatkerUtama}
        initialSubSatker={satkerPickerMode === 'EDIT' ? editSubSatker : newSubSatker}
        onApply={handleApplySatkerFromModal}
      />

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Otoritas Manajemen Pengguna: <strong>Sekretaris Batalyon Wira Satya 96</strong></span>
        </div>
        {!asPage && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );

  if (asPage) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-4">
        {innerContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {innerContent}
    </div>
  );
};
