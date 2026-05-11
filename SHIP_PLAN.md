# CollegeMoneyAI — Status & Roadmap

**Live at:** https://scholarship-finder-delta.vercel.app/
**Target launch (custom domain + first users):** June 1, 2026
**As of:** May 8, 2026

---

## ✅ SHIPPED (V1 MVP — live in production)

The full V1 user flow works end-to-end on the deployed URL:

1. Land on the page
2. Fill profile (no signup, localStorage)
3. Pick a college
4. See AI-ranked scholarships with one-line "why this fits you"
5. Click through to the official application URL

### What's live

- ✅ Repo + tooling scaffolded (Next.js 16 + Supabase + Python 3.14 scraper)
- ✅ Supabase schema + RLS + `upsert_scholarships_by_slug` RPC
- ✅ **42 verified active scholarships** in DB
  - 23 UF SFA scholarships (Presidential, Machen, Stamps, etc.)
  - 11 FL state programs (Bright Futures Academic/Medallion/Gold Seal/CAPE, FSAG, FPSAG, CSDDV, Mary McLeod Bethune, FGMG, Benacquisto)
  - 10 nationals (Coca-Cola, QuestBridge, Gates, JKC, Burger King, Elks, etc.) — all deadlines verified May 8
- ✅ **41 Florida colleges** seeded (UF, UCF, USF, FIU, FAU, UWF, FAMU, FGCU, NCF, Miami, Stetson, Rollins, ERAU, FIT, Eckerd, JU, BCU, Edward Waters, Florida Memorial, Lynn, Saint Leo, FL Southern, Ringling, PBA, Nova SE, Flagler, Barry, Miami Dade, Valencia, Hillsborough, Broward, Palm Beach State, St Pete, Tallahassee State, FSCJ, Indian River State, Santa Fe, UNF, FSU)
- ✅ Profile builder — localStorage, zod schema, attribute checkboxes, free-text interests
- ✅ AI matching — Claude Sonnet 4.6, prompt caching on scholarship corpus, NDJSON streaming
- ✅ **Streaming match UI** — first card appears at ~5s, ~2s gaps, no all-at-once wait
- ✅ Tag-based pre-filter — top 18 candidates sent to Claude (cuts cost + latency)
- ✅ Hard exclusions — out-of-state filtered for FL residents, FL-only filtered for non-FL
- ✅ Landing, /colleges, /colleges/[slug], /scholarships/[id], /profile, /about
- ✅ Dark gradient AI-product UI
- ✅ Renamed to CollegeMoneyAI
- ✅ Vercel deployment + GitHub auto-deploy on push
- ✅ Public repo (Hobby plan compatible)
- ✅ "Last verified" date label on every scholarship card
- ✅ Submit-a-scholarship + Report-outdated mailto links in footer

### Production smoke-tested

All routes return 200. /about renders. UF page shows Coca-Cola/Bright Futures/verified labels/submit links. AI matches stream progressively.

---

## ⏳ PENDING — short list

### This week (blockers for "real launch")
- [ ] Buy `collegemoneyai.com` (~$10/yr at Cloudflare Registrar) and point at Vercel
- [ ] Privacy policy + ToS (boilerplate from termly.io — required before sharing publicly)
- [ ] Plausible or Vercel Analytics — need to know what people do
- [ ] Mobile QA pass on real iPhone (open every page, fix anything that breaks)
- [ ] Lock @collegemoneyai social handles (IG, TikTok, X) before someone else does

### First user signal
- [ ] Test full flow on user's own phone end-to-end
- [ ] Send URL to sister + 5 trusted friends; watch them use it without help; note top 3 frictions
- [ ] Email/visit ONE counselor at Buchholz / Eastside / Gainesville HS
- [ ] One soft-launch post on r/Gainesville or r/UF

### Phase 3 — the paid feature (V1.1)
- [ ] **Autofill MVP** — profile generates pre-filled application packets (the $39/yr feature)
  - Estimated: 2–3 hours focused build
- [ ] Phase 4 (after ~500 users): Stripe paywall, $39/yr parent-pay tier

### Background / async
- [ ] CareerOneStop API token (1–3 business days from federal API)
- [ ] More college scrapers — FSU, UCF, USF foundation awards
- [ ] CI workflow lint failure (deferred; not blocking deploy)

---

## What's OUT of V1 (deferred to V1.1+)

- Login / Supabase Auth (use localStorage profile instead — zero friction)
- Saved scholarships, application tracker
- Email / SMS deadline reminders (Resend)
- Real HTML scrapers + cron jobs (manual curation faster + higher quality for now)
- Admin tooling (use Supabase Studio)
- Counselor / parent dashboards
- Match result caching in DB (sessionStorage cache by profile_hash works for now)
- SEO / sitemap optimization

---

## Architecture / where the interesting code lives

| File | Purpose |
|---|---|
| `web/app/api/match/route.ts` | NDJSON streaming AI match endpoint |
| `web/lib/match-prefilter.ts` | Tag-based top-18 pre-filter |
| `web/lib/claude/match-prompt.ts` | System prompt + cached user message |
| `web/lib/profile.ts` | Profile zod schema, localStorage I/O, profile_hash |
| `web/components/MatchSection.tsx` | Streaming match UI client component |
| `web/components/ScholarshipCard.tsx` | Card + last-verified label |
| `scraper/src/scraper/sources/uf_sfa.py` | 23 UF scholarships (hand-curated) |
| `scraper/src/scraper/sources/florida_state.py` | 11 FL state programs |
| `scraper/src/scraper/sources/nationals.py` | 10 verified nationals |
| `scraper/seed_colleges.py` | 41 FL college upsert |
| `supabase/migrations/0001_init.sql` | Source of truth for data model |

### Local dev quirks
- **Python 3.14 on macOS skips `.pth` files starting with `__`** — `conftest.py` adds `src/` to sys.path; use `./scrape` wrapper script
- **`unset ANTHROPIC_API_KEY`** before `npm run dev` if shell has empty value inheriting

---

## Risks & mitigations for V1

| Risk | Mitigation |
|---|---|
| Claude returns garbage | JSON schema + zod validation + graceful fallback |
| Scholarship data goes stale | "Last verified" + mailto report link + monthly re-curation |
| Vercel free tier limits | Handles low thousands of MAU; upgrade only when needed |
| Profile lost on browser clear | Small profile, easy to refill; clean "no profile" prompt |
| Claude cost spike | Prompt caching = ~$0.001/match; rate-limit by IP if abuse |

---

## Monetization end-game

- Free tier: browse all scholarships + AI matching
- $39/yr (parent-pay): autofill application packets + essay help + deadline reminders
- Target: 25 paying customers + 1 counselor pilot by Dec 2026 (~$1k MRR)
- B2B counselor dashboard ($500–2k/yr per high school) — V2

The MVP architecture is monetization-ready — `profiles.subscription_tier` + Stripe integration is ~1 day of work when signal exists.

---

## Build history

```
✅ May 7  scaffolded → landing → college pages → 23 UF scholarships
✅ May 7  AI matching live (Claude Sonnet 4.6 + prompt caching)
✅ May 8  expanded to 42 scholarships, 41 FL colleges
✅ May 8  Vercel deploy fixed (public repo + correct git author)
✅ May 8  Phase 1 polish: streaming, pre-filter, /about, footer mailtos, verified labels
─────────────────────────── V1 LIVE ───────────────────────────
⏳        domain + privacy + analytics + first 5 users
⏳        autofill MVP (the paid feature)
⏳        Stripe paywall (after ~500 users)
```
