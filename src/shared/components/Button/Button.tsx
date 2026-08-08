import { forwardRef } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components/Button';
import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'ghost' | 'primary' | 'secondary';

export type ButtonProps = Omit<AriaButtonProps, 'className'> & {
  variant?: ButtonVariant;
  className?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ghost: 'text-fg-primary hover:bg-bg-secondary',
  primary: 'bg-brand-primary text-fg-on-brand hover:opacity-90',
  secondary: 'bg-bg-secondary text-fg-primary hover:opacity-90',
};

/**
 * Generic React Aria button. Presentational only; colors route through theme tokens.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, type = 'button', ...props },
  ref,
) {
  return (
    <AriaButton
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
