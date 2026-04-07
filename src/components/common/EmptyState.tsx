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
 * Reusable empty state component with an upgraded premium glassmorphism aesthetic.
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
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative group flex flex-col items-center justify-center text-center p-12 overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors duration-300 ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center mb-6 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 relative z-10"
      >
        <Icon
          className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          aria-hidden="true"
        />
      </motion.div>

      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-3 relative z-10">
        {title}
      </h3>

      <p className="text-slate-400 max-w-md mb-8 leading-relaxed relative z-10">{description}</p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="relative z-10 px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label={actionLabel}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
