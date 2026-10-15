'use client';

import React, { useState } from 'react';
import { AuthUser, AnggotaWiraSatya } from '@/types';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Bookmark, 
  CheckCircle2, 
  Search, 
  Users, 
  Send
} from 'lucide-react';

interface LinkedInJobsPageProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  onOpenFormWizard?: () => void;
}

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryRange: string;
  postedTime: string;
  alumniCount: number;
  description: string;
  category: 'SECURITY' | 'TENAGA_AHLI' | 'WIRAUSAHA' | 'LEGAL';
  contactPerson: string;
}

export const LinkedInJobsPage: React.FC<LinkedInJobsPageProps> = ({
  currentUser,
  members,
  onOpenFormWizard,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const sampleJobs: JobOpportunity[] = [
    {
      id: 'job-1',
      title: 'Chief Security Officer (CSO) / Kepala Pengamanan Korporasi',
      company: 'PT Bank Mandiri (Persero) Tbk',
      location: 'Jakarta Selatan (Kantor Pusat)',
      type: 'Purna Tugas / Kontrak Eksekutif',
      salaryRange: 'Rp 45.000.000 - Rp 65.000.000 / bln',
      postedTime: '3 hari yang lalu',
      alumniCount: 3,
      description: 'Memimpin arsitektur pengamanan fisik, aset digital perbankan, kepatuhan intelijen bisnis, dan koordinasi terpadu dengan aparat penegak hukum se-Indonesia.',
      category: 'SECURITY',
      contactPerson: 'Kombes Pol (Purn) Dr. Ruslan',
    },
    {
      id: 'job-2',
      title: 'Tenaga Ahli Madya / Konsultan Intelijen Strategis',
      company: 'Kementerian Koordinator Bidang Politik & Keamanan',
      location: 'Jakarta Pusat',
      type: 'Konsultan Ahli Kebijakan',
      salaryRange: 'Standar Remunerasi Eselon I/II',
      postedTime: '1 minggu yang lalu',
      alumniCount: 5,
      description: 'Penyusunan analisis strategis pencegahan radikalisme, stabilitas keamanan nasional, dan rekomendasi operasional lintas sektoral.',
      category: 'TENAGA_AHLI',
      contactPerson: 'Brigjen Pol. Eko Agung',
    },
    {
      id: 'job-3',
      title: 'Managing Partner & Konsultan Hukum Investigasi',
      company: 'Wira Satya Law & Risk Advisory Partners',
      location: 'Jakarta & Surabaya',
      type: 'Kemitraan Sinergi Alumni 96',
      salaryRange: 'Profit Sharing / Kemitraan',
      postedTime: '2 minggu yang lalu',
      alumniCount: 8,
      description: 'Firma hukum & penanganan investigasi fraud korporasi yang diinisiasi oleh alumni Akpol 1996 untuk wadah pengabdian purna tugas profesional.',
      category: 'LEGAL',
      contactPerson: 'Kombes Pol. Bambang Prasetyo',
    },
    {
      id: 'job-4',
      title: 'Direktur Operasional Logistik & Pengamanan Rantai Pasok',
      company: 'PT Samudera Logistik Nusantara',
      location: 'Tanjung Priok, Jakarta Utara',
      type: 'Direksi Purna Tugas',
      salaryRange: 'Rp 50.000.000 - Rp 70.000.000 / bln',
      postedTime: '4 hari yang lalu',
      alumniCount: 2,
      description: 'Manajemen proteksi logistik pelabuhan, mitigasi penyelundupan, dan koordinasi dengan Ditpolairud dan Bea Cukai.',
      category: 'SECURITY',
      contactPerson: 'AKBP (Purn) Suryanto',
    },
    {
      id: 'job-5',
      title: 'Kemitraan Usaha Agrobisnis & Ketahanan Pangan Alumni 96',
      company: 'Koperasi Bhayangkara Wira Satya 96',
      location: 'Jawa Barat & Lampung',
      type: 'Wirausaha Mandiri Bersama',
      salaryRange: 'Bagi Hasil Usaha Tani & Ternak',
      postedTime: 'Baru saja',
      alumniCount: 14,
      description: 'Unit usaha mandiri leting 96 di bidang perkebunan kopi, jagung, dan peternakan modern sebagai persiapan masa purna tugas produktif.',
      category: 'WIRAUSAHA',
      contactPerson: 'Kombes Pol. Hadi Wicaksono',
    }
  ];

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => 
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApply = (jobId: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds((prev) => [...prev, jobId]);
      alert('Peminatan sinergi purna tugas berhasil dikirimkan ke koordinator alumni!');
    }
  };

  const filteredJobs = sampleJobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'SEMUA' || job.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-2 font-sans text-slate-900 pb-20">
      
      {/* 2-Column LinkedIn Jobs Layout (Matching user screenshot 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT RAIL (lg:col-span-4): USER PROFILE CARD & PREFERENCES */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Mini Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-center">
            <div className="h-16 bg-gradient-to-r from-polri-navy via-slate-800 to-amber-700" />
            <div className="px-4 pb-4 relative">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow mx-auto -mt-8 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2">
                {currentUser.nama.split('(')[0].trim()}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentUser.pangkat} &bull; Alumni Akpol 1996
              </p>
              <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                Kepolisian Negara Republik Indonesia
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Purna Tugas:</span>
                  <span className="font-bold text-slate-800">Tahun 2032 (6 Thn Lagi)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Jaringan Alumni:</span>
                  <span className="font-bold text-[#0a66c2]">{members.length} Perwira</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Kesiapan Purna:</span>
                  <span className="font-bold text-emerald-600">Siap & Optimis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Nav Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 text-xs font-semibold text-slate-700">
            <div className="pb-2 border-b border-slate-100 font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#0a66c2]" />
              <span>Persiapan Purna Tugas</span>
            </div>
            <button 
              onClick={() => onOpenFormWizard && onOpenFormWizard()}
              className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors"
            >
              <span>Preferensi Modul 3 (Purna Tugas)</span>
              <span className="text-[10px] text-blue-600 font-bold">Edit →</span>
            </button>
            <button 
              onClick={() => setSelectedCategory('WIRAUSAHA')}
              className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors"
            >
              <span>Sinergi Usaha Leting ({sampleJobs.filter(j => j.category === 'WIRAUSAHA').length})</span>
            </button>
            <button 
              onClick={() => setSelectedCategory('SECURITY')}
              className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors"
            >
              <span>Konsultan Keamanan Korporasi</span>
            </button>
          </div>

          {/* Slogan Card */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <span className="text-[11px] font-extrabold text-amber-900 tracking-wider">
              WADAH PURNA TUGAS WIRA SATYA
            </span>
            <p className="text-[10px] text-amber-800 mt-1">
              Menghubungkan rekan satu angkatan dengan peluang kemitraan profesional menjelang dan pasca purna dinas Polri.
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* CENTER / MAIN CONTENT (lg:col-span-8): JOBS LISTINGS        */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Peluang Purna Tugas & Kemitraan Leting 96
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lowongan strategis, konsultan korporasi, dan sinergi usaha mandiri Batalyon Wira Satya.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold self-start">
                {filteredJobs.length} Peluang Aktif
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari posisi, bidang keahlian, atau nama instansi/mitra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
              {[
                { key: 'SEMUA', label: 'Semua Bidang' },
                { key: 'SECURITY', label: '🛡️ CSO / Pengamanan Korporasi' },
                { key: 'TENAGA_AHLI', label: '🏛️ Tenaga Ahli Kebijakan' },
                { key: 'WIRAUSAHA', label: '🌾 Sinergi Usaha Leting' },
                { key: 'LEGAL', label: '⚖️ Legal & Investigasi' },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === c.key
                      ? 'bg-[#0a66c2] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Stream */}
          <div className="space-y-3.5">
            {filteredJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const isApplied = appliedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer">
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {job.company}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-emerald-700">
                            {job.salaryRange}
                          </span>
                          <span>&bull;</span>
                          <span>{job.postedTime}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(job.id)}
                      className={`p-2 rounded-full border transition-colors ${
                        isSaved ? 'text-amber-500 border-amber-300 bg-amber-50' : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Hapus Simpanan' : 'Simpan Peluang'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {job.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-4 h-4 text-[#0a66c2]" />
                      <span><b>{job.alumniCount} perwira leting 96</b> terhubung di sektor ini</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Narahubung: {job.contactPerson}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={isApplied}
                      className={`px-5 py-2 rounded-full font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm ${
                        isApplied
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#0a66c2] hover:bg-[#004182] text-white'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Peminatan Terkirim</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Hubungi Mitra / Lamar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
