# Panduan Kontribusi (Contributing Guidelines)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan **Sistem Informasi Batalyon Wira Satya Akpol 1996** (`#SelaluBahagia`). Repositori ini dikelola dengan standar *clean architecture*, modularitas tinggi, dan dokumentasi berstandar industri.

Dokumen ini memuat panduan alur kerja (*workflow*), standar penulisan kode, serta konvensi commit untuk menjaga kualitas dan integritas sistem.

---

## 1. Alur Kerja Git & Percabangan (Git Workflow)

1. **Branching Strategy**:
   - `main`: Branch produksi yang selalu siap *deploy* (CD ke Vercel dan Server Produksi).
   - `feature/<nama-fitur>`: Branch untuk penambahan modul atau fitur baru (contoh: `feature/anev-kesehatan-export`, `feature/sotk-polda-mapping`).
   - `fix/<nama-bug>`: Branch untuk perbaikan *bug* atau perbaikan tampilan (contoh: `fix/navbar-mobile-overflow`).
   - `docs/<nama-update>`: Branch untuk pembaruan dokumentasi atau spesifikasi teknis.

2. **Langkah Memulai Fitur Baru**:
   ```bash
   # Pastikan Anda berada di branch main terbaru
   git checkout main
   git pull origin main

   # Buat branch baru
   git checkout -b feature/nama-fitur-baru
   ```

---

## 2. Standar Pesan Commit (Conventional Commits)

Kami menerapkan standar **Conventional Commits** agar riwayat perubahan (*changelog*) terbaca jelas dan terstruktur:

| Tipe | Kapan Digunakan | Contoh |
|---|---|---|
| `feat` | Penambahan fitur baru bagi pengguna | `feat(sotk): implement authentic SOTK Mabes and Polda mapping` |
| `fix` | Perbaikan bug pada antarmuka atau logika | `fix(navbar): resolve responsive drawer layout collapse` |
| `docs` | Pembaruan atau penambahan dokumentasi | `docs(readme): add architecture diagram and docker guide` |
| `style` | Penyesuaian tema warna/desain tanpa ubah logika | `style(branding): apply Bareskrim Crimson Red palette tokens` |
| `refactor` | Refaktor kode tanpa menambah fitur/memperbaiki bug | `refactor(auth): simplify role verification middleware` |
| `test` | Penambahan atau perbaikan unit/integration tests | `test(api): add test suite for members directory endpoints` |
| `chore` | Pemeliharaan dependensi, build config, atau CI/CD | `chore(deps): update nextjs to 14.2.35` |

---

## 3. Konvensi Desain & Kode (Design & Code Standards)

### A. Palet Warna Resmi (Bareskrim Crimson Red & Gold)
- **Primary Brand**: Bareskrim Crimson Red (`#8B0000`, `bg-red-800`, `hover:bg-red-900`, `text-red-900`).
- **Accent**: Gold / Kuning Perwira Polri (`#D97706`, `amber-500`, `amber-600`).
- **Background & Card**: Clean Slate (`bg-[#f3f2ef]` atau `bg-slate-100`, card `bg-white`, border `border-slate-200`).
- **Dilarang**: Menggunakan warna biru generik (`#0a66c2`) pada komponen baru. Seluruh komponen harus selaras dengan identitas Bareskrim Crimson Red.

### B. Logo Resmi Wira Satya 1996
- Gunakan komponen reusable `<WSLogo size="xs|sm|md|lg|xl" />`.
- Logo menggunakan *squircle red gradient*, huruf **"WS"** dengan font **Arial Black**, dan **"1996"** dengan font **Bierstadt / Aptos**.

### C. TypeScript & Next.js Best Practices
- Selalu tentukan tipe data secara eksplisit di [src/types/index.ts](file:///d:/Project/KAP%20IDAH/wirasatya96/src/types/index.ts). Hindari penggunaan `any`.
- Komponen interaktif yang menggunakan React state/hooks wajib menyertakan direktif `'use client';` di baris pertama.
- Gunakan Lucide React untuk seluruh kebutuhan ikon visual.

---

## 4. Pengujian Lokal & Build Verification

Sebelum membuat *Pull Request* atau melakukan *push* ke branch `main`, pastikan proyek lolos uji kompilasi:

```bash
# 1. Jalankan build Next.js lokal
npm run build

# 2. Pastikan exit code 0 dan tidak ada type error TypeScript
```

Jika menggunakan Docker:
```bash
# Uji orkestrasi kontainer
docker-compose config
docker-compose build
```

---

## 5. Mengajukan Pull Request (PR)

1. Pastikan seluruh perubahan telah di-commit dengan pesan yang deskriptif.
2. Push branch Anda ke remote repository:
   ```bash
   git push origin feature/nama-fitur-baru
   ```
3. Buka GitHub dan ajukan **Pull Request** ke branch `main`.
4. Berikan deskripsi yang mencakup:
   - Apa tujuan perubahan ini (*What*).
   - Mengapa perubahan ini dilakukan (*Why*).
   - Screenshot / visual bukti pengujian jika ada perubahan antarmuka (*UI verification*).
