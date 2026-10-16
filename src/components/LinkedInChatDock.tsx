'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Minus, 
  Send, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  CheckCheck
} from 'lucide-react';
import { AnggotaWiraSatya, ChatMessage } from '@/types';
import { getAvatarUrl } from '@/lib/avatarUtils';

interface LinkedInChatDockProps {
  members: AnggotaWiraSatya[];
  currentUserName: string;
  currentUserNrp?: string;
}

export const LinkedInChatDock: React.FC<LinkedInChatDockProps> = ({ 
  members, 
  currentUserName,
  currentUserNrp = '98010710'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatMember, setActiveChatMember] = useState<AnggotaWiraSatya | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real messages from shared backend /api/messages
  const fetchMessages = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?userNrp=${encodeURIComponent(currentUserNrp)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ws96_messages_cache', JSON.stringify(data.messages));
        }
      }
    } catch {
      // Fallback to cache
    }
  }, [currentUserNrp]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    const handleSync = () => fetchMessages();
    window.addEventListener('ws96_messages_updated', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ws96_messages_updated', handleSync);
    };
  }, [fetchMessages]);

  const filteredMembers = members.filter(
    (m) =>
      m.nrp !== currentUserNrp &&
      (m.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.satuanKerja || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.polda || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nrp.includes(searchQuery))
  );

  // Active thread messages from real store
  const activeThreadMessages = React.useMemo(() => {
    if (!activeChatMember) return [];
    return messages.filter(
      (m) =>
        (m.senderNrp === currentUserNrp && m.receiverNrp === activeChatMember.nrp) ||
        (m.senderNrp === activeChatMember.nrp && m.receiverNrp === currentUserNrp)
    );
  }, [messages, activeChatMember, currentUserNrp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessages.length, activeChatMember]);

  const handleOpenChat = async (member: AnggotaWiraSatya) => {
    setActiveChatMember(member);
    // Mark incoming messages from this member as read
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderNrp: member.nrp, receiverNrp: currentUserNrp }),
      });
      window.dispatchEvent(new Event('ws96_messages_updated'));
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatMember) return;
    const text = inputText.trim();
    setInputText('');

    const optimisticMsg: ChatMessage = {
      id: 'local-' + Date.now(),
      senderNrp: currentUserNrp,
      senderName: currentUserName.replace(/\(.*?\)/g, '').trim(),
      receiverNrp: activeChatMember.nrp,
      receiverName: activeChatMember.namaLengkap,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderNrp: currentUserNrp,
          senderName: currentUserName.replace(/\(.*?\)/g, '').trim(),
          receiverNrp: activeChatMember.nrp,
          receiverName: activeChatMember.namaLengkap,
          text: text,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? data.message : m)));
        window.dispatchEvent(new Event('ws96_messages_updated'));
      }
    } catch (err) {
      console.log('Dock message saved locally', err);
    }
  };

  const getWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=Halo%20rekan%2C%20mohon%20izin%20menghubungi%20dari%20Portal%20Alumni%20Akpol%201996`;
  };

  // Count unread incoming messages
  const unreadCount = messages.filter((m) => m.receiverNrp === currentUserNrp && !m.isRead).length;

  return (
    <div className="hidden md:flex fixed bottom-0 right-4 z-40 items-end gap-3 font-sans">
      
      {/* 1. ACTIVE POPUP CONVERSATION BOX */}
      {activeChatMember && (
        <div className="w-80 sm:w-88 bg-white rounded-t-xl shadow-2xl border border-slate-300 flex flex-col h-[420px] animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header of Active Chat */}
          <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-t-xl flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatarUrl(activeChatMember.fotoUrl)}
                  alt={activeChatMember.namaLengkap}
                  className="w-8 h-8 rounded-full object-cover border border-amber-400"
                />
                <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {activeChatMember.namaLengkap.split(',')[0]}
                </p>
                <p className="text-[10px] text-amber-300 truncate">
                  {activeChatMember.pangkat} • {activeChatMember.polda}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              {activeChatMember.noHp && (
                <a
                  href={getWaUrl(activeChatMember.noHp)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:text-emerald-400 hover:bg-white/10 rounded transition-colors"
                  title="Buka Chat via WhatsApp Resmi"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => setActiveChatMember(null)}
                className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader: SIPP Role & Batch details */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="truncate max-w-[200px]">
              {activeChatMember.jabatanTerakhir}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px] flex-shrink-0">
              AKPOL 96
            </span>
          </div>

          {/* Chat Messages Body (Synced with /api/messages) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f8fafc] text-xs">
            {activeThreadMessages.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-[11px] space-y-1">
                <p className="font-semibold text-slate-600">Belum ada riwayat obrolan</p>
                <p>Pesan yang dikirim di sini tersinkron otomatis dengan menu Pesan utama.</p>
              </div>
            ) : (
              activeThreadMessages.map((msg) => {
                const isMe = msg.senderNrp === currentUserNrp;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-red-800 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 px-1">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Action Bar */}
          {activeChatMember.noHp && (
            <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
              <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Nomor WA: <b>{activeChatMember.noHp}</b>
              </span>
              <a
                href={getWaUrl(activeChatMember.noHp)}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
              >
                <span>Chat WA Langsung</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

            {/* Chat Input Box */}
          <div className="p-2 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tulis pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full pl-3 pr-2 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-800 border border-slate-200"
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 2. DOCKED MESSENGER BAR (BOTTOM RIGHT) */}
      <div className="w-72 bg-white rounded-t-xl shadow-xl border border-slate-300 overflow-hidden flex flex-col">
        
        {/* Dock Header Bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white hover:bg-slate-50 px-3 py-2.5 flex items-center justify-between cursor-pointer border-b border-slate-200 select-none transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs">
                WS
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-900 block leading-tight truncate">
                Pesan
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate block">
                {filteredMembers.length} kontak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            {unreadCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-800 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
            <button type="button" className="p-1 hover:text-slate-700">
              {isOpen ? <Minus className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dock Body (Contacts list when expanded) */}
        {isOpen && (
          <div className="h-80 flex flex-col bg-white animate-in slide-in-from-bottom-2 duration-150">
            
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau NRP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>
            </div>

            {/* Contact list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const lastMsg = [...messages]
                  .reverse()
                  .find(
                    (m) =>
                      (m.senderNrp === currentUserNrp && m.receiverNrp === member.nrp) ||
                      (m.senderNrp === member.nrp && m.receiverNrp === currentUserNrp)
                  );
                const unreadFromMember = messages.filter(
                  (m) => m.senderNrp === member.nrp && m.receiverNrp === currentUserNrp && !m.isRead
                ).length;

                return (
                  <div
                    key={member.nrp}
                    onClick={() => handleOpenChat(member)}
                    className="p-2.5 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarUrl(member.fotoUrl)}
                        alt={member.namaLengkap}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                          {member.namaLengkap.split(',')[0]}
                        </p>
                        {unreadFromMember > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-red-800 text-white text-[9px] font-bold">
                            {unreadFromMember}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : `${member.pangkat} • ${member.polda}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer tip */}
            <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 truncate block">
                Tersinkron dengan menu Pesan
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
