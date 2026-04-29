"""
Google Sheets client.

Expected sheet layout (Topics sheet):
  Col A: Topic
  Col B: Prompt / extra instructions
  Col C: Status  (empty = pending | "running" | "done" | "error")
  Col D: Video URL (filled after creation)
  Col E: YouTube URL (filled after upload)
  Col F: Notes / error message

Music sheet:
  Col A: Track name
  Col B: URL / path
"""

import logging
from datetime import datetime
from typing import Optional

import gspread
from google.oauth2.service_account import Credentials

from config import config

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
]

# Column indices (0-based)
COL_TOPIC = 0
COL_PROMPT = 1
COL_STATUS = 2
COL_VIDEO_URL = 3
COL_YOUTUBE_URL = 4
COL_NOTES = 5


class SheetsClient:
    def __init__(self) -> None:
        creds = Credentials.from_service_account_file(
            config.google_service_account_json, scopes=SCOPES
        )
        self._gc = gspread.authorize(creds)
        self._spreadsheet = self._gc.open_by_key(config.spreadsheet_id)

    def _worksheet(self, name: str) -> gspread.Worksheet:
        return self._spreadsheet.worksheet(name)

    # ── Topics ─────────────────────────────────────────────────────────────

    def get_pending_topics(self) -> list[dict]:
        """Return rows where Status is empty (not yet processed)."""
        ws = self._worksheet(config.topics_sheet)
        rows = ws.get_all_values()
        pending = []
        for i, row in enumerate(rows[1:], start=2):  # skip header, 1-based row index
            # Pad short rows
            while len(row) < 6:
                row.append("")
            status = row[COL_STATUS].strip().lower()
            if status == "":
                pending.append(
                    {
                        "row": i,
                        "topic": row[COL_TOPIC].strip(),
                        "prompt": row[COL_PROMPT].strip(),
                    }
                )
        return pending

    def set_status(self, row: int, status: str, notes: str = "") -> None:
        ws = self._worksheet(config.topics_sheet)
        ws.update_cell(row, COL_STATUS + 1, status)
        if notes:
            ws.update_cell(row, COL_NOTES + 1, notes)
        logger.info("Row %d → status=%s", row, status)

    def set_video_url(self, row: int, url: str) -> None:
        ws = self._worksheet(config.topics_sheet)
        ws.update_cell(row, COL_VIDEO_URL + 1, url)

    def set_youtube_url(self, row: int, url: str) -> None:
        ws = self._worksheet(config.topics_sheet)
        ws.update_cell(row, COL_YOUTUBE_URL + 1, url)
        ws.update_cell(row, COL_STATUS + 1, "done")
        logger.info("Row %d → YouTube URL saved, marked done", row)

    # ── Music ──────────────────────────────────────────────────────────────

    def get_music_tracks(self) -> list[dict]:
        ws = self._worksheet(config.music_sheet)
        rows = ws.get_all_values()
        tracks = []
        for row in rows[1:]:
            if len(row) >= 2 and row[0].strip():
                tracks.append({"name": row[0].strip(), "url": row[1].strip()})
        return tracks

    # ── Error log ──────────────────────────────────────────────────────────

    def log_error(self, topic: str, error: str) -> None:
        try:
            ws = self._worksheet(config.log_sheet)
            ws.append_row(
                [datetime.utcnow().isoformat(timespec="seconds"), topic, error],
                value_input_option="USER_ENTERED",
            )
        except Exception as exc:  # never let logging crash the pipeline
            logger.error("Failed to write error log to Sheets: %s", exc)
