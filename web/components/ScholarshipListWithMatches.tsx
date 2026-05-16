"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProfile } from "@/components/useProfile";
import { isProfileUseful, profileHash } from "@/lib/profile";
import { ScholarshipCard, type ScholarshipMatch } from "@/components/ScholarshipCard";
import type { Scholarship } from "@/lib/db/queries";

type Match = { id: string; score: number; reason: string };
type StreamEvent =
  | { type: "candidates"; ids: string[] }
  | { type: "match"; match: Match }
  | { type: "done" }
  | { type: "error"; error: string };

type Props = {
  scholarships: Scholarship[];
  collegeSlug: string;
  collegeName: string;
};

/**
 * Renders the "Apply for these" section's cards with inline AI match
 * reasoning ("Why you fit") when a profile exists. Replaces the old
 * separate-section MatchSection — the AI's commentary now lives ON
 * the scholarships it recommends, not as a parallel list.
 */
export function ScholarshipListWithMatches({
  scholarships,
  collegeSlug,
  collegeName,
}: Props) {
  const { profile, hydrated } = useProfile();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!hydrated || !profile || !isProfileUseful(profile)) return;

    // v2: bumped after we filtered auto-considered scholarships out of
    // the candidate pool server-side — invalidates any older client caches.
    const cacheKey = `match:v2:${collegeSlug}:${profileHash(profile)}`;
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached) as { matches: Match[] };
        setMatches(data.matches);
        return;
      } catch {
        /* fall through and refetch */
      }
    }

    setLoading(true);
    setError(null);
    setMatches([]);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const collected: Match[] = [];

    (async () => {
      try {
        const r = await fetch("/api/match", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile, college_slug: collegeSlug }),
          signal: controller.signal,
        });
        if (!r.ok) {
          const text = await r.text();
          throw new Error(safeErrorMessage(text) ?? `HTTP ${r.status}`);
        }
        if (!r.body) throw new Error("no response body");

        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let lineBuf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lineBuf += decoder.decode(value, { stream: true });
          const lines = lineBuf.split("\n");
          lineBuf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let event: StreamEvent;
            try {
              event = JSON.parse(line) as StreamEvent;
            } catch {
              continue;
            }
            if (event.type === "match") {
              collected.push(event.match);
              setMatches((prev) =>
                [...prev, event.match].sort((a, b) => b.score - a.score),
              );
            } else if (event.type === "error") {
              throw new Error(event.error);
            }
            // "candidates" and "done" are no-ops here — we just collect matches.
          }
        }

        window.sessionStorage.setItem(cacheKey, JSON.stringify({ matches: collected }));
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message ?? "Couldn't generate matches");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [hydrated, profile, collegeSlug]);

  // Map id → match for fast lookup.
  const matchMap = useMemo(() => {
    const m: Record<string, ScholarshipMatch> = {};
    for (const x of matches) m[x.id] = { score: x.score, reason: x.reason };
    return m;
  }, [matches]);

  // Sort: matched scholarships first (by score), then unmatched (preserve original order).
  const sorted = useMemo(() => {
    const indexed = scholarships.map((s, i) => ({ s, i }));
    return indexed
      .sort((a, b) => {
        const ma = matchMap[a.s.id]?.score ?? -1;
        const mb = matchMap[b.s.id]?.score ?? -1;
        if (mb !== ma) return mb - ma;
        return a.i - b.i;
      })
      .map((x) => x.s);
  }, [scholarships, matchMap]);

  const hasProfile = hydrated && profile && isProfileUseful(profile);

  return (
    <>
      {/* Profile-CTA banner (shown only when no useful profile exists) */}
      {hydrated && !hasProfile && (
        <div className="mt-5 mb-2 rounded-2xl border border-cyan/30 bg-cyan/[0.04] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fg-soft">
            <span className="text-cyan font-semibold">Build your profile</span> to see
            which of these fit you best — AI ranks them and explains why in one line.
          </p>
          <Link
            href={`/profile?next=/colleges/${collegeSlug}&for=${encodeURIComponent(collegeName)}`}
            className="text-sm text-cyan font-semibold hover:underline whitespace-nowrap"
          >
            Get my matches →
          </Link>
        </div>
      )}

      {/* Loading hint while AI streams in matches (cards already visible) */}
      {hasProfile && loading && matches.length === 0 && (
        <p className="mt-3 text-sm text-fg-muted">
          <span className="inline-block w-2 h-2 bg-cyan rounded-full animate-pulse mr-2" />
          AI is ranking your top matches...
        </p>
      )}

      {/* Soft error if matching failed — cards still render below */}
      {error && (
        <p className="mt-3 text-sm text-fg-muted">
          AI matching unavailable right now ({error}). Showing scholarships in default order.
        </p>
      )}

      <ul className="mt-5 grid sm:grid-cols-2 gap-5">
        {sorted.map((s) => (
          <li key={s.id}>
            <ScholarshipCard s={s} match={matchMap[s.id]} />
          </li>
        ))}
      </ul>
    </>
  );
}

function safeErrorMessage(text: string): string | null {
  try {
    const j = JSON.parse(text);
    return typeof j?.error === "string" ? j.error : null;
  } catch {
    return null;
  }
}
