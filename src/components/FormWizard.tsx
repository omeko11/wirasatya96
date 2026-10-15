'use client';

import React, { useState, useEffect } from 'react';
import { AnggotaWiraSatya, Anak, AuthUser, DAFTAR_PANGKAT_POLRI } from '@/types';
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
  Save, 
  Lock,
  Building2
} from 'lucide-react';
import { 
  TIPE_SATKER_LIST, 
  SATKER_MABES_LIST, 
  SUB_SATKER_BARESKRIM, 
  SUB_SATKER_POLDA_LIST, 
  SUB_SATKER_POLRES_LIST, 
  DAFTAR_38_POLDA,
  DAFTAR_KEMEN_LEMBAGA,
  STATUS_PURNA_TUGAS_LIST,
  getSubSatkerForMabes
} from '@/data/polriStructure';

interface FormWizardProps {
  onSave: (newMember: AnggotaWiraSatya) => void;
  onCancel: () => void;
  currentUser: AuthUser;
  existingMember?: AnggotaWiraSatya;
}

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

export const FormWizard: React.FC<FormWizardProps> = ({
  onSave,
  onCancel,
  currentUser,
  existingMember,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [penyakitLainnya, setPenyakitLainnya] = useState('');

  // Form State initialized from existing member or defaults
  const [formData, setFormData] = useState<Partial<AnggotaWiraSatya>>({
    jenisAnggota: 'ANGGOTA POLRI',
    tipeSatker: 'POLDA',
    satkerMabes: 'DIVHUMAS POLRI',
    subSatker: 'DITLANTAS',
    namaPolres: '',
    namaPolsek: '',
    pangkat: 'Kombes Pol',
    polda: 'POLDA METRO JAYA',
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

  // Prepopulate if existingMember is provided
  useEffect(() => {
    if (existingMember) {
      setFormData({
        ...existingMember,
        jenisAnggota: 'ANGGOTA POLRI',
        tipeSatker: existingMember.tipeSatker || (
          existingMember.polda?.toUpperCase().includes('MABES')
            ? 'MABES'
            : 'POLDA'
        ),
      });

      // Extract any custom diseases not in DAFTAR_PENYAKIT
      if (existingMember.daftarPenyakit && existingMember.daftarPenyakit.length > 0) {
        const custom = existingMember.daftarPenyakit.filter((p) => !DAFTAR_PENYAKIT.includes(p));
        setPenyakitLainnya(custom.length > 0 ? custom.join(', ') : '');
      } else {
        setPenyakitLainnya('');
      }
    } else if (currentUser.role === 'ANGGOTA') {
      // Pre-fill user NRP and name
      setFormData((prev) => ({
        ...prev,
        nrp: currentUser.nrp,
        namaLengkap: currentUser.nama,
        pangkat: currentUser.pangkat,
      }));
    } else {
      // Clean form for adding new member
      setFormData((prev) => ({
        ...prev,
        id: undefined,
        nrp: '',
        namaLengkap: '',
        jabatanTerakhir: '',
        satuanKerja: '',
        subSatker: '',
        noHp: '',
        email: '',
      }));
      setPenyakitLainnya('');
    }
  }, [existingMember, currentUser]);

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
      alert('Mohon lengkapi Nama Lengkap dan NRP');
      setCurrentStep(1);
      return;
    }

    const derivedPolda = 
      formData.tipeSatker === 'MABES' 
        ? (formData.satkerMabes === 'LEMDIKLAT POLRI' ? 'LEMDIKLAT POLRI' : 'MABES POLRI')
        : formData.tipeSatker === 'KEMEN/LEMBAGA'
        ? (formData.polda || 'KEMENTERIAN / LEMBAGA')
        : formData.tipeSatker === 'PURNA TUGAS'
        ? 'PURNA TUGAS'
        : (formData.polda || 'POLDA METRO JAYA');

    const derivedSatker = 
      formData.satuanKerja || (
        formData.tipeSatker === 'MABES' 
          ? `${formData.satkerMabes || 'MABES POLRI'}${formData.subSatker ? ' - ' + formData.subSatker : ''}`
          : formData.tipeSatker === 'POLDA'
          ? `${derivedPolda} - ${formData.subSatker || ''}`
          : formData.tipeSatker === 'POLRES/TA/BES'
          ? `${formData.namaPolres || 'Polres'} - ${formData.subSatker || ''}`
          : formData.tipeSatker === 'KEMEN/LEMBAGA'
          ? `${formData.polda || 'Kemen/Lembaga'}${formData.subSatker ? ' (' + formData.subSatker + ')' : ''}`
          : formData.tipeSatker === 'PURNA TUGAS'
          ? `Bhayangkara Purna Tugas Akpol 1996`
          : `${formData.namaPolres || 'Polres'}`
      );

    const combinedDiseases = [...(formData.daftarPenyakit || [])];
    if (penyakitLainnya.trim()) {
      const customList = penyakitLainnya.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
      customList.forEach((d) => {
        if (!combinedDiseases.includes(d)) {
          combinedDiseases.push(d);
        }
      });
    }

    const memberToSave: AnggotaWiraSatya = {
      id: existingMember?.id || 'ws-' + (formData.nrp || Date.now()),
      nrp: formData.nrp || '',
      namaLengkap: formData.namaLengkap || '',
      pangkat: formData.pangkat || 'Kombes Pol',
      jabatanTerakhir: formData.jabatanTerakhir || '',
      satuanKerja: derivedSatker,
      tipeSatker: formData.tipeSatker || 'POLDA',
      satkerMabes: formData.satkerMabes || '',
      subSatker: formData.subSatker || '',
      namaPolres: formData.namaPolres || '',
      namaPolsek: formData.namaPolsek || '',
      jenisAnggota: 'ANGGOTA POLRI',
      polda: derivedPolda,
      pendidikanTerakhir: formData.pendidikanTerakhir || '',
      nomorKtp: formData.nomorKtp || '',
      tempatLahir: formData.tempatLahir || 'Jakarta',
      tanggalLahir: formData.tanggalLahir || '1974-01-01',
      usia: Number(formData.usia) || 52,
      jenisKelamin: formData.jenisKelamin || 'LAKI-LAKI',
      noHp: formData.noHp || '',
      kontakAdc: formData.kontakAdc || '',
      namaAdc: formData.namaAdc || '',
      fotoUrl: formData.fotoUrl || '/default-avatar.png',
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

      adaPenyakitKronis: combinedDiseases.length > 0 ? 'ADA' : (formData.adaPenyakitKronis || 'TIDAK ADA'),
      kondisiKesehatan: formData.kondisiKesehatan || 'BAIK',
      daftarPenyakit: combinedDiseases,
      lamaMenderita: formData.lamaMenderita || '',
      kondisiSaatIni: formData.kondisiSaatIni || '',
      penangananPengobatan: formData.penangananPengobatan || '',
      biayaPengobatanDitanggung: formData.biayaPengobatanDitanggung || 'DITANGGUNG BPJS/ASURANSI',
      asuransiAktif: formData.asuransiAktif || ['BPJS'],
      rutinMcu: formData.rutinMcu || 'YA',
      mcuTerakhir: formData.mcuTerakhir || '< 6 BULAN',
      harapanLayananKesehatan: formData.harapanLayananKesehatan || '',
      harapanDukunganLeting: formData.harapanDukunganLeting || '',

      createdAt: existingMember?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(memberToSave);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Data Berhasil Diperbarui!</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Terima kasih Komandan. Perubahan data profil dan keluarga Anda telah berhasil disimpan dan disinkronkan ke direktori pusat Batalyon Wira Satya 1996.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-sm font-bold shadow-md transition-colors"
          >
            Lihat di Buku Saku
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-polri-navy">
                {currentUser.role === 'ANGGOTA' ? 'Pembaruan Data Mandiri Personel' : 'Formulir Pendataan & Kesejahteraan'}
              </h2>
              {currentUser.role === 'ANGGOTA' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Akun Pribadi
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.role === 'ANGGOTA'
                ? `Login sebagai ${currentUser.nama}. Anda hanya memperbarui data profil dan keluarga Anda sendiri.`
                : 'Pengurus memiliki hak untuk memverifikasi dan memperbarui data anggota se-Indonesia.'}
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
          <div className="space-y-6">
            <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-polri-navy" />
                  Modul 1: Identitas Pribadi & Struktur Kedinasan Polri
                </h3>
                <p className="text-xs text-slate-500">
                  Standardisasi data penempatan SIPP Polri (Mabes Polri, Polda, Polres/Ta/Bes, Kemen/Lembaga) leting Akpol 1996.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-polri-navy/10 text-polri-navy flex items-center gap-1 self-start sm:self-auto">
                <Building2 className="w-3.5 h-3.5" /> Standar SIPP Polri
              </span>
            </div>

            {/* SEKSI 1: STRUKTUR KEDINASAN & SATKER */}
            <div className="bg-slate-50/70 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-polri-navy flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-polri-gold" />
                  1. Satuan Kerja & Wilayah Penugasan
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Dropdown Bertingkat</span>
              </div>

              {/* Korps Alumni & Pangkat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Korps Personel <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-polri-navy/5 border border-polri-navy/20 rounded-lg text-polri-navy font-bold text-xs h-[42px]">
                    <Shield className="w-4 h-4 text-polri-gold flex-shrink-0" />
                    <span>PERWIRA POLRI (ALUMNI AKPOL 1996)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pangkat Terakhir <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pangkat || 'Kombes Pol'}
                    onChange={(e) => handleInputChange('pangkat', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  >
                    {DAFTAR_PANGKAT_POLRI.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipe Satker Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tingkat / Tipe Satuan Kerja (Satker) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TIPE_SATKER_LIST.map((tipe) => (
                    <button
                      key={tipe}
                      type="button"
                      onClick={() => {
                        handleInputChange('tipeSatker', tipe);
                        if (tipe === 'MABES') {
                          handleInputChange('polda', 'MABES POLRI');
                          if (!formData.satkerMabes) handleInputChange('satkerMabes', 'BARESKRIM POLRI');
                          handleInputChange('subSatker', 'DITTIPIDUM');
                        } else if (tipe === 'POLDA') {
                          if (!formData.polda || formData.polda === 'MABES POLRI' || formData.polda === 'KEMENTERIAN / LEMBAGA') {
                            handleInputChange('polda', 'POLDA METRO JAYA');
                          }
                          if (!formData.subSatker) handleInputChange('subSatker', 'DITRESKRIMUM (Reserse Kriminal Umum)');
                        } else if (tipe === 'POLRES/TA/BES') {
                          if (!formData.polda || formData.polda === 'MABES POLRI' || formData.polda === 'KEMENTERIAN / LEMBAGA') {
                            handleInputChange('polda', 'POLDA METRO JAYA');
                          }
                          if (!formData.subSatker) handleInputChange('subSatker', 'KAPOLRES / KAPOLRESTABES / KAPOLRES METRO');
                        } else if (tipe === 'KEMEN/LEMBAGA') {
                          handleInputChange('polda', 'BADAN INTELIJEN NEGARA (BIN)');
                          handleInputChange('subSatker', '');
                        } else if (tipe === 'PURNA TUGAS') {
                          handleInputChange('polda', 'PURNA TUGAS');
                          handleInputChange('subSatker', 'PURNAWIRAWAN / PENSIUN POLRI');
                        }
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        formData.tipeSatker === tipe
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tipe}
                    </button>
                  ))}
                </div>
              </div>

              {/* CASCADING DROPDOWNS BASED ON TIPE SATKER */}
              <div className="p-3.5 bg-white rounded-lg border border-slate-200/90 space-y-3.5">
                {/* 1. KONDISI MABES POLRI */}
                {formData.tipeSatker === 'MABES' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan Kerja Mabes Polri <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.satkerMabes || 'BARESKRIM POLRI'}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('satkerMabes', val);
                          const subList = getSubSatkerForMabes(val);
                          handleInputChange('subSatker', subList.length > 0 ? subList[0] : '');
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {SATKER_MABES_LIST.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sub Satker / Direktorat / Biro / Bagian
                      </label>
                      {getSubSatkerForMabes(formData.satkerMabes || 'BARESKRIM POLRI').length > 0 ? (
                        <select
                          value={formData.subSatker || ''}
                          onChange={(e) => handleInputChange('subSatker', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                        >
                          {getSubSatkerForMabes(formData.satkerMabes || 'BARESKRIM POLRI').map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Contoh: Biro Penmas / Bag Renmin / Unit Khusus"
                          value={formData.subSatker || ''}
                          onChange={(e) => handleInputChange('subSatker', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-polri-navy"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 2. KONDISI POLDA */}
                {formData.tipeSatker === 'POLDA' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Polda Penugasan (38 Wilayah) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={
                          formData.polda && (DAFTAR_38_POLDA as readonly string[]).includes(formData.polda)
                            ? formData.polda
                            : 'POLDA METRO JAYA'
                        }
                        onChange={(e) => handleInputChange('polda', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {DAFTAR_38_POLDA.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Direktorat / Biro / Bidang Polda <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subSatker || 'DITRESKRIMUM (Reserse Kriminal Umum)'}
                        onChange={(e) => handleInputChange('subSatker', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {SUB_SATKER_POLDA_LIST.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. KONDISI POLRES/TA/BES */}
                {formData.tipeSatker === 'POLRES/TA/BES' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Polda Induk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={
                          formData.polda && (DAFTAR_38_POLDA as readonly string[]).includes(formData.polda)
                            ? formData.polda
                            : 'POLDA METRO JAYA'
                        }
                        onChange={(e) => handleInputChange('polda', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {DAFTAR_38_POLDA.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Polres / Polrestabes / Metro <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Polrestabes Surabaya / Polres Metro Jaksel"
                        value={formData.namaPolres || ''}
                        onChange={(e) => handleInputChange('namaPolres', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-polri-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Penugasan / Satker Polres <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subSatker || 'KAPOLRES / KAPOLRESTABES / KAPOLRES METRO'}
                        onChange={(e) => handleInputChange('subSatker', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {SUB_SATKER_POLRES_LIST.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. KONDISI KEMEN/LEMBAGA (PENUGASAN LUAR STRUKTUR POLRI) */}
                {formData.tipeSatker === 'KEMEN/LEMBAGA' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kementerian / Lembaga Penugasan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.polda || 'BADAN INTELIJEN NEGARA (BIN)'}
                        onChange={(e) => handleInputChange('polda', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {DAFTAR_KEMEN_LEMBAGA.map((kl) => (
                          <option key={kl} value={kl}>
                            {kl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Direktorat / Kedeputian / Unit Penugasan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Deputi Penindakan / Direktur Intelijen / Staf Khusus"
                        value={formData.subSatker || ''}
                        onChange={(e) => handleInputChange('subSatker', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-polri-navy"
                      />
                    </div>
                  </div>
                )}

                {/* 5. KONDISI PURNA TUGAS */}
                {formData.tipeSatker === 'PURNA TUGAS' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status Kehormatan Purna Tugas <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subSatker || 'PURNAWIRAWAN / PENSIUN POLRI'}
                        onChange={(e) => handleInputChange('subSatker', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-polri-navy"
                      >
                        {STATUS_PURNA_TUGAS_LIST.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bidang Aktivitas / Usaha Saat Ini
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Pengusaha Transportasi / Praktisi Hukum / Dewan Pembina"
                        value={formData.satuanKerja || ''}
                        onChange={(e) => handleInputChange('satuanKerja', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-polri-navy"
                      />
                    </div>
                  </div>
                )}

                {/* Jabatan Terakhir & Satuan Kerja Lengkap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jabatan Terakhir / Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kabaganev / Dirreskrimsus / Dirlantas / Kapolres"
                      value={formData.jabatanTerakhir || ''}
                      onChange={(e) => handleInputChange('jabatanTerakhir', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Keterangan Satker SIPP Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Divhumas Polri / Ditlantas Polda Metro Jaya"
                      value={formData.satuanKerja || ''}
                      onChange={(e) => handleInputChange('satuanKerja', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI 2: IDENTITAS PRIBADI PERSONEL */}
            <div className="bg-slate-50/70 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-polri-navy flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-polri-gold" />
                2. Identitas Pribadi & Kontak
              </span>

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
                    readOnly={currentUser.role === 'ANGGOTA' && !!existingMember}
                    placeholder="Contoh: 74080123"
                    value={formData.nrp || ''}
                    onChange={(e) => handleInputChange('nrp', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none ${
                      currentUser.role === 'ANGGOTA' && existingMember ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {currentUser.role === 'ANGGOTA' && existingMember && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      NRP terkunci sebagai Primary Key akun Anda.
                    </span>
                  )}
                  {currentUser.role === 'SUPERADMIN' && (
                    <span className="text-[10px] text-amber-600 font-bold mt-1 block">
                      ⚡ Hak Superadmin / Dev: Anda memiliki hak penuh mengubah nomor NRP.
                    </span>
                  )}
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

            {/* Opsi Diagnosa Lainnya / Tulis Sendiri */}
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  Penyakit Lainnya / Diagnosa Mandiri (Tulis sendiri jika belum ada di atas):
                </label>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                  Bisa dipisah koma jika lebih dari satu
                </span>
              </div>
              <input
                type="text"
                placeholder="Contoh: GERD Kronis, Batu Ginjal, Vertigo, Cedera Tulang Belakang..."
                value={penyakitLainnya}
                onChange={(e) => setPenyakitLainnya(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-amber-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-800 placeholder-slate-400"
              />
              <p className="text-[10px] text-slate-500">
                Diagnosa ini akan otomatis tersimpan dalam rekam medis profil Anda dan terpantau oleh Bidang Kesejahteraan & Sosial Leting.
              </p>
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
              Simpan Pembaruan Data
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
