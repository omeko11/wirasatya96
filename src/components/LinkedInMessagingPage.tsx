'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, AnggotaWiraSatya, ChatMessage } from '@/types';
import { 
  Search, 
  Send, 
  Phone, 
  MoreHorizontal, 
  Smile, 
  ShieldCheck, 
  CheckCheck, 
  Paperclip,
  UserPlus,
  FileText,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface LinkedInMessagingPageProps {
  currentUser: AuthUser;
  members: AnggotaWiraSatya[];
  initialTargetMember?: AnggotaWiraSatya | null;
  onSelectMember?: (member: AnggotaWiraSatya) => void;
}

export const LinkedInMessagingPage: React.FC<LinkedInMessagingPageProps> = ({
  currentUser,
  members,
  initialTargetMember,
  onSelectMember,
}) => {
  const [activeFilter, setActiveFilter] = useState<'terfokus' | 'semua' | 'unread' | 'starred'>('terfokus');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active chat partner
  const [activePartnerNrp, setActivePartnerNrp] = useState<string>(() => {
    if (initialTargetMember && initialTargetMember.nrp !== currentUser.nrp) {
      return initialTargetMember.nrp;
    }
    // Default to first member that is not current user
    const firstOther = members.find((m) => m.nrp !== currentUser.nrp);
    return firstOther ? firstOther.nrp : '74030456';
  });

  // All messages in state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ws96_messages_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Failed to parse cached messages', e);
        }
      }
    }
    return [];
  });

  // Sync with initialTargetMember when passed from outside
  useEffect(() => {
    if (initialTargetMember && initialTargetMember.nrp !== currentUser.nrp) {
      setActivePartnerNrp(initialTargetMember.nrp);
    }
  }, [initialTargetMember, currentUser.nrp]);

  // Fetch real messages from API on mount and periodically (polling)
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userNrp=${currentUser.nrp}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.messages) && isMounted) {
          setMessages((prev) => {
            // Merge unique by id
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMsgs.length === 0 && prev.length === data.messages.length) return prev;
            const merged = [...prev, ...newMsgs];
            if (typeof window !== 'undefined') {
              localStorage.setItem('ws96_messages_cache', JSON.stringify(merged));
            }
            return merged;
          });
        }
      } catch (err) {
        console.log('Error fetching messages from API, using local cache', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Polling every 4 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser.nrp]);

  // Scroll to bottom when new message arrives in active chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartnerNrp]);

  // Active Partner Profile
  const activePartner = members.find((m) => m.nrp === activePartnerNrp) || {
    id: 'ws-partner',
    nrp: activePartnerNrp,
    namaLengkap: 'Rekan Perwira Leting 96',
    pangkat: 'Kombes Pol',
    jabatanTerakhir: 'Perwira Menengah Polri',
    satuanKerja: 'Mabes Polri',
    polda: 'MABES POLRI',
    noHp: '081234567890',
  } as AnggotaWiraSatya;

  // Compute unique conversation partners from messages and members list
  const conversationPartners = React.useMemo(() => {
    const partnerMap = new Map<string, { member: AnggotaWiraSatya; lastMessage?: ChatMessage; unread: number }>();

    // 1. Process all messages to find active chat threads
    messages.forEach((msg) => {
      const otherNrp = msg.senderNrp === currentUser.nrp ? msg.receiverNrp : msg.senderNrp;
      if (!otherNrp || otherNrp === currentUser.nrp) return;

      const member = members.find((m) => m.nrp === otherNrp) || {
        id: 'ws-' + otherNrp,
        nrp: otherNrp,
        namaLengkap: msg.senderNrp === otherNrp ? msg.senderName : (msg.receiverName || `Perwira NRP ${otherNrp}`),
        pangkat: msg.senderNrp === otherNrp ? (msg.senderPangkat || 'Kombes Pol') : 'Kombes Pol',
        jabatanTerakhir: 'Perwira Alumni Akpol 1996',
        satuanKerja: 'Kepolisian Negara Republik Indonesia',
        polda: 'MABES POLRI',
        noHp: '',
      } as AnggotaWiraSatya;

      const existing = partnerMap.get(otherNrp);
      const isUnread = !msg.isRead && msg.receiverNrp === currentUser.nrp;

      if (!existing) {
        partnerMap.set(otherNrp, {
          member,
          lastMessage: msg,
          unread: isUnread ? 1 : 0,
        });
      } else {
        if (!existing.lastMessage || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
          existing.lastMessage = msg;
        }
        if (isUnread) {
          existing.unread += 1;
        }
      }
    });

    // 2. Ensure active partner is always in the list
    if (activePartner && !partnerMap.has(activePartner.nrp)) {
      partnerMap.set(activePartner.nrp, {
        member: activePartner,
        unread: 0,
      });
    }

    // 3. Ensure a few top leting leaders are accessible if list is sparse
    if (partnerMap.size < 3) {
      members.slice(0, 4).forEach((m) => {
        if (m.nrp !== currentUser.nrp && !partnerMap.has(m.nrp)) {
          partnerMap.set(m.nrp, {
            member: m,
            unread: 0,
          });
        }
      });
    }

    return Array.from(partnerMap.values()).sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [messages, currentUser.nrp, members, activePartner]);

  // Messages between currentUser and activePartner
  const activeChatMessages = messages.filter(
    (m) =>
      (m.senderNrp === currentUser.nrp && m.receiverNrp === activePartnerNrp) ||
      (m.senderNrp === activePartnerNrp && m.receiverNrp === currentUser.nrp)
  );

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const optimisticMsg: ChatMessage = {
      id: 'local-' + Date.now(),
      senderNrp: currentUser.nrp,
      senderName: currentUser.nama.replace(/\(.*?\)/g, '').trim(),
      senderPangkat: currentUser.pangkat,
      receiverNrp: activePartner.nrp,
      receiverName: activePartner.namaLengkap,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Update locally immediately
    const updated = [...messages, optimisticMsg];
    setMessages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ws96_messages_cache', JSON.stringify(updated));
    }

    // Send to backend API
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderNrp: currentUser.nrp,
          senderName: currentUser.nama,
          senderPangkat: currentUser.pangkat,
          receiverNrp: activePartner.nrp,
          receiverName: activePartner.namaLengkap,
          text: text,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        // Replace optimistic msg with confirmed server msg
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
      }
    } catch (err) {
      console.log('Saved message to local cache, API sync queued', err);
    } finally {
      setIsSending(false);
    }
  };

  const getWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20Komandan%2C%20mohon%20izin%20menghubungi%20dari%20Obrolan%20Alumni%20Akpol%201996`;
  };

  // Filtered conversation partners in left rail
  const filteredPartners = conversationPartners.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      p.member.namaLengkap.toLowerCase().includes(q) ||
      p.member.pangkat.toLowerCase().includes(q) ||
      p.member.satuanKerja.toLowerCase().includes(q) ||
      p.member.nrp.includes(q)
    );
  });

  // Filter for new chat modal
  const searchableMembers = members.filter((m) => {
    if (m.nrp === currentUser.nrp) return false;
    const q = newChatSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      m.namaLengkap.toLowerCase().includes(q) ||
      m.pangkat.toLowerCase().includes(q) ||
      m.satuanKerja.toLowerCase().includes(q) ||
      m.nrp.includes(q) ||
      m.polda.toLowerCase().includes(q)
    );
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
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-800" />
              <h3 className="text-sm font-bold text-slate-900">Obrolan Leting 96</h3>
            </div>
            
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
              title="Mulai obrolan dengan perwira leting lain"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Obrolan</span>
            </button>
          </div>

          {/* Search box */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari perwira leting, jabatan, atau satker..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>
          </div>

          {/* Tabs Filter (Terfokus, Semua, Unread) */}
          <div className="px-3 pt-2 pb-1 border-b border-slate-100 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveFilter('terfokus')}
              className={`px-3 py-1 rounded-full font-bold transition-colors ${
                activeFilter === 'terfokus' ? 'bg-red-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Terfokus
            </button>
            <button
              onClick={() => setActiveFilter('semua')}
              className={`px-3 py-1 rounded-full font-bold transition-colors ${
                activeFilter === 'semua' ? 'bg-red-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({conversationPartners.length})
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredPartners.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-slate-500">Belum ada obrolan ditemukan.</p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="text-xs font-bold text-red-800 hover:underline inline-block"
                >
                  + Mulai Obrolan Baru
                </button>
              </div>
            ) : (
              filteredPartners.map(({ member, lastMessage, unread }) => {
                const isSelected = member.nrp === activePartnerNrp;
                return (
                  <div
                    key={member.nrp}
                    onClick={() => setActivePartnerNrp(member.nrp)}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                      isSelected ? 'bg-red-50/60 border-l-4 border-red-800' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                        alt={member.namaLengkap}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" title="Aktif" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {member.namaLengkap.split(',')[0]}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {lastMessage ? lastMessage.timestamp : 'Leting'}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 truncate font-medium">
                        {member.pangkat} &bull; {member.satuanKerja}
                      </p>

                      <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                        {lastMessage ? lastMessage.text : 'Klik untuk memulai obrolan langsung...'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-800 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ACTIVE CHAT CANVAS (md:col-span-7 lg:col-span-8)*/}
        {/* ============================================================ */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-white">
          
          {/* Top Bar of Active Conversation */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePartner.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                alt={activePartner.namaLengkap}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 cursor-pointer"
                onClick={() => onSelectMember && onSelectMember(activePartner)}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 
                    onClick={() => onSelectMember && onSelectMember(activePartner)}
                    className="text-xs sm:text-sm font-bold text-slate-900 hover:text-red-900 cursor-pointer flex items-center gap-1"
                  >
                    <span>{activePartner.namaLengkap}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 inline" />
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  {activePartner.jabatanTerakhir} &bull; {activePartner.satuanKerja} ({activePartner.polda})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activePartner.noHp && (
                <a
                  href={getWaUrl(activePartner.noHp)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full border border-red-800 text-red-900 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Hubungi via WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}

              {onSelectMember && (
                <button
                  onClick={() => onSelectMember(activePartner)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Lihat Profil Lengkap"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Security & Confidentiality Notice Header */}
          <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kanal Komunikasi Terverifikasi Personel Batalyon Wira Satya Akpol 1996</span>
            </span>
            <span className="text-[10px] font-semibold text-red-900">#SelaluBahagia</span>
          </div>

          {/* Chat Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
            {activeChatMessages.length === 0 ? (
              <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-900 flex items-center justify-center mx-auto shadow-xs">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Mulai Obrolan dengan {activePartner.namaLengkap.split(',')[0]}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan sampaikan salam hormat, koordinasi dinas, atau silaturahmi satu letting.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {[
                    'Siap Komandan, mohon izin koordinasi.',
                    'Salam hormat satu letting Wira Satya 96!',
                    'Mohon info tindak lanjut agenda leting.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(preset)}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-700 hover:border-red-800 text-[11px] font-medium transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChatMessages.map((msg) => {
                const isMe = msg.senderNrp === currentUser.nrp;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                        isMe
                          ? 'bg-red-800 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-bold text-red-900 mb-1">
                          {msg.senderName} ({msg.senderPangkat || activePartner.pangkat})
                        </p>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {msg.attachmentUrl && (
                        <div className="mt-2 p-2 rounded-lg bg-black/10 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs underline">{msg.attachmentName || 'Dokumen Terlampir'}</span>
                        </div>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                          isMe ? 'text-red-200' : 'text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-white/90" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Tulis pesan untuk ${activePartner.namaLengkap.split(',')[0]}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-800"
                />

                <button
                  type="button"
                  onClick={() => {
                    const preset = prompt('Masukkan URL dokumen/lampiran (misal PDF atau tautan OnlyOffice):');
                    if (preset) {
                      setInputText((prev) => (prev ? `${prev}\nLampiran: ${preset}` : `Lampiran Dokumen: ${preset}`));
                    }
                  }}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Lampirkan Dokumen / Tautan Dinas"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-full bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white transition-all shadow-sm active:scale-95"
                  title="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL: PILIH PERWIRA UNTUK MEMULAI OBROLAN BARU                */}
      {/* ============================================================== */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-red-950 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Mulai Obrolan Baru Leting 96</h3>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Cari nama perwira, NRP, pangkat, atau Polda..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {searchableMembers.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500">
                  Tidak ada perwira leting yang cocok dengan pencarian.
                </p>
              ) : (
                searchableMembers.map((m) => (
                  <div
                    key={m.nrp}
                    onClick={() => {
                      setActivePartnerNrp(m.nrp);
                      setIsNewChatModalOpen(false);
                      setNewChatSearch('');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                      alt={m.namaLengkap}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {m.namaLengkap}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {m.pangkat} &bull; {m.jabatanTerakhir}
                      </p>
                      <p className="text-[10px] text-red-900 font-semibold truncate">
                        {m.satuanKerja} ({m.polda}) &bull; NRP {m.nrp}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full border border-red-200 flex-shrink-0">
                      Chat
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Menampilkan <b>{searchableMembers.length}</b> perwira terdaftar di Batalyon Wira Satya 1996
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
