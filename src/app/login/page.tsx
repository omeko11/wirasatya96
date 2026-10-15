'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRESET_USERS } from '@/data/mockUsers';
import { AuthUser, MfaMethod } from '@/types';
import { 
  Shield, 
  FileText, 
  BarChart3, 
  Database, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Key, 
  Check, 
  RotateCw, 
  ChevronRight, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Form inputs
  const [username, setUsername] = useState('74080123'); // Default Ketua NRP or email
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  
  // Security captcha state
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // FIDO2 / Passkey Browser Modal Simulation State
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyAccount, setPasskeyAccount] = useState('omeko11');

  // Role demo drawer state
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Automatically trigger passkey dialog if requested or on first mount preview
  useEffect(() => {
    // Show passkey modal briefly to match cas.bareskrim.polri.go.id experience
    const timer = setTimeout(() => {
      setShowPasskeyModal(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (user: AuthUser, mfaMethod?: MfaMethod) => {
    localStorage.setItem('ws96_active_user', JSON.stringify(user));
    if (mfaMethod) {
      localStorage.setItem('ws96_mfa_verified', 'true');
    }
    router.push('/');
  };

  const handleCaptchaClick = () => {
    if (captchaChecked) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaChecked(true);
    }, 800);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Harap masukkan Username atau Email Dinas Polri.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Harap masukkan Password akun Anda.');
      return;
    }

    if (!captchaChecked) {
      setErrorMessage('Harap selesaikan Verifikasi Keamanan (reCAPTCHA) terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      // Find matching user from PRESET_USERS by nrp, email, or username match
      const matched = PRESET_USERS.find(
        (u) => 
          u.nrp === username.trim() || 
          u.email.toLowerCase() === username.trim().toLowerCase() ||
          u.id.toLowerCase().includes(username.trim().toLowerCase())
      ) || PRESET_USERS[1]; // default to Ketua

      // Call internal login API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: matched.id }),
      });
      const data = await res.json();

      if (data.success) {
        handleLoginSuccess(data.user, 'PIN');
      } else {
        handleLoginSuccess(matched, 'PIN');
      }
    } catch {
      const fallback = PRESET_USERS[1];
      handleLoginSuccess(fallback, 'PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricClick = () => {
    setBiometricLoading(true);
    setShowPasskeyModal(true);
    setTimeout(() => {
      setBiometricLoading(false);
    }, 400);
  };

  const handlePasskeyContinue = async () => {
    setBiometricLoading(true);
    // Find superadmin or omeko11 user
    const superadmin = PRESET_USERS[0];
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: superadmin.id }),
      });
    } catch {
      // client fallback
    }
    setTimeout(() => {
      handleLoginSuccess(superadmin, 'BIOMETRIC');
    }, 600);
  };

  const handleSelectRole = (user: AuthUser) => {
    setUsername(user.nrp);
    setPassword('wirasatya96');
    setCaptchaChecked(true);
    setPasskeyAccount(user.id === 'u-superadmin' ? 'omeko11' : user.nrp);
    setShowRoleDrawer(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#080d16] font-sans antialiased text-slate-100 relative">
      
      {/* ============================================================== */}
      {/* GOOGLE PASSWORD MANAGER / FIDO2 POPUP (AS IN USER SCREENSHOT) */}
      {/* ============================================================== */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1b222d] border border-slate-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-slate-100">
            {/* Passkey Graphic */}
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

            {/* Account Pill Card */}
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

            {/* Action Buttons matching screenshot */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setShowRoleDrawer(true)}
                className="px-3 py-2 rounded-full bg-[#27303d] hover:bg-[#323d4e] text-slate-200 font-medium transition-all text-center flex-1 text-[11px]"
              >
                Gunakan kunci sandi lain
              </button>
              <button
                type="button"
                onClick={handlePasskeyContinue}
                className="px-4 py-2 rounded-full bg-[#7be0eb] hover:bg-[#68d1dc] text-slate-950 font-bold transition-all text-center text-xs shadow-md"
              >
                Lanjutkan
              </button>
              <button
                type="button"
                onClick={() => setShowPasskeyModal(false)}
                className="px-3 py-2 rounded-full bg-[#27303d] hover:bg-[#323d4e] text-slate-300 font-medium transition-all text-center text-[11px]"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LEFT PANEL: DARK POLRI EXECUTIVE THEME (YAYASAN WIRA SATYA 96) */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 bg-[#080d16] p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">
            YAYASAN BATALYON WIRA SATYA
          </p>
          <p className="text-xs sm:text-sm font-extrabold tracking-wider text-slate-200 uppercase mt-0.5">
            ALUMNI AKPOL 1996 • #SELALUBAHAGIA
          </p>
        </div>

        {/* Center Section: Yayasan Wira Satya Branding */}
        <div className="my-10 sm:my-14 lg:my-auto max-w-lg relative z-10 space-y-6">
          
          {/* Emblem squircle icon with red/orange accent border */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1b1f2b] to-[#0c0f17] border-2 border-red-600/70 p-3 shadow-xl shadow-red-950/40 flex items-center justify-center">
            <div className="relative">
              <Shield className="w-8 h-8 text-red-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
              PORTAL WIRA SATYA 96
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-widest text-red-500 mt-1 uppercase">
              YAYASAN KELUARGA BESAR BATALYON AKPOL 1996
            </p>
          </div>

          {/* Red horizontal accent bar */}
          <div className="w-14 h-1 bg-red-600 rounded-full" />

          {/* Tagline */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Sistem informasi terpadu leting — satu pintu untuk direktori penempatan, pemetaan kesejahteraan keluarga, dan tata kelola kebendaharaan paguyuban.
          </p>

          {/* 3 Bullet Features matching layout */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 group">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Direktori & Sebaran Leting</p>
                <p className="text-xs text-slate-400">
                  Pemetaan persebaran dinas alumni Akpol 1996 di 38 Polda, Mabes Polri, Polres, hingga penugasan kementerian/lembaga.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Rekap Kesejahteraan & Purna Tugas</p>
                <p className="text-xs text-slate-400">
                  Pemetaan kesiapan masa pensiun, atensi riwayat kesehatan leting, & kepedulian keluarga rekan seangkatan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Tata Kelola Kas & Solidaritas</p>
                <p className="text-xs text-slate-400">
                  Transparansi buku kas yayasan, iuran bulanan leting, santunan duka cita, dan bantuan sosial leting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Left Footer */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Sistem resmi Yayasan Batalyon Wira Satya 96 — Selalu Bahagia & Saling Menjaga.
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: MINIMALIST LIGHT GRAY OFFICIAL LOGIN FORM         */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 bg-[#eceff3] p-6 sm:p-10 lg:p-14 flex flex-col justify-between items-center relative text-slate-900">
        
        {/* Top Quick Role Switcher Banner */}
        <div className="w-full max-w-md flex items-center justify-between pb-2">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Portal Resmi Yayasan Wira Satya 96
          </span>
          <button
            type="button"
            onClick={() => setShowRoleDrawer(!showRoleDrawer)}
            className="text-[11px] font-bold text-red-700 hover:text-red-800 bg-red-100/80 hover:bg-red-200/80 px-2.5 py-1 rounded-md transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-red-600" />
            Pilih Role Demo (5 Akun)
          </button>
        </div>

        {/* Role Drawer Modal / Expandable */}
        {showRoleDrawer && (
          <div className="w-full max-w-md mb-4 p-3.5 bg-white rounded-xl shadow-lg border border-slate-300 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Pilih Akun Preset untuk Tes Cepat:</span>
              <button 
                onClick={() => setShowRoleDrawer(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PRESET_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectRole(u)}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{u.nrp}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate mt-1">{u.nama}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center Login Container */}
        <div className="w-full max-w-md my-auto py-4">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke Portal Yayasan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gunakan akun anggota Paguyuban / Yayasan Wira Satya 96.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100/90 border border-red-300 text-red-800 text-xs rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Input 1: NRP / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NRP atau Email Anggota Leting
              </label>
              <input
                type="text"
                placeholder="Contoh: 74080123 atau nama@wirasatya96.id"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none placeholder-slate-400 transition-all shadow-sm"
              />
            </div>

            {/* Input 2: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password / PIN Akun
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi Kesekretariatan atau Bendahara Yayasan Wira Satya 96 untuk reset kata sandi akun.');
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none placeholder-slate-400 transition-all shadow-sm"
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

            {/* Input 3: Verifikasi Keamanan (reCAPTCHA box) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Verifikasi Keamanan
              </label>
              <div 
                onClick={handleCaptchaClick}
                className="bg-white border border-slate-300 rounded-lg p-3 flex items-center justify-between shadow-sm cursor-pointer hover:border-slate-400 transition-all select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                    captchaChecked 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'border-slate-300 bg-slate-50'
                  }`}>
                    {captchaLoading ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    ) : captchaChecked ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : null}
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    I&apos;m not a robot
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shadow-sm">
                      🛡️
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                    reCAPTCHA
                  </span>
                  <span className="text-[8px] text-slate-400">
                    Privasi & Ketentuan
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Submit Button: Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold rounded-lg text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>

            {/* Divider: ATAU */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-300 w-full" />
              <span className="bg-[#eceff3] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                ATAU
              </span>
            </div>

            {/* Biometric Button: Memverifikasi Biometrik... */}
            <button
              type="button"
              onClick={handleBiometricClick}
              disabled={biometricLoading}
              className="w-full py-2.5 px-4 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4 text-slate-600" />
              <span>Memverifikasi Biometrik...</span>
            </button>

          </form>

        </div>

        {/* Bottom Right Footer */}
        <div className="w-full max-w-md text-center pt-4 border-t border-slate-300/80">
          <p className="text-[11px] text-slate-500">
            Sistem internal Yayasan Batalyon Wira Satya 96 • Hak Cipta Alumni Akpol 1996.
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            WS96 v1.0.0
          </p>
        </div>

      </div>

    </div>
  );
}
