import {
  Button as ComboBoxButton,
  ComboBox,
  Input as ComboBoxInput,
  Label as ComboBoxLabel,
  ListBox as ComboBoxListBox,
  ListBoxItem as ComboBoxListBoxItem,
  Popover as ComboBoxPopover,
  type Key,
} from 'react-aria-components/ComboBox';
import { Dialog, Heading } from 'react-aria-components/Dialog';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import {
  Button as SelectButton,
  Label as SelectLabel,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components/Select';
import { Input, Label, TextField } from 'react-aria-components/TextField';
import { Button } from '@/shared/components/Button/Button';
import type { PortfolioFiatCurrency } from '../types/settings';
import { usePortfolioSettingsController } from '../hooks/usePortfolioSettingsController';

type SettingsPanelProps = {
  readonly onClose: () => void;
};

const currencies: readonly PortfolioFiatCurrency[] = ['eur', 'usd', 'gbp', 'chf'];

export function SettingsPanel({ onClose }: SettingsPanelProps): React.JSX.Element {
  const controller = usePortfolioSettingsController();

  function selectCoin(key: Key | null): void {
    if (key === null) {
      return;
    }

    const coin = controller.searchResults.find((item) => item.id === key);
    if (coin !== undefined) {
      controller.selectCoin(coin);
    }
  }

  function selectCurrency(key: Key | null): void {
    if (typeof key !== 'string') {
      return;
    }

    const currency = currencies.find((item) => item === key);
    if (currency !== undefined) {
      controller.setCurrency(currency);
    }
  }

  return (
    <ModalOverlay
      className="fixed inset-0 z-50 bg-bg-primary px-[1.35rem] pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-fg-primary"
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <Modal className="mx-auto h-full w-full max-w-[25.2rem]">
        <Dialog className="flex h-full flex-col outline-none">
          <header className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center pb-4">
            <Button
              aria-label="Sluit instellingen"
              className="grid min-h-9 min-w-9 place-items-center rounded-full p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              onPress={onClose}
              variant="ghost"
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rotate-45 border-b-2 border-l-2 border-fg-primary"
              />
            </Button>
            <Heading className="text-center text-[1.25rem] font-bold leading-tight" slot="title">
              Settings
            </Heading>
            <span className="text-right text-[0.78rem] text-fg-muted">
              {controller.isSaving ? 'Saving' : ''}
            </span>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
            <div className="grid gap-3">
              <ComboBox
                allowsCustomValue
                className="grid gap-2 text-[0.82rem] font-medium text-fg-muted"
                inputValue={controller.form.query}
                menuTrigger="input"
                onInputChange={controller.setQuery}
                onSelectionChange={selectCoin}
                selectedKey={controller.form.selectedCoin?.id ?? null}
              >
                <ComboBoxLabel>Coin</ComboBoxLabel>
                <div className="grid grid-cols-[minmax(0,1fr)_2.25rem] rounded-[0.85rem] border border-[var(--color-border-subtle)] bg-bg-primary focus-within:border-brand-primary">
                  <ComboBoxInput
                    className="h-11 min-w-0 rounded-[0.85rem] bg-bg-primary px-3 text-[1rem] text-fg-primary outline-none placeholder:text-fg-muted"
                    placeholder="Zoek coin"
                  />
                  <ComboBoxButton className="grid h-11 place-items-center rounded-[0.85rem] text-fg-muted outline-none">
                    <span
                      aria-hidden="true"
                      className="mb-1 h-2 w-2 rotate-45 border-b-2 border-r-2 border-fg-muted"
                    />
                  </ComboBoxButton>
                </div>

                <ComboBoxPopover className="w-[var(--trigger-width)] overflow-hidden rounded-[0.75rem] border border-[var(--color-border-subtle)] bg-bg-primary">
                  <ComboBoxListBox className="max-h-44 overflow-y-auto p-1 outline-none">
                    {controller.searchResults.map((coin) => (
                      <ComboBoxListBoxItem
                        className="cursor-default rounded-[0.45rem] px-3 py-2 text-[0.95rem] font-normal text-fg-primary outline-none data-[focused]:bg-bg-secondary data-[selected]:font-semibold"
                        id={coin.id}
                        key={coin.id}
                        textValue={`${coin.name} ${coin.symbol}`}
                      >
                        {coin.name} ({coin.symbol})
                      </ComboBoxListBoxItem>
                    ))}
                  </ComboBoxListBox>
                </ComboBoxPopover>

                {controller.isSearching ? (
                  <span className="text-[0.78rem] text-fg-muted">Zoeken...</span>
                ) : null}
              </ComboBox>

              <Select
                className="grid gap-2 text-[0.82rem] font-medium text-fg-muted"
                onSelectionChange={selectCurrency}
                selectedKey={controller.settings.fiatCurrency}
              >
                <SelectLabel>Valuta</SelectLabel>
                <SelectButton className="grid h-11 w-full grid-cols-[1fr_auto] items-center rounded-[0.85rem] border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-left text-[1rem] font-normal uppercase text-fg-primary outline-none focus-visible:border-brand-primary">
                  <SelectValue />
                  <span
                    aria-hidden="true"
                    className="mb-1 h-2 w-2 rotate-45 border-b-2 border-r-2 border-fg-muted"
                  />
                </SelectButton>
                <Popover className="w-[var(--trigger-width)] overflow-hidden rounded-[0.75rem] border border-[var(--color-border-subtle)] bg-bg-primary">
                  <ListBox className="p-1 outline-none">
                    {currencies.map((currency) => (
                      <ListBoxItem
                        className="cursor-default rounded-[0.45rem] px-3 py-2 text-[1rem] font-normal uppercase text-fg-primary outline-none data-[focused]:bg-bg-secondary data-[selected]:font-semibold"
                        id={currency}
                        key={currency}
                        textValue={currency.toUpperCase()}
                      >
                        {currency.toUpperCase()}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                <TextField className="grid gap-2 text-[0.82rem] font-medium text-fg-muted">
                  <Label>Aantal</Label>
                  <Input
                    className="h-11 w-full min-w-0 rounded-[0.65rem] border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-[1rem] text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                    inputMode="decimal"
                    onChange={(event) => controller.setAmount(event.target.value)}
                    placeholder="0,00"
                    value={controller.form.amount}
                  />
                </TextField>
                <TextField className="grid gap-2 text-[0.82rem] font-medium text-fg-muted">
                  <Label>Aankoop</Label>
                  <Input
                    className="h-11 w-full min-w-0 rounded-[0.65rem] border border-[var(--color-border-subtle)] bg-bg-primary px-2 text-[0.92rem] text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                    onChange={(event) => controller.setPurchasedAt(event.target.value)}
                    type="date"
                    value={controller.form.purchasedAt}
                  />
                </TextField>
              </div>

              <Button
                className="h-11 rounded-[0.75rem] bg-brand-primary text-[1rem] font-semibold text-fg-on-brand disabled:opacity-40"
                isDisabled={!controller.canAddHolding}
                onPress={controller.addHolding}
              >
                Voeg coin toe
              </Button>
            </div>

            <ul className="border-t border-[var(--color-border-strong)]">
              {controller.settings.holdings.map((holding) => (
                <li
                  className="grid min-h-[3.25rem] grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[var(--color-border-subtle)]"
                  key={holding.id}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[0.98rem] font-medium">
                      {holding.symbol}
                    </span>
                    <span className="block truncate text-[0.78rem] text-fg-muted">
                      {holding.amount} / {holding.purchasedAt}
                    </span>
                  </span>
                  <span className="text-[0.78rem] text-fg-muted">{holding.name}</span>
                  <Button
                    aria-label={`Verwijder ${holding.symbol}`}
                    className="min-h-9 min-w-9 rounded-full p-0 text-[1.2rem] text-loss focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                    onPress={() => controller.removeHolding(holding.id)}
                    variant="secondary"
                  >
                    x
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
