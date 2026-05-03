# Scholarship Finder

A college-focused scholarship finder. MVP scope: Gainesville / North Florida; built to scale nationwide.

Plan: `~/.claude/plans/b-100-i-believe-serialized-gray.md`

## Layout

```
scholarship-finder/
├── web/         # Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
├── scraper/     # Python 3.11+ scraper service (httpx + BeautifulSoup + Playwright)
├── supabase/
│   └── migrations/   # SQL schema + seeds, applied via Supabase dashboard or CLI
└── .github/workflows/  # Cron-triggered scrapes
```

## One-time setup

1. **Supabase project** — create one at https://supabase.com (free tier). In the project SQL editor, run:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_north_florida_colleges.sql`
2. **Copy env** — `cp .env.example web/.env.local` and `cp .env.example scraper/.env`. Fill in real values.
3. **Anthropic key** — get one at https://console.anthropic.com and put it in `web/.env.local`.

## Web app (`web/`)

```bash
cd web
npm install   # already done by create-next-app
npm run dev   # http://localhost:3000
```

## Scraper (`scraper/`)

```bash
cd scraper
python3 -m venv .venv               # already done
.venv/bin/pip install -e ".[dev]"   # already done

# Smoke test (no DB write):
.venv/bin/python -m scraper.run --source uf_sfa --dry-run

# Real run (writes to Supabase using SUPABASE_SERVICE_ROLE_KEY):
.venv/bin/python -m scraper.run --all
```

## Build phases

Tracked in the plan file. Order of attack:

1. **Phase 0 — done.** Repo + tooling scaffolded.
2. **Phase 1 — DB.** Apply migrations to your Supabase project.
3. **Phase 2 — Real UF scraper.** Replace the stub in `scraper/src/scraper/sources/uf_sfa.py` with real HTML parsing of sfa.ufl.edu.
4. **Phase 3 — College search & scholarship list pages.**
5. **Phase 4 — Auth + profile.**
6. **Phase 5 — AI matching endpoint.**
7. **Phase 6 — Saved scholarships.**
8. **Phase 7 — More scrapers + GitHub Actions cron.**
9. **Phase 8 — Polish + Vercel deploy.**
