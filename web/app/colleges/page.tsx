import Link from "next/link";
import { listColleges } from "@/lib/db/queries";

type SearchParams = Promise<{ q?: string }>;

export default async function CollegesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const colleges = await listColleges(query || undefined);

  return (
    <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-12 lg:py-20">
      {/* Header ========================================================== */}
      <div className="grid grid-cols-12 gap-6 items-end mb-12 lg:mb-16">
        <div className="col-span-12 lg:col-span-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
            Section · Browse
          </p>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1
            className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-ink lift-in"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1" }}
          >
            Pick your college.
          </h1>
          <p
            className="mt-6 max-w-2xl text-lg text-ink-soft leading-relaxed lift-in"
            style={{ animationDelay: "120ms" }}
          >
            Every scholarship lives under a real school. Start with the one you want — or the
            one that matches your dorm-life dreams — and we'll show you what's available.
          </p>
        </div>
      </div>

      {/* Search bar ====================================================== */}
      <form
        method="get"
        action="/colleges"
        className="border border-ink bg-paper flex items-stretch lift-in"
        style={{ animationDelay: "180ms" }}
      >
        <label htmlFor="q" className="sr-only">Search colleges</label>
        <span className="hidden sm:flex items-center px-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted border-r border-rule">
          Search
        </span>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Florida, FSU, Santa Fe…"
          className="flex-1 bg-transparent px-5 py-5 text-lg sm:text-xl text-ink placeholder:text-ink-muted focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="bg-ink text-paper px-6 sm:px-8 hover:bg-navy transition-colors text-[15px]"
        >
          Find →
        </button>
      </form>

      {/* Active query meta =============================================== */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-ink-muted">
        <span>
          {colleges.length} {colleges.length === 1 ? "result" : "results"}
          {query ? ` for "${query}"` : " · all colleges"}
        </span>
        {query && (
          <Link href="/colleges" className="link-grow">
            Clear filter ×
          </Link>
        )}
      </div>

      {/* Results list ==================================================== */}
      <div className="mt-10 lg:mt-14">
        {colleges.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <ul className="border-t border-b border-ink/30 divide-y divide-rule">
            {colleges.map((c, idx) => (
              <li key={c.id}>
                <Link
                  href={`/colleges/${c.slug}`}
                  className="group block py-8 lg:py-10 hover:bg-paper-deep transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 lg:gap-6 items-baseline">
                    <span className="col-span-2 sm:col-span-1 font-mono text-sm text-ink-muted pt-2">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="col-span-10 sm:col-span-7">
                      <h3
                        className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight tracking-tight group-hover:text-terracotta transition-colors"
                        style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 20" }}
                      >
                        {c.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                        <span>{c.city ? `${c.city}, ` : ""}{c.state}</span>
                        {c.type && (
                          <>
                            <span className="text-rule-strong">·</span>
                            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                              {c.type.replace(/-/g, " ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex sm:col-span-4 justify-end items-baseline gap-6">
                      {c.website && (
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted truncate max-w-[180px]">
                          {c.website.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                      )}
                      <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink group-hover:text-terracotta transition-colors whitespace-nowrap">
                        View scholarships →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="border border-rule bg-paper-deep p-10 lg:p-16 text-center">
      <p className="ornament-num text-6xl">∅</p>
      <h3 className="mt-4 font-display text-2xl sm:text-3xl text-ink tracking-tight">
        No colleges match "{query}".
      </h3>
      <p className="mt-3 max-w-md mx-auto text-ink-soft leading-relaxed">
        We're starting with North Florida and expanding from there. If your school isn't
        listed yet, we'd love to know which to add next.
      </p>
      <Link
        href="/colleges"
        className="mt-6 inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-sm hover:bg-navy transition-colors"
      >
        Show all colleges
      </Link>
    </div>
  );
}
