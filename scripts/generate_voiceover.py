"""Generate ElevenLabs voiceover from a video's script.md.

Usage:
    python scripts/generate_voiceover.py <video-slug>
    python scripts/generate_voiceover.py hull-rsi-backtest

Reads videos/<slug>/script.md, strips markdown/b-roll/timestamp annotations,
calls ElevenLabs, writes videos/<slug>/voiceover.mp3 (gitignored).
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"


def script_to_speech_text(md: str) -> str:
    """Strip everything that shouldn't be spoken: headers, b-roll cues, blockquotes,
    timestamp lines, html comments, list bullets, and bracketed stage directions."""
    out_lines = []
    for line in md.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("#"):
            continue
        if s.startswith(">"):
            continue
        if s.startswith("---"):
            continue
        if s.startswith("<!--") or s.startswith("-->"):
            continue
        if re.match(r"^\[.*\]$", s):  # whole line is a [B-ROLL: ...] cue
            continue
        if s.startswith("- ") or s.startswith("* "):
            continue
        # strip inline [B-ROLL: ...] / [stage direction]
        s = re.sub(r"\[[^\]]*\]", "", s)
        # strip leading timestamps like "0:00 -" or "1:23"
        s = re.sub(r"^\d+:\d+\s*-?\s*", "", s)
        # strip markdown emphasis
        s = re.sub(r"[*_`]+", "", s)
        s = s.strip()
        if s:
            out_lines.append(s)
    return "\n\n".join(out_lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug", help="Video slug (folder name under videos/)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print the cleaned text instead of calling ElevenLabs")
    args = parser.parse_args()

    load_dotenv(ROOT / ".env")

    folder = VIDEOS / args.slug
    script_path = folder / "script.md"
    if not script_path.exists():
        sys.exit(f"No script at {script_path}. Run generate_script.py first.")

    speech = script_to_speech_text(script_path.read_text(encoding="utf-8"))

    if args.dry_run:
        print(speech)
        return

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID")
    model = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    if not api_key:
        sys.exit("ELEVENLABS_API_KEY not set in .env")
    if not voice_id:
        sys.exit("ELEVENLABS_VOICE_ID not set in .env (paste your voice ID)")

    from elevenlabs.client import ElevenLabs

    client = ElevenLabs(api_key=api_key)
    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        model_id=model,
        text=speech,
        output_format="mp3_44100_128",
    )

    out_path = folder / "voiceover.mp3"
    with open(out_path, "wb") as f:
        for chunk in audio:
            if chunk:
                f.write(chunk)
    chars = len(speech)
    print(f"Wrote {out_path} ({chars} characters spoken)")


if __name__ == "__main__":
    main()
