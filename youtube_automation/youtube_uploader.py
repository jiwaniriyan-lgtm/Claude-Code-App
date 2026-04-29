"""
YouTube Data API v3 uploader.

Authentication flow:
  • First run: opens a browser for OAuth consent → saves token to youtube_token.json
  • Subsequent runs: loads the saved token and refreshes automatically

The upload uses resumable upload so large files don't time out.
"""

import logging
import os
import tempfile
from pathlib import Path

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from ai_generator import VideoContent
from config import config
from video_creator import VideoResult

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


class YouTubeUploader:
    def __init__(self) -> None:
        self._service = self._build_service()

    # ── Public ─────────────────────────────────────────────────────────────

    def upload(self, video_result: VideoResult, content: VideoContent) -> str:
        """Download the rendered video then upload it to YouTube. Returns watch URL."""
        local_path = self._download_video(video_result.download_url, video_result.movie_id)
        try:
            video_id = self._upload_to_youtube(local_path, content)
            url = f"https://www.youtube.com/watch?v={video_id}"
            logger.info("Uploaded to YouTube: %s", url)
            return url
        finally:
            try:
                os.unlink(local_path)
            except OSError:
                pass

    # ── Internal ───────────────────────────────────────────────────────────

    def _build_service(self):
        creds = self._load_or_refresh_credentials()
        return build("youtube", "v3", credentials=creds)

    def _load_or_refresh_credentials(self) -> Credentials:
        token_path = config.youtube_token_json
        creds: Credentials | None = None

        if Path(token_path).exists():
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)

        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(
                config.youtube_client_secrets_json, SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open(token_path, "w") as fh:
            fh.write(creds.to_json())

        return creds

    def _download_video(self, url: str, movie_id: str) -> str:
        logger.info("Downloading rendered video from %s", url)
        suffix = Path(url.split("?")[0]).suffix or ".mp4"
        tmp = tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix, prefix=f"yta_{movie_id}_"
        )
        with requests.get(url, stream=True, timeout=120) as r:
            r.raise_for_status()
            for chunk in r.iter_content(chunk_size=8 * 1024 * 1024):
                tmp.write(chunk)
        tmp.close()
        logger.info("Video saved to %s (%d bytes)", tmp.name, Path(tmp.name).stat().st_size)
        return tmp.name

    def _upload_to_youtube(self, file_path: str, content: VideoContent) -> str:
        body = {
            "snippet": {
                "title": content.title,
                "description": content.description,
                "tags": content.tags,
                "categoryId": config.youtube_category_id,
            },
            "status": {
                "privacyStatus": config.youtube_privacy_status,
                "selfDeclaredMadeForKids": False,
            },
        }

        media = MediaFileUpload(
            file_path,
            mimetype="video/mp4",
            resumable=True,
            chunksize=8 * 1024 * 1024,
        )

        request = self._service.videos().insert(
            part="snippet,status", body=body, media_body=media
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info("Upload progress: %d%%", int(status.progress() * 100))

        return response["id"]
