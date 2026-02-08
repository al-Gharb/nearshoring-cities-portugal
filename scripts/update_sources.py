#!/usr/bin/env python3
"""
update_sources.py — Automates source URL propagation from fact-checker JSONL output

Reads the JSONL output from external fact-checkers and automatically inserts
source_urls into the matching meta.source.url fields in the JSON databases.

Usage:
    python scripts/update_sources.py input.jsonl [--dry-run]
    python scripts/update_sources.py --check-expiry

JSONL format expected (one JSON object per line):
{
  "claim_id": "c0001",
  "target_id": "cityDatabase",
  "status": "SUPPORTED",
  "source_urls": ["https://..."],
  "verified_value": "...",
  "notes": "..."
}
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

# Database paths relative to script location
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "public" / "data"
NORMALIZED_DIR = DATA_DIR / "normalized"

DATABASES = {
    "WEBSITE_CONTENT": NORMALIZED_DIR / "WEBSITE_CONTENT.json",
    "CITY_PROFILES": NORMALIZED_DIR / "CITY_PROFILES.json",
    "COMPENSATION_DATA": NORMALIZED_DIR / "COMPENSATION_DATA.json",
    "MASTER": NORMALIZED_DIR / "MASTER.json",
}

SOURCES_REGISTRY = DATA_DIR / "sources.json"

# Claim ID to JSON path mapping
# This maps claim_ids from the fact-checker output to JSON paths in the databases
CLAIM_PATH_MAP = {
    # WEBSITE_CONTENT.json paths
    "c0100": ("WEBSITE_CONTENT", "national.macroeconomicScorecard.economicActivity.realGdpGrowth"),
    "c0101": ("WEBSITE_CONTENT", "national.macroeconomicScorecard.labourAndCosts.unemploymentRate"),
    "c0102": ("WEBSITE_CONTENT", "national.macroeconomicScorecard.fiscalPricesMarkets.hicpInflation"),
    "c0200": ("WEBSITE_CONTENT", "national.digitalInfrastructure.ftthPenetration"),
    "c0201": ("WEBSITE_CONTENT", "national.digitalInfrastructure.ftthPenetration.lisbonMetroCoverage"),
    "c0202": ("WEBSITE_CONTENT", "national.digitalInfrastructure.fiveGCoverage"),
    "c0203": ("WEBSITE_CONTENT", "national.digitalInfrastructure.subseaCables"),
    "c0204": ("WEBSITE_CONTENT", "national.digitalInfrastructure.subseaCables.cables[EllaLink]"),
    "c0205": ("WEBSITE_CONTENT", "national.digitalInfrastructure.subseaCables.cables[2Africa]"),
    "c0206": ("WEBSITE_CONTENT", "national.digitalInfrastructure.dataCenters.microsoft"),
    "c0210": ("WEBSITE_CONTENT", "national.digitalInfrastructure.fixedBroadband.euRanking"),
    
    # City graduate claims (MASTER.json)
    "c0001": ("MASTER", "cities.lisbon.stemGraduates"),
    "c0002": ("MASTER", "cities.porto.stemGraduates"),
    "c0003": ("MASTER", "cities.braga.stemGraduates"),
    "c0004": ("MASTER", "cities.guimaraes.stemGraduates"),
    "c0005": ("MASTER", "cities.coimbra.stemGraduates"),
    "c0006": ("MASTER", "cities.aveiro.stemGraduates"),
    "c0007": ("MASTER", "cities.covilha.stemGraduates"),
    "c0008": ("MASTER", "cities.evora.stemGraduates"),
    "c0009": ("MASTER", "cities.faro.stemGraduates"),
    "c0010": ("MASTER", "cities.setubal.stemGraduates"),
    
    # Startup valuations (CITY_PROFILES.json)
    "c0400": ("CITY_PROFILES", "cities.lisbon.ecosystem.techCompanies[Talkdesk]"),
    "c0401": ("CITY_PROFILES", "cities.lisbon.ecosystem.techCompanies[OutSystems]"),
    "c0402": ("CITY_PROFILES", "cities.lisbon.ecosystem.techCompanies[Remote]"),
    "c0403": ("CITY_PROFILES", "cities.lisbon.ecosystem.techCompanies[Sword Health]"),
    
    # Workforce statistics (WEBSITE_CONTENT.json)
    "c0500": ("WEBSITE_CONTENT", "national.workforceStatistics.techWorkforceTotal"),
    "c0501": ("WEBSITE_CONTENT", "national.workforceStatistics.techWorkforceTotal.official"),
    "c0502": ("WEBSITE_CONTENT", "national.workforceStatistics.ictEmployment"),
    "c0503": ("WEBSITE_CONTENT", "national.hiringInsights.ageDistribution.medianAge"),
    "c0504": ("WEBSITE_CONTENT", "national.hiringInsights.educationLevel.bachelorsOrHigher"),
    "c0505": ("WEBSITE_CONTENT", "national.hiringInsights.timeToHire"),
    "c0506": ("WEBSITE_CONTENT", "national.hiringInsights.retention.tenure"),
}


def parse_expiry(expiry_str: str) -> Optional[timedelta]:
    """Parse expiry string like '6M', '12M', '3M' into timedelta"""
    if not expiry_str:
        return None
    
    if expiry_str.endswith("M"):
        months = int(expiry_str[:-1])
        return timedelta(days=months * 30)
    elif expiry_str.endswith("Y"):
        years = int(expiry_str[:-1])
        return timedelta(days=years * 365)
    elif expiry_str.endswith("D"):
        days = int(expiry_str[:-1])
        return timedelta(days=days)
    
    return None


def check_expiry():
    """Check all sources for expiry and report stale claims"""
    if not SOURCES_REGISTRY.exists():
        print(f"ERROR: Sources registry not found at {SOURCES_REGISTRY}")
        return 1
    
    with open(SOURCES_REGISTRY, "r", encoding="utf-8") as f:
        registry = json.load(f)
    
    today = datetime.now()
    stale = []
    expiring_soon = []  # Within 30 days
    
    for source_id, source in registry.get("sources", {}).items():
        published_str = source.get("publishedDate")
        expires_after = source.get("expiresAfter")
        
        if not published_str or not expires_after:
            continue
        
        try:
            published = datetime.strptime(published_str, "%Y-%m-%d")
        except ValueError:
            continue
        
        expiry_delta = parse_expiry(expires_after)
        if not expiry_delta:
            continue
        
        expiry_date = published + expiry_delta
        days_until_expiry = (expiry_date - today).days
        
        if days_until_expiry < 0:
            stale.append({
                "source_id": source_id,
                "provider": source.get("provider"),
                "expired_days_ago": abs(days_until_expiry),
                "covers": source.get("covers", [])
            })
        elif days_until_expiry <= 30:
            expiring_soon.append({
                "source_id": source_id,
                "provider": source.get("provider"),
                "expires_in_days": days_until_expiry,
                "covers": source.get("covers", [])
            })
    
    print("\n" + "=" * 60)
    print("SOURCE EXPIRY CHECK")
    print("=" * 60)
    
    if stale:
        print(f"\n🔴 STALE SOURCES ({len(stale)}):")
        for s in stale:
            print(f"  • {s['source_id']} ({s['provider']}) — expired {s['expired_days_ago']} days ago")
            print(f"    Affects: {', '.join(s['covers'])}")
    else:
        print("\n✅ No stale sources found")
    
    if expiring_soon:
        print(f"\n🟡 EXPIRING SOON ({len(expiring_soon)}):")
        for s in expiring_soon:
            print(f"  • {s['source_id']} ({s['provider']}) — expires in {s['expires_in_days']} days")
            print(f"    Affects: {', '.join(s['covers'])}")
    else:
        print("\n✅ No sources expiring within 30 days")
    
    print("\n" + "=" * 60)
    
    return 1 if stale else 0


def load_database(db_name: str) -> dict:
    """Load a database JSON file"""
    path = DATABASES.get(db_name)
    if not path or not path.exists():
        print(f"WARNING: Database {db_name} not found at {path}")
        return {}
    
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_database(db_name: str, data: dict):
    """Save a database JSON file"""
    path = DATABASES.get(db_name)
    if not path:
        print(f"ERROR: Unknown database {db_name}")
        return
    
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved {db_name}")


def get_nested(data: dict, path: str):
    """Get nested value from dict using dot notation, supports array index [name]"""
    parts = path.split(".")
    current = data
    
    for part in parts:
        if "[" in part and "]" in part:
            # Handle array lookup by name, e.g., "cables[EllaLink]"
            key = part[:part.index("[")]
            name = part[part.index("[") + 1:part.index("]")]
            
            if key in current:
                current = current[key]
                if isinstance(current, list):
                    for item in current:
                        if item.get("name") == name:
                            current = item
                            break
                    else:
                        return None
                else:
                    return None
            else:
                return None
        elif part in current:
            current = current[part]
        else:
            return None
    
    return current


def set_nested_meta(data: dict, path: str, url: str, verified_date: str):
    """Set meta.source.url and meta.verifiedDate at the given path"""
    parts = path.split(".")
    current = data
    
    # Navigate to parent
    for i, part in enumerate(parts[:-1]):
        if "[" in part and "]" in part:
            key = part[:part.index("[")]
            name = part[part.index("[") + 1:part.index("]")]
            
            if key in current:
                current = current[key]
                if isinstance(current, list):
                    for item in current:
                        if item.get("name") == name:
                            current = item
                            break
        elif part in current:
            current = current[part]
        else:
            return False
    
    # Get the final key
    final_key = parts[-1]
    if "[" in final_key and "]" in final_key:
        key = final_key[:final_key.index("[")]
        name = final_key[final_key.index("[") + 1:final_key.index("]")]
        if key in current and isinstance(current[key], list):
            for item in current[key]:
                if item.get("name") == name:
                    current = item
                    break
    elif final_key in current:
        current = current[final_key]
    else:
        return False
    
    # Now update meta
    if "meta" not in current:
        current["meta"] = {}
    if "source" not in current["meta"]:
        current["meta"]["source"] = {}
    
    current["meta"]["source"]["url"] = url
    current["meta"]["verifiedDate"] = verified_date
    
    return True


def process_jsonl(input_file: Path, dry_run: bool = False):
    """Process JSONL file and update databases"""
    if not input_file.exists():
        print(f"ERROR: Input file not found: {input_file}")
        return 1
    
    # Load all databases
    databases = {}
    for db_name in DATABASES:
        databases[db_name] = load_database(db_name)
    
    # Track changes
    changes = []
    skipped = []
    
    with open(input_file, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            
            try:
                claim = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"WARNING: Invalid JSON on line {line_num}: {e}")
                continue
            
            claim_id = claim.get("claim_id", "")
            status = claim.get("status", "")
            source_urls = claim.get("source_urls", [])
            
            # Only process supported claims with URLs
            if status not in ("SUPPORTED", "PARTIALLY_SUPPORTED"):
                skipped.append(f"{claim_id}: status={status}")
                continue
            
            if not source_urls:
                skipped.append(f"{claim_id}: no source_urls")
                continue
            
            # Find path mapping
            if claim_id not in CLAIM_PATH_MAP:
                skipped.append(f"{claim_id}: no path mapping")
                continue
            
            db_name, path = CLAIM_PATH_MAP[claim_id]
            
            if db_name not in databases or not databases[db_name]:
                skipped.append(f"{claim_id}: database {db_name} not loaded")
                continue
            
            # Get the first URL
            url = source_urls[0]
            verified_date = datetime.now().strftime("%Y-%m-%d")
            
            if dry_run:
                changes.append(f"{claim_id} → {db_name}.{path} = {url}")
            else:
                success = set_nested_meta(databases[db_name], path, url, verified_date)
                if success:
                    changes.append(f"{claim_id} → {db_name}.{path} = {url}")
                else:
                    skipped.append(f"{claim_id}: path {path} not found in {db_name}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("SOURCE URL PROPAGATION")
    print("=" * 60)
    
    if changes:
        print(f"\n✅ UPDATES ({len(changes)}):")
        for change in changes:
            print(f"  • {change}")
    else:
        print("\n⚠️  No updates to apply")
    
    if skipped:
        print(f"\n⏭️  SKIPPED ({len(skipped)}):")
        for skip in skipped[:10]:  # Limit output
            print(f"  • {skip}")
        if len(skipped) > 10:
            print(f"  ... and {len(skipped) - 10} more")
    
    if dry_run:
        print("\n🔍 DRY RUN — no changes written")
    else:
        # Save updated databases
        for db_name, data in databases.items():
            if data:
                save_database(db_name, data)
    
    print("\n" + "=" * 60)
    
    return 0


def main():
    parser = argparse.ArgumentParser(
        description="Automate source URL propagation from fact-checker JSONL output"
    )
    parser.add_argument(
        "input_file",
        nargs="?",
        type=Path,
        help="JSONL file with fact-checker output"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing to files"
    )
    parser.add_argument(
        "--check-expiry",
        action="store_true",
        help="Check all sources for expiry and report stale claims"
    )
    
    args = parser.parse_args()
    
    if args.check_expiry:
        return check_expiry()
    
    if not args.input_file:
        parser.print_help()
        print("\nExamples:")
        print("  python scripts/update_sources.py factcheck_output.jsonl")
        print("  python scripts/update_sources.py factcheck_output.jsonl --dry-run")
        print("  python scripts/update_sources.py --check-expiry")
        return 1
    
    return process_jsonl(args.input_file, args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
