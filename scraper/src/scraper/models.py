from datetime import UTC, date, datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

Scope = Literal["school", "local", "state", "national"]


class ScholarshipItem(BaseModel):
    """Normalized scholarship row, ready to upsert into the `scholarships` table."""

    external_id: str = Field(..., description="Stable ID from the source for upsert.")
    source: str
    source_url: HttpUrl
    name: str
    description: str | None = None
    amount_min: float | None = None
    amount_max: float | None = None
    deadline: date | None = None
    eligibility_text: str | None = None
    scope: Scope
    college_slug: str | None = None
    tags: list[str] = Field(default_factory=list)
    last_scraped: datetime = Field(default_factory=lambda: datetime.now(UTC))
