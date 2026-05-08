"""One-off seed script to expand the colleges table with all major Florida schools.

Idempotent — uses upsert on slug. Safe to run multiple times.

Usage:
    cd scraper && ./.venv/bin/python seed_colleges.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Make sure src is on the path even when run directly.
sys.path.insert(0, str(Path(__file__).parent / "src"))

from dotenv import load_dotenv
from supabase import create_client


COLLEGES: list[dict] = [
    # State University System (SUS) — public 4-year ============================
    {"slug": "university-of-central-florida",     "name": "University of Central Florida",     "city": "Orlando",        "state": "FL", "website": "https://www.ucf.edu",     "type": "public-4yr"},
    {"slug": "university-of-south-florida",       "name": "University of South Florida",       "city": "Tampa",          "state": "FL", "website": "https://www.usf.edu",     "type": "public-4yr"},
    {"slug": "florida-international-university",  "name": "Florida International University",  "city": "Miami",          "state": "FL", "website": "https://www.fiu.edu",     "type": "public-4yr"},
    {"slug": "florida-atlantic-university",       "name": "Florida Atlantic University",       "city": "Boca Raton",     "state": "FL", "website": "https://www.fau.edu",     "type": "public-4yr"},
    {"slug": "university-of-west-florida",        "name": "University of West Florida",        "city": "Pensacola",      "state": "FL", "website": "https://uwf.edu",         "type": "public-4yr"},
    {"slug": "florida-polytechnic-university",    "name": "Florida Polytechnic University",    "city": "Lakeland",       "state": "FL", "website": "https://floridapoly.edu", "type": "public-4yr"},
    {"slug": "new-college-of-florida",            "name": "New College of Florida",            "city": "Sarasota",       "state": "FL", "website": "https://www.ncf.edu",     "type": "public-4yr"},
    {"slug": "florida-am-university",             "name": "Florida A&M University",            "city": "Tallahassee",    "state": "FL", "website": "https://www.famu.edu",    "type": "public-4yr"},
    {"slug": "florida-gulf-coast-university",     "name": "Florida Gulf Coast University",     "city": "Fort Myers",     "state": "FL", "website": "https://www.fgcu.edu",    "type": "public-4yr"},

    # Private 4-year ===========================================================
    {"slug": "university-of-miami",               "name": "University of Miami",               "city": "Coral Gables",   "state": "FL", "website": "https://welcome.miami.edu",       "type": "private-4yr"},
    {"slug": "stetson-university",                "name": "Stetson University",                "city": "DeLand",         "state": "FL", "website": "https://www.stetson.edu",         "type": "private-4yr"},
    {"slug": "rollins-college",                   "name": "Rollins College",                   "city": "Winter Park",    "state": "FL", "website": "https://www.rollins.edu",         "type": "private-4yr"},
    {"slug": "embry-riddle-aeronautical",         "name": "Embry-Riddle Aeronautical University", "city": "Daytona Beach", "state": "FL", "website": "https://erau.edu",            "type": "private-4yr"},
    {"slug": "florida-institute-of-technology",   "name": "Florida Institute of Technology",   "city": "Melbourne",      "state": "FL", "website": "https://www.fit.edu",             "type": "private-4yr"},
    {"slug": "eckerd-college",                    "name": "Eckerd College",                    "city": "St. Petersburg", "state": "FL", "website": "https://www.eckerd.edu",          "type": "private-4yr"},
    {"slug": "jacksonville-university",           "name": "Jacksonville University",           "city": "Jacksonville",   "state": "FL", "website": "https://www.ju.edu",              "type": "private-4yr"},
    {"slug": "bethune-cookman-university",        "name": "Bethune-Cookman University",        "city": "Daytona Beach",  "state": "FL", "website": "https://www.cookman.edu",         "type": "private-4yr"},
    {"slug": "edward-waters-university",          "name": "Edward Waters University",          "city": "Jacksonville",   "state": "FL", "website": "https://www.ewu.edu",             "type": "private-4yr"},
    {"slug": "florida-memorial-university",       "name": "Florida Memorial University",       "city": "Miami Gardens",  "state": "FL", "website": "https://www.fmuniv.edu",          "type": "private-4yr"},
    {"slug": "lynn-university",                   "name": "Lynn University",                   "city": "Boca Raton",     "state": "FL", "website": "https://www.lynn.edu",            "type": "private-4yr"},
    {"slug": "saint-leo-university",              "name": "Saint Leo University",              "city": "Saint Leo",      "state": "FL", "website": "https://www.saintleo.edu",        "type": "private-4yr"},
    {"slug": "florida-southern-college",          "name": "Florida Southern College",          "city": "Lakeland",       "state": "FL", "website": "https://www.flsouthern.edu",      "type": "private-4yr"},
    {"slug": "ringling-college-of-art-design",    "name": "Ringling College of Art and Design","city": "Sarasota",       "state": "FL", "website": "https://www.ringling.edu",        "type": "private-4yr"},
    {"slug": "palm-beach-atlantic-university",    "name": "Palm Beach Atlantic University",    "city": "West Palm Beach","state": "FL", "website": "https://www.pba.edu",             "type": "private-4yr"},
    {"slug": "nova-southeastern-university",      "name": "Nova Southeastern University",      "city": "Davie",          "state": "FL", "website": "https://www.nova.edu",            "type": "private-4yr"},
    {"slug": "flagler-college",                   "name": "Flagler College",                   "city": "St. Augustine",  "state": "FL", "website": "https://www.flagler.edu",         "type": "private-4yr"},
    {"slug": "barry-university",                  "name": "Barry University",                  "city": "Miami Shores",   "state": "FL", "website": "https://www.barry.edu",           "type": "private-4yr"},

    # Florida College System — community / state colleges ====================
    {"slug": "miami-dade-college",                "name": "Miami Dade College",                "city": "Miami",          "state": "FL", "website": "https://www.mdc.edu",             "type": "community"},
    {"slug": "valencia-college",                  "name": "Valencia College",                  "city": "Orlando",        "state": "FL", "website": "https://valenciacollege.edu",     "type": "community"},
    {"slug": "hillsborough-community-college",    "name": "Hillsborough Community College",    "city": "Tampa",          "state": "FL", "website": "https://www.hccfl.edu",           "type": "community"},
    {"slug": "broward-college",                   "name": "Broward College",                   "city": "Fort Lauderdale","state": "FL", "website": "https://www.broward.edu",         "type": "community"},
    {"slug": "palm-beach-state-college",          "name": "Palm Beach State College",          "city": "Lake Worth",     "state": "FL", "website": "https://www.palmbeachstate.edu",  "type": "community"},
    {"slug": "st-petersburg-college",             "name": "St. Petersburg College",            "city": "St. Petersburg", "state": "FL", "website": "https://www.spcollege.edu",       "type": "community"},
    {"slug": "tallahassee-state-college",         "name": "Tallahassee State College",         "city": "Tallahassee",    "state": "FL", "website": "https://www.tsc.fl.edu",          "type": "community"},
    {"slug": "florida-state-college-jacksonville","name": "Florida State College at Jacksonville", "city": "Jacksonville", "state": "FL", "website": "https://www.fscj.edu",       "type": "community"},
    {"slug": "indian-river-state-college",        "name": "Indian River State College",        "city": "Fort Pierce",    "state": "FL", "website": "https://www.irsc.edu",            "type": "community"},
]


def main() -> int:
    load_dotenv()
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    sb = create_client(url, key)

    # Bulk upsert — Postgres handles the unique(slug) collision.
    sb.table("colleges").upsert(COLLEGES, on_conflict="slug").execute()
    total = sb.table("colleges").select("id", count="exact", head=True).execute()
    print(f"colleges: upserted {len(COLLEGES)}. total in DB: {total.count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
