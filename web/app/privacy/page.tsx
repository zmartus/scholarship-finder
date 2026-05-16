import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Grantaria",
  description:
    "A plain-English explanation of what Grantaria collects, where it goes, and what we never do with your data.",
};

export default function PrivacyPage() {
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
          Privacy
        </span>
        <h1 className="mt-5 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05]">
          Your data, <span className="gradient-text">your call.</span>
        </h1>
        <p className="mt-5 text-fg-muted text-sm font-mono uppercase tracking-[0.18em]">
          Last updated: May 16, 2026
        </p>
      </header>

      <div className="mt-10 prose-content text-lg text-fg-soft leading-relaxed space-y-6">
        <p>
          This is the short, honest version of how Grantaria handles your data. No legal
          jargon, no fluff. If anything here is unclear, email{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@grantaria.com">
            hi@grantaria.com
          </a>{" "}
          and I&apos;ll explain.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">What we collect</h2>
        <p>
          <strong className="text-fg">Your profile</strong> (graduation year, GPA, intended
          major, state, high school, attributes you check, free-text interests) lives in{" "}
          <strong className="text-fg">your browser&apos;s localStorage</strong>. It never
          touches a database we control. If you clear your browser data, it&apos;s gone.
        </p>
        <p>
          <strong className="text-fg">Anonymous traffic stats</strong> — Vercel Analytics
          counts page views and tells us things like &ldquo;120 people visited /colleges this
          week.&rdquo; No cookies. No fingerprinting. No personal info.
        </p>
        <p>
          <strong className="text-fg">Emails you send us</strong> — when you submit a
          scholarship, report outdated info, or just say hi at{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@grantaria.com">
            hi@grantaria.com
          </a>
          , the message lands in a personal inbox. That&apos;s it.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Where your profile goes when you ask for matches</h2>
        <p>
          When you click <em>&ldquo;Match me with scholarships&rdquo;</em>, your profile is
          sent to <strong className="text-fg">Anthropic&apos;s Claude API</strong> along with
          a list of candidate scholarships. Claude returns a ranked list with explanations.
        </p>
        <p>
          <strong className="text-fg">We don&apos;t store the request or response on our
          servers.</strong> Anthropic processes the request and returns it. Their handling is
          governed by{" "}
          <a className="text-cyan hover:underline" href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">
            Anthropic&apos;s privacy policy
          </a>{" "}
          — they don&apos;t train on API data by default and don&apos;t retain it long-term.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Third parties</h2>
        <p>The full list of services we use, and what they see:</p>
        <ul className="space-y-2 ml-6 list-disc marker:text-fg-muted">
          <li>
            <strong className="text-fg">Anthropic</strong> — receives your profile + scholarship list when you ask for matches
          </li>
          <li>
            <strong className="text-fg">Vercel</strong> — hosts the site; their analytics counts anonymous page views
          </li>
          <li>
            <strong className="text-fg">Supabase</strong> — stores the public scholarship database (no user data)
          </li>
          <li>
            <strong className="text-fg">ImprovMX</strong> — forwards email sent to hi@grantaria.com to a personal inbox
          </li>
        </ul>
        <p>
          We use these tools to run the service. We don&apos;t sell or share data with anyone
          else, and we don&apos;t embed third-party advertising trackers.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">What we never do</h2>
        <ul className="space-y-2 ml-6 list-disc marker:text-fg-muted">
          <li>Sell your data, ever</li>
          <li>Run ads or third-party advertising trackers</li>
          <li>Use cookies for analytics or tracking</li>
          <li>Send you marketing emails (we don&apos;t even have your email unless you write to us)</li>
          <li>Share your profile with colleges, scholarship sponsors, or anyone</li>
          <li>Track you across other sites</li>
        </ul>

        <h2 className="text-2xl font-bold text-fg pt-4">Deleting your data</h2>
        <p>
          <strong className="text-fg">Your profile:</strong>{" "}
          clear your browser&apos;s localStorage for grantaria.com, or use your browser&apos;s &ldquo;clear site
          data&rdquo; option. Done — it&apos;s gone, we never had a copy.
        </p>
        <p>
          <strong className="text-fg">Emails you sent us:</strong> email{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@grantaria.com">
            hi@grantaria.com
          </a>{" "}
          asking us to delete the thread, and we will.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Kids under 13</h2>
        <p>
          Grantaria is built for high school seniors (16+) and their families. We
          don&apos;t knowingly collect data from anyone under 13. If a parent realizes their
          under-13 child has used the site, email{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@grantaria.com">
            hi@grantaria.com
          </a>{" "}
          and we&apos;ll help.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Changes to this policy</h2>
        <p>
          If we change anything material, we&apos;ll update the &ldquo;Last updated&rdquo;
          date at the top and post a note on the site. If the changes affect what we collect
          or share, we&apos;ll make sure you see the update before continuing to use the
          service.
        </p>

        <h2 className="text-2xl font-bold text-fg pt-4">Contact</h2>
        <p>
          Grantaria is operated by <strong className="text-fg">Zac Martus</strong>, a
          Florida-based individual. Questions, concerns, or requests:{" "}
          <a className="text-cyan hover:underline" href="mailto:hi@grantaria.com">
            hi@grantaria.com
          </a>
          .
        </p>
      </div>

      <div className="mt-16 pt-10 border-t border-border flex flex-wrap items-center justify-between gap-4 text-sm text-fg-muted">
        <Link href="/terms" className="hover:text-cyan transition-colors">
          Read the Terms of Service →
        </Link>
        <Link href="/" className="hover:text-cyan transition-colors">
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
