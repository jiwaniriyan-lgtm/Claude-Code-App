# CLAUDE.md

Project context for Claude Code sessions on this repo. Read this first on any new machine.

## Channel concept

Faceless YouTube channel about **Pine Script v6** and **TradingView strategies**. No talking head, no webcam — visuals are charts, code, and overlays. Voiceover via ElevenLabs, thumbnails and supporting imagery via Google Gemini 2.5 Flash Image ("Nano Banana").

## Monetization target

- **Niche:** finance / trading education
- **Target RPM bracket:** $15-25 (standard finance niche range; long-form watch time is the main lever)
- Implication: a 10-min video at 50k views ≈ $750-1,250 ad revenue before YT's cut. Plan length and pacing accordingly.

## Content pillars

1. **Strategy backtests** — take a Pine Script v6 strategy, show entry/exit rules, run TradingView's backtester, present win rate / drawdown / equity curve honestly.
2. **Indicator breakdowns** — explain what an indicator measures, where it lies, and when it works. Show the math, not just the line.
3. **Pine Script tutorials** — from-scratch builds: "code this indicator in 8 minutes," "add alerts to any strategy," etc.
4. **Common trading mistakes** — overfitting backtests, ignoring slippage, repainting indicators, lookahead bias. Educational, not preachy.

## Existing Pine Script projects to mine for content

These are already-built scripts that can each fuel multiple videos:

- **Hull Suite + RSI strategy** — Hull MA variants for trend, RSI for entry timing. Backtest content + "why HMA beats EMA" explainer + parameter-tuning episode.
- **Tillson T3 screener strategy** — multi-ticker T3 screener. Good for "scan 50 tickers in one click" hook + T3-vs-EMA comparison.
- **Multi-timeframe price levels indicator** — auto-draws daily/weekly/monthly levels. Pairs with "how pros mark levels" and "MTF without repainting" episodes.
- **Combined levels + opening range indicator** — ORB on top of MTF levels. Opening-range-breakout strategy series.

Each project = 2-3 videos minimum. See `plan/video_ideas.md` for the running list.

## Brand voice

- **Technical but accessible.** Assume the viewer knows what an EMA is; don't assume they know what a Hull MA is.
- **Charts do the persuading.** No "this strategy will make you rich" claims. Show the equity curve, including drawdowns.
- **No hype. No urgency. No fake scarcity.** This is the long-game finance audience — they smell BS instantly.
- **Honesty about losses.** Backtest videos show losing trades, not just winners. Builds trust = subscribers = RPM.

## Tech pipeline

- **Script generation:** `scripts/generate_script.py` — outputs `videos/<slug>/script.md` with hook, body sections, CTA, b-roll cues, timestamps. v1 uses a structured template; LLM call is a TODO.
- **Voiceover:** `scripts/generate_voiceover.py` — ElevenLabs SDK, reads `script.md`, outputs `voiceover.mp3` (gitignored).
- **Thumbnails:** `scripts/generate_thumbnails.py` — Google Gemini 2.5 Flash Image, 3 variants per video.
- **Scaffolding:** `scripts/new_video.py <slug>` — creates the per-video folder.

## Cross-machine workflow

Work happens on multiple computers. **Everything that matters is in git.** Generated media (mp3/mp4) is not — it's regenerable from the script + .env keys.

On any machine, every session:

1. `git pull origin claude/setup-youtube-channel-project-YrtRy` (or whatever the active branch is)
2. Make sure `.env` exists locally with all keys filled (it's gitignored — copy from `.env.example`)
3. Activate venv: `source .venv/bin/activate`
4. Do the work
5. `git add` text/markdown/code only — `*.mp3`/`*.mp4`/`videos/*/raw/` are gitignored on purpose
6. `git commit && git push`

If `.venv` doesn't exist on a new machine: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.

## Env vars (see `.env.example`)

- `ELEVENLABS_API_KEY` — from elevenlabs.io
- `ELEVENLABS_VOICE_ID` — defaults to `uf0ZrRtyyJlbbGIn43uD` in `.env.example`; override if you swap voices
- `GEMINI_API_KEY` — from aistudio.google.com/apikey (this is the "image API key" since we use Gemini 2.5 Flash Image)
- `YOUTUBE_API_KEY` — from console.cloud.google.com (for upload automation later)

## What goes where

```
scripts/   pipeline code (Python) — IN GIT
videos/    one folder per video — script.md IN GIT, mp3/mp4/raw NOT
brand/     thumbnails, channel art, intro animations — IN GIT (PNG ok, mp4 not)
plan/      content calendar, video ideas, titles, CTAs — IN GIT
```

## Notes for future sessions

- Pine Script v6 is current as of this project. If TradingView ships v7, update content pillar #3 wording.
- Don't generate the voiceover until the script is locked — ElevenLabs charges per character.
- Thumbnails: always make 3 variants and A/B them via YouTube's built-in test tool after publish.
- The 4 existing Pine Script projects live elsewhere — link them into `videos/<slug>/raw/` (gitignored) when needed for screen recording.
