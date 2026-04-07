import { forwardRef, LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-xs font-medium text-ink-600 mb-1.5 block', className)}
        {...props}
      />
    );
  },
);

Label.displayName = 'Label';
