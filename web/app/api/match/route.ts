import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClaude, MATCH_MODEL } from "@/lib/claude/client";
import {
  buildUserMessage,
  SYSTEM_PROMPT,
  type ScholarshipForMatch,
} from "@/lib/claude/match-prompt";
import { preFilterScholarships } from "@/lib/match-prefilter";
import { ProfileSchema } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  profile: ProfileSchema,
  college_slug: z.string().min(1).optional(),
  scholarship_ids: z.array(z.string().uuid()).max(50).optional(),
});

/* Streaming protocol: NDJSON (one JSON object per line). Event types:
 *   {"type":"candidates","ids":[...]}        — first event, scholarship IDs being scored
 *   {"type":"match","match":{id,score,reason}} — emitted as each match completes
 *   {"type":"done"}                          — final event
 *   {"type":"error","error":"..."}           — fatal error
 */

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const { profile, college_slug, scholarship_ids } = parsed.data;
  if (!college_slug && !scholarship_ids?.length) {
    return NextResponse.json(
      { error: "must supply college_slug or scholarship_ids" },
      { status: 400 },
    );
  }

  const sb = await createSupabaseServerClient();
  let scholarships: ScholarshipForMatch[] = [];

  if (college_slug) {
    const { data: college } = await sb
      .from("colleges")
      .select("id")
      .eq("slug", college_slug)
      .maybeSingle();
    if (!college) {
      return NextResponse.json({ error: "college not found" }, { status: 404 });
    }
    const { data, error } = await sb
      .from("scholarships")
      .select("id, name, amount_min, amount_max, deadline, eligibility_text, description, scope, tags")
      .eq("active", true)
      .or(
        `college_id.eq.${college.id},and(scope.eq.state,college_id.is.null),scope.eq.national`,
      );
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

  // Tag-based pre-filter: top ~18 candidates by deterministic relevance.
  const candidates = preFilterScholarships(scholarships, profile, 18);
  if (candidates.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const claude = getClaude();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        send({ type: "candidates", ids: candidates.map((c) => c.id) });

        const messages = [{ role: "user" as const, content: buildUserMessage(profile, candidates) }];

        const response = await claude.messages.stream({
          model: MATCH_MODEL,
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages,
        });

        let buffer = "";
        const seenIds = new Set<string>();

        for await (const chunk of response) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            buffer += chunk.delta.text;
            // Parse out complete match objects as they appear in the stream
            const matches = extractCompleteMatches(buffer, seenIds);
            for (const m of matches) {
              send({ type: "match", match: m });
            }
          }
        }

        // Final pass — catch any tail-end matches the streaming parser missed
        const final = parseFinalJSON(buffer);
        for (const m of final) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            send({ type: "match", match: m });
          }
        }

        send({ type: "done" });
      } catch (err) {
        console.error("[/api/match] stream error:", err);
        send({ type: "error", error: "matching unavailable" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

/* ---------------- streaming JSON parser ----------------
 *
 * Claude generates JSON like:
 *   {"matches":[{"id":"...","score":88,"reason":"..."},{"id":"..."},...]}
 *
 * We don't wait for the final ]; we extract each complete inner {} as it arrives.
 */
type Match = { id: string; score: number; reason: string };

function extractCompleteMatches(buffer: string, seen: Set<string>): Match[] {
  // The full envelope is {"matches": [{...}, {...}, ...]}.
  // We want to emit each INNER {...} as it completes — that's depth 2 closing back to 1.
  const matches: Match[] = [];
  let depth = 0;
  let innerStart = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < buffer.length; i++) {
    const ch = buffer[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === "{") {
      depth++;
      if (depth === 2) innerStart = i;
    } else if (ch === "}") {
      if (depth === 2 && innerStart >= 0) {
        const candidate = buffer.slice(innerStart, i + 1);
        const parsed = tryParseMatch(candidate);
        if (parsed && !seen.has(parsed.id)) {
          seen.add(parsed.id);
          matches.push(parsed);
        }
        innerStart = -1;
      }
      depth = Math.max(0, depth - 1);
    }
  }
  return matches;
}

function tryParseMatch(raw: string): Match | null {
  try {
    const obj = JSON.parse(raw);
    if (
      typeof obj?.id === "string" &&
      typeof obj?.score === "number" &&
      typeof obj?.reason === "string"
    ) {
      return { id: obj.id, score: Math.max(0, Math.min(100, Math.round(obj.score))), reason: obj.reason };
    }
  } catch {
    /* incomplete — skip */
  }
  return null;
}

function parseFinalJSON(buffer: string): Match[] {
  // Fall-back: if streaming parser missed anything, try parsing the full envelope.
  const cleaned = buffer.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    if (Array.isArray(obj?.matches)) {
      return obj.matches.flatMap((m: unknown) => {
        const parsed = tryParseMatch(JSON.stringify(m));
        return parsed ? [parsed] : [];
      });
    }
  } catch {
    /* no luck */
  }
  return [];
}

// Type-only imports for clarity.
void (null as unknown as Anthropic);
