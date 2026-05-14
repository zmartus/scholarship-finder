"""Claude-powered scholarship extractor.

Given a college's slug + financial aid page URL, fetch the HTML, send it to
Claude, and parse out structured scholarship records ready for the
`scholarships` table.

Unlike the hand-curated sources in `scraper.sources`, this module is generic:
point it at any college's scholarships page and it should extract everything
listed there.

Usage (CLI — wired in `scraper.run`):
    ./scrape extract --college fsu --dry-run
    ./scrape extract --college fsu              # upserts to Supabase
    ./scrape extract --all-tier1                # runs every Tier 1 school

Tier 1 college URLs live in `COLLEGE_URLS`. Add a school here once its main
financial-aid scholarships page is identified.
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import date, datetime
from typing import Any

import anthropic
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from pydantic import BaseModel, Field, ValidationError

from scraper.models import ScholarshipItem


# ============================================================================
# Tier 1 college URL map
# ============================================================================
# Slug must match the `colleges.slug` column in Supabase exactly.
# URL is the main scholarships listing page on that school's financial aid site.

COLLEGE_URLS: dict[str, dict[str, str]] = {
    "florida-state-university": {
        "name": "Florida State University",
        "url": "https://admissions.fsu.edu/first-year/scholarships",
    },
    "university-of-central-florida": {
        "name": "University of Central Florida",
        # The general /scholarships/ landing page is navigational with no named
        # awards. The Pegasus program page is where UCF's main merit awards live.
        "url": "https://www.ucf.edu/financial-aid/types/scholarships/pegasus/",
    },
    "university-of-south-florida": {
        "name": "University of South Florida",
        "url": "https://www.usf.edu/admissions/freshmen/admissions-scholarships/",
    },
    "florida-international-university": {
        "name": "Florida International University",
        "url": "https://scholarships.fiu.edu/browse-scholarships/merit-scholarships/",
    },
    "florida-atlantic-university": {
        "name": "Florida Atlantic University",
        "url": "https://www.fau.edu/admissions/freshman/scholarships/",
    },
    "university-of-miami": {
        "name": "University of Miami",
        "url": "https://admissions.miami.edu/undergraduate/financial-aid/scholarships/freshman/index.html",
    },
    "stetson-university": {
        "name": "Stetson University",
        "url": "https://www.stetson.edu/administration/financial-aid/scholarships/",
    },
    "rollins-college": {
        "name": "Rollins College",
        "url": "https://www.rollins.edu/scholarships-aid/scholarships/",
    },
    "embry-riddle-aeronautical": {
        "name": "Embry-Riddle Aeronautical University",
        "url": "https://daytonabeach.erau.edu/financial-aid/scholarships",
    },
    "florida-institute-of-technology": {
        "name": "Florida Institute of Technology",
        "url": "https://www.fit.edu/admission/scholarships--aid/university-scholarships-and-grants/",
    },
    "new-college-of-florida": {
        "name": "New College of Florida",
        "url": "https://www.ncf.edu/admissions/first-year-students/scholarships/",
    },
}


# ============================================================================
# Claude config
# ============================================================================
EXTRACTION_MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are a precise scholarship-data extractor.

You will receive the HTML body of a single college's financial aid scholarships page.
Your job: extract every distinct, named scholarship described on that page into a
structured JSON list.

What COUNTS as a scholarship for our purposes:
- Named awards specific to this college (Presidential, Provost, Honors, endowed funds,
  donor-named scholarships, departmental awards, etc.)
- Awards where the college itself is the application target (not external links to
  national programs like Coca-Cola or Gates — those live in our nationals corpus)
- Tuition waivers and merit packages that have a name and stated criteria

What does NOT count (skip these):
- Federal/state aid programs (FAFSA, Pell, Florida Bright Futures, Florida Student
  Assistance Grant) — these are already handled in our state corpus
- Generic financial aid mentions ("you may qualify for grants")
- Links to external scholarship search engines
- Instructions about how to apply for aid in general
- Navigation, footer, sidebar boilerplate

For EACH scholarship, return a JSON object with EXACTLY these fields:

{
  "name": "string — official scholarship name, no fluff",
  "description": "string OR null — 1–2 sentence plain-English summary of what this is and what makes it distinct",
  "amount_min": number OR null,  // dollars (the minimum or only stated amount)
  "amount_max": number OR null,  // dollars (the maximum stated amount; equal to min if single-value)
  "deadline": "YYYY-MM-DD" OR null,  // null for rolling, unstated, or year-round
  "eligibility_text": "string OR null — paragraph(s) describing who can apply, in their words where possible",
  "tags": ["lowercase-hyphenated-strings"]  // 2–6 tags categorizing the award
}

Tag vocabulary (use these where they apply, add new ones only when needed):
  merit, need-based, first-gen, honors, stem, top-tier, transfer, auto-consideration,
  out-of-state, in-state, florida-resident, athletics, leadership, community-service,
  international, veterans, rotc, endowed, departmental, freshman-only, returning-students,
  diversity, women-in-stem, arts, music, performance, religious

Amount parsing rules:
- "Up to $20,000" → amount_min=null, amount_max=20000
- "$5,000–$10,000" → amount_min=5000, amount_max=10000
- "$3,000/year for 4 years" → amount_min=12000, amount_max=12000 (total value)
- "$3,000 per year" with no duration → amount_min=3000, amount_max=3000 (one year)
- "Full tuition" → amount_min=null, amount_max=null, add tag "full-tuition"
- Multiple tiers? Emit one row per tier.

Deadline parsing rules:
- "November 1" with no year → assume the next upcoming Nov 1
- "Rolling" or "throughout the year" → null
- "Priority deadline" → use that date
- If multiple deadlines given (early/regular), use the regular one

Output a single JSON object:
{
  "scholarships": [ {...}, {...}, ... ]
}

If the page has no extractable named scholarships, return {"scholarships": []}.

Be conservative. If a "scholarship" has no name or no real criteria, skip it.
If the page is mostly about aid types in general with no named awards, return empty.
Do not invent details that aren't on the page.

Return ONLY the JSON object. No prose, no markdown fences."""


# ============================================================================
# Output validation
# ============================================================================
class ExtractedScholarship(BaseModel):
    """Shape Claude returns. Validates each row before we trust it."""

    name: str = Field(..., min_length=3, max_length=300)
    description: str | None = Field(None, max_length=1000)
    amount_min: float | None = None
    amount_max: float | None = None
    deadline: date | None = None
    eligibility_text: str | None = Field(None, max_length=4000)
    tags: list[str] = Field(default_factory=list, max_length=12)


class ExtractionEnvelope(BaseModel):
    scholarships: list[ExtractedScholarship]


# ============================================================================
# Fetch + clean HTML
# ============================================================================
# Some university WAFs (FSU's notably) reject obvious bot User-Agents. Public
# scholarship pages aren't sensitive content, so we use a real-browser UA. If
# any school explicitly asks us to stop (robots.txt or contact), we honor it.
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# Strip these wholesale — they're noise that wastes Claude tokens.
NOISE_TAGS = {"script", "style", "noscript", "iframe", "svg", "form", "nav", "footer", "aside"}


def fetch_and_clean(url: str, timeout_ms: int = 30_000) -> str:
    """Fetch the URL via headless Chromium and return cleaned HTML for Claude.

    Why Playwright instead of httpx: most university financial-aid sites sit
    behind Cloudflare or similar WAFs that TLS-fingerprint Python HTTP clients
    and return 403. A real browser bypasses this. Side benefit: JS-rendered
    content gets executed before we read the DOM.

    We strip scripts/styles/nav/etc. and keep main content + headings + lists.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(
                user_agent=USER_AGENT,
                viewport={"width": 1280, "height": 800},
                locale="en-US",
            )
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
            # Some sites lazy-load with JS — give them a moment after DOM ready.
            try:
                page.wait_for_load_state("networkidle", timeout=10_000)
            except Exception:
                pass  # 10s is plenty; networkidle is best-effort
            html = page.content()
        finally:
            browser.close()

    soup = BeautifulSoup(html, "lxml")

    # Drop noise tags entirely
    for tag in soup.find_all(list(NOISE_TAGS)):
        tag.decompose()

    # Drop common UI-widget wrappers that match real content tags but aren't.
    # (e.g. Stetson loads a chatbot transcript as the first <article> element.)
    for tag in soup.find_all(class_=re.compile(r"(?i)chatbot|chat-widget|ocelot|transcript|cookie")):
        tag.decompose()

    # Container: prefer <main> (semantic), fall back to <body>. Skip <article>
    # because vendors often wrap widgets in it and pollute extraction.
    container = soup.find("main") or soup.body or soup
    text_html = str(container)

    # Collapse multiple blank lines + strip trailing whitespace
    text_html = re.sub(r"\n\s*\n+", "\n\n", text_html).strip()

    return text_html


# ============================================================================
# Claude extraction
# ============================================================================
def call_claude(college_name: str, html_body: str) -> list[ExtractedScholarship]:
    """Send the HTML to Claude and return validated scholarship objects.

    Uses prompt caching on the system prompt — running multiple schools in
    a single session pays for the cache once and discounts the rest.
    """
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

    user_msg = (
        f"College: {college_name}\n\n"
        f"Here is the financial-aid scholarships page HTML. Extract every named "
        f"scholarship per the system prompt rules.\n\n"
        f"---BEGIN HTML---\n{html_body}\n---END HTML---"
    )

    response = client.messages.create(
        model=EXTRACTION_MODEL,
        max_tokens=8000,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_msg}],
    )

    # Concatenate any text blocks returned
    raw = "".join(block.text for block in response.content if block.type == "text")

    # Strip optional markdown fences just in case
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    # Be forgiving about what Claude returns. Claude sometimes:
    #   - Returns the envelope        →  {"scholarships": [...]}  (preferred)
    #   - Returns the array directly  →  [{...}, {...}, ...]
    #   - Wraps in prose              →  "Here are the scholarships: {...}"
    # Find the first JSON delimiter and slice from there.
    first_brace = raw.find("{")
    first_bracket = raw.find("[")
    candidates = [i for i in (first_brace, first_bracket) if i >= 0]
    if candidates:
        raw = raw[min(candidates):]

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[extract] Claude returned unparseable output:\n{raw[:800]}", file=sys.stderr)
        raise RuntimeError(f"Extraction JSON parse failure: {exc}") from exc

    # Normalize either the envelope or a bare list into ExtractionEnvelope.
    if isinstance(parsed, list):
        parsed = {"scholarships": parsed}
    elif isinstance(parsed, dict) and "scholarships" not in parsed:
        # Sometimes Claude returns a dict where each key is a scholarship name.
        # Treat the dict's values as the list if they all look like scholarships.
        values = list(parsed.values())
        if values and all(isinstance(v, dict) and "name" in v for v in values):
            parsed = {"scholarships": values}

    try:
        envelope = ExtractionEnvelope.model_validate(parsed)
    except ValidationError as exc:
        print(f"[extract] Claude output failed validation:\n{json.dumps(parsed, indent=2)[:800]}", file=sys.stderr)
        raise RuntimeError(f"Extraction validation failure: {exc}") from exc

    return envelope.scholarships


# ============================================================================
# Glue: turn extracted rows into ScholarshipItems
# ============================================================================
def _slugify_external_id(college_slug: str, name: str) -> str:
    """Stable external_id so re-runs UPDATE rather than INSERT duplicates."""
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60]
    return f"{college_slug}-{base}"


def to_scholarship_items(
    college_slug: str,
    college_name: str,
    source_url: str,
    extracted: list[ExtractedScholarship],
) -> list[ScholarshipItem]:
    items: list[ScholarshipItem] = []
    source_name = f"extract:{college_slug}"

    for e in extracted:
        items.append(
            ScholarshipItem(
                external_id=_slugify_external_id(college_slug, e.name),
                source=source_name,
                source_url=source_url,
                name=e.name,
                description=e.description,
                amount_min=e.amount_min,
                amount_max=e.amount_max,
                deadline=e.deadline,
                eligibility_text=e.eligibility_text,
                scope="school",
                college_slug=college_slug,
                tags=e.tags,
            )
        )
    return items


# ============================================================================
# Top-level: extract one college end-to-end
# ============================================================================
def extract_one(college_slug: str) -> list[ScholarshipItem]:
    """Fetch + extract + normalize for a single college slug from COLLEGE_URLS."""
    if college_slug not in COLLEGE_URLS:
        raise KeyError(
            f"Unknown college slug '{college_slug}'. "
            f"Available: {sorted(COLLEGE_URLS)}"
        )

    meta = COLLEGE_URLS[college_slug]
    started = datetime.now()
    print(f"[{college_slug}] fetching {meta['url']}", file=sys.stderr)
    html_body = fetch_and_clean(meta["url"])
    print(
        f"[{college_slug}] fetched {len(html_body):,} chars in "
        f"{(datetime.now() - started).total_seconds():.1f}s",
        file=sys.stderr,
    )

    started_claude = datetime.now()
    extracted = call_claude(meta["name"], html_body)
    print(
        f"[{college_slug}] Claude returned {len(extracted)} scholarship(s) in "
        f"{(datetime.now() - started_claude).total_seconds():.1f}s",
        file=sys.stderr,
    )

    items = to_scholarship_items(college_slug, meta["name"], meta["url"], extracted)
    return items


def tier1_slugs() -> list[str]:
    return list(COLLEGE_URLS.keys())
