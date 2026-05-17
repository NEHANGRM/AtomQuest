import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '', type = 'text', ...props }) => {
  // Types: text, avatar, card, title
  let baseClass = "bg-slate-200 dark:bg-slate-700 animate-pulse rounded";
  
  if (type === 'avatar') {
    baseClass = "bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full";
  } else if (type === 'card') {
    baseClass = "bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl";
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${baseClass} ${className}`}
      {...props}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6 w-full">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton type="card" className="h-32 w-full" />
      <Skeleton type="card" className="h-32 w-full" />
      <Skeleton type="card" className="h-32 w-full" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton type="card" className="h-80 lg:col-span-2 w-full" />
      <Skeleton type="card" className="h-80 w-full" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-4 mt-4">
    <Skeleton className="h-10 w-full rounded-md" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-md" />
    ))}
  </div>
);

export default Skeleton;
