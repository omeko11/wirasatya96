import { AuthUser, UserRole } from '@/types';
import { AKPOL_1996_USERS } from './akpol1996Alumni';

export const PRESET_USERS: AuthUser[] = [
  {
    id: 'u-superadmin',
    nrp: '98010710',
    nama: 'Eko Agung Krisdianto, S.Kom.',
    pangkat: 'Briptu',
    email: '98010710@polri.go.id',
    secondaryEmail: 'agungkrisdianto98@gmail.com',
    role: 'SUPERADMIN',
    profileId: 'ws-98010710',
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    bio: 'Personel Bareskrim Polri (S1 Teknik Informatika) yang bertugas sebagai Lead Developer & Superadmin Sistem Informasi Portal Wira Satya 96.',
    satker: 'Bareskrim Polri',
    polda: 'MABES POLRI',
    status: 'AKTIF',
  },
  {
    id: 'u-ketua',
    nrp: '980107102',
    nama: 'Eko_2',
    pangkat: 'Irjen Pol',
    email: '980107102@polri.go.id',
    role: 'KETUA',
    profileId: 'ws-980107102',
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    satker: 'Mabes Polri / Ketua Batalyon Wira Satya 96',
    polda: 'MABES POLRI',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
  {
    id: 'u-sekretariat',
    nrp: '980107103',
    nama: 'Eko_3',
    pangkat: 'Brigjen Pol',
    email: '980107103@polri.go.id',
    role: 'SEKRETARIAT',
    profileId: 'ws-980107103',
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    satker: 'SSDM Polri / Sekretaris Wira Satya 96',
    polda: 'MABES POLRI',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
  {
    id: 'u-bendahara',
    nrp: '980107104',
    nama: 'Eko_4',
    pangkat: 'Kombes Pol',
    email: '980107104@polri.go.id',
    role: 'BENDAHARA',
    profileId: 'ws-980107104',
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    satker: 'Puskeu Polri / Bendahara Wira Satya 96',
    polda: 'MABES POLRI',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
  {
    id: 'u-anggota',
    nrp: '980107105',
    nama: 'Eko_5',
    pangkat: 'Kombes Pol',
    email: '980107105@polri.go.id',
    role: 'ANGGOTA',
    profileId: 'ws-980107105',
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    satker: 'Ditreskrimsus Polda Metro Jaya',
    polda: 'POLDA METRO JAYA',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
  ...AKPOL_1996_USERS,
];

export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    label: string;
    description: string;
    badgeColor: string;
    canEditAllMembers: boolean;
    canManageUsers: boolean;
    canManageFinance: boolean;
    canRekapFinance: boolean;
    canViewExecutiveAnalytics: boolean;
  }
> = {
  SUPERADMIN: {
    label: 'Superadmin',
    description: 'Otoritas penuh sistem, manajemen pengguna, verifikasi, akses kas & portofolio aset (testing/perbaikan), dan konfigurasi.',
    badgeColor: 'bg-red-900 text-amber-300 border border-amber-500/40',
    canEditAllMembers: true,
    canManageUsers: true,
    canManageFinance: true,
    canRekapFinance: true,
    canViewExecutiveAnalytics: true,
  },
  SEKRETARIAT: {
    label: 'Sekretaris',
    description: 'Pengelola pendataan anggota, penambahan user, dan verifikasi pendaftaran.',
    badgeColor: 'bg-blue-700 text-white',
    canEditAllMembers: true,
    canManageUsers: true,
    canManageFinance: false,
    canRekapFinance: false,
    canViewExecutiveAnalytics: true,
  },
  KETUA: {
    label: 'Ketua Paguyuban',
    description: 'Pimpinan paguyuban, rekap laporan kas & aset, serta pemantauan anev leting.',
    badgeColor: 'bg-amber-600 text-white',
    canEditAllMembers: false,
    canManageUsers: false,
    canManageFinance: false,
    canRekapFinance: true,
    canViewExecutiveAnalytics: true,
  },
  BENDAHARA: {
    label: 'Bendahara',
    description: 'Pengelola penginputan arus kas, portofolio aset, pencatatan iuran, dan rekap laporan.',
    badgeColor: 'bg-emerald-700 text-white',
    canEditAllMembers: false,
    canManageUsers: false,
    canManageFinance: true,
    canRekapFinance: true,
    canViewExecutiveAnalytics: true,
  },
  ANGGOTA: {
    label: 'Anggota',
    description: 'Perwira alumni batalyon & ADC (termasuk fungsi pengawasan terbuka kas & direktori).',
    badgeColor: 'bg-slate-700 text-white',
    canEditAllMembers: false,
    canManageUsers: false,
    canManageFinance: false,
    canRekapFinance: false,
    canViewExecutiveAnalytics: false,
  },
};

