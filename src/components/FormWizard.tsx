'use client';

import React, { useState } from 'react';
import { AnggotaWiraSatya, Anak } from '@/types';
import { 
  Shield, 
  Users, 
  Home, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Save 
} from 'lucide-react';

interface FormWizardProps {
  onSave: (newMember: AnggotaWiraSatya) => void;
  onCancel: () => void;
}

const DAFTAR_POLDA = [
  'Mabes Polri',
  'Lemdiklat Polri',
  'Polda Metro Jaya',
  'Polda Jawa Barat',
  'Polda Jawa Tengah',
  'Polda Jawa Timur',
  'Polda Banten',
  'Polda DIY',
  'Polda Sumatera Utara',
  'Polda Sumatera Barat',
  'Polda Sumatera Selatan',
  'Polda Riau',
  'Polda Kepulauan Riau',
  'Polda Jambi',
  'Polda Bengkulu',
  'Polda Lampung',
  'Polda Kep. Bangka Belitung',
  'Polda Kalimantan Barat',
  'Polda Kalimantan Tengah',
  'Polda Kalimantan Selatan',
  'Polda Kalimantan Timur',
  'Polda Kalimantan Utara',
  'Polda Bali',
  'Polda Nusa Tenggara Barat',
  'Polda Nusa Tenggara Timur',
  'Polda Sulawesi Utara',
  'Polda Sulawesi Tengah',
  'Polda Sulawesi Selatan',
  'Polda Sulawesi Tenggara',
  'Polda Gorontalo',
  'Polda Sulawesi Barat',
  'Polda Maluku',
  'Polda Maluku Utara',
  'Polda Papua',
  'Polda Papua Barat',
];

const DAFTAR_PENYAKIT = [
  'HIPERTENSI (TEKANAN DARAH TINGGI)',
  'DIABETES MILITUS',
  'PENYAKIT JANTUNG',
  'STROKE',
  'KOLESTEROL TINGGI',
  'ASAM URAT',
  'OSTEOPOROSIS (PENGEROPOSAN TULANG)',
  'OSTEOARTITIS (PENGAPURAN SENDI)',
  'NYERI PINGGANG DAN LUTUT',
  'GANGGUAN PROSTAT',
  'PENYAKIT GINJAL',
  'PENYAKIT LIVER',
];

export const FormWizard: React.FC<FormWizardProps> = ({ onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State initialized with realistic defaults
  const [formData, setFormData] = useState<Partial<AnggotaWiraSatya>>({
    pangkat: 'Kombes Pol',
    polda: 'Polda Metro Jaya',
    jenisKelamin: 'LAKI-LAKI',
    statusTempatTinggal: 'MILIK PRIBADI',
    statusPerkawinan: 'MENIKAH',
    jumlahAnak: 2,
    daftarAnak: [
      {
        id: '1',
        nama: '',
        tempatLahir: '',
        tanggalLahir: '',
        status: 'PELAJAR',
        biayaPendidikanTahunan: '5.000.000 S.D. 25.000.000',
      },
    ],
    tahunPurnaTugas: 2032,
    sisaTahunDinas: 6,
    statusRumahPurnaTugas: 'MILIK PRIBADI',
    sudahPembekalan: 'SUDAH',
    rencanaAktivitas: ['USAHA SENDIRI'],
    statusUsaha: 'MASIH RENCANA',
    kebutuhanPembekalan: ['PELATIHAN'],
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
    mcuTerakhir: '< 6 BULAN',
  });

  const handleInputChange = (field: keyof AnggotaWiraSatya, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddChild = () => {
    const newChild: Anak = {
      id: Date.now().toString(),
      nama: '',
      tempatLahir: '',
      tanggalLahir: '',
      status: 'PELAJAR',
      biayaPendidikanTahunan: '5.000.000 S.D. 25.000.000',
    };
    setFormData((prev) => ({
      ...prev,
      daftarAnak: [...(prev.daftarAnak || []), newChild],
      jumlahAnak: (prev.daftarAnak?.length || 0) + 1,
    }));
  };

  const handleRemoveChild = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.daftarAnak || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        daftarAnak: updated,
        jumlahAnak: updated.length,
      };
    });
  };

  const handleUpdateChild = (index: number, field: keyof Anak, value: string) => {
    setFormData((prev) => {
      const updated = [...(prev.daftarAnak || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, daftarAnak: updated };
    });
  };

  const handleToggleDisease = (disease: string) => {
    setFormData((prev) => {
      const current = prev.daftarPenyakit || [];
      const updated = current.includes(disease)
        ? current.filter((d) => d !== disease)
        : [...current, disease];
      return { ...prev, daftarPenyakit: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nrp) {
      alert('Mohon isi Nama Lengkap dan NRP terlebih dahulu');
      setCurrentStep(1);
      return;
    }

    const newMember: AnggotaWiraSatya = {
      id: 'ws-' + Date.now(),
      nrp: formData.nrp || '',
      namaLengkap: formData.namaLengkap || '',
      pangkat: formData.pangkat || 'Kombes Pol',
      jabatanTerakhir: formData.jabatanTerakhir || '',
      satuanKerja: formData.satuanKerja || '',
      polda: formData.polda || 'Mabes Polri',
      pendidikanTerakhir: formData.pendidikanTerakhir || '',
      nomorKtp: formData.nomorKtp || '',
      tempatLahir: formData.tempatLahir || 'Jakarta',
      tanggalLahir: formData.tanggalLahir || '1974-01-01',
      usia: Number(formData.usia) || 52,
      jenisKelamin: formData.jenisKelamin || 'LAKI-LAKI',
      noHp: formData.noHp || '',
      kontakAdc: formData.kontakAdc || '',
      namaAdc: formData.namaAdc || '',
      fotoUrl: formData.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      alamatTempatTinggal: formData.alamatTempatTinggal || '',
      statusTempatTinggal: formData.statusTempatTinggal || 'MILIK PRIBADI',

      statusPerkawinan: formData.statusPerkawinan || 'MENIKAH',
      namaIstri: formData.namaIstri || '',
      tempatLahirIstri: formData.tempatLahirIstri || '',
      tanggalLahirIstri: formData.tanggalLahirIstri || '',
      usiaIstri: Number(formData.usiaIstri) || 50,
      kontakIstri: formData.kontakIstri || '',
      jumlahAnak: formData.daftarAnak?.length || 0,
      daftarAnak: formData.daftarAnak || [],
      tanggunganLain: formData.tanggunganLain,

      tahunPurnaTugas: Number(formData.tahunPurnaTugas) || 2032,
      sisaTahunDinas: Number(formData.sisaTahunDinas) || 6,
      alamatPurnaTugas: formData.alamatPurnaTugas || '',
      statusRumahPurnaTugas: formData.statusRumahPurnaTugas || 'MILIK PRIBADI',
      detailSewaPurnaTugas: formData.detailSewaPurnaTugas || '',
      biayaSewaTahunan: formData.biayaSewaTahunan || '',
      sudahPembekalan: formData.sudahPembekalan || 'SUDAH',
      rencanaAktivitas: formData.rencanaAktivitas || ['USAHA SENDIRI'],
      jenisUsaha: formData.jenisUsaha || '',
      statusUsaha: formData.statusUsaha || 'MASIH RENCANA',
      kebutuhanPembekalan: formData.kebutuhanPembekalan || ['PELATIHAN'],
      sumberPenghasilanPasca: formData.sumberPenghasilanPasca || ['DANA PENSIUN'],
      kecukupanDanaPensiun: formData.kecukupanDanaPensiun || 'CUKUP',
      kesiapanPensiun: formData.kesiapanPensiun || 'SIAP',
      perasaanPensiun: formData.perasaanPensiun || 'OPTIMIS',
      dukunganKeluarga: formData.dukunganKeluarga || 'SANGAT MENDUKUNG',

      adaPenyakitKronis: formData.adaPenyakitKronis || 'TIDAK ADA',
      kondisiKesehatan: formData.kondisiKesehatan || 'BAIK',
      daftarPenyakit: formData.daftarPenyakit || [],
      lamaMenderita: formData.lamaMenderita || '',
      kondisiSaatIni: formData.kondisiSaatIni || '',
      penangananPengobatan: formData.penangananPengobatan || '',
      biayaPengobatanDitanggung: formData.biayaPengobatanDitanggung || 'DITANGGUNG BPJS/ASURANSI',
      asuransiAktif: formData.asuransiAktif || ['BPJS'],
      rutinMcu: formData.rutinMcu || 'YA',
      mcuTerakhir: formData.mcuTerakhir || '< 6 BULAN',
      harapanLayananKesehatan: formData.harapanLayananKesehatan || '',
      harapanDukunganLeting: formData.harapanDukunganLeting || '',

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newMember);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Data Berhasil Tersimpan!</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Terima kasih Komandan. Profil dan data kesiapan purna tugas Batalyon Wira Satya 1996 telah berhasil diperbarui dan tersinkronisasi ke sistem.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-sm font-bold shadow-md transition-colors"
          >
            Kembali ke Buku Saku
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Identitas & Kedinasan', icon: Shield },
    { num: 2, title: 'Keluarga & Anak', icon: Users },
    { num: 3, title: 'Purna Tugas & Usaha', icon: Home },
    { num: 4, title: 'Kesehatan & Solidaritas', icon: Activity },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-polri-navy">
              Formulir Pendataan & Kesejahteraan Wira Satya 96
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengisian bertahap (4 Modul). Data dapat diperbarui sewaktu-waktu saat ada mutasi atau perubahan.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full self-start">
            Langkah {currentStep} dari 4
          </span>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-polri-navy text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">{s.title}</span>
                </div>
                <span className="text-[10px] sm:hidden font-semibold mt-1">Step {s.num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* STEP 1: IDENTITAS & KEDINASAN */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-polri-navy" />
                Modul 1: Identitas Pribadi & Kedinasan
              </h3>
              <p className="text-xs text-slate-500">
                Data resmi pangkat, penempatan satker, dan alamat domisili saat ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap (dengan Gelar) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kombes Pol. Hadi Wicaksono, S.I.K., M.H."
                  value={formData.namaLengkap || ''}
                  onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NRP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 74080123"
                  value={formData.nrp || ''}
                  onChange={(e) => handleInputChange('nrp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pangkat</label>
                <select
                  value={formData.pangkat || 'Kombes Pol'}
                  onChange={(e) => handleInputChange('pangkat', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="Kombes Pol">Kombes Pol</option>
                  <option value="Brigjen Pol">Brigjen Pol</option>
                  <option value="Irjen Pol">Irjen Pol</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wilayah Polda / Mabes</label>
                <select
                  value={formData.polda || 'Mabes Polri'}
                  onChange={(e) => handleInputChange('polda', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  {DAFTAR_POLDA.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan Terakhir</label>
                <input
                  type="text"
                  placeholder="Contoh: Kabaganev / Dirreskrimsus / Dirlantas"
                  value={formData.jabatanTerakhir || ''}
                  onChange={(e) => handleInputChange('jabatanTerakhir', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Satuan / Unit Kerja</label>
                <input
                  type="text"
                  placeholder="Contoh: Divhumas Polri / Ditlantas Polda Metro Jaya"
                  value={formData.satuanKerja || ''}
                  onChange={(e) => handleInputChange('satuanKerja', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={formData.noHp || ''}
                  onChange={(e) => handleInputChange('noHp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kontak ADC / Ajudan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Bripka Aryo - 08123456789"
                  value={formData.kontakAdc || ''}
                  onChange={(e) => handleInputChange('kontakAdc', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tempat Tinggal Saat Ini</label>
                <textarea
                  rows={2}
                  placeholder="Alamat domisili saat ini..."
                  value={formData.alamatTempatTinggal || ''}
                  onChange={(e) => handleInputChange('alamatTempatTinggal', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Tempat Tinggal Saat Ini</label>
                <select
                  value={formData.statusTempatTinggal || 'MILIK PRIBADI'}
                  onChange={(e) => handleInputChange('statusTempatTinggal', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="MILIK PRIBADI">MILIK PRIBADI</option>
                  <option value="RUMAH KELUARGA">RUMAH KELUARGA</option>
                  <option value="DINAS">DINAS</option>
                  <option value="SEWA/KONTRAK">SEWA/KONTRAK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  placeholder="Contoh: S2 Magister Hukum / Lemhannas"
                  value={formData.pendidikanTerakhir || ''}
                  onChange={(e) => handleInputChange('pendidikanTerakhir', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATA KELUARGA & ANAK */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-polri-navy" />
                Modul 2: Data Keluarga & Tanggungan Pendidikan Anak
              </h3>
              <p className="text-xs text-slate-500">
                Mendata keluarga inti, beban biaya pendidikan anak, serta keluarga yang membutuhkan perhatian khusus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Perkawinan</label>
                <select
                  value={formData.statusPerkawinan || 'MENIKAH'}
                  onChange={(e) => handleInputChange('statusPerkawinan', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="MENIKAH">MENIKAH</option>
                  <option value="BELUM MENIKAH">BELUM MENIKAH</option>
                  <option value="DUDA/JANDA">DUDA/JANDA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Istri / Ibu Bhayangkari</label>
                <input
                  type="text"
                  placeholder="Contoh: Ny. Dewi Hadi Wicaksono"
                  value={formData.namaIstri || ''}
                  onChange={(e) => handleInputChange('namaIstri', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kontak Ibu Bhayangkari</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={formData.kontakIstri || ''}
                  onChange={(e) => handleInputChange('kontakIstri', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Anak</label>
                <input
                  type="number"
                  min="0"
                  value={formData.daftarAnak?.length || 0}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600"
                />
              </div>
            </div>

            {/* Rincian Anak Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Rincian Data Putra / Putri & Tanggungan Biaya Pendidikan
                </label>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-polri-navy text-white text-xs font-semibold hover:bg-polri-navyLight transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Anak
                </button>
              </div>

              {formData.daftarAnak?.map((anak, idx) => (
                <div key={anak.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Anak ke-{idx + 1}</span>
                    {formData.daftarAnak && formData.daftarAnak.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(idx)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Nama Anak"
                        value={anak.nama}
                        onChange={(e) => handleUpdateChild(idx, 'nama', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-polri-navy"
                      />
                    </div>
                    <div>
                      <select
                        value={anak.status}
                        onChange={(e) => handleUpdateChild(idx, 'status', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-polri-navy"
                      >
                        <option value="PELAJAR">PELAJAR / MAHASISWA</option>
                        <option value="BEKERJA">BEKERJA</option>
                        <option value="BELUM BEKERJA">BELUM BEKERJA</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={anak.biayaPendidikanTahunan || '< 5.000.000'}
                        onChange={(e) => handleUpdateChild(idx, 'biayaPendidikanTahunan', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-polri-navy"
                      >
                        <option value="< 5.000.000">&lt; 5 Juta / Tahun</option>
                        <option value="5.000.000 S.D. 25.000.000">5 Juta s/d 25 Juta / Tahun</option>
                        <option value="> 25.000.000">&gt; 25 Juta / Tahun</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PURNA TUGAS & USAHA */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-polri-navy" />
                Modul 3: Persiapan Purna Tugas & Rencana Usaha
              </h3>
              <p className="text-xs text-slate-500">
                Memetakan kesiapan hunian masa pensiun, rencana usaha, dan dukungan permodalan dari paguyuban.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Purna Tugas (Pensiun)</label>
                <input
                  type="number"
                  value={formData.tahunPurnaTugas || 2032}
                  onChange={(e) => handleInputChange('tahunPurnaTugas', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Tempat Tinggal Setelah Pensiun</label>
                <select
                  value={formData.statusRumahPurnaTugas || 'MILIK PRIBADI'}
                  onChange={(e) => handleInputChange('statusRumahPurnaTugas', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="MILIK PRIBADI">MILIK PRIBADI</option>
                  <option value="RUMAH KELUARGA">RUMAH KELUARGA</option>
                  <option value="SEWA/KONTRAK">SEWA / KONTRAK (Belum Ada Rumah Tetap)</option>
                  <option value="DINAS">DINAS</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Rencana Tempat Tinggal Pasca Pensiun</label>
                <input
                  type="text"
                  placeholder="Kota / Wilayah rencana domisili pensiun..."
                  value={formData.alamatPurnaTugas || ''}
                  onChange={(e) => handleInputChange('alamatPurnaTugas', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rencana Jenis Usaha Pasca Pensiun</label>
                <input
                  type="text"
                  placeholder="Contoh: Kuliner / Konsultan / Perkebunan / Peternakan"
                  value={formData.jenisUsaha || ''}
                  onChange={(e) => handleInputChange('jenisUsaha', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kesiapan Usaha</label>
                <select
                  value={formData.statusUsaha || 'MASIH RENCANA'}
                  onChange={(e) => handleInputChange('statusUsaha', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="SUDAH JALAN">SUDAH JALAN</option>
                  <option value="DALAM PERSIAPAN">DALAM PERSIAPAN</option>
                  <option value="MASIH RENCANA">MASIH RENCANA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kebutuhan Dukungan dari Paguyuban</label>
                <select
                  value={formData.kebutuhanPembekalan?.[0] || 'PELATIHAN'}
                  onChange={(e) => handleInputChange('kebutuhanPembekalan', [e.target.value])}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="MODAL">Bantuan Akses Modal</option>
                  <option value="PELATIHAN">Pelatihan Kewirausahaan</option>
                  <option value="PENDAMPINGAN">Pendampingan Usaha Leting</option>
                  <option value="TIDAK PERLU">Tidak Perlu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kesiapan & Perasaan Menghadapi Pensiun</label>
                <select
                  value={formData.perasaanPensiun || 'OPTIMIS'}
                  onChange={(e) => handleInputChange('perasaanPensiun', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="OPTIMIS">OPTIMIS</option>
                  <option value="TENANG">TENANG</option>
                  <option value="CEMAS">CEMAS</option>
                  <option value="RAGU">RAGU</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: KESEHATAN & SOLIDARITAS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-polri-navy" />
                Modul 4: Riwayat Kesehatan & Solidaritas Leting
              </h3>
              <p className="text-xs text-slate-500">
                Untuk keperluan program kepedulian sosial, atensi kesehatan, dan bantuan antar leting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Riwayat Penyakit Kronis</label>
                <select
                  value={formData.adaPenyakitKronis || 'TIDAK ADA'}
                  onChange={(e) => handleInputChange('adaPenyakitKronis', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="TIDAK ADA">TIDAK ADA</option>
                  <option value="ADA">ADA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Kesehatan Saat Ini</label>
                <select
                  value={formData.kondisiKesehatan || 'BAIK'}
                  onChange={(e) => handleInputChange('kondisiKesehatan', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="SANGAT BAIK">SANGAT BAIK</option>
                  <option value="BAIK">BAIK</option>
                  <option value="CUKUP">CUKUP</option>
                  <option value="PERLU PERHATIAN KHUSUS">PERLU PERHATIAN KHUSUS</option>
                  <option value="SAKIT">SAKIT</option>
                </select>
              </div>
            </div>

            {/* Checkbox Penyakit */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Jenis Penyakit yang Pernah / Sedang Diderita (Beri tanda jika ada):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {DAFTAR_PENYAKIT.map((penyakit) => {
                  const isChecked = formData.daftarPenyakit?.includes(penyakit);
                  return (
                    <label key={penyakit} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDisease(penyakit)}
                        className="rounded text-polri-navy focus:ring-polri-navy"
                      />
                      <span className={isChecked ? 'font-bold text-polri-navy' : ''}>{penyakit}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kondisi Terkini & Penanganan Obat Saat Ini
              </label>
              <textarea
                rows={2}
                placeholder="Rincian kondisi dan obat rutin yang dikonsumsi..."
                value={formData.kondisiSaatIni || ''}
                onChange={(e) => handleInputChange('kondisiSaatIni', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harapan Dukungan / Bantuan dari Rekan-Rekan Leting Wira Satya 96
              </label>
              <textarea
                rows={2}
                placeholder="Pesan, harapan silaturahmi, atau bantuan yang diharapkan..."
                value={formData.harapanDukunganLeting || ''}
                onChange={(e) => handleInputChange('harapanDukunganLeting', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Batal
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-xs font-bold shadow-md transition-colors"
            >
              Lanjut
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Seluruh Data Profil
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
