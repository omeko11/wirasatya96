'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, MfaMethod, DAFTAR_PANGKAT_POLRI } from '@/types';
import { WSLogo } from '@/components/WSLogo';
import {
  SatkerBerjenjangModal,
  SatkerSelectionResult,
} from '@/components/SatkerBerjenjangModal';
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
  Volume2
} from 'lucide-react';

function generateCaptchaCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createSeededRng(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface GraphicSecurityCaptchaProps {
  code: string;
  seed: number;
  inputValue: string;
  onInputChange: (val: string) => void;
  onRefresh: () => void;
}

const CAPTCHA_CHAR_COLORS = [
  '#fbbf24', // Amber
  '#38bdf8', // Sky Blue
  '#4ade80', // Emerald Green
  '#fb7185', // Rose Red
  '#c084fc', // Purple
  '#facc15', // Yellow Gold
  '#2dd4bf', // Teal
  '#f87171', // Coral Red
];

const CAPTCHA_FONTS = [
  "'Courier New', Courier, monospace",
  "Georgia, 'Times New Roman', serif",
  "'Consolas', 'Lucida Console', monospace",
  "'Trebuchet MS', Verdana, sans-serif",
  "Impact, 'Arial Black', sans-serif",
];

function GraphicSecurityCaptcha({
  code,
  seed,
  inputValue,
  onInputChange,
  onRefresh,
}: GraphicSecurityCaptchaProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isMatched =
    inputValue.trim().length === code.length &&
    inputValue.trim().toUpperCase() === code.toUpperCase();

  const visualData = useMemo(() => {
    const rng = createSeededRng(`${code}-${seed}`);
    const chars = code.split('').map((ch, idx) => {
      const baseX = 28 + idx * 38;
      const jitterX = (rng() - 0.5) * 8;
      const jitterY = 40 + (rng() - 0.5) * 10;
      const rotate = (rng() - 0.5) * 40; // -20deg to +20deg
      const skewX = (rng() - 0.5) * 24; // -12deg to +12deg
      const scale = 0.96 + rng() * 0.18;
      const color =
        CAPTCHA_CHAR_COLORS[
          Math.floor(rng() * CAPTCHA_CHAR_COLORS.length)
        ];
      const fontFamily =
        CAPTCHA_FONTS[Math.floor(rng() * CAPTCHA_FONTS.length)];
      return {
        ch,
        x: Number((baseX + jitterX).toFixed(1)),
        y: Number(jitterY.toFixed(1)),
        rotate: Number(rotate.toFixed(1)),
        skewX: Number(skewX.toFixed(1)),
        scale: Number(scale.toFixed(2)),
        color,
        fontFamily,
      };
    });

    // Interference bezier curves & strike lines
    const noiseLines = Array.from({ length: 6 }).map((_, i) => {
      const x1 = Number((rng() * 35).toFixed(1));
      const y1 = Number((8 + rng() * 48).toFixed(1));
      const cx1 = Number((50 + rng() * 60).toFixed(1));
      const cy1 = Number((rng() * 64).toFixed(1));
      const cx2 = Number((110 + rng() * 60).toFixed(1));
      const cy2 = Number((rng() * 64).toFixed(1));
      const x2 = Number((180 + rng() * 35).toFixed(1));
      const y2 = Number((8 + rng() * 48).toFixed(1));
      const color =
        CAPTCHA_CHAR_COLORS[(i + Math.floor(rng() * 4)) % CAPTCHA_CHAR_COLORS.length];
      const width = Number((1.0 + rng() * 0.9).toFixed(2));
      const opacity = Number((0.35 + rng() * 0.3).toFixed(2));
      const dash = rng() > 0.5 ? '4 2' : undefined;
      return {
        d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
        color,
        width,
        opacity,
        dash,
      };
    });

    // Guilloche background security waves
    const waveOffset1 = Number((18 + rng() * 10).toFixed(1));
    const waveOffset2 = Number((38 + rng() * 12).toFixed(1));
    const waves = [
      `M 0 ${waveOffset1} Q 54 ${waveOffset1 - 14}, 108 ${waveOffset1} T 216 ${waveOffset1}`,
      `M 0 ${waveOffset2} Q 54 ${waveOffset2 + 14}, 108 ${waveOffset2} T 216 ${waveOffset2}`,
    ];

    // Interference dots / speckles
    const noiseDots = Array.from({ length: 34 }).map(() => ({
      cx: Number((6 + rng() * 204).toFixed(1)),
      cy: Number((6 + rng() * 52).toFixed(1)),
      r: Number((0.8 + rng() * 1.5).toFixed(2)),
      color:
        CAPTCHA_CHAR_COLORS[
          Math.floor(rng() * CAPTCHA_CHAR_COLORS.length)
        ],
      opacity: Number((0.25 + rng() * 0.45).toFixed(2)),
    }));

    return { chars, noiseLines, waves, noiseDots };
  }, [code, seed]);

  const handleRefreshClick = () => {
    setIsSpinning(true);
    onRefresh();
    setTimeout(() => setIsSpinning(false), 380);
  };

  const handleSpeakCaptcha = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const spelled = code.split('').join(' ... ');
      const utterance = new SpeechSynthesisUtterance(
        `Kode keamanan Captcha: ${spelled}`
      );
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all p-3 space-y-2.5 ${
        isMatched
          ? 'bg-[#f0fdf4] border-[#16a34a]/70 shadow-2xs'
          : 'bg-[#f8fafc] border-slate-300/90'
      }`}
    >
      {/* Top Row: Graphic SVG Captcha Box + Action Buttons (Refresh & Audio) */}
      <div className="flex items-stretch gap-2">
        {/* SVG Graphic Captcha Canvas */}
        <div
          onClick={handleRefreshClick}
          title="Klik gambar untuk memuat ulang kode Captcha"
          className="relative flex-1 h-[60px] rounded-lg overflow-hidden border border-slate-700 bg-[#0b1524] shadow-inner cursor-pointer select-none group"
        >
          <svg
            viewBox="0 0 216 64"
            className="w-full h-full block"
            preserveAspectRatio="none"
            role="img"
            aria-label="Kode Keamanan Captcha Grafis"
          >
            <defs>
              <linearGradient id="casBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b1524" />
                <stop offset="50%" stopColor="#17253b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <pattern
                id="casSecGrid"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 12 0 L 0 0 0 12"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.45"
                  strokeOpacity="0.45"
                />
              </pattern>
            </defs>

            {/* Security Plate Gradient + Grid Mesh */}
            <rect width="216" height="64" fill="url(#casBgGrad)" />
            <rect width="216" height="64" fill="url(#casSecGrid)" />

            {/* Micro-text Security Watermark */}
            <text
              x="108"
              y="13"
              textAnchor="middle"
              fill="#94a3b8"
              fillOpacity="0.13"
              fontSize="6.5"
              fontWeight="800"
              letterSpacing="2.5"
              fontFamily="monospace"
            >
              CAS • BDB • POLRI SECURITY
            </text>
            <text
              x="108"
              y="58"
              textAnchor="middle"
              fill="#94a3b8"
              fillOpacity="0.11"
              fontSize="6"
              fontWeight="700"
              letterSpacing="2"
              fontFamily="monospace"
            >
              WIRA SATYA 96 VERIFICATION
            </text>

            {/* Guilloche Background Waves */}
            {visualData.waves.map((d, i) => (
              <path
                key={`wave-${i}`}
                d={d}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.9"
                strokeOpacity="0.22"
              />
            ))}

            {/* Interference Speckles / Dots */}
            {visualData.noiseDots.map((dot, idx) => (
              <circle
                key={`dot-${idx}`}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={dot.color}
                fillOpacity={dot.opacity}
              />
            ))}

            {/* Background Interference Lines */}
            {visualData.noiseLines.slice(0, 3).map((line, idx) => (
              <path
                key={`bline-${idx}`}
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth={line.width}
                strokeOpacity={line.opacity}
                strokeDasharray={line.dash}
              />
            ))}

            {/* Distorted Multi-Color / Rotated / Skewed Captcha Characters */}
            {visualData.chars.map((item, idx) => (
              <g
                key={`char-${idx}`}
                transform={`translate(${item.x}, ${item.y}) rotate(${item.rotate}) skewX(${item.skewX}) scale(${item.scale})`}
              >
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill={item.color}
                  stroke="#020617"
                  strokeWidth="1.2"
                  paintOrder="stroke"
                  fontSize="26"
                  fontWeight="900"
                  fontFamily={item.fontFamily}
                  style={{
                    filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.65))',
                    userSelect: 'none',
                  }}
                >
                  {item.ch}
                </text>
              </g>
            ))}

            {/* Foreground Interference Strike Curves */}
            {visualData.noiseLines.slice(3).map((line, idx) => (
              <path
                key={`fline-${idx}`}
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth={line.width}
                strokeOpacity={line.opacity}
                strokeDasharray={line.dash}
              />
            ))}
          </svg>

          {/* Subtle corner badge inside graphic box */}
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/50 text-slate-300 border border-white/10 pointer-events-none">
            SVG CAPTCHA
          </span>
        </div>

        {/* Action Buttons: Reload (↻) & Audio Readability (🔊) */}
        <div className="flex flex-col gap-1.5 justify-between">
          <button
            type="button"
            onClick={handleRefreshClick}
            className="flex-1 px-3 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-slate-700 hover:text-red-800 border border-slate-300 shadow-2xs flex items-center justify-center transition-all"
            title="Ganti Kode Captcha (Muat Ulang ↻)"
            aria-label="Ganti Kode Captcha"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-300 ${
                isSpinning ? 'rotate-180 text-red-700' : ''
              }`}
            />
          </button>
          <button
            type="button"
            onClick={handleSpeakCaptcha}
            className={`flex-1 px-3 rounded-lg border shadow-2xs flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-amber-50 border-amber-400 text-amber-700'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300'
            }`}
            title="Dengarkan Audio Kode Captcha"
            aria-label="Dengarkan Audio Kode Captcha"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Input Field + Live Verification Indicator */}
      <div className="relative flex items-center">
        <input
          type="text"
          required
          maxLength={5}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value.toUpperCase())}
          placeholder="Masukkan kode captcha..."
          autoComplete="off"
          spellCheck={false}
          className={`w-full pl-3.5 pr-28 py-2.5 rounded-lg border bg-white text-slate-900 text-xs font-mono font-extrabold uppercase tracking-[0.22em] placeholder:font-sans placeholder:font-medium placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-400 focus:outline-none transition-all ${
            isMatched
              ? 'border-[#16a34a] ring-2 ring-[#16a34a]/20 text-emerald-950'
              : 'border-slate-300 focus:ring-2 focus:ring-red-800/20 focus:border-red-800'
          }`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          {isMatched ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold tracking-normal">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Terverifikasi</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {inputValue.trim().length}/5 Karakter
            </span>
          )}
        </div>
      </div>

      {/* CAS / BDB Style Footer Metadata */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-red-800 shrink-0" />
          <span>Proteksi Keamanan Grafis CAS / Polri</span>
        </div>
        <span className="text-[9px] text-slate-400 font-medium">
          Privasi &amp; Ketentuan
        </span>
      </div>
    </div>
  );
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
  const [captchaSeed, setCaptchaSeed] = useState(1);
  const [captchaInput, setCaptchaInput] = useState('');

  // Optional 2FA Challenge Modal (only shown if user enabled 2FA in their settings)
  const [pending2FAUser, setPending2FAUser] = useState<AuthUser | null>(null);
  const [otpInput, setOtpInput] = useState('');

  // Register form inputs (with SatkerBerjenjangModal & Email Dinas + Email Sekunder)
  const [regNrp, setRegNrp] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regPangkat, setRegPangkat] = useState('Kombes Pol');
  const [regPolda, setRegPolda] = useState('MABES POLRI');
  const [regSatkerUtama, setRegSatkerUtama] = useState('BARESKRIM POLRI');
  const [regSubSatker, setRegSubSatker] = useState('');
  const [regComposedSatker, setRegComposedSatker] = useState('BARESKRIM POLRI');
  const [regKodeSatker, setRegKodeSatker] = useState('060.01.00.01');
  const [showSatkerModal, setShowSatkerModal] = useState(false);
  const [regNoHp, setRegNoHp] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSecondaryEmail, setRegSecondaryEmail] = useState('');
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
    setCaptchaSeed((s) => s + 1);
  }, []);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaSeed((s) => s + 1);
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
      regComposedSatker.trim() ||
      (regSubSatker && regSubSatker !== 'Pimpinan / Staf Utama Satker'
        ? `${regSubSatker} - ${regSatkerUtama}`
        : regSatkerUtama);

    if (!composedSatker) {
      setErrorMessage('Harap pilih Satker Melekat terlebih dahulu.');
      return;
    }

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
          kodeSatker: regKodeSatker,
          noHp: regNoHp.trim(),
          email: regEmail.trim() || `${regNrp.trim()}@polri.go.id`,
          secondaryEmail: regSecondaryEmail.trim() || undefined,
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

                {/* Input 3: Security Captcha (Graphic SVG/Canvas Captcha ala CAS/BDB) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Verifikasi Keamanan (Captcha) <span className="text-red-700">*</span>
                  </label>
                  <GraphicSecurityCaptcha
                    code={captchaCode}
                    seed={captchaSeed}
                    inputValue={captchaInput}
                    onInputChange={setCaptchaInput}
                    onRefresh={refreshCaptcha}
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Standar keamanan wajib: Kata Sandi &amp; Captcha Grafis. Proteksi 2FA dapat diatur mandiri di menu Pengaturan.
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
                    <p>Satker: <strong>{regComposedSatker}</strong> ({regPolda})</p>
                    <p>Status: <span className="text-amber-800 font-bold">Menunggu Verifikasi Admin / Sekretaris</span></p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setelah diverifikasi oleh Admin / Sekretaris WS96, Anda dapat masuk ke portal menggunakan NRP dan membuat kata sandi pertama kali.
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

                  {/* Satker Melekat (with SatkerBerjenjangModal) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Satker Melekat <span className="text-red-700">*</span>
                    </label>
                    <div className="flex items-stretch gap-2">
                      <div
                        onClick={() => setShowSatkerModal(true)}
                        className={`flex-1 px-3 py-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-colors ${
                          regComposedSatker
                            ? 'bg-slate-50 border-slate-200 hover:border-red-400'
                            : 'bg-slate-50 border-dashed border-slate-300 hover:border-red-400'
                        }`}
                      >
                        {regComposedSatker ? (
                          <>
                            <Building2 className="w-4 h-4 text-red-800 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 block truncate text-[11px]">
                                {regComposedSatker}
                              </span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                <span>{regPolda}</span>
                                {regKodeSatker && (
                                  <span className="font-mono text-slate-400">({regKodeSatker})</span>
                                )}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                            <span>🔒 — Belum Memilih Satker —</span>
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSatkerModal(true)}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold text-[11px] whitespace-nowrap transition-colors"
                      >
                        Pilih Satker Berjenjang
                      </button>
                    </div>
                  </div>

                  {/* Email Dinas & No WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Dinas (@polri.go.id)
                      </label>
                      <input
                        type="email"
                        placeholder={regNrp ? `${regNrp}@polri.go.id` : 'nrp@polri.go.id'}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-red-800 focus:outline-none"
                      />
                    </div>
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
                  </div>

                  {/* Email Sekunder / Pribadi (Opsional — misal Gmail) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Sekunder / Pribadi <span className="text-slate-400 font-normal">(Opsional — misal Gmail)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: nama.alumni96@gmail.com"
                      value={regSecondaryEmail}
                      onChange={(e) => setRegSecondaryEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-800 focus:outline-none"
                    />
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

      {/* MODAL PILIH SATKER BERJENJANG (UNTUK TAB PENDAFTARAN) */}
      <SatkerBerjenjangModal
        isOpen={showSatkerModal}
        onClose={() => setShowSatkerModal(false)}
        initialPolda={regPolda}
        initialSatker={regSatkerUtama}
        initialSubSatker={regSubSatker}
        onApply={(result: SatkerSelectionResult) => {
          setRegPolda(result.polda);
          setRegSatkerUtama(result.satkerUtama);
          setRegSubSatker(result.subSatker);
          setRegComposedSatker(result.composedSatker);
          setRegKodeSatker(result.kodeSatker);
        }}
      />

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
