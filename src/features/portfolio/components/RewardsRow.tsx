type RewardsRowProps = {
  readonly label: string;
  readonly value: string;
};

export function RewardsRow({ label, value }: RewardsRowProps): React.JSX.Element {
  return (
    <div className="flex min-h-11 items-center justify-between border-t border-[var(--color-border-subtle)] text-[0.9rem]">
      <span className="text-fg-muted">{label}</span>
      <span className="tabular-nums text-fg-primary">{value}</span>
    </div>
  );
}
