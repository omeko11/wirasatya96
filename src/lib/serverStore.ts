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
    id: 'reg-superadmin',
    nrp: '98010710',
    nama: 'Eko Agung',
    pangkat: 'Briptu',
    satker: 'Bareskrim Polri / Tim IT Developer Wira Satya 96',
    polda: 'MABES POLRI',
    noHp: '081298765432',
    email: 'agungkrisdianto96@gmail.com',
    alasanDaftar: 'Superadmin & Lead Developer Sistem Informasi Batalyon Wira Satya Akpol 1996.',
    status: 'DISETUJUI_BELUM_PASSWORD',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Sistem Otentikasi Bareskrim Polri (Dev Lead)',
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
    } else {
      globalStore.members.push({ ...member, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    return member;
  },

  getUsers: () => globalStore.users,

  addUser: (user: AuthUser) => {
    globalStore.users.push(user);
    return user;
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
    verifierName: string = 'Superadmin'
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
          role: 'ANGGOTA',
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

    // 1. Check registrations for pending/approved status
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

      if (reg.status === 'DISETUJUI_BELUM_PASSWORD' || (!reg.password && !passwordInput)) {
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
    }

    // 2. Check registered users list
    let user = globalStore.users.find(
      (u) =>
        u.nrp === cleanId ||
        u.id === cleanId ||
        u.email.toLowerCase() === cleanId.toLowerCase()
    );

    if (user && user.status === 'DISETUJUI_BELUM_PASSWORD') {
      return {
        success: false,
        requiresPasswordSetup: true,
        status: 'DISETUJUI_BELUM_PASSWORD',
        nrp: user.nrp,
        nama: user.nama,
        pangkat: user.pangkat,
        message: 'Pendaftaran Anda telah disetujui! Silakan buat kata sandi baru untuk mengaktifkan akun Anda.',
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
