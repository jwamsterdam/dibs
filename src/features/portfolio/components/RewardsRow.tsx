type RewardsRowProps = {
  readonly label: string;
  readonly value: string;
};

export function RewardsRow({ label, value }: RewardsRowProps): React.JSX.Element {
  return (
    <div className="mt-7 flex min-h-16 items-center justify-between border-t border-[var(--color-border-subtle)] pt-7 text-[1rem]">
      <span className="text-fg-primary">{label}</span>
      <span className="font-medium tabular-nums text-fg-primary">{value}</span>
    </div>
  );
}
