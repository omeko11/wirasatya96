import { AnggotaWiraSatya, AuthUser, KasTransaction, IuranAnggota, FinanceSummary, ChatMessage } from '@/types';
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
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderNrp: '74030456',
    senderName: 'Irjen Pol. Achmad Kartiko',
    senderPangkat: 'Irjen Pol',
    receiverNrp: '96081299',
    receiverName: 'Eko Agung',
    text: 'Assalamu’alaikum Komandan. Mohon izin mengingatkan konsolidasi pengurus paguyuban terkait atensi rekan leting kita yang sedang pemulihan.',
    timestamp: '14:45',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-2',
    senderNrp: '96081299',
    senderName: 'Eko Agung',
    senderPangkat: 'Briptu',
    receiverNrp: '74030456',
    receiverName: 'Irjen Pol. Achmad Kartiko',
    text: 'Wa’alaikumsalam Jenderal. Siap, tim bendahara dan kesekretariatan sudah menyalurkan santunan tahap pertama.',
    timestamp: '15:02',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-3',
    senderNrp: '74030456',
    senderName: 'Irjen Pol. Achmad Kartiko',
    senderPangkat: 'Irjen Pol',
    receiverNrp: '96081299',
    receiverName: 'Eko Agung',
    text: 'Alhamdulillah mantap. Teruskan semangat #SelaluBahagia untuk rekan-rekan!',
    timestamp: '15:10',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    isRead: false,
  },
  {
    id: 'msg-4',
    senderNrp: '96081299',
    senderName: 'Eko Agung',
    senderPangkat: 'Briptu',
    receiverNrp: '74050234',
    receiverName: 'Kombes Pol. Bambang Prasetyo',
    text: 'Komandan Bambang, mohon konfirmasi transfer iuran tahunan leting 2026.',
    timestamp: 'Kemarin 09:30',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-5',
    senderNrp: '74050234',
    senderName: 'Kombes Pol. Bambang Prasetyo',
    senderPangkat: 'Kombes Pol',
    receiverNrp: '96081299',
    receiverName: 'Eko Agung',
    text: 'Siap Komandan, iuran kas paguyuban bulan Oktober sudah terverifikasi lunas. Rekap neraca bisa dilihat langsung di portal kebendaharaan.',
    timestamp: 'Kemarin 10:15',
    createdAt: new Date(Date.now() - 82800000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-6',
    senderNrp: '74080123',
    senderName: 'Kombes Pol. Hadi Wicaksono',
    senderPangkat: 'Kombes Pol',
    receiverNrp: '96081299',
    receiverName: 'Eko Agung',
    text: 'Data penempatan perwira di Polda Papua Tengah sudah diupdate di direktori 38 Polda komandan.',
    timestamp: '12 Okt 11:20',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isRead: true,
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

  authenticate: (identifier: string) => {
    const cleanId = identifier.trim();
    // Match by nrp, id, or email in registered users
    let user = globalStore.users.find(
      (u) =>
        u.nrp === cleanId ||
        u.id === cleanId ||
        u.email.toLowerCase() === cleanId.toLowerCase() ||
        u.id.toLowerCase().includes(cleanId.toLowerCase())
    );

    // If not found in users, check if matches any of the 286 members in the directory
    if (!user) {
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
        };
        globalStore.users.push(user);
      }
    }

    if (user) {
      globalStore.activeSession = user;
    }
    return user || null;
  },

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
      globalStore.financeSummary.totalPengeluaranBulanIni += newTrx.nominal;
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
