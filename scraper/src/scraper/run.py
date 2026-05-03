"""CLI entrypoint:
    python -m scraper.run --source uf_sfa --dry-run
    python -m scraper.run --all
"""

from __future__ import annotations

import argparse
import json
import sys

from dotenv import load_dotenv

from scraper.sources import REGISTRY, all_sources, get_source


def main() -> int:
    load_dotenv()
    parser = argparse.ArgumentParser(prog="scraper")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--source", help=f"Run one source. Options: {sorted(REGISTRY)}")
    group.add_argument("--all", action="store_true", help="Run every registered source")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print scraped rows as JSON instead of writing to Supabase.",
    )
    args = parser.parse_args()

    sources = all_sources() if args.all else [get_source(args.source)]
    total = 0

    if args.dry_run:
        for src in sources:
            items = src.run()
            for item in items:
                print(json.dumps(item.model_dump(mode="json"), indent=2))
            print(f"# {src.name}: {len(items)} item(s)", file=sys.stderr)
            total += len(items)
        print(f"# total: {total} item(s)", file=sys.stderr)
        return 0

    from scraper.db import get_client, upsert_scholarships

    client = get_client()
    for src in sources:
        items = src.run()
        n = upsert_scholarships(client, items)
        print(f"{src.name}: upserted {n} item(s)", file=sys.stderr)
        total += n
    print(f"total: {total} item(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
