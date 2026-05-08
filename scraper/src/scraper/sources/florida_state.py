"""Florida state-funded scholarship and aid programs.

These work at any Florida public college or eligible private institution.
Administered by the Florida Department of Education's Office of Student
Financial Assistance (OSFA). Hand-curated 2026-05-07.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

import httpx

from scraper.models import ScholarshipItem
from scraper.sources.base import Source

# Florida Financial Aid Application (FFAA) deadline for the upcoming
# academic year. Bright Futures awards key off this date.
FFAA_DEADLINE = date(2026, 8, 31)
OSFA_HOME = "https://www.floridastudentfinancialaidsg.org"


def _items() -> list[ScholarshipItem]:
    rows: list[dict] = [
        {
            "external_id": "fl-bf-academic",
            "name": "Florida Bright Futures — Academic Scholars (FAS)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=bright-futures",
            "amount_min": None, "amount_max": None,
            "deadline": FFAA_DEADLINE,
            "description": "Top tier of Bright Futures. Covers 100% of tuition and applicable fees at Florida public colleges/universities, plus a stipend for textbooks. Lottery-funded.",
            "eligibility_text": "Florida high school graduate; standard FL high school diploma; minimum 3.5 weighted GPA; SAT 1330+ or ACT 29+ (composite); 100 community service hours; complete the Florida Financial Aid Application (FFAA) by Aug 31 of graduation year.",
            "tags": ["merit", "florida-resident", "in-state", "lottery-funded", "tuition-coverage"],
        },
        {
            "external_id": "fl-bf-medallion",
            "name": "Florida Bright Futures — Medallion Scholars (FMS)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=bright-futures",
            "amount_min": None, "amount_max": None,
            "deadline": FFAA_DEADLINE,
            "description": "Mid-tier of Bright Futures. Covers 75% of tuition and applicable fees at Florida public institutions. Most common Bright Futures level awarded.",
            "eligibility_text": "Florida high school graduate; standard FL high school diploma; minimum 3.0 weighted GPA; SAT 1210+ or ACT 25+ (composite); 75 community service hours; complete the Florida Financial Aid Application (FFAA) by Aug 31.",
            "tags": ["merit", "florida-resident", "in-state", "lottery-funded", "tuition-coverage"],
        },
        {
            "external_id": "fl-bf-gold-seal-vocational",
            "name": "Florida Bright Futures — Gold Seal Vocational (GSV)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=bright-futures",
            "amount_min": None, "amount_max": None,
            "deadline": FFAA_DEADLINE,
            "description": "Tuition assistance for students pursuing career and technical education at a Florida public postsecondary institution.",
            "eligibility_text": "Florida high school graduate completing a CTE program; minimum 3.0 unweighted GPA in academic core; minimum 3.5 unweighted GPA in vocational courses; required test scores (varies); 30 community service hours; FFAA by Aug 31.",
            "tags": ["vocational", "florida-resident", "in-state", "career-technical"],
        },
        {
            "external_id": "fl-bf-gold-seal-cape",
            "name": "Florida Bright Futures — Gold Seal CAPE Scholars (GSC)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=bright-futures",
            "amount_min": None, "amount_max": None,
            "deadline": FFAA_DEADLINE,
            "description": "Tuition assistance for high school graduates who earned approved Career and Professional Education (CAPE) industry certifications.",
            "eligibility_text": "Florida high school graduate; earned at least 5 postsecondary credit hours via CAPE industry certifications during high school; minimum 3.0 unweighted GPA; 30 community service hours; FFAA by Aug 31.",
            "tags": ["vocational", "florida-resident", "in-state", "industry-cert"],
        },
        {
            "external_id": "fl-fsag-public",
            "name": "Florida Student Assistance Grant — Public (FSAG)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=fsag",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "description": "Need-based grant for Florida residents attending eligible Florida public colleges or universities. Award amounts vary by school and budget.",
            "eligibility_text": "Florida resident; substantial financial need as determined by FAFSA; enrolled at least 6 credit hours at a Florida public postsecondary institution; not in default on prior aid. No separate application — FAFSA determines eligibility.",
            "tags": ["need-based", "florida-resident", "in-state", "fafsa-required"],
        },
        {
            "external_id": "fl-fpsag-private",
            "name": "Florida Postsecondary Student Assistance Grant (FPSAG)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=fsag",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "description": "Need-based grant for Florida residents attending eligible Florida private nonprofit colleges or universities.",
            "eligibility_text": "Florida resident; substantial financial need; enrolled at an eligible Florida private nonprofit institution; FAFSA on file. School determines award based on availability.",
            "tags": ["need-based", "florida-resident", "private-school", "fafsa-required"],
        },
        {
            "external_id": "fl-csddv",
            "name": "Florida Children/Spouses of Deceased or Disabled Veterans/Servicemembers",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=csddv",
            "amount_min": None, "amount_max": None,
            "deadline": date(2027, 4, 1),
            "description": "Tuition and fee waiver at Florida public colleges/universities for dependents of deceased or 100% service-connected disabled Florida veterans.",
            "eligibility_text": "Child or unremarried spouse of a Florida veteran who died from service-connected causes or is 100% service-connected disabled; veteran must have been a Florida resident for 1+ year before service; applicant must be a Florida resident.",
            "tags": ["military", "veteran-family", "florida-resident", "tuition-waiver"],
        },
        {
            "external_id": "fl-public-career-grant",
            "name": "Florida Public Postsecondary Career Education Student Assistance Grant",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=fpsag",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "description": "Need-based grant for Florida residents enrolled in a certificate-level career education program at a Florida public institution (community/state college or technical center).",
            "eligibility_text": "Florida resident; FAFSA showing financial need; enrolled at least 6 credit hours in an eligible career education program at a Florida public institution. School determines award.",
            "tags": ["need-based", "florida-resident", "career-technical", "fafsa-required"],
        },
        {
            "external_id": "fl-mary-mcleod-bethune",
            "name": "Mary McLeod Bethune Scholarship Program",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=mmb",
            "amount_min": None, "amount_max": 4000,
            "deadline": date(2027, 4, 1),
            "description": "Scholarship for Florida residents enrolled at one of three Florida HBCUs: Florida A&M University, Bethune-Cookman University, or Edward Waters University.",
            "eligibility_text": "Florida resident attending Florida A&M University, Bethune-Cookman University, or Edward Waters University; minimum 3.0 GPA; full-time enrollment; FAFSA on file. School determines selection.",
            "tags": ["hbcu", "florida-resident", "in-state"],
        },
        {
            "external_id": "fl-first-gen-matching",
            "name": "Florida First Generation Matching Grant Program (FGMG)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=fgmg",
            "amount_min": None, "amount_max": None,
            "deadline": None,
            "description": "Need-based grant matched by participating Florida public universities for first-generation college students.",
            "eligibility_text": "Florida resident; first-generation college student (neither parent has a bachelor's degree); enrolled at participating Florida public university; substantial financial need (FAFSA); meets institutional academic standards.",
            "tags": ["first-gen", "need-based", "florida-resident", "fafsa-required"],
        },
        {
            "external_id": "fl-benacquisto-state",
            "name": "Florida Benacquisto Scholarship (state-wide)",
            "source_url": f"{OSFA_HOME}/SAPHome/SAPHome?url=benacquisto",
            "amount_min": None, "amount_max": None,
            "deadline": FFAA_DEADLINE,
            "description": "Effectively a full ride at any Florida public university for National Merit Scholars. Covers institutional cost of attendance minus other gift aid.",
            "eligibility_text": "Florida resident or out-of-state student attending a Florida public university; recognized as a National Merit Finalist or National Merit Scholar; standard FL high school diploma; full-time undergraduate enrollment beginning the fall after high school graduation.",
            "tags": ["national-merit", "florida-resident", "merit", "full-ride"],
        },
    ]

    out: list[ScholarshipItem] = []
    for r in rows:
        out.append(
            ScholarshipItem(
                external_id=r["external_id"],
                source="florida_state",
                source_url=r["source_url"],
                name=r["name"],
                description=r.get("description"),
                amount_min=r.get("amount_min"),
                amount_max=r.get("amount_max"),
                deadline=r.get("deadline"),
                eligibility_text=r.get("eligibility_text"),
                scope="state",
                college_slug=None,
                tags=r.get("tags", []),
            )
        )
    return out


class FloridaState(Source):
    name = "florida_state"
    base_url = OSFA_HOME

    def fetch(self, client: httpx.Client) -> Iterable[ScholarshipItem]:
        yield from _items()
