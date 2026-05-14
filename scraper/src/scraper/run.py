"""CLI entrypoint for the scraper.

Hand-curated sources (existing):
    python -m scraper.run --source uf_sfa --dry-run
    python -m scraper.run --all

Claude-powered college extractor (new):
    python -m scraper.run extract --college florida-state-university --dry-run
    python -m scraper.run extract --college florida-state-university
    python -m scraper.run extract --all-tier1
"""

from __future__ import annotations

import argparse
import json
import sys

from dotenv import load_dotenv

from scraper.sources import REGISTRY, all_sources, get_source


def cmd_legacy(args: argparse.Namespace) -> int:
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


def cmd_extract(args: argparse.Namespace) -> int:
    """Claude-powered extraction subcommand."""
    from scraper.extract_college import (
        COLLEGE_URLS,
        extract_one,
        tier1_slugs,
    )

    if args.all_tier1:
        slugs = tier1_slugs()
    elif args.college:
        if args.college not in COLLEGE_URLS:
            print(
                f"Unknown college '{args.college}'. Available:\n  - "
                + "\n  - ".join(sorted(COLLEGE_URLS)),
                file=sys.stderr,
            )
            return 2
        slugs = [args.college]
    else:
        print("Provide --college <slug> or --all-tier1", file=sys.stderr)
        return 2

    total = 0
    all_items = []
    for slug in slugs:
        try:
            items = extract_one(slug)
        except Exception as exc:
            print(f"[{slug}] FAILED: {exc}", file=sys.stderr)
            continue
        print(f"[{slug}] {len(items)} scholarship(s) extracted", file=sys.stderr)
        total += len(items)
        all_items.extend(items)

    if args.dry_run:
        for item in all_items:
            print(json.dumps(item.model_dump(mode="json"), indent=2))
        print(f"# total: {total} item(s) (dry-run, NOT written)", file=sys.stderr)
        return 0

    if not all_items:
        print("nothing to upsert", file=sys.stderr)
        return 0

    from scraper.db import get_client, upsert_scholarships

    client = get_client()
    n = upsert_scholarships(client, all_items)
    print(f"upserted {n} item(s) across {len(slugs)} college(s)", file=sys.stderr)
    return 0


def main() -> int:
    # override=True so .env wins over an empty shell var inherited from parent
    load_dotenv(override=True)
    parser = argparse.ArgumentParser(prog="scraper")
    subparsers = parser.add_subparsers(dest="cmd")

    # --- legacy hand-curated source runner (default if no subcmd) ---
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--source", help=f"Run one hand-curated source. Options: {sorted(REGISTRY)}")
    group.add_argument("--all", action="store_true", help="Run every registered hand-curated source")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print scraped rows as JSON instead of writing to Supabase.",
    )

    # --- new: extract subcommand ---
    extract_p = subparsers.add_parser(
        "extract",
        help="Claude-powered scholarship extraction from a college's financial-aid page.",
    )
    extract_p.add_argument(
        "--college",
        help="College slug (must match colleges.slug in Supabase). See extract_college.COLLEGE_URLS.",
    )
    extract_p.add_argument(
        "--all-tier1",
        action="store_true",
        help="Run every Tier 1 college in COLLEGE_URLS.",
    )
    extract_p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print extracted rows as JSON instead of writing to Supabase.",
    )

    args = parser.parse_args()

    if args.cmd == "extract":
        return cmd_extract(args)

    # Legacy path requires --source or --all
    if not (args.source or args.all):
        parser.print_help()
        return 2

    return cmd_legacy(args)


if __name__ == "__main__":
    raise SystemExit(main())
