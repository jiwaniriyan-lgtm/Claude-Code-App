"""Scaffold a new video folder.

Usage:
    python scripts/new_video.py <slug> [--title "Working Title"]

Creates videos/<slug>/{script.md (template), images/, raw/, final/, notes.md}.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"


def slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower())
    s = re.sub(r"[\s_]+", "-", s).strip("-")
    return s[:60] or "untitled"


NOTES_TEMPLATE = """# {title}

> Slug: `{slug}` | Created: {created}

## Pine Script source
- Project: [Hull+RSI | T3 screener | MTF levels | levels+ORB | other]
- File path on local machine: TODO

## Recording checklist
- [ ] Script locked
- [ ] Voiceover generated (`generate_voiceover.py {slug}`)
- [ ] Thumbnails generated (`generate_thumbnails.py {slug} --title "..."`)
- [ ] Screen recordings captured into `raw/`
- [ ] Final cut exported to `final/`
- [ ] Description draft written
- [ ] Tags + timestamps in description

## Notes
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug")
    parser.add_argument("--title", help="Working title (defaults to slug)")
    args = parser.parse_args()

    slug = slugify(args.slug)
    title = args.title or slug.replace("-", " ").title()

    folder = VIDEOS / slug
    if folder.exists():
        sys.exit(f"{folder} already exists.")

    for sub in ("images", "raw", "final"):
        (folder / sub).mkdir(parents=True)

    (folder / "notes.md").write_text(
        NOTES_TEMPLATE.format(title=title, slug=slug, created=date.today().isoformat()),
        encoding="utf-8",
    )

    # Delegate the script template to generate_script.py so there's one source of truth.
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate_script.py"),
         "--slug", slug, title],
        check=True,
    )

    print(f"Scaffolded {folder}")
    print("Next: edit script.md, then run generate_voiceover.py and generate_thumbnails.py")


if __name__ == "__main__":
    main()
