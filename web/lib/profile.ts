/**
 * Student profile lives in browser localStorage for V1 (no auth).
 * In V1.1 this same shape moves into the `profiles` Postgres table.
 */
import { z } from "zod";

export const ProfileSchema = z.object({
  graduation_year: z.number().int().min(2025).max(2032).nullable(),
  gpa: z.number().min(0).max(5).nullable(),
  intended_major: z.string().max(120).nullable(),
  state: z.string().length(2).nullable(),         // 2-letter state code
  high_school: z.string().max(120).nullable(),
  attributes: z.array(z.string()).max(20),       // "first-gen", "pell", "veteran", ...
  interests: z.string().max(800).nullable(),     // free-text activities/passions
});

export type Profile = z.infer<typeof ProfileSchema>;

export const EMPTY_PROFILE: Profile = {
  graduation_year: null,
  gpa: null,
  intended_major: null,
  state: "FL",
  high_school: null,
  attributes: [],
  interests: null,
};

const STORAGE_KEY = "cm_ai_profile_v1";

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return ProfileSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Cheap stable hash of the profile so we can key cached match results. */
export function profileHash(p: Profile): string {
  // Stringify in a sorted way
  const canonical = JSON.stringify({
    g: p.graduation_year,
    a: p.gpa,
    m: p.intended_major?.trim().toLowerCase() ?? null,
    s: p.state,
    h: p.high_school?.trim().toLowerCase() ?? null,
    t: [...p.attributes].sort(),
    i: p.interests?.trim().toLowerCase() ?? null,
  });
  let h = 0;
  for (let i = 0; i < canonical.length; i++) {
    h = (h * 31 + canonical.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export function isProfileUseful(p: Profile | null): boolean {
  if (!p) return false;
  // Need at least one signal to do meaningful matching.
  return Boolean(
    p.graduation_year ||
      p.gpa ||
      p.intended_major ||
      p.high_school ||
      p.attributes.length > 0 ||
      p.interests,
  );
}

/** Catalog of attribute checkboxes shown on the profile form. */
export const ATTRIBUTE_OPTIONS: { value: string; label: string; help?: string }[] = [
  { value: "florida-resident", label: "Florida resident", help: "Required for many state and UF scholarships" },
  { value: "first-gen", label: "First-generation college student", help: "Neither parent has a 4-year degree" },
  { value: "pell-eligible", label: "Pell-eligible / financial need", help: "Eligible for federal Pell Grant or free/reduced lunch" },
  { value: "national-merit", label: "National Merit Scholar / Finalist" },
  { value: "veteran", label: "Veteran or active military" },
  { value: "rotc", label: "ROTC participant" },
  { value: "honors-program", label: "Plan to apply to honors program", help: "Many schools have a separate honors college or track with its own scholarships" },
  { value: "stem-major", label: "Pursuing STEM major" },
  { value: "first-time-college", label: "First-time-in-college freshman", help: "Not transferring from another school" },
];
