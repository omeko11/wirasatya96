import { AnggotaWiraSatya, AuthUser, KasTransaction, IuranAnggota, FinanceSummary } from '@/types';
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
}

const globalStore: GlobalStore = {
  members: [...INITIAL_MEMBERS],
  users: [...PRESET_USERS],
  transactions: [...INITIAL_TRANSACTIONS],
  iuranList: [...INITIAL_IURAN_LIST],
  financeSummary: { ...INITIAL_FINANCE_SUMMARY },
  activeSession: PRESET_USERS[0], // default Superadmin
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
    // Match by nrp, id, or email
    const user = globalStore.users.find(
      (u) => u.nrp === identifier || u.id === identifier || u.email.toLowerCase() === identifier.toLowerCase()
    );
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
  }
};
