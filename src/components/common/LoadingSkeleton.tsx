import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-white/5 rounded animate-pulse ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <tr className="border-b border-white/5">
    <td className="py-4 px-4">
      <Skeleton className="h-4 w-32" />
    </td>
    <td className="py-4 px-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="py-4 px-4">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="py-4 px-4">
      <Skeleton className="h-6 w-20 rounded-full" />
    </td>
    <td className="py-4 px-4">
      <Skeleton className="h-8 w-16 rounded" />
    </td>
  </tr>
);

interface LoadingGridProps {
  count?: number;
  type?: 'card' | 'stat';
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({ count = 6, type = 'card' }) => {
  const Component = type === 'stat' ? StatCardSkeleton : CardSkeleton;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Component />
        </motion.div>
      ))}
    </div>
  );
};

interface LoadingTableProps {
  rows?: number;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({ rows = 5 }) => (
  <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
    <table className="w-full">
      <thead className="bg-white/5">
        <tr>
          <th className="py-4 px-4 text-left">
            <Skeleton className="h-4 w-20" />
          </th>
          <th className="py-4 px-4 text-left">
            <Skeleton className="h-4 w-20" />
          </th>
          <th className="py-4 px-4 text-left">
            <Skeleton className="h-4 w-20" />
          </th>
          <th className="py-4 px-4 text-left">
            <Skeleton className="h-4 w-20" />
          </th>
          <th className="py-4 px-4 text-left">
            <Skeleton className="h-4 w-20" />
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);
