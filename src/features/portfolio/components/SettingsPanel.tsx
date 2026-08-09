import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { useTranslation } from 'react-i18next';
import {
  ComboBox,
  Input as ComboBoxInput,
  Label as ComboBoxLabel,
  ListBox as ComboBoxListBox,
  ListBoxItem as ComboBoxListBoxItem,
  Popover as ComboBoxPopover,
} from 'react-aria-components/ComboBox';
import { CalendarMonthPicker, CalendarYearPicker } from 'react-aria-components/Calendar';
import {
  Button as DatePickerButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Group as DatePickerGroup,
  Label as DatePickerLabel,
  Popover as DatePickerPopover,
} from 'react-aria-components/DatePicker';
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
import { focusFieldBorderClassName, focusWithinFieldBorderClassName } from '@/shared/lib/cn';
import { coinGeckoMaxHistoryDays } from '../data/onlinePortfolioData';
import { usePortfolioSettingsController } from '../hooks/usePortfolioSettingsController';

type SettingsPanelProps = {
  readonly onClose: () => void;
};

const fieldRadiusClassName = 'rounded-[0.85rem]';

function formatCurrencyValue(value: number, currency: string): string {
  return new Intl.NumberFormat('nl-NL', {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export function SettingsPanel({ onClose }: SettingsPanelProps): React.JSX.Element {
  const controller = usePortfolioSettingsController();
  const { t } = useTranslation('portfolio');
  // CoinGecko's free tier can't price a date further back than this, so it's not offered.
  const minPurchaseDate = today(getLocalTimeZone()).subtract({ days: coinGeckoMaxHistoryDays });

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
              aria-label={t('settings.close')}
              className="grid min-h-9 min-w-9 place-items-center rounded-full p-0"
              onPress={onClose}
              variant="ghost"
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rotate-45 border-b-2 border-l-2 border-fg-primary"
              />
            </Button>
            <Heading className="text-center text-[1.25rem] font-bold leading-tight" slot="title">
              {t('settings.title')}
            </Heading>
            <span className="text-right text-[0.78rem] text-fg-muted">
              {controller.isSaving ? t('settings.saving') : ''}
            </span>
          </header>

          {controller.saveError ? (
            <p className="pb-3 text-[0.78rem] text-loss" role="status">
              {t('settings.saveError')}
            </p>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
            <fieldset className="m-0 grid gap-3 border-0 border-b border-[var(--color-border-strong)] p-0 pb-4">
              <legend className="p-0 text-[0.95rem] font-semibold text-fg-primary">
                {t('settings.currencySectionTitle')}
              </legend>
              <Select
                className="group grid gap-2 text-[0.82rem] font-medium text-fg-muted"
                onSelectionChange={controller.selectCurrencyByKey}
                selectedKey={controller.settings.fiatCurrency}
              >
                <SelectLabel>{t('settings.currency')}</SelectLabel>
                <SelectButton
                  className={`grid h-11 w-full grid-cols-[1fr_auto] items-center ${fieldRadiusClassName} border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-left text-[1rem] font-normal uppercase text-fg-primary group-data-[open]:border-brand-primary ${focusFieldBorderClassName}`}
                >
                  <SelectValue />
                  <span
                    aria-hidden="true"
                    className="mb-1 h-2 w-2 rotate-45 border-b-2 border-r-2 border-fg-muted"
                  />
                </SelectButton>
                <Popover className="w-[var(--trigger-width)] overflow-hidden rounded-[0.75rem] border border-[var(--color-border-subtle)] bg-bg-primary">
                  <ListBox className="p-1 outline-none">
                    {controller.currencies.map((currency) => (
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
            </fieldset>

            <fieldset className="m-0 grid gap-3 border-0 p-0">
              <legend className="p-0 text-[0.95rem] font-semibold text-fg-primary">
                {t('settings.addCoinSectionTitle')}
              </legend>

              <ComboBox
                allowsCustomValue
                className="grid gap-2 text-[0.82rem] font-medium text-fg-muted"
                inputValue={controller.query}
                menuTrigger="input"
                onInputChange={controller.setQuery}
                onSelectionChange={controller.selectCoinByKey}
                selectedKey={controller.selectedCoin?.id ?? null}
              >
                <ComboBoxLabel>{t('settings.coin')}</ComboBoxLabel>
                <ComboBoxInput
                  className={`h-11 w-full min-w-0 ${fieldRadiusClassName} border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-[1rem] text-fg-primary placeholder:text-fg-muted ${focusFieldBorderClassName}`}
                  placeholder={t('settings.searchPlaceholder')}
                />

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
                  <span className="text-[0.78rem] text-fg-muted">{t('settings.searching')}</span>
                ) : null}
              </ComboBox>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                <TextField className="grid gap-2 text-[0.82rem] font-medium text-fg-muted">
                  <Label>{t('settings.amount')}</Label>
                  <Input
                    className={`h-11 w-full min-w-0 ${fieldRadiusClassName} border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-[1rem] text-fg-primary ${focusFieldBorderClassName}`}
                    inputMode="decimal"
                    onChange={(event) => controller.setAmount(event.target.value)}
                    placeholder="0,00"
                    value={controller.amount}
                  />
                </TextField>
                <DatePicker
                  className="grid gap-2 text-[0.82rem] font-medium text-fg-muted"
                  minValue={minPurchaseDate}
                  onChange={(date) => controller.setPurchasedAt(date ? date.toString() : '')}
                  value={controller.purchasedAt ? parseDate(controller.purchasedAt) : null}
                >
                  <DatePickerLabel>{t('settings.purchasedAt')}</DatePickerLabel>
                  <DatePickerGroup
                    className={`grid h-11 w-full min-w-0 grid-cols-[1fr_auto] items-center ${fieldRadiusClassName} border border-[var(--color-border-subtle)] bg-bg-primary px-2 text-[0.92rem] text-fg-primary ${focusWithinFieldBorderClassName}`}
                  >
                    <DateInput className="flex items-center">
                      {(segment) => (
                        <DateSegment
                          className="rounded-sm px-0.5 tabular-nums outline-none data-[focused]:bg-bg-secondary data-[placeholder]:text-fg-muted"
                          segment={segment}
                        />
                      )}
                    </DateInput>
                    <DatePickerButton className="grid h-7 w-7 place-items-center rounded-full text-fg-muted outline-none data-[focus-visible]:bg-bg-secondary">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                      >
                        <rect height="15" rx="2.5" width="17" x="3.5" y="5" />
                        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
                      </svg>
                    </DatePickerButton>
                  </DatePickerGroup>
                  <DatePickerPopover className="overflow-hidden rounded-[0.75rem] border border-[var(--color-border-subtle)] bg-bg-primary p-3">
                    <Dialog className="outline-none">
                      <Calendar className="grid gap-2">
                        <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                          <DatePickerButton
                            className="grid h-8 w-8 place-items-center rounded-full text-fg-primary outline-none data-[focus-visible]:bg-bg-secondary data-[hovered]:bg-bg-secondary"
                            slot="previous"
                          >
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 rotate-45 border-b-2 border-l-2 border-fg-primary"
                            />
                          </DatePickerButton>
                          <div className="grid grid-cols-2 gap-1">
                            <CalendarMonthPicker>
                              {({ 'aria-label': ariaLabel, items, onChange, value }) => (
                                <select
                                  aria-label={ariaLabel}
                                  className={`w-full cursor-pointer rounded-[0.4rem] bg-bg-primary py-0.5 text-center text-[0.92rem] font-semibold text-fg-primary ${focusFieldBorderClassName}`}
                                  onChange={(event) => onChange(Number(event.target.value))}
                                  value={value}
                                >
                                  {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.formatted}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </CalendarMonthPicker>
                            <CalendarYearPicker>
                              {({ 'aria-label': ariaLabel, items, onChange, value }) => (
                                <select
                                  aria-label={ariaLabel}
                                  className={`w-full cursor-pointer rounded-[0.4rem] bg-bg-primary py-0.5 text-center text-[0.92rem] font-semibold text-fg-primary ${focusFieldBorderClassName}`}
                                  onChange={(event) => onChange(Number(event.target.value))}
                                  value={value}
                                >
                                  {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.formatted}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </CalendarYearPicker>
                          </div>
                          <DatePickerButton
                            className="grid h-8 w-8 place-items-center rounded-full text-fg-primary outline-none data-[focus-visible]:bg-bg-secondary data-[hovered]:bg-bg-secondary"
                            slot="next"
                          >
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 -rotate-45 border-b-2 border-r-2 border-fg-primary"
                            />
                          </DatePickerButton>
                        </header>
                        <CalendarGrid className="w-full [&_td]:p-0.5">
                          {(date) => (
                            <CalendarCell
                              className="grid h-8 w-8 cursor-default place-items-center rounded-full text-[0.88rem] text-fg-primary outline-none data-[disabled]:opacity-30 data-[unavailable]:opacity-30 data-[focus-visible]:bg-bg-secondary data-[hovered]:bg-bg-secondary data-[outside-month]:text-fg-muted data-[selected]:bg-brand-primary data-[selected]:font-semibold data-[selected]:text-fg-on-brand data-[today]:font-semibold"
                              date={date}
                            />
                          )}
                        </CalendarGrid>
                      </Calendar>
                    </Dialog>
                  </DatePickerPopover>
                </DatePicker>
              </div>

              {controller.purchaseValue !== null ? (
                <p className="text-[0.78rem] text-fg-muted" role="status">
                  {t('settings.purchaseValue', {
                    value: formatCurrencyValue(
                      controller.purchaseValue,
                      controller.settings.fiatCurrency,
                    ),
                  })}
                </p>
              ) : null}
              {controller.purchaseValue === null && controller.isPurchaseValueLoading ? (
                <p className="text-[0.78rem] text-fg-muted" role="status">
                  {t('settings.purchaseValueLoading')}
                </p>
              ) : null}

              <Button
                className="h-11 rounded-[0.75rem] bg-brand-primary text-[1rem] font-semibold text-fg-on-brand disabled:opacity-40"
                isDisabled={!controller.canAddHolding}
                onPress={() => {
                  void controller.addHolding();
                }}
              >
                {t('settings.addHolding')}
              </Button>
            </fieldset>

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
                    aria-label={t('settings.removeHolding', { symbol: holding.symbol })}
                    className="min-h-9 min-w-9 rounded-full p-0 text-[1.2rem] text-loss"
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
