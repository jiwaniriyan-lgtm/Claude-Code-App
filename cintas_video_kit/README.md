# Cintas YouTube Video Kit

Generates 40 images + 40 voiceovers and stitches them into a single ~16 minute MP4.

Output structure on your Mac:

```
/Users/sheazad/Downloads/Cintas/
├── Images/   IMG-1.png ... IMG-40.png
├── Voice/    Voice-1.mp3 ... Voice-40.mp3
└── Cintas_Stock_Deep_Dive.mp4
```

## 1) One-time setup

```bash
brew install python@3.11 ffmpeg
cd ~/Downloads
# place the cintas_video_kit folder here, then:
cd cintas_video_kit
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Add your API keys

Either edit `generate_assets.py` directly, or export them in your shell:

```bash
export GOOGLE_API_KEY="ya29....."          # Gemini / Imagen key
export ELEVENLABS_API_KEY="sk_........"     # ElevenLabs key
export ELEVENLABS_VOICE_ID="JBFqnCBsd6RMkjVDRZzb"   # "George" male, optional
```

> Imagen requires that your Google Cloud / AI Studio key has the Gemini API enabled.

## 3) Generate the assets

```bash
python generate_assets.py
```

The script is resumable. If something fails halfway, just run it again — it
skips files that already exist.

## 4) Build the final video

```bash
python assemble_video.py
```

This produces `Cintas_Stock_Deep_Dive.mp4`.

## Tweaks

- **Different voice** – change `ELEVENLABS_VOICE_ID`. Some good narrator IDs:
  - `JBFqnCBsd6RMkjVDRZzb` – George (male)
  - `21m00Tcm4TlvDq8ikWAM` – Rachel (female)
  - `pNInz6obpgDQGcFmaJgB` – Adam (male)
- **No on-screen text** – set `BURN_TEXT_OVERLAY = False` in `assemble_video.py`.
- **Skip a slide** – just delete that pair (IMG-N + Voice-N) and renumber. Easier: regenerate.
- **Use a different image API** – replace `generate_image_via_google()` in `generate_assets.py`. The function takes `(prompt, out_path)` and must write a PNG/JPG.

## Notes & honesty

- **Google "Flow"** (labs.google/fx/tools/flow) is a *video* tool with no public image API. This script uses **Google Imagen** through the Gemini API, which is the actual programmatic Google image-generation endpoint. If you have your own Flow proxy, swap it into `generate_image_via_google()`.
- API costs: budget roughly $1–2 for Imagen (40 images) and $1–2 for ElevenLabs (~16 minutes of narration), depending on your plan.
