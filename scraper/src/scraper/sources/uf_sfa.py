"""University of Florida — Office of Student Financial Affairs.

Source URL: https://www.sfa.ufl.edu/types-of-aid/scholarships/

Strategy: the SFA page is a long-form editorial document with H2/H3 headings
followed by descriptive paragraphs. Rather than fragile CSS-selector parsing,
this source ships a hand-curated list of scholarships extracted from the page
on 2026-05-07. The list is upserted by (source, external_id) so re-running is
idempotent and safe.

Future iteration (V1.1): re-introduce a Playwright fetch + Claude-assisted
extraction pass that runs every ~7 days to detect changes (new endowed funds,
amount adjustments). For now this captures everything actionable on the page.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

import httpx

from scraper.models import ScholarshipItem
from scraper.sources.base import Source


# --- Source URLs -----------------------------------------------------------
# PAGE_URL is the SFA scholarships landing page — kept for endowed/named
# awards that ONLY live on that page (no separate apply form).
PAGE_URL = "https://www.sfa.ufl.edu/types-of-aid/scholarships/"

# Most UF freshman scholarships are auto-considered when you submit the
# admissions application. For those, link directly to the apply portal so
# students don't have to hunt for the right scholarship on a long page.
# (admissions.ufl.edu/apply alone 403s — the canonical freshman path is /apply/freshman/.)
APPLY_URL = "https://admissions.ufl.edu/apply/freshman/"

# Stamps Scholars Program is admin'd via the Honors Program (Early Action).
STAMPS_URL = "https://www.stampsscholars.org/applying/scholarship-programs/university-of-florida"

# Grandparent Waiver has its own residency-office process.
RESIDENCY_WAIVER_URL = "https://admissions.ufl.edu/cost-and-aid/residency#fee-waiver"

# All UF freshman merit awards share the Nov 1 priority deadline for the
# upcoming fall admission cycle. Currently: applying Nov 2026 -> Fall 2027.
NEXT_NOV_1 = date(2026, 11, 1)

UF_SLUG = "university-of-florida"


def _items() -> list[ScholarshipItem]:
    """Hand-curated UF scholarship corpus. Order matches the SFA page."""

    rows: list[dict] = [
        # === Florida resident merit (auto-considered) =====================
        {
            "external_id": "uf-florida-merit-1k",
            "source_url": APPLY_URL,
            "name": "Florida Merit Scholarship — $1,000/year",
            "amount_min": 4000, "amount_max": 4000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Tuition merit award for Florida residents admitted to UF. $1,000/year for four years.",
            "eligibility_text": "Florida resident; admitted to UF as a first-time-in-college freshman by the Nov 1 priority deadline. Automatic consideration; no separate application.",
            "tags": ["merit", "florida-resident", "in-state", "auto-consideration"],
        },
        {
            "external_id": "uf-florida-merit-2k",
            "source_url": APPLY_URL,
            "name": "Florida Merit Scholarship — $2,000/year",
            "amount_min": 8000, "amount_max": 8000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Higher-tier Florida resident merit award. $2,000/year for four years.",
            "eligibility_text": "Florida resident; competitive academic profile; admitted to UF by Nov 1 priority deadline. Automatic consideration; no separate application.",
            "tags": ["merit", "florida-resident", "in-state", "auto-consideration"],
        },
        {
            "external_id": "uf-presidential",
            "source_url": APPLY_URL,
            "name": "UF Presidential Scholarship",
            "amount_min": 20000, "amount_max": 20000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Top-tier merit scholarship for Florida residents. $5,000/year for four years.",
            "eligibility_text": "Florida resident; high academic achievement; admitted to UF as a first-time-in-college freshman by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "florida-resident", "in-state", "auto-consideration", "top-tier"],
        },
        {
            "external_id": "uf-presidential-gold",
            "source_url": APPLY_URL,
            "name": "UF Presidential Gold Scholarship",
            "amount_min": 32000, "amount_max": 32000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Florida resident merit award. $8,000/year for four years.",
            "eligibility_text": "Florida resident; very competitive academic record; admitted to UF as a first-time-in-college freshman by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "florida-resident", "in-state", "auto-consideration", "top-tier"],
        },
        {
            "external_id": "uf-presidential-platinum",
            "source_url": APPLY_URL,
            "name": "UF Presidential Platinum Scholarship",
            "amount_min": 40000, "amount_max": 40000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Highest Florida-resident merit award at UF. $10,000/year for four years.",
            "eligibility_text": "Florida resident; exceptional academic profile; admitted to UF as a first-time-in-college freshman by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "florida-resident", "in-state", "auto-consideration", "top-tier"],
        },

        # === Out-of-state tuition scholarships ============================
        {
            "external_id": "uf-alumni-tuition",
            "source_url": APPLY_URL,
            "name": "Alumni Tuition Scholarship",
            "amount_min": 40000, "amount_max": 40000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Out-of-state tuition assistance, up to $10,000/year for four years.",
            "eligibility_text": "Non-Florida resident; merit-based; admitted to UF as a first-time-in-college freshman by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "out-of-state", "auto-consideration"],
        },
        {
            "external_id": "uf-sunshine-tuition",
            "source_url": APPLY_URL,
            "name": "Sunshine Tuition Scholarship",
            "amount_min": 64000, "amount_max": 64000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Out-of-state merit award, up to $16,000/year for four years.",
            "eligibility_text": "Non-Florida resident; competitive merit profile; admitted to UF by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "out-of-state", "auto-consideration", "top-tier"],
        },
        {
            "external_id": "uf-gator-nation-tuition",
            "source_url": APPLY_URL,
            "name": "Gator Nation Tuition Scholarship",
            "amount_min": 80000, "amount_max": 80000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Top out-of-state merit award, up to $20,000/year for four years — covers a large share of out-of-state tuition.",
            "eligibility_text": "Non-Florida resident; exceptional academic profile; admitted to UF by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "out-of-state", "auto-consideration", "top-tier"],
        },
        {
            "external_id": "uf-distinguished-scholar-8k",
            "source_url": APPLY_URL,
            "name": "UF Distinguished Scholar Tuition Scholarship — $8,000",
            "amount_min": 32000, "amount_max": 32000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Out-of-state tuition assistance, up to $8,000/year for four years.",
            "eligibility_text": "Non-Florida resident; merit-based; admitted to UF by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "out-of-state", "auto-consideration"],
        },
        {
            "external_id": "uf-distinguished-scholar-6k",
            "source_url": APPLY_URL,
            "name": "UF Distinguished Scholar Tuition Scholarship — $6,000",
            "amount_min": 24000, "amount_max": 24000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Out-of-state tuition assistance, up to $6,000/year for four years.",
            "eligibility_text": "Non-Florida resident; merit-based; admitted to UF by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "out-of-state", "auto-consideration"],
        },
        {
            "external_id": "uf-distinguished-scholar-4k",
            "source_url": APPLY_URL,
            "name": "UF Distinguished Scholar Tuition Scholarship — $4,000",
            "amount_min": 16000, "amount_max": 16000,
            "deadline": NEXT_NOV_1,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Out-of-state tuition assistance, up to $4,000/year for four years.",
            "eligibility_text": "Non-Florida resident; merit-based; admitted to UF by Nov 1 priority deadline. Automatic consideration.",
            "tags": ["merit", "out-of-state", "auto-consideration"],
        },

        # === Need-based and special programs ==============================
        {
            "external_id": "uf-machen-florida-opportunity",
            "source_url": APPLY_URL,
            "name": "Machen Florida Opportunity Scholarship (MFOS)",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Need-based award for first-generation Florida residents. Aims to fully meet financial need with a combination of grants and scholarships — no loans required.",
            "eligibility_text": "Florida resident; graduated from a Florida high school; first-time-in-college freshman; first-generation (neither parent has a bachelor's degree); parents' combined income below $55,000 and assets below $35,000; enrolled at least 12 credit hours/semester; no prior aid default.",
            "tags": ["need-based", "first-gen", "florida-resident", "no-loans"],
        },
        {
            "external_id": "uf-stamps-scholars",
            "source_url": STAMPS_URL,
            "name": "Stamps Scholars Program",
            "amount_min": 24000, "amount_max": 24000,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "$6,000 annual stipend for up to four years, plus four fully-funded summer enrichment trips. Highly selective.",
            "eligibility_text": "First-time-in-college student admitted to the UF Honors Program through Early Action. Considered automatically; finalists interview.",
            "tags": ["merit", "honors", "top-tier", "summer-enrichment"],
        },
        # Benacquisto moved to florida_state source (it's portable to any FL public school).
        {
            "external_id": "uf-grandparent-waiver",
            "source_url": RESIDENCY_WAIVER_URL,
            "name": "Grandparent Waiver of Out-of-State Tuition and Fees",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Waives the full out-of-state tuition and fee differential for non-Florida residents with a Florida-resident grandparent.",
            "eligibility_text": "Out-of-state student with at least one grandparent who is a Florida resident. Must apply through the UF residency office.",
            "tags": ["out-of-state", "tuition-waiver", "family"],
        },

        # === SFA-administered endowed scholarships ========================
        {
            "external_id": "uf-sfa-general",
            "name": "SFA-Awarded Need-Based Scholarships",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Pool of endowed scholarships administered by the Office for Student Financial Affairs. Awards vary by donor criteria.",
            "eligibility_text": "Complete the FAFSA; demonstrate financial need; minimum 3.0 GPA; meet individual donor criteria. No separate application — students are auto-matched.",
            "tags": ["need-based", "auto-consideration", "endowed"],
        },
        {
            "external_id": "uf-gene-wright",
            "name": "Gene Wright Scholarship Fund",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "local", "college_slug": UF_SLUG,
            "description": "For Martin County, FL high school graduates entering UF as freshmen.",
            "eligibility_text": "Martin County, Florida high school graduate; entering UF as a first-time-in-college freshman; meet additional criteria during senior year.",
            "tags": ["local", "martin-county", "florida-resident"],
        },
        {
            "external_id": "uf-kenneth-watson",
            "name": "Kenneth D. Watson Memorial Scholarship",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "local", "college_slug": UF_SLUG,
            "description": "Need-based award with preference for Gainesville High School graduates and Alachua County residents.",
            "eligibility_text": "Demonstrate financial need; preference given to Gainesville High School graduates first, then Alachua County residents.",
            "tags": ["need-based", "local", "alachua-county", "gainesville"],
        },
        {
            "external_id": "uf-metta-heathcote",
            "name": "Metta Heathcote Scholarship",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "local", "college_slug": UF_SLUG,
            "description": "For Pinellas County, FL residents. Strong preference for St. Petersburg residents.",
            "eligibility_text": "Pinellas County, Florida resident; graduated from a Pinellas County high school; preference for St. Petersburg residents.",
            "tags": ["local", "pinellas-county", "st-petersburg", "florida-resident"],
        },
        {
            "external_id": "uf-ryan-mckee",
            "name": "Ryan McKee Scholarship",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Need-based award with preferences for veterans, criminology majors, ROTC students, and Piper High School graduates.",
            "eligibility_text": "Demonstrated financial need; minimum 3.0 GPA; preference for veterans, criminology majors, ROTC students, or Piper High School (Sunrise, FL) graduates.",
            "tags": ["need-based", "veterans", "criminology", "rotc"],
        },
        {
            "external_id": "uf-follett-bookstore",
            "name": "Follett Bookstore Scholarship",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Bookstore credit equal to the standard cost for undergraduate books and supplies for one year.",
            "eligibility_text": "Awarded by SFA; criteria not publicly listed. Typically goes to need-eligible undergraduates.",
            "tags": ["need-based", "books", "supplies"],
        },
        {
            "external_id": "uf-jessie-ball-dupont",
            "name": "Jessie Ball duPont / Alfred I. duPont Scholarship",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "scope": "school", "college_slug": UF_SLUG,
            "description": "Endowed scholarship at UF. Recipients are encouraged to 'pay it forward' — donating a like amount after graduation when able.",
            "eligibility_text": "Awarded by SFA; criteria not publicly listed.",
            "tags": ["endowed", "pay-it-forward"],
        },

        # State-wide programs (Bright Futures + tiers, FSAG, etc.) live in
        # the florida_state source — they're portable to all FL public schools.
    ]

    items: list[ScholarshipItem] = []
    for r in rows:
        items.append(
            ScholarshipItem(
                external_id=r["external_id"],
                source="uf_sfa",
                source_url=r.get("source_url", PAGE_URL),
                name=r["name"],
                description=r.get("description"),
                amount_min=r.get("amount_min"),
                amount_max=r.get("amount_max"),
                deadline=r.get("deadline"),
                eligibility_text=r.get("eligibility_text"),
                scope=r["scope"],
                college_slug=r.get("college_slug"),
                tags=r.get("tags", []),
            )
        )
    return items


class UFStudentFinancialAffairs(Source):
    name = "uf_sfa"
    base_url = PAGE_URL

    def fetch(self, client: httpx.Client) -> Iterable[ScholarshipItem]:
        # Currently returns the curated corpus (last verified 2026-05-07).
        # The `client` argument is unused for now but kept on the signature so
        # a future iteration can switch to live HTML fetching + Claude-assisted
        # extraction without changing the call sites.
        yield from _items()
