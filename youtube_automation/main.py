"""
YouTube Automation — main orchestrator.

Pipeline (one topic at a time):
  1. Read pending topics from Google Sheets
  2. For each topic:
     a. Mark row "running"
     b. Generate AI content (title, script, description, tags)
     c. Pick a random music track from the Music sheet
     d. Create video via json2video API (with polling)
     e. Save render URL to Sheets
     f. Upload video to YouTube
     g. Save YouTube URL to Sheets and mark "done"
     h. Any error → mark "error", write to ErrorLog sheet

Scheduler:
  • Run once immediately, then on the configured SCHEDULE_CRON.
  • Pass --once to run a single batch and exit.
  • Pass --topic "My Topic" to process one topic from the CLI.
"""

import argparse
import logging
import random
import sys
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from ai_generator import AIGenerator
from config import config
from error_handler import ErrorHandler, PipelineError, with_retry
from sheets_client import SheetsClient
from video_creator import VideoCreationError, VideoCreator
from youtube_uploader import YouTubeUploader

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")


# ── Wrapped steps (retry logic applied) ───────────────────────────────────────

@with_retry
def _generate(ai: AIGenerator, topic: str, prompt: str):
    return ai.generate(topic, prompt)


@with_retry
def _create_video(creator: VideoCreator, content):
    return creator.create_and_wait(content)


@with_retry
def _upload(uploader: YouTubeUploader, video_result, content):
    return uploader.upload(video_result, content)


# ── Core pipeline ──────────────────────────────────────────────────────────────

def run_pipeline() -> None:
    logger.info("=== Pipeline run started at %s ===", datetime.utcnow().isoformat())

    sheets = SheetsClient()
    ai = AIGenerator()
    uploader = YouTubeUploader()

    topics = sheets.get_pending_topics()
    if not topics:
        logger.info("No pending topics found.")
        return

    logger.info("Found %d pending topic(s).", len(topics))

    # Fetch music tracks once for the whole batch
    music_tracks = sheets.get_music_tracks()

    for entry in topics:
        row = entry["row"]
        topic = entry["topic"]
        prompt = entry["prompt"]

        if not topic:
            logger.warning("Row %d has an empty topic — skipping.", row)
            continue

        logger.info("--- Processing row %d: %s ---", row, topic)
        sheets.set_status(row, "running")

        with ErrorHandler(sheets, topic, row):
            # ── Step 1: AI content generation ──────────────────────────────
            content = _generate(ai, topic, prompt)

            # ── Step 2: Pick music & create video ─────────────────────────
            music_url = random.choice(music_tracks)["url"] if music_tracks else ""
            creator = VideoCreator(music_url=music_url)

            try:
                video_result = _create_video(creator, content)
            except VideoCreationError as exc:
                raise PipelineError(str(exc)) from exc

            sheets.set_video_url(row, video_result.download_url)
            logger.info("Video render complete: %s", video_result.download_url)

            # ── Step 3: Upload to YouTube ──────────────────────────────────
            youtube_url = _upload(uploader, video_result, content)
            sheets.set_youtube_url(row, youtube_url)

            logger.info("Done: %s → %s", topic, youtube_url)

    logger.info("=== Pipeline run finished ===")


# ── CLI entry point ────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="YouTube Automation Pipeline")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run one batch and exit (no scheduler)",
    )
    parser.add_argument(
        "--topic",
        metavar="TOPIC",
        help="Process a single ad-hoc topic from the command line",
    )
    args = parser.parse_args()

    if args.topic:
        # Ad-hoc single-topic run (does not touch Sheets for status)
        logger.info("Ad-hoc run for topic: %s", args.topic)
        ai = AIGenerator()
        content = ai.generate(args.topic)
        creator = VideoCreator()
        video_result = creator.create_and_wait(content)
        uploader = YouTubeUploader()
        url = uploader.upload(video_result, content)
        logger.info("YouTube URL: %s", url)
        return

    if args.once:
        run_pipeline()
        return

    # Scheduled mode
    parts = config.schedule_cron.split()
    if len(parts) != 5:
        logger.error("SCHEDULE_CRON must be a 5-field cron expression, got: %s", config.schedule_cron)
        sys.exit(1)

    minute, hour, day, month, day_of_week = parts
    trigger = CronTrigger(
        minute=minute,
        hour=hour,
        day=day,
        month=month,
        day_of_week=day_of_week,
    )

    scheduler = BlockingScheduler()
    scheduler.add_job(run_pipeline, trigger, id="youtube_pipeline", replace_existing=True)

    logger.info("Scheduler started (cron: %s). Press Ctrl-C to stop.", config.schedule_cron)
    # Run once immediately on startup, then follow the cron schedule
    run_pipeline()
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    main()
