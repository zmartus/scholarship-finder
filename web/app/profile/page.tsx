"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { useProfile } from "@/components/useProfile";
import { ATTRIBUTE_OPTIONS, EMPTY_PROFILE, isProfileUseful, type Profile } from "@/lib/profile";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
  "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[820px] px-6 sm:px-10 py-12 lg:py-20" />}>
      <ProfileForm />
    </Suspense>
  );
}

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, hydrated, replace } = useProfile();
  const [draft, setDraft] = useState<Profile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);

  // Read context from the URL — set when the user came here from a college page.
  const nextPath = searchParams.get("next");
  const forCollege = searchParams.get("for"); // human-readable college name

  // Initialize draft from stored profile once hydrated.
  useEffect(() => {
    if (hydrated) setDraft(profile ?? EMPTY_PROFILE);
  }, [hydrated, profile]);

  // Fire profile_started once per session when the user lands here without
  // a usable profile yet (i.e. they're actually starting the form).
  const startedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    if (!profile || !isProfileUseful(profile)) {
      track("profile_started", {
        from_college: forCollege ?? "none",
      });
      startedRef.current = true;
    }
  }, [hydrated, profile, forCollege]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function toggleAttribute(value: string) {
    setDraft((d) => {
      const has = d.attributes.includes(value);
      return {
        ...d,
        attributes: has ? d.attributes.filter((v) => v !== value) : [...d.attributes, value],
      };
    });
    setSaved(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    replace(draft);
    setSaved(true);
    track("profile_completed", {
      has_gpa: draft.gpa != null ? 1 : 0,
      has_major: draft.intended_major ? 1 : 0,
      has_state: draft.state ? 1 : 0,
      is_florida: draft.state === "FL" ? 1 : 0,
      attributes_count: draft.attributes.length,
      has_interests: draft.interests ? 1 : 0,
      from_college: forCollege ?? "none",
    });
    // Smooth nudge — let user see "Saved" then route them.
    // If they came from a college page, send them straight back to matches.
    const destination = nextPath && isSafeNextPath(nextPath) ? nextPath : "/colleges";
    setTimeout(() => router.push(destination), 600);
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 py-12 lg:py-20">
      <Link
        href={nextPath && isSafeNextPath(nextPath) ? "/colleges" : "/"}
        className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-cyan transition-colors"
      >
        <span aria-hidden>←</span>{" "}
        {nextPath && isSafeNextPath(nextPath) ? "Change school" : "Back home"}
      </Link>

      <header className="mt-6">
        <span className="badge-pill">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          Step 2 of 2 — Tell us about you
        </span>
        <h1 className="mt-5 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05]">
          Tell us about <span className="gradient-text">you.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-fg-soft">
          The more we know, the better the AI can rank scholarships for you. Everything stays
          on your device — we don't store profiles on a server. Skip any field that doesn't
          apply.
        </p>
      </header>

      {/* School confirmation banner — only when arriving from a college page */}
      {forCollege && nextPath && isSafeNextPath(nextPath) && (
        <div className="mt-8 rounded-2xl border border-cyan/30 bg-cyan/5 p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-cyan/15 border border-cyan/40 flex items-center justify-center flex-shrink-0">
              <CapIcon className="w-4 h-4 text-cyan" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                Building profile for
              </p>
              <p className="mt-0.5 text-lg font-bold text-fg truncate">{forCollege}</p>
            </div>
          </div>
          <Link
            href="/colleges"
            className="text-sm text-fg-soft hover:text-cyan transition-colors whitespace-nowrap"
          >
            Change school →
          </Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-12 space-y-10">
        {/* Basics =================================================== */}
        <Fieldset legend="Basics">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Graduation year">
              <select
                value={draft.graduation_year ?? ""}
                onChange={(e) =>
                  set("graduation_year", e.target.value ? Number(e.target.value) : null)
                }
                className="form-input"
              >
                <option value="">—</option>
                {[2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="GPA (4.0 scale)" hint="Unweighted is fine. Leave blank if unsure.">
              <input
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={draft.gpa ?? ""}
                onChange={(e) => set("gpa", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 3.7"
                className="form-input"
              />
            </Field>
            <Field label="Intended major">
              <input
                type="text"
                value={draft.intended_major ?? ""}
                onChange={(e) => set("intended_major", e.target.value || null)}
                placeholder="e.g. Computer Science, Nursing, Music Performance"
                className="form-input"
              />
            </Field>
            <Field label="Home state">
              <select
                value={draft.state ?? ""}
                onChange={(e) => set("state", e.target.value || null)}
                className="form-input"
              >
                <option value="">—</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="High school" hint="Enter your full school name and city — it's how we find local scholarships in your area." className="sm:col-span-2">
              <input
                type="text"
                value={draft.high_school ?? ""}
                onChange={(e) => set("high_school", e.target.value || null)}
                placeholder="e.g. Buchholz High School, Gainesville · or Tampa Catholic, Tampa"
                className="form-input"
              />
            </Field>
          </div>
        </Fieldset>

        {/* About you ================================================ */}
        <Fieldset legend="About you" hint="Check every box that applies. Helps surface awards designed for your situation.">
          <div className="grid sm:grid-cols-2 gap-3">
            {ATTRIBUTE_OPTIONS.map((opt) => {
              const checked = draft.attributes.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                    checked
                      ? "border-cyan/50 bg-cyan/5"
                      : "border-border bg-bg-elev/40 hover:border-border-strong"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAttribute(opt.value)}
                    className="mt-0.5 accent-cyan"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-fg">{opt.label}</span>
                    {opt.help && <span className="block text-xs text-fg-muted mt-0.5">{opt.help}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </Fieldset>

        {/* Free text ================================================ */}
        <Fieldset legend="Activities & interests" hint="Optional. Sports, clubs, volunteer work, hobbies, jobs — anything you spend time on. Helps the AI find awards that match what you actually care about.">
          <textarea
            value={draft.interests ?? ""}
            onChange={(e) => set("interests", e.target.value || null)}
            rows={5}
            placeholder="e.g. Robotics club captain, varsity soccer, 200+ hours volunteering at a local animal shelter, part-time barista, plays piano."
            className="form-input min-h-[120px] resize-y"
          />
        </Fieldset>

        {/* Submit =================================================== */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button type="submit" className="btn-gradient text-[15px]">
            {saved
              ? "Saved ✓"
              : forCollege
                ? `Save & see matches for ${forCollege} →`
                : "Save profile & see matches →"}
          </button>
          <p className="text-sm text-fg-muted">
            Stays on this device. We never send it to a server we control.
          </p>
        </div>
      </form>
    </div>
  );
}

/**
 * Whitelist redirect targets so a malicious link can't bounce us off-site.
 * We only allow relative paths under /colleges/ or /scholarships/.
 */
function isSafeNextPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false; // protocol-relative
  return (
    path.startsWith("/colleges/") ||
    path.startsWith("/colleges") ||
    path.startsWith("/scholarships/")
  );
}

/* ---------- presentational ---------- */

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="card p-6 sm:p-8">
      <legend className="px-3 -ml-3 -mt-12 mb-4 inline-flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted bg-bg px-2 py-1 rounded-full border border-border">
          {legend}
        </span>
      </legend>
      {hint && <p className="mb-5 -mt-2 text-sm text-fg-soft leading-relaxed">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-sm font-medium text-fg mb-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-fg-muted">{hint}</span>}
    </label>
  );
}

function CapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </svg>
  );
}
