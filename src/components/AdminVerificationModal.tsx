'use client';

import React, { useState, useEffect } from 'react';
import { AuthUser, PendingRegistration, UserAccountStatus, UserRole, DAFTAR_PANGKAT_POLRI } from '@/types';
import { ROLE_PERMISSIONS } from '@/data/mockUsers';
import {
  DAFTAR_38_POLDA as POLDA_LIST,
  getSatkerUtamaByWilayah,
  getSubSatkerOptionsBySatker,
} from '@/data/polriStructure';
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
  KeyRound
} from 'lucide-react';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  onVerificationUpdate?: () => void;
  onOpenFullWizard?: () => void;
  initialTab?: 'USERS' | 'VERIFICATION' | 'ADD_USER';
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ANGGOTA', label: 'Anggota (Alumni Wira Satya 96 / ADC)' },
  { value: 'SEKRETARIAT', label: 'Kesekretariatan (Admin Data & User)' },
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
  initialTab = 'USERS',
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'VERIFICATION' | 'ADD_USER'>(initialTab);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters for Users tab
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [updatingUserNrp, setUpdatingUserNrp] = useState<string | null>(null);

  // Filters for Verification tab
  const [regSearch, setRegSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | UserAccountStatus>('PENDING_VERIFIKASI');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedApproveRoles, setSelectedApproveRoles] = useState<Record<string, UserRole>>({});

  // Add User Form state (with Cascading Master Satker Dropdown)
  const [newNrp, setNewNrp] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newPangkat, setNewPangkat] = useState('Kombes Pol');
  const [newRole, setNewRole] = useState<UserRole>('ANGGOTA');
  const [newPolda, setNewPolda] = useState('MABES POLRI');
  const [newSatkerUtama, setNewSatkerUtama] = useState('BARESKRIM POLRI');
  const [newSubSatker, setNewSubSatker] = useState('Pimpinan / Staf Utama Satker');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
    if (isOpen) {
      setActiveTab(initialTab);
      fetchAllData();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

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
          verifierName: adminName || 'Admin / Kesekretariatan WS96',
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNrp.trim() || !newNama.trim()) {
      showToast('NRP dan Nama Lengkap wajib diisi.', 'error');
      return;
    }
    const composedSatker =
      newSubSatker && newSubSatker !== 'Pimpinan / Staf Utama Satker'
        ? `${newSubSatker} - ${newSatkerUtama}`
        : newSatkerUtama;

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
          satker: composedSatker || 'Mabes Polri',
          polda: newPolda,
          email: newEmail.trim() || `${newNrp.trim()}@wirasatya96.id`,
          password: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Pengguna baru berhasil ditambahkan!', 'success');
        setNewNrp('');
        setNewNama('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('ANGGOTA');
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

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch =
      u.nama.toLowerCase().includes(q) ||
      u.nrp.toLowerCase().includes(q) ||
      (u.satker || '').toLowerCase().includes(q) ||
      (u.polda || '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  const filteredRegistrations = registrations.filter((r) => {
    const q = regSearch.toLowerCase();
    const matchesSearch = 
      r.nama.toLowerCase().includes(q) ||
      r.nrp.includes(q) ||
      r.satker.toLowerCase().includes(q) ||
      r.polda.toLowerCase().includes(q);
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  const pendingCount = registrations.filter((r) => r.status === 'PENDING_VERIFIKASI').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
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
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Manajemen Pengguna &amp; Verifikasi Akun
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                  Otoritas: Admin &amp; Kesekretariatan
                </span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-extrabold animate-pulse">
                    {pendingCount} Menunggu Verifikasi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Kelola daftar pengguna, ubah role/hak akses, tambahkan akun personel baru, dan verifikasi pendaftaran alumni.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
              <span>Daftar Pengguna ({users.length})</span>
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

            <button
              onClick={() => setActiveTab('ADD_USER')}
              className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
                activeTab === 'ADD_USER'
                  ? 'bg-white text-red-900 border-slate-200 shadow-sm -mb-px pb-2.5'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Pengguna Baru</span>
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
                  placeholder="Cari pengguna berdasarkan NRP, Nama, Role, atau Satker..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'ALL' | UserRole)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-800"
                >
                  <option value="ALL">Semua Role ({users.length})</option>
                  <option value="SUPERADMIN">Superadmin</option>
                  <option value="KETUA">Ketua Paguyuban</option>
                  <option value="SEKRETARIAT">Kesekretariatan</option>
                  <option value="BENDAHARA">Bendahara</option>
                  <option value="ANGGOTA">Anggota</option>
                </select>

                <button
                  onClick={() => setActiveTab('ADD_USER')}
                  className="px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Pengguna</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">Tidak ada pengguna ditemukan</p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge = ROLE_PERMISSIONS[u.role];
                  const regInfo = registrations.find((r) => r.nrp === u.nrp);
                  const accountStatus = regInfo?.status || u.status || 'DISETUJUI_BELUM_PASSWORD';
                  return (
                    <div
                      key={u.nrp}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{u.nama}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            NRP {u.nrp}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-900 font-bold border border-red-200">
                            {u.pangkat}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${roleBadge?.badgeColor || 'bg-slate-700 text-white'}`}>
                            {roleBadge?.label || u.role}
                          </span>
                          {accountStatus === 'AKTIF' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Password Aktif
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                              <KeyRound className="w-3 h-3" /> Belum Set Password
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {u.satker || 'Mabes Polri'} &bull; {u.polda || 'MABES POLRI'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Ubah Hak Akses / Role</label>
                          <select
                            value={u.role}
                            disabled={updatingUserNrp === u.nrp}
                            onChange={(e) => handleRoleChange(u.nrp, e.target.value as UserRole)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-800 disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.value}
                              </option>
                            ))}
                          </select>
                        </div>

                        {u.nrp !== '98010710' && (
                          <button
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
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{reg.email}</span>
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
                                {ROLE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.value}
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
                                className=" py-1.5 px-3 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
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

        {/* TAB 3: TAMBAH PENGGUNA BARU */}
        {activeTab === 'ADD_USER' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900">
                    Penambahan Langsung oleh Admin / Kesekretariatan
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Akun yang ditambahkan di sini langsung terdaftar sebagai pengguna terverifikasi, masuk ke Direktori Anggota, dan terdaftar di Buku Kas/Iuran.
                  </p>
                </div>
                {onOpenFullWizard && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullWizard();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-400 text-amber-900 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1.5 flex-shrink-0 shadow-sm transition-colors"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>Form Pendataan 5 Tahap</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NRP <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newNrp}
                      onChange={(e) => setNewNrp(e.target.value)}
                      placeholder="Contoh: 980107107"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap &amp; Gelar <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      placeholder="Contoh: Kombes Pol. Budi Santoso, S.I.K."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pangkat
                    </label>
                    <select
                      value={newPangkat}
                      onChange={(e) => setNewPangkat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    >
                      {PANGKAT_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role / Hak Akses Sistem <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-red-900 focus:ring-2 focus:ring-red-800 focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Wilayah Induk (Mabes / 38 Polda / Luar Struktur)
                    </label>
                    <select
                      value={newPolda}
                      onChange={(e) => {
                        const selectedWilayah = e.target.value;
                        setNewPolda(selectedWilayah);
                        const satkerOpts = getSatkerUtamaByWilayah(selectedWilayah);
                        const firstSatker = satkerOpts[0] || selectedWilayah;
                        setNewSatkerUtama(firstSatker);
                        const subOpts = getSubSatkerOptionsBySatker(selectedWilayah, firstSatker);
                        setNewSubSatker(subOpts[0] || 'Pimpinan / Staf Utama Satker');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-800 focus:outline-none"
                    >
                      {POLDA_LIST.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Master Satker Utama (Satker / Direktorat / Polres)
                    </label>
                    <select
                      value={newSatkerUtama}
                      onChange={(e) => {
                        const selectedSatker = e.target.value;
                        setNewSatkerUtama(selectedSatker);
                        const subOpts = getSubSatkerOptionsBySatker(newPolda, selectedSatker);
                        setNewSubSatker(subOpts[0] || 'Pimpinan / Staf Utama Satker');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-800 focus:outline-none"
                    >
                      {getSatkerUtamaByWilayah(newPolda).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Sub-Satker / Direktorat / Bagian / Penugasan ADC (Dropdown)
                    </label>
                    <select
                      value={newSubSatker}
                      onChange={(e) => setNewSubSatker(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-800 focus:outline-none"
                    >
                      {getSubSatkerOptionsBySatker(newPolda, newSatkerUtama).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Hasil Satker Tersimpan: <strong className="text-red-900">{newSubSatker && newSubSatker !== 'Pimpinan / Staf Utama Satker' ? `${newSubSatker} - ${newSatkerUtama}` : newSatkerUtama} ({newPolda})</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Opsional (otomatis dibuat jika kosong)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password Awal (Opsional)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Kosongkan agar user buat password saat login"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('USERS')}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="px-5 py-2 rounded-lg bg-red-900 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{creatingUser ? 'Menyimpan...' : 'Simpan & Aktifkan Pengguna'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Otoritas Manajemen Pengguna: <strong>Hanya Admin (Superadmin) &amp; Kesekretariatan</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
