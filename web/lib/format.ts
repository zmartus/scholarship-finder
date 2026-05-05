export function formatAmount(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Varies";
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
  if (min != null && max != null && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((max ?? min)!);
}

export function formatDeadline(iso: string | null): string {
  if (!iso) return "Rolling";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00").getTime();
  const now = Date.now();
  return Math.round((d - now) / 86_400_000);
}

export function scopeLabel(scope: "school" | "local" | "state" | "national"): string {
  switch (scope) {
    case "school":   return "School-specific";
    case "local":    return "Local / regional";
    case "state":    return "State-wide";
    case "national": return "National";
  }
}
