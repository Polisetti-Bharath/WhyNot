import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showIcon?: boolean;
}

/**
 * Accessible tooltip component for contextual help
 * @param content - Tooltip content text
 * @param children - Optional custom trigger element
 * @param position - Tooltip position relative to trigger (default: 'top')
 * @param className - Additional CSS classes
 * @param showIcon - Show default help icon (default: true if no children)
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  showIcon = !children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800',
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
        setIsFocused(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (!isFocused) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isFocused) {
      setIsVisible(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsVisible(false);
  };

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 rounded transition-colors"
        aria-label={`Help: ${content}`}
        aria-describedby={isVisible ? 'tooltip-content' : undefined}
        aria-expanded={isVisible}
      >
        {children ||
          (showIcon && (
            <HelpCircle
              className="w-4 h-4 text-slate-400 hover:text-purple-400 transition-colors"
              aria-hidden="true"
            />
          ))}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-800 rounded-lg shadow-lg border border-slate-700 max-w-xs whitespace-normal ${positionClasses[position]} animate-in fade-in duration-200`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
