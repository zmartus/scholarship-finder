import { z } from "zod";

export type StudentProfile = {
  graduation_year: number | null;
  gpa: number | null;
  intended_major: string | null;
  state: string | null;
  high_school: string | null;
  demographics: Record<string, unknown> | null;
};

export type ScholarshipForMatch = {
  id: string;
  name: string;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  eligibility_text: string | null;
  scope: "school" | "local" | "state" | "national";
  tags: string[];
};

export const MatchSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string(),
      score: z.number().int().min(0).max(100),
      reason: z.string().min(1).max(280),
    }),
  ),
});

export const SYSTEM_PROMPT = `You are a scholarship matching assistant for US college applicants.
Score each scholarship 0-100 by how well it fits the student's profile.
Be honest: bad fits get low scores. Hard eligibility misses (wrong state, wrong major, GPA below floor) get under 20.
Strong fits get 70+. Each reason is one short sentence (under 30 words) explaining the fit, citing concrete profile facts.
Return JSON only, matching the provided schema.`;

export function buildUserPrompt(
  profile: StudentProfile,
  scholarships: ScholarshipForMatch[],
): string {
  return [
    "STUDENT_PROFILE:",
    JSON.stringify(profile, null, 2),
    "",
    "SCHOLARSHIPS:",
    JSON.stringify(scholarships, null, 2),
    "",
    'Return JSON: {"matches":[{"id":"...","score":0-100,"reason":"..."}]}',
    "Include every scholarship by id, even low scores.",
  ].join("\n");
}
