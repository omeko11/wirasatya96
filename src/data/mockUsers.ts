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
    fotoUrl: '/default-avatar.png',
    satker: 'Bareskrim Polri / Tim IT Developer Wira Satya 96',
    status: 'DISETUJUI_BELUM_PASSWORD',
  },
];
