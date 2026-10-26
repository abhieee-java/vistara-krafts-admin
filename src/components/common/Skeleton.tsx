import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#f0ede6] rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent ${className}`}
      style={style}
    />
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden divide-y divide-gray-100 ${className}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-3 py-3.5 px-4 animate-pulse">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`flex-1 ${
                cIdx === 0
                  ? 'flex-[2] flex items-center gap-2.5'
                  : cIdx === columns - 1
                  ? 'flex-none w-20 text-right'
                  : ''
              }`}
            >
              {cIdx === 0 ? (
                <>
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                </>
              ) : (
                <Skeleton
                  className={`h-3.5 rounded ${
                    cIdx % 2 === 0 ? 'w-3/4 mx-auto' : 'w-4/5'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#e6e2d8] rounded-2xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-2.5 w-32 rounded" />
        </div>
      ))}
    </div>
  );
};

export const MobileCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-40 rounded" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
