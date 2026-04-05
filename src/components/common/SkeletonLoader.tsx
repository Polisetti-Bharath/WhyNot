import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

/**
 * Reusable skeleton loader component for content loading states
 * @param variant - Type of skeleton (text, circular, rectangular, card)
 * @param width - Custom width
 * @param height - Custom height
 * @param count - Number of skeleton items to render
 * @param className - Additional CSS classes
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const baseClasses =
    'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl h-48',
  };

  const style = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '3rem' : '100%'),
  };

  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  ));

  return count > 1 ? <div className="space-y-3">{skeletonItems}</div> : <>{skeletonItems}</>;
};

export default SkeletonLoader;
