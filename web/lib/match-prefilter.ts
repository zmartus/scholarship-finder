/**
 * Lightweight tag/profile pre-filter so we send fewer, better candidates to Claude.
 * Saves cost and improves match quality (Claude doesn't waste effort on obvious mismatches).
 */
import type { Profile } from "@/lib/profile";
import type { ScholarshipForMatch } from "@/lib/claude/match-prompt";

const FL_RESIDENT = "florida-resident";
const STEM_MAJOR_KEYWORDS = ["computer", "engineering", "science", "math", "biology", "chemistry", "physics", "tech", "robotics", "stem"];

/**
 * Returns scholarships sorted by deterministic tag/profile relevance,
 * with hard exclusions (e.g. out-of-state-only awards for FL residents) removed.
 */
export function preFilterScholarships(
  scholarships: ScholarshipForMatch[],
  profile: Profile,
  limit: number = 18,
): ScholarshipForMatch[] {
  const scored = scholarships
    .map((s) => ({ s, score: scoreOne(s, profile) }))
    .filter((x) => x.score > -100)            // hard-exclusions get -1000
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.s);
}

function scoreOne(s: ScholarshipForMatch, p: Profile): number {
  let score = 0;
  const tags = new Set(s.tags ?? []);
  const elig = (s.eligibility_text ?? "").toLowerCase();
  const desc = (s.description ?? "").toLowerCase();
  const haystack = `${elig} ${desc}`;
  const major = (p.intended_major ?? "").toLowerCase();
  const isFL = p.state === "FL" || p.attributes.includes(FL_RESIDENT);

  // ---- Hard exclusions -------------------------------------------------
  // Out-of-state-only awards for FL residents
  if (isFL && (tags.has("out-of-state") || /non[- ]?florida resident|out[- ]of[- ]state/.test(haystack))) {
    return -1000;
  }
  // FL-resident-only awards for non-FL students
  if (!isFL && (tags.has("florida-resident") || tags.has("in-state"))) {
    return -1000;
  }
  // National Merit-only for non-NMS profiles
  if (tags.has("national-merit") && !p.attributes.includes("national-merit")) {
    score -= 30;
  }
  // First-gen-only awards for non-first-gen
  if (tags.has("first-gen") && !p.attributes.includes("first-gen")) {
    score -= 20;
  }
  // Need-based for students who didn't flag Pell
  if (tags.has("need-based") && !p.attributes.includes("pell-eligible")) {
    score -= 5;
  }

  // ---- Positive matching ----------------------------------------------
  // Direct profile-attribute → tag overlap
  for (const attr of p.attributes) {
    if (tags.has(attr)) score += 25;
    if (haystack.includes(attr.replace("-", " "))) score += 5;
  }

  // GPA fit
  if (p.gpa != null) {
    const m = haystack.match(/minimum (\d+\.\d+)\s*gpa/);
    if (m) {
      const floor = parseFloat(m[1]);
      if (p.gpa >= floor) score += 10;
      else score -= 15;
    } else if (p.gpa >= 3.5) {
      // High-GPA students get a small boost on merit awards
      if (tags.has("merit") || tags.has("top-tier")) score += 8;
    }
  }

  // STEM major
  if (major) {
    const isStem = STEM_MAJOR_KEYWORDS.some((kw) => major.includes(kw));
    if (isStem && (tags.has("stem-major") || /stem|engineering|science/.test(haystack))) {
      score += 15;
    }
    if (haystack.includes(major)) score += 10;
  }

  // Award amount — prefer larger awards modestly so they bubble up when ties
  const amt = s.amount_max ?? s.amount_min ?? 0;
  if (amt >= 20000) score += 4;
  else if (amt >= 5000) score += 2;

  // Auto-consideration awards are higher value (no extra application)
  if (tags.has("auto-consideration")) score += 6;

  // Senior-year / graduation-year awards: penalize underclassmen-only when profile is a senior
  if (p.graduation_year && tags.has("underclassmen")) {
    score -= 12;
  }

  return score;
}
