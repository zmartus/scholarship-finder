import Link from "next/link";

export const metadata = {
  title: "About — CollegeMoneyAI",
  description:
    "Why CollegeMoneyAI exists, how the data is curated, and how we use AI to surface scholarships that actually fit you.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 py-12 lg:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-cyan transition-colors"
      >
        <span aria-hidden>←</span> Home
      </Link>

      <header className="mt-8">
        <span className="badge-pill">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          About this project
        </span>
        <h1 className="mt-5 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05]">
          A scholarship finder built <span className="gradient-text">by a student, for students.</span>
        </h1>
      </header>

      <div className="mt-10 prose-content text-lg text-fg-soft leading-relaxed space-y-6">
        <p>
          I built CollegeMoneyAI in 2026 because every scholarship site I tried as a high
          school senior in Florida felt the same: a wall of generic results, ad-heavy,
          designed for SEO instead of for the person actually applying.
        </p>

        <p>
          The thesis is simple: <strong className="text-fg">start with the school you actually want</strong> —
          University of Florida, FSU, UCF, Miami Dade, or any other Florida college — and surface the
          scholarships that fit your profile. An AI explains in one sentence why each one is
          worth your time. No 200-result spreadsheets to sort yourself.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">How the data works</h2>
        <p>
          Every scholarship in the database is hand-verified against its official source. The
          University of Florida list comes from{" "}
          <a className="text-cyan hover:underline" href="https://www.sfa.ufl.edu/types-of-aid/scholarships/" target="_blank" rel="noopener noreferrer">
            UF Office of Student Financial Affairs
          </a>
          . Florida Bright Futures and the state-funded grants come from the Florida
          Department of Education. National scholarships are pulled directly from each
          foundation&apos;s own application page.
        </p>
        <p>
          Every scholarship card shows a <em>Last verified</em> date. If a deadline shifts mid-cycle,
          the date is your truth-check. <strong>Always confirm the deadline on the official source
          before applying</strong> — annual scholarships sometimes shift dates year-over-year.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Don&apos;t see your school?</h2>
        <p>
          We&apos;re starting in North Florida and expanding by demand. If you want a school
          we don&apos;t cover yet — UCF, USF, Florida Tech, or anywhere outside Florida —{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@collegemoneyai.com?subject=Add%20a%20school&body=School%20I%20want%20covered%3A%20">
            email me
          </a>{" "}
          and tell me which one. I add schools as students request them.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Found a scholarship we don&apos;t have?</h2>
        <p>
          The best local awards never make it to national databases — Rotary club scholarships,
          church awards, county foundation grants, your dentist&apos;s annual giveaway.{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@collegemoneyai.com?subject=Submit%20a%20scholarship&body=Scholarship%20name%3A%0AAmount%3A%0ADeadline%3A%0AOfficial%20source%20URL%3A%0AEligibility%2Fnotes%3A%0A">
            Send me the link
          </a>{" "}
          and I&apos;ll add it. Counselors, parents, and current students — everyone&apos;s welcome to contribute.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Privacy</h2>
        <p>
          Your profile lives in <strong className="text-fg">your browser&apos;s local storage</strong> —
          we don&apos;t store it on a server we control. When you ask for AI matches, we send your
          profile to Anthropic&apos;s Claude API along with a list of candidate scholarships, and
          Claude returns a ranked list with explanations. We don&apos;t log or save what was sent.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Free to use</h2>
        <p>
          CollegeMoneyAI is free. No paywall, no ads, no data selling, no spam.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Built by</h2>
        <p>
          Zac Martus — CS student at UF.{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@collegemoneyai.com">
            hi@collegemoneyai.com
          </a>
        </p>
      </div>

      <div className="mt-16 pt-10 border-t border-border text-center">
        <Link href="/colleges" className="btn-gradient text-[15px]">
          Browse colleges →
        </Link>
      </div>
    </div>
  );
}
