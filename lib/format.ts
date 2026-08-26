// Escala no expone la moneda de la cuenta en esta API, así que se muestra el
// monto sin símbolo de moneda para no asumir una equivocada.
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatHours(hours: number | null): string {
  if (hours === null || Number.isNaN(hours)) return "—";
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} días`;
}

export function formatDays(days: number | null): string {
  if (days === null || Number.isNaN(days)) return "—";
  return `${days.toFixed(1)} días`;
}

export function formatPercent(ratio: number | null): string {
  if (ratio === null || Number.isNaN(ratio)) return "—";
  return `${(ratio * 100).toFixed(0)}%`;
}
