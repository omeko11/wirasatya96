<div align="center">

# 🤝 PANDUAN KONTRIBUSI / CONTRIBUTING GUIDELINES
### Sistem Informasi Batalyon Wira Satya Akpol 1996

**[🇮🇩 Bahasa Indonesia](#-panduan-kontribusi-bahasa-indonesia)** · **[🇬🇧 English Version](#-contributing-guidelines-english-version)**

</div>

---

<a id="-panduan-kontribusi-bahasa-indonesia"></a>

# 🇮🇩 Panduan Kontribusi (Bahasa Indonesia)

Terima kasih atas kontribusi Anda pada pengembangan **Sistem Informasi Batalyon Wira Satya Akpol 1996** (`#SelaluBahagia`). Dokumen ini memuat standar alur kerja Git, konvensi penulisan kode, serta aturan keamanan data sebelum mengajukan *Pull Request*.

## 1. Alur Kerja Git (Git Workflow)
1. Pastikan branch `main` selalu dalam keadaan siap *deploy* (lolos `npx tsc --noEmit` dan `npm run build`).
2. Buat branch fitur atau perbaikan dari `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nama-fitur
   ```

## 2. Konvensi Pesan Commit (Conventional Commits)
| Prefix | Penggunaan | Contoh |
| :--- | :--- | :--- |
| `feat` | Penambahan fitur baru | `feat(finance): add crowdfunding milestone campaign tracker` |
| `fix` | Perbaikan bug logika atau tampilan | `fix(beranda): keep footer visible during mobile feed scroll` |
| `ui` | Peningkatan responsivitas antarmuka PC/HP | `ui(responsive): separate desktop and mobile button labels` |
| `docs` | Pembaruan dokumentasi (ID/EN) | `docs(readme): provide bilingual Indonesian and English docs` |
| `chore` | Pemeliharaan konfigurasi atau dependensi | `chore(security): sanitize environment templates` |

## 3. Standar Desain, Responsivitas, & Keamanan Data
- **Tema Warna**: Gunakan palet resmi *Bareskrim Crimson Red* (`#8B0000`, `bg-red-800`, `text-red-900`) dan aksen *Gold* (`#D97706`, `amber-500`).
- **Responsivitas PC vs HP**: Pastikan tampilan Desktop (`sm:` / `lg:`) mempertahankan tata letak penuh dan teks deskriptif, sedangkan tampilan HP (`< sm` / `< lg`) menggunakan label ringkas (`sm:hidden`) dan *header* kartu yang dapat dibuka-tutup (*collapsible*).
- **Pencegahan Kebocoran Data (*Zero Data Leak*)**: **Dilarang keras** meng-commit berkas `.env`, kata sandi asli, kunci API/token rahasia, berkas presentasi internal, atau *dump* basis data pribadi ke repositori publik.

---
---

<a id="-contributing-guidelines-english-version"></a>

# 🇬🇧 Contributing Guidelines (English Version)

Thank you for contributing to the **Wira Satya 1996 Alumni Information System** (`#SelaluBahagia`). This document outlines our Git workflow, coding conventions, and data security rules prior to submitting a Pull Request.

## 1. Git Workflow
1. Keep the `main` branch production-ready at all times (must pass `npx tsc --noEmit` and `npm run build`).
2. Create a feature or bugfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

## 2. Commit Message Conventions (Conventional Commits)
| Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feat` | New feature implementation | `feat(finance): add crowdfunding milestone campaign tracker` |
| `fix` | Bug fix in logic or UI | `fix(beranda): keep footer visible during mobile feed scroll` |
| `ui` | Desktop/Mobile responsive UI improvements | `ui(responsive): separate desktop and mobile button labels` |
| `docs` | Documentation updates (ID/EN) | `docs(readme): provide bilingual Indonesian and English docs` |
| `chore` | Configuration or dependency maintenance | `chore(security): sanitize environment templates` |

## 3. Design, Responsiveness, & Data Security Standards
- **Color Palette**: Adhere to the signature *Bareskrim Crimson Red* (`#8B0000`, `bg-red-800`, `text-red-900`) and *Officer Gold* (`#D97706`, `amber-500`) design tokens.
- **Desktop vs Mobile Responsiveness**: Preserve full 3-column layouts and descriptive labels on Desktop (`sm:` / `lg:`), while providing compact single-line labels (`sm:hidden`) and collapsible card headers on Mobile (`< sm` / `< lg`).
- **Zero Data Leak Policy**: **Never** commit `.env` files, plaintext passwords, private API keys/tokens, internal presentation decks, or personal database dumps to the public repository.
