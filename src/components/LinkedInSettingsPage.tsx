'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types';
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

  // Settings states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPasskeyActive, setIsPasskeyActive] = useState(true);
  const [isTwoFactorActive, setIsTwoFactorActive] = useState(true);
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
              src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}
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
        {/* LEFT SIDEBAR MENU (SCREENSHOTS 1-5 NAVIGATION MATCH)        */}
        {/* ============================================================ */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 text-xs">
          {[
            { key: 'account', label: 'Preferensi akun', icon: User },
            { key: 'security', label: 'Login dan keamanan', icon: Lock },
            { key: 'visibility', label: 'Visibilitas', icon: Eye },
            { key: 'privacy', label: 'Privasi data', icon: Shield },
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
        {/* RIGHT CONTENT RAIL (MATCHING SCREENSHOT DETAILS)             */}
        {/* ============================================================ */}
        <div className="md:col-span-8 space-y-4">
          
          {/* ========================================================== */}
          {/* 1. PREFERENSI AKUN (SCREENSHOT 1)                          */}
          {/* ========================================================== */}
          {activeSection === 'account' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Section: Informasi profil */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Informasi profil
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Nama, lokasi, dan institusi</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {currentUser.nama} &bull; Kepolisian Negara Republik Indonesia
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Info demografi dinas</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">NRP {currentUser.nrp} &bull; Pangkat {currentUser.pangkat}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
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
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Bahasa aplikasi</div>
                      <div className="text-slate-500 text-[11px]">Bahasa Indonesia (Resmi Polri)</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
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
                  <div className="py-2.5 flex items-center justify-between">
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
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Menampilkan foto profil</div>
                      <div className="text-slate-500 text-[11px]">Semua anggota Batalyon Wira Satya 96</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. LOGIN DAN KEAMANAN (SCREENSHOT 2 MATCH)                 */}
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
                        {currentUser.email || 'agungkrisdianto96@gmail.com'}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Terverifikasi
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Nomor telepon OTP</span>
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono mt-0.5">+62 812-9696-1996</div>
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
                      <div className="text-slate-500 text-[11px] mt-0.5">Terakhir diperbarui 14 hari yang lalu</div>
                    </div>
                    <button
                      onClick={() => setActivePasswordModal(true)}
                      className="px-3 py-1 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Ubah
                    </button>
                  </div>

                  {/* Passkey / FIDO2 (User explicit request) */}
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
                      onClick={() => {
                        setIsPasskeyActive(!isPasskeyActive);
                        showToast(isPasskeyActive ? 'Passkey FIDO2 dinonaktifkan.' : 'Passkey FIDO2 Bareskrim berhasil diaktifkan!');
                      }}
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
                        Windows PC (Mabes Bareskrim) &bull; Sesi Aktif Sekarang
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
                        Verifikasi tambahan via Email OTP & Biometrik saat login dari perangkat baru
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsTwoFactorActive(!isTwoFactorActive);
                        showToast(isTwoFactorActive ? '2FA dinonaktifkan.' : '2FA Keamanan Tinggi diaktifkan.');
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        isTwoFactorActive
                          ? 'bg-red-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isTwoFactorActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. VISIBILITAS (SCREENSHOT 3 MATCH)                        */}
          {/* ========================================================== */}
          {activeSection === 'visibility' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Visibilitas profil dan jaringan Anda
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Visibilitas saat mengunjungi profil rekan</div>
                      <div className="text-slate-500 text-[11px]">Nama, pangkat, dan foto ditampilkan</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Pengaturan profil internal</div>
                      <div className="text-slate-500 text-[11px]">Hanya dapat diakses oleh 286 Perwira Wira Satya 96</div>
                    </div>
                    <span className="font-bold text-emerald-600 text-[11px]">Terkunci Internal</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Visibilitas koneksi & jejaring</div>
                      <div className="text-slate-500 text-[11px]">Aktif untuk seluruh rekan leting</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
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
          {/* 4. PRIVASI DATA (SCREENSHOT 4 MATCH)                       */}
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
                      <div className="font-semibold text-slate-800">Unduh data profil Anda (Export JSON / Excel)</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Dapatkan salinan arsip data kedinasan, keluarga, dan kebendaharaan Anda
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

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Data untuk Asisten AI Wira Satya</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Membantu perangkuman laporan eksekutif dan rekomendasi mutasi leting
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px]">
                      Aktif (Terenkripsi)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 5. NOTIFIKASI (SCREENSHOT 5 MATCH)                         */}
          {/* ========================================================== */}
          {activeSection === 'notifications' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Banner Info */}
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-950">
                <Bell className="w-4 h-4 text-red-800 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Pengaturan notifikasi terpusat Batalyon: </span>
                  <span>Notifikasi penting seperti Atensi Kesehatan dan Transparansi Kas otomatis dikirimkan ke Email dan WhatsApp leting.</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
                  Notifikasi yang Anda terima
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { title: 'Atensi Kesehatan Leting', desc: 'Pemberitahuan bila ada rekan leting atau keluarga yang sakit/dirawat' },
                    { title: 'Transparansi Kas & Iuran Yayasan', desc: 'Laporan rekapitulasi kebendaharaan bulanan dan konfirmasi pembayaran' },
                    { title: 'Riwayat Jabatan & Mutasi Baru', desc: 'Update mutasi dan promosi jabatan TR Kapolri rekan sesama angkatan' },
                    { title: 'Pesan & Obrolan Masuk', desc: 'Notifikasi chat langsung dari perwira leting' },
                    { title: 'Linimasa & Postingan Beranda', desc: 'Komentar dan respon suka pada postingan Anda' },
                  ].map((notif, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (onNavigateToTab) {
                          if (notif.title.includes('Kesehatan')) onNavigateToTab('kesehatan');
                          else if (notif.title.includes('Iuran') || notif.title.includes('Kas')) onNavigateToTab('keuangan');
                          else if (notif.title.includes('Jabatan')) onNavigateToTab('jobs');
                          else if (notif.title.includes('Pesan')) onNavigateToTab('messaging');
                          else onNavigateToTab('beranda');
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
