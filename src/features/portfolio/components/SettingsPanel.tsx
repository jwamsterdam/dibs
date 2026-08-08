import { useState } from 'react';
import type { PortfolioFiatCurrency } from '../types/settings';
import { usePortfolioSettingsController } from '../hooks/usePortfolioSettingsController';

type SettingsPanelProps = {
  readonly onClose: () => void;
};

const currencies: readonly PortfolioFiatCurrency[] = ['eur', 'usd', 'gbp', 'chf'];

export function SettingsPanel({ onClose }: SettingsPanelProps): React.JSX.Element {
  const controller = usePortfolioSettingsController();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  function selectCurrency(currency: PortfolioFiatCurrency): void {
    controller.setCurrency(currency);
    setIsCurrencyOpen(false);
  }

  return (
    <section className="fixed inset-0 z-50 bg-bg-primary px-[1.35rem] pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-fg-primary">
      <div className="mx-auto flex h-full w-full max-w-[25.2rem] flex-col">
        <header className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center pb-4">
          <button
            aria-label="Sluit instellingen"
            className="grid min-h-9 min-w-9 place-items-center rounded-full text-[1.55rem] leading-none text-fg-primary hover:bg-bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            onClick={onClose}
            type="button"
          >
            {'‹'}
          </button>
          <h2 className="text-center text-[1.25rem] font-bold leading-tight">Settings</h2>
          <span className="text-right text-[0.78rem] text-fg-muted">{controller.isSaving ? 'Saving' : ''}</span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
          <div className="grid gap-3">
            <div className="relative grid gap-2 text-[0.82rem] font-medium text-fg-muted">
              <label htmlFor="coin-search">Coin</label>
              <input
                className="h-11 w-full min-w-0 rounded-[0.65rem] border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-[1rem] text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                id="coin-search"
                onChange={(event) => controller.setQuery(event.target.value)}
                placeholder="Zoek coin"
                type="search"
                value={controller.form.query}
              />

              {controller.searchResults.length > 0 ? (
                <ul className="max-h-44 w-full overflow-y-auto rounded-[0.65rem] border border-[var(--color-border-subtle)] bg-bg-primary shadow-lg">
                  {controller.searchResults.map((coin) => (
                    <li className="border-b border-[var(--color-border-subtle)] last:border-b-0" key={coin.id}>
                      <button
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                        onClick={() => controller.selectCoin(coin)}
                        type="button"
                      >
                        <span className="truncate text-[0.95rem] font-medium text-fg-primary">{coin.name}</span>
                        <span className="text-[0.78rem] font-semibold uppercase text-fg-muted">{coin.symbol}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {controller.isSearching ? <span className="text-[0.78rem] text-fg-muted">Zoeken...</span> : null}
            </div>

            <div className="relative grid gap-2 text-[0.82rem] font-medium text-fg-muted">
              <span id="portfolio-currency-label">Valuta</span>
              <button
                aria-expanded={isCurrencyOpen}
                aria-haspopup="listbox"
                aria-labelledby="portfolio-currency-label portfolio-currency-value"
                className="grid h-11 w-full grid-cols-[1fr_auto] items-center rounded-[0.8rem] border border-[var(--color-border-subtle)] bg-bg-secondary px-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                onClick={() => setIsCurrencyOpen((current) => !current)}
                type="button"
              >
                <span
                  className="text-[1rem] font-semibold uppercase leading-none text-fg-primary"
                  id="portfolio-currency-value"
                >
                  {controller.settings.fiatCurrency.toUpperCase()}
                </span>
                <span
                  aria-hidden="true"
                  className={`text-[1rem] leading-none text-fg-muted transition-transform duration-150 ${isCurrencyOpen ? 'rotate-180' : ''}`}
                >
                  {'⌄'}
                </span>
              </button>
              {isCurrencyOpen ? (
                <ul
                  aria-labelledby="portfolio-currency-label"
                  className="overflow-hidden rounded-[0.8rem] border border-[var(--color-border-subtle)] bg-bg-primary shadow-lg"
                  role="listbox"
                >
                  {currencies.map((currency) => {
                    const isSelected = currency === controller.settings.fiatCurrency;
                    return (
                      <li key={currency} role="presentation">
                        <button
                          aria-selected={isSelected}
                          className="grid h-11 w-full grid-cols-[1fr_auto] items-center px-3 text-left text-[0.98rem] font-semibold uppercase text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary aria-selected:bg-brand-muted aria-selected:text-brand-primary"
                          onClick={() => selectCurrency(currency)}
                          role="option"
                          type="button"
                        >
                          <span>{currency.toUpperCase()}</span>
                          {isSelected ? <span aria-hidden="true">✓</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <label className="grid gap-2 text-[0.82rem] font-medium text-fg-muted">
                Aantal
                <input
                  className="h-11 w-full min-w-0 rounded-[0.65rem] border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-[1rem] text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  inputMode="decimal"
                  onChange={(event) => controller.setAmount(event.target.value)}
                  placeholder="0,00"
                  value={controller.form.amount}
                />
              </label>
              <label className="grid gap-2 text-[0.82rem] font-medium text-fg-muted">
                Aankoop
                <input
                  className="h-11 w-full min-w-0 rounded-[0.65rem] border border-[var(--color-border-subtle)] bg-bg-primary px-2 text-[0.92rem] text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  onChange={(event) => controller.setPurchasedAt(event.target.value)}
                  type="date"
                  value={controller.form.purchasedAt}
                />
              </label>
            </div>

            <button
              className="h-11 rounded-[0.75rem] bg-brand-primary text-[1rem] font-semibold text-fg-on-brand disabled:opacity-40"
              disabled={!controller.canAddHolding}
              onClick={controller.addHolding}
              type="button"
            >
              Voeg coin toe
            </button>
          </div>

          <ul className="border-t border-[var(--color-border-strong)]">
            {controller.settings.holdings.map((holding) => (
              <li
                className="grid min-h-[3.25rem] grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[var(--color-border-subtle)]"
                key={holding.id}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[0.98rem] font-medium">{holding.symbol}</span>
                  <span className="block truncate text-[0.78rem] text-fg-muted">
                    {holding.amount} · {holding.purchasedAt}
                  </span>
                </span>
                <span className="text-[0.78rem] text-fg-muted">{holding.name}</span>
                <button
                  aria-label={`Verwijder ${holding.symbol}`}
                  className="min-h-9 min-w-9 rounded-full text-[1.2rem] text-loss focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  onClick={() => controller.removeHolding(holding.id)}
                  type="button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
