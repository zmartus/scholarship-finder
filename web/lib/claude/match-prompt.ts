import { z } from "zod";
import type { Profile } from "@/lib/profile";

export type ScholarshipForMatch = {
  id: string;
  name: string;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  eligibility_text: string | null;
  description: string | null;
  scope: "school" | "local" | "state" | "national";
  tags: string[];
};

export const MatchSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string(),
      score: z.number().int().min(0).max(100),
      reason: z.string().min(1).max(320),
    }),
  ),
});

export const SYSTEM_PROMPT = `You are Grantaria's scholarship matching engine.

For the student profile and scholarship corpus provided, return ONLY the 10 best-fitting scholarships, ranked highest to lowest.

Score each 0-100 based on how well it fits:
- 90+ : the student likely qualifies AND it strongly matches their profile
- 70-89 : strong fit, the student should apply
- 50-69 : worth considering, partial fit
- 30-49 : weak fit, only apply if low effort

Be honest. If a scholarship requires Florida residency and the student is out of state, leave it out — don't pad the list.

Respect LOCAL eligibility. Some awards are restricted to a specific high school, city, or county (e.g. "graduating senior at Ponte Vedra High School" or "Duval County schools only"). If the student's high school clearly matches, rank it high and call out the local fit in your reason ("As a Ponte Vedra senior, you're one of the few eligible for this $4,000 award"). If their high school is clearly somewhere else, leave it out entirely — a Miami student should never see a Jacksonville-only scholarship.

For each match return a one-sentence "reason" (under 25 words) that:
- Cites at least one concrete fact from the student's profile
- Sounds like a friendly counselor, not a generic AI
- Avoids weasel words like "might" or "could potentially"
- Uses "you" and "your" — never third person

Return strict JSON only, no commentary.

Output schema: { "matches": [ { "id": string, "score": int 0-100, "reason": string } ] }
Return AT MOST 10 entries. If fewer than 10 are decent fits, return only the strong ones.`;

export function buildUserMessage(
  profile: Profile,
  scholarships: ScholarshipForMatch[],
) {
  // The scholarship corpus is the heavy, stable block we want cached.
  // The profile + closing instruction is the lightweight per-request part.
  return [
    {
      type: "text" as const,
      text: `SCHOLARSHIPS (corpus):\n${JSON.stringify(scholarships, null, 2)}`,
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: `STUDENT_PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nReturn JSON: { "matches": [...] } scoring every scholarship in the corpus above.`,
    },
  ];
}
