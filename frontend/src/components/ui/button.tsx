import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700 disabled:bg-ink-300',
  secondary:
    'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100 disabled:text-ink-300',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-900 active:bg-ink-100',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-md',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
