# CollegeMoneyAI — MVP Ship Plan

**Target launch: June 1, 2026.** ~3.5 weeks from May 7 kickoff.

**Goal:** Deployed to a public URL. A high schooler in Florida can:
1. Land on the page
2. Fill in a quick profile (no signup)
3. Pick their college
4. See real scholarships ranked by AI fit, each with a one-line "why this fits you"
5. Click through to apply on the official site

That's the whole product for V1. No login, no saved lists, no email reminders, no counselor dashboard. **Florida-only for V1.** Out-of-state schools (Juilliard, etc.) come in V1.x once we know users want them.

## Progress as of May 7

- ✅ Repo + tooling scaffolded
- ✅ Supabase schema + RLS + RPC live
- ✅ 5 North Florida colleges seeded
- ✅ 23 real UF scholarships in DB (replaced stub with curated extract from sfa.ufl.edu)
- ✅ College page surfaces school + state + national scholarships
- ✅ Landing, /colleges, /colleges/[slug], /scholarships/[id] pages built
- ✅ Dark gradient AI-product UI locked in
- ✅ Renamed to CollegeMoneyAI
- ⏳ CareerOneStop API token registration (in flight)
- ⏳ Profile builder + AI matching backend
- ⏳ GitHub Actions cron for daily scraper refresh
- ⏳ Vercel deployment + custom domain

---

## What's IN the MVP

| Feature | Why it's in |
|---|---|
| Profile builder (localStorage, no auth) | Required for AI matching. No login = zero friction. |
| AI matching endpoint w/ Claude | The actual product. The "why this fits" is the magic. |
| 30–50 real scholarships, hand-curated | "Up-to-date" via human curation. Faster + higher quality than scrapers for V1. |
| Existing UI (landing, /colleges, college detail, scholarship detail) | Already built. No redesign. |
| Vercel deployment + custom domain | A public URL real users can visit. |
| Mobile-responsive QA | Every high schooler is on a phone. |

## What's OUT (deferred to V1.1+)

- Login / Supabase Auth (use localStorage profile instead)
- Saved scholarships, application tracker
- Email / SMS deadline reminders
- Real HTML scrapers + cron jobs
- Admin tooling
- Counselor / parent features
- Monetization (no paywall yet)
- Match result caching in DB
- Sitemap / SEO optimization
- Analytics dashboard (just install Plausible/PostHog at deploy time)

---

## The 4-evening plan

### Evening 1 — Profile + AI matching backend (~3h)

**Goal:** Send profile + scholarships to Claude, get back ranked matches with explanations.

- [ ] `app/profile/page.tsx` — profile form (graduation year, GPA, major, state, demographics checkboxes, target college). Saves to **localStorage**, not DB.
- [ ] `lib/profile.ts` — typed profile schema (zod), localStorage helpers, profile hash for cache keys.
- [ ] `lib/claude/client.ts` already exists — wire up real Claude call.
- [ ] `app/api/match/route.ts` — POST endpoint. Takes `{ profile, scholarship_ids }` → calls Claude with prompt caching on the scholarship list → returns `[{ id, score, reason }]`.
- [ ] Use **prompt caching** on the scholarship corpus so re-runs cost ~$0.001 each.
- [ ] Smoke-test with curl + the 2 stub scholarships in DB.

**Done when:** `curl -X POST localhost:3000/api/match -d '{...}'` returns ranked JSON with reasons.

### Evening 2 — Real scholarship data + match UI (~3h)

**Goal:** Real scholarships in the DB. Match results render on the college detail page.

- [ ] **Hand-curate 30–50 scholarships** as a SQL migration: `supabase/migrations/0003_seed_real_scholarships.sql`. Sources to mine in this order (highest leverage first):
  - **UF Office of Student Financial Affairs** (https://sfa.ufl.edu/scholarships/) → ~15
  - **Florida Bright Futures** (Academic, Medallion, Gold Seal Vocational) → 3
  - **Common nationals** open to FL students: Coca-Cola Scholars, Gates, Horatio Alger, Hispanic Scholarship Fund, Jack Kent Cooke, Discover, Burger King → ~10
  - **Community Foundation of North Central Florida** → ~5
  - **Santa Fe College, UNF, FSU foundation awards** → ~10
- [ ] Apply migration via Supabase SQL editor.
- [ ] Add **"Your AI matches"** section at the top of `/colleges/[slug]` — calls `/api/match`, renders cards with score badge + "why you fit" callout, ranked.
- [ ] If no profile in localStorage yet, the section shows a **"Build your profile to see matches"** prompt linking to `/profile`.
- [ ] On `/scholarships/[id]`, show match score + reason if profile exists.

**Done when:** Fill profile → visit UF page → see top 5 matches with real explanations from Claude.

### Evening 3 — Polish + data freshness (~2h)

**Goal:** Production-ready quality bar. No broken links, no 500s, looks right on a phone.

- [ ] Loading states on `/api/match` (skeleton match cards)
- [ ] Error boundaries — Claude failure shows graceful "couldn't generate matches right now" not a crash
- [ ] **Mobile QA pass** — open every page on iPhone Chrome dev tools, fix anything that breaks
- [ ] Add **"Last verified [date]"** labels on every scholarship (we already have `last_scraped` column — repurpose as `last_verified`; set to today on the manual curation migration)
- [ ] Add a tiny **"Report outdated info"** mailto link on each scholarship card (`mailto:hi@collegemoneyai.com?subject=...`)
- [ ] `app/about/page.tsx` — replaces the broken /about link. ~100 words about the project + how data is curated.
- [ ] Update masthead "Get started" → routes to `/profile` if no profile, else `/colleges`
- [ ] Run `npm run build` and fix any prod-only errors

**Done when:** Build passes. Every page works on phone. No 404s on internal links.

### Evening 4 — Deploy (~2h)

**Goal:** Public URL. Real users can hit it.

- [ ] **Buy the domain.** `collegemoneyai.com` if available (~$12/yr at Cloudflare Registrar). Fallback: `collegemoney.ai` (~$70/yr but 🔥 branding).
- [ ] **Push to GitHub** (private repo OK).
- [ ] **Connect Vercel** → import repo → set framework to Next.js, root dir to `web/`.
- [ ] **Set env vars in Vercel**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`. Service-role key NOT needed in Vercel (only the scraper would need it; we're not deploying the scraper).
- [ ] **Connect domain** to Vercel project. Wait ~10 min for DNS.
- [ ] **Install Plausible or PostHog** free tier — paste the script tag in `app/layout.tsx`. You need to know what people do.
- [ ] **Smoke test the prod URL end-to-end.** Profile → match → apply click-out. Test on your phone, on your friend's phone.

**Done when:** You can text the URL to a Gainesville senior and it works.

---

## After we ship

The instant the URL is live:

1. **You apply to one scholarship** using your own product end-to-end. If anything is broken or annoying, fix it before showing anyone.
2. **DM 5 friends** for a soft launch test. Watch them use it. Don't help. Note the top 3 frictions.
3. **Two counselors.** Buchholz HS, Gainesville HS, or Eastside HS counseling offices. Email or visit. "Free tool for seniors looking for scholarships, would you share it with your students?"
4. **One Reddit post on r/Gainesville or r/UF** — soft pitch.
5. **Wait 7 days. Check analytics.** Are people coming back? Applying to anything?

If yes → start V1.1 (real scrapers, accounts, saved lists). If no → talk to 5 users for an hour each.

---

## V1.1 backlog (for after we have signal)

In rough priority order:

- Real Supabase Auth (email + Google) — converts localStorage profiles, unlocks saved lists + reminders
- Saved scholarships + status tracker (saved / applied / awarded / rejected)
- Resend integration: weekly digest + deadline reminders for saved items
- Real scraper for UF + Bright Futures + CareerOneStop API + GH Actions cron every 6h
- Expand to all of Florida (more colleges + state-wide awards)
- Admin panel for moderating scrape results
- Stripe paywall on AI matching past N free matches/month
- B2B counselor dashboard (sells to high schools at $500–2k/yr)

None of these block the V1 ship.

---

## Risks & mitigations for V1

| Risk | Mitigation |
|---|---|
| Claude returns garbage / refuses | JSON output schema + zod validation + graceful fallback ("matching unavailable, browse all scholarships") |
| Scholarship data goes stale | "Last verified" date on every card + mailto report link. Manual re-curation monthly until scrapers exist. |
| Vercel free tier hits limits | Free tier handles low thousands of MAU. Upgrade plan only when needed. |
| User profile lost on browser clear | Profile is small + zero-cost to refill. Show "no profile" prompt cleanly. |
| Claude API cost spike | Prompt caching = ~$0.001/match. Hard rate-limit per IP if abuse appears. |

---

## Daily build order at a glance

```
Day 1: profile form (localStorage)  →  /api/match endpoint  →  curl-tested
Day 2: 30-50 real scholarships seeded  →  match UI on /colleges/[slug]
Day 3: loading + errors + mobile + /about + last-verified labels
Day 4: domain + Vercel + analytics + smoke test on phone
       ──────────────────────────── SHIP ────────────────────────────
```
