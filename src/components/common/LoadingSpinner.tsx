import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

/**
 * Reusable premium loading spinner component using Framer Motion
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  message,
}) => {
  const spinnerContainer = (
    <div
      className="flex flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
        />

        {/* Middle pulsing ring */}
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 3, ease: 'linear', repeat: Infinity },
            scale: { duration: 2, ease: 'easeInOut', repeat: Infinity },
          }}
          className="absolute inset-1 rounded-full border-b-2 border-l-2 border-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        />

        {/* Inner solid core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
          className="w-1/3 h-1/3 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.6)]"
        />
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-wide text-slate-300 animate-pulse bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          {message}
        </motion.p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100]"
        aria-label="Loading"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-12 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl"
        >
          {spinnerContainer}
        </motion.div>
      </div>
    );
  }

  return spinnerContainer;
};

export default LoadingSpinner;
