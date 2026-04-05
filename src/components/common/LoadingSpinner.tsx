import React from 'react';
import { Loader2 } from 'lucide-react';

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
 * Reusable loading spinner component
 * @param size - Size of the spinner (sm, md, lg, xl)
 * @param fullScreen - Whether to display full-screen loading overlay
 * @param message - Optional loading message to display
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  message,
}) => {
  const spinner = (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-rose-500`} aria-hidden="true" />
      {message && <p className="text-sm text-slate-400 animate-pulse">{message}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        aria-label="Loading"
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
