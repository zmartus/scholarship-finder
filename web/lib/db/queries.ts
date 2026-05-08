import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export async function listColleges(query?: string): Promise<College[]> {
  const sb = await createSupabaseServerClient();
  let q = sb.from("colleges").select("*").order("name");
  if (query && query.trim().length > 0) {
    q = q.ilike("name", `%${query.trim()}%`);
  }
  const { data, error } = await q;
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
      `college_id.eq.${collegeId},and(scope.eq.state,college_id.is.null),scope.eq.national`,
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
