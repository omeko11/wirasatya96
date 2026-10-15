'use client';

import React from 'react';
import { 
  AnggotaWiraSatya, 
  AuthUser 
} from '@/types';
import { 
  Shield, 
  MapPin, 
  Building2, 
  Phone, 
  Edit3, 
  CheckCircle2, 
  Heart, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Share2, 
  Clock, 
  Home, 
  Award,
  Plus
} from 'lucide-react';

interface LinkedInProfileViewProps {
  member: AnggotaWiraSatya;
  currentUser: AuthUser;
  onEditProfile?: () => void;
  onClose?: () => void;
  allMembers?: AnggotaWiraSatya[];
  onSelectMember?: (member: AnggotaWiraSatya) => void;
}

export const LinkedInProfileView: React.FC<LinkedInProfileViewProps> = ({
  member,
  currentUser,
  onEditProfile,
  onClose,
  allMembers = [],
  onSelectMember,
}) => {
  const isOwner = currentUser.nrp === member.nrp || currentUser.role === 'SUPERADMIN';

  const getWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Direktori%20Alumni%20Akpol%201996`;
  };

  // Find other peers in the same Polda
  const peersInSamePolda = allMembers
    .filter((m) => m.id !== member.id && m.polda === member.polda)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 font-sans text-slate-900 space-y-4">
      
      {/* Top Breadcrumb / Back button if presented inside a modal */}
      {onClose && (
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Direktori Leting</span>
            <span>/</span>
            <span className="font-bold text-slate-900">{member.namaLengkap}</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ← Kembali ke Direktori
          </button>
        </div>
      )}

      {/* Main Grid: Left Column (Profile Canvas) + Right Column (LinkedIn Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* ============================================================== */}
        {/* LEFT / CENTER COLUMN (2 COLS): LINKEDIN MAIN PROFILE FEED      */}
        {/* ============================================================== */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 1. HERO PROFILE CARD (1:1 WITH USER SCREENSHOT 1) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            
            {/* Cover Banner Image with High-Tech / Polri Aesthetics */}
            <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-slate-900 via-polri-navy to-slate-800 relative overflow-hidden">
              {/* Abstract network tech overlay */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute bottom-3 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5 shadow-lg">
                  <Shield className="w-3.5 h-3.5" />
                  BATALYON WIRA SATYA 1996 • #SELALUBAHAGIA
                </span>
                {isOwner && (
                  <button
                    onClick={onEditProfile}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur transition-all"
                    title="Edit Sampul Profil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Avatar & Headline Info Section */}
            <div className="px-6 pb-6 pt-0 relative">
              
              {/* Profile Avatar overlapping banner */}
              <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                    alt={member.namaLengkap}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl bg-slate-100"
                  />
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center absolute bottom-2 right-2 border-2 border-white shadow font-bold text-xs" title="Terverifikasi Alumni Akpol 1996">
                    ✓
                  </span>
                </div>

                {isOwner && (
                  <button
                    onClick={onEditProfile}
                    className="p-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Edit Profil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name, Headline, & Affiliations */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {member.namaLengkap}
                    </h1>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      Perwira Polri
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 leading-snug">
                    {member.jabatanTerakhir} — {member.satuanKerja}
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.polda} • NRP {member.nrp}</span>
                    <span>&bull;</span>
                    <span className="text-red-900 font-semibold hover:underline cursor-pointer">
                      Info Kontak Leting
                    </span>
                  </p>

                  <p className="text-xs text-red-900 font-bold hover:underline cursor-pointer pt-0.5">
                    286 rekan leting terhubung (Akpol 1996)
                  </p>
                </div>

                {/* Right Side Institution Logos (matching LinkedIn profile) */}
                <div className="space-y-2 flex-shrink-0 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <div className="w-7 h-7 rounded bg-red-950 text-amber-400 flex items-center justify-center font-black text-[11px] shadow-sm">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Kepolisian Negara Republik Indonesia</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-800 flex items-center justify-center font-black text-[10px] border border-amber-300">
                      AKPOL
                    </div>
                    <span className="text-xs">Batalyon Wira Satya 1996</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-2 border-t border-slate-100">
                <a
                  href={getWaUrl(member.noHp)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim Pesan WhatsApp</span>
                </a>

                {isOwner ? (
                  <button
                    onClick={onEditProfile}
                    className="px-4 py-2 rounded-full border border-red-800 text-red-900 hover:bg-red-50 font-bold text-xs sm:text-sm transition-colors"
                  >
                    Perbarui Data Profil Saya
                  </button>
                ) : (
                  member.kontakAdc && (
                    <a
                      href={getWaUrl(member.kontakAdc)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>Kontak ADC ({member.namaAdc || 'Ajudan'})</span>
                    </a>
                  )
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${member.namaLengkap} - ${member.pangkat} (NRP: ${member.nrp}) - WA: ${member.noHp}`);
                    alert('Data kontak perwira berhasil disalin ke clipboard!');
                  }}
                  className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Kontak</span>
                </button>
              </div>

              {/* Status Purna & Kesehatan Highlights Card (Suggested For You in LinkedIn) */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Purna Tugas:</span>
                    <span className="font-bold text-slate-900">{member.tahunPurnaTugas} ({member.sisaTahunDinas} Thn Lagi)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Kondisi Kesehatan:</span>
                    <span className="font-bold text-emerald-700">{member.kondisiKesehatan}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Iuran Leting 2026:</span>
                    <span className="font-bold text-amber-800">TERVERIFIKASI AKTIF</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. SECTION: TENTANG / BIOGRAFI KEDINASAN (ABOUT) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Tentang & Pengabdian
              </h2>
              {isOwner && (
                <button onClick={onEditProfile} className="text-slate-400 hover:text-slate-700">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Perwira Polri lulusan Akademi Kepolisian Republik Indonesia Batalyon Wira Satya 1996 (#SelaluBahagia). 
              Saat ini mengemban amanah sebagai <b>{member.jabatanTerakhir}</b> di lingkungan <b>{member.satuanKerja}</b>. 
              Berkomitmen menjaga soliditas leting, dedikasi penugasan Bhayangkara, serta aktif mendukung program kesejahteraan dan kepedulian sosial angkatan.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                🎓 {member.pendidikanTerakhir || 'S-1 / SIK'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                🛡️ Pangkat: {member.pangkat}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                📍 {member.polda}
              </span>
            </div>
          </div>

          {/* SECTION: AKTIVITAS & POSTINGAN (ACTIVITY - MATCHING USER SCREENSHOT 2) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Aktivitas & Postingan Leting
                </h2>
                <p className="text-xs text-red-900 font-semibold mt-0.5">
                  286 Rekan Leting Terhubung
                </p>
              </div>

              {isOwner && (
                <button
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className="px-4 py-1.5 rounded-full border border-red-800 text-red-900 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Postingan di Feed</span>
                </button>
              )}
            </div>

            {/* Post sample card matching LinkedIn Activity UI */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                  alt={member.namaLengkap}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{member.namaLengkap}</span>
                    {isOwner && <span className="text-[10px] text-slate-400 font-medium">&bull; Anda</span>}
                  </div>
                  <p className="text-[10px] text-slate-500">{member.jabatanTerakhir} &bull; 6 jam yang lalu</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Tetap menjaga soliditas Bhayangkara dan silaturahmi satu angkatan Batalyon Wira Satya Akpol 1996. Saling bahu membahu mendukung tugas kedinasan dan kepedulian keluarga leting. Salam hormat #SelaluBahagia!
              </p>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">👍 94 leting menyukai &bull; 8 komentar</span>
                <span className="text-red-900 font-semibold">149 tayangan leting</span>
              </div>
            </div>
          </div>

          {/* 3. SECTION: STRUKTUR KEDINASAN & RIWAYAT SIPP (EXPERIENCE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-polri-navy" />
                Struktur Kedinasan & Penempatan SIPP Polri
              </h2>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Tipe: {member.tipeSatker || 'POLDA'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-polri-navy text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {member.jabatanTerakhir}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700">
                    {member.satuanKerja}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {member.polda} &bull; Sub Satker: <span className="font-semibold text-blue-700">{member.subSatker || '-'}</span>
                  </p>
                  {member.namaPolres && (
                    <p className="text-[11px] text-slate-600">
                      Satwil: {member.namaPolres} {member.namaPolsek ? `— Polsek ${member.namaPolsek}` : ''}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 pt-1">
                    Status Tempat Tinggal Dinas: <b>{member.statusTempatTinggal}</b> ({member.alamatTempatTinggal})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SECTION: DATA KELUARGA & TANGGUNGAN PENDIDIKAN (EDUCATION & FAMILY) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-polri-navy" />
                Data Keluarga & Pendidikan Putra-Putri
              </h2>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Status: {member.statusPerkawinan}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Nama Pasangan / Istri:</span>
                <span className="font-bold text-slate-900">{member.namaIstri || 'Ibu Bhayangkari'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Kontak / No. HP Istri:</span>
                <span className="font-semibold text-slate-900">{member.kontakIstri || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Jumlah Anak / Tanggungan:</span>
                <span className="font-bold text-blue-700">{member.jumlahAnak || 0} Anak</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggungan Lain:</span>
                <span className="font-semibold text-slate-800">{member.tanggunganLain?.jumlah || 0} Orang ({member.tanggunganLain?.rincian || 'Tidak ada'})</span>
              </div>
            </div>

            {/* List of Children */}
            {member.daftarAnak && member.daftarAnak.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Putra-Putri & Beban Pendidikan:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {member.daftarAnak.map((anak, idx) => (
                    <div key={anak.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{anak.nama || `Anak ke-${idx + 1}`}</p>
                          <p className="text-[11px] text-slate-500">{anak.status} • Lahir: {anak.tanggalLahir || '-'}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200">
                        {anak.biayaPendidikanTahunan ? `Biaya: ${anak.biayaPendidikanTahunan}` : 'Pelajar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. SECTION: RIWAYAT KESEHATAN & SOLIDARITAS LETING (HEALTH & CARE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Riwayat Kesehatan & Atensi Solidaritas Leting
              </h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                member.adaPenyakitKronis === 'ADA' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Penyakit Kronis: {member.adaPenyakitKronis}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Kondisi Kesehatan Saat Ini:</span>
                <span className="font-bold text-slate-900">{member.kondisiKesehatan}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Rutin MCU & Terakhir:</span>
                <span className="font-semibold text-slate-900">{member.rutinMcu === 'YA' ? 'Ya (Rutin)' : 'Tidak'} • MCU: {member.mcuTerakhir || '-'}</span>
              </div>
            </div>

            {/* Diagnosa Penyakit (Termasuk Diagnosa Mandiri / Lainnya) */}
            {member.daftarPenyakit && member.daftarPenyakit.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-700 block">
                  Daftar Penyakit / Diagnosa Medis Terpantau:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.daftarPenyakit.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 font-bold text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {member.harapanDukunganLeting && (
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Harapan Dukungan dari Leting Wira Satya:</span>
                <p className="text-slate-700 italic">&ldquo;{member.harapanDukunganLeting}&rdquo;</p>
              </div>
            )}
          </div>

          {/* 6. SECTION: RENCANA PURNA TUGAS & USAHA PASCA DINAS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-polri-goldDark" />
                Persiapan Purna Tugas & Rencana Usaha
              </h2>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Pensiun Tahun {member.tahunPurnaTugas}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Rencana Aktivitas Pasca Purna:</span>
                <span className="font-bold text-slate-900">{(member.rencanaAktivitas || []).join(', ') || 'USAHA SENDIRI'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status Rumah Purna Tugas:</span>
                <span className="font-semibold text-slate-900">{member.statusRumahPurnaTugas}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Kesiapan & Perasaan Pensiun:</span>
                <span className="font-semibold text-slate-900">{member.kesiapanPensiun} ({member.perasaanPensiun})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Kecukupan Dana Pensiun:</span>
                <span className="font-semibold text-slate-900">{member.kecukupanDanaPensiun}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* RIGHT SIDEBAR (1 COL): LINKEDIN WIDGETS & REKAN LETING        */}
        {/* ============================================================== */}
        <div className="space-y-4">
          
          {/* Widget 1: Info Publik & Verifikasi Keanggotaan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-900 text-sm">Verifikasi Keanggotaan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-slate-500 block">ID Direktori Alumni:</span>
              <span className="font-mono font-bold text-slate-800">{member.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status Kepegawaian:</span>
              <span className="font-bold text-polri-navy">PERWIRA POLRI (AKPOL 1996)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Akses Data:</span>
              <span className="text-slate-600">Khusus Anggota Batalyon Wira Satya 1996</span>
            </div>
          </div>

          {/* Widget 2: Rekan Leting di Wilayah / Polda yang Sama (People you may know) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Rekan di {member.polda}</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500">
              Rekan satu leting yang bertugas di wilayah penugasan yang sama:
            </p>

            <div className="space-y-3 pt-1">
              {peersInSamePolda.length > 0 ? (
                peersInSamePolda.map((peer) => (
                  <div key={peer.id} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={peer.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                      alt={peer.namaLengkap}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p 
                        onClick={() => onSelectMember && onSelectMember(peer)}
                        className="text-xs font-bold text-slate-900 truncate hover:text-red-900 cursor-pointer"
                      >
                        {peer.namaLengkap.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{peer.pangkat} &bull; {peer.satuanKerja}</p>
                      <a
                        href={getWaUrl(peer.noHp)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-900 hover:underline"
                      >
                        <Phone className="w-2.5 h-2.5" /> Hubungi WA
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada rekan lain yang terdaftar di wilayah {member.polda}.
                </p>
              )}
            </div>
          </div>

          {/* Widget 3: Status Iuran & Kas Paguyuban Leting */}
          <div className="bg-gradient-to-br from-slate-900 to-polri-navy rounded-2xl p-5 text-white shadow-md space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              PORTAL KEBENDAHARAAN 1996
            </span>
            <h4 className="font-bold text-sm text-white">
              Kepedulian & Solidaritas Leting
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Seluruh data perwira disinkronkan langsung dengan program santunan rekan sakit, bantuan kedukaan, dan dana abadi paguyuban.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-amber-300 font-bold">#SelaluBahagia</span>
              <span className="text-slate-400">Akpol 1996</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
