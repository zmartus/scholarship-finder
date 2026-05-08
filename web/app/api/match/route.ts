import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClaude, MATCH_MODEL } from "@/lib/claude/client";
import {
  buildUserMessage,
  MatchSchema,
  SYSTEM_PROMPT,
  type ScholarshipForMatch,
} from "@/lib/claude/match-prompt";
import { ProfileSchema } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  profile: ProfileSchema,
  // Either a college slug (we'll fetch its scholarships) ...
  college_slug: z.string().min(1).optional(),
  // ... or an explicit list of scholarship IDs (used for /scholarships/[id] page).
  scholarship_ids: z.array(z.string().uuid()).max(50).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", details: parsed.error.format() }, { status: 400 });
  }
  const { profile, college_slug, scholarship_ids } = parsed.data;
  if (!college_slug && !scholarship_ids?.length) {
    return NextResponse.json({ error: "must supply college_slug or scholarship_ids" }, { status: 400 });
  }

  // Fetch candidate scholarships server-side. We never trust client-supplied scholarship data.
  const sb = await createSupabaseServerClient();
  let scholarships: ScholarshipForMatch[] = [];

  if (college_slug) {
    const { data: college } = await sb
      .from("colleges")
      .select("id, state")
      .eq("slug", college_slug)
      .maybeSingle();
    if (!college) {
      return NextResponse.json({ error: "college not found" }, { status: 404 });
    }
    const { data, error } = await sb
      .from("scholarships")
      .select("id, name, amount_min, amount_max, deadline, eligibility_text, description, scope, tags")
      .eq("active", true)
      .or(`college_id.eq.${college.id},and(scope.eq.state,college_id.is.null),scope.eq.national`);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    scholarships = (data ?? []) as ScholarshipForMatch[];
  } else if (scholarship_ids) {
    const { data, error } = await sb
      .from("scholarships")
      .select("id, name, amount_min, amount_max, deadline, eligibility_text, description, scope, tags")
      .in("id", scholarship_ids)
      .eq("active", true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    scholarships = (data ?? []) as ScholarshipForMatch[];
  }

  if (scholarships.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Cap to keep prompts predictable. Tag-based pre-filtering can come later.
  scholarships = scholarships.slice(0, 50);

  const claude = getClaude();
  const messages = [
    {
      role: "user" as const,
      content: buildUserMessage(profile, scholarships),
    },
  ];

  let raw: string;
  try {
    const response = await claude.messages.create({
      model: MATCH_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });
    // Concatenate text blocks defensively.
    raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  } catch (err) {
    console.error("[/api/match] Claude call failed:", err);
    return NextResponse.json({ error: "matching unavailable" }, { status: 502 });
  }

  // Strip code fences if Claude added them defensively.
  const cleaned = raw.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    console.error("[/api/match] Claude returned non-JSON:", raw.slice(0, 500));
    return NextResponse.json({ error: "model returned invalid JSON" }, { status: 502 });
  }

  const validated = MatchSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error("[/api/match] schema mismatch:", validated.error.format());
    return NextResponse.json({ error: "model output schema mismatch" }, { status: 502 });
  }

  // Sort top-down by score; cap to 20 visible matches.
  const sorted = [...validated.data.matches]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return NextResponse.json({ matches: sorted });
}

