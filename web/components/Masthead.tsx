import Link from "next/link";

export function Masthead() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="relative z-20 border-b border-rule">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-4 pb-3">
        <div className="flex items-end justify-between gap-6 text-[11px] uppercase tracking-[0.18em] text-ink-muted font-mono">
          <span>{today}</span>
          <span className="hidden sm:inline">Vol. 1 · No. 1</span>
          <span>North Florida Edition</span>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pb-5">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display text-[2.4rem] sm:text-[3rem] leading-none tracking-tight text-ink"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1" }}
          >
            Scholarship<span className="italic text-terracotta">Guru</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-ink-soft">
            <Link href="/colleges" className="link-grow">Browse colleges</Link>
            <Link href="/about" className="link-grow">About</Link>
            <Link
              href="/colleges"
              className="bg-ink text-paper px-4 py-2 hover:bg-navy transition-colors"
            >
              Find scholarships →
            </Link>
          </nav>
          <Link
            href="/colleges"
            className="md:hidden bg-ink text-paper text-sm px-3 py-2"
          >
            Browse →
          </Link>
        </div>
      </div>
      <div className="border-t border-ink/30">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted font-mono flex items-center justify-between">
          <span>Section: Scholarships · Aid · College planning</span>
          <span className="hidden sm:inline">A college-first finder</span>
        </div>
      </div>
    </header>
  );
}
