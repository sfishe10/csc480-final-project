"""
Download one image per dog breed into web-app/public/one_per_breed/{Breed}/.
Uses Bing Image Search (Google parser often breaks when Google changes their HTML).
Uses the same breed list as the ontology (Google Sheet). Run from project root.
"""
import os
import sys

import pandas as pd
from icrawler.builtin import BingImageCrawler

# Same data source as db_to_ontology
SHEET_ID = "1nZUKlY0F9DvsKG5au21Lsp2FMojRoVOW9luWJQkrdHM"
GID = "756887908"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"

# Output under web-app/public so Vite serves them at /one_per_breed/...
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(SCRIPT_DIR, "web-app", "public", "one_per_breed")


def get_breeds():
    df = pd.read_csv(CSV_URL)
    df.columns = [str(c).strip() for c in df.columns]
    if "breed" not in df.columns:
        raise SystemExit("CSV has no 'breed' column")
    return sorted(df["breed"].unique().tolist())


def main():
    breeds = get_breeds()
    print(f"Found {len(breeds)} breeds. Saving one image per breed under {ROOT_DIR}")
    os.makedirs(ROOT_DIR, exist_ok=True)
    for i, breed in enumerate(breeds, 1):
        breed_dir = os.path.join(ROOT_DIR, breed)
        os.makedirs(breed_dir, exist_ok=True)
        try:
            crawler = BingImageCrawler(storage={"root_dir": breed_dir})
            crawler.crawl(
                keyword=f"{breed} dog",
                max_num=1,
                downloader_kwargs={"timeout": 15},
            )
            print(f"[{i}/{len(breeds)}] {breed}")
        except Exception as e:
            print(f"[{i}/{len(breeds)}] {breed} FAILED: {e}", file=sys.stderr)
    print("Done.")


if __name__ == "__main__":
    main()
