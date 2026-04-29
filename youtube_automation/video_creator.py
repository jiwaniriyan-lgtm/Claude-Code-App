"""
json2video API client.

Workflow mirrors the n8n diagram:
  1. POST /movies  → create render job, get movie_id
  2. Poll GET /movies/{movie_id} every N seconds
     • status "done"    → return download URL
     • status "running" → keep waiting
     • status "error"   → raise VideoCreationError

Docs: https://json2video.com/docs/api/
"""

import logging
import time
from dataclasses import dataclass

import requests

from ai_generator import VideoContent
from config import config

logger = logging.getLogger(__name__)


class VideoCreationError(Exception):
    pass


@dataclass
class VideoResult:
    movie_id: str
    download_url: str
    duration_secs: int


class VideoCreator:
    def __init__(self, music_url: str = "") -> None:
        self._api_key = config.json2video_api_key
        self._base = config.json2video_base_url.rstrip("/")
        self._music_url = music_url
        self._session = requests.Session()
        self._session.headers.update({"x-api-key": self._api_key})

    # ── Public ─────────────────────────────────────────────────────────────

    def create_and_wait(self, content: VideoContent, intro_url: str = "") -> VideoResult:
        """Submit a render job and block until it finishes."""
        payload = self._build_payload(content, intro_url)
        movie_id = self._submit(payload)
        logger.info("Video job submitted: %s", movie_id)
        return self._poll(movie_id)

    # ── Internal ───────────────────────────────────────────────────────────

    def _build_payload(self, content: VideoContent, intro_url: str) -> dict:
        elements: list[dict] = []

        # Optional intro clip
        if intro_url:
            elements.append(
                {
                    "type": "video",
                    "src": intro_url,
                    "duration": 5,
                }
            )

        # One scene per script entry
        for scene in content.script:
            duration = scene.get("duration_secs", 10)
            elements.append(
                {
                    "type": "scene",
                    "duration": duration,
                    "elements": [
                        {
                            "type": "text-to-image",
                            "prompt": scene["visual_prompt"],
                            "style": "cinematic",
                        },
                        {
                            "type": "voice",
                            "text": scene["narration"],
                            "voice": "en-US-Neural2-D",
                            "volume": 0.85,
                        },
                    ],
                }
            )

        payload: dict = {
            "resolution": "full-hd",
            "quality": 80,
            "scenes": elements,
        }

        if self._music_url:
            payload["soundtrack"] = {
                "src": self._music_url,
                "volume": 0.15,
                "fade": True,
            }

        return payload

    def _submit(self, payload: dict) -> str:
        resp = self._session.post(f"{self._base}/movies", json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        movie_id = data.get("movie") or data.get("id")
        if not movie_id:
            raise VideoCreationError(f"No movie ID in response: {data}")
        return movie_id

    def _poll(self, movie_id: str) -> VideoResult:
        deadline = time.monotonic() + config.video_poll_timeout
        while time.monotonic() < deadline:
            time.sleep(config.video_poll_interval)
            resp = self._session.get(f"{self._base}/movies/{movie_id}", timeout=15)
            resp.raise_for_status()
            data = resp.json()
            movie = data.get("movie", data)
            status = movie.get("status", "").lower()

            logger.info("Poll %s → status=%s", movie_id, status)

            if status == "done":
                url = movie.get("url") or movie.get("download_url", "")
                duration = movie.get("duration", 0)
                return VideoResult(
                    movie_id=movie_id, download_url=url, duration_secs=duration
                )

            if status == "error":
                msg = movie.get("error", "Unknown render error")
                raise VideoCreationError(f"Render failed for {movie_id}: {msg}")

            # status == "running" → keep polling

        raise VideoCreationError(
            f"Timed out waiting for movie {movie_id} after {config.video_poll_timeout}s"
        )
