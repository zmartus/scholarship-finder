"""One-off helper: bump any scholarship deadline in the past forward by full
years until it's in the future. Used after the Claude extractor because the
LLM reads the year shown on the source page literally (e.g. last cycle's
2024-12-01) instead of inferring the next upcoming cycle.

Usage:
    PYTHONPATH=src ./.venv/bin/python bump_stale_deadlines.py --college florida-state-university
    PYTHONPATH=src ./.venv/bin/python bump_stale_deadlines.py --all
"""

from __future__ import annotations

import argparse
import sys
from datetime import date

from dotenv import load_dotenv

from scraper.db import get_client


def bump_for_college(slug: str | None) -> None:
    sb = get_client()
    today = date.today()

    if slug:
        col = sb.table("colleges").select("id, name").eq("slug", slug).single().execute()
        college_id = col.data["id"]
        label = col.data["name"]
    else:
        college_id = None
        label = "ALL"

    total_bumped = 0
    # Loop until nothing is past — handles multi-year-stale rows (e.g. 2024 dates)
    for _ in range(10):
        q = sb.table("scholarships").select("id, name, deadline").lt("deadline", today.isoformat())
        if college_id:
            q = q.eq("college_id", college_id)
        stale = q.execute()
        if not stale.data:
            break
        for r in stale.data:
            old = date.fromisoformat(r["deadline"])
            new = old.replace(year=old.year + 1)
            sb.table("scholarships").update({"deadline": new.isoformat()}).eq("id", r["id"]).execute()
        total_bumped += len(stale.data)

    print(f"[{label}] bumped {total_bumped} deadline(s) into the future")


def main() -> int:
    load_dotenv(override=True)
    parser = argparse.ArgumentParser()
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--college", help="College slug to fix")
    g.add_argument("--all", action="store_true", help="Fix every college")
    args = parser.parse_args()

    bump_for_college(None if args.all else args.college)
    return 0


if __name__ == "__main__":
    sys.exit(main())
