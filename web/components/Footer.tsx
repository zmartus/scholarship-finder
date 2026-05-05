import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-rule bg-paper-deep">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-ink">
              Scholarship<span className="italic text-terracotta">Guru</span>
            </p>
            <p className="mt-3 max-w-md text-ink-soft leading-relaxed">
              A college-first scholarship finder, built in Gainesville for students who want
              fewer, better matches. Free to use.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">Browse</p>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li><Link className="link-grow" href="/colleges">All colleges</Link></li>
              <li><Link className="link-grow" href="/colleges?state=FL">Florida schools</Link></li>
              <li><Link className="link-grow" href="/about">How it works</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">Project</p>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>Built independently</li>
              <li>Open feedback welcomed</li>
              <li><Link className="link-grow" href="mailto:hi@example.com">hi@example.com</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-rule flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[12px] text-ink-muted font-mono uppercase tracking-[0.18em]">
          <span>© {new Date().getFullYear()} ScholarshipGuru</span>
          <span>Made in Gainesville, FL</span>
        </div>
      </div>
    </footer>
  );
}
