import Link from "next/link";
import { notFound } from "next/navigation";
import { getScholarshipById } from "@/lib/db/queries";
import {
  formatAmount,
  formatDeadline,
  daysUntil,
  scopeLabel,
} from "@/lib/format";

type Params = Promise<{ id: string }>;

// uuid v4 / v7 sanity check — Next.js will hand any string here, so reject
// obvious junk before we hit the DB.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ScholarshipPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const s = await getScholarshipById(id);
  if (!s) notFound();

  const days = daysUntil(s.deadline);
  const college = s.college;

  return (
    <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-12 lg:py-20">
      {/* Breadcrumb */}
      <Link
        href={college ? `/colleges/${college.slug}` : "/colleges"}
        className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-cyan transition-colors"
      >
        <span aria-hidden>←</span>{" "}
        {college ? `Back to ${college.name}` : "Browse colleges"}
      </Link>

      {/* Header ========================================================= */}
      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            {scopeLabel(s.scope)}
          </span>
          {college && (
            <>
              <span className="text-fg-faint">·</span>
              <Link
                href={`/colleges/${college.slug}`}
                className="text-cyan hover:underline"
              >
                {college.name}
              </Link>
            </>
          )}
        </div>

        <h1 className="mt-4 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05]">
          {s.name}
        </h1>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-10 gap-y-4">
          <Stat
            label="Award"
            value={formatAmount(s.amount_min, s.amount_max)}
            gradient
          />
          <Stat
            label="Deadline"
            value={formatDeadline(s.deadline)}
            sub={
              days == null
                ? "Rolling — apply anytime"
                : days < 0
                  ? "Closed for this cycle"
                  : days === 0
                    ? "Closes today"
                    : `${days} days remaining`
            }
            highlight={days != null && days >= 0 && days <= 30}
          />
        </div>
      </header>

      {/* Description ==================================================== */}
      {s.description && (
        <section className="mt-12">
          <h2 className="text-xs font-mono uppercase tracking-[0.22em] text-fg-muted">
            Overview
          </h2>
          <p className="mt-3 text-lg sm:text-xl text-fg-soft leading-relaxed">
            {s.description}
          </p>
        </section>
      )}

      {/* Eligibility ==================================================== */}
      {s.eligibility_text && (
        <section className="mt-12 card p-7 sm:p-8">
          <h2 className="text-xs font-mono uppercase tracking-[0.22em] text-fg-muted">
            Who qualifies
          </h2>
          <p className="mt-3 text-fg leading-relaxed whitespace-pre-line">
            {s.eligibility_text}
          </p>
        </section>
      )}

      {/* Tags =========================================================== */}
      {s.tags && s.tags.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-mono uppercase tracking-[0.22em] text-fg-muted">
            Topics
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.tags.map((t) => (
              <span
                key={t}
                className="text-sm font-mono uppercase tracking-[0.12em] text-fg-soft border border-border-soft bg-bg-elev/60 rounded-full px-3 py-1.5"
              >
                {t.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Apply CTA ====================================================== */}
      <section className="mt-14">
        <a
          href={s.source_url}
          target="_blank"
          rel="noreferrer noopener"
          className="btn-gradient w-full sm:w-auto justify-center text-base"
        >
          {ctaLabel(s.scope)}
          <ExternalArrow />
        </a>
        <p className="mt-3 text-sm text-fg-muted">
          {ctaHelper(s.scope)}
        </p>
      </section>

      {/* Freshness ====================================================== */}
      {s.last_scraped && (
        <p className="mt-12 text-xs font-mono uppercase tracking-[0.18em] text-fg-faint text-center">
          Last verified {new Date(s.last_scraped).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          source: {s.source}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  gradient,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  gradient?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-[0.22em] text-fg-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-4xl sm:text-5xl font-extrabold tracking-tight ${
          gradient
            ? "gradient-text inline-block"
            : highlight
              ? "text-pink"
              : "text-fg"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-sm text-fg-soft">{sub}</p>}
    </div>
  );
}

function ExternalArrow() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 11l6-6M6 4h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// CTA copy reflects what students actually do at the destination —
// the "apply" verb is misleading for school awards that are auto-
// considered via admissions, and for state aid that goes through FFAA/FAFSA.
function ctaLabel(scope: string): string {
  switch (scope) {
    case "school":
      return "View on the official scholarship page";
    case "state":
      return "View the official application process";
    case "national":
    case "local":
    default:
      return "Apply on the official site";
  }
}

function ctaHelper(scope: string): string {
  switch (scope) {
    case "school":
      return "Most school-specific scholarships are considered automatically when you submit your admissions application. Check the page for any required supplements or honors-program applications.";
    case "state":
      return "Florida state aid is typically applied for via the Florida Financial Aid Application (FFAA) and/or FAFSA. The page explains the full process and deadlines.";
    case "national":
      return "We don't process applications. The button opens the foundation's official site in a new tab where you'll start (or continue) the application.";
    case "local":
      return "Local awards usually have their own application. The button opens the official site in a new tab.";
    default:
      return "We don't process applications — the button opens the official site in a new tab.";
  }
}
