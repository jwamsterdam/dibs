import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-fg-on-brand hover:opacity-90',
  secondary: 'bg-bg-secondary text-fg-primary hover:opacity-90',
};

/**
 * Generic button. Presentational only — colours route through theme tokens.
 * (Placeholder until the Untitled UI component set is wired in during WP0.)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
});
