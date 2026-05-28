"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

/**
 * Fake-door pricing CTA. Measures B2C intent before we build the actual
 * paid feature. Shown between the "Apply to these" and "Auto-applied"
 * sections on every college page so any visiting student/parent sees it.
 *
 * What it does:
 *   - "Get notified" button → tracks `paid_tier_cta_clicked`
 *   - Reveals an email-capture form
 *   - Submit → tracks `paid_tier_email_submitted` + posts to /api/notify
 *
 * What it DOESN'T do (yet):
 *   - Take payment
 *   - Send actual reminder emails
 *   - Promise a specific launch date
 *
 * The success state is shown even if the API call fails — we don't want
 * a transient backend error to block the signal we're capturing.
 */
export function PaidTierCTA() {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleExpand() {
    track("paid_tier_cta_clicked");
    setExpanded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);
    track("paid_tier_email_submitted");
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "deadline_reminders_cta" }),
      });
    } catch {
      // Swallow — fake door, signal already captured by the track() above.
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <section className="mt-14 rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/[0.06] via-violet/[0.04] to-pink/[0.06] p-6 sm:p-8">
      <div className="flex flex-wrap gap-6 items-start justify-between">
        <div className="flex-1 min-w-[260px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
            Coming soon
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Never miss a deadline.
          </h3>
          <p className="mt-3 text-fg-soft leading-relaxed max-w-lg">
            Email + text reminders for every scholarship you save. Weekly
            personalized match updates. Deadline-week warnings so nothing slips.
          </p>
          <p className="mt-3 text-sm text-fg-muted">
            <strong className="text-fg">$39 for the year</strong> · covers the
            whole senior-year application sprint.
          </p>
        </div>

        <div className="flex-1 min-w-[260px]">
          {submitted ? (
            <div className="rounded-xl border border-cyan/40 bg-cyan/10 p-4">
              <p className="font-bold text-cyan">You&apos;re on the list ✓</p>
              <p className="text-sm text-fg-soft mt-1">
                We&apos;ll email you the moment it&apos;s live. Nothing else.
              </p>
            </div>
          ) : !expanded ? (
            <button
              type="button"
              onClick={handleExpand}
              className="btn-gradient text-[15px] w-full justify-center"
            >
              Get notified →
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                autoFocus
                className="form-input"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-gradient text-[15px] justify-center"
              >
                {submitting ? "Adding..." : "Notify me →"}
              </button>
              <p className="text-xs text-fg-muted">
                One email when it launches. No spam, no resale, no marketing.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
