"""High-value national scholarships open to U.S. high school seniors.

Last verified against each foundation's own page on 2026-05-08.
For scholarships whose next cycle isn't officially announced, deadline is
None and the description carries the typical annual window — students
should always verify on the source page before applying.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

import httpx

from scraper.models import ScholarshipItem
from scraper.sources.base import Source


def _items() -> list[ScholarshipItem]:
    rows: list[dict] = [
        {
            "external_id": "nat-coca-cola-scholars",
            "name": "Coca-Cola Scholars Program",
            "source_url": "https://www.coca-colascholarsfoundation.org/apply/",
            "amount_min": 20000, "amount_max": 20000,
            "deadline": date(2026, 9, 30),  # Verified 2026-05-08: opens Aug 1, 2026; closes Sept 30, 2026 at 5pm ET
            "description": "Achievement-based scholarship for graduating high school seniors. 150 winners annually receive $20,000 each. Highly competitive — ~95,000 applicants per year. The 2027 application opens August 1, 2026 and closes September 30, 2026.",
            "eligibility_text": "U.S. high school senior (graduating 2026-2027 academic year); minimum 3.0 GPA; planning to enroll full-time in an accredited U.S. college; demonstrated leadership, academic excellence, and community service. Apply directly through the Foundation site.",
            "tags": ["merit", "leadership", "service", "national", "highly-competitive"],
        },
        {
            "external_id": "nat-hispanic-scholarship-fund",
            "name": "Hispanic Scholarship Fund (HSF) Scholarship",
            "source_url": "https://www.hsf.net/scholarship",
            "amount_min": 500, "amount_max": 5000,
            "deadline": None,  # 2025-2026 cycle closed Feb 15, 2026. Next cycle (2026-2027) typically opens early January each year.
            "description": "Renewable scholarship for students of Hispanic heritage. Awards range from $500 to $5,000. The 2026-2027 cycle typically opens in early January 2027 and closes in mid-February 2027 — confirm exact dates on the source.",
            "eligibility_text": "Must be of Hispanic heritage; U.S. citizen, permanent resident, DACA, or eligible non-citizen; high school senior or current undergrad/grad student; minimum 3.0 GPA (high school) or 2.5 GPA (college); plan to enroll full-time at an accredited U.S. institution; complete FAFSA.",
            "tags": ["hispanic", "diversity", "national", "renewable"],
        },
        {
            "external_id": "nat-gates-scholarship",
            "name": "The Gates Scholarship",
            "source_url": "https://www.thegatesscholarship.org/scholarship",
            "amount_min": None, "amount_max": None,
            "deadline": None,  # 2026-2027 cycle not yet announced. Application typically opens mid-July; closes mid-September.
            "description": "Last-dollar scholarship covering full unmet need at any U.S. accredited college. 300 winners selected annually from minority Pell-eligible high school seniors. The application typically opens in mid-July and closes in mid-September each year — confirm the current cycle on the official site before applying.",
            "eligibility_text": "U.S. high school senior; minority ethnicity (African American, American Indian/Alaska Native, Asian/Pacific Islander, Hispanic American); Pell-eligible; minimum 3.3 GPA; planning to enroll full-time in a 4-year U.S. college; show leadership.",
            "tags": ["minority", "need-based", "full-ride", "national", "highly-competitive", "pell-eligible"],
        },
        {
            "external_id": "nat-jack-kent-cooke-college",
            "name": "Jack Kent Cooke Foundation College Scholarship",
            "source_url": "https://www.jkcf.org/our-scholarships/college-scholarship-program/",
            "amount_min": None, "amount_max": 55000,
            "deadline": None,  # Verified 2026-05-08: application currently closed. Cycle typically opens early August, closes mid-November.
            "description": "Up to $55,000 per year for high-achieving high school seniors with financial need. Renewable up to four years at any accredited U.S. college. The next cycle is currently between application windows — typically the application opens in early August and closes in mid-November.",
            "eligibility_text": "U.S. high school senior; minimum 3.5 GPA; combined family income up to $95,000; planning to enroll full-time; demonstrated academic excellence, leadership, and service. Highly competitive.",
            "tags": ["need-based", "merit", "national", "highly-competitive", "renewable", "top-tier"],
        },
        {
            "external_id": "nat-burger-king-scholars",
            "name": "Burger King Scholars Program",
            "source_url": "https://burgerkingfoundation.org/programs/burger-king-sm-scholars",
            "amount_min": 1000, "amount_max": 50000,
            "deadline": None,  # Verified 2026-05-08: 2026-2027 cycle was Oct 15, 2025 - Dec 15, 2025 (closed). Next cycle (2027-2028) opens Oct 15, 2026.
            "description": "Awards range from $1,000 (Burger King Scholars) up to $50,000 (King's Hawaiian Scholars and Webber Family Scholarship). Open to U.S./Canada/Puerto Rico high school seniors. Next application cycle opens October 15, 2026 and closes December 15, 2026 (or earlier if 30,000 applications received).",
            "eligibility_text": "High school senior in the U.S., Canada, or Puerto Rico; minimum 2.5 GPA; planning to enroll in 2- or 4-year accredited college, university, or vocational/technical school; demonstrated work experience, community service, or extracurriculars.",
            "tags": ["national", "service", "vocational-eligible"],
        },
        {
            "external_id": "nat-horatio-alger-national",
            "name": "Horatio Alger National Scholarship",
            "source_url": "https://scholars.horatioalger.org/scholarships/",
            "amount_min": 25000, "amount_max": 25000,
            "deadline": date(2026, 10, 25),  # Forecast based on annual pattern (typically late October). Verify on source.
            "description": "$25,000 scholarship for students who have faced and overcome significant adversity. 106 awards annually. Application typically due in late October — verify current cycle dates on the official site.",
            "eligibility_text": "U.S. high school senior; minimum 2.0 GPA; demonstrated critical financial need (under $55,000 adjusted gross family income); exhibited integrity and perseverance through adversity; planning to enroll in a U.S. accredited college.",
            "tags": ["adversity", "need-based", "perseverance", "national"],
        },
        {
            "external_id": "nat-questbridge-college-match",
            "name": "QuestBridge National College Match",
            "source_url": "https://www.questbridge.org/high-school-students/national-college-match",
            "amount_min": None, "amount_max": None,
            "deadline": date(2026, 9, 30),  # Verified 2026-05-08: deadline is Sept 30 at 11:59pm Pacific (annual)
            "description": "Matches high-achieving low-income students with full four-year scholarships to 50+ partner colleges including Stanford, Yale, MIT, Princeton, Amherst, and others. Effectively a full ride at top schools. Application deadline is September 30 at 11:59pm Pacific Time.",
            "eligibility_text": "U.S. high school senior planning to enroll full-time as a freshman; outstanding academics typically including 1310+ SAT or 28+ ACT, top 10% class rank, top grades; family income typically below $65,000 for a household of four; first-generation status preferred but not required.",
            "tags": ["need-based", "low-income", "top-tier", "national", "full-ride", "highly-competitive"],
        },
        {
            "external_id": "nat-discover-tribute",
            "name": "Discover Student Loans Tribute Award",
            "source_url": "https://www.discover.com/student-loans/scholarship/",
            "amount_min": 2500, "amount_max": 10000,
            "deadline": date(2027, 1, 18),  # Forecast based on annual pattern (typically mid-January). Verify on source.
            "description": "Awards for high school sophomores and juniors. 750 awards of $2,500–$10,000 distributed annually based on community service and achievements. Application typically due in mid-January — verify current cycle on the official site.",
            "eligibility_text": "Current high school sophomore or junior in the U.S.; minimum 2.7 GPA; participated in community service; planning to attend college. No application essay or letters of rec required for the standard award.",
            "tags": ["service", "national", "underclassmen"],
        },
        {
            "external_id": "nat-elks-most-valuable-student",
            "name": "Elks Most Valuable Student Scholarship",
            "source_url": "https://www.elks.org/scholars/scholarships/mvs.cfm",
            "amount_min": 4000, "amount_max": 50000,
            "deadline": None,  # Verified 2026-05-08: 2027 application opens Aug 1, 2026. Closing date for 2027 cycle not yet announced.
            "description": "500 awards distributed yearly: 4-year scholarships from $4,000 to $50,000 total. Top 20 winners receive $20,000–$50,000 over four years. The 2027 application opens August 1, 2026; closing date typically mid-November.",
            "eligibility_text": "U.S. high school senior; planning to enroll in full-time, 4-year undergraduate course at an accredited U.S. college; U.S. citizen; not required to be related to an Elks member. Judged on scholarship, leadership, and financial need.",
            "tags": ["merit", "leadership", "need-based", "national"],
        },
        {
            "external_id": "nat-dell-scholars",
            "name": "Dell Scholars Program",
            "source_url": "https://www.dellscholars.org/",
            "amount_min": 20000, "amount_max": 20000,
            "deadline": date(2026, 12, 1),  # Forecast based on annual pattern (typically early December). Verify on source.
            "description": "$20,000 scholarship plus laptop and ongoing support resources. Targets students who have overcome significant obstacles to pursue higher education. Application typically due in early December — verify current cycle on the official site.",
            "eligibility_text": "U.S. high school senior; participated in approved college-readiness program (e.g., AVID, Upward Bound, College Forward) for at least 2 years; minimum 2.4 GPA; Pell-eligible (demonstrated need); planning to enroll full-time at an accredited U.S. college as a freshman the following fall.",
            "tags": ["need-based", "perseverance", "pell-eligible", "national", "first-gen-friendly"],
        },
    ]

    out: list[ScholarshipItem] = []
    for r in rows:
        out.append(
            ScholarshipItem(
                external_id=r["external_id"],
                source="nationals",
                source_url=r["source_url"],
                name=r["name"],
                description=r.get("description"),
                amount_min=r.get("amount_min"),
                amount_max=r.get("amount_max"),
                deadline=r.get("deadline"),
                eligibility_text=r.get("eligibility_text"),
                scope="national",
                college_slug=None,
                tags=r.get("tags", []),
            )
        )
    return out


class Nationals(Source):
    name = "nationals"
    base_url = "https://www.collegemoneyai.com"

    def fetch(self, client: httpx.Client) -> Iterable[ScholarshipItem]:
        yield from _items()
