import os

from supabase import Client, create_client

from scraper.models import ScholarshipItem


def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    service_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, service_key)


def upsert_scholarships(client: Client, items: list[ScholarshipItem]) -> int:
    if not items:
        return 0
    rows = []
    for it in items:
        rows.append(
            {
                "external_id": it.external_id,
                "source": it.source,
                "source_url": str(it.source_url),
                "name": it.name,
                "description": it.description,
                "amount_min": it.amount_min,
                "amount_max": it.amount_max,
                "deadline": it.deadline.isoformat() if it.deadline else None,
                "eligibility_text": it.eligibility_text,
                "scope": it.scope,
                "tags": it.tags,
                "college_slug": it.college_slug,
                "last_scraped": it.last_scraped.isoformat(),
                "active": True,
            }
        )
    client.rpc("upsert_scholarships_by_slug", {"payload": rows}).execute()
    return len(rows)
