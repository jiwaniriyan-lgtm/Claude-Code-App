#!/usr/bin/env python3
"""Generate an ElevenLabs voiceover from a plain-text narration file.

Usage:
    python scripts/generate_voiceover.py <input.txt> <output.mp3>

Required env vars (loaded from .env in the repo root):
    ELEVENLABS_API_KEY
    ELEVENLABS_VOICE_ID

Optional env vars:
    ELEVENLABS_MODEL_ID   (default: eleven_multilingual_v2)
"""

import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv


def main() -> int:
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} <input.txt> <output.mp3>", file=sys.stderr)
        return 2

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    if not input_path.is_file():
        print(f"error: input file not found: {input_path}", file=sys.stderr)
        return 1

    load_dotenv()
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID")
    model_id = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")

    if not api_key:
        print("error: ELEVENLABS_API_KEY not set in environment / .env", file=sys.stderr)
        return 1
    if not voice_id:
        print("error: ELEVENLABS_VOICE_ID not set in environment / .env", file=sys.stderr)
        return 1

    text = input_path.read_text(encoding="utf-8").strip()
    if not text:
        print(f"error: input file is empty: {input_path}", file=sys.stderr)
        return 1

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "accept": "audio/mpeg",
        "content-type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    print(f"[voiceover] {len(text)} chars -> {output_path} (voice={voice_id}, model={model_id})")
    response = requests.post(url, headers=headers, json=payload, timeout=300)
    if response.status_code != 200:
        print(f"error: ElevenLabs API returned {response.status_code}: {response.text[:500]}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(response.content)
    print(f"[voiceover] wrote {len(response.content):,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
