import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/Button/Button';
import { createZoneInputSchema, type CreateZoneInput } from '../validation/zone.schema';

export type ZoneFormProps = {
  onSubmit: (input: CreateZoneInput) => void;
  isSubmitting?: boolean;
};

/** Create-zone form. React Hook Form + the shared Zod schema (form/API parity). */
export function ZoneForm({ onSubmit, isSubmitting = false }: ZoneFormProps): React.JSX.Element {
  const { t } = useTranslation('zones');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateZoneInput>({ resolver: zodResolver(createZoneInputSchema) });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="flex flex-col gap-3"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="zone-name" className="text-fg-primary">
          {t('form.name')}
        </label>
        <input
          id="zone-name"
          className="rounded-md bg-bg-secondary px-3 py-2 text-fg-primary"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name ? (
          <p role="alert" className="text-sm">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="zone-description" className="text-fg-primary">
          {t('form.description')}
        </label>
        <input
          id="zone-description"
          className="rounded-md bg-bg-secondary px-3 py-2 text-fg-primary"
          {...register('description')}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('form.saving') : t('form.submit')}
      </Button>
    </form>
  );
}
