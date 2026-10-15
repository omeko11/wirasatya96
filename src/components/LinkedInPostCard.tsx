'use client';

import React, { useState } from 'react';
import { FeedPost, AuthUser } from '@/types';
import { 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  MoreHorizontal, 
  Globe, 
  Pin, 
  ShieldCheck, 
  Check, 
  Copy,
  Bookmark
} from 'lucide-react';

interface LinkedInPostCardProps {
  post: FeedPost;
  currentUser: AuthUser;
  onLikeToggle: (postId: string) => void;
  onRepost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAuthorClick?: (authorNrp?: string) => void;
}

export const LinkedInPostCard: React.FC<LinkedInPostCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onRepost,
  onAddComment,
  onAuthorClick,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setIsCopied(true);
      showToast('Tautan postingan berhasil disalin ke clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showToast(isBookmarked ? 'Postingan dihapus dari simpanan.' : 'Postingan berhasil disimpan!');
    setShowMoreMenu(false);
  };

  const handleRepostClick = () => {
    onRepost(post.id);
    showToast('Postingan dibagikan ke linimasa Batalyon Wira Satya 96!');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
    showToast('Komentar berhasil dikirim!');
  };

  // Render text with clickable hashtags
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('#')) {
        return (
          <span 
            key={idx} 
            className="text-[#0a66c2] font-semibold hover:underline cursor-pointer"
            onClick={() => showToast(`Filter tag: ${part}`)}
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300 relative">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner (Pinned / Activity Header like LinkedIn) */}
      {post.pinned && (
        <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 border-b border-slate-50 bg-slate-50/60">
          <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
          <span>Postingan Disematkan Pengurus Batalyon</span>
        </div>
      )}

      {/* Post Header: Author info */}
      <div className="p-4 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div 
            onClick={() => onAuthorClick && onAuthorClick(post.authorNrp)}
            className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#0a66c2] transition-all bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
              alt={post.authorName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 
                onClick={() => onAuthorClick && onAuthorClick(post.authorNrp)}
                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer hover:underline truncate"
              >
                {post.authorName}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              {post.badgeLabel && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {post.badgeLabel}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
              {post.authorJabatan}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
              <span>{post.createdAt}</span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-0.5">
                <Globe className="w-2.5 h-2.5" />
                Leting 96
              </span>
            </div>
          </div>
        </div>

        {/* Menu Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div 
              className="absolute right-0 top-8 z-20 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 text-xs text-slate-700 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCopyLink}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{isCopied ? 'Tautan Tersalin!' : 'Salin Tautan Postingan'}</span>
              </button>
              <button
                onClick={handleBookmark}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-500'}`} />
                <span>{isBookmarked ? 'Hapus Simpanan' : 'Simpan Postingan'}</span>
              </button>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  showToast('Laporan atensi diterima oleh Kesekretariatan.');
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-500 flex items-center gap-2 border-t border-slate-100 mt-1"
              >
                <span>Atensi / Laporkan Konten</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Text / Caption */}
      <div className="px-4 py-2 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
        {renderFormattedContent(post.content)}
      </div>

      {/* Post Attached Image */}
      {post.imageUrl && (
        <div className="mt-2 bg-slate-900 border-y border-slate-100 overflow-hidden max-h-[460px] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt="Dokumentasi"
            className="w-full h-full object-cover max-h-[460px] hover:opacity-95 transition-opacity"
          />
        </div>
      )}

      {/* Engagement Counters (Likes, Comments, Reposts) */}
      <div className="px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1 items-center">
            <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[9px]">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">
              ❤️
            </span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">
              👏
            </span>
          </div>
          <span className="font-semibold text-slate-700">
            {post.likesCount + (post.isLiked ? 1 : 0)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:underline hover:text-[#0a66c2]"
          >
            {post.comments.length} komentar
          </button>
          <span>&bull;</span>
          <span>{post.repostsCount + (post.isReposted ? 1 : 0)} dibagikan</span>
        </div>
      </div>

      {/* Action Buttons: Like, Comment, Repost, Share (Exact LinkedIn 4 buttons) */}
      <div className="px-2 py-1 flex items-center justify-around text-xs font-semibold text-slate-600">
        <button
          onClick={() => onLikeToggle(post.id)}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            post.isLiked
              ? 'text-[#0a66c2] font-bold bg-blue-50/70'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-[#0a66c2] stroke-[#0a66c2]' : ''}`} />
          <span>{post.isLiked ? 'Disukai' : 'Suka'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            showComments ? 'text-[#0a66c2] bg-blue-50/50' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Komentar</span>
        </button>

        <button
          onClick={handleRepostClick}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            post.isReposted
              ? 'text-emerald-700 font-bold bg-emerald-50'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Repeat2 className="w-4 h-4" />
          <span>{post.isReposted ? 'Dibagikan' : 'Bagikan'}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-100 text-slate-600 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Kirim</span>
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="p-4 pt-3 bg-slate-50/70 border-t border-slate-100 space-y-3.5 animate-fadeIn">
          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face'}
              alt={currentUser.nama}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Tambahkan komentar leting..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3.5 py-1.5 bg-white border border-slate-300 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  newCommentText.trim()
                    ? 'bg-[#0a66c2] text-white hover:bg-[#004182]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Kirim
              </button>
            </div>
          </form>

          {/* Comments List */}
          {post.comments.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {post.comments.map((comm) => (
                <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comm.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'}
                    alt={comm.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-[11px] truncate">
                        {comm.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {comm.createdAt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                      {comm.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-2">
              Belum ada komentar. Jadilah yang pertama memberi semangat rekan leting!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
