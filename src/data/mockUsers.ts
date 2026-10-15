import { AuthUser } from '@/types';

export const PRESET_USERS: AuthUser[] = [
  {
    id: 'u-superadmin',
    nrp: '98010710',
    nama: 'Eko Agung',
    pangkat: 'Briptu',
    email: 'agungkrisdianto96@gmail.com',
    role: 'SUPERADMIN',
    profileId: 'ws-dev',
    mfaEnabled: true,
    mfaMethod: 'BIOMETRIC',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    satker: 'Bareskrim Polri / Tim IT Developer Wira Satya 96',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
];
