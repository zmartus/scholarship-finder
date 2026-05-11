import Link from "next/link";
import { listColleges } from "@/lib/db/queries";

type SearchParams = Promise<{ q?: string }>;

export default async function CollegesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const colleges = await listColleges(query || undefined);

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-12 lg:py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="badge-pill">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          Browse colleges
        </span>
        <h1 className="mt-6 font-extrabold text-4xl sm:text-5xl lg:text-[3.6rem] tracking-[-0.02em] leading-[1.05]">
          Pick the school <span className="gradient-text">you actually want.</span>
        </h1>
        <p className="mt-5 text-lg text-fg-soft">
          Every scholarship lives under a real college. Start with the one you care about
          and we'll show you what's available.
        </p>
      </div>

      {/* Search ========================================================= */}
      <form
        method="get"
        action="/colleges"
        className="mt-10 mx-auto max-w-2xl"
      >
        <label htmlFor="q" className="sr-only">Search colleges</label>
        <div className="relative card p-2 flex items-center gap-2">
          <span className="pl-3 text-fg-muted">
            <SearchIcon className="w-5 h-5" />
          </span>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Try University of Florida, FSU, UCF…"
            className="flex-1 bg-transparent px-2 py-3 text-lg text-fg placeholder:text-fg-faint focus:outline-none"
            autoFocus
          />
          <button type="submit" className="btn-gradient text-[14px] py-2.5 px-5">
            Find
          </button>
        </div>
      </form>

      {/* Meta line ====================================================== */}
      <div className="mt-6 flex items-baseline justify-between text-sm text-fg-muted max-w-2xl mx-auto">
        <span>
          {colleges.length} {colleges.length === 1 ? "result" : "results"}
          {query ? ` for "${query}"` : " · all colleges"}
        </span>
        {query && (
          <Link href="/colleges" className="text-cyan hover:text-fg transition-colors">
            Clear ×
          </Link>
        )}
      </div>

      {/* Results ======================================================== */}
      <div className="mt-10 max-w-3xl mx-auto">
        {colleges.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <ul className="space-y-3">
            {colleges.map((c, idx) => (
              <li key={c.id}>
                <Link
                  href={`/colleges/${c.slug}`}
                  className="card group flex items-center gap-5 px-6 py-5 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-mono text-sm text-fg-faint w-8">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-sm text-fg-soft truncate">
                      {c.city ? `${c.city}, ` : ""}{c.state}
                      {c.type && (
                        <>
                          <span className="mx-2 text-fg-faint">·</span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                            {c.type.replace(/-/g, " ")}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="hidden sm:flex items-center gap-2 text-sm text-fg-soft group-hover:text-cyan transition-colors whitespace-nowrap">
                    View scholarships
                    <ArrowIcon />
                  </span>
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
    <div className="card text-center py-16 px-8">
      <div className="mx-auto w-14 h-14 rounded-full border border-border-strong flex items-center justify-center text-fg-muted text-2xl">
        ⌀
      </div>
      <h3 className="mt-5 text-2xl font-bold tracking-tight">
        No colleges match "{query}".
      </h3>
      <p className="mt-3 max-w-md mx-auto text-fg-soft leading-relaxed">
        We cover most Florida colleges. If your school isn't listed, tell me which one and I'll add it next.
      </p>
      <Link href="/colleges" className="mt-6 btn-gradient inline-flex text-[14px]">
        Show all colleges
      </Link>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
