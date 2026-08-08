import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/Button/Button';

export function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-primary p-6 text-fg-primary">
      <h1 className="text-2xl font-semibold">{t('nav.dashboard')}</h1>
      <p className="mt-2 text-sm">{t('app.title')}</p>
      <Button className="mt-4">{t('nav.dashboard')}</Button>
    </main>
  );
}
