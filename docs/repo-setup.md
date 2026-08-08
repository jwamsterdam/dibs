# Dibs Repository Setup

## Required Gates

- TypeScript strict mode
- ESLint architecture and security rules
- Jest coverage
- Vite production build
- Bundle budget check
- Critical dependency audit

## Local Workflow

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm run check:bundle
```

## Future Data Contracts

Dibs has no backend in the MVP. If future CoinGecko, Beacon, or app-owned APIs are added,
keep generated clients under `src/api/` and wrap them from feature-owned adapters.

## Release Notes

Before release, confirm PWA metadata, service-worker strategy, mobile viewport behavior,
and secure local-storage requirements.
