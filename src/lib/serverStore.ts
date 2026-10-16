import fs from 'fs';
import path from 'path';
import { 
  AnggotaWiraSatya, 
  AuthUser, 
  KasTransaction, 
  IuranAnggota, 
  FinanceSummary, 
  ChatMessage, 
  PendingRegistration,
  UserAccountStatus,
  MfaMethod,
  AssetPortfolioItem,
  FeedPost,
  PostComment
} from '@/types';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { PRESET_USERS } from '@/data/mockUsers';
import { INITIAL_TRANSACTIONS, INITIAL_IURAN_LIST, INITIAL_FINANCE_SUMMARY, INITIAL_ASSETS } from '@/data/mockFinance';
import { INITIAL_FEED_POSTS } from '@/data/mockPosts';
import { AKPOL_1996_MEMBERS, AKPOL_1996_REGISTRATIONS, AKPOL_1996_USERS } from '@/data/akpol1996Alumni';

export interface FinanceCategoryOption {
  code: string;
  label: string;
}

export interface FinanceConfig {
  iuranWajibPerBulan: number; // default 250000
  tahunBuku: number; // default 2026
  subKategoriMasuk: FinanceCategoryOption[];
  subKategoriKeluar: FinanceCategoryOption[];
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_FINANCE_CONFIG: FinanceConfig = {
  iuranWajibPerBulan: 250000,
  tahunBuku: 2026,
  subKategoriMasuk: [
    { code: 'IURAN_WAJIB_BULANAN', label: 'Iuran Wajib Bulanan Anggota' },
    { code: 'SUMBANGAN_SUKARELA', label: 'Sumbangan Sukarela / Donasi Leting' },
    { code: 'PENCAIRAN_ASET_INVESTASI', label: 'Bagi Hasil / Pencairan Aset Berharga (SBN/Valas/Crypto)' },
    { code: 'DANA_KEGIATAN_REUNI', label: 'Sumbangan Khusus Kegiatan / Reuni' },
    { code: 'PEMASUKAN_LAINNYA', label: 'Penerimaan Kas Lainnya' },
  ],
  subKategoriKeluar: [
    { code: 'SANTUNAN_KESEHATAN', label: 'Santunan Kesehatan / Rekan Sakit' },
    { code: 'SANTUNAN_DUKA_CITA', label: 'Santunan Duka Cita Keluarga Besar' },
    { code: 'BANTUAN_PENDIDIKAN_ANAK', label: 'Bantuan Pendidikan Putra-Putri Leting' },
    { code: 'PEMBELIAN_ASET_INVESTASI', label: 'Pembelian Aset Berharga (SBN / Valas / Crypto / Emas)' },
    { code: 'OPERASIONAL_PAGUYUBAN', label: 'Operasional & Kesekretariatan Paguyuban' },
    { code: 'KEGIATAN_REUNI_LETING', label: 'Biaya Kegiatan Reuni & Silaturahmi Leting' },
    { code: 'PENGELUARAN_LAINNYA', label: 'Pengeluaran Kas Lainnya' },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem Default Kebendaharaan WS96',
};

// Global server memory + local disk database (.data/local_db.json)
export interface LocalDatabaseSchema {
  members: AnggotaWiraSatya[];
  users: AuthUser[];
  transactions: KasTransaction[];
  assets: AssetPortfolioItem[];
  iuranList: IuranAnggota[];
  financeSummary: FinanceSummary;
  financeConfig: FinanceConfig;
  activeSession: AuthUser | null;
  messages: ChatMessage[];
  registrations: PendingRegistration[];
  posts: FeedPost[];
}

type GlobalStore = LocalDatabaseSchema;

const INITIAL_MESSAGES: ChatMessage[] = [];

const INITIAL_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'reg-98010710',
    nrp: '98010710',
    nama: 'Eko Agung Krisdianto, S.Kom.',
    pangkat: 'Briptu',
    satker: 'Bareskrim Polri',
    polda: 'MABES POLRI',
    noHp: '081298010710',
    email: '98010710@polri.go.id',
    secondaryEmail: 'agungkrisdianto98@gmail.com',
    alasanDaftar: 'Personel Bareskrim Polri (S1 Teknik Informatika) — Lead Developer & Superadmin Sistem Informasi Portal Wira Satya 96.',
    status: 'AKTIF',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Sistem Otentikasi Bareskrim Polri (Dev Lead)',
  },
  {
    id: 'reg-980107102',
    nrp: '980107102',
    nama: 'Eko_2',
    pangkat: 'Irjen Pol',
    satker: 'Itwasum Polri',
    polda: 'MABES POLRI',
    noHp: '0812980107102',
    email: '980107102@polri.go.id',
    alasanDaftar: 'Akun Testing Role KETUA Batalyon Wira Satya 96.',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Eko Agung (Superadmin)',
  },
  {
    id: 'reg-980107103',
    nrp: '980107103',
    nama: 'Eko_3',
    pangkat: 'Brigjen Pol',
    satker: 'SSDM Polri',
    polda: 'MABES POLRI',
    noHp: '0812980107103',
    email: '980107103@polri.go.id',
    alasanDaftar: 'Akun Testing Role SEKRETARIAT Batalyon Wira Satya 96.',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Eko Agung (Superadmin)',
  },
  {
    id: 'reg-980107104',
    nrp: '980107104',
    nama: 'Eko_4',
    pangkat: 'Kombes Pol',
    satker: 'Puskeu Polri',
    polda: 'MABES POLRI',
    noHp: '0812980107104',
    email: '980107104@polri.go.id',
    alasanDaftar: 'Akun Testing Role BENDAHARA Batalyon Wira Satya 96.',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Eko Agung (Superadmin)',
  },
  {
    id: 'reg-980107105',
    nrp: '980107105',
    nama: 'Eko_5',
    pangkat: 'Kombes Pol',
    satker: 'Ditreskrimsus Polda Metro Jaya',
    polda: 'MABES POLRI',
    noHp: '0812980107105',
    email: '980107105@polri.go.id',
    alasanDaftar: 'Akun Testing Role ANGGOTA Batalyon Wira Satya 96.',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Eko Agung (Superadmin)',
  },
  {
    id: 'reg-980107106',
    nrp: '980107106',
    nama: 'Eko_6',
    pangkat: 'Kombes Pol',
    satker: 'Ditlantas Polda Jawa Barat',
    polda: 'POLDA JAWA BARAT',
    noHp: '0812980107106',
    email: '980107106@polri.go.id',
    alasanDaftar: 'Akun Testing Calon Anggota Menunggu Verifikasi Superadmin / Sekretariat.',
    status: 'PENDING_VERIFIKASI',
    createdAt: new Date().toISOString(),
  },
  ...AKPOL_1996_REGISTRATIONS,
];

const LOCAL_DB_PATH = path.join(process.cwd(), '.data', 'local_db.json');

function cleanSatkerRoleSuffix(satker?: string, nrp?: string): string {
  let cleaned = (satker || '').trim();
  if (
    cleaned.includes(' / Ketua') ||
    cleaned.includes(' / Sekretaris') ||
    cleaned.includes(' / Sekretariat') ||
    cleaned.includes(' / Kesekretariatan') ||
    cleaned.includes(' / Bendahara')
  ) {
    cleaned = cleaned.split(' / ')[0].trim();
  }
  if (nrp === '980107102' && (!cleaned || cleaned === 'Mabes Polri')) {
    return 'Itwasum Polri';
  }
  return cleaned || 'Mabes Polri';
}

function resolveBestFotoUrl(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c && c.trim() && c.trim() !== '/default-avatar.png') {
      return c.trim();
    }
  }
  for (const c of candidates) {
    if (c && c.trim()) {
      return c.trim();
    }
  }
  return '/default-avatar.png';
}

function migrateOfficialEmail(nrp: string, currentEmail?: string): string {
  const cleanNrp = (nrp || '').trim();
  if (cleanNrp === '98010710') {
    return '98010710@polri.go.id';
  }
  if (!currentEmail || !currentEmail.trim()) {
    return `${cleanNrp}@polri.go.id`;
  }
  const trimmed = currentEmail.trim();
  if (
    trimmed.toLowerCase().endsWith('@wirasatya96.id') ||
    trimmed.toLowerCase().endsWith('@wirasatya96.polri.go.id')
  ) {
    if (/^eko\d*@wirasatya96(\.polri\.go)?\.id$/i.test(trimmed) && cleanNrp) {
      return `${cleanNrp}@polri.go.id`;
    }
    return trimmed.replace(/@wirasatya96(\.polri\.go)?\.id$/i, '@polri.go.id');
  }
  return trimmed;
}

export function readDb(): GlobalStore {
  const defaultStore: GlobalStore = {
    members: [...INITIAL_MEMBERS],
    users: [...PRESET_USERS],
    transactions: [...INITIAL_TRANSACTIONS],
    assets: [...INITIAL_ASSETS],
    iuranList: [...INITIAL_IURAN_LIST],
    financeSummary: { ...INITIAL_FINANCE_SUMMARY },
    financeConfig: { ...DEFAULT_FINANCE_CONFIG },
    activeSession: PRESET_USERS[0],
    messages: [...INITIAL_MESSAGES],
    registrations: [...INITIAL_REGISTRATIONS],
    posts: [...INITIAL_FEED_POSTS],
  };

  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<GlobalStore> & { iuran?: IuranAnggota[] };

      const loadedFinanceConfig: FinanceConfig = {
        ...DEFAULT_FINANCE_CONFIG,
        ...(parsed.financeConfig || {}),
        iuranWajibPerBulan:
          Number(parsed.financeConfig?.iuranWajibPerBulan) || DEFAULT_FINANCE_CONFIG.iuranWajibPerBulan,
        tahunBuku: Number(parsed.financeConfig?.tahunBuku) || DEFAULT_FINANCE_CONFIG.tahunBuku,
        subKategoriMasuk:
          Array.isArray(parsed.financeConfig?.subKategoriMasuk) && parsed.financeConfig!.subKategoriMasuk.length > 0
            ? parsed.financeConfig!.subKategoriMasuk
            : [...DEFAULT_FINANCE_CONFIG.subKategoriMasuk],
        subKategoriKeluar:
          Array.isArray(parsed.financeConfig?.subKategoriKeluar) && parsed.financeConfig!.subKategoriKeluar.length > 0
            ? parsed.financeConfig!.subKategoriKeluar
            : [...DEFAULT_FINANCE_CONFIG.subKategoriKeluar],
      };

      // Ensure 164 AKPOL 96 officers are present if DB was from an older version
      const loadedMembers =
        Array.isArray(parsed.members) && parsed.members.length >= 160 ? parsed.members : defaultStore.members;
      const loadedUsers =
        Array.isArray(parsed.users) && parsed.users.length >= 160 ? parsed.users : defaultStore.users;
      const rawIuranSource = Array.isArray(parsed.iuranList)
        ? parsed.iuranList
        : Array.isArray(parsed.iuran)
        ? parsed.iuran
        : [];
      const loadedIuran = rawIuranSource.length >= 160 ? rawIuranSource : defaultStore.iuranList;
      const loadedRegs =
        Array.isArray(parsed.registrations) && parsed.registrations.length >= 160
          ? parsed.registrations
          : defaultStore.registrations;

      // Build reference lookup for 164 AKPOL 1996 alumni (for Brigjen Pol promotions & canonical names)
      const akpolRefMap = new Map(AKPOL_1996_USERS.map((u) => [u.nrp, u]));
      const akpolMemberRefMap = new Map(AKPOL_1996_MEMBERS.map((m) => [m.nrp, m]));
      const annualTagihan = (loadedFinanceConfig.iuranWajibPerBulan || 250000) * 12;

      loadedUsers.forEach((u) => {
        u.email = migrateOfficialEmail(u.nrp, u.email);
        u.satker = cleanSatkerRoleSuffix(u.satker, u.nrp);
        if (u.nrp === '98010710') {
          if (!u.nama || u.nama === 'Eko Agung') u.nama = 'Eko Agung Krisdianto, S.Kom.';
          u.pangkat = u.pangkat || 'Briptu';
          if (!u.satker || u.satker.includes('Tim IT Developer')) u.satker = 'Bareskrim Polri';
          u.polda = u.polda || 'MABES POLRI';
          u.email = '98010710@polri.go.id';
          u.secondaryEmail = u.secondaryEmail || 'agungkrisdianto98@gmail.com';
          u.status = 'AKTIF';
          if (!u.bio) {
            u.bio =
              'Personel Bareskrim Polri (S1 Teknik Informatika) yang bertugas sebagai Lead Developer & Superadmin Sistem Informasi Portal Wira Satya 96.';
          }
        }
        const ref = akpolRefMap.get(u.nrp);
        if (ref) {
          u.pangkat = ref.pangkat;
          u.nama = ref.nama;
        }
      });

      const userByNrpMap = new Map(loadedUsers.map((u) => [u.nrp, u]));

      loadedMembers.forEach((m) => {
        m.email = migrateOfficialEmail(m.nrp, m.email);
        m.satuanKerja = cleanSatkerRoleSuffix(m.satuanKerja, m.nrp);
        if (m.nrp === '98010710') {
          if (!m.namaLengkap || m.namaLengkap === 'Eko Agung') {
            m.namaLengkap = 'Eko Agung Krisdianto, S.Kom.';
          }
          m.pangkat = m.pangkat || 'Briptu';
          if (
            !m.jabatanTerakhir ||
            m.jabatanTerakhir.includes('Superadmin / Lead Developer') ||
            m.jabatanTerakhir === 'Bareskrim Polri' ||
            m.jabatanTerakhir === 'Lead Developer — Bareskrim Polri'
          ) {
            m.jabatanTerakhir = 'Lead Developer';
          }
          m.satuanKerja = m.satuanKerja || 'Bareskrim Polri';
          m.polda = m.polda || 'MABES POLRI';
          if (!m.pendidikanTerakhir || m.pendidikanTerakhir === 'S1 Teknik Informatika / Kepolisian') {
            m.pendidikanTerakhir = 'S1 Teknik Informatika';
          }
          m.email = '98010710@polri.go.id';
          m.secondaryEmail = m.secondaryEmail || 'agungkrisdianto98@gmail.com';
          if (!m.bio) {
            m.bio =
              'Personel Bareskrim Polri (S1 Teknik Informatika) yang bertugas sebagai Lead Developer & Superadmin Sistem Informasi Portal Wira Satya 96.';
          }
        } else if (m.nrp === '980107102') {
          if (!m.jabatanTerakhir || m.jabatanTerakhir.includes('Ketua')) {
            m.jabatanTerakhir = 'Irwil I Itwasum Polri';
          }
          m.satuanKerja = m.satuanKerja || 'Itwasum Polri';
          m.polda = m.polda || 'MABES POLRI';
        } else if (m.nrp === '980107103') {
          if (!m.jabatanTerakhir || m.jabatanTerakhir.includes('Sekretar')) {
            m.jabatanTerakhir = 'Karobinkar SSDM Polri';
          }
          m.satuanKerja = m.satuanKerja || 'SSDM Polri';
          m.polda = m.polda || 'MABES POLRI';
        } else if (m.nrp === '980107104') {
          if (!m.jabatanTerakhir || m.jabatanTerakhir.includes('Bendahara')) {
            m.jabatanTerakhir = 'Kabagrenmin Puskeu Polri';
          }
          m.satuanKerja = m.satuanKerja || 'Puskeu Polri';
          m.polda = m.polda || 'MABES POLRI';
        } else if (
          m.jabatanTerakhir &&
          (m.jabatanTerakhir.includes('Ketua Batalyon') ||
            m.jabatanTerakhir.includes('Sekretaris Batalyon') ||
            m.jabatanTerakhir.includes('Sekretariat Batalyon') ||
            m.jabatanTerakhir.includes('Bendahara Batalyon'))
        ) {
          const memberRef = akpolMemberRefMap.get(m.nrp);
          m.jabatanTerakhir =
            memberRef?.jabatanTerakhir || `Perwira ${m.satuanKerja || 'Polri'}`;
        }
        const ref = akpolRefMap.get(m.nrp);
        if (ref) {
          m.pangkat = ref.pangkat;
          m.namaLengkap = ref.nama;
        }
        const matchedUser = userByNrpMap.get(m.nrp);
        if (matchedUser) {
          const syncedFoto = resolveBestFotoUrl(m.fotoUrl, matchedUser.fotoUrl);
          m.fotoUrl = syncedFoto;
          matchedUser.fotoUrl = syncedFoto;
          const syncedCover = m.coverUrl || matchedUser.coverUrl;
          if (syncedCover) {
            m.coverUrl = syncedCover;
            matchedUser.coverUrl = syncedCover;
          }
        }
      });

      loadedRegs.forEach((r) => {
        r.email = migrateOfficialEmail(r.nrp, r.email);
        r.satker = cleanSatkerRoleSuffix(r.satker, r.nrp);
        if (r.nrp === '98010710') {
          if (!r.nama || r.nama === 'Eko Agung') r.nama = 'Eko Agung Krisdianto, S.Kom.';
          if (!r.satker || r.satker.includes('Tim IT Developer')) r.satker = 'Bareskrim Polri';
          r.email = '98010710@polri.go.id';
          r.secondaryEmail = r.secondaryEmail || 'agungkrisdianto98@gmail.com';
          r.status = 'AKTIF';
        }
        const ref = akpolRefMap.get(r.nrp);
        if (ref) {
          r.pangkat = ref.pangkat;
          r.nama = ref.nama;
        }
      });

      loadedIuran.forEach((i) => {
        if (i.nrp === '98010710' && (!i.namaLengkap || i.namaLengkap === 'Eko Agung')) {
          i.namaLengkap = 'Eko Agung Krisdianto, S.Kom.';
        }
        const ref = akpolRefMap.get(i.nrp);
        if (ref) {
          i.pangkat = ref.pangkat;
          i.namaLengkap = ref.nama;
        }
        i.totalTagihan = annualTagihan;
        if (i.totalTerbayar >= annualTagihan) {
          i.status = 'LUNAS';
        } else if (i.totalTerbayar > 0) {
          i.status = 'SEBAGIAN';
        } else {
          i.status = 'BELUM_BAYAR';
        }
      });

      const activeSession = parsed.activeSession || defaultStore.activeSession;
      if (activeSession) {
        activeSession.email = migrateOfficialEmail(activeSession.nrp, activeSession.email);
        activeSession.satker = cleanSatkerRoleSuffix(activeSession.satker, activeSession.nrp);
        if (activeSession.nrp === '98010710') {
          if (!activeSession.nama || activeSession.nama === 'Eko Agung') {
            activeSession.nama = 'Eko Agung Krisdianto, S.Kom.';
          }
          if (!activeSession.satker || activeSession.satker.includes('Tim IT Developer')) {
            activeSession.satker = 'Bareskrim Polri';
          }
          activeSession.email = '98010710@polri.go.id';
          activeSession.secondaryEmail = activeSession.secondaryEmail || 'agungkrisdianto98@gmail.com';
          activeSession.status = 'AKTIF';
          if (!activeSession.bio) {
            activeSession.bio =
              'Personel Bareskrim Polri (S1 Teknik Informatika) yang bertugas sebagai Lead Developer & Superadmin Sistem Informasi Portal Wira Satya 96.';
          }
        }
        const ref = akpolRefMap.get(activeSession.nrp);
        if (ref) {
          activeSession.pangkat = ref.pangkat;
          activeSession.nama = ref.nama;
        }
        const matchedUser = userByNrpMap.get(activeSession.nrp);
        if (matchedUser) {
          activeSession.role = matchedUser.role;
          activeSession.fotoUrl = resolveBestFotoUrl(activeSession.fotoUrl, matchedUser.fotoUrl);
          if (matchedUser.coverUrl || activeSession.coverUrl) {
            activeSession.coverUrl = activeSession.coverUrl || matchedUser.coverUrl;
          }
        }
      }

      return {
        members: loadedMembers,
        users: loadedUsers,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : defaultStore.transactions,
        assets: Array.isArray(parsed.assets) ? parsed.assets : defaultStore.assets,
        iuranList: loadedIuran,
        financeSummary: parsed.financeSummary
          ? { ...defaultStore.financeSummary, ...parsed.financeSummary }
          : defaultStore.financeSummary,
        financeConfig: loadedFinanceConfig,
        activeSession,
        messages: Array.isArray(parsed.messages) ? parsed.messages : defaultStore.messages,
        registrations: loadedRegs,
        posts: Array.isArray(parsed.posts) ? parsed.posts : defaultStore.posts,
      };
    }
  } catch {
    // Fallback to in-memory defaultStore
  }
  return defaultStore;
}

function loadInitialStore(): GlobalStore {
  return readDb();
}

function persistLocalStore(store: GlobalStore) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only serverless environments
  }
}

const globalStore: GlobalStore = loadInitialStore();
persistLocalStore(globalStore);

export const serverStore = {
  getMembers: () => {
    const userByNrp = new Map(globalStore.users.map((u) => [u.nrp, u]));
    globalStore.members.forEach((m) => {
      const u = userByNrp.get(m.nrp);
      if (u) {
        const bestFoto = resolveBestFotoUrl(m.fotoUrl, u.fotoUrl);
        m.fotoUrl = bestFoto;
        u.fotoUrl = bestFoto;
        const bestCover = m.coverUrl || u.coverUrl;
        if (bestCover) {
          m.coverUrl = bestCover;
          u.coverUrl = bestCover;
        }
      }
    });
    return globalStore.members;
  },
  
  getMemberById: (idOrNrp: string) => 
    globalStore.members.find((m) => m.id === idOrNrp || m.nrp === idOrNrp),
  
  saveMember: (member: AnggotaWiraSatya) => {
    const annualTagihan = (globalStore.financeConfig?.iuranWajibPerBulan || 250000) * 12;
    const idx = globalStore.members.findIndex((m) => m.id === member.id || m.nrp === member.nrp);
    const uIdx = globalStore.users.findIndex((u) => u.nrp === member.nrp);
    if (idx >= 0) {
      const prevMember = globalStore.members[idx];
      const existingUser = uIdx >= 0 ? globalStore.users[uIdx] : undefined;
      const syncedFotoUrl = resolveBestFotoUrl(member.fotoUrl, prevMember.fotoUrl, existingUser?.fotoUrl);
      const syncedCoverUrl = member.coverUrl ?? prevMember.coverUrl ?? existingUser?.coverUrl;

      globalStore.members[idx] = {
        ...prevMember,
        ...member,
        fotoUrl: syncedFotoUrl,
        ...(syncedCoverUrl !== undefined ? { coverUrl: syncedCoverUrl } : {}),
        updatedAt: new Date().toISOString(),
      };
      const savedMember = globalStore.members[idx];
      // Also sync name/pangkat/fotoUrl/coverUrl/bio/email/secondaryEmail to user if exists
      if (uIdx >= 0) {
        globalStore.users[uIdx].nama = savedMember.namaLengkap;
        globalStore.users[uIdx].pangkat = savedMember.pangkat;
        globalStore.users[uIdx].satker = cleanSatkerRoleSuffix(savedMember.satuanKerja, savedMember.nrp);
        globalStore.users[uIdx].polda = savedMember.polda;
        if (savedMember.email) globalStore.users[uIdx].email = savedMember.email;
        if (savedMember.secondaryEmail !== undefined) globalStore.users[uIdx].secondaryEmail = savedMember.secondaryEmail;
        globalStore.users[uIdx].fotoUrl = syncedFotoUrl;
        if (syncedCoverUrl !== undefined) globalStore.users[uIdx].coverUrl = syncedCoverUrl;
        if (savedMember.bio !== undefined) globalStore.users[uIdx].bio = savedMember.bio;
      }
      if (globalStore.activeSession && globalStore.activeSession.nrp === member.nrp) {
        globalStore.activeSession.nama = savedMember.namaLengkap;
        globalStore.activeSession.pangkat = savedMember.pangkat;
        globalStore.activeSession.satker = cleanSatkerRoleSuffix(savedMember.satuanKerja, savedMember.nrp);
        globalStore.activeSession.polda = savedMember.polda;
        if (savedMember.email) globalStore.activeSession.email = savedMember.email;
        if (savedMember.secondaryEmail !== undefined) globalStore.activeSession.secondaryEmail = savedMember.secondaryEmail;
        globalStore.activeSession.fotoUrl = syncedFotoUrl;
        if (syncedCoverUrl !== undefined) globalStore.activeSession.coverUrl = syncedCoverUrl;
        if (savedMember.bio !== undefined) globalStore.activeSession.bio = savedMember.bio;
      }
      const iIdx = globalStore.iuranList.findIndex((i) => i.nrp === member.nrp);
      if (iIdx >= 0) {
        globalStore.iuranList[iIdx].namaLengkap = savedMember.namaLengkap;
        globalStore.iuranList[iIdx].pangkat = savedMember.pangkat;
        globalStore.iuranList[iIdx].polda = savedMember.polda;
      }
    } else {
      const existingUser = uIdx >= 0 ? globalStore.users[uIdx] : undefined;
      const syncedFotoUrl = resolveBestFotoUrl(member.fotoUrl, existingUser?.fotoUrl);
      const syncedCoverUrl = member.coverUrl ?? existingUser?.coverUrl;
      globalStore.members.unshift({
        ...member,
        fotoUrl: syncedFotoUrl,
        ...(syncedCoverUrl !== undefined ? { coverUrl: syncedCoverUrl } : {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Ensure user account exists
      if (!globalStore.users.some((u) => u.nrp === member.nrp)) {
        globalStore.users.push({
          id: 'u-' + member.nrp,
          nrp: member.nrp,
          nama: member.namaLengkap,
          pangkat: member.pangkat,
          email: member.email || `${member.nrp}@polri.go.id`,
          secondaryEmail: member.secondaryEmail,
          role: 'ANGGOTA',
          profileId: member.id || 'ws-' + member.nrp,
          mfaEnabled: false,
          mfaMethod: 'PIN',
          status: 'DISETUJUI_BELUM_PASSWORD',
          satker: cleanSatkerRoleSuffix(member.satuanKerja, member.nrp),
          polda: member.polda,
          fotoUrl: syncedFotoUrl,
          ...(syncedCoverUrl !== undefined ? { coverUrl: syncedCoverUrl } : {}),
        });
      } else if (uIdx >= 0) {
        globalStore.users[uIdx].fotoUrl = syncedFotoUrl;
        if (syncedCoverUrl !== undefined) globalStore.users[uIdx].coverUrl = syncedCoverUrl;
      }
      // Ensure registration entry exists
      if (!globalStore.registrations.some((r) => r.nrp === member.nrp)) {
        globalStore.registrations.unshift({
          id: 'reg-' + member.nrp,
          nrp: member.nrp,
          nama: member.namaLengkap,
          pangkat: member.pangkat,
          satker: cleanSatkerRoleSuffix(member.satuanKerja, member.nrp),
          polda: member.polda,
          noHp: member.noHp || '',
          email: member.email || `${member.nrp}@polri.go.id`,
          secondaryEmail: member.secondaryEmail,
          alasanDaftar: 'Ditambahkan oleh Admin / Kesekretariatan melalui Pendataan',
          status: 'DISETUJUI_BELUM_PASSWORD',
          createdAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Admin / Kesekretariatan',
        });
      }
      // Ensure iuran entry exists
      if (!globalStore.iuranList.some((i) => i.nrp === member.nrp)) {
        globalStore.iuranList.push({
          id: 'iur-' + member.nrp,
          nrp: member.nrp,
          namaLengkap: member.namaLengkap,
          pangkat: member.pangkat,
          polda: member.polda,
          tahun: globalStore.financeConfig?.tahunBuku || 2026,
          bulanTerbayar: [],
          totalTagihan: annualTagihan,
          totalTerbayar: 0,
          status: 'BELUM_BAYAR',
        });
      }
    }
    persistLocalStore(globalStore);
    return member;
  },

  getUsers: () => {
    const memberByNrp = new Map(globalStore.members.map((m) => [m.nrp, m]));
    globalStore.users.forEach((u) => {
      u.satker = cleanSatkerRoleSuffix(u.satker, u.nrp);
      const m = memberByNrp.get(u.nrp);
      if (m) {
        const bestFoto = resolveBestFotoUrl(u.fotoUrl, m.fotoUrl);
        u.fotoUrl = bestFoto;
        m.fotoUrl = bestFoto;
        const bestCover = u.coverUrl || m.coverUrl;
        if (bestCover) {
          u.coverUrl = bestCover;
          m.coverUrl = bestCover;
        }
      }
    });
    return globalStore.users;
  },

  addUser: (user: AuthUser & { noHp?: string }) => {
    const annualTagihan = (globalStore.financeConfig?.iuranWajibPerBulan || 250000) * 12;
    user.satker = cleanSatkerRoleSuffix(user.satker, user.nrp);
    const existingIdx = globalStore.users.findIndex((u) => u.nrp === user.nrp);
    if (existingIdx >= 0) {
      globalStore.users[existingIdx] = { ...globalStore.users[existingIdx], ...user };
    } else {
      globalStore.users.unshift(user);
    }

    // Ensure registration entry exists
    const existingReg = globalStore.registrations.find((r) => r.nrp === user.nrp);
    if (!existingReg) {
      globalStore.registrations.unshift({
        id: 'reg-' + user.nrp,
        nrp: user.nrp,
        nama: user.nama,
        pangkat: user.pangkat,
        satker: user.satker || 'Mabes Polri',
        polda: user.polda || 'MABES POLRI',
        noHp: user.noHp || '',
        email: user.email || `${user.nrp}@polri.go.id`,
        secondaryEmail: user.secondaryEmail,
        alasanDaftar: `Ditambahkan oleh Admin / Kesekretariatan (${user.role})`,
        status: user.status || (user.password ? 'AKTIF' : 'DISETUJUI_BELUM_PASSWORD'),
        password: user.password,
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin / Kesekretariatan',
      });
    } else {
      if (user.noHp) existingReg.noHp = user.noHp;
      if (user.email) existingReg.email = user.email;
      if (user.secondaryEmail !== undefined) existingReg.secondaryEmail = user.secondaryEmail;
    }

    // Ensure directory member exists
    const existingMember = globalStore.members.find((m) => m.nrp === user.nrp);
    if (!existingMember) {
      const defaultJabatan = user.satker
        ? `Perwira ${user.satker}`
        : 'Perwira Polri';

      globalStore.members.unshift({
        id: 'ws-' + user.nrp,
        nrp: user.nrp,
        namaLengkap: user.nama,
        pangkat: user.pangkat,
        jabatanTerakhir: defaultJabatan,
        satuanKerja: user.satker || 'Polri',
        polda: user.polda || 'MABES POLRI',
        tipeSatker: (user.polda || 'MABES POLRI') === 'MABES POLRI' ? 'MABES' : 'POLDA',
        pendidikanTerakhir: 'Akpol 1996',
        tempatLahir: 'Jakarta',
        tanggalLahir: '1974-01-01',
        usia: 52,
        jenisKelamin: 'LAKI-LAKI',
        noHp: user.noHp || '',
        email: user.email || `${user.nrp}@polri.go.id`,
        secondaryEmail: user.secondaryEmail,
        fotoUrl: user.fotoUrl || '/default-avatar.png',
        alamatTempatTinggal: user.polda || 'Jakarta',
        statusTempatTinggal: 'MILIK PRIBADI',
        statusPerkawinan: 'MENIKAH',
        jumlahAnak: 0,
        daftarAnak: [],
        tahunPurnaTugas: 2032,
        sisaTahunDinas: 6,
        alamatPurnaTugas: user.polda || 'Jakarta',
        statusRumahPurnaTugas: 'MILIK PRIBADI',
        sudahPembekalan: 'SUDAH',
        rencanaAktivitas: ['USAHA SENDIRI'],
        sumberPenghasilanPasca: ['DANA PENSIUN'],
        kecukupanDanaPensiun: 'CUKUP',
        kesiapanPensiun: 'SIAP',
        perasaanPensiun: 'OPTIMIS',
        dukunganKeluarga: 'SANGAT MENDUKUNG',
        adaPenyakitKronis: 'TIDAK ADA',
        kondisiKesehatan: 'BAIK',
        daftarPenyakit: [],
        asuransiAktif: ['BPJS'],
        rutinMcu: 'YA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      if (user.noHp) existingMember.noHp = user.noHp;
      if (user.email) existingMember.email = user.email;
      if (user.secondaryEmail !== undefined) existingMember.secondaryEmail = user.secondaryEmail;
    }

    // Ensure iuran entry exists
    const existingIuran = globalStore.iuranList.find((i) => i.nrp === user.nrp);
    if (!existingIuran) {
      globalStore.iuranList.push({
        id: 'iur-' + user.nrp,
        nrp: user.nrp,
        namaLengkap: user.nama,
        pangkat: user.pangkat,
        polda: user.polda || 'MABES POLRI',
        tahun: globalStore.financeConfig?.tahunBuku || 2026,
        bulanTerbayar: [],
        totalTagihan: annualTagihan,
        totalTerbayar: 0,
        status: 'BELUM_BAYAR',
      });
    }

    persistLocalStore(globalStore);
    return user;
  },

  updateUser: (nrp: string, updates: Partial<AuthUser> & { noHp?: string }) => {
    const idx = globalStore.users.findIndex((u) => u.nrp === nrp);
    if (idx < 0) return null;
    if (updates.satker !== undefined) {
      updates.satker = cleanSatkerRoleSuffix(updates.satker, nrp);
    }
    globalStore.users[idx] = { ...globalStore.users[idx], ...updates };
    if (updates.role) {
      globalStore.users[idx].role = updates.role;
    }
    const updatedUser = globalStore.users[idx];

    // Sync member name/pangkat/satker/noHp/emails if changed (NEVER overwrite jabatanTerakhir with angkatan role!)
    const mIdx = globalStore.members.findIndex((m) => m.nrp === nrp);
    if (mIdx >= 0) {
      if (updates.nama) globalStore.members[mIdx].namaLengkap = updates.nama;
      if (updates.pangkat) globalStore.members[mIdx].pangkat = updates.pangkat;
      if (updates.satker) {
        globalStore.members[mIdx].satuanKerja = updates.satker;
        (globalStore.members[mIdx] as unknown as Record<string, unknown>).satker = updates.satker;
        if (!globalStore.members[mIdx].jabatanTerakhir) {
          globalStore.members[mIdx].jabatanTerakhir = `Perwira ${updates.satker}`;
        }
      }
      const currentJabatan = globalStore.members[mIdx].jabatanTerakhir || '';
      if (
        currentJabatan.includes('Ketua Batalyon') ||
        currentJabatan.includes('Sekretaris Batalyon') ||
        currentJabatan.includes('Sekretariat Batalyon') ||
        currentJabatan.includes('Bendahara Batalyon')
      ) {
        if (nrp === '980107102') {
          globalStore.members[mIdx].jabatanTerakhir = 'Irwil I Itwasum Polri';
        } else if (nrp === '980107103') {
          globalStore.members[mIdx].jabatanTerakhir = 'Karobinkar SSDM Polri';
        } else if (nrp === '980107104') {
          globalStore.members[mIdx].jabatanTerakhir = 'Kabagrenmin Puskeu Polri';
        } else {
          const refMember = AKPOL_1996_MEMBERS.find((am) => am.nrp === nrp);
          globalStore.members[mIdx].jabatanTerakhir =
            refMember?.jabatanTerakhir ||
            `Perwira ${globalStore.members[mIdx].satuanKerja || 'Polri'}`;
        }
      }
      if (updates.polda) globalStore.members[mIdx].polda = updates.polda;
      if (updates.email) globalStore.members[mIdx].email = updates.email;
      if (updates.secondaryEmail !== undefined) globalStore.members[mIdx].secondaryEmail = updates.secondaryEmail;
      if (updates.noHp !== undefined) globalStore.members[mIdx].noHp = updates.noHp;
    }

    if (globalStore.activeSession && globalStore.activeSession.nrp === nrp) {
      globalStore.activeSession = {
        ...globalStore.activeSession,
        ...updatedUser,
      };
    }

    const rIdx = globalStore.registrations.findIndex((r) => r.nrp === nrp);
    if (rIdx >= 0) {
      if (updates.nama) globalStore.registrations[rIdx].nama = updates.nama;
      if (updates.pangkat) globalStore.registrations[rIdx].pangkat = updates.pangkat;
      if (updates.satker) globalStore.registrations[rIdx].satker = updates.satker;
      if (updates.polda) globalStore.registrations[rIdx].polda = updates.polda;
      if (updates.email) globalStore.registrations[rIdx].email = updates.email;
      if (updates.secondaryEmail !== undefined) globalStore.registrations[rIdx].secondaryEmail = updates.secondaryEmail;
      if (updates.noHp !== undefined) globalStore.registrations[rIdx].noHp = updates.noHp;
    }

    const iIdx = globalStore.iuranList.findIndex((i) => i.nrp === nrp);
    if (iIdx >= 0) {
      if (updates.nama) globalStore.iuranList[iIdx].namaLengkap = updates.nama;
      if (updates.pangkat) globalStore.iuranList[iIdx].pangkat = updates.pangkat;
      if (updates.polda) globalStore.iuranList[iIdx].polda = updates.polda;
    }

    persistLocalStore(globalStore);
    return updatedUser;
  },

  deleteUser: (nrp: string) => {
    if (nrp === '98010710') {
      return { success: false, message: 'Akun Superadmin utama tidak dapat dihapus.' };
    }
    globalStore.users = globalStore.users.filter((u) => u.nrp !== nrp);
    globalStore.registrations = globalStore.registrations.filter((r) => r.nrp !== nrp);
    globalStore.members = globalStore.members.filter((m) => m.nrp !== nrp);
    globalStore.iuranList = globalStore.iuranList.filter((i) => i.nrp !== nrp);
    persistLocalStore(globalStore);
    return { success: true, message: `Pengguna NRP ${nrp} berhasil dihapus.` };
  },

  getSession: () => globalStore.activeSession,

  setSession: (user: AuthUser | null) => {
    globalStore.activeSession = user;
    persistLocalStore(globalStore);
    return globalStore.activeSession;
  },

  // ==============================================================
  // REGISTRATION & VERIFICATION METHODS
  // ==============================================================
  getRegistrations: () => globalStore.registrations,

  registerUser: (regData: {
    nrp: string;
    nama: string;
    pangkat: string;
    satker: string;
    polda: string;
    noHp: string;
    email: string;
    alasanDaftar?: string;
  }): { success: boolean; message: string; registration?: PendingRegistration } => {
    const cleanNrp = regData.nrp.trim();
    
    // Check if already registered in registrations list
    const existingReg = globalStore.registrations.find((r) => r.nrp === cleanNrp);
    if (existingReg) {
      if (existingReg.status === 'PENDING_VERIFIKASI') {
        return { success: false, message: 'NRP ini sudah mendaftar dan sedang menunggu verifikasi Superadmin.' };
      }
      if (existingReg.status === 'DISETUJUI_BELUM_PASSWORD') {
        return { success: false, message: 'Pendaftaran Anda telah disetujui! Silakan masuk untuk membuat kata sandi pertama kali.' };
      }
      if (existingReg.status === 'AKTIF') {
        return { success: false, message: 'NRP ini sudah memiliki akun aktif. Silakan langsung masuk di portal login.' };
      }
    }

    // Check if user already exists in active users
    const existingUser = globalStore.users.find((u) => u.nrp === cleanNrp);
    if (existingUser && existingUser.status === 'AKTIF') {
      return { success: false, message: 'Akun dengan NRP ini sudah terdaftar dan aktif di sistem.' };
    }

    const newReg: PendingRegistration = {
      id: 'reg-' + Date.now(),
      nrp: cleanNrp,
      nama: regData.nama.trim(),
      pangkat: regData.pangkat,
      satker: regData.satker.trim(),
      polda: regData.polda,
      noHp: regData.noHp.trim(),
      email: regData.email.trim() || `${cleanNrp}@polri.go.id`,
      alasanDaftar: regData.alasanDaftar || 'Pendaftaran alumni Wira Satya Akpol 1996',
      status: 'PENDING_VERIFIKASI',
      createdAt: new Date().toISOString(),
    };

    globalStore.registrations.unshift(newReg);
    persistLocalStore(globalStore);
    return {
      success: true,
      message: 'Pendaftaran berhasil diajukan. Akun Anda akan diverifikasi oleh Superadmin / Sekretariat WS96.',
      registration: newReg,
    };
  },

  verifyRegistration: (
    idOrNrp: string, 
    action: 'APPROVE' | 'REJECT', 
    verifierName: string = 'Superadmin',
    assignedRole: AuthUser['role'] = 'ANGGOTA'
  ): { success: boolean; message: string; registration?: PendingRegistration } => {
    const reg = globalStore.registrations.find((r) => r.id === idOrNrp || r.nrp === idOrNrp);
    if (!reg) return { success: false, message: 'Data pendaftaran tidak ditemukan.' };

    if (action === 'APPROVE') {
      const annualTagihan = (globalStore.financeConfig?.iuranWajibPerBulan || 250000) * 12;
      reg.status = 'DISETUJUI_BELUM_PASSWORD';
      reg.verifiedAt = new Date().toISOString();
      reg.verifiedBy = verifierName;

      // Ensure user entry exists in users
      let user = globalStore.users.find((u) => u.nrp === reg.nrp);
      if (!user) {
        user = {
          id: 'u-' + reg.nrp,
          nrp: reg.nrp,
          nama: reg.nama,
          pangkat: reg.pangkat,
          email: reg.email || `${reg.nrp}@polri.go.id`,
          secondaryEmail: reg.secondaryEmail,
          role: assignedRole,
          profileId: 'ws-' + reg.nrp,
          mfaEnabled: false,
          mfaMethod: 'PIN',
          satker: reg.satker,
          polda: reg.polda,
          fotoUrl: '/default-avatar.png',
          status: 'DISETUJUI_BELUM_PASSWORD',
        };
        globalStore.users.push(user);
      } else {
        user.status = 'DISETUJUI_BELUM_PASSWORD';
        user.role = assignedRole || user.role;
        if (!user.fotoUrl) user.fotoUrl = '/default-avatar.png';
      }

      // Also ensure member exists in directory
      const existingMember = globalStore.members.find((m) => m.nrp === reg.nrp);
      if (!existingMember) {
        globalStore.members.unshift({
          id: 'ws-' + reg.nrp,
          namaLengkap: reg.nama,
          nrp: reg.nrp,
          pangkat: reg.pangkat,
          jabatanTerakhir: 'Pamen ' + reg.satker,
          satuanKerja: reg.satker,
          polda: reg.polda,
          tipeSatker: reg.polda === 'MABES POLRI' ? 'MABES' : 'POLDA',
          pendidikanTerakhir: 'S1 Ilmu Kepolisian / Akpol 1996',
          tempatLahir: 'Jakarta',
          tanggalLahir: '1974-01-01',
          usia: 52,
          jenisKelamin: 'LAKI-LAKI',
          noHp: reg.noHp,
          email: reg.email || `${reg.nrp}@polri.go.id`,
          secondaryEmail: reg.secondaryEmail,
          alamatTempatTinggal: reg.polda,
          statusTempatTinggal: 'MILIK PRIBADI',
          statusPerkawinan: 'MENIKAH',
          jumlahAnak: 0,
          daftarAnak: [],
          tahunPurnaTugas: 2032,
          sisaTahunDinas: 6,
          alamatPurnaTugas: reg.polda,
          statusRumahPurnaTugas: 'MILIK PRIBADI',
          sudahPembekalan: 'SUDAH',
          rencanaAktivitas: ['USAHA SENDIRI'],
          sumberPenghasilanPasca: ['DANA PENSIUN'],
          kecukupanDanaPensiun: 'CUKUP',
          kesiapanPensiun: 'SIAP',
          perasaanPensiun: 'TENANG',
          dukunganKeluarga: 'SANGAT MENDUKUNG',
          adaPenyakitKronis: 'TIDAK ADA',
          kondisiKesehatan: 'SANGAT BAIK',
          asuransiAktif: ['BPJS'],
          rutinMcu: 'YA',
          fotoUrl: '/default-avatar.png',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Also ensure iuran entry exists
      const existingIuran = globalStore.iuranList.find((i) => i.nrp === reg.nrp);
      if (!existingIuran) {
        globalStore.iuranList.push({
          id: 'iur-' + reg.nrp,
          nrp: reg.nrp,
          namaLengkap: reg.nama,
          pangkat: reg.pangkat,
          polda: reg.polda,
          tahun: globalStore.financeConfig?.tahunBuku || 2026,
          bulanTerbayar: [],
          totalTagihan: annualTagihan,
          totalTerbayar: 0,
          status: 'BELUM_BAYAR',
        });
      }

      persistLocalStore(globalStore);
      return {
        success: true,
        message: `Pendaftaran ${reg.nama} berhasil disetujui. Akun siap diaktivasi oleh personel bersangkutan.`,
        registration: reg,
      };
    } else {
      reg.status = 'DITOLAK';
      reg.verifiedAt = new Date().toISOString();
      reg.verifiedBy = verifierName;
      persistLocalStore(globalStore);
      return {
        success: true,
        message: `Pendaftaran ${reg.nama} telah ditolak.`,
        registration: reg,
      };
    }
  },

  setPassword: (
    nrp: string, 
    newPassword: string, 
    mfaMethod: MfaMethod = 'PIN'
  ): { success: boolean; user?: AuthUser; message: string } => {
    const cleanNrp = nrp.trim();

    // Update in registrations
    const reg = globalStore.registrations.find((r) => r.nrp === cleanNrp);
    if (reg) {
      reg.status = 'AKTIF';
      reg.password = newPassword;
    }

    // Update in users
    let user = globalStore.users.find((u) => u.nrp === cleanNrp);
    if (!user && reg) {
      user = {
        id: 'u-' + reg.nrp,
        nrp: reg.nrp,
        nama: reg.nama,
        pangkat: reg.pangkat,
        email: reg.email || `${reg.nrp}@polri.go.id`,
        secondaryEmail: reg.secondaryEmail,
        role: 'ANGGOTA',
        profileId: 'ws-' + reg.nrp,
        mfaEnabled: mfaMethod !== 'PIN',
        mfaMethod: mfaMethod,
        satker: reg.satker,
        polda: reg.polda,
        fotoUrl: '/default-avatar.png',
        status: 'AKTIF',
        password: newPassword,
      };
      globalStore.users.push(user);
    } else if (user) {
      user.status = 'AKTIF';
      user.password = newPassword;
      user.mfaMethod = mfaMethod;
      user.mfaEnabled = mfaMethod !== 'PIN';
    }

    if (user) {
      globalStore.activeSession = user;
    }

    persistLocalStore(globalStore);
    return {
      success: true,
      user,
      message: 'Kata sandi berhasil disimpan dan akun aktif!',
    };
  },

  // ==============================================================
  // AUTHENTICATION & LOGIN FLOW
  // ==============================================================
  authenticate: (
    identifier: string, 
    passwordInput?: string
  ): {
    success: boolean;
    user?: AuthUser;
    requiresPasswordSetup?: boolean;
    status?: UserAccountStatus;
    nrp?: string;
    nama?: string;
    pangkat?: string;
    message: string;
  } => {
    const cleanId = identifier.trim();

    // 1. Check registrations for pending/rejected status
    const reg = globalStore.registrations.find(
      (r) =>
        r.nrp === cleanId ||
        r.email.toLowerCase() === cleanId.toLowerCase() ||
        (r.secondaryEmail && r.secondaryEmail.toLowerCase() === cleanId.toLowerCase())
    );

    if (reg) {
      if (reg.status === 'PENDING_VERIFIKASI') {
        return {
          success: false,
          status: 'PENDING_VERIFIKASI',
          message: 'Pendaftaran akun Anda sedang dalam proses verifikasi oleh Superadmin / Sekretariat Wira Satya 96. Harap menunggu konfirmasi.',
        };
      }

      if (reg.status === 'DITOLAK') {
        return {
          success: false,
          status: 'DITOLAK',
          message: 'Permohonan pendaftaran akun Anda ditolak oleh Pengurus Batalyon.',
        };
      }
    }

    // 2. Check registered users list
    let user = globalStore.users.find(
      (u) =>
        u.nrp === cleanId ||
        u.id === cleanId ||
        u.email.toLowerCase() === cleanId.toLowerCase() ||
        (u.secondaryEmail && u.secondaryEmail.toLowerCase() === cleanId.toLowerCase()) ||
        u.nama.toLowerCase() === cleanId.toLowerCase()
    );

    // If user is approved but hasn't set a password yet:
    // - If passwordInput is empty -> prompt password setup modal
    // - If passwordInput is provided -> save it as their password and log them in immediately
    if (user && (user.status === 'DISETUJUI_BELUM_PASSWORD' || !user.password)) {
      if (!passwordInput) {
        return {
          success: false,
          requiresPasswordSetup: true,
          status: 'DISETUJUI_BELUM_PASSWORD',
          nrp: user.nrp,
          nama: user.nama,
          pangkat: user.pangkat,
          message: 'Akun Anda telah disetujui! Silakan buat kata sandi baru untuk mengaktifkan akun Anda.',
        };
      } else {
        user.password = passwordInput;
        user.status = 'AKTIF';
        if (reg) {
          reg.password = passwordInput;
          reg.status = 'AKTIF';
        }
        globalStore.activeSession = user;
        persistLocalStore(globalStore);
        return {
          success: true,
          user,
          message: `Login berhasil sebagai ${user.nama} (${user.role})`,
        };
      }
    }

    if (reg && reg.status === 'DISETUJUI_BELUM_PASSWORD' && !passwordInput) {
      return {
        success: false,
        requiresPasswordSetup: true,
        status: 'DISETUJUI_BELUM_PASSWORD',
        nrp: reg.nrp,
        nama: reg.nama,
        pangkat: reg.pangkat,
        message: 'Pendaftaran Anda telah disetujui Superadmin! Silakan buat kata sandi baru untuk mengaktifkan akun Anda.',
      };
    }

    // 3. Fallback: check directory members if not yet in users table
    if (!user && !reg) {
      const member = globalStore.members.find(
        (m) =>
          m.nrp === cleanId ||
          m.id === cleanId ||
          m.namaLengkap.toLowerCase().includes(cleanId.toLowerCase())
      );

      if (member) {
        user = {
          id: member.id,
          nrp: member.nrp,
          nama: member.namaLengkap,
          pangkat: member.pangkat,
          role: 'ANGGOTA',
          profileId: member.id,
          mfaEnabled: false,
          mfaMethod: 'PIN',
          satker: member.satuanKerja,
          polda: member.polda,
          email: `${member.nrp}@polri.go.id`,
          fotoUrl: member.fotoUrl,
          status: 'DISETUJUI_BELUM_PASSWORD',
        };
        globalStore.users.push(user);
        return {
          success: false,
          requiresPasswordSetup: true,
          status: 'DISETUJUI_BELUM_PASSWORD',
          nrp: member.nrp,
          nama: member.namaLengkap,
          pangkat: member.pangkat,
          message: 'Data alumni Anda terverifikasi di Batalyon Wira Satya 96! Silakan buat kata sandi baru untuk mengaktifkan akun Anda.',
        };
      }
    }

    if (!user) {
      return {
        success: false,
        message: 'NRP / Email dinas tidak terdaftar di sistem Batalyon Wira Satya 96. Silakan lakukan pendaftaran anggota terlebih dahulu.',
      };
    }

    // Password validation for active users
    if (user.password && passwordInput && user.password !== passwordInput) {
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan salah. Silakan coba kembali.',
      };
    }

    user.status = 'AKTIF';
    globalStore.activeSession = user;
    persistLocalStore(globalStore);
    return {
      success: true,
      user,
      message: `Login berhasil sebagai ${user.nama} (${user.role})`,
    };
  },

  // ==============================================================
  // FINANCIAL & ASSET PORTFOLIO METHODS
  // ==============================================================
  getFinanceConfig: (): FinanceConfig => {
    if (!globalStore.financeConfig) {
      globalStore.financeConfig = { ...DEFAULT_FINANCE_CONFIG };
    }
    return globalStore.financeConfig;
  },

  updateFinanceConfig: (patch: Partial<FinanceConfig>, updatedBy: string): FinanceConfig => {
    if (!globalStore.financeConfig) {
      globalStore.financeConfig = { ...DEFAULT_FINANCE_CONFIG };
    }

    if (patch.iuranWajibPerBulan !== undefined) {
      const nextMonthly = Math.max(0, Number(patch.iuranWajibPerBulan) || 250000);
      globalStore.financeConfig.iuranWajibPerBulan = nextMonthly;
      const annualTarget = nextMonthly * 12;

      globalStore.iuranList.forEach((item) => {
        item.totalTagihan = annualTarget;
        if (patch.tahunBuku) {
          item.tahun = Number(patch.tahunBuku);
        }
        if (item.totalTerbayar >= annualTarget && annualTarget > 0) {
          item.status = 'LUNAS';
          item.bulanTerbayar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        } else if (item.totalTerbayar > 0) {
          item.status = 'SEBAGIAN';
          const paidMonths = nextMonthly > 0 ? Math.min(12, Math.floor(item.totalTerbayar / nextMonthly)) : 0;
          item.bulanTerbayar = Array.from({ length: paidMonths }, (_, idx) => idx + 1);
        } else {
          item.status = 'BELUM_BAYAR';
          item.bulanTerbayar = [];
        }
      });
    }

    if (patch.tahunBuku !== undefined) {
      globalStore.financeConfig.tahunBuku = Number(patch.tahunBuku) || 2026;
      globalStore.iuranList.forEach((item) => {
        item.tahun = globalStore.financeConfig.tahunBuku;
      });
    }

    if (Array.isArray(patch.subKategoriMasuk) && patch.subKategoriMasuk.length > 0) {
      globalStore.financeConfig.subKategoriMasuk = patch.subKategoriMasuk;
    }

    if (Array.isArray(patch.subKategoriKeluar) && patch.subKategoriKeluar.length > 0) {
      globalStore.financeConfig.subKategoriKeluar = patch.subKategoriKeluar;
    }

    globalStore.financeConfig.updatedAt = new Date().toISOString();
    globalStore.financeConfig.updatedBy = updatedBy || globalStore.activeSession?.nama || 'Bendahara';

    persistLocalStore(globalStore);
    return globalStore.financeConfig;
  },

  getFinanceSummary: () => {
    const transactions = globalStore.transactions || [];
    const totalKasMasuk = transactions
      .filter((t) => t.jenis === 'MASUK')
      .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
    const totalKasKeluar = transactions
      .filter((t) => t.jenis === 'KELUAR')
      .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
    const totalValuasiAset = (globalStore.assets || []).reduce(
      (sum, item) => sum + (Number(item.estimasiNilaiIdr) || 0),
      0
    );
    const iuranWajibPerBulan = globalStore.financeConfig?.iuranWajibPerBulan || 250000;

    const iuranList = globalStore.iuranList || [];
    const totalTargetIuran = iuranList.reduce((s, i) => s + (Number(i.totalTagihan) || 0), 0);
    const totalRealisasiIuran = iuranList.reduce((s, i) => s + (Number(i.totalTerbayar) || 0), 0);
    const persentaseIuranTerkumpul =
      totalTargetIuran > 0 ? Number(((totalRealisasiIuran / totalTargetIuran) * 100).toFixed(1)) : 0;

    const saldoUtama =
      transactions.length > 0 ? totalKasMasuk - totalKasKeluar : globalStore.financeSummary.saldoUtama || 0;

    globalStore.financeSummary = {
      ...globalStore.financeSummary,
      saldoUtama,
      totalValuasiAset,
      danaAbadiInvestasi: totalValuasiAset,
      totalPemasukanBulanIni: totalKasMasuk,
      totalPengeluaranBulanIni: totalKasKeluar,
      persentaseIuranTerkumpul,
    };

    return {
      ...globalStore.financeSummary,
      totalKasMasuk,
      totalKasKeluar,
      totalValuasiAset,
      iuranWajibPerBulan,
    };
  },

  getFinance: () => {
    const summary = serverStore.getFinanceSummary();
    const financeConfig = serverStore.getFinanceConfig();

    return {
      summary,
      transactions: globalStore.transactions,
      assets: globalStore.assets || [],
      iuranList: globalStore.iuranList,
      iuran: globalStore.iuranList,
      financeConfig,
    };
  },

  addTransaction: (trx: Omit<KasTransaction, 'id' | 'createdAt'>) => {
    // Deduplicate if exact same nomorReferensi was just submitted
    if (trx.nomorReferensi) {
      const existing = globalStore.transactions.find((t) => t.nomorReferensi === trx.nomorReferensi);
      if (existing) {
        return existing;
      }
    }

    const newTrx: KasTransaction = {
      ...trx,
      id: 'trx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    globalStore.transactions.unshift(newTrx);

    // Update balances
    if (newTrx.jenis === 'MASUK') {
      globalStore.financeSummary.saldoUtama += newTrx.nominal;
      globalStore.financeSummary.totalPemasukanBulanIni += newTrx.nominal;
      if (newTrx.kategori === 'SANTUNAN_KESEHATAN' || newTrx.kategori === 'SUMBANGAN_SUKARELA') {
        globalStore.financeSummary.kasSosialKesehatan += newTrx.nominal;
      }
    } else {
      globalStore.financeSummary.saldoUtama -= newTrx.nominal;
      globalStore.financeSummary.totalPengeluaranBulanIni += newTrx.nominal;
      if (newTrx.kategori === 'SANTUNAN_KESEHATAN') {
        globalStore.financeSummary.kasSosialKesehatan -= newTrx.nominal;
      } else if (newTrx.kategori === 'SANTUNAN_DUKA_CITA') {
        globalStore.financeSummary.kasDukaCita -= newTrx.nominal;
      }
    }

    serverStore.getFinanceSummary();
    persistLocalStore(globalStore);
    return newTrx;
  },

  addAsset: (asset: Omit<AssetPortfolioItem, 'id' | 'updatedAt'>) => {
    if (!globalStore.assets) globalStore.assets = [];
    const newAsset: AssetPortfolioItem = {
      ...asset,
      id: 'ast-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    globalStore.assets.unshift(newAsset);

    serverStore.getFinanceSummary();
    persistLocalStore(globalStore);
    return newAsset;
  },

  deleteAsset: (id: string) => {
    if (!globalStore.assets) return false;
    const prevLen = globalStore.assets.length;
    globalStore.assets = globalStore.assets.filter((a) => a.id !== id);
    serverStore.getFinanceSummary();
    persistLocalStore(globalStore);
    return globalStore.assets.length < prevLen;
  },

  recordIuranPayment: (nrp: string, nominal: number, pencatat?: string, skipTransaction?: boolean) => {
    const target = globalStore.iuranList.find((i) => i.nrp === nrp);
    if (target) {
      const iuranPerBulan = globalStore.financeConfig?.iuranWajibPerBulan || 250000;
      target.totalTagihan = iuranPerBulan * 12;
      target.totalTerbayar += nominal;
      target.terakhirBayar = new Date().toISOString().split('T')[0];
      if (target.totalTerbayar >= target.totalTagihan) {
        target.status = 'LUNAS';
        target.bulanTerbayar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      } else if (target.totalTerbayar > 0) {
        target.status = 'SEBAGIAN';
        const paidMonths = Math.min(12, Math.floor(target.totalTerbayar / iuranPerBulan));
        target.bulanTerbayar = Array.from({ length: paidMonths }, (_, idx) => idx + 1);
      } else {
        target.status = 'BELUM_BAYAR';
        target.bulanTerbayar = [];
      }

      if (!skipTransaction) {
        // Avoid duplicate cash entry if an identical IURAN_WAJIB_BULANAN transaction was just added for this NRP
        const recentDuplicate = globalStore.transactions.find(
          (t) =>
            t.nrpTerkait === target.nrp &&
            t.kategori === 'IURAN_WAJIB_BULANAN' &&
            t.nominal === nominal &&
            Date.now() - new Date(t.createdAt).getTime() < 5000
        );
        if (!recentDuplicate) {
          serverStore.addTransaction({
            nomorReferensi: 'WS96-IUR-' + Date.now().toString().slice(-4),
            tanggal: new Date().toISOString().split('T')[0],
            jenis: 'MASUK',
            kategori: 'IURAN_WAJIB_BULANAN',
            nominal: nominal,
            keterangan: `Pembayaran Iuran Leting oleh ${target.namaLengkap}`,
            pihakTerkait: target.namaLengkap,
            nrpTerkait: target.nrp,
            dicatatOleh: pencatat || globalStore.activeSession?.nama || 'Bendahara Wira Satya 96',
          });
        }
      }

      serverStore.getFinanceSummary();
      persistLocalStore(globalStore);
      return target;
    }
    return null;
  },

  // ==============================================================
  // MESSAGING METHODS
  // ==============================================================
  getMessages: (user1Nrp?: string, user2Nrp?: string) => {
    if (!user1Nrp && !user2Nrp) {
      return globalStore.messages;
    }
    if (user1Nrp && !user2Nrp) {
      return globalStore.messages.filter(
        (m) => m.senderNrp === user1Nrp || m.receiverNrp === user1Nrp
      );
    }
    return globalStore.messages.filter(
      (m) =>
        (m.senderNrp === user1Nrp && m.receiverNrp === user2Nrp) ||
        (m.senderNrp === user2Nrp && m.receiverNrp === user1Nrp)
    );
  },

  addMessage: (msgData: {
    senderNrp: string;
    senderName: string;
    senderPangkat?: string;
    senderAvatar?: string;
    receiverNrp: string;
    receiverName?: string;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): ChatMessage => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderNrp: msgData.senderNrp,
      senderName: msgData.senderName,
      senderPangkat: msgData.senderPangkat,
      senderAvatar: msgData.senderAvatar,
      receiverNrp: msgData.receiverNrp,
      receiverName: msgData.receiverName,
      text: msgData.text,
      attachmentUrl: msgData.attachmentUrl,
      attachmentName: msgData.attachmentName,
      timestamp: timeStr,
      createdAt: now.toISOString(),
      isRead: false,
    };

    globalStore.messages.push(newMsg);
    persistLocalStore(globalStore);
    return newMsg;
  },

  markMessagesAsRead: (senderNrp: string, currentReceiverNrp: string) => {
    globalStore.messages.forEach((m) => {
      if (m.senderNrp === senderNrp && m.receiverNrp === currentReceiverNrp) {
        m.isRead = true;
      }
    });
    persistLocalStore(globalStore);
  },

  // ==============================================================
  // FEED POSTS METHODS
  // ==============================================================
  getPosts: () => globalStore.posts || [],

  addPost: (postData: Omit<FeedPost, 'id' | 'createdAt' | 'likesCount' | 'repostsCount' | 'comments'>): FeedPost => {
    if (!globalStore.posts) globalStore.posts = [];
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newPost: FeedPost = {
      ...postData,
      id: 'post-' + Date.now(),
      createdAt: nowStr,
      likesCount: 0,
      isLiked: false,
      repostsCount: 0,
      isReposted: false,
      impressionsCount: 1,
      comments: [],
    };
    globalStore.posts.unshift(newPost);
    persistLocalStore(globalStore);
    return newPost;
  },

  toggleLikePost: (postId: string) => {
    if (!globalStore.posts) return null;
    const p = globalStore.posts.find((x) => x.id === postId);
    if (!p) return null;
    p.isLiked = !p.isLiked;
    p.likesCount = p.isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1);
    persistLocalStore(globalStore);
    return p;
  },

  toggleRepost: (postId: string) => {
    if (!globalStore.posts) return null;
    const p = globalStore.posts.find((x) => x.id === postId);
    if (!p) return null;
    p.isReposted = !p.isReposted;
    p.repostsCount = p.isReposted ? (p.repostsCount || 0) + 1 : Math.max(0, (p.repostsCount || 0) - 1);
    persistLocalStore(globalStore);
    return p;
  },

  addCommentToPost: (postId: string, comment: PostComment) => {
    if (!globalStore.posts) return null;
    const p = globalStore.posts.find((x) => x.id === postId);
    if (!p) return null;
    if (!Array.isArray(p.comments)) p.comments = [];
    p.comments.push(comment);
    persistLocalStore(globalStore);
    return p;
  },
};

export const getFinanceConfig = () => serverStore.getFinanceConfig();
export const updateFinanceConfig = (patch: Partial<FinanceConfig>, updatedBy: string) =>
  serverStore.updateFinanceConfig(patch, updatedBy);
export const getFinanceSummary = () => serverStore.getFinanceSummary();
export const recordIuranPayment = (nrp: string, nominal: number, pencatat?: string, skipTransaction?: boolean) =>
  serverStore.recordIuranPayment(nrp, nominal, pencatat, skipTransaction);

