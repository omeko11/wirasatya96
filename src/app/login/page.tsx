'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, MfaMethod, DAFTAR_PANGKAT_POLRI } from '@/types';
import {
  DAFTAR_38_POLDA,
  getSatkerUtamaByWilayah,
  getSubSatkerOptionsBySatker,
} from '@/data/polriStructure';
import { WSLogo } from '@/components/WSLogo';
import { 
  Eye, 
  EyeOff, 
  RotateCw, 
  AlertCircle, 
  Fingerprint,
  Key,
  ChevronRight,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';

function generateCaptchaCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function LoginPage() {
  const router = useRouter();

  // Active view: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form inputs (Default: Password + Captcha)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('WS96A');
  const [captchaInput, setCaptchaInput] = useState('');

  // Optional 2FA Challenge Modal (only shown if user enabled 2FA in their settings)
  const [pending2FAUser, setPending2FAUser] = useState<AuthUser | null>(null);
  const [otpInput, setOtpInput] = useState('');

  // Register form inputs (with Cascading Master Satker Dropdown)
  const [regNrp, setRegNrp] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regPangkat, setRegPangkat] = useState('Kombes Pol');
  const [regPolda, setRegPolda] = useState('MABES POLRI');
  const [regSatkerUtama, setRegSatkerUtama] = useState('BARESKRIM POLRI');
  const [regSubSatker, setRegSubSatker] = useState('Pimpinan / Staf Utama Satker');
  const [regNoHp, setRegNoHp] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAlasan, setRegAlasan] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // First-time Password Activation Modal State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationData, setActivationData] = useState<{
    nrp: string;
    nama: string;
    pangkat?: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedMfa, setSelectedMfa] = useState<MfaMethod>('PIN');
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState('');

  // FIDO2 / Passkey Browser Modal Simulation State
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyAccount] = useState('superadmin@wirasatya96.polri.go.id');

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setCaptchaCode(generateCaptchaCode());
  }, []);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
  };

  const handleLoginSuccess = (user: AuthUser, mfaMethod?: MfaMethod) => {
    localStorage.setItem('ws96_active_user', JSON.stringify(user));
    localStorage.setItem('wirasatya96_current_user', JSON.stringify(user));
    if (mfaMethod) {
      localStorage.setItem('ws96_mfa_verified', 'true');
    }
    router.push('/');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Harap masukkan NRP atau Email dinas Anda.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Kode Keamanan (Captcha) tidak sesuai. Silakan ketik ulang kode yang tampil.');
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      // Call internal login API with entered credentials
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: username.trim(), 
          password: password.trim() 
        }),
      });
      const data = await res.json();

      // Case 1: Account approved by Superadmin, needs to set password for the first time
      if (data.requiresPasswordSetup) {
        setActivationData({
          nrp: data.nrp || username.trim(),
          nama: data.nama || 'Perwira Alumni Wira Satya 96',
          pangkat: data.pangkat || 'Kombes Pol',
        });
        setShowActivationModal(true);
        return;
      }

      // Case 2: Login success
      if (data.success && data.user) {
        // Check if this user has self-enabled 2FA in their settings
        let is2FAEnabled = Boolean(data.user.mfaEnabled);
        try {
          const local2FA = localStorage.getItem(`ws96_2fa_${data.user.nrp}`);
          if (local2FA !== null) {
            is2FAEnabled = local2FA === 'true';
          }
        } catch {
          // ignore
        }

        if (is2FAEnabled) {
          setPending2FAUser(data.user);
          setOtpInput('');
        } else {
          handleLoginSuccess(data.user, 'PIN');
        }
      } else {
        setErrorMessage(data.message || 'NRP atau kata sandi tidak cocok. Silakan periksa kembali.');
        refreshCaptcha();
      }
    } catch {
      setErrorMessage('Terjadi gangguan koneksi ke server. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending2FAUser) return;
    if (otpInput.trim().length < 4) {
      setErrorMessage('Masukkan kode OTP / PIN 2FA minimal 4 digit.');
      return;
    }
    const userToLogin = pending2FAUser;
    setPending2FAUser(null);
    handleLoginSuccess(userToLogin, userToLogin.mfaMethod || 'EMAIL_OTP');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regNrp.trim() || !regNama.trim()) {
      setErrorMessage('Harap lengkapi NRP dan Nama Lengkap Anda.');
      return;
    }

    const composedSatker =
      regSubSatker && regSubSatker !== 'Pimpinan / Staf Utama Satker'
        ? `${regSubSatker} - ${regSatkerUtama}`
        : regSatkerUtama;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nrp: regNrp.trim(),
          nama: regNama.trim(),
          pangkat: regPangkat,
          satker: composedSatker,
          polda: regPolda,
          noHp: regNoHp.trim(),
          email: regEmail.trim() || `${regNrp.trim()}@polri.go.id`,
          alasanDaftar: regAlasan.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRegSuccess(true);
      } else {
        setErrorMessage(data.message || 'Pendaftaran gagal diproses.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan saat mengirimkan pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');

    if (!newPassword || newPassword.length < 6) {
      setActivationError('Kata sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setActivationError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setActivationLoading(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nrp: activationData?.nrp,
          password: newPassword,
          mfaMethod: selectedMfa,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setShowActivationModal(false);
        handleLoginSuccess(data.user, selectedMfa);
      } else {
        setActivationError(data.message || 'Gagal menyimpan kata sandi baru.');
      }
    } catch {
      setActivationError('Terjadi gangguan jaringan saat menyimpan kata sandi.');
    } finally {
      setActivationLoading(false);
    }
  };

  const handlePasskeyContinue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '98010710', mfaMethod: 'BIOMETRIC' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        handleLoginSuccess(data.user, 'BIOMETRIC');
      }
    } catch {
      setErrorMessage('Autentikasi Kunci Sandi gagal.');
    } finally {
      setLoading(false);
      setShowPasskeyModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col justify-between font-sans text-slate-900 antialiased">
      
      {/* 1. TOP BRAND HEADER */}
      <header className="px-4 py-4 sm:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <WSLogo size="md" />
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
              Wira Satya <span className="text-red-800">96</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">
              Portal Alumni Akpol 1996
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Kanal Resmi Batalyon 1996</span>
        </div>
      </header>

      {/* 2. FIRST-TIME ACTIVATION MODAL: BUAT PASSWORD BARU */}
      {showActivationModal && activationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 text-slate-900 animate-scaleUp">
            
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                Pendaftaran Disetujui
              </span>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                Aktivasi Akun &amp; Buat Kata Sandi
              </h3>
              <p className="text-xs text-slate-600">
                Selamat datang, <strong>{activationData.nama}</strong> ({activationData.pangkat}).
                Silakan buat kata sandi pribadi untuk akun NRP <strong>{activationData.nrp}</strong>.
              </p>
            </div>

            {activationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{activationError}</span>
              </div>
            )}

            <form onSubmit={handleActivationSubmit} className="space-y-3.5 pt-1">
              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-red-700">*</span>
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              {/* Pilihan Metode MFA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilihan Pengamanan Akun (MFA)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedMfa('PIN')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMfa === 'PIN'
                        ? 'border-red-800 bg-red-50 text-red-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs">Kata Sandi / PIN</span>
                    <span className="text-[10px] text-slate-500 font-normal">Standar Akses Cepat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMfa('BIOMETRIC')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMfa === 'BIOMETRIC'
                        ? 'border-red-800 bg-red-50 text-red-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs">FIDO2 / Biometrik</span>
                    <span className="text-[10px] text-slate-500 font-normal">Sidik Jari / Passkey</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivationModal(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={activationLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
                >
                  {activationLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Mengaktifkan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan &amp; Masuk Akun</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. GOOGLE PASSWORD MANAGER / FIDO2 MODAL */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1b222d] border border-slate-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Fingerprint className="w-8 h-8 text-white" />
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow">
                  <Key className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-[13px] font-medium text-slate-200 text-center mt-3 leading-snug">
                Gunakan kunci sandi tersimpan untuk <br />
                <span className="font-bold text-white">portal.wirasatya96.id</span>
              </p>
            </div>

            <div 
              onClick={handlePasskeyContinue}
              className="flex items-center justify-between p-3 bg-[#242c38] hover:bg-[#2b3543] rounded-xl border border-slate-700/60 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {passkeyAccount}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">FIDO2</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Pengelola Sandi Google</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setShowPasskeyModal(false)}
                className="px-3 py-2 rounded-full bg-[#27303d] hover:bg-[#323d4e] text-slate-300 font-medium transition-all text-center flex-1 text-[11px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePasskeyContinue}
                className="px-4 py-2 rounded-full bg-[#7be0eb] hover:bg-[#68d1dc] text-slate-950 font-bold transition-all text-center text-xs shadow-md flex-1"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3B. OPTIONAL 2FA MODAL (ONLY WHEN USER SELF-ENABLED 2FA IN SETTINGS) */}
      {pending2FAUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-800 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-extrabold uppercase">
                Verifikasi 2FA Aktif
              </span>
              <h3 className="font-extrabold text-lg text-slate-900">
                Autentikasi Dua Faktor (2FA)
              </h3>
              <p className="text-xs text-slate-600">
                Akun <strong>{pending2FAUser.nama}</strong> mengaktifkan proteksi 2FA tambahan. Masukkan kode OTP / Authenticator Anda (contoh simulasi: <strong>199696</strong>).
              </p>
            </div>

            <form onSubmit={handleVerify2FASubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Verifikasi 2FA / OTP
                </label>
                <input
                  type="text"
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Masukkan kode 6 digit (contoh: 199696)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center font-mono text-sm font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPending2FAUser(null)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-md"
                >
                  Verifikasi &amp; Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MAIN AUTH CARD (MASUK / PENDAFTARAN TAB) */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px] bg-white p-6 sm:p-8 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-200 space-y-5">
          
          {/* Top Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
                setRegSuccess(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-white text-red-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pendaftaran Anggota
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Masuk ke Portal
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Kanal resmi alumni Batalyon Wira Satya Akpol 1996
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Input 1: NRP / Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email dinas atau NRP
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="NRP (contoh: 98010710) atau email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-800 transition-all"
                  />
                </div>

                {/* Input 2: Kata Sandi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-bold text-red-800 hover:underline"
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-800 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Input 3: Security Captcha (Default Mandatory) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Keamanan (Captcha) <span className="text-red-700">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 font-mono text-sm font-black tracking-[0.28em] select-none border border-slate-700 shadow-inner flex items-center justify-between gap-2">
                      <span className="line-through decoration-red-500/50">{captchaCode}</span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Ganti Kode Captcha"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="Ketik kode di samping"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Standar keamanan wajib: Kata Sandi &amp; Captcha. Proteksi 2FA dapat diatur mandiri di menu Pengaturan.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <span>Masuk ke Akun</span>
                  )}
                </button>
              </form>

              {/* Bottom Switcher Note */}
              <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100">
                <span>Belum terdaftar sebagai anggota? </span>
                <button 
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  className="text-red-800 font-bold hover:underline"
                >
                  Daftar Anggota Baru
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER FORM */}
          {authMode === 'register' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Pendaftaran Alumni &amp; Personel
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Pendaftaran akun Batalyon Wira Satya Akpol 1996 (termasuk ADC)
                </p>
              </div>

              {regSuccess ? (
                <div className="py-4 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Pendaftaran Berhasil Diajukan!
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 text-left space-y-1">
                    <p>Nama: <strong>{regNama}</strong></p>
                    <p>NRP: <strong>{regNrp}</strong> ({regPangkat})</p>
                    <p>Status: <span className="text-amber-800 font-bold">Menunggu Verifikasi Admin / Kesekretariatan</span></p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setelah diverifikasi oleh Admin / Kesekretariatan WS96, Anda dapat masuk ke portal menggunakan NRP dan membuat kata sandi pertama kali.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setUsername(regNrp);
                      setRegSuccess(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs transition-colors"
                  >
                    Buka Halaman Masuk
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* NRP */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NRP <span className="text-red-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="74090123"
                        value={regNrp}
                        onChange={(e) => setRegNrp(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-red-800 focus:outline-none"
                      />
                    </div>
                    {/* Pangkat */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pangkat <span className="text-red-700">*</span>
                      </label>
                      <select
                        value={regPangkat}
                        onChange={(e) => setRegPangkat(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-800 focus:outline-none"
                      >
                        {DAFTAR_PANGKAT_POLRI.map((pkt) => (
                          <option key={pkt} value={pkt}>{pkt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nama Lengkap & Gelar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap &amp; Gelar <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kombes Pol. Nama Lengkap, S.I.K., M.H."
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
                  </div>

                  {/* Cascading Master Satker Dropdown */}
                  <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        1. Wilayah Induk (Mabes / 38 Polda / Luar Struktur) <span className="text-red-700">*</span>
                      </label>
                      <select
                        value={regPolda}
                        onChange={(e) => {
                          const w = e.target.value;
                          setRegPolda(w);
                          const satkers = getSatkerUtamaByWilayah(w);
                          const firstS = satkers[0] || w;
                          setRegSatkerUtama(firstS);
                          const subs = getSubSatkerOptionsBySatker(w, firstS);
                          setRegSubSatker(subs[0] || 'Pimpinan / Staf Utama Satker');
                        }}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-800 focus:outline-none"
                      >
                        {DAFTAR_38_POLDA.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        2. Master Satker Utama (Satker / Polres) <span className="text-red-700">*</span>
                      </label>
                      <select
                        value={regSatkerUtama}
                        onChange={(e) => {
                          const s = e.target.value;
                          setRegSatkerUtama(s);
                          const subs = getSubSatkerOptionsBySatker(regPolda, s);
                          setRegSubSatker(subs[0] || 'Pimpinan / Staf Utama Satker');
                        }}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-800 focus:outline-none"
                      >
                        {getSatkerUtamaByWilayah(regPolda).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        3. Sub-Satker / Direktorat / Bagian / ADC
                      </label>
                      <select
                        value={regSubSatker}
                        onChange={(e) => setRegSubSatker(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-800 focus:outline-none"
                      >
                        {getSubSatkerOptionsBySatker(regPolda, regSatkerUtama).map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* No HP & Email */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        No WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="0812xxxx"
                        value={regNoHp}
                        onChange={(e) => setRegNoHp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Dinas
                      </label>
                      <input
                        type="email"
                        placeholder="nama@polri.go.id"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan / Asal Pleton (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Batalyon Wira Satya Akpol 96"
                      value={regAlasan}
                      onChange={(e) => setRegAlasan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Mengirimkan Berkas...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Ajukan Pendaftaran Anggota</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom Note */}
                  <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                    <span>Sudah memiliki akun? </span>
                    <button 
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-red-800 font-bold hover:underline"
                    >
                      Masuk ke Akun
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="font-semibold text-slate-700">Wira Satya 96 &copy; 2026</span>
          <span className="hover:text-slate-900 cursor-pointer">Panduan Leting</span>
          <span className="hover:text-slate-900 cursor-pointer">Kebijakan Privasi</span>
          <span className="hover:text-slate-900 cursor-pointer">Bantuan Angkatan</span>
          <span className="hover:text-slate-900 cursor-pointer">#SelaluBahagia</span>
        </div>
      </footer>

    </div>
  );
}
