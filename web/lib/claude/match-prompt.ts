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

export const SYSTEM_PROMPT = `You are CollegeMoneyAI's scholarship matching engine.

Score each scholarship 0-100 based on how well it fits the student's profile:
- 90+ : the student likely qualifies AND it strongly matches their profile (major, situation, school)
- 70-89 : strong fit, the student should apply
- 50-69 : worth considering, partial fit
- 30-49 : weak fit, only apply if low effort
- 0-29 : the student doesn't qualify or it's a clear mismatch (wrong state, wrong major, GPA below floor, etc.)

Be honest. If a scholarship requires Florida residency and the student is out of state, score it under 20 — don't pad.

For each scholarship return a one-sentence "reason" (under 30 words) that:
- Cites at least one concrete fact from the student's profile
- Sounds like a friendly counselor, not a generic AI
- Avoids weasel words like "might" or "could potentially"
- Uses "you" and "your" — never third person

Return strict JSON only, no commentary. Include EVERY scholarship by id, even low scores.

Output schema: { "matches": [ { "id": string, "score": int 0-100, "reason": string } ] }`;

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
