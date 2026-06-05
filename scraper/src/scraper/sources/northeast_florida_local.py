"""Genuinely local Northeast Florida scholarships — the awards students miss.

These are hyper-local, often single-high-school or single-county scholarships
that never make it into national databases. They're the core of Grantaria's
thesis: a Ponte Vedra senior has no idea the Craig Speziale or Cole Kelley
award exists unless a counselor tells them. Now the app surfaces them.

Sources (hand-verified 2026-05-28):
  - INK! / Investing in Kids, St. Johns County — apply.ink-stjohns.org
  - The Community Foundation for Northeast Florida — jaxcf.org

These are NOT tied to a college (college_slug=None). They follow the student
(where they graduated from), not the school they're heading to. The matching
layer surfaces them by comparing the student's high_school against the region
tags below.

Deadlines: the 2025-26 cycle closed in March 2026. These are forward-dated to
the next upcoming cycle (spring 2027 for the class of 2027). Application
windows open ~February and close ~mid-March each year — always verify the
exact date on the official source.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

import httpx

from scraper.models import ScholarshipItem
from scraper.sources.base import Source

# Single application portals — most awards from each funder share one form.
JAXCF_APPLY = "https://jaxcf.formstack.com/forms/qualifyingscholarships2026"
JAXCF_HOME = "https://www.jaxcf.org/2026-college-scholarships/"
INK_APPLY = "https://apply.ink-stjohns.org/"

# Next-cycle deadlines (forward-dated; verify on source).
SJC_DEADLINE = date(2027, 3, 16)   # INK! St. Johns window typ. Feb 2 – Mar 16
CF_DEADLINE = date(2027, 3, 13)    # Community Foundation typ. mid-March
CF_DEADLINE_LATE = date(2027, 3, 27)


def _items() -> list[ScholarshipItem]:
    rows: list[dict] = [
        # ===== Community Foundation for NE Florida — single-school awards =====
        {
            "external_id": "neflocal-craig-speziale",
            "name": "Craig Speziale Memorial Scholarship",
            "source_url": JAXCF_APPLY,
            "amount_min": 3000, "amount_max": 3000,
            "deadline": CF_DEADLINE,
            "description": "One-time $3,000 award for a graduating senior at Ponte Vedra High School. Administered by The Community Foundation for Northeast Florida.",
            "eligibility_text": "Graduating senior at Ponte Vedra High School (St. Johns County, FL); minimum 3.4 unweighted GPA; accepted to an accredited college or university. Covers tuition, books, room and board, and college expenses.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "ponte-vedra-hs", "merit"],
        },
        {
            "external_id": "neflocal-cole-kelley",
            "name": "Cole Kelley Scholarship",
            "source_url": JAXCF_APPLY,
            "amount_min": 4000, "amount_max": 4000,
            "deadline": CF_DEADLINE,
            "description": "One-time $4,000 award for a graduating senior at Ponte Vedra High School who has shown leadership in school and community.",
            "eligibility_text": "Graduating senior at Ponte Vedra High School (St. Johns County, FL); minimum 3.0 weighted GPA; demonstrated leadership in school or community; commitment to a Christian-based life. Covers tuition, books, room and board, and college expenses.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "ponte-vedra-hs", "leadership"],
        },
        {
            "external_id": "neflocal-talen-birt",
            "name": "Talen Charles Birt Memorial Scholarship",
            "source_url": JAXCF_APPLY,
            "amount_min": None, "amount_max": 2000,
            "deadline": CF_DEADLINE,
            "description": "Up to $2,000 for a graduating senior from one of four Duval County high schools, demonstrating academic commitment, leadership, and financial need.",
            "eligibility_text": "Graduating senior at Andrew Jackson, First Coast, Jean Ribault, or William M. Raines High School (Duval County, FL); demonstrated academic commitment and leadership; able to articulate intended field of study; financial need; pursuing a 2- or 4-year degree. Covers tuition and books.",
            "tags": ["local", "florida-resident", "northeast-florida", "duval-county", "need-based", "leadership"],
        },
        {
            "external_id": "neflocal-james-pickren",
            "name": "James Thomas Pickren Memorial Scholarship",
            "source_url": JAXCF_APPLY,
            "amount_min": 3070, "amount_max": 3070,
            "deadline": CF_DEADLINE_LATE,
            "description": "One-time $3,070 award for a student-athlete graduating from Stanton College Preparatory School in Duval County.",
            "eligibility_text": "Graduating senior at Stanton College Preparatory School (Duval County, FL); active school-sanctioned athlete; demonstrated excellence in leadership, academics, and athletics; good sportsmanship and moral integrity. Covers tuition, books, room and board, and college expenses.",
            "tags": ["local", "florida-resident", "northeast-florida", "duval-county", "athletics", "leadership"],
        },
        {
            "external_id": "neflocal-leslie-baker",
            "name": "Leslie Baker Memorial Scholarship",
            "source_url": JAXCF_APPLY,
            "amount_min": 2250, "amount_max": 2250,
            "deadline": CF_DEADLINE,
            "description": "One-time $2,250 award for a cross-country runner graduating from Sandalwood High School in Duval County.",
            "eligibility_text": "Graduating senior at Sandalwood High School (Duval County, FL); lettered in cross country and participated for the last two years; minimum 3.0 unweighted GPA. Covers tuition, books, and college expenses.",
            "tags": ["local", "florida-resident", "northeast-florida", "duval-county", "athletics"],
        },
        {
            "external_id": "neflocal-dorothea-shaw",
            "name": "Dorothea B. Shaw Scholarship",
            "source_url": JAXCF_APPLY,
            "amount_min": 2000, "amount_max": 8000,
            "deadline": CF_DEADLINE,
            "description": "Renewable award of $2,000/year for up to four years ($8,000 total) for a Duval County graduate attending an accredited school in the northeastern United States.",
            "eligibility_text": "Graduating senior from a Duval County (FL) public or private high school; planning to attend an accredited post-secondary institution in the northeastern United States. Renewable up to four years.",
            "tags": ["local", "florida-resident", "northeast-florida", "duval-county", "renewable"],
        },
        {
            "external_id": "neflocal-bernie-yvon",
            "name": "Bernie G. Yvon Memorial Scholarship",
            "source_url": JAXCF_HOME,
            "amount_min": None, "amount_max": 2000,
            "deadline": CF_DEADLINE,
            "description": "Need-based award up to $2,000 for a Northeast Florida student pursuing theatre or the performing arts.",
            "eligibility_text": "High school senior or college student in Northeast Florida pursuing theatre or performing arts; minimum 2.8 unweighted GPA; demonstrated financial need.",
            "tags": ["local", "florida-resident", "northeast-florida", "arts", "need-based"],
        },
        # ===== INK! / Investing in Kids — St. Johns County =====
        {
            "external_id": "neflocal-jack-wheeler",
            "name": "Jack Hamilton Wheeler Memorial Scholarship",
            "source_url": INK_APPLY,
            "amount_min": 3000, "amount_max": 6000,
            "deadline": SJC_DEADLINE,
            "description": "Four awards of $6,000, $5,000, $4,000, and $3,000 for graduating seniors at any St. Johns County public high school. Apply through the single INK! application.",
            "eligibility_text": "Graduating senior at any St. Johns County (FL) public high school — including Ponte Vedra, Nease, Creekside, Bartram Trail, St. Augustine, Tocoi Creek, Pedro Menendez, and others; planning to enroll in college or vocational school in fall. One INK! application covers all St. Johns County scholarships.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "merit"],
        },
        {
            "external_id": "neflocal-debernardis-arts",
            "name": "Marc Nathan DeBernardis Arts Scholarship",
            "source_url": INK_APPLY,
            "amount_min": 3000, "amount_max": 3000,
            "deadline": SJC_DEADLINE,
            "description": "$3,000 award for a graduating senior pursuing the fine arts from one of three St. Johns County high schools.",
            "eligibility_text": "Graduating senior at Nease, St. Augustine, or Ponte Vedra High School (St. Johns County, FL); pursuing a Fine Arts major. Apply through the single INK! application.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "arts"],
        },
        {
            "external_id": "neflocal-macdonald-education",
            "name": "MacDonald Family Education Scholarship",
            "source_url": INK_APPLY,
            "amount_min": 1000, "amount_max": 1000,
            "deadline": SJC_DEADLINE,
            "description": "$1,000 award for a future teacher graduating from Bartram Trail or a St. Johns County teaching academy.",
            "eligibility_text": "Graduating senior at Bartram Trail High School, or in the teaching academies at Creekside, Ponte Vedra, Tocoi Creek, or St. Augustine High Schools (St. Johns County, FL); planning to pursue a post-secondary degree in Education to become a teacher. Apply through the single INK! application.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "education-major"],
        },
        {
            "external_id": "neflocal-david-toner",
            "name": "David Toner Scholarship",
            "source_url": INK_APPLY,
            "amount_min": 1000, "amount_max": 1000,
            "deadline": SJC_DEADLINE,
            "description": "$1,000 award for a St. Johns County senior who is bound for Florida State University.",
            "eligibility_text": "Graduating senior at a St. Johns County (FL) high school; planning to enroll at Florida State University. Apply through the single INK! application.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county"],
        },
        {
            "external_id": "neflocal-sally-macdonald-jrotc",
            "name": "Lieutenant Colonel Sally MacDonald Memorial Scholarship",
            "source_url": INK_APPLY,
            "amount_min": 1000, "amount_max": 1000,
            "deadline": SJC_DEADLINE,
            "description": "$1,000 award for a JROTC member from St. Johns County planning to enter military service.",
            "eligibility_text": "Graduating senior at a St. Johns County (FL) high school; active JROTC member; planning to enter military service. Apply through the single INK! application.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "military", "rotc"],
        },
        {
            "external_id": "neflocal-sjc-jumpstart",
            "name": "St. Johns County Jumpstart Scholarship",
            "source_url": INK_APPLY,
            "amount_min": None, "amount_max": 3300,
            "deadline": SJC_DEADLINE,
            "description": "Need-based award covering roughly one year of tuition for a St. Johns County senior enrolling at a Florida state college.",
            "eligibility_text": "Graduating senior at a St. Johns County (FL) high school; demonstrated financial need; planning to enroll at a Florida state/community college. Apply through the single INK! application.",
            "tags": ["local", "florida-resident", "northeast-florida", "st-johns-county", "need-based"],
        },
    ]

    out: list[ScholarshipItem] = []
    for r in rows:
        out.append(
            ScholarshipItem(
                external_id=r["external_id"],
                source="northeast_florida_local",
                source_url=r["source_url"],
                name=r["name"],
                description=r.get("description"),
                amount_min=r.get("amount_min"),
                amount_max=r.get("amount_max"),
                deadline=r.get("deadline"),
                eligibility_text=r.get("eligibility_text"),
                scope="local",
                college_slug=None,
                tags=r.get("tags", []),
            )
        )
    return out


class NortheastFloridaLocal(Source):
    name = "northeast_florida_local"
    base_url = JAXCF_HOME

    def fetch(self, client: httpx.Client) -> Iterable[ScholarshipItem]:
        yield from _items()
