/**
 * Pure utilities for the scholarship model — safe to import from both
 * server and client components (no next/headers, no Supabase, no DOM).
 *
 * Kept separate from `lib/db/queries.ts` because that file pulls in
 * `next/headers` (server-only), which would break any client component
 * that needs `isAutoConsidered`.
 */

/**
 * Tags that mark a scholarship as awarded automatically when the student
 * submits the freshman admissions application — no separate form, no
 * separate effort. UI and API both use this to keep auto-considered
 * awards out of the AI match list.
 */
const AUTO_CONSIDERED_TAGS = new Set([
  "auto-consideration",
  "automatic",
  "admissions-based",
]);

/** True when a scholarship is awarded automatically (no separate application). */
export function isAutoConsidered(s: { tags: string[] | null }): boolean {
  return (s.tags ?? []).some((t) => AUTO_CONSIDERED_TAGS.has(t));
}
