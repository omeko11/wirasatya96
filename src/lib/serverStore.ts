import { 
  AnggotaWiraSatya, 
  AuthUser, 
  KasTransaction, 
  IuranAnggota, 
  FinanceSummary, 
  ChatMessage, 
  PendingRegistration,
  UserAccountStatus,
  MfaMethod
} from '@/types';
import { INITIAL_MEMBERS } from '@/data/mockData';
import { PRESET_USERS } from '@/data/mockUsers';
import { INITIAL_TRANSACTIONS, INITIAL_IURAN_LIST, INITIAL_FINANCE_SUMMARY } from '@/data/mockFinance';

// Global server memory to simulate persistent database across API calls
interface GlobalStore {
  members: AnggotaWiraSatya[];
  users: AuthUser[];
  transactions: KasTransaction[];
  iuranList: IuranAnggota[];
  financeSummary: FinanceSummary;
  activeSession: AuthUser | null;
  messages: ChatMessage[];
  registrations: PendingRegistration[];
}

const INITIAL_MESSAGES: ChatMessage[] = [];

const INITIAL_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'reg-98010710',
    nrp: '98010710',
    nama: 'Eko Agung',
    pangkat: 'Briptu',
    satker: 'Bareskrim Polri / Tim IT Developer Wira Satya 96',
    polda: 'MABES POLRI',
    noHp: '081298010710',
    email: 'agungkrisdianto96@gmail.com',
    alasanDaftar: 'Superadmin & Lead Developer Sistem Informasi Batalyon Wira Satya Akpol 1996.',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Sistem Otentikasi Bareskrim Polri (Dev Lead)',
  },
  {
    id: 'reg-980107102',
    nrp: '980107102',
    nama: 'Eko_2',
    pangkat: 'Irjen Pol',
    satker: 'Mabes Polri / Ketua Batalyon Wira Satya 96',
    polda: 'MABES POLRI',
    noHp: '0812980107102',
    email: 'eko2@wirasatya96.id',
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
    satker: 'SSDM Polri / Sekretariat Wira Satya 96',
    polda: 'MABES POLRI',
    noHp: '0812980107103',
    email: 'eko3@wirasatya96.id',
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
    satker: 'Puskeu Polri / Bendahara Wira Satya 96',
    polda: 'MABES POLRI',
    noHp: '0812980107104',
    email: 'eko4@wirasatya96.id',
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
    polda: 'POLDA METRO JAYA',
    noHp: '0812980107105',
    email: 'eko5@wirasatya96.id',
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
    email: 'eko6@wirasatya96.id',
    alasanDaftar: 'Akun Testing Calon Anggota Menunggu Verifikasi Superadmin / Sekretariat.',
    status: 'PENDING_VERIFIKASI',
    createdAt: new Date().toISOString(),
  },
];

const globalStore: GlobalStore = {
  members: [...INITIAL_MEMBERS],
  users: [...PRESET_USERS],
  transactions: [...INITIAL_TRANSACTIONS],
  iuranList: [...INITIAL_IURAN_LIST],
  financeSummary: { ...INITIAL_FINANCE_SUMMARY },
  activeSession: PRESET_USERS[0], // default Superadmin
  messages: [...INITIAL_MESSAGES],
  registrations: [...INITIAL_REGISTRATIONS],
};

export const serverStore = {
  getMembers: () => globalStore.members,
  
  getMemberById: (idOrNrp: string) => 
    globalStore.members.find((m) => m.id === idOrNrp || m.nrp === idOrNrp),
  
  saveMember: (member: AnggotaWiraSatya) => {
    const idx = globalStore.members.findIndex((m) => m.id === member.id || m.nrp === member.nrp);
    if (idx >= 0) {
      globalStore.members[idx] = { ...member, updatedAt: new Date().toISOString() };
      // Also sync name/pangkat to user if exists
      const uIdx = globalStore.users.findIndex((u) => u.nrp === member.nrp);
      if (uIdx >= 0) {
        globalStore.users[uIdx].nama = member.namaLengkap;
        globalStore.users[uIdx].pangkat = member.pangkat;
        globalStore.users[uIdx].satker = member.satuanKerja;
        globalStore.users[uIdx].polda = member.polda;
      }
    } else {
      globalStore.members.unshift({ ...member, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      // Ensure user account exists
      if (!globalStore.users.some((u) => u.nrp === member.nrp)) {
        globalStore.users.push({
          id: 'u-' + member.nrp,
          nrp: member.nrp,
          nama: member.namaLengkap,
          pangkat: member.pangkat,
          email: member.email || `${member.nrp}@wirasatya96.id`,
          role: 'ANGGOTA',
          profileId: member.id || 'ws-' + member.nrp,
          mfaEnabled: false,
          mfaMethod: 'PIN',
          status: 'DISETUJUI_BELUM_PASSWORD',
          satker: member.satuanKerja,
          polda: member.polda,
          fotoUrl: member.fotoUrl || '/default-avatar.png',
        });
      }
      // Ensure registration entry exists
      if (!globalStore.registrations.some((r) => r.nrp === member.nrp)) {
        globalStore.registrations.unshift({
          id: 'reg-' + member.nrp,
          nrp: member.nrp,
          nama: member.namaLengkap,
          pangkat: member.pangkat,
          satker: member.satuanKerja,
          polda: member.polda,
          noHp: member.noHp || '',
          email: member.email || `${member.nrp}@wirasatya96.id`,
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
          tahun: 2026,
          bulanTerbayar: [],
          totalTagihan: 3000000,
          totalTerbayar: 0,
          status: 'BELUM_BAYAR',
        });
      }
    }
    return member;
  },

  getUsers: () => globalStore.users,

  addUser: (user: AuthUser) => {
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
        noHp: '',
        email: user.email,
        alasanDaftar: `Ditambahkan oleh Admin / Kesekretariatan (${user.role})`,
        status: user.status || (user.password ? 'AKTIF' : 'DISETUJUI_BELUM_PASSWORD'),
        password: user.password,
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin / Kesekretariatan',
      });
    }

    // Ensure directory member exists
    const existingMember = globalStore.members.find((m) => m.nrp === user.nrp);
    if (!existingMember) {
      globalStore.members.unshift({
        id: 'ws-' + user.nrp,
        nrp: user.nrp,
        namaLengkap: user.nama,
        pangkat: user.pangkat,
        jabatanTerakhir: user.satker || 'Perwira Alumni Akpol 1996',
        satuanKerja: user.satker || 'Polri',
        polda: user.polda || 'MABES POLRI',
        tipeSatker: (user.polda || 'MABES POLRI') === 'MABES POLRI' ? 'MABES' : 'POLDA',
        pendidikanTerakhir: 'Akpol 1996',
        tempatLahir: 'Jakarta',
        tanggalLahir: '1974-01-01',
        usia: 52,
        jenisKelamin: 'LAKI-LAKI',
        noHp: '',
        email: user.email,
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
        tahun: 2026,
        bulanTerbayar: [],
        totalTagihan: 3000000,
        totalTerbayar: 0,
        status: 'BELUM_BAYAR',
      });
    }

    return user;
  },

  updateUser: (nrp: string, updates: Partial<AuthUser>) => {
    const idx = globalStore.users.findIndex((u) => u.nrp === nrp);
    if (idx < 0) return null;
    globalStore.users[idx] = { ...globalStore.users[idx], ...updates };
    const updatedUser = globalStore.users[idx];

    // Sync member name/pangkat/satker if changed
    const mIdx = globalStore.members.findIndex((m) => m.nrp === nrp);
    if (mIdx >= 0) {
      if (updates.nama) globalStore.members[mIdx].namaLengkap = updates.nama;
      if (updates.pangkat) globalStore.members[mIdx].pangkat = updates.pangkat;
      if (updates.satker) globalStore.members[mIdx].satuanKerja = updates.satker;
      if (updates.polda) globalStore.members[mIdx].polda = updates.polda;
    }

    return updatedUser;
  },

  deleteUser: (nrp: string) => {
    if (nrp === '98010710') return false; // Protect primary superadmin
    globalStore.users = globalStore.users.filter((u) => u.nrp !== nrp);
    globalStore.registrations = globalStore.registrations.filter((r) => r.nrp !== nrp);
    globalStore.members = globalStore.members.filter((m) => m.nrp !== nrp);
    globalStore.iuranList = globalStore.iuranList.filter((i) => i.nrp !== nrp);
    return true;
  },

  getSession: () => globalStore.activeSession,

  setSession: (user: AuthUser | null) => {
    globalStore.activeSession = user;
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
      email: regData.email.trim(),
      alasanDaftar: regData.alasanDaftar || 'Pendaftaran alumni Wira Satya Akpol 1996',
      status: 'PENDING_VERIFIKASI',
      createdAt: new Date().toISOString(),
    };

    globalStore.registrations.unshift(newReg);
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
          email: reg.email,
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
          email: reg.email,
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
          tahun: 2026,
          bulanTerbayar: [],
          totalTagihan: 3000000,
          totalTerbayar: 0,
          status: 'BELUM_BAYAR',
        });
      }

      return {
        success: true,
        message: `Pendaftaran ${reg.nama} berhasil disetujui. Akun siap diaktivasi oleh personel bersangkutan.`,
        registration: reg,
      };
    } else {
      reg.status = 'DITOLAK';
      reg.verifiedAt = new Date().toISOString();
      reg.verifiedBy = verifierName;
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
        email: reg.email,
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
      (r) => r.nrp === cleanId || r.email.toLowerCase() === cleanId.toLowerCase()
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

    // 3. Fallback: check 286 directory members if not yet in users table
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
    return {
      success: true,
      user,
      message: `Login berhasil sebagai ${user.nama} (${user.role})`,
    };
  },

  // ==============================================================
  // FINANCIAL METHODS
  // ==============================================================
  getFinance: () => ({
    summary: globalStore.financeSummary,
    transactions: globalStore.transactions,
    iuranList: globalStore.iuranList,
  }),

  addTransaction: (trx: Omit<KasTransaction, 'id' | 'createdAt'>) => {
    const newTrx: KasTransaction = {
      ...trx,
      id: 'trx-' + Date.now(),
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
      globalStore.financeSummary.totalPengeluaranBulanIni -= newTrx.nominal;
      if (newTrx.kategori === 'SANTUNAN_KESEHATAN') {
        globalStore.financeSummary.kasSosialKesehatan -= newTrx.nominal;
      } else if (newTrx.kategori === 'SANTUNAN_DUKA_CITA') {
        globalStore.financeSummary.kasDukaCita -= newTrx.nominal;
      }
    }

    return newTrx;
  },

  recordIuranPayment: (nrp: string, nominal: number) => {
    const target = globalStore.iuranList.find((i) => i.nrp === nrp);
    if (target) {
      target.totalTerbayar += nominal;
      target.terakhirBayar = new Date().toISOString().split('T')[0];
      if (target.totalTerbayar >= target.totalTagihan) {
        target.status = 'LUNAS';
        target.bulanTerbayar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      } else {
        target.status = 'SEBAGIAN';
      }

      // Add corresponding cash entry
      serverStore.addTransaction({
        nomorReferensi: 'WS96-IUR-' + Date.now().toString().slice(-4),
        tanggal: new Date().toISOString().split('T')[0],
        jenis: 'MASUK',
        kategori: 'IURAN_WAJIB_BULANAN',
        nominal: nominal,
        keterangan: `Pembayaran Iuran Leting oleh ${target.namaLengkap}`,
        pihakTerkait: target.namaLengkap,
        nrpTerkait: target.nrp,
        dicatatOleh: 'Kombes Pol. Yudhi Sulistyo (Bendahara)',
      });

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
    return newMsg;
  },

  markMessagesAsRead: (senderNrp: string, currentReceiverNrp: string) => {
    globalStore.messages.forEach((m) => {
      if (m.senderNrp === senderNrp && m.receiverNrp === currentReceiverNrp) {
        m.isRead = true;
      }
    });
  },
};
