import { FeedPost } from '@/types';

export const PRESET_POST_IMAGES = [
  {
    label: 'Reuni & Silaturahmi Leting 96',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    description: 'Dokumentasi temu kangen dan silaturahmi akbar Batalyon 1996'
  },
  {
    label: 'Giat Baksos & Peduli Leting',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80',
    description: 'Penyaluran tali asih dan bantuan sosial paguyuban'
  },
  {
    label: 'Kenaikan Pangkat & Sertifikasi',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    description: 'Syukuran promosi jabatan, korps raport, dan sertifikasi dinas'
  },
  {
    label: 'Operasional & Pengabdian Wilayah',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    description: 'Apel kesiapan dan pengamanan wilayah penugasan 38 Polda'
  }
];

export const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    authorName: 'Irjen Pol. Achmad Kartiko, S.I.K., M.H.',
    authorPangkat: 'Irjen Pol',
    authorJabatan: 'Kapolda Aceh • Alumni Akpol 1996',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    authorNrp: '74030456',
    badgeLabel: 'Ketua Batalyon Wira Satya 96',
    pinned: true,
    content: 'Alhamdulillah, salam presisi dan salam hormat untuk seluruh rekan-rekan satu letting Batalyon Wira Satya Akpol 1996 di mana pun mengabdi, dari Sabang sampai Merauke.\n\nMenjelang masa purna tugas beberapa tahun ke depan, mari kita semakin rekatkan tali silaturahmi, saling menguatkan kesehatan fisik dan batin, serta saling mendoakan keselamatan dinas. Paguyuban ini adalah rumah kita bersama untuk saling menopang keluarga dan masa depan.\n\nSlogan kita tetap abadi: Guyub, Peduli, #SelaluBahagia! Tetap semangat para Komandan sekalian! 🇮🇩⭐',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    tags: ['#WiraSatya96', '#SelaluBahagia', '#SolidaritasLeting', '#Akpol96'],
    createdAt: '3 jam yang lalu',
    likesCount: 148,
    isLiked: false,
    repostsCount: 32,
    isReposted: false,
    impressionsCount: 420,
    category: 'MOTIVASI',
    comments: [
      {
        id: 'c-101',
        authorName: 'Kombes Pol. Hadi Wicaksono, S.I.K., M.H.',
        authorPangkat: 'Kombes Pol',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        content: 'Siap Jenderal! Arahan termonitor dengan baik. Salam hormat dari jajaran Divhumas Mabes Polri. Semoga Batalyon 96 semakin solid dan berkah selalu.',
        createdAt: '2 jam yang lalu'
      },
      {
        id: 'c-102',
        authorName: 'Kombes Pol. Bambang Prasetyo, S.H.',
        authorPangkat: 'Kombes Pol',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        content: 'Aamiin YRA Jenderal. Kas sosial paguyuban siap mendukung penuh atensi kesehatan dan kepedulian antar rekan leting.',
        createdAt: '1 jam yang lalu'
      }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Brigjen Pol. Eko Agung Krisdianto, S.I.K.',
    authorPangkat: 'Brigjen Pol',
    authorJabatan: 'Karojianstra Srena Polri • Alumni Akpol 1996',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    authorNrp: '74080123',
    badgeLabel: 'Superadmin / Pengurus 96',
    content: 'Mohon izin rekan-rekan leting sekalian, baru saja menyelesaikan penyelarasan Program Transformasi Digital & Manajemen Operasional Kepolisian. Di era adopsi teknologi saat ini, integrasi data dan pemetaan keanggotaan leting sangat krusial agar tidak ada rekan yang tertinggal dalam jangkauan perhatian paguyuban.\n\nTerima kasih atas doa dan atensi seluruh rekan leting 96. Sukses selalu untuk kita semua dalam bertugas!',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    tags: ['#WiraSatya96', '#TransformasiPolri', '#PengabdianPolri', '#SelaluBahagia'],
    createdAt: '6 jam yang lalu',
    likesCount: 94,
    isLiked: true,
    repostsCount: 18,
    isReposted: false,
    impressionsCount: 310,
    category: 'KENAIKAN_PANGKAT',
    comments: [
      {
        id: 'c-201',
        authorName: 'AKBP Dr. Hendra Gunawan, S.I.K., M.Si.',
        authorPangkat: 'AKBP',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face',
        content: 'Selamat dan sukses selalu Jenderal Eko Agung! Inspirasi bagi kita semua rekan leting. Mantap aplikasinya sangat memudahkan.',
        createdAt: '4 jam yang lalu'
      }
    ]
  },
  {
    id: 'post-3',
    authorName: 'Kombes Pol. Bambang Prasetyo, S.H.',
    authorPangkat: 'Kombes Pol',
    authorJabatan: 'Kabidkeu Polda Metro Jaya • Bendahara Batalyon 96',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    authorNrp: '74050234',
    badgeLabel: 'Bendahara Batalyon 96',
    content: 'Izin melaporkan rekan letting sekalian, per tanggal 15 Oktober 2026, amanah penyaluran santunan kesehatan dan tali asih untuk rekan letting kita yang sedang menjalani pengobatan intensif di RS Bhayangkara telah tersampaikan dengan lancar.\n\nTerima kasih yang tak terhingga kepada seluruh rekan yang terus tertib bergotong royong dalam iuran bulanan dan kas solidaritas leting. Mari kita doakan bersama agar leting kita segera pulih dan kembali beraktivitas.',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80',
    tags: ['#SolidaritasLeting', '#Baksos96', '#PeduliKesehatan', '#SelaluBahagia'],
    createdAt: '1 hari yang lalu',
    likesCount: 186,
    isLiked: false,
    repostsCount: 41,
    isReposted: false,
    impressionsCount: 560,
    category: 'BAKSOS',
    comments: [
      {
        id: 'c-301',
        authorName: 'Irjen Pol. Achmad Kartiko, S.I.K., M.H.',
        authorPangkat: 'Irjen Pol',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        content: 'Terima kasih jajaran Bendahara atas gerak cepatnya. Syafakallah untuk rekan kita, semoga lekas sembuh.',
        createdAt: '1 hari yang lalu'
      }
    ]
  }
];
