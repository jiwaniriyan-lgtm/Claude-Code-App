"""
Central configuration loaded from environment variables.
Copy .env.example → .env and fill in your credentials before running.
"""
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    # ── Anthropic ──────────────────────────────────────────────────────────
    anthropic_api_key: str = field(default_factory=lambda: os.environ["ANTHROPIC_API_KEY"])
    claude_model: str = field(default_factory=lambda: os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"))

    # ── Google Sheets ──────────────────────────────────────────────────────
    google_service_account_json: str = field(
        default_factory=lambda: os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "service_account.json")
    )
    spreadsheet_id: str = field(default_factory=lambda: os.environ["SPREADSHEET_ID"])
    topics_sheet: str = field(default_factory=lambda: os.getenv("TOPICS_SHEET", "Topics"))
    music_sheet: str = field(default_factory=lambda: os.getenv("MUSIC_SHEET", "Music"))
    log_sheet: str = field(default_factory=lambda: os.getenv("LOG_SHEET", "ErrorLog"))

    # ── json2video ─────────────────────────────────────────────────────────
    json2video_api_key: str = field(default_factory=lambda: os.environ["JSON2VIDEO_API_KEY"])
    json2video_base_url: str = field(
        default_factory=lambda: os.getenv("JSON2VIDEO_BASE_URL", "https://api.json2video.com/v2")
    )
    video_poll_interval: int = field(default_factory=lambda: int(os.getenv("VIDEO_POLL_INTERVAL", "15")))
    video_poll_timeout: int = field(default_factory=lambda: int(os.getenv("VIDEO_POLL_TIMEOUT", "600")))

    # ── YouTube ────────────────────────────────────────────────────────────
    youtube_client_secrets_json: str = field(
        default_factory=lambda: os.getenv("YOUTUBE_CLIENT_SECRETS_JSON", "client_secrets.json")
    )
    youtube_token_json: str = field(
        default_factory=lambda: os.getenv("YOUTUBE_TOKEN_JSON", "youtube_token.json")
    )
    youtube_category_id: str = field(default_factory=lambda: os.getenv("YOUTUBE_CATEGORY_ID", "22"))
    youtube_privacy_status: str = field(
        default_factory=lambda: os.getenv("YOUTUBE_PRIVACY_STATUS", "public")
    )

    # ── Scheduler ──────────────────────────────────────────────────────────
    schedule_cron: str = field(default_factory=lambda: os.getenv("SCHEDULE_CRON", "0 9 * * *"))

    # ── Retry / resilience ─────────────────────────────────────────────────
    max_retries: int = field(default_factory=lambda: int(os.getenv("MAX_RETRIES", "3")))
    retry_backoff: float = field(default_factory=lambda: float(os.getenv("RETRY_BACKOFF", "2.0")))


config = Config()
