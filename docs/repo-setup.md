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

Dibs has no backend in the MVP. CoinGecko is already called directly from the client (see
ADR-0005); future external APIs (e.g. Beacon) should follow the same pattern — a feature-owned
client wrapping `shared/lib/http/client.ts`, validated with Zod at the boundary. See
[`docs/conventions/api-integration.md`](conventions/api-integration.md).

## Release Notes

Before release, confirm PWA metadata, service-worker strategy, mobile viewport behavior,
and secure local-storage requirements.
