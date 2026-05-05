import Link from "next/link";
import { listColleges } from "@/lib/db/queries";

export default async function HomePage() {
  const colleges = await listColleges();

  return (
    <div className="relative">
      {/* HERO ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="grid grid-cols-12 gap-6 items-end">
            {/* Left rail – section meta */}
            <aside className="col-span-12 lg:col-span-2 order-2 lg:order-1">
              <div
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted lift-in"
                style={{ animationDelay: "100ms" }}
              >
                <p>The Lede</p>
                <p className="mt-2 text-terracotta">Issue 01</p>
                <p className="mt-6 leading-relaxed normal-case tracking-normal text-ink-soft">
                  A scholarship finder for students who already know which college they want — and the parents and counselors helping them get there.
                </p>
              </div>
            </aside>

            {/* Headline */}
            <div className="col-span-12 lg:col-span-10 order-1 lg:order-2">
              <p
                className="font-mono text-[12px] uppercase tracking-[0.25em] text-terracotta lift-in"
                style={{ animationDelay: "0ms" }}
              >
                A College-First Scholarship Finder
              </p>
              <h1
                className="mt-5 font-display text-ink leading-[0.95] tracking-tight text-[3.2rem] sm:text-[4.6rem] lg:text-[7rem] lift-in"
                style={{
                  animationDelay: "150ms",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1",
                }}
              >
                Find the money for{" "}
                <span className="italic text-terracotta">the school you actually want.</span>
              </h1>

              <div
                className="mt-10 flex flex-wrap items-center gap-4 lift-in"
                style={{ animationDelay: "350ms" }}
              >
                <Link
                  href="/colleges"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-7 py-4 text-[15px] hover:bg-navy transition-colors"
                >
                  Browse colleges
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-3 py-4 text-[15px] text-ink-soft link-grow"
                >
                  How it works
                </Link>
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                  Free · No spam · No ads
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DATELINE / BIG NUMBERS ========================================== */}
      <section className="border-y border-ink/15 bg-paper-deep">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <Stat num={colleges.length.toString()} label="Colleges indexed" foot="North Florida start" />
            <Stat num="2" label="UF scholarships" foot="More on the way" accent />
            <Stat num="$0" label="To use it" foot="Free, always" />
            <Stat num="01" label="Edition" foot="May 2026" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS ===================================================== */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-12 gap-6 mb-12 items-end">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">Method</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="font-display text-3xl sm:text-5xl text-ink leading-tight tracking-tight">
              Built around the college, not the search bar.
            </h2>
            <p className="mt-4 max-w-2xl text-ink-soft leading-relaxed">
              Most scholarship sites bury you in 6,000 generic results. We start with the
              school you actually care about — every result is tied to a real college, real
              eligibility, real deadline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule border border-rule">
          <Step num="01" title="Pick your college." body="Search by name. We start with the University of Florida, Santa Fe, UNF, FSU, and Florida Gateway — and grow from there." />
          <Step num="02" title="Tell us about you." body="Major, GPA, graduation year, anything else relevant. Takes ~2 minutes. Stays private." />
          <Step num="03" title="Get a ranked shortlist." body="Five to ten scholarships you should actually apply to, with a one-line reason why each one fits — not 200 you'll ignore." />
        </div>
      </section>

      {/* COLLEGES LIST PREVIEW ============================================ */}
      <section className="border-t border-rule bg-paper-deep">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-20">
          <div className="grid grid-cols-12 gap-6 mb-10 items-end">
            <div className="col-span-12 md:col-span-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">Currently indexed</p>
            </div>
            <div className="col-span-12 md:col-span-6">
              <h2 className="font-display text-3xl sm:text-5xl text-ink leading-tight tracking-tight">
                {colleges.length} colleges, hand-curated.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-3 text-right">
              <Link href="/colleges" className="font-mono text-[12px] uppercase tracking-[0.2em] link-grow">
                Browse all →
              </Link>
            </div>
          </div>

          <ul className="divide-y divide-rule border-y border-ink/30">
            {colleges.map((c, idx) => (
              <li key={c.id}>
                <Link
                  href={`/colleges/${c.slug}`}
                  className="grid grid-cols-12 gap-4 items-baseline py-5 hover:bg-paper transition-colors group"
                >
                  <span className="col-span-1 font-mono text-[12px] text-ink-muted">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="col-span-12 sm:col-span-7 font-display text-2xl sm:text-3xl text-ink group-hover:text-terracotta transition-colors"
                    style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 20" }}
                  >
                    {c.name}
                  </span>
                  <span className="hidden sm:block sm:col-span-2 text-ink-soft text-sm">
                    {c.city}, {c.state}
                  </span>
                  <span className="col-span-12 sm:col-span-2 text-right font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted group-hover:text-ink">
                    View →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CLOSING ========================================================= */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-10 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracotta">
          Made for Gainesville. Spreading from there.
        </p>
        <h2
          className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl text-ink leading-[0.95] tracking-tight max-w-4xl mx-auto"
          style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 40" }}
        >
          The money is out there.{" "}
          <span className="italic text-terracotta">Let&apos;s find your share.</span>
        </h2>
        <Link
          href="/colleges"
          className="mt-10 inline-flex items-center gap-2 bg-ink text-paper px-7 py-4 hover:bg-navy transition-colors"
        >
          Start browsing →
        </Link>
      </section>
    </div>
  );
}

function Stat({ num, label, foot, accent }: { num: string; label: string; foot: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`font-display text-5xl sm:text-6xl leading-none ${accent ? "text-terracotta" : "text-ink"}`}
        style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
      >
        {num}
      </span>
      <span className="mt-3 text-sm text-ink">{label}</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">{foot}</span>
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="bg-paper p-8 lg:p-10">
      <span className="ornament-num text-5xl">{num}</span>
      <h3 className="mt-4 font-display text-2xl text-ink tracking-tight">{title}</h3>
      <p className="mt-3 text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
