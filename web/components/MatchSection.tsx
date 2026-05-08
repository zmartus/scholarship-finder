"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/components/useProfile";
import { isProfileUseful, profileHash } from "@/lib/profile";
import { formatAmount, formatDeadline } from "@/lib/format";
import type { Scholarship } from "@/lib/db/queries";

type Match = { id: string; score: number; reason: string };

type Props = {
  collegeSlug: string;
  collegeName: string;
  // Pre-fetched on the server so we can render rich cards without a second roundtrip
  scholarshipMap: Record<string, Scholarship>;
};

export function MatchSection({ collegeSlug, collegeName, scholarshipMap }: Props) {
  const { profile, hydrated } = useProfile();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cheap browser-side cache so re-visits don't re-pay Claude.
  useEffect(() => {
    if (!hydrated || !profile || !isProfileUseful(profile)) return;
    const cacheKey = `match:${collegeSlug}:${profileHash(profile)}`;
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setMatches(JSON.parse(cached));
        return;
      } catch {/* fall through */}
    }

    setLoading(true);
    setError(null);
    fetch("/api/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile, college_slug: collegeSlug }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { matches: Match[] }) => {
        setMatches(data.matches);
        window.sessionStorage.setItem(cacheKey, JSON.stringify(data.matches));
      })
      .catch((e) => setError(e.message ?? "Couldn't generate matches"))
      .finally(() => setLoading(false));
  }, [hydrated, profile, collegeSlug]);

  // ---- States --------------------------------------------------------
  if (!hydrated) {
    return null; // avoid flicker before localStorage is read
  }

  if (!profile || !isProfileUseful(profile)) {
    return (
      <section className="mt-12 mb-2 card p-7 sm:p-9">
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div className="flex-1 min-w-[280px]">
            <p className="badge-pill mb-4">
              <SparkleIcon className="w-4 h-4 text-cyan" /> AI matching
            </p>
            <h2 className="font-extrabold text-2xl sm:text-3xl tracking-tight">
              Get a personalized shortlist for {collegeName}.
            </h2>
            <p className="mt-3 text-fg-soft max-w-xl">
              Build your profile in under two minutes. Our AI ranks every scholarship by fit
              and tells you exactly why each one is worth your time.
            </p>
          </div>
          <Link href="/profile" className="btn-gradient text-[15px]">
            Build my profile <ArrowIcon />
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mt-12">
        <SectionHeader />
        <div className="grid sm:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="match-card p-6 sm:p-7 animate-pulse">
              <div className="h-4 w-24 bg-bg-elev rounded" />
              <div className="mt-4 h-8 w-32 bg-bg-elev rounded" />
              <div className="mt-3 h-6 w-3/4 bg-bg-elev rounded" />
              <div className="mt-4 h-16 w-full bg-bg-elev rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-12 card p-6 text-fg-soft">
        <p>
          Couldn&apos;t generate AI matches right now ({error}). Browse all scholarships
          below, or try again in a minute.
        </p>
      </section>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  // Render top matches that we have data for.
  const top = matches
    .filter((m) => scholarshipMap[m.id])
    .slice(0, 6);

  if (top.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader />
      <ul className="grid sm:grid-cols-2 gap-5">
        {top.map((m) => {
          const s = scholarshipMap[m.id];
          return (
            <li key={m.id}>
              <MatchCard match={m} s={s} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
      <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight">
        Your AI matches
      </h2>
      <Link href="/profile" className="text-sm text-fg-muted hover:text-cyan transition-colors">
        Update profile →
      </Link>
    </div>
  );
}

function MatchCard({ match, s }: { match: Match; s: Scholarship }) {
  const tone =
    match.score >= 80 ? "high"
    : match.score >= 60 ? "mid"
    : "low";
  return (
    <Link
      href={`/scholarships/${s.id}`}
      className="match-card block p-6 sm:p-7 hover:border-border-strong transition-colors group relative overflow-hidden"
    >
      {/* score badge */}
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`inline-flex items-baseline gap-1 font-mono text-[11px] uppercase tracking-[0.2em] rounded-full px-3 py-1 border ${
            tone === "high"
              ? "text-cyan border-cyan/40 bg-cyan/10"
              : tone === "mid"
                ? "text-fg-soft border-border-strong bg-bg-elev/40"
                : "text-fg-muted border-border bg-bg-elev/30"
          }`}
        >
          Match · <span className="font-bold">{match.score}%</span>
        </span>
        <span className="text-xs text-fg-muted">{formatDeadline(s.deadline)}</span>
      </div>

      <p className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text inline-block">
        {formatAmount(s.amount_min, s.amount_max)}
      </p>

      <h3 className="mt-2 text-xl font-bold tracking-tight text-fg group-hover:text-cyan transition-colors">
        {s.name}
      </h3>

      <div className="mt-4 rounded-xl bg-bg-elev/60 border border-border-soft p-4 text-[15px] text-fg-soft leading-relaxed">
        <span className="text-cyan font-semibold">Why you fit:</span> {match.reason}
      </div>
    </Link>
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
