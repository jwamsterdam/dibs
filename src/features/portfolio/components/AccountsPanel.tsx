import { useTranslation } from 'react-i18next';
import { Dialog, Heading } from 'react-aria-components/Dialog';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import { Input, Label, TextField } from 'react-aria-components/TextField';
import { Button } from '@/shared/components/Button/Button';
import { focusFieldBorderClassName } from '@/shared/lib/cn';
import { useAccountsController } from '../hooks/useAccountsController';

type AccountsPanelProps = {
  readonly onClose: () => void;
};

const fieldRadiusClassName = 'rounded-[0.85rem]';

export function AccountsPanel({ onClose }: AccountsPanelProps): React.JSX.Element {
  const controller = useAccountsController();
  const { t } = useTranslation('portfolio');

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
              aria-label={t('accounts.close')}
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
              {t('accounts.title')}
            </Heading>
            <span className="text-right text-[0.78rem] text-fg-muted">
              {controller.isSaving ? t('accounts.saving') : ''}
            </span>
          </header>

          {controller.saveError ? (
            <p className="pb-3 text-[0.78rem] text-loss" role="status">
              {t('accounts.saveError')}
            </p>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
            <fieldset className="m-0 grid gap-3 border-0 p-0">
              <legend className="p-0 text-[0.95rem] font-semibold text-fg-primary">
                {t('accounts.addSectionTitle')}
              </legend>

              <TextField className="grid gap-2 text-[0.82rem] font-medium text-fg-muted">
                <Label>{t('accounts.nameLabel')}</Label>
                <Input
                  className={`h-11 w-full min-w-0 ${fieldRadiusClassName} border border-[var(--color-border-subtle)] bg-bg-primary px-3 text-[1rem] text-fg-primary placeholder:text-fg-muted ${focusFieldBorderClassName}`}
                  onChange={(event) => controller.setName(event.target.value)}
                  placeholder={t('accounts.namePlaceholder')}
                  value={controller.name}
                />
              </TextField>

              <div className="grid grid-cols-[1fr_auto] gap-3">
                <Button
                  className="h-11 rounded-[0.75rem] bg-brand-primary text-[1rem] font-semibold text-fg-on-brand disabled:opacity-40"
                  isDisabled={!controller.canSubmit}
                  onPress={controller.submitPerson}
                >
                  {controller.editingPersonId === null
                    ? t('accounts.addPerson')
                    : t('accounts.updatePerson')}
                </Button>
                {controller.editingPersonId !== null ? (
                  <Button
                    className="h-11 rounded-[0.75rem] px-4 text-[1rem] font-semibold"
                    onPress={controller.cancelEditPerson}
                    variant="secondary"
                  >
                    {t('accounts.cancelEdit')}
                  </Button>
                ) : null}
              </div>
            </fieldset>

            <ul className="border-t border-[var(--color-border-strong)]">
              {controller.people.map((person) => (
                <li
                  className="group grid min-h-[3.25rem] grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[var(--color-border-subtle)] data-[editing]:bg-bg-secondary"
                  data-editing={person.id === controller.editingPersonId ? '' : undefined}
                  key={person.id}
                >
                  <Button
                    aria-label={t('accounts.selectPerson', { name: person.name })}
                    className="min-h-9 justify-self-start truncate text-left text-[0.98rem] font-medium text-fg-primary aria-[current=true]:font-semibold aria-[current=true]:text-brand-primary"
                    onPress={() => {
                      controller.selectPerson(person.id);
                      onClose();
                    }}
                    variant="ghost"
                    {...(person.id === controller.activePersonId
                      ? { 'aria-current': 'true' as const }
                      : {})}
                  >
                    {person.name}
                  </Button>
                  <Button
                    aria-label={t('accounts.editPerson', { name: person.name })}
                    className="min-h-9 min-w-9 rounded-full p-0 text-[1.05rem]"
                    onPress={() => controller.startEditPerson(person.id)}
                    variant="secondary"
                  >
                    {'✎'}
                  </Button>
                  {controller.canDelete ? (
                    <Button
                      aria-label={t('accounts.removePerson', { name: person.name })}
                      className="min-h-9 min-w-9 rounded-full p-0 text-[1.2rem] text-loss"
                      onPress={() => controller.deletePerson(person.id)}
                      variant="secondary"
                    >
                      x
                    </Button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
