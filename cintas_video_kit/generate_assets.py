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
import importlib
import requests

# Pick which dataset to use via SLIDES_MODULE env var:
#   export SLIDES_MODULE=slides_data       # Cintas (default)
#   export SLIDES_MODULE=slides_data_nvda  # NVIDIA
_slides_module_name = os.environ.get("SLIDES_MODULE", "slides_data")
_slides_module = importlib.import_module(_slides_module_name)
SLIDES = _slides_module.SLIDES
GLOBAL_IMAGE_STYLE = _slides_module.GLOBAL_IMAGE_STYLE

# -----------------------------------------------------------------------------
# CONFIG  ---  edit here OR export as env vars before running
# -----------------------------------------------------------------------------
# ===== PASTE YOUR FRESH AI STUDIO KEY HERE (or `export GOOGLE_API_KEY=...`) =====
# Get one at: https://aistudio.google.com/apikey
GOOGLE_API_KEY      = os.environ.get("GOOGLE_API_KEY",      "PASTE_GOOGLE_KEY_HERE")
ELEVENLABS_API_KEY  = os.environ.get("ELEVENLABS_API_KEY",  "PASTE_ELEVENLABS_KEY_HERE")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")  # "George"
ELEVENLABS_MODEL    = "eleven_multilingual_v2"

# Google AI Studio "nano-banana" image generation.
# Tries the GA name first, then the preview name. No Imagen fallback.
GOOGLE_IMAGE_MODELS = [
    "gemini-2.5-flash-image",          # GA name
    "gemini-2.5-flash-image-preview",  # preview name (a.k.a. "nano-banana")
]

def _default_output_root() -> pathlib.Path:
    """Pick a sensible default output folder per OS, or honor CINTAS_OUTPUT env var."""
    env = os.environ.get("CINTAS_OUTPUT")
    if env:
        return pathlib.Path(env)
    project_name = "NVIDIA" if "nvda" in _slides_module_name.lower() else "Cintas"
    if sys.platform.startswith("win"):
        return pathlib.Path(rf"C:\Video Project API\{project_name}")
    if sys.platform == "darwin":
        return pathlib.Path.home() / "Downloads" / project_name
    return pathlib.Path.home() / project_name


OUTPUT_ROOT  = _default_output_root()
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
_WORKING_MODEL = {"name": None}  # cached after first success


def _try_gemini_generate_content(model: str, prompt: str) -> bytes:
    """Modern Gemini image generation (gemini-2.x-*-image-*)."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={GOOGLE_API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    r = requests.post(url, json=payload, timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"{model} HTTP {r.status_code}: {r.text[:300]}")
    data = r.json()
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    raise RuntimeError(f"{model} returned no image: {str(data)[:300]}")


def _try_imagen_predict(model: str, prompt: str) -> bytes:
    """Classic Imagen :predict endpoint."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:predict?key={GOOGLE_API_KEY}"
    )
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "personGeneration": "ALLOW_ADULT",
        },
    }
    r = requests.post(url, json=payload, timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"{model} HTTP {r.status_code}: {r.text[:300]}")
    data = r.json()
    try:
        return base64.b64decode(data["predictions"][0]["bytesBase64Encoded"])
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"{model} bad response: {str(data)[:300]}") from e


def generate_image_via_google(prompt: str, out_path: pathlib.Path) -> None:
    """
    Tries each model in GOOGLE_IMAGE_MODELS until one returns an image.
    Caches the first working model for the rest of the run.
    """
    full_prompt = f"{prompt}. {GLOBAL_IMAGE_STYLE}"

    # If we've already found a working model, use it directly
    candidates = [_WORKING_MODEL["name"]] if _WORKING_MODEL["name"] else GOOGLE_IMAGE_MODELS

    last_err = None
    for model in candidates:
        try:
            if model.startswith("gemini"):
                img_bytes = _try_gemini_generate_content(model, full_prompt)
            else:
                img_bytes = _try_imagen_predict(model, full_prompt)
            out_path.write_bytes(img_bytes)
            if _WORKING_MODEL["name"] != model:
                print(f"          (using model: {model})")
                _WORKING_MODEL["name"] = model
            return
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"All image models failed. Last error: {last_err}")


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
