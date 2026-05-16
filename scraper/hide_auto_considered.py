"""Hide scholarships that students get automatically when they apply to college.

Product decision (2026-05-16): Grantaria surfaces scholarships students would
OTHERWISE OVERLOOK. Auto-considered merit awards (e.g. UF Presidential, FSU
Presidential, UCF Pegasus) don't need our help — every applicant already gets
them via the admissions application. Hiding them keeps the catalog honest
and focused.

Heuristic: any scholarship whose tags include 'auto-consideration',
'automatic', or 'admissions-based' is flipped to active=false.

Run this after any scrape (uf_sfa, extract_college, etc.) to re-apply the
rule — upserts re-activate everything by default.

Usage:
    PYTHONPATH=src ./.venv/bin/python hide_auto_considered.py
"""

from __future__ import annotations

import sys

from dotenv import load_dotenv

from scraper.db import get_client

AUTO_TAGS = frozenset({"auto-consideration", "automatic", "admissions-based"})


def main() -> int:
    load_dotenv(override=True)
    sb = get_client()

    # 1) Find every currently-active scholarship tagged as auto-considered.
    r = sb.table("scholarships").select("id, name, tags").eq("active", True).execute()
    to_hide = [
        row["id"]
        for row in r.data
        if any(t in AUTO_TAGS for t in (row.get("tags") or []))
    ]

    if not to_hide:
        print("Nothing to hide — all active scholarships already require separate effort.")
        return 0

    # 2) Bulk update in chunks (Supabase IN-list limits).
    batch_size = 50
    for i in range(0, len(to_hide), batch_size):
        chunk = to_hide[i : i + batch_size]
        sb.table("scholarships").update({"active": False}).in_("id", chunk).execute()

    # 3) Report counts post-update.
    active_after = (
        sb.table("scholarships")
        .select("id", count="exact", head=True)
        .eq("active", True)
        .execute()
    )
    inactive_after = (
        sb.table("scholarships")
        .select("id", count="exact", head=True)
        .eq("active", False)
        .execute()
    )
    print(f"Hid {len(to_hide)} auto-considered scholarship(s).")
    print(f"Active now:   {active_after.count}")
    print(f"Inactive now: {inactive_after.count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
