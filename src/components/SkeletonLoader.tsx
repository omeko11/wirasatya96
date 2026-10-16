'use client';

import React from 'react';

interface SkeletonBoxProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 ${className}`}
  />
);

export const FeedPostSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5"
      >
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-3.5 w-48" />
            <SkeletonBox className="h-2.5 w-32" />
          </div>
          <SkeletonBox className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2 pt-1">
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-11/12" />
          <SkeletonBox className="h-3 w-3/4" />
        </div>
        {idx === 0 && <SkeletonBox className="h-44 w-full rounded-xl" />}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <SkeletonBox className="h-7 w-20 rounded-lg" />
          <SkeletonBox className="h-7 w-20 rounded-lg" />
          <SkeletonBox className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export const DirectoryCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
      >
        <SkeletonBox className="h-16 w-full rounded-none" />
        <div className="px-4 pb-4 -mt-7 space-y-3">
          <SkeletonBox className="w-14 h-14 rounded-full border-4 border-white" />
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-2.5 w-2/3" />
          </div>
          <div className="pt-2 flex gap-2">
            <SkeletonBox className="h-8 flex-1 rounded-lg" />
            <SkeletonBox className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const FinanceDashboardSkeleton: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-3 w-28" />
            <SkeletonBox className="w-8 h-8 rounded-lg" />
          </div>
          <SkeletonBox className="h-6 w-36" />
          <SkeletonBox className="h-2.5 w-24" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <SkeletonBox className="h-4 w-44" />
        <SkeletonBox className="h-8 w-32 rounded-lg" />
      </div>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-50 gap-3">
          <SkeletonBox className="h-3.5 w-24" />
          <SkeletonBox className="h-3.5 flex-1 max-w-xs" />
          <SkeletonBox className="h-5 w-24 rounded-full" />
          <SkeletonBox className="h-4 w-28" />
        </div>
      ))}
    </div>
  </div>
);

export const UserTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="p-4 space-y-3">
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60"
      >
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-2">
            <SkeletonBox className="h-3.5 w-48" />
            <SkeletonBox className="h-2.5 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-7 w-28 rounded-lg" />
          <SkeletonBox className="h-7 w-20 rounded-lg" />
          <SkeletonBox className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
