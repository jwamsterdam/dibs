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
        },
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
        },
        fg: {
          primary: 'var(--color-fg-primary)',
          'on-brand': 'var(--color-fg-on-brand)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
