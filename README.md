# YouTube Automation System

A fully automated pipeline that reads video topics from Google Sheets, generates AI-written scripts with Claude, renders videos via json2video, and publishes them to YouTube — on a schedule.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT: Video Topic and Prompts                                  │
│  Schedule Trigger → Google Sheets → Claude AI → Script/Meta     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  Get Music & Intro Video                                         │
│  Music Sheet → random track URL                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  Generate Full Video                                             │
│  POST /movies → poll status (running/done/error) → download URL  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┴──────────────────┐
              │ Handle Errors                      │
              │ Switch on status                   │
              │  done    → continue                │
              │  running → wait & retry            │
              │  error   → log → ErrorLog sheet    │
              └────────────────┬──────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  OUTPUT: Final Video and Publishing                              │
│  Save video URL → upload to YouTube → save YT URL → mark done   │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
youtube_automation/
├── main.py            # Orchestrator + APScheduler cron
├── config.py          # All settings from .env
├── sheets_client.py   # Google Sheets read/write
├── ai_generator.py    # Claude API — script, title, description, tags
├── video_creator.py   # json2video API — create + poll
├── youtube_uploader.py# YouTube Data API v3 — OAuth + resumable upload
├── error_handler.py   # Retry decorator + context-manager error handler
├── setup_sheets.py    # One-time sheet initialisation helper
├── requirements.txt
└── .env.example
```

## Quick Start

### 1. Install dependencies

```bash
cd youtube_automation
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure credentials

```bash
cp .env.example .env
# Edit .env with your keys
```

You need four credential files / keys:

| What | Where to get it |
|------|-----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Cloud Console → IAM → Service Accounts |
| `YOUTUBE_CLIENT_SECRETS_JSON` | Google Cloud Console → APIs → YouTube Data API v3 → OAuth |
| `JSON2VIDEO_API_KEY` | json2video.com dashboard |

**Google service account:** Share your spreadsheet with the service account email (`...@....iam.gserviceaccount.com`) as Editor.

**YouTube OAuth:** On first run the browser opens for consent. The token is saved to `youtube_token.json` automatically.

### 3. Set up Google Sheets

```bash
python setup_sheets.py
```

This creates three tabs — `Topics`, `Music`, `ErrorLog` — with headers and sample data.

#### Topics sheet columns

| A: Topic | B: Prompt | C: Status | D: Video URL | E: YouTube URL | F: Notes |
|----------|-----------|-----------|--------------|----------------|----------|
| 10 Facts About the Ocean | All ages, upbeat | | | | |

Leave **Status** empty for rows you want processed. The system writes `running` → `done` / `error`.

#### Music sheet columns

| A: Track Name | B: URL |
|---------------|--------|
| Upbeat | https://... |

### 4. Run

**One batch now:**
```bash
python main.py --once
```

**Single ad-hoc topic (no Sheets needed):**
```bash
python main.py --topic "How Black Holes Form"
```

**Continuous scheduled mode** (default: 09:00 UTC daily):
```bash
python main.py
```

Override schedule via `.env`:
```
SCHEDULE_CRON=0 */6 * * *   # every 6 hours
```

## Configuration Reference

See `.env.example` for all options with explanations.

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Claude model for content generation |
| `YOUTUBE_PRIVACY_STATUS` | `public` | `public` / `unlisted` / `private` |
| `VIDEO_POLL_INTERVAL` | `15` | Seconds between render status checks |
| `VIDEO_POLL_TIMEOUT` | `600` | Max seconds to wait for render |
| `MAX_RETRIES` | `3` | Retries per step with exponential backoff |
| `SCHEDULE_CRON` | `0 9 * * *` | Cron expression for automatic runs |

## Error Handling

- Each pipeline step retries up to `MAX_RETRIES` times with exponential backoff.
- A failed row is marked `error` in the **Status** column with a short message in **Notes**.
- All errors are also appended to the **ErrorLog** sheet with a timestamp.
- Fix the issue, clear the **Status** cell, and the row will be picked up on the next run.
