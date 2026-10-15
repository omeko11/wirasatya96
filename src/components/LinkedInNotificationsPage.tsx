'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types';
import { 
  Bell, 
  MoreHorizontal, 
  CheckCheck
} from 'lucide-react';

interface LinkedInNotificationsPageProps {
  currentUser: AuthUser;
  onNavigateToTab: (tab: string) => void;
}

interface NotificationItem {
  id: string;
  type: 'HEALTH' | 'TREASURY' | 'SOCIAL' | 'CAREER';
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  avatarUrl?: string;
  actionLabel?: string;
  targetTab?: string;
}

export const LinkedInNotificationsPage: React.FC<LinkedInNotificationsPageProps> = ({
  currentUser,
  onNavigateToTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'semua' | 'health' | 'treasury' | 'social'>('semua');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'health') return n.type === 'HEALTH';
    if (activeFilter === 'treasury') return n.type === 'TREASURY';
    if (activeFilter === 'social') return n.type === 'SOCIAL';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-2 font-sans text-slate-900 pb-20">
      
      {/* 2-Column LinkedIn Notifications Layout (1:1 with user screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT RAIL (lg:col-span-4): USER PROFILE CARD & SETTINGS     */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-center">
            <div className="h-16 relative overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/default-cover.jpg"
                alt="Sampul"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-4 pb-4 relative">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow mx-auto -mt-8 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.fotoUrl || '/default-avatar.png'}
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
                Pusat Pemberitahuan Angkatan
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 pb-1 border-b border-slate-100">
              Kelola Notifikasi Anda
            </h4>
            <p className="text-slate-500 leading-snug">
              Semua atensi kesehatan, penerbitan iuran kas, dan aktivitas postingan leting disinkronkan secara real-time.
            </p>
            <button
              onClick={markAllAsRead}
              className="text-red-900 font-bold hover:underline pt-2 flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai semua telah dibaca</span>
            </button>
          </div>

        </div>

        {/* ============================================================ */}
        {/* CENTER / MAIN CONTENT (lg:col-span-8): NOTIFICATION ITEMS   */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header & Filter Pills (Matching user screenshot 4) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-800" />
                Notifikasi Batalyon Wira Satya 96
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {notifications.filter(n => !n.isRead).length} Belum Dibaca
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pt-1">
              {[
                { key: 'semua', label: 'Semua' },
                { key: 'health', label: '❤️ Kesehatan' },
                { key: 'treasury', label: '💰 Kas' },
                { key: 'social', label: '💬 Postingan' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key as 'semua' | 'health' | 'treasury' | 'social')}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === f.key
                      ? 'bg-red-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Stream */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-3 transition-colors ${
                    !notif.isRead ? 'bg-red-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={notif.avatarUrl || '/default-avatar.png'}
                      alt="Notifikasi"
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0 mt-0.5"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-800" />
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {notif.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                        <span>{notif.timeAgo}</span>
                        {notif.actionLabel && notif.targetTab && (
                          <button
                            onClick={() => onNavigateToTab(notif.targetTab!)}
                            className="text-red-900 font-bold hover:underline"
                          >
                            {notif.actionLabel} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">Belum ada notifikasi baru.</p>
                <p className="text-slate-400 text-[11px]">Pemberitahuan terkait atensi medis, mutasi arus kas, dan kabar leting akan muncul di sini.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
