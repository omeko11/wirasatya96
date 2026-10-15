'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRESET_USERS } from '@/data/mockUsers';
import { AuthUser, MfaMethod } from '@/types';
import { WSLogo } from '@/components/WSLogo';
import { 
  Key, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Sparkles,
  AlertCircle,
  Fingerprint,
  ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Form inputs
  const [username, setUsername] = useState('74080123'); // Default Ketua NRP or email
  const [password, setPassword] = useState('wirasatya96');
  const [showPassword, setShowPassword] = useState(false);

  // FIDO2 / Passkey Browser Modal Simulation State
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyAccount, setPasskeyAccount] = useState('omeko11');

  // Role demo drawer state
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSuccess = (user: AuthUser, mfaMethod?: MfaMethod) => {
    localStorage.setItem('ws96_active_user', JSON.stringify(user));
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

    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi / PIN akun Anda.');
      return;
    }

    setLoading(true);

    try {
      // Find matching user from PRESET_USERS
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

  const handlePasskeyContinue = async () => {
    setLoading(true);
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
    }, 400);
  };

  const handleSelectRole = (user: AuthUser) => {
    setUsername(user.nrp);
    setPassword('wirasatya96');
    setPasskeyAccount(user.id === 'u-superadmin' ? 'omeko11' : user.nrp);
    setShowRoleDrawer(false);
    // Instant login for demo convenience
    handleLoginSuccess(user, user.mfaMethod);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col justify-between font-sans text-slate-900 antialiased">
      
      {/* ============================================================== */}
      {/* 1. TOP BRAND HEADER (EXACT LINKEDIN TOP LOGO)                 */}
      {/* ============================================================== */}
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

        <button
          onClick={() => setShowRoleDrawer(!showRoleDrawer)}
          className="text-xs font-bold text-red-900 hover:text-red-950 hover:bg-red-50 flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-300 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Demo Role</span>
        </button>
      </header>

      {/* ============================================================== */}
      {/* 2. GOOGLE PASSWORD MANAGER / FIDO2 MODAL (IF TRIGGERED)        */}
      {/* ============================================================== */}
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
                onClick={() => setShowRoleDrawer(true)}
                className="px-3 py-2 rounded-full bg-[#27303d] hover:bg-[#323d4e] text-slate-200 font-medium transition-all text-center flex-1 text-[11px]"
              >
                Kunci lain
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
      {/* 3. MAIN SIGN-IN CARD (EXACT LINKEDIN LOGIN CARD)              */}
      {/* ============================================================== */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] bg-white p-7 sm:p-9 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200/80 space-y-5">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Masuk
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Tetap terhubung dengan rekan satu letting Akpol 1996
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Picker Drawer */}
          {showRoleDrawer && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="text-[11px] font-bold text-slate-700">Pilih Akun Demo (1-Click Login):</span>
                <button 
                  onClick={() => setShowRoleDrawer(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {PRESET_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectRole(u)}
                    className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-red-800 hover:bg-red-50/50 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs truncate">{u.nama.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-500">{u.pangkat} &bull; {u.nrp}</p>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Input 1: NRP / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email dinas atau NRP
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="NRP (contoh: 74080123) atau email"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-400 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-red-800 focus:border-red-800 transition-all"
              />
            </div>

            {/* Input 2: Kata Sandi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi / PIN
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
                  placeholder="Kata Sandi"
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-400 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-red-800 focus:border-red-800 transition-all pr-10"
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

            {/* Forgot password */}
            <div>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silakan hubungi Kesekretariatan atau Bendahara Yayasan Wira Satya 96 untuk reset kata sandi dinas.');
                }}
                className="text-xs font-bold text-red-800 hover:underline inline-block"
              >
                Lupa kata sandi?
              </a>
            </div>

            {/* Submit Button (Bareskrim Crimson Red) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold rounded-full text-sm transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
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

            {/* Divider: atau */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-300 w-full" />
              <span className="bg-white px-3 text-xs text-slate-500 font-medium absolute">
                atau
              </span>
            </div>

            {/* FIDO2 / Passkey Button (LinkedIn Style) */}
            <button
              type="button"
              onClick={() => setShowPasskeyModal(true)}
              className="w-full py-2.5 px-4 border border-slate-400 hover:bg-slate-50 text-slate-700 font-bold rounded-full text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Fingerprint className="w-4 h-4 text-red-800" />
              <span>Masuk dengan Kunci Sandi / FIDO2</span>
            </button>

            {/* Role Demo Quick Picker Button */}
            <button
              type="button"
              onClick={() => setShowRoleDrawer(!showRoleDrawer)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Role Demo (Superadmin, Ketua, Bendahara, dll)</span>
            </button>

          </form>

          {/* Footer note */}
          <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
            <span>Baru di Wira Satya 96? </span>
            <a 
              href="#help" 
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi Kesekretariatan Leting untuk registrasi data perwira baru.');
              }}
              className="text-red-800 font-bold hover:underline"
            >
              Hubungi Sekretariat Leting
            </a>
          </div>

        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. FOOTER (EXACT LINKEDIN CLEAN FOOTER LINKS)                 */}
      {/* ============================================================== */}
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
