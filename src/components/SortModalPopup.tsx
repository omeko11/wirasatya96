'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Check, X, Sparkles, Layers } from 'lucide-react';

export type UnifiedSortKey =
  | 'DEFAULT'
  | 'PANGKAT_UTAMA'
  | 'STATUS'
  | 'PANGKAT'
  | 'LEVEL_SATKER'
  | 'NRP'
  | 'NAMA'
  | 'ROLE';

export interface UnifiedSortOption {
  key: UnifiedSortKey;
  title: string;
  shortLabel: string;
  formula: string;
  description: string;
  ascHint: string;
  descHint: string;
  defaultDesc: boolean;
  isCombinedPrimary?: boolean;
}

export const UNIFIED_SORT_OPTIONS: UnifiedSortOption[] = [
  {
    key: 'DEFAULT',
    title: 'Default: Semua (Kombinasi Utama & Status Jabatan)',
    shortLabel: 'Default: Semua (Status • Pangkat • Level Satker • NRP • Nama • Role)',
    formula: 'Status (Aktif → Purna → PTDH → Almarhum) • Pangkat • Level Satker • NRP • Nama • Role',
    description:
      'Menggabungkan urutan utama Menu User (Pangkat • Level Satker • NRP • Nama • Role) dengan pengelompokan Status Kedinasan Menu Jabatan (Aktif → Purna Tugas → PTDH → Almarhum).',
    ascHint: 'Terbalik (Almarhum → Aktif • Pangkat Rendah → Tinggi)',
    descHint: 'Utama (Aktif → Purna → PTDH → Almarhum • Pangkat Tinggi → Rendah)',
    defaultDesc: true,
    isCombinedPrimary: true,
  },
  {
    key: 'PANGKAT_UTAMA',
    title: 'Kombinasi Pangkat Utama (Pangkat • Level Satker • NRP • Nama • Role)',
    shortLabel: 'Semua: Pangkat • Level Satker • NRP • Nama • Role • Status',
    formula: 'Pangkat • Level Satker • NRP • Nama • Role • Status (Aktif → Purna → PTDH → Almarhum)',
    description:
      'Mengurutkan murni dari Pangkat tertinggi (Jenderal → Bharada) dan Level Satker (Mabes → Polsek), dikombinasikan dengan NRP, Nama, Role, dan Status Kedinasan.',
    ascHint: 'Pangkat Rendah → Tinggi • Polsek → Mabes',
    descHint: 'Pangkat Tinggi → Rendah • Mabes → Polsek',
    defaultDesc: true,
    isCombinedPrimary: true,
  },
  {
    key: 'STATUS',
    title: 'By Status Kedinasan & NRP (Urutan Menu Jabatan)',
    shortLabel: 'By Status (Aktif [NRP Kecil] → Purna → PTDH → Almarhum)',
    formula: 'Status (Aktif → Purna → PTDH → Almarhum) • NRP Kecil • Pangkat • Level Satker • Nama • Role',
    description:
      'Mengelompokkan personel Aktif di urutan teratas (diurutkan dari NRP terkecil/senioritas), diikuti Purna Tugas, PTDH, dan Almarhum di bagian bawah.',
    ascHint: 'Almarhum → PTDH → Purna Tugas → Aktif',
    descHint: 'Aktif → Purna Tugas → PTDH → Almarhum',
    defaultDesc: true,
  },
  {
    key: 'PANGKAT',
    title: 'By Pangkat Polri',
    shortLabel: 'By Pangkat (Jenderal Polisi → Bharada)',
    formula: 'Pangkat (PATI → PAMEN → PAMA → Bintara/Tamtama) • Status • Level Satker • NRP',
    description:
      'Mengurutkan berdasarkan hierarki kepangkatan Polri (Irjen Pol, Brigjen Pol, Kombes Pol, AKBP, dst.) dengan tetap memprioritaskan Status Kedinasan.',
    ascHint: 'Pangkat Terendah → Tertinggi (Bharada → Jenderal)',
    descHint: 'Pangkat Tertinggi → Terendah (Jenderal → Bharada)',
    defaultDesc: true,
  },
  {
    key: 'LEVEL_SATKER',
    title: 'By Level Satker (Tingkat Kesatuan)',
    shortLabel: 'By Level Satker (Mabes → Polda → Polres → Polsek)',
    formula: 'Level Satker (Mabes/Kemen-Lembaga → Polda → Polres/ta/bes → Polsek) • Status • Pangkat',
    description:
      'Mengurutkan dari penugasan tingkat pusat (Mabes Polri & Kementerian/Lembaga), tingkat Polda, Polres/Polrestabes, hingga Polsek.',
    ascHint: 'Kewilayahan → Pusat (Polsek → Polres → Polda → Mabes)',
    descHint: 'Pusat → Kewilayahan (Mabes → Polda → Polres → Polsek)',
    defaultDesc: true,
  },
  {
    key: 'NRP',
    title: 'By NRP (Nomor Registrasi Pokok)',
    shortLabel: 'By NRP (Angka Kecil ↔ Besar)',
    formula: 'NRP 8 Digit (Tahun Kelahiran & Nomor Urut) • Status • Pangkat • Level Satker',
    description:
      'Mengurutkan berdasarkan angka NRP 8 digit (senioritas tahun kelahiran 71... s.d. 75...) yang dikombinasikan dengan Status Kedinasan.',
    ascHint: 'NRP Kecil → Besar (71... → 75...)',
    descHint: 'NRP Besar → Kecil (75... → 71...)',
    defaultDesc: false,
  },
  {
    key: 'NAMA',
    title: 'By Nama Lengkap Personel',
    shortLabel: 'By Nama (Abjad A ↔ Z)',
    formula: 'Nama Lengkap Tanpa Gelar Pangkat (A – Z / Z – A) • Status • Pangkat',
    description:
      'Mengurutkan berdasarkan abjad nama lengkap perwira (setelah pangkat dan gelar depan dibersihkan).',
    ascHint: 'Abjad A → Z (Ascending)',
    descHint: 'Abjad Z → A (Descending)',
    defaultDesc: false,
  },
  {
    key: 'ROLE',
    title: 'By Role / Jabatan Angkatan',
    shortLabel: 'By Role (Ketua → Sekretaris → Bendahara → Anggota)',
    formula: 'Role Pengurus (Ketua → Sekretaris → Bendahara → Anggota) • Status • Pangkat • Level Satker',
    description:
      'Menampilkan pengurus inti Paguyuban Wira Satya 96 (Ketua, Sekretaris, Bendahara) terlebih dahulu sebelum Anggota.',
    ascHint: 'Anggota → Bendahara → Sekretaris → Ketua',
    descHint: 'Ketua → Sekretaris → Bendahara → Anggota',
    defaultDesc: true,
  },
];

interface SortTriggerBarProps {
  sortBy: UnifiedSortKey;
  sortDesc: boolean;
  onOpenModal: () => void;
  onToggleDirection: () => void;
  compact?: boolean;
}

export const SortTriggerBar: React.FC<SortTriggerBarProps> = ({
  sortBy,
  sortDesc,
  onOpenModal,
  onToggleDirection,
  compact = false,
}) => {
  const currentOption =
    UNIFIED_SORT_OPTIONS.find((opt) => opt.key === sortBy) || UNIFIED_SORT_OPTIONS[0];

  return (
    <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs shrink-0 max-w-full">
      <button
        type="button"
        onClick={onOpenModal}
        className="flex items-center min-w-0 text-left hover:bg-slate-50 transition-colors focus:outline-none group"
        title="Klik untuk membuka Pop-up Daftar Pengurutan (Pilih Kriteria & Ascend / Descend)"
      >
        <div className="pl-2.5 pr-2 py-1.5 flex items-center gap-1.5 text-red-800 bg-red-50/80 group-hover:bg-red-100/80 border-r border-slate-200 transition-colors shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Urutkan</span>
        </div>
        <div
          className={`px-2.5 py-1.5 flex items-center gap-1.5 min-w-0 ${
            compact ? 'max-w-[240px] sm:max-w-[340px]' : 'max-w-[260px] sm:max-w-[440px]'
          }`}
        >
          <span className="text-xs font-semibold text-slate-700 truncate">
            {currentOption.shortLabel}
          </span>
          <span className="text-[10px] text-slate-400 shrink-0">▾</span>
        </div>
      </button>

      <button
        type="button"
        onClick={onToggleDirection}
        className={`px-2.5 py-1.5 border-l border-slate-200 font-bold text-[11px] transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
          sortDesc
            ? 'bg-red-50/60 hover:bg-red-100/70 text-red-900'
            : 'bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-900'
        }`}
        title={
          sortDesc
            ? `Mode Descend Aktif (${currentOption.descHint}) — Klik untuk ubah ke Ascend`
            : `Mode Ascend Aktif (${currentOption.ascHint}) — Klik untuk ubah ke Descend`
        }
      >
        {sortDesc ? (
          <>
            <ArrowDown className="w-3 h-3 text-red-800 shrink-0" />
            <span>Descend</span>
          </>
        ) : (
          <>
            <ArrowUp className="w-3 h-3 text-indigo-700 shrink-0" />
            <span>Ascend</span>
          </>
        )}
      </button>
    </div>
  );
};

interface SortModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: UnifiedSortKey;
  sortDesc: boolean;
  onSelectSort: (key: UnifiedSortKey, desc: boolean) => void;
  contextTitle?: string;
}

export const SortModalPopup: React.FC<SortModalPopupProps> = ({
  isOpen,
  onClose,
  sortBy,
  sortDesc,
  onSelectSort,
  contextTitle = 'Daftar Pengguna & Riwayat Jabatan',
}) => {
  if (!isOpen) return null;

  const activeOption =
    UNIFIED_SORT_OPTIONS.find((opt) => opt.key === sortBy) || UNIFIED_SORT_OPTIONS[0];

  const handlePick = (key: UnifiedSortKey, desc: boolean) => {
    onSelectSort(key, desc);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
              <ArrowUpDown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  Pengaturan Urutan Data (Sorting)
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {contextTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Kombinasi urutan utama{' '}
                <span className="font-bold text-white">
                  (Pangkat &bull; Level Satker &bull; NRP &bull; Nama &bull; Role)
                </span>{' '}
                dengan urutan Status Kedinasan{' '}
                <span className="font-bold text-amber-300">
                  (Aktif &rarr; Purna Tugas &rarr; PTDH &rarr; Almarhum)
                </span>
                . Pilih kriteria beserta arah <span className="font-bold text-white">Ascend</span> atau{' '}
                <span className="font-bold text-white">Descend</span> di bawah ini:
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors shrink-0"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Bar Urutan Aktif Saat Ini */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-red-800 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Aktif saat ini:</span>
            <span className="font-bold text-slate-900 truncate">{activeOption.title}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
              sortDesc
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            {sortDesc ? (
              <>
                <ArrowDown className="w-3 h-3" />
                <span>↓ Descend ({activeOption.descHint})</span>
              </>
            ) : (
              <>
                <ArrowUp className="w-3 h-3" />
                <span>↑ Ascend ({activeOption.ascHint})</span>
              </>
            )}
          </span>
        </div>

        {/* Daftar Pilihan Urutan (Pop-up List dengan tombol Ascend & Descend di setiap baris) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {UNIFIED_SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.key;
            const isAscSelected = isSelected && !sortDesc;
            const isDescSelected = isSelected && sortDesc;

            return (
              <div
                key={opt.key}
                onClick={() => handlePick(opt.key, opt.defaultDesc)}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-800 bg-red-50/35 ring-2 ring-red-800/15 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Kiri: Judul, Rumus Kombinasi & Penjelasan */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {opt.isCombinedPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Utama</span>
                        </span>
                      )}
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {opt.title}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3" />
                          <span>Terpilih</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-red-900/90 bg-red-50/80 border border-red-200/70 rounded-lg px-2.5 py-1 inline-block">
                      {opt.formula}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  {/* Kanan: Tombol Pilihan Ascend & Descend untuk item list ini */}
                  <div
                    className="flex sm:flex-col items-stretch gap-1.5 shrink-0 sm:w-48"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handlePick(opt.key, false)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                        isAscSelected
                          ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs font-extrabold'
                          : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border-slate-300 hover:border-indigo-300 font-semibold'
                      }`}
                      title={`Urutkan ${opt.title} secara Ascending (${opt.ascHint})`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-extrabold">
                          <ArrowUp className="w-3.5 h-3.5 shrink-0" />
                          <span>Ascend</span>
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isAscSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {opt.ascHint}
                        </div>
                      </div>
                      {isAscSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePick(opt.key, true)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                        isDescSelected
                          ? 'bg-red-800 text-white border-red-900 shadow-xs font-extrabold'
                          : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-900 border-slate-300 hover:border-red-300 font-semibold'
                      }`}
                      title={`Urutkan ${opt.title} secara Descending (${opt.descHint})`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-extrabold">
                          <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                          <span>Descend</span>
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isDescSelected ? 'text-red-100' : 'text-slate-400'
                          }`}
                        >
                          {opt.descHint}
                        </div>
                      </div>
                      {isDescSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handlePick('DEFAULT', true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            Reset ke Default Kombinasi (↓ Descend)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
