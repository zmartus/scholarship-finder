import Link from "next/link";
import { HeroIllustration } from "@/components/HeroIllustration";

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO ============================================================ */}
      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-10 lg:pt-16 pb-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span
                className="badge-pill lift-in"
                style={{ animationDelay: "0ms" }}
              >
                <SparkleIcon className="w-4 h-4 text-cyan" />
                AI-powered scholarship matching
              </span>

              <h1
                className="mt-7 font-extrabold leading-[1.02] tracking-[-0.02em] text-[3.2rem] sm:text-[4.4rem] lg:text-[5.4rem] lift-in"
                style={{ animationDelay: "120ms" }}
              >
                Find scholarships <br />
                <span className="gradient-text">made for you.</span>
              </h1>

              <p
                className="mt-7 max-w-xl text-lg sm:text-xl text-fg-soft leading-relaxed lift-in"
                style={{ animationDelay: "260ms" }}
              >
                Tell us your dream college, GPA, interests, and activities. We'll
                surface personalized scholarships you actually qualify for — and
                explain exactly why each one fits.
              </p>

              <div
                className="mt-9 flex flex-wrap items-center gap-4 lift-in"
                style={{ animationDelay: "380ms" }}
              >
                <Link href="/colleges" className="btn-gradient text-[15px]">
                  Match me with scholarships <ArrowIcon />
                </Link>
                <Link href="#how-it-works" className="btn-ghost text-[15px]">
                  See how it works
                </Link>
              </div>

              <div
                className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-fg-soft text-[15px] lift-in"
                style={{ animationDelay: "500ms" }}
              >
                <TrustItem>Free to try</TrustItem>
                <TrustItem>No spam</TrustItem>
                <TrustItem>Built for seniors</TrustItem>
              </div>
            </div>

            <div className="lift-in" style={{ animationDelay: "200ms" }}>
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* THREE STEPS ===================================================== */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-[1400px] px-6 sm:px-10 py-20 lg:py-28"
      >
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05]">
            Three steps to your match list
          </h2>
          <p className="mt-5 text-lg text-fg-soft">
            No endless searching. No generic results. Just scholarships that actually fit.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <StepCard
            num="Step 1"
            title="Pick your college"
            body="Type the school you're aiming for — public, private, in-state, or reach."
            icon={<CapIcon className="w-5 h-5" />}
          />
          <StepCard
            num="Step 2"
            title="Share your story"
            body="Add your GPA, interests, and extracurriculars. Even small details help."
            icon={<TargetIcon className="w-5 h-5" />}
          />
          <StepCard
            num="Step 3"
            title="Get your matches"
            body="Our AI returns a curated list with a short reason why each one fits you."
            icon={<WalletIcon className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* SMARTER THAN SEARCH ============================================ */}
      <section
        id="features"
        className="relative mx-auto max-w-[1400px] px-6 sm:px-10 py-20 lg:py-28"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-[3.4rem] tracking-[-0.02em] leading-[1.05]">
              Smarter than a search bar.
            </h2>
            <p className="mt-5 text-lg text-fg-soft max-w-xl">
              ScholarshipGuru reads your full profile — not just keywords — and
              explains why each scholarship is worth your time.
            </p>

            <ul className="mt-8 space-y-4 text-fg-soft">
              <FeatureLine>Personalized matches based on GPA, interests &amp; activities</FeatureLine>
              <FeatureLine>Plain-English reasons for every recommendation</FeatureLine>
              <FeatureLine>Filters out scholarships you wouldn&apos;t qualify for</FeatureLine>
              <FeatureLine>Updated continually as new awards open</FeatureLine>
            </ul>
          </div>

          <div className="space-y-5">
            <MatchPreview
              percent={96}
              name="Coca-Cola Scholars Program"
              meta="$20,000 · National · Senior year"
              reason="Strong GPA, sustained leadership in two clubs, and demonstrated community service align with the program's core criteria."
            />
            <MatchPreview
              percent={91}
              name="Horatio Alger STEM Award"
              meta="$10,000 · STEM majors"
              reason="Your interest in engineering and robotics club involvement match this award's focus areas."
            />
          </div>
        </div>
      </section>

      {/* CTA BAND ======================================================== */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-10 pb-20">
        <div className="relative gradient-sweep rounded-[2rem] px-8 sm:px-16 py-16 sm:py-24 text-center overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <h2 className="relative font-extrabold text-4xl sm:text-5xl lg:text-6xl text-bg tracking-[-0.02em] leading-tight">
            Your scholarships are waiting.
          </h2>
          <p className="relative mt-4 text-lg text-bg/80 max-w-xl mx-auto">
            Build your profile in under two minutes and let AI do the searching for you.
          </p>
          <Link
            href="/colleges"
            className="relative mt-8 btn-dark-on-gradient inline-flex"
          >
            Start matching — it's free <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ============ small components =================================== */

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckIcon className="w-4 h-4 text-check" />
      {children}
    </span>
  );
}

function StepCard({
  num,
  title,
  body,
  icon,
}: {
  num: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-7 lg:p-8">
      <span className="icon-orb">{icon}</span>
      <p className="mt-7 text-sm text-fg-muted">{num}</p>
      <h3 className="mt-1 text-2xl font-bold tracking-tight">{title}</h3>
      <p className="mt-3 text-fg-soft leading-relaxed">{body}</p>
    </div>
  );
}

function FeatureLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border border-check/40 bg-check/10 inline-flex items-center justify-center">
        <CheckIcon className="w-3 h-3 text-check" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function MatchPreview({
  percent,
  name,
  meta,
  reason,
}: {
  percent: number;
  name: string;
  meta: string;
  reason: string;
}) {
  return (
    <div className="match-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
        Match · {percent}%
      </p>
      <h3 className="mt-2 text-xl font-bold tracking-tight">{name}</h3>
      <p className="mt-1 text-sm text-fg-soft">{meta}</p>
      <div className="mt-4 rounded-xl bg-bg-elev/60 border border-border-soft p-4 text-[15px] text-fg-soft leading-relaxed">
        <span className="text-cyan font-semibold">Why you fit:</span> {reason}
      </div>
    </div>
  );
}

/* ============ icons ============================================= */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M3 8.5L7 12l6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function CapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 10L12 5 2 10l10 5 10-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14" r="1.4" fill="currentColor" />
    </svg>
  );
}
