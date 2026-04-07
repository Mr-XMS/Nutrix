import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-9 w-full px-3 text-sm bg-white text-ink-900 placeholder:text-ink-400',
          'border border-ink-200 rounded-md',
          'transition-colors duration-150',
          'hover:border-ink-300',
          'focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500',
          'disabled:bg-ink-50 disabled:text-ink-400 disabled:cursor-not-allowed',
          error && 'border-danger focus:border-danger focus:ring-danger',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
