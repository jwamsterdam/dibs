/**
 * Upgrades a pre-multi-account config (`{ personName, fiatCurrency, holdings }`) into the
 * current `{ fiatCurrency, people }` shape before it's Zod-parsed. Kept as a pure module (no
 * IndexedDB import) so it's directly unit-testable, unlike portfolioConfigRepository.ts which
 * is istanbul-ignored (jsdom has no IndexedDB).
 *
 * Read-only: re-runs on every `loadSettings()` call rather than writing the migrated shape
 * back to disk. The fixed id (not `crypto.randomUUID()`) keeps that idempotent — a random id
 * would drift across refetches within the same session and confuse active-person resolution.
 */
export function migrateLegacyPortfolioConfig(raw: unknown): unknown {
  if (raw !== null && typeof raw === 'object' && 'holdings' in raw && !('people' in raw)) {
    const legacy = raw as { personName?: unknown; fiatCurrency: unknown; holdings: unknown };
    return {
      fiatCurrency: legacy.fiatCurrency,
      people: [
        { holdings: legacy.holdings, id: 'migrated-person', name: legacy.personName ?? 'JW' },
      ],
    };
  }
  return raw;
}
