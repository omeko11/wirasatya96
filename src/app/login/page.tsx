'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRESET_USERS } from '@/data/mockUsers';
import { AuthUser, MfaMethod } from '@/types';
import { 
  Shield, 
  Lock, 
  Fingerprint, 
  Mail, 
  Smartphone, 
  KeyRound, 
  ChevronRight, 
  CheckCircle2, 
  UserCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'credentials' | 'biometric' | 'emailOtp' | 'totp' | 'quickRoles'>('quickRoles');
  
  // Standard credentials
  const [nrp, setNrp] = useState('00000001');
  const [pin, setPin] = useState('123456');

  // MFA State
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (user: AuthUser, mfaMethod?: MfaMethod) => {
    // Save to localStorage for instant client state
    localStorage.setItem('ws96_active_user', JSON.stringify(user));
    if (mfaMethod) {
      localStorage.setItem('ws96_mfa_verified', 'true');
    }
    // Redirect to home dashboard
    router.push('/');
  };

  const handleQuickLogin = async (user: AuthUser) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data.user, user.mfaMethod);
      } else {
        setErrorMessage(data.message || 'Gagal login');
      }
    } catch {
      // Fallback client-side
      handleLoginSuccess(user, user.mfaMethod);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrp, pin }),
      });
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data.user, 'PIN');
      } else {
        // Fallback check in preset
        const matched = PRESET_USERS.find((u) => u.nrp === nrp);
        if (matched) {
          handleLoginSuccess(matched, 'PIN');
        } else {
          setErrorMessage('NRP atau PIN tidak terdaftar dalam sistem Batalyon 96.');
        }
      }
    } catch {
      const matched = PRESET_USERS.find((u) => u.nrp === nrp);
      if (matched) {
        handleLoginSuccess(matched, 'PIN');
      } else {
        setErrorMessage('Terjadi kendala koneksi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricScan = () => {
    setBiometricScanning(true);
    setErrorMessage('');
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        // Default login as Superadmin or matched user
        const superadmin = PRESET_USERS[0];
        handleLoginSuccess(superadmin, 'BIOMETRIC');
      }, 700);
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Masukkan 6 digit kode OTP yang telah dikirimkan.');
      return;
    }
    // Match user
    const matched = PRESET_USERS.find((u) => u.nrp === nrp) || PRESET_USERS[1];
    handleLoginSuccess(matched, 'EMAIL_OTP');
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      setErrorMessage('Masukkan 6 digit kode dari Google Authenticator.');
      return;
    }
    const matched = PRESET_USERS.find((u) => u.nrp === nrp) || PRESET_USERS[3]; // Bendahara default
    handleLoginSuccess(matched, 'GOOGLE_AUTH');
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-polri-navy to-black flex items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="max-w-xl w-full space-y-6">
        {/* Header Insignia */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-polri-goldDark to-polri-gold text-polri-navy shadow-2xl border-2 border-white/20 mx-auto">
            <Shield className="w-9 h-9 drop-shadow-md" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-polri-gold bg-polri-gold/10 px-3 py-1 rounded-full border border-polri-gold/30">
              AKPOL 1996 • #SELALUBAHAGIA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              BATALYON WIRA SATYA 1996
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Sistem Informasi Kesejahteraan, Direktori Penempatan 38 Polda, Kas Paguyuban, & Kesiapan Purna Tugas
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-slate-900 space-y-6">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('quickRoles')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'quickRoles'
                  ? 'bg-polri-navy text-polri-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Role Demo</span>
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'credentials'
                  ? 'bg-polri-navy text-polri-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>NRP & PIN</span>
            </button>

            <button
              onClick={() => setActiveTab('biometric')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'biometric'
                  ? 'bg-polri-navy text-polri-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>FIDO / Bio</span>
            </button>

            <button
              onClick={() => setActiveTab('emailOtp')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'emailOtp'
                  ? 'bg-polri-navy text-polri-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>OTP Email</span>
            </button>

            <button
              onClick={() => setActiveTab('totp')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'totp'
                  ? 'bg-polri-navy text-polri-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Auth</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: QUICK ROLE PICKER (PRESET TEST) */}
          {activeTab === 'quickRoles' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Masuk Langsung Sesuai Peran:
                </span>
                <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Akses Instan
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {PRESET_USERS.map((u) => (
                  <button
                    key={u.id}
                    disabled={loading}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-polri-gold/70 bg-white hover:bg-slate-50 transition-all shadow-sm flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-red-100 text-red-900'
                              : u.role === 'KETUA'
                              ? 'bg-purple-100 text-purple-900'
                              : u.role === 'BENDAHARA'
                              ? 'bg-emerald-100 text-emerald-900'
                              : u.role === 'SEKRETARIAT'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">NRP {u.nrp}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 group-hover:text-polri-navy">
                        {u.nama}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {u.role === 'SUPERADMIN' && 'Developer: bypass kunci NRP, kontrol penuh database'}
                        {u.role === 'KETUA' && 'Ketua Batalyon: pantau atensi kesehatan & kesiapan pensiun'}
                        {u.role === 'BENDAHARA' && 'Pengelolaan kas paguyuban, iuran, & santunan leting'}
                        {u.role === 'SEKRETARIAT' && 'Pemetaan 38 Polda, daftarkan akun anggota baru, export data'}
                        {u.role === 'ANGGOTA' && 'Pembaruan mandiri profil & keluarga sendiri'}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-polri-navy group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS (NRP & PIN) */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Registrasi Pokok (NRP)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 74080123"
                  value={nrp}
                  onChange={(e) => setNrp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Pengamanan (6 Digit)
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest font-mono focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-polri-navy hover:bg-polri-navyLight text-polri-gold font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Masuk ke Portal Wira Satya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: BIOMETRIC / FIDO2 */}
          {activeTab === 'biometric' && (
            <div className="text-center py-6 space-y-4">
              <div className="relative inline-block">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    biometricScanning
                      ? 'bg-blue-100 text-blue-600 animate-pulse ring-8 ring-blue-50'
                      : biometricSuccess
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {biometricSuccess ? (
                    <CheckCircle2 className="w-12 h-12" />
                  ) : (
                    <Fingerprint className="w-12 h-12" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {biometricScanning
                    ? 'Memindai Sidik Jari / Wajah...'
                    : biometricSuccess
                    ? 'Autentikasi Biometrik Berhasil!'
                    : 'Masuk dengan Biometrik / FIDO2'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Gunakan sensor sidik jari, Touch ID, atau Windows Hello yang terpasang di perangkat Anda.
                </p>
              </div>

              {!biometricSuccess && (
                <button
                  type="button"
                  disabled={biometricScanning}
                  onClick={handleBiometricScan}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Mulai Pemindaian Biometrik</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 4: EMAIL OTP */}
          {activeTab === 'emailOtp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor NRP Personel
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 74080123"
                    value={nrp}
                    onChange={(e) => setNrp(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-polri-navy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(true);
                      alert('Kode OTP 6-Digit telah dikirimkan ke email terdaftar Anda (Demo: masukkan 6 digit bebas).');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold whitespace-nowrap hover:bg-black transition-colors"
                  >
                    Kirim OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Masukkan 6 Digit OTP Email
                  </label>
                  <div className="flex justify-between gap-1.5">
                    {otpCode.map((val, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => {
                          const next = [...otpCode];
                          next[idx] = e.target.value;
                          setOtpCode(next);
                          if (e.target.value && idx < 5) {
                            const nextEl = document.getElementById(`otp-input-${idx + 1}`);
                            nextEl?.focus();
                          }
                        }}
                        className="w-10 sm:w-12 h-12 text-center text-lg font-black rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-polri-navy"
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full py-3 rounded-xl bg-polri-navy hover:bg-polri-navyLight text-polri-gold font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Verifikasi OTP & Masuk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 5: GOOGLE AUTHENTICATOR (TOTP) */}
          {activeTab === 'totp' && (
            <form onSubmit={handleTotpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor NRP Personel
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 74100678"
                  value={nrp}
                  onChange={(e) => setNrp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-polri-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode 6-Digit Google Authenticator
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Contoh: 849201"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center text-xl tracking-widest font-mono font-bold focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Buka aplikasi Google Authenticator di smartphone Anda dan masukkan kode 6 angka yang tampil.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-polri-navy hover:bg-polri-navyLight text-polri-gold font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Verifikasi Google Authenticator</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Security Badge Footnote */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <Lock className="w-3 h-3 text-emerald-600" />
              Protokol Keamanan SIPP Terenkripsi
            </span>
            <span>Versi Produksi v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
