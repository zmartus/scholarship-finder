"""Stub: University of Florida — Office of Student Financial Affairs.

The real selectors will be wired up in Phase 2 once we inspect sfa.ufl.edu.
This stub returns a hard-coded fixture row so the pipeline (CLI -> normalize -> DB)
can be smoke-tested end-to-end before the parser is finished.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date

import httpx

from scraper.models import ScholarshipItem
from scraper.sources.base import Source


class UFStudentFinancialAffairs(Source):
    name = "uf_sfa"
    base_url = "https://www.sfa.ufl.edu/scholarships/"

    def fetch(self, client: httpx.Client) -> Iterable[ScholarshipItem]:
        yield ScholarshipItem(
            external_id="uf_sfa-machen-florida-opportunity",
            source=self.name,
            source_url=self.base_url,
            name="Machen Florida Opportunity Scholarship",
            description=(
                "Need-based scholarship for first-generation Florida residents "
                "covering full demonstrated financial need at UF."
            ),
            amount_min=None,
            amount_max=None,
            deadline=None,
            eligibility_text=(
                "First-generation Florida resident, Pell-eligible, admitted to UF as a "
                "first-time-in-college student."
            ),
            scope="school",
            college_slug="university-of-florida",
            tags=["first-gen", "need-based", "florida-resident"],
        )
        yield ScholarshipItem(
            external_id="uf_sfa-presidential",
            source=self.name,
            source_url=self.base_url,
            name="UF Presidential Scholarship",
            description="Merit-based award for highly competitive incoming freshmen.",
            amount_min=4000,
            amount_max=10000,
            deadline=date(2026, 11, 1),
            eligibility_text="Top-tier academic record, admitted by the early decision deadline.",
            scope="school",
            college_slug="university-of-florida",
            tags=["merit"],
        )
