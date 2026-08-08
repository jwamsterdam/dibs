import { useTranslation } from 'react-i18next';
import { ZoneForm } from '../components/ZoneForm';
import { ZoneList } from '../components/ZoneList';
import { useZonesController } from '../hooks/useZonesController';

/** Route-level page: thin — delegates to the controller hook and presentational components. */
export function ZonesPage(): React.JSX.Element {
  const { t } = useTranslation('zones');
  const { query, selectedId, selectZone, createZone, isCreating } = useZonesController();

  return (
    <main className="min-h-screen bg-bg-primary p-6 text-fg-primary">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="zones-list-heading">
          <h2 id="zones-list-heading" className="mb-2 text-lg">
            {t('list.heading')}
          </h2>
          {query.isPending ? <p>{t('list.loading')}</p> : null}
          {query.isError ? <p role="alert">{t('list.error')}</p> : null}
          {query.isSuccess ? (
            <ZoneList zones={query.data} selectedId={selectedId} onSelect={selectZone} />
          ) : null}
        </section>

        <section aria-labelledby="zones-form-heading">
          <h2 id="zones-form-heading" className="mb-2 text-lg">
            {t('form.heading')}
          </h2>
          <ZoneForm onSubmit={createZone} isSubmitting={isCreating} />
        </section>
      </div>
    </main>
  );
}
