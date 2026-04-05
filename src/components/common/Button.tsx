import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Reusable button component with consistent styling and accessibility
 * @param variant - Button style variant (primary, secondary, outline, ghost, danger)
 * @param size - Button size (sm, md, lg)
 * @param loading - Show loading spinner and disable button
 * @param fullWidth - Make button full width
 * @param leftIcon - Icon to display on the left
 * @param rightIcon - Icon to display on the right
 * @param children - Button content
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white hover:scale-105 focus:ring-purple-500 shadow-lg shadow-purple-500/30',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-600',
    outline:
      'border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 focus:ring-slate-600',
    ghost: 'text-slate-300 hover:bg-slate-800 focus:ring-slate-600',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
      {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
};

export default Button;
