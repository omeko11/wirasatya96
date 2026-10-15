'use client';

import React, { useState } from 'react';
import { AuthUser, AnggotaWiraSatya } from '@/types';
import { 
  Search, 
  Send, 
  Phone, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Smile, 
  ShieldCheck, 
  CheckCheck, 
  Paperclip
} from 'lucide-react';

interface LinkedInMessagingPageProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  onSelectMember?: (member: AnggotaWiraSatya) => void;
}

interface ChatMessage {
  id: string;
  senderNrp: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

interface ConversationItem {
  id: string;
  member: AnggotaWiraSatya;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  starred: boolean;
  messages: ChatMessage[];
}

export const LinkedInMessagingPage: React.FC<LinkedInMessagingPageProps> = ({
  currentUser,
  members,
  onSelectMember,
}) => {
  const [activeFilter, setActiveFilter] = useState<'terfokus' | 'semua' | 'unread' | 'starred'>('terfokus');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');

  // Sample conversations
  const [conversations, setConversations] = useState<ConversationItem[]>(() => [
    {
      id: 'conv-1',
      member: members[1] || {
        id: 'ws-ketua',
        nrp: '74030456',
        namaLengkap: 'Irjen Pol. Achmad Kartiko, S.I.K., M.H.',
        pangkat: 'Irjen Pol',
        jabatanTerakhir: 'Kapolda Aceh',
        satuanKerja: 'Polda Aceh',
        polda: 'POLDA ACEH',
        noHp: '081233445566',
        fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      } as AnggotaWiraSatya,
      lastMessage: 'Siap Jenderal, terima kasih atas arahan konsolidasi paguyuban.',
      lastTime: '15:10',
      unreadCount: 2,
      starred: true,
      messages: [
        {
          id: 'm1',
          senderNrp: '74030456',
          senderName: 'Irjen Pol. Achmad Kartiko',
          text: 'Assalamu’alaikum Komandan. Mohon izin mengingatkan konsolidasi pengurus paguyuban terkait atensi rekan leting kita yang sedang pemulihan.',
          timestamp: '14:45',
          isMe: false,
        },
        {
          id: 'm2',
          senderNrp: currentUser.nrp,
          senderName: currentUser.nama,
          text: 'Wa’alaikumsalam Jenderal. Siap, tim bendahara dan kesekretariatan sudah menyalurkan santunan tahap pertama.',
          timestamp: '15:02',
          isMe: true,
        },
        {
          id: 'm3',
          senderNrp: '74030456',
          senderName: 'Irjen Pol. Achmad Kartiko',
          text: 'Alhamdulillah mantap. Teruskan semangat #SelaluBahagia untuk rekan-rekan!',
          timestamp: '15:10',
          isMe: false,
        },
      ],
    },
    {
      id: 'conv-2',
      member: members[2] || {
        id: 'ws-bendahara',
        nrp: '74050234',
        namaLengkap: 'Kombes Pol. Bambang Prasetyo, S.H.',
        pangkat: 'Kombes Pol',
        jabatanTerakhir: 'Kabidkeu Polda Metro Jaya',
        satuanKerja: 'Polda Metro Jaya',
        polda: 'POLDA METRO JAYA',
        noHp: '081299887766',
        fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      } as AnggotaWiraSatya,
      lastMessage: 'Iuran kas paguyuban bulan Oktober sudah terverifikasi lunas.',
      lastTime: 'Kemarin',
      unreadCount: 0,
      starred: false,
      messages: [
        {
          id: 'mb1',
          senderNrp: currentUser.nrp,
          senderName: currentUser.nama,
          text: 'Komandan Bambang, mohon konfirmasi transfer iuran tahunan leting.',
          timestamp: 'Kemarin 09:30',
          isMe: true,
        },
        {
          id: 'mb2',
          senderNrp: '74050234',
          senderName: 'Kombes Pol. Bambang Prasetyo',
          text: 'Siap Komandan, iuran kas paguyuban bulan Oktober sudah terverifikasi lunas. Rekap neraca bisa dilihat langsung di portal kebendaharaan.',
          timestamp: 'Kemarin 10:15',
          isMe: false,
        },
      ],
    },
    {
      id: 'conv-3',
      member: members[0] || {
        id: 'ws-sekretariat',
        nrp: '74080123',
        namaLengkap: 'Kombes Pol. Hadi Wicaksono, S.I.K., M.H.',
        pangkat: 'Kombes Pol',
        jabatanTerakhir: 'Kabaganev Ro PID Divhumas Polri',
        satuanKerja: 'Divhumas Polri',
        polda: 'MABES POLRI',
        noHp: '08119876543',
        fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      } as AnggotaWiraSatya,
      lastMessage: 'Data penempatan perwira di Polda Papua Tengah sudah diupdate.',
      lastTime: '12 Okt',
      unreadCount: 0,
      starred: true,
      messages: [
        {
          id: 'ms1',
          senderNrp: '74080123',
          senderName: 'Kombes Pol. Hadi Wicaksono',
          text: 'Data penempatan perwira di Polda Papua Tengah sudah diupdate di direktori 38 Polda komandan.',
          timestamp: '12 Okt 11:20',
          isMe: false,
        },
      ],
    },
  ]);

  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderNrp: currentUser.nrp,
      senderName: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
      text: inputText.trim(),
      timestamp: 'Baru saja',
      isMe: true,
    };

    const updated = conversations.map((conv) => {
      if (conv.id === activeConv.id) {
        return {
          ...conv,
          lastMessage: inputText.trim(),
          lastTime: 'Baru saja',
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    });

    setConversations(updated);
    setInputText('');
  };

  const filteredConversations = conversations.filter((c) => {
    const matchSearch = c.member.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member.pangkat.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'starred') return c.starred;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-2 font-sans text-slate-900 pb-20">
      
      {/* 2-Column LinkedIn Messenger Layout (1:1 with user image 1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[720px]">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: CONVERSATION LIST (md:col-span-5 lg:col-span-4) */}
        {/* ============================================================ */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col bg-white">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Pesan Leting 96</h3>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pesan atau rekan leting..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#edf3f8] border-none rounded-lg text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          {/* Filter Pills (Matching user image 1) */}
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setActiveFilter('terfokus')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === 'terfokus' ? 'bg-[#01754f] text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Terfokus
            </button>
            <button
              onClick={() => setActiveFilter('semua')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === 'semua' ? 'bg-slate-900 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Semua Leting
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === 'unread' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Belum Dibaca
            </button>
            <button
              onClick={() => setActiveFilter('starred')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === 'starred' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Bintang
            </button>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#edf3f8] border-l-4 border-l-[#0a66c2]' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={conv.member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face'}
                    alt={conv.member.namaLengkap}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {conv.member.namaLengkap.split(',')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.lastTime}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate leading-tight">
                      {conv.member.jabatanTerakhir}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate mt-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ACTIVE THREAD & CHAT (md:col-span-7 lg:col-span-8) */}
        {/* ============================================================ */}
        {activeConv ? (
          <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-white">
            
            {/* Thread Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeConv.member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                  alt={activeConv.member.namaLengkap}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {activeConv.member.namaLengkap}
                    </h4>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeConv.member.jabatanTerakhir} &bull; {activeConv.member.polda}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://wa.me/${activeConv.member.noHp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-emerald-600 transition-colors"
                  title="Hubungi via WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onSelectMember && onSelectMember(activeConv.member)}
                  className="px-3 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Lihat Profil
                </button>
              </div>
            </div>

            {/* Thread Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f3f2ef]/40">
              <div className="text-center py-2">
                <span className="text-[10px] font-semibold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                  Percakapan Terenkripsi Internal Batalyon 1996
                </span>
              </div>

              {activeConv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      m.isMe
                        ? 'bg-[#0a66c2] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${m.isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                      <span>{m.timestamp}</span>
                      {m.isMe && <CheckCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Thread Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan atau koordinasi untuk rekan leting..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-full transition-colors ${
                    inputText.trim()
                      ? 'bg-[#0a66c2] text-white hover:bg-[#004182]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-1 text-slate-500 text-xs">
                <button type="button" className="p-1 hover:text-[#0a66c2] transition-colors" title="Lampirkan Dokumen">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-emerald-600 transition-colors" title="Kirim Foto">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-amber-500 transition-colors" title="Emoji">
                  <Smile className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-slate-400 ml-auto">Tekan Enter untuk kirim</span>
              </div>
            </form>

          </div>
        ) : (
          <div className="md:col-span-7 lg:col-span-8 flex items-center justify-center text-slate-400 text-xs">
            Pilih percakapan untuk memulai obrolan
          </div>
        )}

      </div>

    </div>
  );
};
