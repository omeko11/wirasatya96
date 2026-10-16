'use client';

import React, { useState, useEffect } from 'react';
import { AnggotaWiraSatya, Anak, AdcPersonel, AuthUser, DAFTAR_PANGKAT_POLRI } from '@/types';
import {
  getAvatarUrl,
  getCoverUrl,
  resolveAvatarUrl,
  cleanJabatanOnly,
  calculateRetirement58,
  deriveBirthDateFromNrp,
  RETIREMENT_AGE_POLRI,
  DEFAULT_AVATAR_URL,
  DEFAULT_COVER_URL,
} from '@/lib/avatarUtils';
import { SatkerBerjenjangModal } from '@/components/SatkerBerjenjangModal';
import {
  getJabatanGroupsForPangkat,
  isStandardPolriJabatan,
  isOfficerRankIpdaUp,
  EXTERNAL_JABATAN_SENTINEL,
} from '@/data/polriJabatan';
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
  Building2,
  Camera,
  Info,
  Image as ImageIcon,
  Mail,
  Calendar,
  Clock,
} from 'lucide-react';
import { processSecureImageUpload } from '@/lib/mediaSecurity';

interface FormWizardProps {
  onSave: (newMember: AnggotaWiraSatya) => void;
  onCancel: () => void;
  currentUser: AuthUser;
  existingMember?: AnggotaWiraSatya;
}

type JenisAnggotaOption =
  | 'ANGGOTA POLRI'
  | 'ALUMNI AKPOL 1996'
  | 'ASN / PNS POLRI'
  | 'PURNAWIRAWAN POLRI';

type FormWizardData = Omit<Partial<AnggotaWiraSatya>, 'jenisAnggota'> & {
  jenisAnggota?: JenisAnggotaOption | string;
};

const BINTARA_TAMTAMA_RANKS = [
  'Briptu',
  'Brigpol',
  'Bripka',
  'Aipda',
  'Aiptu',
  'Bripda',
  'Bharada',
  'Bharatu',
  'Bharaka',
  'Abripda',
  'Abriptu',
  'Abrip',
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

async function resizeImageFile(
  file: File,
  preset: 'AVATAR' | 'COVER',
  actorNrp?: string,
  ownerNrp?: string
): Promise<string> {
  const processed = await processSecureImageUpload(file, {
    preset,
    actorNrp,
    ownerNrp,
  });
  return processed.dataUrl;
}

function resolveDefaultJenisAnggota(member?: AnggotaWiraSatya, user?: AuthUser): JenisAnggotaOption {
  const nrp = member?.nrp || user?.nrp || '';
  const pangkat = member?.pangkat || user?.pangkat || '';
  if (nrp === '98010710' || BINTARA_TAMTAMA_RANKS.includes(pangkat)) {
    return 'ANGGOTA POLRI';
  }
  if (pangkat.toUpperCase().includes('ASN') || pangkat.toUpperCase().includes('PNS')) {
    return 'ASN / PNS POLRI';
  }
  if (member?.tipeSatker === 'PURNA TUGAS' || member?.polda === 'PURNA TUGAS') {
    return 'PURNAWIRAWAN POLRI';
  }
  const raw = member?.jenisAnggota as string | undefined;
  if (
    raw === 'ALUMNI AKPOL 1996' ||
    raw === 'ASN / PNS POLRI' ||
    raw === 'PURNAWIRAWAN POLRI' ||
    raw === 'ANGGOTA POLRI'
  ) {
    return raw;
  }
  return 'ANGGOTA POLRI';
}

export const FormWizard: React.FC<FormWizardProps> = ({
  onSave,
  onCancel,
  currentUser,
  existingMember,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [penyakitLainnya, setPenyakitLainnya] = useState('');
  const [isSatkerModalOpen, setIsSatkerModalOpen] = useState(false);
  const [avatarCleared, setAvatarCleared] = useState(false);
  const [isExternalJabatan, setIsExternalJabatan] = useState(false);

  // Form State initialized from existing member or defaults
  const [formData, setFormData] = useState<FormWizardData>({
    jenisAnggota: 'ANGGOTA POLRI',
    tipeSatker: 'MABES',
    satkerMabes: 'BARESKRIM POLRI',
    subSatker: '',
    satuanKerja: 'Bareskrim Polri',
    namaPolres: '',
    namaPolsek: '',
    pangkat: 'Kombes Pol',
    polda: 'MABES POLRI',
    pendidikanTerakhir: '',
    jenisKelamin: 'LAKI-LAKI',
    statusTempatTinggal: 'MILIK PRIBADI',
    statusPerkawinan: 'MENIKAH',
    jumlahAnak: 0,
    daftarAnak: [],
    daftarAdc: [],
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
    setAvatarCleared(false);
    if (existingMember) {
      const isSelf = existingMember.nrp === currentUser.nrp;
      const resolvedKind = resolveDefaultJenisAnggota(existingMember, isSelf ? currentUser : undefined);
      const calc58 = calculateRetirement58(existingMember.tanggalLahir, existingMember.nrp);

      // Build initial daftarAdc from existingMember.daftarAdc or migrate legacy kontakAdc/namaAdc
      let initialDaftarAdc: AdcPersonel[] = [];
      if (Array.isArray(existingMember.daftarAdc) && existingMember.daftarAdc.length > 0) {
        initialDaftarAdc = existingMember.daftarAdc;
      } else if (existingMember.kontakAdc?.trim() || existingMember.namaAdc?.trim()) {
        const raw = (existingMember.kontakAdc || '').trim();
        const parts = raw.split(/\s*-\s*|\s*•\s*/);
        initialDaftarAdc = [
          {
            id: 'adc-init-1',
            nama: existingMember.namaAdc?.trim() || parts[0] || '',
            nrp: '',
            pangkat: 'Briptu',
            jabatan: 'ADC / Ajudan',
            tanggalLahir: '',
            noHp: parts.length > 1 ? parts.slice(1).join(' ') : raw,
            email: '',
          },
        ];
      }

      const cleanedJabatan = cleanJabatanOnly(existingMember.jabatanTerakhir) || existingMember.jabatanTerakhir || '';
      const isExt = existingMember.tipeSatker === 'KEMEN/LEMBAGA';
      setIsExternalJabatan(isExt);

      setFormData({
        ...existingMember,
        tempatLahir: existingMember.tempatLahir || 'Jakarta',
        tanggalLahir: calc58.tanggalLahir,
        usia: calc58.usiaTahun,
        tahunPurnaTugas: calc58.tahunPurnaTugas,
        sisaTahunDinas: calc58.sisaTahunDinas,
        jabatanTerakhir: cleanedJabatan,
        jenisAnggota: resolvedKind,
        daftarAdc: initialDaftarAdc,
        tipeSatker:
          existingMember.tipeSatker ||
          (existingMember.polda?.toUpperCase().includes('MABES') ? 'MABES' : 'POLDA'),
        pendidikanTerakhir:
          existingMember.pendidikanTerakhir ||
          (existingMember.nrp === '98010710' ? 'S1 Teknik Informatika' : 'Akpol 1996 / Sespimti'),
        fotoUrl: isSelf
          ? resolveAvatarUrl(existingMember.fotoUrl, currentUser.fotoUrl)
          : getAvatarUrl(existingMember.fotoUrl),
        coverUrl: existingMember.coverUrl || (isSelf ? currentUser.coverUrl : undefined),
        email:
          existingMember.email ||
          (isSelf ? currentUser.email : undefined) ||
          (existingMember.nrp ? `${existingMember.nrp}@polri.go.id` : ''),
        secondaryEmail:
          existingMember.secondaryEmail ||
          (isSelf ? currentUser.secondaryEmail : undefined) ||
          (existingMember.nrp === '98010710' ? 'agungkrisdianto98@gmail.com' : ''),
        bio: existingMember.bio || (isSelf ? currentUser.bio : '') || '',
      });

      // Extract any custom diseases not in DAFTAR_PENYAKIT
      if (existingMember.daftarPenyakit && existingMember.daftarPenyakit.length > 0) {
        const custom = existingMember.daftarPenyakit.filter((p) => !DAFTAR_PENYAKIT.includes(p));
        setPenyakitLainnya(custom.length > 0 ? custom.join(', ') : '');
      } else {
        setPenyakitLainnya('');
      }
    } else if (currentUser.role === 'ANGGOTA') {
      const resolvedKind = resolveDefaultJenisAnggota(undefined, currentUser);
      const calc58 = calculateRetirement58(undefined, currentUser.nrp);
      setFormData((prev) => ({
        ...prev,
        nrp: currentUser.nrp,
        namaLengkap: currentUser.nama,
        pangkat: currentUser.pangkat,
        tempatLahir: 'Jakarta',
        tanggalLahir: calc58.tanggalLahir,
        usia: calc58.usiaTahun,
        tahunPurnaTugas: calc58.tahunPurnaTugas,
        sisaTahunDinas: calc58.sisaTahunDinas,
        jenisAnggota: resolvedKind,
        satuanKerja: currentUser.satker || 'Bareskrim Polri',
        polda: currentUser.polda || 'MABES POLRI',
        fotoUrl: resolveAvatarUrl(currentUser.fotoUrl),
        coverUrl: currentUser.coverUrl,
        email: currentUser.email || (currentUser.nrp ? `${currentUser.nrp}@polri.go.id` : ''),
        secondaryEmail: currentUser.secondaryEmail || '',
        bio: currentUser.bio || '',
        daftarAdc: [],
      }));
    } else {
      // Clean form for adding new member
      const calc58 = calculateRetirement58('1974-01-01', '');
      setFormData((prev) => ({
        ...prev,
        id: undefined,
        nrp: '',
        namaLengkap: '',
        tempatLahir: 'Jakarta',
        tanggalLahir: calc58.tanggalLahir,
        usia: calc58.usiaTahun,
        tahunPurnaTugas: calc58.tahunPurnaTugas,
        sisaTahunDinas: calc58.sisaTahunDinas,
        jenisAnggota: 'ANGGOTA POLRI',
        jabatanTerakhir: '',
        satuanKerja: 'Bareskrim Polri',
        polda: 'MABES POLRI',
        subSatker: '',
        pendidikanTerakhir: '',
        noHp: '',
        email: '',
        secondaryEmail: '',
        bio: '',
        fotoUrl: DEFAULT_AVATAR_URL,
        coverUrl: undefined,
        daftarAdc: [],
      }));
      setPenyakitLainnya('');
    }
  }, [existingMember, currentUser]);

  const retirementCalc = React.useMemo(
    () => calculateRetirement58(formData.tanggalLahir, formData.nrp),
    [formData.tanggalLahir, formData.nrp]
  );

  const handleInputChange = (
    field: keyof FormWizardData,
    value: string | number | string[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBirthDateChange = (newBirthDate: string) => {
    const calc = calculateRetirement58(newBirthDate, formData.nrp);
    setFormData((prev) => ({
      ...prev,
      tanggalLahir: newBirthDate,
      usia: calc.usiaTahun,
      tahunPurnaTugas: calc.tahunPurnaTugas,
      sisaTahunDinas: calc.sisaTahunDinas,
    }));
  };

  const handleAddAdc = () => {
    const newAdc: AdcPersonel = {
      id: 'adc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      nama: '',
      nrp: '',
      pangkat: 'Briptu',
      jabatan: 'ADC / Ajudan',
      tanggalLahir: '',
      noHp: '',
      email: '',
    };
    setFormData((prev) => ({
      ...prev,
      daftarAdc: [...(prev.daftarAdc || []), newAdc],
    }));
  };

  const handleRemoveAdc = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.daftarAdc || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        daftarAdc: updated,
      };
    });
  };

  const handleUpdateAdc = (index: number, field: keyof AdcPersonel, value: string) => {
    setFormData((prev) => {
      const updated = [...(prev.daftarAdc || [])];
      const currentItem = updated[index];
      if (!currentItem) return prev;
      const nextItem: AdcPersonel = { ...currentItem, [field]: value };
      // Auto-fill official email and birth date when NRP is typed
      if (field === 'nrp') {
        const cleanNrp = value.replace(/\s+/g, '');
        const oldAutoEmail = currentItem.nrp ? `${currentItem.nrp.replace(/\s+/g, '')}@polri.go.id` : '';
        if (!currentItem.email || currentItem.email === oldAutoEmail) {
          nextItem.email = cleanNrp ? `${cleanNrp}@polri.go.id` : '';
        }
        if (!currentItem.tanggalLahir && cleanNrp.length >= 4) {
          nextItem.tanggalLahir = deriveBirthDateFromNrp(cleanNrp);
        }
      }
      updated[index] = nextItem;
      return { ...prev, daftarAdc: updated };
    });
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

    const derivedPolda = formData.polda || 'MABES POLRI';
    const derivedSatker =
      formData.satuanKerja ||
      (formData.subSatker
        ? `${formData.subSatker} - ${formData.satkerMabes || derivedPolda}`
        : formData.satkerMabes || derivedPolda);

    const combinedDiseases = [...(formData.daftarPenyakit || [])];
    if (penyakitLainnya.trim()) {
      const customList = penyakitLainnya
        .split(',')
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean);
      customList.forEach((d) => {
        if (!combinedDiseases.includes(d)) {
          combinedDiseases.push(d);
        }
      });
    }

    const finalFotoUrl = avatarCleared
      ? DEFAULT_AVATAR_URL
      : resolveAvatarUrl(formData.fotoUrl, existingMember?.fotoUrl);

    const validAdcList = (formData.daftarAdc || []).filter(
      (a) => a.nama.trim().length > 0 || a.noHp.trim().length > 0
    );
    const syncedKontakAdc =
      validAdcList.length > 0
        ? validAdcList
            .map((a) => `${a.pangkat ? a.pangkat + ' ' : ''}${a.nama}${a.noHp ? ' - ' + a.noHp : ''}`.trim())
            .join(' • ')
        : '';
    const syncedNamaAdc =
      validAdcList.length > 0
        ? validAdcList.map((a) => `${a.pangkat ? a.pangkat + ' ' : ''}${a.nama}`.trim()).join(', ')
        : '';

    const finalCalc58 = calculateRetirement58(formData.tanggalLahir, formData.nrp);

    const memberToSave: AnggotaWiraSatya = {
      id: existingMember?.id || 'ws-' + (formData.nrp || Date.now()),
      nrp: formData.nrp || '',
      namaLengkap: formData.namaLengkap || '',
      pangkat: formData.pangkat || 'Kombes Pol',
      jabatanTerakhir: cleanJabatanOnly(formData.jabatanTerakhir) || formData.jabatanTerakhir || '',
      satuanKerja: derivedSatker,
      tipeSatker:
        formData.tipeSatker || (derivedPolda === 'MABES POLRI' ? 'MABES' : 'POLDA'),
      satkerMabes: formData.satkerMabes || '',
      subSatker: formData.subSatker || '',
      namaPolres: formData.namaPolres || '',
      namaPolsek: formData.namaPolsek || '',
      jenisAnggota: (formData.jenisAnggota || 'ANGGOTA POLRI') as AnggotaWiraSatya['jenisAnggota'],
      polda: derivedPolda,
      pendidikanTerakhir: formData.pendidikanTerakhir || '',
      nomorKtp: formData.nomorKtp || '',
      tempatLahir: formData.tempatLahir || 'Jakarta',
      tanggalLahir: finalCalc58.tanggalLahir,
      usia: finalCalc58.usiaTahun,
      jenisKelamin: formData.jenisKelamin || 'LAKI-LAKI',
      noHp: formData.noHp || '',
      email: formData.email || `${formData.nrp}@polri.go.id`,
      secondaryEmail: formData.secondaryEmail || '',
      kontakAdc: syncedKontakAdc,
      namaAdc: syncedNamaAdc,
      daftarAdc: validAdcList,
      fotoUrl: finalFotoUrl,
      coverUrl: formData.coverUrl,
      bio: formData.bio || '',
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

      tahunPurnaTugas: finalCalc58.tahunPurnaTugas,
      sisaTahunDinas: finalCalc58.sisaTahunDinas,
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

      adaPenyakitKronis:
        combinedDiseases.length > 0 ? 'ADA' : formData.adaPenyakitKronis || 'TIDAK ADA',
      kondisiKesehatan: formData.kondisiKesehatan || 'BAIK',
      daftarPenyakit: combinedDiseases,
      lamaMenderita: formData.lamaMenderita || '',
      kondisiSaatIni: formData.kondisiSaatIni || '',
      penangananPengobatan: formData.penangananPengobatan || '',
      biayaPengobatanDitanggung:
        formData.biayaPengobatanDitanggung || 'DITANGGUNG BPJS/ASURANSI',
      asuransiAktif: formData.asuransiAktif || ['BPJS'],
      rutinMcu: formData.rutinMcu || 'YA',
      mcuTerakhir: formData.mcuTerakhir || '< 6 BULAN',
      harapanLayananKesehatan: formData.harapanLayananKesehatan || '',
      harapanDukunganLeting: formData.harapanDukunganLeting || '',

      createdAt: existingMember?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Sync to ws96_auth_user if editing own profile
    if (memberToSave.nrp === currentUser.nrp && typeof window !== 'undefined') {
      try {
        const rawAuth = localStorage.getItem('ws96_auth_user');
        const parsedAuth = rawAuth ? JSON.parse(rawAuth) : currentUser;
        const updatedAuth: AuthUser = {
          ...parsedAuth,
          nama: memberToSave.namaLengkap,
          pangkat: memberToSave.pangkat,
          fotoUrl: memberToSave.fotoUrl,
          coverUrl: memberToSave.coverUrl,
          bio: memberToSave.bio,
          email: memberToSave.email || parsedAuth.email,
          secondaryEmail: memberToSave.secondaryEmail,
          satker: memberToSave.satuanKerja,
          polda: memberToSave.polda,
        };
        localStorage.setItem('ws96_auth_user', JSON.stringify(updatedAuth));
        localStorage.setItem('ws96_active_user', JSON.stringify(updatedAuth));
        localStorage.setItem('wirasatya96_current_user', JSON.stringify(updatedAuth));
        window.dispatchEvent(new Event('ws96_user_updated'));
      } catch {
        // Ignore storage errors
      }
    }

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
          Perubahan data profil, kedinasan, dan keluarga telah disimpan serta disinkronkan ke direktori portal.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-sm font-bold shadow-md transition-colors"
          >
            Selesai &amp; Kembali
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Kedinasan & Kontak', icon: Shield },
    { num: 2, title: 'Keluarga', icon: Users },
    { num: 3, title: 'Purna Tugas', icon: Home },
    { num: 4, title: 'Kesehatan', icon: Activity },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 md:pb-12">
      {/* Compact Header & Stepper */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-polri-navy truncate">
              {existingMember ? 'Edit Profil & Data Personel' : 'Tambah Data Personel'}
            </h2>
            <span
              title="Formulir pembaruan identitas kedinasan, kontak, keluarga, purna tugas, dan kesehatan personel"
              className="inline-flex items-center text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0"
            >
              <Info className="w-4 h-4" />
            </span>
            {currentUser.role === 'ANGGOTA' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 hidden sm:inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> Mandiri
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full flex-shrink-0">
            Langkah {currentStep}/4
          </span>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-4 gap-2 pt-3.5">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-polri-navy text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold truncate max-w-full">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6"
      >
        {/* STEP 1: KEDINASAN & KONTAK */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* SEKSI 1: SATUAN KERJA & JABATAN */}
            <div className="bg-slate-50/70 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-polri-navy flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-polri-gold" />
                  1. Satuan Kerja &amp; Jabatan
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-polri-navy/10 text-polri-navy">
                  Standar SIPP Polri
                </span>
              </div>

              {/* Korps Personel, Pangkat & Pendidikan Terakhir */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Korps / Kategori Personel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.jenisAnggota || 'ANGGOTA POLRI'}
                    onChange={(e) => handleInputChange('jenisAnggota', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  >
                    <option value="ANGGOTA POLRI">Personel Polri Aktif</option>
                    <option value="ALUMNI AKPOL 1996">Perwira Polri (Alumni Akpol 1996)</option>
                    <option value="ASN / PNS POLRI">ASN / PNS Polri</option>
                    <option value="PURNAWIRAWAN POLRI">Purnawirawan / Purna Tugas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pangkat Terakhir <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pangkat || 'Kombes Pol'}
                    onChange={(e) => {
                      const nextPangkat = e.target.value;
                      handleInputChange('pangkat', nextPangkat);
                      if (!isExternalJabatan) {
                        const nextGroups = getJabatanGroupsForPangkat(nextPangkat, formData.nrp);
                        const allNextOptions = nextGroups.flatMap((g) => g.options);
                        const curJab = (formData.jabatanTerakhir || '').trim();
                        if (!isOfficerRankIpdaUp(nextPangkat)) {
                          if (!allNextOptions.includes(curJab)) {
                            handleInputChange('jabatanTerakhir', allNextOptions[0] || 'Staf');
                          }
                        } else if (!curJab) {
                          handleInputChange('jabatanTerakhir', allNextOptions[0] || 'Kombes Pol');
                        }
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  >
                    {DAFTAR_PANGKAT_POLRI.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: S1 Teknik Informatika / Akpol 1996"
                    value={formData.pendidikanTerakhir || ''}
                    onChange={(e) => handleInputChange('pendidikanTerakhir', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>
              </div>

              {/* Satker Melekat (Pilih Satker Berjenjang) & Jabatan Organisasi Polri Saat Ini */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2.5">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[11px] font-bold text-slate-600">
                      Satker Melekat &amp; Wilayah <span className="text-red-500">*</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {formData.satuanKerja || 'Bareskrim Polri'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-polri-navy/10 text-polri-navy border border-polri-navy/20">
                        {formData.polda || 'MABES POLRI'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSatkerModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all flex-shrink-0 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Pilih Satker</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Jabatan Organisasi Polri Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      {isOfficerRankIpdaUp(formData.pangkat)
                        ? `Standar ${formData.pangkat}`
                        : 'Staf / ADC'}
                    </span>
                  </div>

                  {(() => {
                    const groups = getJabatanGroupsForPangkat(formData.pangkat, formData.nrp);
                    const curJab = (formData.jabatanTerakhir || '').trim();
                    const isCurInStandard = isStandardPolriJabatan(curJab, formData.pangkat, formData.nrp);
                    const isOfficer = isOfficerRankIpdaUp(formData.pangkat);
                    const selectValue = isExternalJabatan
                      ? EXTERNAL_JABATAN_SENTINEL
                      : isCurInStandard
                      ? curJab
                      : isOfficer && curJab
                      ? curJab
                      : groups[0]?.options[0] || 'Staf';

                    return (
                      <>
                        <select
                          value={selectValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === EXTERNAL_JABATAN_SENTINEL) {
                              setIsExternalJabatan(true);
                              if (isStandardPolriJabatan(curJab, formData.pangkat, formData.nrp)) {
                                handleInputChange('jabatanTerakhir', '');
                              }
                            } else {
                              setIsExternalJabatan(false);
                              handleInputChange('jabatanTerakhir', val);
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                        >
                          {!isExternalJabatan && isOfficer && curJab && !isCurInStandard && (
                            <optgroup label="Jabatan Tersimpan Saat Ini">
                              <option value={curJab}>{curJab}</option>
                            </optgroup>
                          )}
                          {groups.map((grp) => (
                            <optgroup key={grp.group} label={grp.group}>
                              {grp.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          <optgroup label="Penugasan Luar Struktur (Eksternal Polri)">
                            <option value={EXTERNAL_JABATAN_SENTINEL}>
                              Penugasan Luar Struktur (Eksternal Polri) — Tulis Sendiri
                            </option>
                          </optgroup>
                        </select>

                        {isExternalJabatan ? (
                          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1">
                            <label className="block text-[11px] font-bold text-amber-900">
                              Ketik Nama Jabatan Eksternal (Luar Struktur Polri) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Contoh: Deputi Pemberantasan BNN / Direktur Penyidikan KPK / Staf Ahli Kementerian..."
                              value={formData.jabatanTerakhir || ''}
                              onChange={(e) => handleInputChange('jabatanTerakhir', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                            />
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {isOfficer
                              ? 'Pilihan jabatan distandarisasi sesuai pangkat (Perpol 4/2025 & SOTK Kewilayahan). Pilih Eksternal Polri jika penugasan di luar struktur.'
                              : 'Untuk pangkat selain IPDA ke atas di dalam struktur Polri cukup pilih Staf atau ADC (atau pilih Eksternal Polri untuk ketik sendiri).'}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* SEKSI 2: IDENTITAS PRIBADI & KONTAK */}
            <div className="bg-slate-50/70 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-polri-navy flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-polri-gold" />
                2. Identitas Pribadi &amp; Kontak
              </span>

              {/* Dual Compact Grid: Foto Profil & Gambar Sampul */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Foto Profil Card */}
                <div className="flex items-center gap-3.5 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-polri-gold bg-slate-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAvatarUrl(formData.fotoUrl)}
                      alt="Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800">Foto Profil</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded-lg bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Unggah</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const resized = await resizeImageFile(
                                file,
                                'AVATAR',
                                currentUser.nrp,
                                formData.nrp || currentUser.nrp
                              );
                              setAvatarCleared(false);
                              handleInputChange('fotoUrl', resized);
                            } catch {
                              // ignore
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formData.fotoUrl && formData.fotoUrl !== DEFAULT_AVATAR_URL && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarCleared(true);
                            handleInputChange('fotoUrl', DEFAULT_AVATAR_URL);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-[11px] font-semibold transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gambar Sampul (Cover Banner) Card */}
                <div className="flex items-center gap-3.5 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getCoverUrl(formData.coverUrl)}
                      alt="Sampul Profil"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800">Gambar Sampul</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Sampul</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const resized = await resizeImageFile(
                                file,
                                'COVER',
                                currentUser.nrp,
                                formData.nrp || currentUser.nrp
                              );
                              handleInputChange('coverUrl', resized);
                            } catch {
                              // ignore
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formData.coverUrl && formData.coverUrl !== DEFAULT_COVER_URL && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('coverUrl', undefined)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-[11px] font-semibold transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Eko Agung Krisdianto, S.Kom."
                    value={formData.namaLengkap || ''}
                    onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NRP / NIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={currentUser.role === 'ANGGOTA' && !!existingMember}
                    placeholder="Contoh: 98010710"
                    value={formData.nrp || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange('nrp', val);
                      if (
                        (!formData.tanggalLahir || formData.tanggalLahir === '1974-01-01') &&
                        val.replace(/[^0-9]/g, '').length >= 4
                      ) {
                        handleBirthDateChange(deriveBirthDateFromNrp(val));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none ${
                      currentUser.role === 'ANGGOTA' && existingMember
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                        : ''
                    }`}
                  />
                  {currentUser.role === 'ANGGOTA' && existingMember && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      NRP terkunci sebagai identitas utama akun.
                    </span>
                  )}
                </div>

                {/* Tempat Lahir & Tanggal Lahir (Terkait Hitungan Usia Pensiun 58 Tahun) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta / Surabaya / Bandung"
                    value={formData.tempatLahir || ''}
                    onChange={(e) => handleInputChange('tempatLahir', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      Usia: {retirementCalc.usiaLabel}
                    </span>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={formData.tanggalLahir || retirementCalc.tanggalLahir}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Banner: Hitungan Otomatis Usia Pensiun 58 Tahun (BUP Polri) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-polri-navy to-slate-900 text-white border border-polri-gold/30 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-polri-gold flex-shrink-0" />
                      <span className="text-xs font-extrabold tracking-wide text-polri-gold uppercase">
                        Kalkulasi Otomatis Pensiun Polri (BUP {RETIREMENT_AGE_POLRI} Tahun)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                      Lahir: {retirementCalc.formattedTanggalLahir}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-300 block">Usia Saat Ini</span>
                      <span className="font-extrabold text-white text-sm">
                        {retirementCalc.usiaLabel}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-300 block">
                        Jatuh Tempo Pensiun (Usia {RETIREMENT_AGE_POLRI} Thn)
                      </span>
                      <span className="font-extrabold text-amber-300 text-sm">
                        Tahun {retirementCalc.tahunPurnaTugas}{' '}
                        <span className="text-[11px] font-normal text-slate-200">
                          ({retirementCalc.formattedTanggalPensiun})
                        </span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-300 block">
                        Sisa Masa Dinas menuju {RETIREMENT_AGE_POLRI} Tahun
                      </span>
                      <span
                        className={`font-extrabold text-sm ${
                          retirementCalc.isPurnaTugas ? 'text-red-300' : 'text-emerald-300'
                        }`}
                      >
                        {retirementCalc.sisaMasaDinasLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Dinas (@polri.go.id)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="Contoh: 98010710@polri.go.id"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Sekunder / Pribadi (Opsional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="Contoh: nama@gmail.com"
                      value={formData.secondaryEmail || ''}
                      onChange={(e) => handleInputChange('secondaryEmail', e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.noHp || ''}
                    onChange={(e) => handleInputChange('noHp', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Tempat Tinggal Saat Ini
                  </label>
                  <select
                    value={formData.statusTempatTinggal || 'MILIK PRIBADI'}
                    onChange={(e) => handleInputChange('statusTempatTinggal', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  >
                    <option value="MILIK PRIBADI">MILIK PRIBADI</option>
                    <option value="RUMAH KELUARGA">RUMAH KELUARGA</option>
                    <option value="DINAS">DINAS</option>
                    <option value="SEWA/KONTRAK">SEWA/KONTRAK</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Domisili Saat Ini
                  </label>
                  <input
                    type="text"
                    placeholder="Kota / Alamat domisili saat ini..."
                    value={formData.alamatTempatTinggal || ''}
                    onChange={(e) => handleInputChange('alamatTempatTinggal', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ringkasan Profil / Bio
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ringkasan singkat penugasan, keahlian, atau riwayat kedinasan..."
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>
              </div>

              {/* Rincian Data ADC / Ajudan / Spri (Dynamic Repeatable Identity Cards like Tambah Anak) */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800">
                      Data ADC / Ajudan / Spri (Opsional)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Identitas personel pendamping untuk koordinasi kedinasan
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAdc}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-polri-navy text-polri-gold text-xs font-bold hover:bg-polri-navyLight transition-colors cursor-pointer flex-shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah ADC</span>
                  </button>
                </div>

                {(!formData.daftarAdc || formData.daftarAdc.length === 0) && (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white/70 text-center text-xs text-slate-400">
                    Belum ada data ADC / Ajudan. Klik &ldquo;Tambah ADC&rdquo; jika memiliki personel pendamping.
                  </div>
                )}

                {formData.daftarAdc?.map((adc, idx) => {
                  const adcCalc = adc.tanggalLahir
                    ? calculateRetirement58(adc.tanggalLahir, adc.nrp)
                    : null;
                  return (
                    <div
                      key={adc.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-extrabold text-polri-navy flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-polri-gold" />
                          <span>ADC / Ajudan ke-{idx + 1}</span>
                          {adcCalc && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Usia: {adcCalc.usiaTahun} Thn
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdc(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Nama Lengkap &amp; Gelar ADC <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Aryo Pratama, S.H."
                            value={adc.nama}
                            onChange={(e) => handleUpdateAdc(idx, 'nama', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            NRP / NIP ADC
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: 99040123"
                            value={adc.nrp || ''}
                            onChange={(e) => handleUpdateAdc(idx, 'nrp', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Pangkat / Golongan ADC
                          </label>
                          <select
                            value={adc.pangkat || 'Briptu'}
                            onChange={(e) => handleUpdateAdc(idx, 'pangkat', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          >
                            {DAFTAR_PANGKAT_POLRI.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Tanggal Lahir ADC
                          </label>
                          <input
                            type="date"
                            value={adc.tanggalLahir || ''}
                            onChange={(e) => handleUpdateAdc(idx, 'tanggalLahir', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Peran / Jabatan Pendamping
                          </label>
                          <select
                            value={adc.jabatan || 'ADC / Ajudan'}
                            onChange={(e) => handleUpdateAdc(idx, 'jabatan', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          >
                            <option value="ADC / Ajudan">ADC / Ajudan</option>
                            <option value="Spri / Sekpri">Spri / Sekpri</option>
                            <option value="Walpri">Walpri</option>
                            <option value="Staf Pribadi">Staf Pribadi</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Nomor WhatsApp Aktif ADC <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="0812-xxxx-xxxx"
                            value={adc.noHp}
                            onChange={(e) => handleUpdateAdc(idx, 'noHp', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Email Dinas / Pribadi ADC
                          </label>
                          <input
                            type="email"
                            placeholder="Contoh: 99040123@polri.go.id"
                            value={adc.email || ''}
                            onChange={(e) => handleUpdateAdc(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: KELUARGA */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b pb-2.5 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-polri-navy flex items-center gap-2">
                <Users className="w-4 h-4 text-polri-gold" />
                Data Keluarga &amp; Tanggungan Anak
              </h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pasangan / Bhayangkari</label>
                <input
                  type="text"
                  placeholder="Contoh: Ny. Dewi Hadi Wicaksono"
                  value={formData.namaIstri || ''}
                  onChange={(e) => handleInputChange('namaIstri', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir Pasangan</label>
                <input
                  type="date"
                  value={formData.tanggalLahirIstri || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleInputChange('tanggalLahirIstri', val);
                    if (val) {
                      const c = calculateRetirement58(val);
                      handleInputChange('usiaIstri', c.usiaTahun);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kontak Pasangan / Keluarga</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={formData.kontakIstri || ''}
                  onChange={(e) => handleInputChange('kontakIstri', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
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
                  Data Putra / Putri &amp; Pendidikan
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

              {(!formData.daftarAnak || formData.daftarAnak.length === 0) && (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Belum ada data anak. Klik &ldquo;Tambah Anak&rdquo; jika ingin menambahkan.
                </div>
              )}

              {formData.daftarAnak?.map((anak, idx) => (
                <div key={anak.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Anak ke-{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(idx)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Nama Anak
                      </label>
                      <input
                        type="text"
                        placeholder="Nama Lengkap Anak"
                        value={anak.nama}
                        onChange={(e) => handleUpdateChild(idx, 'nama', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-polri-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Tanggal Lahir Anak
                      </label>
                      <input
                        type="date"
                        value={anak.tanggalLahir || ''}
                        onChange={(e) => handleUpdateChild(idx, 'tanggalLahir', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-polri-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Status Kegiatan
                      </label>
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
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Estimasi Biaya Pendidikan
                      </label>
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

        {/* STEP 3: PURNA TUGAS */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b pb-2.5 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-polri-navy flex items-center gap-2">
                <Home className="w-4 h-4 text-polri-gold" />
                Persiapan Purna Tugas &amp; Rencana Usaha
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                BUP Polri: {RETIREMENT_AGE_POLRI} Tahun
              </span>
            </div>

            {/* Kartu Kalkulasi Usia Pensiun 58 Tahun Otomatis dari Tanggal Lahir */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-polri-navy block">
                    Hitungan Otomatis Pensiun di Usia {RETIREMENT_AGE_POLRI} Tahun
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Dihitung otomatis dari Tanggal Lahir personel ({retirementCalc.formattedTanggalLahir})
                  </span>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-polri-navy text-polri-gold">
                  Pensiun: {retirementCalc.tahunPurnaTugas} ({retirementCalc.sisaMasaDinasShort})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tanggal Lahir Personel
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir || retirementCalc.tanggalLahir}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-polri-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tahun Purna Tugas (Usia {RETIREMENT_AGE_POLRI} Thn)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={retirementCalc.tahunPurnaTugas}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs font-extrabold text-slate-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sisa Masa Dinas Aktif
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${retirementCalc.sisaMasaDinasLabel} (Usia kini ${retirementCalc.usiaTahun} Thn)`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs font-extrabold text-emerald-800 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Rencana Domisili Purna Tugas</label>
                <input
                  type="text"
                  placeholder="Kota / Wilayah rencana domisili pensiun..."
                  value={formData.alamatPurnaTugas || ''}
                  onChange={(e) => handleInputChange('alamatPurnaTugas', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rencana Jenis Usaha / Aktivitas</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Kebutuhan Dukungan Paguyuban</label>
                <select
                  value={formData.kebutuhanPembekalan?.[0] || 'PELATIHAN'}
                  onChange={(e) => handleInputChange('kebutuhanPembekalan', [e.target.value])}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
                >
                  <option value="MODAL">Bantuan Akses Modal</option>
                  <option value="PELATIHAN">Pelatihan Kewirausahaan</option>
                  <option value="PENDAMPINGAN">Pendampingan Usaha</option>
                  <option value="TIDAK PERLU">Tidak Perlu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kesiapan Menghadapi Purna Tugas</label>
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

        {/* STEP 4: KESEHATAN */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b pb-2.5 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-polri-navy flex items-center gap-2">
                <Activity className="w-4 h-4 text-polri-gold" />
                Riwayat Kesehatan &amp; Kesejahteraan
              </h3>
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
                Riwayat Diagnosa Medis (Opsional):
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
                <label className="block text-xs font-bold text-amber-950">
                  Diagnosa Lainnya (Pisahkan dengan koma):
                </label>
              </div>
              <input
                type="text"
                placeholder="Contoh: GERD, Vertigo..."
                value={penyakitLainnya}
                onChange={(e) => setPenyakitLainnya(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-amber-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kondisi Terkini &amp; Penanganan Medis
              </label>
              <textarea
                rows={2}
                placeholder="Rincian kondisi kesehatan atau obat rutin..."
                value={formData.kondisiSaatIni || ''}
                onChange={(e) => handleInputChange('kondisiSaatIni', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-polri-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Harapan Dukungan Kesejahteraan
              </label>
              <textarea
                rows={2}
                placeholder="Pesan atau harapan silaturahmi..."
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

      {/* CAS-Style Satker Berjenjang Modal */}
      <SatkerBerjenjangModal
        isOpen={isSatkerModalOpen}
        onClose={() => setIsSatkerModalOpen(false)}
        initialPolda={formData.polda || 'MABES POLRI'}
        initialSatker={formData.satkerMabes || ''}
        initialSubSatker={formData.subSatker || ''}
        onApply={(result) => {
          const isKemen =
            result.polda === 'KEMEN/LEMBAGA' ||
            result.satkerUtama?.toUpperCase().includes('LUAR STRUKTUR') ||
            result.satkerUtama?.toUpperCase().includes('EKSTERNAL');
          if (isKemen) {
            setIsExternalJabatan(true);
          }
          setFormData((prev) => ({
            ...prev,
            polda: result.polda,
            satuanKerja: result.composedSatker,
            satkerMabes: result.satkerUtama,
            subSatker: result.subSatker,
            tipeSatker: isKemen
              ? 'KEMEN/LEMBAGA'
              : result.polda === 'MABES POLRI'
              ? 'MABES'
              : 'POLDA',
          }));
        }}
      />
    </div>
  );
};
