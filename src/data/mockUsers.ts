import { AuthUser, UserRole } from '@/types';
import { AKPOL_1996_USERS } from './akpol1996Alumni';

export const PRESET_USERS: AuthUser[] = [
  {
    id: 'u-superadmin',
    nrp: '98010710',
    nama: 'Eko Agung',
    pangkat: 'Briptu',
    email: 'agungkrisdianto96@gmail.com',
    role: 'SUPERADMIN',
    profileId: 'ws-98010710',
    mfaEnabled: true,
    mfaMethod: 'BIOMETRIC',
    fotoUrl: '/default-avatar.png',
    satker: 'Bareskrim Polri / Tim IT Developer Wira Satya 96',
    polda: 'MABES POLRI',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
  {
    id: 'u-ketua',
    nrp: '980107102',
    nama: 'Eko_2',
    pangkat: 'Irjen Pol',
    email: 'eko2@wirasatya96.id',
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
    email: 'eko3@wirasatya96.id',
    role: 'SEKRETARIAT',
    profileId: 'ws-980107103',
    mfaEnabled: false,
    mfaMethod: 'PIN',
    fotoUrl: '/default-avatar.png',
    satker: 'SSDM Polri / Sekretariat Wira Satya 96',
    polda: 'MABES POLRI',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
  {
    id: 'u-bendahara',
    nrp: '980107104',
    nama: 'Eko_4',
    pangkat: 'Kombes Pol',
    email: 'eko4@wirasatya96.id',
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
    email: 'eko5@wirasatya96.id',
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
    canViewExecutiveAnalytics: boolean;
  }
> = {
  SUPERADMIN: {
    label: 'Superadmin',
    description: 'Otoritas penuh sistem, manajemen pengguna, verifikasi, dan konfigurasi.',
    badgeColor: 'bg-red-900 text-amber-300 border border-amber-500/40',
    canEditAllMembers: true,
    canManageUsers: true,
    canManageFinance: true,
    canViewExecutiveAnalytics: true,
  },
  SEKRETARIAT: {
    label: 'Kesekretariatan',
    description: 'Pengelola pendataan anggota, penambahan user, dan verifikasi pendaftaran.',
    badgeColor: 'bg-indigo-700 text-white',
    canEditAllMembers: true,
    canManageUsers: true,
    canManageFinance: false,
    canViewExecutiveAnalytics: true,
  },
  KETUA: {
    label: 'Ketua Paguyuban',
    description: 'Pimpinan paguyuban, akses dashboard eksekutif & pemantauan anev leting.',
    badgeColor: 'bg-amber-600 text-white',
    canEditAllMembers: false,
    canManageUsers: false,
    canManageFinance: false,
    canViewExecutiveAnalytics: true,
  },
  BENDAHARA: {
    label: 'Bendahara',
    description: 'Pengelola arus kas, pencatatan transaksi keluar/masuk, dan iuran leting.',
    badgeColor: 'bg-emerald-700 text-white',
    canEditAllMembers: false,
    canManageUsers: false,
    canManageFinance: true,
    canViewExecutiveAnalytics: true,
  },
  ANGGOTA: {
    label: 'Anggota',
    description: 'Perwira alumni batalyon, akses direktori, profil pribadi, dan obrolan.',
    badgeColor: 'bg-slate-700 text-white',
    canEditAllMembers: false,
    canManageUsers: false,
    canManageFinance: false,
    canViewExecutiveAnalytics: false,
  },
};
