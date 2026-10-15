'use client';

import React, { useState } from 'react';
import { AnggotaWiraSatya, AuthUser } from '@/types';
import { DAFTAR_38_POLDA } from '@/data/polriStructure';
import { 
  BarChart3, 
  Heart, 
  Home, 
  Briefcase, 
  Users, 
  Download, 
  MessageCircle, 
  ShieldAlert,
  MapPin,
  GraduationCap,
  Wallet,
  AlertCircle
} from 'lucide-react';

interface ExecutiveDashboardProps {
  members: AnggotaWiraSatya[];
  currentUser: AuthUser;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ members, currentUser }) => {
  // Default subtab according to role
  const getInitialSubTab = () => {
    if (currentUser.role === 'SEKRETARIAT') return 'pemetaan';
    if (currentUser.role === 'BENDAHARA') return 'keuangan';
    return 'kesehatan';
  };

  const [activeSubTab, setActiveSubTab] = useState<'kesehatan' | 'hunian' | 'usaha' | 'pemetaan' | 'keuangan'>(getInitialSubTab());

  // Stats calculation
  const total = members.length;
  const needHealthAttention = members.filter(
    (m) => m.adaPenyakitKronis === 'ADA' || m.kondisiKesehatan === 'PERLU PERHATIAN KHUSUS' || m.kondisiKesehatan === 'SAKIT'
  );
  const stillRenting = members.filter(
    (m) => m.statusRumahPurnaTugas === 'SEWA/KONTRAK' || m.statusTempatTinggal === 'SEWA/KONTRAK'
  );
  const withBusiness = members.filter(
    (m) => m.statusUsaha === 'SUDAH JALAN' || m.statusUsaha === 'DALAM PERSIAPAN'
  );

  // Regional distribution (for Kesekretariatan)
  const regionalStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const p = m.polda || 'MABES POLRI';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [members]);

  // Unreached Poldas for active mapping (Kesekretariatan)
  const unreachedPoldas = React.useMemo(() => {
    const coveredSet = new Set(members.map((m) => (m.polda || '').toUpperCase()));
    return DAFTAR_38_POLDA.filter((p) => !coveredSet.has(p.toUpperCase()));
  }, [members]);

  // Financial & Education stats (for Bendahara)
  const financialStats = React.useMemo(() => {
    let collegeCount = 0;
    let highCostEdu = 0;
    let midCostEdu = 0;
    let lowCostEdu = 0;

    members.forEach((m) => {
      (m.daftarAnak || []).forEach((a) => {
        if (a.status === 'PELAJAR') {
          collegeCount++;
          if (a.biayaPendidikanTahunan === '> 25.000.000') highCostEdu++;
          else if (a.biayaPendidikanTahunan === '5.000.000 S.D. 25.000.000') midCostEdu++;
          else lowCostEdu++;
        }
      });
    });

    const needFinancialAidPension = members.filter((m) => m.kecukupanDanaPensiun === 'KURANG').length;

    return {
      collegeCount,
      highCostEdu,
      midCostEdu,
      lowCostEdu,
      needFinancialAidPension,
    };
  }, [members]);

  const formatWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Pengurus%20Wira%20Satya%2096`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'NRP',
      'Nama Lengkap',
      'Pangkat',
      'Jabatan Terakhir',
      'Satker',
      'Polda',
      'No HP',
      'Status Rumah Sekarang',
      'Nama Istri',
      'Jumlah Anak',
      'Tahun Pensiun',
      'Status Rumah Pensiun',
      'Rencana Usaha',
      'Status Usaha',
      'Riwayat Sakit Kronis',
      'Kondisi Kesehatan',
      'Penyakit',
    ];

    const rows = members.map((m) => [
      `"${m.nrp}"`,
      `"${m.namaLengkap}"`,
      `"${m.pangkat}"`,
      `"${m.jabatanTerakhir}"`,
      `"${m.satuanKerja}"`,
      `"${m.polda}"`,
      `"${m.noHp}"`,
      `"${m.statusTempatTinggal}"`,
      `"${m.namaIstri || '-'}"`,
      m.jumlahAnak,
      m.tahunPurnaTugas,
      `"${m.statusRumahPurnaTugas}"`,
      `"${m.jenisUsaha || '-'}"`,
      `"${m.statusUsaha || '-'}"`,
      `"${m.adaPenyakitKronis}"`,
      `"${m.kondisiKesehatan}"`,
      `"${(m.daftarPenyakit || []).join('; ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Data_WiraSatya96_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-polri-navy via-slate-900 to-polri-navyLight p-6 rounded-2xl border border-polri-gold/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-polri-gold/20 text-polri-gold text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Panel Khusus: {currentUser.role === 'KETUA' ? 'Ketua Batalyon' : currentUser.role === 'BENDAHARA' ? 'Bendahara Paguyuban' : 'Kesekretariatan'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Executive Dashboard Wira Satya 96
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {currentUser.role === 'KETUA' && 'Ikhtisar komprehensif kondisi kesehatan leting, kesiapan hunian masa pensiun, dan pemetaan keanggotaan se-Indonesia.'}
            {currentUser.role === 'SEKRETARIAT' && 'Pemetaan sebaran penugasan leting di seluruh Polda (termasuk wilayah perbatasan/terluar) dan manajemen pembaruan data.'}
            {currentUser.role === 'BENDAHARA' && 'Pemetaan beban tanggungan pendidikan putra/putri leting, alokasi santunan kesehatan, dan kesiapan finansial purna tugas.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-polri-gold hover:bg-polri-goldDark text-polri-navy font-bold text-xs shadow-lg transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Rekap Excel / CSV</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Personel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Total Alumni Terdata</span>
            <span className="text-2xl font-black text-slate-900">{total}</span>
            <span className="text-[11px] text-slate-400 block">Kombes / Pati</span>
          </div>
        </div>

        {/* Atensi Kesehatan */}
        <div className="bg-white p-5 rounded-xl border border-red-200 bg-red-50/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-red-600 font-bold block">Atensi Kesehatan</span>
            <span className="text-2xl font-black text-red-900">{needHealthAttention.length}</span>
            <span className="text-[11px] text-red-500 block">Perlu Perhatian</span>
          </div>
        </div>

        {/* Status Hunian Belum Tetap */}
        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-amber-700 font-bold block">Hunian Purna Tugas</span>
            <span className="text-2xl font-black text-amber-900">{stillRenting.length}</span>
            <span className="text-[11px] text-amber-600 block">Belum Rumah Pribadi</span>
          </div>
        </div>

        {/* Sinergi Usaha */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-600 font-bold block">Sinergi Bisnis Leting</span>
            <span className="text-2xl font-black text-emerald-900">{withBusiness.length}</span>
            <span className="text-[11px] text-emerald-600 block">Usaha Berjalan/Siap</span>
          </div>
        </div>
      </div>

      {/* Actionable Solution Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('kesehatan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'kesehatan'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Kesehatan ({needHealthAttention.length})
          </button>

          <button
            onClick={() => setActiveSubTab('hunian')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'hunian'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Home className="w-4 h-4" />
            Hunian ({stillRenting.length})
          </button>

          <button
            onClick={() => setActiveSubTab('usaha')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'usaha'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Usaha ({withBusiness.length})
          </button>

          <button
            onClick={() => setActiveSubTab('pemetaan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'pemetaan'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Pemetaan ({regionalStats.length})
          </button>

          <button
            onClick={() => setActiveSubTab('keuangan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'keuangan'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Beban Sosial
          </button>
        </div>

        {/* Tab 1: ATENSI KESEHATAN */}
        {activeSubTab === 'kesehatan' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-red-900 text-xs">
              <span className="font-bold block mb-1">📌 Catatan untuk Pengurus & Ketua Angkatan:</span>
              Daftar rekan di bawah ini sedang dalam masa pengobatan atau membutuhkan perhatian khusus. Sangat disarankan bagi pengurus untuk mengagendakan kunjungan silaturahmi, memfasilitasi kemudahan faskes, atau doa bersama.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {needHealthAttention.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-red-200 bg-white shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-800">
                        {m.kondisiKesehatan}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{m.namaLengkap}</h4>
                      <p className="text-xs text-slate-500">{m.jabatanTerakhir} — {m.polda}</p>
                    </div>
                    <a
                      href={formatWaUrl(m.noHp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      title="Hubungi Rekan"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-semibold block">Diagnosis Penyakit:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.daftarPenyakit?.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium text-[11px]">
                          {p}
                        </span>
                      ))}
                    </div>
                    {m.kondisiSaatIni && (
                      <p className="text-slate-700 text-[11px] pt-1">
                        <b>Kondisi:</b> {m.kondisiSaatIni}
                      </p>
                    )}
                    {m.harapanLayananKesehatan && (
                      <p className="text-blue-700 text-[11px] pt-1">
                        <b>Kebutuhan:</b> {m.harapanLayananKesehatan}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: HUNIAN PURNA TUGAS */}
        {activeSubTab === 'hunian' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold block mb-1">📌 Pemetaan Kesiapan Tempat Tinggal Pasca Dinas:</span>
              Berikut daftar rekan yang status tempat tinggal setelah pensiun masih sewa/kontrak atau belum memiliki hunian tetap pribadi.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stillRenting.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-amber-200 bg-white shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                        Status Pensiun: {m.statusRumahPurnaTugas}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{m.namaLengkap}</h4>
                      <p className="text-xs text-slate-500">{m.jabatanTerakhir}</p>
                    </div>
                    <a
                      href={formatWaUrl(m.noHp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <p className="text-slate-700">
                      <b>Rencana Domisili Pensiun:</b> {m.alamatPurnaTugas || 'Belum Menentukan'}
                    </p>
                    {m.detailSewaPurnaTugas && (
                      <p className="text-amber-800 text-[11px]">
                        <b>Catatan Hunian:</b> {m.detailSewaPurnaTugas}
                      </p>
                    )}
                    {m.biayaSewaTahunan && (
                      <p className="text-slate-600 text-[11px]">
                        <b>Estimasi Biaya Sewa:</b> {m.biayaSewaTahunan}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: KATALOG USAHA LETING */}
        {activeSubTab === 'usaha' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs">
              <span className="font-bold block mb-1">📌 Direktori Sinergi Usaha Alumni Akpol 1996:</span>
              Mari kita saling membeli, menggunakan produk/jasa rekan satu leting, serta mendukung permodalan sesama keluarga besar Wira Satya.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {withBusiness.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-emerald-200 bg-white shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {m.statusUsaha}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{m.polda}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.jenisUsaha}</h4>
                    <p className="text-xs text-slate-600 mt-1">Pemilik: <b>{m.namaLengkap}</b></p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Kontak Bisnis:</span>
                    <a
                      href={formatWaUrl(m.noHp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Hubungi Mitra
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: PEMETAAN WILAYAH (KESEKRETARIATAN) */}
        {activeSubTab === 'pemetaan' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
              <span className="font-bold block mb-1">🗺️ Pemetaan Keanggotaan Wilayah (Kesekretariatan):</span>
              Memudahkan pengurus mendeteksi keberadaan rekan perwira di wilayah yang selama ini sulit dijangkau (seperti DOB Papua, Maluku, Kaltara, NTT) serta jajaran Mabes dan Lemdiklat.
            </div>

            {/* Coverage Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 block">Cakupan Wilayah Terdata</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-blue-900">{regionalStats.length}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ {DAFTAR_38_POLDA.length} Wilayah Polri</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-700 block">Total Perwira Terpetakan</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-emerald-900">{members.length}</span>
                  <span className="text-xs text-emerald-700 font-semibold">Perwira Leting 96</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-amber-800 block">Wilayah Perlu Penjangkauan</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-amber-900">{unreachedPoldas.length}</span>
                  <span className="text-xs text-amber-700 font-semibold">Polda Belum Ada Data</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Regional Summary Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b font-bold text-xs text-slate-800 flex justify-between">
                  <span>Wilayah Penugasan Terdata</span>
                  <span>Jumlah Personel</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {regionalStats.map(([polda, count]) => (
                    <div key={polda} className="px-4 py-2 flex justify-between text-xs items-center hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{polda}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                        {count} Perwira
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update List */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b font-bold text-xs text-slate-800 flex justify-between">
                  <span>Personel Terdaftar</span>
                  <span>Satker & Status</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {members.map((m) => (
                    <div key={m.id} className="px-4 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{m.namaLengkap}</span>
                        <span className="text-slate-500 text-[11px]">{m.polda} • {m.satuanKerja}</span>
                        {m.subSatker && (
                          <span className="text-[10px] text-amber-800 font-semibold block">{m.subSatker}</span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Aktif
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Unreached Regions Notice for Secretariat */}
            {unreachedPoldas.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Target Penjangkauan & Pendataan Wilayah Belum Terisi ({unreachedPoldas.length} Polda):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Rekan perwira di wilayah berikut belum melakukan registrasi mandiri. Kesekretariatan dapat berkoordinasi dengan perwakilan leting setempat:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {unreachedPoldas.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: ANALISIS KEUANGAN & BEBAN PENDIDIKAN (BENDAHARA) */}
        {activeSubTab === 'keuangan' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900 text-xs">
              <span className="font-bold block mb-1">💰 Analisis Sosial & Beban Keuangan (Bendahara Paguyuban):</span>
              Data agregat untuk merancang program subsidi pendidikan putra/putri, dana darurat kesehatan, serta iuran paguyuban Wira Satya 96.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold">Total Pelajar / Mahasiswa</span>
                </div>
                <span className="text-2xl font-black">{financialStats.collegeCount} Anak</span>
                <span className="text-[11px] text-purple-700 block mt-1">Dalam tanggungan leting</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold">Biaya Pendidikan Tinggi (&gt; 25jt)</span>
                </div>
                <span className="text-2xl font-black">{financialStats.highCostEdu} Anak</span>
                <span className="text-[11px] text-amber-700 block mt-1">Kuliah Kedokteran/Swasta</span>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-red-700" />
                  <span className="text-xs font-bold">Kesiapan Dana Pensiun Kurang</span>
                </div>
                <span className="text-2xl font-black">{financialStats.needFinancialAidPension} Rekan</span>
                <span className="text-[11px] text-red-700 block mt-1">Butuh dukungan usaha</span>
              </div>
            </div>

            {/* List of Education Details */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Rekapitulasi Putra / Putri dalam Tanggungan Pendidikan:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {members.map((m) => {
                  const studentChildren = (m.daftarAnak || []).filter((a) => a.status === 'PELAJAR');
                  if (studentChildren.length === 0) return null;
                  return (
                    <div key={m.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{m.namaLengkap}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{studentChildren.length} Pelajar</span>
                      </div>
                      <div className="space-y-1">
                        {studentChildren.map((a, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                            <span>• {a.nama}</span>
                            <span className="font-semibold text-purple-700">{a.biayaPendidikanTahunan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
