type RewardsRowProps = {
  readonly label: string;
  readonly value: string;
};

export function RewardsRow({ label, value }: RewardsRowProps): React.JSX.Element {
  return (
    <div className="mt-[1.75rem] flex min-h-14 items-center justify-between border-t border-[var(--color-border-subtle)] pt-5 text-[1rem] leading-none">
      <span className="text-fg-primary">{label}</span>
      <span className="font-medium tabular-nums text-fg-primary">{value}</span>
    </div>
  );
}
