import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  isAutoConsidered,
  listScholarshipsForCollege,
  type Scholarship,
} from "@/lib/db/queries";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { ScholarshipListWithMatches } from "@/components/ScholarshipListWithMatches";
import { formatAmount, daysUntil } from "@/lib/format";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ filter?: "upcoming" | "all" }>;

export default async function CollegePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { filter = "upcoming" } = await searchParams;

  const college = await getCollegeBySlug(slug);
  if (!college) notFound();

  const all = await listScholarshipsForCollege(college.id);
  const visible =
    filter === "all"
      ? all
      : all.filter((s) => {
          const d = daysUntil(s.deadline);
          // include rolling (null) and not-yet-passed
          return s.deadline == null || (d != null && d >= 0);
        });

  const stats = computeStats(all);

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-12 lg:py-20">
      {/* Breadcrumb / change-school */}
      <Link
        href="/colleges"
        className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-cyan transition-colors"
      >
        <span aria-hidden>←</span> Change school
      </Link>

      {/* Header ========================================================= */}
      <header className="mt-6">
        <p className="badge-pill">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          {college.type ? college.type.replace(/-/g, " ") : "College"} ·{" "}
          {college.city ? `${college.city}, ` : ""}
          {college.state}
        </p>
        <h1 className="mt-5 font-extrabold text-5xl sm:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.02]">
          {college.name.includes(" ") ? (
            <>
              {college.name.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text">{college.name.split(" ").slice(-1)[0]}</span>
            </>
          ) : (
            <span className="gradient-text">{college.name}</span>
          )}
        </h1>
        {college.website && (
          <a
            href={college.website}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-2 text-fg-soft hover:text-cyan transition-colors"
          >
            <span>{college.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
            <ExternalArrow />
          </a>
        )}
      </header>

      {/* Two-section list — first thing after the college header so the
          actionable scholarships are above the fold. Stats moved to the
          bottom (they're nice-to-have, not the user's primary goal). === */}
      {(() => {
        const actionable = visible.filter((s) => !isAutoConsidered(s));
        const auto = visible.filter((s) => isAutoConsidered(s));
        if (visible.length === 0) {
          return (
            <section className="mt-14">
              <EmptyState collegeName={college.name} hasAny={all.length > 0} />
            </section>
          );
        }
        return (
          <>
            {/* TOP SECTION — curated, AI-ranked actionable scholarships. */}
            <section className="mt-14">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight">
                    Apply to these
                  </h2>
                  <p className="mt-2 text-fg-muted">
                    You might have missed them without us — scholarships
                    requiring a separate application, ranked for your profile.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm shrink-0">
                  <FilterTab
                    href={`/colleges/${slug}?filter=upcoming`}
                    active={filter !== "all"}
                  >
                    Open ({stats.openCount})
                  </FilterTab>
                  <FilterTab
                    href={`/colleges/${slug}?filter=all`}
                    active={filter === "all"}
                  >
                    All ({stats.count})
                  </FilterTab>
                </div>
              </div>
              {actionable.length === 0 ? (
                <div className="mt-5 card text-center py-10 px-6">
                  <p className="text-fg-soft">
                    We&apos;re still curating the application-required scholarships for{" "}
                    {college.name}. The auto-considered awards below show what you&apos;ll
                    be in line for if admitted.
                  </p>
                </div>
              ) : (
                <ScholarshipListWithMatches
                  scholarships={actionable}
                  collegeSlug={slug}
                  collegeName={college.name}
                />
              )}
            </section>

            {/* AUTO-CONSIDERED — sibling H2 ============================= */}
            {auto.length > 0 && (
              <section className="mt-16">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight text-fg-soft">
                    You&apos;re in line for these
                  </h2>
                  <span className="text-lg text-fg-muted font-mono">{auto.length}</span>
                </div>
                <p className="mt-2 text-fg-muted">
                  Awarded automatically when you&apos;re admitted — no separate form to fill out.
                </p>
                <ul className="mt-5 grid sm:grid-cols-2 gap-5">
                  {auto.map((s) => (
                    <li key={s.id}>
                      <ScholarshipCard s={s} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        );
      })()}

      {/* Stat strip — moved below the scholarship sections so the
          actionable list is above the fold. Still useful as a summary. */}
      {all.length > 0 && (
        <section className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl border border-border overflow-hidden">
          <StatCell label="Scholarships indexed" value={stats.count.toString()} />
          <StatCell
            label="Total potential"
            value={stats.totalMax > 0 ? formatAmount(null, stats.totalMax) : "—"}
          />
          <StatCell
            label="Average award"
            value={stats.avg > 0 ? formatAmount(null, stats.avg) : "—"}
          />
          <StatCell
            label="Next deadline"
            value={stats.nextDeadlineLabel}
            accent={stats.nextDeadlineDays != null && stats.nextDeadlineDays <= 30}
          />
        </section>
      )}

      {/* Source attribution / freshness ================================ */}
      {all.length > 0 && (
        <p className="mt-8 text-center text-sm text-fg-muted">
          Data refreshed automatically. Always verify deadlines and eligibility on the
          official scholarship page before applying.
        </p>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function computeStats(items: Scholarship[]) {
  const count = items.length;
  const amounts = items
    .map((s) => s.amount_max ?? s.amount_min ?? 0)
    .filter((n): n is number => Number.isFinite(n) && n > 0);
  const totalMax = amounts.reduce((a, b) => a + b, 0);
  const avg = amounts.length > 0 ? Math.round(totalMax / amounts.length) : 0;

  const upcoming = items
    .map((s) => daysUntil(s.deadline))
    .filter((d): d is number => d != null && d >= 0)
    .sort((a, b) => a - b);

  const openCount = items.filter((s) => {
    const d = daysUntil(s.deadline);
    return s.deadline == null || (d != null && d >= 0);
  }).length;

  const nextDeadlineDays = upcoming[0] ?? null;
  const nextDeadlineLabel =
    nextDeadlineDays == null
      ? items.some((s) => s.deadline == null)
        ? "Rolling"
        : "—"
      : nextDeadlineDays === 0
        ? "Today"
        : `${nextDeadlineDays}d`;

  return { count, totalMax, avg, openCount, nextDeadlineDays, nextDeadlineLabel };
}

/* ---------------- presentational ---------------- */

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-bg-soft p-5 sm:p-6">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-fg-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${
          accent ? "gradient-text" : "text-fg"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterTab({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full px-4 py-2 bg-bg-elev border border-border-strong text-fg"
          : "rounded-full px-4 py-2 border border-border text-fg-soft hover:text-fg hover:border-border-strong transition-colors"
      }
    >
      {children}
    </Link>
  );
}

function EmptyState({
  collegeName,
  hasAny,
}: {
  collegeName: string;
  hasAny: boolean;
}) {
  return (
    <div className="card text-center py-16 px-8">
      <div className="mx-auto w-14 h-14 rounded-full border border-border-strong flex items-center justify-center text-fg-muted text-2xl">
        ⌀
      </div>
      <h3 className="mt-5 text-2xl font-bold tracking-tight">
        {hasAny
          ? `No open scholarships at ${collegeName} right now`
          : `We're still indexing ${collegeName}`}
      </h3>
      <p className="mt-3 max-w-md mx-auto text-fg-soft leading-relaxed">
        {hasAny
          ? "Check the 'All' tab above to see closed scholarships, or come back soon — new awards open all the time."
          : "Our scrapers are working their way through the financial aid pages. Check back in a few hours."}
      </p>
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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
