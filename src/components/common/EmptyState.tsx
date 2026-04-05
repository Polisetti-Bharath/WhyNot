import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Reusable empty state component with optional CTA
 * @param icon - Lucide icon component
 * @param title - Empty state title
 * @param description - Empty state description
 * @param actionLabel - Optional CTA button label
 * @param onAction - Optional CTA button action
 * @param className - Additional CSS classes
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center p-12 ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700">
        <Icon className="w-10 h-10 text-slate-500" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-lg font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
