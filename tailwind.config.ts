import type { Config } from 'tailwindcss';

// All colours route through CSS custom properties (see src/styles/themes/*).
// Hardcoded colour utilities (e.g. text-blue-500) are forbidden by convention.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          muted: 'var(--color-brand-muted)',
        },
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
        },
        fg: {
          primary: 'var(--color-fg-primary)',
          muted: 'var(--color-fg-muted)',
          'on-brand': 'var(--color-fg-on-brand)',
        },
        gain: 'var(--color-gain)',
        loss: 'var(--color-loss)',
      },
    },
  },
  plugins: [],
} satisfies Config;
