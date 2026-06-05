import { createSupabaseServerClient } from "@/lib/supabase/server";

// Re-export the pure helper so existing server-side imports still work.
// Client components must import from "@/lib/scholarship-utils" directly to
// avoid pulling next/headers into the client bundle (which breaks the build).
export { isAutoConsidered } from "@/lib/scholarship-utils";

export type College = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string;
  website: string | null;
  type: string | null;
};

export type Scholarship = {
  id: string;
  name: string;
  description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  eligibility_text: string | null;
  scope: "school" | "local" | "state" | "national";
  college_id: string | null;
  source: string;
  source_url: string;
  tags: string[] | null;
  last_scraped: string | null;
};

/**
 * Common abbreviations / nicknames → canonical college slug.
 * Lets users search "UF" / "FSU" / "UCF" / "Gators" instead of typing
 * the full school name. Add new aliases here as we hear them from users.
 */
const COLLEGE_ALIASES: Record<string, string> = {
  // Tier 1 four-year publics
  UF: "university-of-florida",
  UFL: "university-of-florida",
  GATORS: "university-of-florida",
  FSU: "florida-state-university",
  SEMINOLES: "florida-state-university",
  NOLES: "florida-state-university",
  UCF: "university-of-central-florida",
  KNIGHTS: "university-of-central-florida",
  USF: "university-of-south-florida",
  BULLS: "university-of-south-florida",
  FIU: "florida-international-university",
  FAU: "florida-atlantic-university",
  OWLS: "florida-atlantic-university",
  UNF: "university-of-north-florida",
  OSPREYS: "university-of-north-florida",
  UWF: "university-of-west-florida",
  ARGONAUTS: "university-of-west-florida",
  FAMU: "florida-am-university",
  RATTLERS: "florida-am-university",
  FGCU: "florida-gulf-coast-university",
  NCF: "new-college-of-florida",
  POLY: "florida-polytechnic-university",
  FPU: "florida-polytechnic-university",

  // Privates
  UM: "university-of-miami",
  MIAMI: "university-of-miami",
  CANES: "university-of-miami",
  HURRICANES: "university-of-miami",
  FIT: "florida-institute-of-technology",
  ERAU: "embry-riddle-aeronautical",
  STETSON: "stetson-university",
  ROLLINS: "rollins-college",
  JU: "jacksonville-university",
  ECKERD: "eckerd-college",
  BARRY: "barry-university",
  FLAGLER: "flagler-college",
  LYNN: "lynn-university",
  PBA: "palm-beach-atlantic-university",
  PBAU: "palm-beach-atlantic-university",
  NSU: "nova-southeastern-university",
  RINGLING: "ringling-college-of-art-design",
  "SAINT LEO": "saint-leo-university",
  SAINTLEO: "saint-leo-university",
  FSOUTHERN: "florida-southern-college",
  FSC: "florida-southern-college",

  // HBCUs
  BCU: "bethune-cookman-university",
  EWU: "edward-waters-university",
  FMU: "florida-memorial-university",

  // Community / state colleges
  MDC: "miami-dade-college",
  VALENCIA: "valencia-college",
  HCC: "hillsborough-community-college",
  BROWARD: "broward-college",
  SPC: "st-petersburg-college",
  PBSC: "palm-beach-state-college",
  TSC: "tallahassee-state-college",
  FSCJ: "florida-state-college-jacksonville",
  IRSC: "indian-river-state-college",
  SFC: "santa-fe-college",
  SF: "santa-fe-college",
  FGC: "florida-gateway-college",
};

export async function listColleges(query?: string): Promise<College[]> {
  const sb = await createSupabaseServerClient();
  const trimmed = (query ?? "").trim();

  // No query — return everything.
  if (trimmed.length === 0) {
    const { data, error } = await sb.from("colleges").select("*").order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as College[];
  }

  // Check for abbreviation match (case-insensitive). If found, OR the alias's
  // slug into the search so e.g. "UF" matches "university-of-florida" even
  // though "UF" isn't a substring of the full name.
  const aliasSlug = COLLEGE_ALIASES[trimmed.toUpperCase()];

  if (aliasSlug) {
    const escaped = trimmed.replace(/[%,]/g, ""); // Supabase .or() commas are operator delimiters
    const { data, error } = await sb
      .from("colleges")
      .select("*")
      .or(`name.ilike.%${escaped}%,slug.eq.${aliasSlug}`)
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as College[];
  }

  // Standard name search (substring match).
  const { data, error } = await sb
    .from("colleges")
    .select("*")
    .ilike("name", `%${trimmed}%`)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as College[];
}

export async function getCollegeBySlug(slug: string): Promise<College | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("colleges")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as College) ?? null;
}

export async function listScholarshipsForCollege(
  collegeId: string,
): Promise<Scholarship[]> {
  // Surface (a) school/local scholarships tied to this college AND
  // (b) state-wide scholarships portable to any school in the state AND
  // (c) national scholarships open to anyone.
  const sb = await createSupabaseServerClient();
  const { data: college, error: cErr } = await sb
    .from("colleges")
    .select("state")
    .eq("id", collegeId)
    .single();
  if (cErr) throw new Error(cErr.message);

  const { data, error } = await sb
    .from("scholarships")
    .select("*")
    .eq("active", true)
    .or(
      // (a) this college's own awards, (b) portable state-wide aid,
      // (c) nationals, (d) untied LOCAL awards (region-matched to the
      // student later — these only render when the AI matches them).
      `college_id.eq.${collegeId},and(scope.eq.state,college_id.is.null),scope.eq.national,and(scope.eq.local,college_id.is.null)`,
    )
    .order("deadline", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  // Note: with our current schema state-wide rows have college_id=null;
  // if we ever attach them to a specific FL college we'd also dedupe here.
  void college; // state used to scope national/state in a richer query later
  return (data ?? []) as Scholarship[];
}

export async function countScholarshipsForCollege(collegeId: string): Promise<number> {
  const sb = await createSupabaseServerClient();
  const { count, error } = await sb
    .from("scholarships")
    .select("*", { count: "exact", head: true })
    .eq("college_id", collegeId)
    .eq("active", true);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export type ScholarshipWithCollege = Scholarship & {
  college: Pick<College, "id" | "slug" | "name" | "city" | "state"> | null;
};

export async function getScholarshipById(id: string): Promise<ScholarshipWithCollege | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("scholarships")
    .select("*, college:colleges(id, slug, name, city, state)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ScholarshipWithCollege) ?? null;
}
