#!/usr/bin/env python3
"""
generate_assets.py
==================
Generates IMG-1..IMG-40 (PNG) and Voice-1..Voice-40 (MP3) for the Cintas video.

USAGE:
    1) Edit the CONFIG section below (or set env vars):
         - GOOGLE_API_KEY         (Imagen / Gemini)
         - ELEVENLABS_API_KEY
         - ELEVENLABS_VOICE_ID    (default: "JBFqnCBsd6RMkjVDRZzb" = "George" male; pick any)
    2) pip install -r requirements.txt
    3) python generate_assets.py

OUTPUTS:
    /Users/sheazad/Downloads/Cintas/Images/IMG-1.png ... IMG-40.png
    /Users/sheazad/Downloads/Cintas/Voice/Voice-1.mp3 ... Voice-40.mp3

NOTE ON IMAGES:
    Google Flow (labs.google/fx/tools/flow) is Google's AI VIDEO tool and has no
    open image API. The closest accessible image API is Google's Imagen, served
    through the Gemini API. This script uses Imagen by default. If you have your
    own Flow endpoint, swap it inside `generate_image_via_google()`.
"""

import os
import sys
import time
import base64
import pathlib
import requests
from slides_data import SLIDES, GLOBAL_IMAGE_STYLE

# -----------------------------------------------------------------------------
# CONFIG  ---  edit here OR export as env vars before running
# -----------------------------------------------------------------------------
GOOGLE_API_KEY      = os.environ.get("GOOGLE_API_KEY",      "PASTE_GOOGLE_KEY_HERE")
ELEVENLABS_API_KEY  = os.environ.get("ELEVENLABS_API_KEY",  "PASTE_ELEVENLABS_KEY_HERE")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")  # "George"
ELEVENLABS_MODEL    = "eleven_multilingual_v2"

# Imagen model. Use the latest you have access to.
GOOGLE_IMAGEN_MODEL = "imagen-3.0-generate-002"

OUTPUT_ROOT  = pathlib.Path("/Users/sheazad/Downloads/Cintas")
IMAGES_DIR   = OUTPUT_ROOT / "Images"
VOICE_DIR    = OUTPUT_ROOT / "Voice"

# If True, skip files that already exist (resume mode)
SKIP_EXISTING = True
# -----------------------------------------------------------------------------


def ensure_dirs():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    VOICE_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------------------------------------------------------
# Image generation  --  Google Imagen via Gemini REST API
# -----------------------------------------------------------------------------
def generate_image_via_google(prompt: str, out_path: pathlib.Path) -> None:
    """
    Calls Google Imagen via the Gemini REST API.
    Docs: https://ai.google.dev/gemini-api/docs/imagen
    """
    full_prompt = f"{prompt}. {GLOBAL_IMAGE_STYLE}"

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GOOGLE_IMAGEN_MODEL}:predict?key={GOOGLE_API_KEY}"
    )
    payload = {
        "instances": [{"prompt": full_prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "personGeneration": "ALLOW_ADULT",
        },
    }
    r = requests.post(url, json=payload, timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"Imagen error {r.status_code}: {r.text[:400]}")

    data = r.json()
    try:
        b64 = data["predictions"][0]["bytesBase64Encoded"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Unexpected Imagen response: {data}") from e

    out_path.write_bytes(base64.b64decode(b64))


# -----------------------------------------------------------------------------
# Voice generation  --  ElevenLabs REST API
# -----------------------------------------------------------------------------
def generate_voice_via_elevenlabs(text: str, out_path: pathlib.Path) -> None:
    """
    Calls ElevenLabs text-to-speech REST API.
    Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": ELEVENLABS_MODEL,
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.75,
            "style": 0.25,
            "use_speaker_boost": True,
        },
    }
    r = requests.post(url, headers=headers, json=payload, timeout=180)
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs error {r.status_code}: {r.text[:400]}")
    out_path.write_bytes(r.content)


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
def main():
    ensure_dirs()
    if GOOGLE_API_KEY.startswith("PASTE"):
        sys.exit("ERROR: set GOOGLE_API_KEY (env var or edit the script).")
    if ELEVENLABS_API_KEY.startswith("PASTE"):
        sys.exit("ERROR: set ELEVENLABS_API_KEY (env var or edit the script).")

    total = len(SLIDES)
    for idx, slide in enumerate(SLIDES, start=1):
        img_path   = IMAGES_DIR / f"IMG-{idx}.png"
        voice_path = VOICE_DIR  / f"Voice-{idx}.mp3"

        # Image -----------------------------------------------------------
        if SKIP_EXISTING and img_path.exists() and img_path.stat().st_size > 0:
            print(f"[{idx}/{total}] image  : SKIP  (exists)")
        else:
            print(f"[{idx}/{total}] image  : generating...")
            try:
                generate_image_via_google(slide["image_prompt"], img_path)
                print(f"          saved -> {img_path}")
            except Exception as e:
                print(f"          FAILED: {e}")
            time.sleep(1.0)  # be polite to the API

        # Voice -----------------------------------------------------------
        if SKIP_EXISTING and voice_path.exists() and voice_path.stat().st_size > 0:
            print(f"[{idx}/{total}] voice  : SKIP  (exists)")
        else:
            print(f"[{idx}/{total}] voice  : generating...")
            try:
                generate_voice_via_elevenlabs(slide["voice_script"], voice_path)
                print(f"          saved -> {voice_path}")
            except Exception as e:
                print(f"          FAILED: {e}")
            time.sleep(0.5)

    print("\nAll done.")
    print(f"Images: {IMAGES_DIR}")
    print(f"Voice : {VOICE_DIR}")


if __name__ == "__main__":
    main()
