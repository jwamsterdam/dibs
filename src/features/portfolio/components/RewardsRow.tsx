type RewardsRowProps = {
  readonly label: string;
  readonly value: string;
};

export function RewardsRow({ label, value }: RewardsRowProps): React.JSX.Element {
  return (
    <div className="mt-[1.75rem] flex min-h-14 items-center justify-between border-t border-[var(--color-border-subtle)] pt-5 text-[0.98rem] leading-none">
      <span className="font-bold text-fg-primary">{label}</span>
      <span className="font-bold tabular-nums text-fg-primary">{value}</span>
    </div>
  );
}
