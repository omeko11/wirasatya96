'use client';

import React, { useState, useMemo } from 'react';
import { AnggotaWiraSatya, DAFTAR_PANGKAT_POLRI } from '@/types';
import { DAFTAR_38_POLDA } from '@/data/polriStructure';
import { 
  Search, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Shield, 
  Briefcase, 
  Home, 
  X, 
  Activity, 
  Users, 
  ChevronRight,
  Filter,
  UserPlus
} from 'lucide-react';

interface BukuSakuProps {
  members: AnggotaWiraSatya[];
  onAddNew: () => void;
}

export const BukuSaku: React.FC<BukuSakuProps> = ({ members, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolda, setSelectedPolda] = useState<string>('SEMUA');
  const [selectedPangkat, setSelectedPangkat] = useState<string>('SEMUA');
  const [selectedMember, setSelectedMember] = useState<AnggotaWiraSatya | null>(null);

  // Extract unique Poldas for filter including all 38 Polda
  const poldaList = useMemo(() => {
    // Show SEMUA first, then existing Poldas, then other Poldas
    const existingPoldas = Array.from(new Set(members.map((m) => m.polda))).filter(Boolean);
    const remainingPoldas = DAFTAR_38_POLDA.filter((p) => !existingPoldas.some((ep) => ep.toUpperCase() === p.toUpperCase()));
    return ['SEMUA', ...existingPoldas, ...remainingPoldas];
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        m.namaLengkap.toLowerCase().includes(search) ||
        m.nrp.includes(searchTerm) ||
        m.jabatanTerakhir.toLowerCase().includes(search) ||
        m.satuanKerja.toLowerCase().includes(search) ||
        (m.subSatker && m.subSatker.toLowerCase().includes(search)) ||
        (m.satkerMabes && m.satkerMabes.toLowerCase().includes(search)) ||
        (m.namaPolres && m.namaPolres.toLowerCase().includes(search)) ||
        (m.namaPolsek && m.namaPolsek.toLowerCase().includes(search));

      const matchPolda = 
        selectedPolda === 'SEMUA' || 
        m.polda.toUpperCase() === selectedPolda.toUpperCase() ||
        (selectedPolda.toUpperCase().includes('MABES') && m.polda.toUpperCase().includes('MABES'));

      const matchPangkat = selectedPangkat === 'SEMUA' || m.pangkat === selectedPangkat;

      return matchSearch && matchPolda && matchPangkat;
    });
  }, [members, searchTerm, selectedPolda, selectedPangkat]);

  const formatWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Direktori%20Wira%20Satya%2096`;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Banner Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-polri-navy via-polri-navyLight to-slate-900 border border-polri-gold/40 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-polri-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-polri-gold/20 border border-polri-gold/40 text-polri-gold text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            Buku Saku Digital Resmi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Direktori Leting Batalyon Wira Satya 1996
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Menghubungkan seluruh rekan alumni Akpol 1996 di seluruh jajaran Polda, Mabes, dan Lemdiklat. 
            Cari penempatan tugas dan terhubung langsung via WhatsApp tanpa perlu simpan nomor.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, pangkat, NRP, jabatan, atau satker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-polri-navy focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters & Add Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Wilayah:</span>
            </div>
            <select
              value={selectedPolda}
              onChange={(e) => setSelectedPolda(e.target.value)}
              className="py-2.5 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
            >
              {poldaList.map((p) => (
                <option key={p} value={p}>
                  {p === 'SEMUA' ? '🌐 Semua Wilayah' : p}
                </option>
              ))}
            </select>

            <select
              value={selectedPangkat}
              onChange={(e) => setSelectedPangkat(e.target.value)}
              className="py-2.5 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-polri-navy"
            >
              <option value="SEMUA">⭐ Semua Pangkat</option>
              {DAFTAR_PANGKAT_POLRI.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-polri-navy text-polri-gold text-xs font-bold hover:bg-polri-navyLight whitespace-nowrap shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Data</span>
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Menampilkan <b>{filteredMembers.length}</b> dari {members.length} perwira terdata
          </span>
          {filteredMembers.length === 0 && (
            <span className="text-red-500 font-medium">Tidak ada hasil yang cocok dengan filter</span>
          )}
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Card Header & Profile */}
            <div className="p-5">
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
                    alt={member.namaLengkap}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-polri-gold/50 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-polri-navy text-polri-gold text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    96
                  </div>
                </div>

                {/* Name & Rank */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-50 text-amber-900 border border-amber-200">
                      {member.pangkat}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      NRP {member.nrp}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2" title={member.namaLengkap}>
                    {member.namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                    {member.jabatanTerakhir}
                  </p>
                </div>
              </div>

              {/* Badges Info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  <MapPin className="w-3 h-3 text-red-500" />
                  {member.polda}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
                  <Briefcase className="w-3 h-3 text-blue-600" />
                  {member.satuanKerja}
                </span>
                {member.subSatker && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                    {member.subSatker}
                  </span>
                )}
                {member.tipeSatker && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {member.tipeSatker}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center gap-2">
              {/* WhatsApp Direct */}
              <a
                href={formatWaUrl(member.noHp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat WA
              </a>

              {/* ADC Button if available */}
              {member.kontakAdc && (
                <a
                  href={formatWaUrl(member.kontakAdc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  title={`Hubungi ADC: ${member.namaAdc || 'Ajudan'}`}
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">ADC</span>
                </a>
              )}

              {/* View Full Profile */}
              <button
                onClick={() => setSelectedMember(member)}
                className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-polri-navy hover:bg-polri-navyLight text-polri-gold text-xs font-bold transition-colors"
              >
                <span>Detail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-polri-navy text-white p-5 border-b border-polri-gold/30 flex items-start justify-between z-10">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedMember.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
                  alt={selectedMember.namaLengkap}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-polri-gold"
                />
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-polri-gold text-polri-navy">
                    {selectedMember.pangkat} • NRP {selectedMember.nrp}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {selectedMember.namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedMember.jabatanTerakhir} — {selectedMember.satuanKerja}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-sm text-slate-700">
              {/* Modul 1: Identitas & Kedinasan */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-polri-navy text-sm uppercase tracking-wide border-b pb-2 mb-3">
                  <Shield className="w-4 h-4 text-polri-navy" />
                  1. Data Identitas & Kedinasan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Jenis Personel & Pangkat:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.jenisAnggota || 'ANGGOTA POLRI'} — {selectedMember.pangkat}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tingkat Satuan Kerja:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.tipeSatker || 'POLDA'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Wilayah / Satker Induk:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedMember.tipeSatker === 'MABES' ? (selectedMember.satkerMabes || selectedMember.polda) : selectedMember.polda}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sub Satker / Direktorat / Bagian:</span>
                    <span className="font-semibold text-blue-700">{selectedMember.subSatker || '-'}</span>
                  </div>
                  {selectedMember.namaPolres && (
                    <div>
                      <span className="text-slate-500 block">Polres / Polrestabes:</span>
                      <span className="font-semibold text-slate-900">{selectedMember.namaPolres}</span>
                    </div>
                  )}
                  {selectedMember.namaPolsek && (
                    <div>
                      <span className="text-slate-500 block">Polsek:</span>
                      <span className="font-semibold text-slate-900">{selectedMember.namaPolsek}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block">Jabatan Terakhir / Saat Ini:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.jabatanTerakhir}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Satuan Kerja SIPP:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.satuanKerja}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pendidikan Terakhir:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.pendidikanTerakhir || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tempat, Tanggal Lahir:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedMember.tempatLahir}, {selectedMember.tanggalLahir} ({selectedMember.usia} Tahun)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nomor Kontak WhatsApp:</span>
                    <span className="font-semibold text-emerald-700">{selectedMember.noHp}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">Alamat Domisili Saat Ini:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedMember.alamatTempatTinggal} (Status: <b className="text-blue-700">{selectedMember.statusTempatTinggal}</b>)
                    </span>
                  </div>
                  {selectedMember.kontakAdc && (
                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Kontak ADC / Staf Perbantuan:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedMember.namaAdc || 'Ajudan'} — {selectedMember.kontakAdc}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modul 2: Data Keluarga & Anak */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-polri-navy text-sm uppercase tracking-wide border-b pb-2 mb-3">
                  <Users className="w-4 h-4 text-polri-navy" />
                  2. Data Keluarga & Tanggungan
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block">Ibu Bhayangkari:</span>
                      <span className="font-semibold text-slate-900">{selectedMember.namaIstri || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Kontak Ibu Bhayangkari:</span>
                      <span className="font-semibold text-slate-900">{selectedMember.kontakIstri || '-'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Daftar Putra / Putri ({selectedMember.jumlahAnak} Anak):</span>
                    {selectedMember.daftarAnak && selectedMember.daftarAnak.length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedMember.daftarAnak.map((anak, idx) => (
                          <div key={anak.id || idx} className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-800">{idx + 1}. {anak.nama}</span>
                              <span className="text-slate-500 ml-2">({anak.status})</span>
                            </div>
                            {anak.biayaPendidikanTahunan && (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                Biaya: {anak.biayaPendidikanTahunan}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Belum ada rincian data anak</span>
                    )}
                  </div>

                  {selectedMember.tanggunganLain?.adaSakitKhusus && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
                      <span className="font-bold block">⚠️ Tanggungan Keluarga Butuh Perhatian Khusus:</span>
                      <span>{selectedMember.tanggunganLain.rincianSakitKhusus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modul 3: Persiapan Purna Tugas & Usaha */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-polri-navy text-sm uppercase tracking-wide border-b pb-2 mb-3">
                  <Home className="w-4 h-4 text-polri-navy" />
                  3. Kesiapan Purna Tugas & Rencana Usaha
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Tahun Purna Tugas:</span>
                    <span className="font-semibold text-slate-900">
                      Tahun {selectedMember.tahunPurnaTugas} (Sisa {selectedMember.sisaTahunDinas} Tahun Dinas)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Hunian Pasca Pensiun:</span>
                    <span className={`font-bold ${selectedMember.statusRumahPurnaTugas === 'SEWA/KONTRAK' ? 'text-amber-600' : 'text-slate-900'}`}>
                      {selectedMember.statusRumahPurnaTugas}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">Alamat Rumah Pasca Pensiun:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.alamatPurnaTugas || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rencana Usaha Pasca Dinas:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.jenisUsaha || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Usaha:</span>
                    <span className="font-semibold text-emerald-700">{selectedMember.statusUsaha || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Perasaan Terhadap Pensiun:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.perasaanPensiun || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tingkat Kesiapan:</span>
                    <span className="font-semibold text-slate-900">{selectedMember.kesiapanPensiun || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Modul 4: Riwayat Kesehatan */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-polri-navy text-sm uppercase tracking-wide border-b pb-2 mb-3">
                  <Activity className="w-4 h-4 text-polri-navy" />
                  4. Riwayat Kesehatan & Solidaritas Leting
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block">Kondisi Kesehatan Umum:</span>
                      <span className="font-bold text-slate-900">{selectedMember.kondisiKesehatan}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Riwayat Penyakit Kronis:</span>
                      <span className="font-bold text-slate-900">{selectedMember.adaPenyakitKronis}</span>
                    </div>
                  </div>

                  {selectedMember.daftarPenyakit && selectedMember.daftarPenyakit.length > 0 && (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <span className="text-amber-900 font-bold block mb-1">Penyakit yang Diderita:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedMember.daftarPenyakit.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white text-amber-900 rounded border border-amber-300 font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                      {selectedMember.kondisiSaatIni && (
                        <p className="mt-2 text-amber-800 text-[11px]">
                          <b>Kondisi & Penanganan:</b> {selectedMember.kondisiSaatIni}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedMember.harapanDukunganLeting && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                      <span className="font-bold block">💬 Pesan & Harapan Dukungan Leting:</span>
                      <span className="italic">&ldquo;{selectedMember.harapanDukunganLeting}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>
              <a
                href={formatWaUrl(selectedMember.noHp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Langsung via WA
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
