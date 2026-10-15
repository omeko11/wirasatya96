'use client';

import React, { useState } from 'react';
import { AuthUser, UserRole, DAFTAR_PANGKAT_POLRI, AnggotaWiraSatya } from '@/types';
import { PRESET_USERS } from '@/data/mockUsers';
import { 
  UserCheck, 
  KeyRound, 
  X, 
  ChevronRight, 
  Lock, 
  Fingerprint, 
  Mail, 
  Smartphone, 
  ShieldAlert, 
  UserPlus, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface RoleSwitcherModalProps {
  currentUser: AuthUser;
  onSelectUser: (user: AuthUser) => void;
  isOpen: boolean;
  onClose: () => void;
  onAddNewMemberAccount?: (newMember: AnggotaWiraSatya) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  currentUser,
  onSelectUser,
  isOpen,
  onClose,
  onAddNewMemberAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'mfa' | 'addAccount'>('quick');

  // Manual MFA State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<'BIOMETRIC' | 'GOOGLE_AUTH' | 'EMAIL_OTP' | 'PIN'>('BIOMETRIC');
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [otpTimer, setOtpTimer] = useState(59);

  // New Member Account Form State (For Kesekretariatan & Superadmin)
  const [newNama, setNewNama] = useState('');
  const [newNrp, setNewNrp] = useState('');
  const [newPangkat, setNewPangkat] = useState<string>('Kombes Pol');
  const [newPolda, setNewPolda] = useState('Polda Metro Jaya');
  const [newSatker, setNewSatker] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAccountSuccess, setNewAccountSuccess] = useState(false);

  if (!isOpen) return null;

  const canManageAccounts = currentUser.role === 'SUPERADMIN' || currentUser.role === 'SEKRETARIAT';

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string; desc: string }> = {
    SUPERADMIN: {
      label: 'SUPERADMIN / DEV',
      bg: 'bg-red-100 border-red-300',
      text: 'text-red-900',
      desc: 'Kuasa absolut developer: bypass kunci NRP, kelola semua akun & role, reset database.',
    },
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
      desc: 'Berhak mendaftarkan akun anggota baru, pemetaan penugasan 34 Polda, dan unduh master data.',
    },
    BENDAHARA: {
      label: 'BENDAHARA',
      bg: 'bg-emerald-100 border-emerald-300',
      text: 'text-emerald-900',
      desc: 'Analisis tanggungan biaya pendidikan anak leting, rekapitulasi bantuan sosial/kesehatan, dan dana pensiun.',
    },
    ANGGOTA: {
      label: 'ANGGOTA (PERWIRA)',
      bg: 'bg-slate-100 border-slate-300',
      text: 'text-slate-800',
      desc: 'Akses Buku Saku Digital & hak memperbarui data pribadi/keluarga secara mandiri tanpa mengubah data orang lain.',
    },
  };

  // Trigger Native / WebAuthn Biometrics
  const handleTriggerBiometric = async () => {
    setBiometricStatus('scanning');
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Try WebAuthn if available or simulate
        setTimeout(() => {
          setBiometricStatus('success');
          setTimeout(() => {
            // Log in as Superadmin or current selected
            const adminUser = PRESET_USERS[0]; // Eko Agung
            onSelectUser(adminUser);
            onClose();
          }, 800);
        }, 1200);
      } else {
        setTimeout(() => {
          setBiometricStatus('success');
          setTimeout(() => {
            const adminUser = PRESET_USERS[0];
            onSelectUser(adminUser);
            onClose();
          }, 800);
        }, 1200);
      }
    } catch {
      setBiometricStatus('idle');
    }
  };

  // Handle Create New Member Account (Kesekretariatan & Superadmin)
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newNrp) return;

    const newMember: AnggotaWiraSatya = {
      id: 'ws-' + newNrp,
      nrp: newNrp,
      namaLengkap: newNama,
      pangkat: newPangkat,
      jabatanTerakhir: 'Perwira Anggota Batalyon Wira Satya 96',
      satuanKerja: newSatker || 'Polda',
      polda: newPolda,
      pendidikanTerakhir: 'S1 Ilmu Kepolisian / Akpol 96',
      tempatLahir: 'Indonesia',
      tanggalLahir: '1974-01-01',
      usia: 52,
      jenisKelamin: 'LAKI-LAKI',
      noHp: newPhone || '081200000000',
      email: newEmail,
      alamatTempatTinggal: 'Domisili Satker',
      statusTempatTinggal: 'DINAS',
      statusPerkawinan: 'MENIKAH',
      jumlahAnak: 0,
      daftarAnak: [],
      tahunPurnaTugas: 2032,
      sisaTahunDinas: 6,
      alamatPurnaTugas: 'Menyesuaikan',
      statusRumahPurnaTugas: 'MILIK PRIBADI',
      sudahPembekalan: 'SUDAH',
      rencanaAktivitas: ['USAHA SENDIRI'],
      sumberPenghasilanPasca: ['DANA PENSIUN'],
      kecukupanDanaPensiun: 'CUKUP',
      kesiapanPensiun: 'SIAP',
      perasaanPensiun: 'OPTIMIS',
      dukunganKeluarga: 'SANGAT MENDUKUNG',
      adaPenyakitKronis: 'TIDAK ADA',
      kondisiKesehatan: 'BAIK',
      asuransiAktif: ['BPJS'],
      rutinMcu: 'YA',
      mcuTerakhir: '< 6 BULAN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddNewMemberAccount) {
      onAddNewMemberAccount(newMember);
    }

    setNewAccountSuccess(true);
    setTimeout(() => {
      setNewAccountSuccess(false);
      setNewNama('');
      setNewNrp('');
      setNewSatker('');
      setNewEmail('');
      setNewPhone('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-polri-navy p-5 text-white flex items-center justify-between border-b border-polri-gold/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-polri-gold/20 text-polri-gold border border-polri-gold/40">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Pusat Keamanan & Manajemen Akun
              </h3>
              <p className="text-xs text-slate-300">
                Autentikasi Multi-Faktor (MFA), FIDO Biometrik, & Pembatasan Peran (RBAC)
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'quick'
                ? 'border-polri-navy text-polri-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Simulasi Role / Demo
          </button>
          <button
            onClick={() => setActiveTab('mfa')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'mfa'
                ? 'border-polri-navy text-polri-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Keamanan Tingkat Tinggi (MFA)
          </button>
          {canManageAccounts && (
            <button
              onClick={() => setActiveTab('addAccount')}
              className={`flex-1 py-3 text-center border-b-2 transition-all ${
                activeTab === 'addAccount'
                  ? 'border-polri-navy text-polri-navy bg-white'
                  : 'border-transparent text-blue-600 hover:text-blue-800'
              }`}
            >
              + Tambah Akun Anggota
            </button>
          )}
        </div>

        {/* Tab 1: SIMULASI ROLE */}
        {activeTab === 'quick' && (
          <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-slate-500">
              Pilih peran login di bawah ini untuk menguji bagaimana sistem membatasi wewenang data perwira:
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
                        {user.role === 'SUPERADMIN' && (
                          <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> Akses Dev Penuh
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {user.nama}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        NRP {user.nrp} &bull; {meta.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: HIGH SECURITY MFA / BIOMETRICS / OTP */}
        {activeTab === 'mfa' && (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Proteksi Data Pejabat & Perwira Tinggi:</span>
                Mendukung standar keamanan modern (FIDO2 WebAuthn Passkey, Biometrik Sidik Jari/Wajah, Google Authenticator TOTP, dan Kode OTP Email).
              </div>
            </div>

            {/* Method Chooser */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMfaMethod('BIOMETRIC')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMfaMethod === 'BIOMETRIC'
                    ? 'border-polri-navy bg-polri-navy/5 font-bold text-polri-navy ring-1 ring-polri-navy'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Fingerprint className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="block font-bold">FIDO / Biometrik</span>
                  <span className="text-[10px] text-slate-400">Passkey / FaceID / Hello</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMfaMethod('EMAIL_OTP')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMfaMethod === 'EMAIL_OTP'
                    ? 'border-polri-navy bg-polri-navy/5 font-bold text-polri-navy ring-1 ring-polri-navy'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="block font-bold">OTP Email Pribadi</span>
                  <span className="text-[10px] text-slate-400">Kode Verifikasi 6 Digit</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMfaMethod('GOOGLE_AUTH')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMfaMethod === 'GOOGLE_AUTH'
                    ? 'border-polri-navy bg-polri-navy/5 font-bold text-polri-navy ring-1 ring-polri-navy'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="block font-bold">Google Auth (TOTP)</span>
                  <span className="text-[10px] text-slate-400">Aplikasi Authenticator</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMfaMethod('PIN')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMfaMethod === 'PIN'
                    ? 'border-polri-navy bg-polri-navy/5 font-bold text-polri-navy ring-1 ring-polri-navy'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="block font-bold">PIN Tambahan</span>
                  <span className="text-[10px] text-slate-400">PIN 6 Angka Rahasia</span>
                </div>
              </button>
            </div>

            {/* Interactive Simulation Area */}
            {selectedMfaMethod === 'BIOMETRIC' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  biometricStatus === 'scanning'
                    ? 'bg-blue-100 text-blue-600 animate-pulse'
                    : biometricStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  <Fingerprint className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {biometricStatus === 'scanning'
                      ? 'Memindai Sensor Sidik Jari / Windows Hello...'
                      : biometricStatus === 'success'
                      ? 'Autentikasi Biometrik Berhasil!'
                      : 'Verifikasi Biometrik FIDO2'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Gunakan sensor Touch ID, Face ID, atau PIN Windows Hello pada perangkat Anda.
                  </p>
                </div>
                {biometricStatus === 'idle' && (
                  <button
                    type="button"
                    onClick={handleTriggerBiometric}
                    className="px-5 py-2.5 rounded-xl bg-polri-navy text-polri-gold text-xs font-bold hover:bg-polri-navyLight shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Pindai Sidik Jari / Wajah Sekarang
                  </button>
                )}
              </div>
            )}

            {selectedMfaMethod === 'EMAIL_OTP' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Verifikasi Kode OTP Email</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kode 6 digit telah dikirimkan ke email terdaftar: <b>{currentUser.email || 'perwira@polri.go.id'}</b>
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={otpCode[idx]}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = [...otpCode];
                        next[idx] = val;
                        setOtpCode(next);
                      }}
                      className="w-10 h-12 text-center text-lg font-black rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                      placeholder="•"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-4">
                  <span>Kirim ulang kode dalam: <b>{otpTimer}s</b></span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(['9', '6', '1', '9', '9', '6']);
                      setOtpTimer(59);
                    }}
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    Simulasi Isi Kode Otomatis
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('Verifikasi OTP Berhasil!');
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Konfirmasi OTP & Masuk
                </button>
              </div>
            )}

            {selectedMfaMethod === 'GOOGLE_AUTH' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full mx-auto flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Google Authenticator (TOTP)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buka aplikasi Google Authenticator di HP Anda dan masukkan kode 6 angka yang tertera.
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      className="w-10 h-12 text-center text-lg font-black rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                      placeholder="•"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('Verifikasi Google Authenticator Berhasil!');
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Verifikasi Token Authenticator
                </button>
              </div>
            )}

            {selectedMfaMethod === 'PIN' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">PIN Keamanan 6 Digit</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan PIN rahasia Anda untuk membuka akses data profil.
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      type="password"
                      maxLength={1}
                      className="w-10 h-12 text-center text-lg font-black rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      placeholder="•"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('PIN Dikonfirmasi!');
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Konfirmasi PIN
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: TAMBAH AKUN ANGGOTA (KESEKRETARIATAN & SUPERADMIN) */}
        {activeTab === 'addAccount' && canManageAccounts && (
          <form onSubmit={handleCreateAccount} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <UserPlus className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Hak Khusus Kesekretariatan & Superadmin:</span>
                Mendaftarkan rekan perwira yang baru terdata atau yang berdinas di wilayah terpencil agar mereka memiliki akun login mandiri.
              </div>
            </div>

            {newAccountSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-base text-slate-900">Akun Anggota Berhasil Diterbitkan!</h4>
                <p className="text-xs text-slate-500">
                  Data perwira telah ditambahkan ke Buku Saku dan akun login NRP telah aktif.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap (dengan Gelar) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kombes Pol. ..."
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NRP (Primary Key Unik) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 74090999"
                      value={newNrp}
                      onChange={(e) => setNewNrp(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pangkat</label>
                    <select
                      value={newPangkat}
                      onChange={(e) => setNewPangkat(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    >
                      {DAFTAR_PANGKAT_POLRI.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Wilayah Penempatan (Polda)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Polda Papua / Mabes"
                      value={newPolda}
                      onChange={(e) => setNewPolda(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Satker / Jabatan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ditreskrimum"
                      value={newSatker}
                      onChange={(e) => setNewSatker(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Pribadi (Untuk OTP)</label>
                    <input
                      type="email"
                      placeholder="perwira@gmail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Terbitkan Akun Anggota & Masukkan ke Database
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Hak Sesi Aktif: <b className="text-slate-800 uppercase">{currentUser.role}</b></span>
          </div>
          {currentUser.role === 'SUPERADMIN' && (
            <span className="text-red-600 font-extrabold text-[10px]">
              SUPERADMIN PRIVILEGE
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
