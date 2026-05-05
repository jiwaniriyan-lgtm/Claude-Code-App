# Claude-Code-App

Faceless YouTube channel pipeline: Pine Script v6 / TradingView strategies.
Voiceover via ElevenLabs, thumbnails via Google Gemini 2.5 Flash Image ("Nano Banana").

See `CLAUDE.md` for channel concept, content pillars, and brand voice.

## First-time setup on a new machine

```bash
git clone git@github.com:jiwaniriyan-lgtm/claude-code-app.git
cd claude-code-app
git checkout claude/setup-youtube-channel-project-YrtRy

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and fill in keys (see "Keys" section below)
```

## Cross-machine workflow

This project is designed to run on multiple computers. **Source of truth is git.**
Generated mp3/mp4 files are gitignored — they're regenerable from `script.md` + your API keys.

Every session, on every machine:

```bash
git pull origin claude/setup-youtube-channel-project-YrtRy   # 1. sync
# ...do work...
git add scripts/ videos/<slug>/script.md videos/<slug>/notes.md plan/ CLAUDE.md
git commit -m "describe what changed"
git push                                                     # 2. ship
```

### What's in git vs. local

| In git                                | Local only (gitignored)              |
|---------------------------------------|--------------------------------------|
| `scripts/*.py`                        | `.env`                               |
| `videos/<slug>/script.md`             | `videos/<slug>/voiceover.mp3`        |
| `videos/<slug>/notes.md`              | `videos/<slug>/raw/` (screen recs)   |
| `videos/<slug>/images/*.png`          | `videos/<slug>/final/*.mp4`          |
| `plan/`, `CLAUDE.md`, `README.md`     | `.venv/`, `__pycache__/`             |
| `brand/` (PNG only)                   | any `*.mp3`/`*.mp4`/`*.wav`/`*.mov`  |

If you regenerate voiceover or thumbnails on machine B, that's fine — the script is locked, the output is identical-ish, and only the inputs (text, prompts) live in git.

## Daily workflow: making one video

```bash
# 1. Scaffold the folder
python scripts/new_video.py hull-ma-vs-ema --title "Why Hull MA Beats EMA"

# 2. Edit the script
$EDITOR videos/hull-ma-vs-ema/script.md

# 3. Generate voiceover (preview text first - free)
python scripts/generate_voiceover.py hull-ma-vs-ema --dry-run
python scripts/generate_voiceover.py hull-ma-vs-ema

# 4. Generate 3 thumbnail variants
python scripts/generate_thumbnails.py hull-ma-vs-ema \
  --title "Hull MA Beats EMA" \
  --style "dark theme, neon green, chart screenshot, big bold text"

# 5. Record screen captures into videos/hull-ma-vs-ema/raw/
# 6. Edit and export to videos/hull-ma-vs-ema/final/
# 7. Commit script + thumbnails + notes (mp3/mp4 are gitignored)
git add videos/hull-ma-vs-ema/script.md videos/hull-ma-vs-ema/notes.md videos/hull-ma-vs-ema/images/
git commit -m "draft hull MA vs EMA video"
git push
```

## Keys

Get and paste into `.env`:

- **ElevenLabs:** elevenlabs.io → profile → API keys
- **ElevenLabs voice ID:** elevenlabs.io/app/voice-library → click voice → copy 20-char ID
- **Gemini:** aistudio.google.com/apikey → "Create API key" (this powers thumbnail generation)
- **YouTube:** console.cloud.google.com (only needed if you automate uploads — optional)

## Repo layout

```
scripts/        Python pipeline (generate_script, _voiceover, _thumbnails, new_video)
videos/         One folder per video. script.md in git, mp3/mp4 not.
brand/          Channel art, intros, reusable thumbnail assets
plan/           Content calendar, video ideas, titles
CLAUDE.md       Project context for Claude Code sessions
.env.example    Copy to .env and fill in
```

## Troubleshooting

- **`google-genai` import error:** make sure venv is activated and `pip install -r requirements.txt` completed.
- **`ELEVENLABS_VOICE_ID not set`:** paste your voice ID into `.env` (it's not in git).
- **No image data in response:** Gemini 2.5 Flash Image occasionally returns text-only. Re-run the command.
- **Push rejected on first push:** you may need `git push -u origin claude/setup-youtube-channel-project-YrtRy`.
