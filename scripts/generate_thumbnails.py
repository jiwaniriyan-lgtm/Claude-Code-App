"""Generate 3 thumbnail variants via Google Gemini 2.5 Flash Image (Nano Banana).

Usage:
    python scripts/generate_thumbnails.py <slug> --title "Hull MA Beats EMA" --style "dark, neon, chart screenshot, big bold text"

Writes videos/<slug>/images/thumb_v1.png, thumb_v2.png, thumb_v3.png.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"

# Three angle templates that vary composition without changing the title.
PROMPT_VARIANTS = [
    "YouTube thumbnail, 1280x720, finance/trading channel. {style}. "
    "Composition: large bold title text '{title}' on the LEFT, "
    "trading chart screenshot on the right with dramatic green/red candles. "
    "High contrast, readable at small sizes. No watermarks.",

    "YouTube thumbnail, 1280x720, finance/trading channel. {style}. "
    "Composition: title '{title}' centered as huge bold text, "
    "subtle chart background behind, single arrow pointing up or down. "
    "Minimalist, professional, not clickbaity. No faces. No watermarks.",

    "YouTube thumbnail, 1280x720, finance/trading channel. {style}. "
    "Composition: split screen - winning equity curve on one side, "
    "title '{title}' on the other side in bold sans-serif, "
    "color accent in red or green. Clean, dataviz aesthetic. No watermarks.",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug", help="Video slug")
    parser.add_argument("--title", required=True, help="Thumbnail title text")
    parser.add_argument("--style", default="dark theme, neon accents, modern fintech",
                        help="Style modifiers (mood, palette, vibe)")
    args = parser.parse_args()

    load_dotenv(ROOT / ".env")
    api_key = os.environ.get("GEMINI_API_KEY")
    model = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
    if not api_key:
        sys.exit("GEMINI_API_KEY not set in .env (get one at https://aistudio.google.com/apikey)")

    folder = VIDEOS / args.slug
    images_dir = folder / "images"
    if not folder.exists():
        sys.exit(f"Video folder {folder} does not exist. Run new_video.py {args.slug} first.")
    images_dir.mkdir(exist_ok=True)

    from google import genai

    client = genai.Client(api_key=api_key)

    for i, template in enumerate(PROMPT_VARIANTS, start=1):
        prompt = template.format(title=args.title, style=args.style)
        print(f"[{i}/3] generating thumb_v{i}.png ...")
        response = client.models.generate_content(model=model, contents=prompt)

        out_path = images_dir / f"thumb_v{i}.png"
        wrote = False
        for part in response.candidates[0].content.parts:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                out_path.write_bytes(inline.data)
                wrote = True
                break
        if wrote:
            print(f"   wrote {out_path}")
        else:
            print(f"   WARNING: no image data in response for variant {i}")


if __name__ == "__main__":
    main()
