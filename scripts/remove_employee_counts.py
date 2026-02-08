#!/usr/bin/env python3
"""
Remove employee counts from CITY_PROFILES.json
Removes all "employees" fields from tech companies
"""

import json
from pathlib import Path

def remove_employee_counts(data):
    """Recursively remove 'employees' fields from company entries"""
    if isinstance(data, dict):
        # Remove employees field if present
        if "employees" in data:
            del data["employees"]
        # Recursively process all values
        for value in data.values():
            remove_employee_counts(value)
    elif isinstance(data, list):
        # Recursively process list items
        for item in data:
            remove_employee_counts(item)
    return data

def main():
    # Load CITY_PROFILES.json
    profiles_path = Path(__file__).parent.parent / "public" / "data" / "normalized" / "CITY_PROFILES.json"
    
    print(f"Loading {profiles_path}...")
    with open(profiles_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Count employees fields before removal
    original_json = json.dumps(data)
    employee_count = original_json.count('"employees":')
    print(f"Found {employee_count} employee fields to remove")
    
    # Remove employee counts
    data = remove_employee_counts(data)
    
    # Verify removal
    cleaned_json = json.dumps(data)
    remaining_count = cleaned_json.count('"employees":')
    print(f"Removed {employee_count - remaining_count} employee fields")
    print(f"Remaining: {remaining_count}")
    
    # Write back
    print(f"Writing cleaned data to {profiles_path}...")
    with open(profiles_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("✓ Employee counts removed successfully")

if __name__ == "__main__":
    main()
