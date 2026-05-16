import Link from "next/link";

const SUBMIT_MAILTO =
  "mailto:hi@grantaria.com?subject=Submit%20a%20scholarship&body=Scholarship%20name%3A%0AAmount%3A%0ADeadline%3A%0AOfficial%20source%20URL%3A%0AEligibility%2Fnotes%3A%0A";

const REPORT_MAILTO =
  "mailto:hi@grantaria.com?subject=Report%20outdated%20info&body=Scholarship%3A%0AWhat%27s%20outdated%3A%0A";

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 sm:mt-24 pb-10 px-6 sm:px-10">
      <div className="mx-auto max-w-[1100px] pt-10 border-t border-border">
        <div className="grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-bold text-fg mb-3">
              Grant<span className="gradient-text">aria</span>
            </p>
            <p className="text-fg-muted leading-relaxed">
              A scholarship finder built around the school you actually want. Free, hand-curated, AI-explained.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint mb-3">Browse</p>
            <ul className="space-y-2 text-fg-soft">
              <li><Link href="/colleges" className="hover:text-cyan transition-colors">All colleges</Link></li>
              <li><Link href="/profile" className="hover:text-cyan transition-colors">Build your profile</Link></li>
              <li><Link href="/about" className="hover:text-cyan transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint mb-3">Help us improve</p>
            <ul className="space-y-2 text-fg-soft">
              <li>
                <a href={SUBMIT_MAILTO} className="hover:text-cyan transition-colors">
                  Submit a scholarship →
                </a>
              </li>
              <li>
                <a href={REPORT_MAILTO} className="hover:text-cyan transition-colors">
                  Report outdated info →
                </a>
              </li>
              <li>
                <a href="mailto:hi@grantaria.com" className="hover:text-cyan transition-colors">
                  hi@grantaria.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-fg-faint font-mono uppercase tracking-[0.18em]">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} Grantaria · Made in Gainesville, FL
          </div>
          <div className="flex items-center justify-center gap-5">
            <Link href="/privacy" className="hover:text-cyan transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cyan transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
