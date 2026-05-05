#!/usr/bin/env python3
"""Generate a single image via OpenAI's gpt-image-1 model.

Usage:
    python scripts/generate_images.py --prompt "..." --output path.png [--size 1792x1024] [--style "..."]

Required env vars (loaded from .env in the repo root):
    OPENAI_API_KEY

The optional --style argument is appended to --prompt to keep visual
language consistent across a batch of calls (e.g. "clean modern finance
graphics, dark background, bold typography").
"""

import argparse
import base64
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv


VALID_SIZES = {"1024x1024", "1024x1536", "1536x1024", "1792x1024", "1024x1792"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help="Image prompt")
    parser.add_argument("--output", required=True, help="Output PNG path")
    parser.add_argument("--size", default="1536x1024", help=f"One of {sorted(VALID_SIZES)}")
    parser.add_argument("--style", default="", help="Optional style guidance appended to prompt")
    args = parser.parse_args()

    if args.size not in VALID_SIZES:
        print(f"error: --size must be one of {sorted(VALID_SIZES)}", file=sys.stderr)
        return 2

    load_dotenv()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("error: OPENAI_API_KEY not set in environment / .env", file=sys.stderr)
        return 1

    full_prompt = args.prompt if not args.style else f"{args.prompt}\n\nStyle: {args.style}"
    output_path = Path(args.output)

    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-image-1",
        "prompt": full_prompt,
        "size": args.size,
        "n": 1,
    }

    print(f"[image] {args.size} -> {output_path}")
    response = requests.post(url, headers=headers, json=payload, timeout=300)
    if response.status_code != 200:
        print(f"error: OpenAI API returned {response.status_code}: {response.text[:500]}", file=sys.stderr)
        return 1

    body = response.json()
    try:
        b64 = body["data"][0]["b64_json"]
    except (KeyError, IndexError):
        print(f"error: unexpected response shape: {str(body)[:500]}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(base64.b64decode(b64))
    print(f"[image] wrote {output_path.stat().st_size:,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
