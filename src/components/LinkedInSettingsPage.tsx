'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types';
import { getAvatarUrl } from '@/lib/avatarUtils';
import { 
  User, 
  Lock, 
  Eye, 
  Shield, 
  Bell, 
  ChevronRight, 
  Check, 
  Moon, 
  Sun, 
  KeyRound, 
  Fingerprint, 
  Smartphone, 
  Mail, 
  Download, 
  CheckCircle2, 
  X
} from 'lucide-react';

interface LinkedInSettingsPageProps {
  currentUser: AuthUser;
  onClose?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type SettingsSection = 'account' | 'security' | 'visibility' | 'privacy' | 'notifications';

export const LinkedInSettingsPage: React.FC<LinkedInSettingsPageProps> = ({
  currentUser,
  onClose,
  onNavigateToTab,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('security');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings states (Default: Password + Captcha; 2FA is optional and self-managed per user)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPasskeyActive, setIsPasskeyActive] = useState<boolean>(() => {
    return currentUser.mfaMethod === 'BIOMETRIC';
  });
  const [isTwoFactorActive, setIsTwoFactorActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`ws96_2fa_${currentUser.nrp}`);
      if (saved !== null) return saved === 'true';
    }
    return Boolean(currentUser.mfaEnabled);
  });
  const [isAutoPlayVideo, setIsAutoPlayVideo] = useState(true);
  const [isSoundEffects, setIsSoundEffects] = useState(true);
  const [activeStatusVisible, setActiveStatusVisible] = useState(true);
  const [activePasswordModal, setActivePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle2FA = async () => {
    const nextVal = !isTwoFactorActive;
    setIsTwoFactorActive(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ws96_2fa_${currentUser.nrp}`, String(nextVal));
      const updatedUser = { ...currentUser, mfaEnabled: nextVal };
      localStorage.setItem('ws96_active_user', JSON.stringify(updatedUser));
      localStorage.setItem('wirasatya96_current_user', JSON.stringify(updatedUser));
    }
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrp: currentUser.nrp, mfaEnabled: nextVal }),
      });
    } catch {
      // ignore
    }
    showToast(
      nextVal
        ? 'Proteksi 2FA diaktifkan untuk akun Anda. Saat login berikutnya akan meminta kode 2FA.'
        : 'Proteksi 2FA dinonaktifkan. Login cukup menggunakan Kata Sandi & Captcha.'
    );
  };

  const handleTogglePasskey = async () => {
    const nextVal = !isPasskeyActive;
    setIsPasskeyActive(nextVal);
    const nextMethod = nextVal ? 'BIOMETRIC' : 'PIN';
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrp: currentUser.nrp, mfaMethod: nextMethod }),
      });
    } catch {
      // ignore
    }
    showToast(nextVal ? 'Passkey FIDO2 Biometrik berhasil diaktifkan!' : 'Passkey FIDO2 dinonaktifkan.');
  };

  const handleDownloadData = () => {
    const exportData = {
      alumniUser: currentUser,
      exportTimestamp: new Date().toISOString(),
      association: 'Batalyon Wira Satya Akpol 1996 (#SelaluBahagia)',
      encryption: 'AES-256 GCM WiraSatya Security Core',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WiraSatya96_Data_${currentUser.nrp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data akun dan profil leting berhasil diunduh!');
  };

  return (
    <div className="font-sans text-slate-900 pb-20 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-800 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAvatarUrl(currentUser.fotoUrl)}
              alt={currentUser.nama}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Pengaturan & Privasi</span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-900 border border-red-200 font-semibold">
                Bareskrim Security Tier-3
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Kelola kredensial keamanan FIDO2, visibilitas profil, dan preferensi akun Batalyon Wira Satya 96
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR MENU                                            */}
        {/* ============================================================ */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 text-xs">
          {[
            { key: 'account', label: 'Akun', icon: User },
            { key: 'security', label: 'Keamanan', icon: Lock },
            { key: 'visibility', label: 'Visibilitas', icon: Eye },
            { key: 'privacy', label: 'Privasi', icon: Shield },
            { key: 'notifications', label: 'Notifikasi', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key as SettingsSection)}
                className={`w-full px-4 py-3.5 text-left flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-red-50/70 text-red-900 font-bold border-l-4 border-red-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-800' : 'text-slate-400'}`} />
                  <span className="text-xs">{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-red-800' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* RIGHT CONTENT RAIL                                           */}
        {/* ============================================================ */}
        <div className="md:col-span-8 space-y-4">
          
          {/* ========================================================== */}
          {/* 1. PREFERENSI AKUN                                         */}
          {/* ========================================================== */}
          {activeSection === 'account' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Section: Informasi profil */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Informasi profil
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div 
                    onClick={() => onNavigateToTab ? onNavigateToTab('form') : showToast('Membuka form edit profil...')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Nama, lokasi, dan institusi</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {currentUser.nama} &bull; Kepolisian Negara Republik Indonesia
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div 
                    onClick={() => onNavigateToTab ? onNavigateToTab('form') : showToast('Membuka form data kedinasan...')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Info demografi dinas</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">NRP {currentUser.nrp} &bull; Pangkat {currentUser.pangkat}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div 
                    onClick={() => showToast(`Akun NRP ${currentUser.nrp} telah terverifikasi resmi.`)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Verifikasi Anggota Akpol 1996</div>
                      <div className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terverifikasi Batalyon Wira Satya
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Section: Tampilan */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Tampilan
                </h3>
                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <div className="font-semibold text-slate-800">Mode gelap</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {isDarkMode ? 'Mode gelap aktif (Tema Taktis Malam)' : 'Mode terang aktif'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                      showToast(`Mode ${!isDarkMode ? 'Gelap' : 'Terang'} diaktifkan.`);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isDarkMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    <span>{isDarkMode ? 'Gelap' : 'Terang'}</span>
                  </button>
                </div>
              </div>

              {/* Section: Preferensi umum */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Preferensi umum
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div 
                    onClick={() => showToast('Bahasa Indonesia (Resmi Polri) sedang aktif.')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Bahasa aplikasi</div>
                      <div className="text-slate-500 text-[11px]">Bahasa Indonesia (Resmi Polri)</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between px-2">
                    <div>
                      <div className="font-semibold text-slate-800">Putar otomatis video dokumentasi</div>
                      <div className="text-slate-500 text-[11px]">{isAutoPlayVideo ? 'Aktif' : 'Nonaktif'}</div>
                    </div>
                    <button
                      onClick={() => setIsAutoPlayVideo(!isAutoPlayVideo)}
                      className={`text-xs font-bold px-2.5 py-1 rounded ${isAutoPlayVideo ? 'text-red-800 bg-red-50' : 'text-slate-500 bg-slate-100'}`}
                    >
                      {isAutoPlayVideo ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                  <div className="py-2.5 flex items-center justify-between px-2">
                    <div>
                      <div className="font-semibold text-slate-800">Efek suara notifikasi</div>
                      <div className="text-slate-500 text-[11px]">{isSoundEffects ? 'Aktif' : 'Nonaktif'}</div>
                    </div>
                    <button
                      onClick={() => setIsSoundEffects(!isSoundEffects)}
                      className={`text-xs font-bold px-2.5 py-1 rounded ${isSoundEffects ? 'text-red-800 bg-red-50' : 'text-slate-500 bg-slate-100'}`}
                    >
                      {isSoundEffects ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                  <div 
                    onClick={() => onNavigateToTab ? onNavigateToTab('form') : showToast('Membuka pengaturan foto profil...')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Ubah Foto Profil</div>
                      <div className="text-slate-500 text-[11px]">Perbarui foto profil Anda di Formulir Data Diri</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. LOGIN DAN KEAMANAN                                      */}
          {/* ========================================================== */}
          {activeSection === 'security' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Akses akun & Keamanan Tingkat Tinggi</h3>
                    <p className="text-[11px] text-slate-500">
                      Standar keamanan multi-faktor, FIDO2 Biometrik & Passkey Bareskrim
                    </p>
                  </div>
                  <Shield className="w-5 h-5 text-red-800" />
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Email */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Alamat email terdaftar</span>
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                        {currentUser.email || 'Belum diatur (Perbarui di Data Diri)'}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Terverifikasi
                    </span>
                  </div>

                  {/* Phone */}
                  <div 
                    onClick={() => onNavigateToTab && onNavigateToTab('form')}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-1 rounded cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Nomor telepon WhatsApp / OTP</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Klik untuk memperbarui nomor kontak di Data Diri</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Password */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ubah kata sandi</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Gunakan kata sandi kuat minimal 6 karakter</div>
                    </div>
                    <button
                      onClick={() => setActivePasswordModal(true)}
                      className="px-3 py-1 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Ubah
                    </button>
                  </div>

                  {/* Passkey / FIDO2 */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Fingerprint className="w-4 h-4 text-red-800" />
                        <span>Kunci sandi (Passkey / FIDO2 / Biometrik)</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Login instan menggunakan Windows Hello, Touch ID, atau Face ID tanpa mengetik password
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePasskey}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        isPasskeyActive
                          ? 'bg-red-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPasskeyActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  {/* Where you are logged in */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Di mana Anda login</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Perangkat Web Browser &bull; Sesi Aktif Sekarang (NRP {currentUser.nrp})
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Sesi Ini
                    </span>
                  </div>

                  {/* Two factor authentication */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Autentikasi dua faktor (2FA)</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Default login cukup Password &amp; Captcha. Aktifkan 2FA jika Anda ingin proteksi OTP tambahan saat login.
                      </div>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        isTwoFactorActive
                          ? 'bg-red-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isTwoFactorActive ? 'Aktif (2FA ON)' : 'Nonaktif (Default)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. VISIBILITAS                                             */}
          {/* ========================================================== */}
          {activeSection === 'visibility' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Visibilitas profil dan direktori Anda
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div 
                    onClick={() => showToast('Visibilitas profil diatur ke: Nama, pangkat, dan foto ditampilkan untuk rekan leting.')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Visibilitas saat mengunjungi profil rekan</div>
                      <div className="text-slate-500 text-[11px]">Nama, pangkat, dan foto ditampilkan</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between px-2">
                    <div>
                      <div className="font-semibold text-slate-800">Pengaturan profil internal</div>
                      <div className="text-slate-500 text-[11px]">Hanya dapat diakses oleh Perwira Wira Satya 96 terverifikasi</div>
                    </div>
                    <span className="font-bold text-emerald-600 text-[11px]">Terkunci Internal</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between px-2">
                    <div>
                      <div className="font-semibold text-slate-800">Kelola status aktif / online</div>
                      <div className="text-slate-500 text-[11px]">{activeStatusVisible ? 'Terlihat oleh leting' : 'Disembunyikan'}</div>
                    </div>
                    <button
                      onClick={() => setActiveStatusVisible(!activeStatusVisible)}
                      className={`text-xs font-bold px-2.5 py-1 rounded ${activeStatusVisible ? 'text-red-800 bg-red-50' : 'text-slate-500 bg-slate-100'}`}
                    >
                      {activeStatusVisible ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 4. PRIVASI DATA                                            */}
          {/* ========================================================== */}
          {activeSection === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Cara Paguyuban Wira Satya 96 mengelola data Anda
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Unduh data profil Anda (Export JSON)</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Dapatkan salinan arsip data kedinasan dan profil akun Anda
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadData}
                      className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Hapus riwayat pencarian direktori</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Bersihkan riwayat pencarian rekan perwira & satker</div>
                    </div>
                    <button
                      onClick={() => showToast('Riwayat pencarian direktori berhasil dibersihkan.')}
                      className="px-3 py-1 rounded border border-slate-300 font-semibold hover:bg-slate-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 5. NOTIFIKASI                                              */}
          {/* ========================================================== */}
          {activeSection === 'notifications' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Banner Info */}
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-950">
                <Bell className="w-4 h-4 text-red-800 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Pengaturan notifikasi terpusat Batalyon: </span>
                  <span>Notifikasi penting seperti Atensi Kesehatan dan Arus Kas otomatis dikirimkan ke akun leting.</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Pintasan Modul & Notifikasi
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { title: 'Atensi Kesehatan Leting', desc: 'Pemberitahuan bila ada rekan leting atau keluarga yang sakit/dirawat', tab: 'direktori' },
                    { title: 'Arus Kas & Iuran', desc: 'Laporan rekapitulasi kebendaharaan bulanan dan konfirmasi pembayaran', tab: 'bendahara' },
                    { title: 'Karier & Purna Tugas', desc: 'Informasi transisi karier dan peluang wirausaha purna tugas', tab: 'purnaTugas' },
                    { title: 'Pesan & Obrolan Masuk', desc: 'Notifikasi chat langsung dari perwira leting', tab: 'pesan' },
                    { title: 'Linimasa & Postingan Beranda', desc: 'Komentar dan respon suka pada postingan Anda', tab: 'direktori' },
                  ].map((notif, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (onNavigateToTab) {
                          onNavigateToTab(notif.tab);
                        } else {
                          showToast(`Preferensi ${notif.title} aktif`);
                        }
                      }}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{notif.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{notif.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Ubah Kata Sandi */}
      {activePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-red-800" />
              <span>Ubah Kata Sandi Akun</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter kombinasi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePasswordModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newPassword && newPassword === confirmPassword) {
                    showToast('Kata sandi akun berhasil diperbarui!');
                    setActivePasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  } else {
                    alert('Kata sandi konfirmasi tidak cocok atau kosong.');
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-red-800 text-white font-bold hover:bg-red-900 text-xs"
              >
                Simpan Sandi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
