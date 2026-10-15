'use client';

import React, { useState } from 'react';
import { AuthUser, UserRole } from '@/types';
import { PRESET_USERS } from '@/data/mockUsers';
import { UserCheck, KeyRound, X, ChevronRight, Lock } from 'lucide-react';

interface RoleSwitcherModalProps {
  currentUser: AuthUser;
  onSelectUser: (user: AuthUser) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  currentUser,
  onSelectUser,
  isOpen,
  onClose,
}) => {
  const [nrpInput, setNrpInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'manual'>('quick');

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nrpInput) return;
    // Find matching preset or create guest member session
    const found = PRESET_USERS.find((u) => u.nrp === nrpInput);
    if (found) {
      onSelectUser(found);
      onClose();
    } else {
      // Create member session on the fly
      const customUser: AuthUser = {
        id: 'u-' + nrpInput,
        nrp: nrpInput,
        nama: `Perwira Akpol 96 (NRP ${nrpInput})`,
        pangkat: 'Kombes Pol',
        role: 'ANGGOTA',
        profileId: 'ws-' + nrpInput,
      };
      onSelectUser(customUser);
      onClose();
    }
  };

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string; desc: string }> = {
    KETUA: {
      label: 'KETUA PAGUYUBAN',
      bg: 'bg-purple-100 border-purple-300',
      text: 'text-purple-900',
      desc: 'Akses penuh ke Executive Summary, atensi kesehatan leting, dan pengawasan pemetaan keanggotaan.',
    },
    SEKRETARIAT: {
      label: 'KESEKRETARIATAN',
      bg: 'bg-blue-100 border-blue-300',
      text: 'text-blue-900',
      desc: 'Pemetaan sebaran wilayah penugasan (Polda/Satker), status pembaruan data, dan ekspor master data Excel/CSV.',
    },
    BENDAHARA: {
      label: 'BENDAHARA',
      bg: 'bg-emerald-100 border-emerald-300',
      text: 'text-emerald-900',
      desc: 'Analisis tanggungan biaya pendidikan anak leting, rekapitulasi kebutuhan bantuan sosial/kesehatan, dan dana pensiun.',
    },
    ANGGOTA: {
      label: 'ANGGOTA (PERWIRA)',
      bg: 'bg-slate-100 border-slate-300',
      text: 'text-slate-800',
      desc: 'Akses Buku Saku Digital & hak memperbarui data pribadi/keluarga secara mandiri tanpa mengubah data orang lain.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-polri-navy p-5 text-white flex items-center justify-between border-b border-polri-gold/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-polri-gold/20 text-polri-gold border border-polri-gold/40">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Keamanan & Akses Akun (Authentication)
              </h3>
              <p className="text-xs text-slate-300">
                Pilih peran login untuk simulasi hak akses data masing-masing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'quick'
                ? 'border-polri-navy text-polri-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Simulasi Role / Demo Akses
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-polri-navy text-polri-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Login via NRP & PIN
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {activeTab === 'quick' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Klik salah satu akun di bawah untuk melihat bagaimana sistem beradaptasi sesuai hak aksesnya:
              </p>
              <div className="space-y-2.5">
                {PRESET_USERS.map((user) => {
                  const isCurrent = currentUser.nrp === user.nrp;
                  const meta = roleBadges[user.role];
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'border-polri-gold bg-amber-50/50 shadow-sm ring-2 ring-polri-gold/40'
                          : 'border-slate-200 hover:border-polri-navy/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${meta.bg} ${meta.text}`}
                          >
                            {meta.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                              <UserCheck className="w-3 h-3" /> Sedang Aktif
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {user.nama}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          NRP {user.nrp} • {meta.desc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor NRP Personel
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 74080123"
                  value={nrpInput}
                  onChange={(e) => setNrpInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Keamanan / Sandi
                </label>
                <input
                  type="password"
                  placeholder="Masukkan PIN (Default: 123456)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Akses terenkripsi khusus perwira alumni Akpol 1996.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-xs font-bold shadow-md transition-colors"
              >
                Masuk ke Aplikasi
              </button>
            </form>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              <b>From User to User Security:</b> Setiap anggota hanya dapat memperbarui data miliknya sendiri. Data sensitif pengurus hanya dapat dilihat oleh Ketua, Kesekretariatan, dan Bendahara.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
