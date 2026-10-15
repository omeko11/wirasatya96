'use client';

import React, { useState, useEffect } from 'react';
import { PendingRegistration, UserAccountStatus } from '@/types';
import { 
  ShieldCheck, 
  ShieldAlert, 
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
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  onVerificationUpdate?: () => void;
}

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  isOpen,
  onClose,
  adminName,
  onVerificationUpdate,
}) => {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | UserAccountStatus>('PENDING_VERIFIKASI');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register');
      const data = await res.json();
      if (data.success && Array.isArray(data.registrations)) {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error('Failed to fetch registrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRegistrations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleVerify = async (reg: PendingRegistration, action: 'APPROVE' | 'REJECT') => {
    setActionLoadingId(reg.id);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reg.id,
          nrp: reg.nrp,
          action,
          verifierName: adminName || 'Superadmin WS96',
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          action === 'APPROVE' 
            ? `Pendaftaran ${reg.nama} berhasil disetujui!` 
            : `Pendaftaran ${reg.nama} telah ditolak.`,
          'success'
        );
        // Refresh local list
        await fetchRegistrations();
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

  const filtered = registrations.filter((r) => {
    const matchesSearch = 
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nrp.includes(searchQuery) ||
      r.satker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.polda.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  const pendingCount = registrations.filter((r) => r.status === 'PENDING_VERIFIKASI').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/60 border border-red-700/50 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Verifikasi Registrasi Alumni Leting 96
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-extrabold animate-pulse">
                    {pendingCount} Antrean Baru
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Otorisasi akun perwira alumni sebelum diizinkan membuat kata sandi dan mengakses sistem.
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

        {/* Toast Alert */}
        {toastMessage && (
          <div className={`py-2 px-4 text-xs font-semibold flex items-center gap-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Subheader Tools */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan NRP, Nama, Satker, atau Polda..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
            />
          </div>

          {/* Filter Status Buttons */}
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
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-800 hover:bg-slate-100 transition-colors"
              title="Segarkan data"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-800' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada pendaftaran dengan kriteria ini</p>
              <p className="text-xs text-slate-400 mt-1">
                Semua alumni yang mendaftar telah diproses atau belum ada antrean baru.
              </p>
            </div>
          ) : (
            filtered.map((reg) => (
              <div 
                key={reg.id} 
                className="pt-4 first:pt-0 pb-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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

                      {/* Status Badge */}
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
                  <div className="flex sm:flex-col items-center gap-2 pt-2 sm:pt-0 flex-shrink-0">
                    {reg.status === 'PENDING_VERIFIKASI' ? (
                      <>
                        <button
                          onClick={() => handleVerify(reg, 'APPROVE')}
                          disabled={actionLoadingId === reg.id}
                          className="w-full sm:w-32 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{actionLoadingId === reg.id ? 'Memproses...' : 'Setujui'}</span>
                        </button>
                        <button
                          onClick={() => handleVerify(reg, 'REJECT')}
                          disabled={actionLoadingId === reg.id}
                          className="w-full sm:w-32 py-1.5 px-3 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </>
                    ) : reg.status === 'DISETUJUI_BELUM_PASSWORD' ? (
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-blue-700 block">Siap Aktivasi</span>
                        <span className="text-[10px] text-slate-400">Menunggu alumni login</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hak Akses Verifikasi: <strong>Superadmin &amp; Sekretariat Paguyuban</strong></span>
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
