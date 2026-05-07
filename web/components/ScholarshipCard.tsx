import Link from "next/link";
import type { Scholarship } from "@/lib/db/queries";
import { formatAmount, formatDeadline, daysUntil, scopeLabel } from "@/lib/format";

export function ScholarshipCard({ s }: { s: Scholarship }) {
  const days = daysUntil(s.deadline);
  const urgent = days != null && days >= 0 && days <= 30;
  const past = days != null && days < 0;

  return (
    <Link
      href={`/scholarships/${s.id}`}
      className="match-card block p-6 sm:p-7 hover:border-border-strong transition-colors group"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <DeadlinePill iso={s.deadline} days={days} urgent={urgent} past={past} />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          {scopeLabel(s.scope)}
        </span>
      </div>

      <p className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text inline-block">
        {formatAmount(s.amount_min, s.amount_max)}
      </p>

      <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-fg group-hover:text-cyan transition-colors">
        {s.name}
      </h3>

      {s.eligibility_text && (
        <p className="mt-3 text-fg-soft leading-relaxed line-clamp-2">
          {s.eligibility_text}
        </p>
      )}

      {s.tags && s.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {s.tags.map((t) => (
            <span
              key={t}
              className="text-[12px] font-mono uppercase tracking-[0.12em] text-fg-soft border border-border-soft bg-bg-elev/60 rounded-full px-2.5 py-1"
            >
              {t.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-border-soft flex items-center justify-between">
        <span className="text-sm text-fg-muted">
          {formatDeadline(s.deadline)}
        </span>
        <span className="text-sm text-fg-soft group-hover:text-cyan transition-colors inline-flex items-center gap-2">
          View details <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

function DeadlinePill({
  iso,
  days,
  urgent,
  past,
}: {
  iso: string | null;
  days: number | null;
  urgent: boolean;
  past: boolean;
}) {
  if (iso == null) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.18em] text-cyan border border-cyan/30 bg-cyan/5 rounded-full px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan" /> Rolling
      </span>
    );
  }
  if (past) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.18em] text-fg-muted border border-border bg-bg-elev/40 rounded-full px-3 py-1">
        Closed
      </span>
    );
  }
  if (urgent) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.18em] text-pink border border-pink/40 bg-pink/10 rounded-full px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" /> {days} days left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.18em] text-fg-soft border border-border bg-bg-elev/40 rounded-full px-3 py-1">
      {days} days left
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
