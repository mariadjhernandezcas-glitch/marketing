export interface DefinitionItem {
  label: string;
  value: React.ReactNode;
}

export function DefinitionList({ items }: { items: DefinitionItem[] }) {
  return (
    <dl className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-2.5">
          <dt className="text-xs text-ink-faint">{item.label}</dt>
          <dd className="text-right text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
