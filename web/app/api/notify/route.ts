import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(254),
  source: z.string().max(80),
});

/**
 * Email capture for the fake-door pricing CTA. Writes to the
 * `notify_signups` Supabase table. We never fail loudly to the client
 * because the UI's purpose is to measure intent — even if the DB write
 * fails for any reason, the user-facing flow still works (the success
 * card is shown regardless on the client).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  try {
    const sb = await createSupabaseServerClient();
    await sb
      .from("notify_signups")
      .insert({
        email: parsed.data.email.toLowerCase().trim(),
        source: parsed.data.source,
      });
  } catch (e) {
    // Most likely cause: notify_signups table doesn't exist yet (migration
    // 0010 not applied). Log + swallow — the fake-door's job is signal, not
    // a hard collect.
    console.error("[/api/notify] write failed:", e);
  }

  return NextResponse.json({ ok: true });
}
