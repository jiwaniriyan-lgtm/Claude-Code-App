"""
Centralised error handling with retry logic and Sheets logging.

Usage:
    with ErrorHandler(sheets, topic="My Topic", row=3):
        # pipeline steps

Any unhandled exception inside the block:
  • marks the row as "error" in Google Sheets
  • writes to the ErrorLog sheet
  • re-raises so the main loop can skip to the next topic
"""

import logging
import time
from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar

from config import config

logger = logging.getLogger(__name__)

F = TypeVar("F", bound=Callable[..., Any])


def with_retry(fn: F) -> F:
    """Decorator: retry a function up to config.max_retries times with exponential backoff."""

    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        delay = config.retry_backoff
        last_exc: Exception | None = None
        for attempt in range(1, config.max_retries + 1):
            try:
                return fn(*args, **kwargs)
            except Exception as exc:
                last_exc = exc
                logger.warning(
                    "Attempt %d/%d failed for %s: %s",
                    attempt,
                    config.max_retries,
                    fn.__qualname__,
                    exc,
                )
                if attempt < config.max_retries:
                    time.sleep(delay)
                    delay *= 2
        raise last_exc  # type: ignore[misc]

    return wrapper  # type: ignore[return-value]


class PipelineError(Exception):
    """Raised when a video pipeline step fails after all retries."""


class ErrorHandler:
    """Context manager that catches exceptions, logs them, and updates Sheets."""

    def __init__(self, sheets_client: Any, topic: str, row: int) -> None:
        self._sheets = sheets_client
        self._topic = topic
        self._row = row

    def __enter__(self) -> "ErrorHandler":
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> bool:
        if exc_val is None:
            return False
        msg = f"{exc_type.__name__}: {exc_val}" if exc_type else str(exc_val)
        logger.error("Pipeline error for '%s' (row %d): %s", self._topic, self._row, msg)
        try:
            self._sheets.set_status(self._row, "error", notes=msg[:500])
            self._sheets.log_error(self._topic, msg[:500])
        except Exception as log_exc:
            logger.error("Failed to record error to Sheets: %s", log_exc)
        # Do NOT suppress — let main loop catch and continue
        return False
