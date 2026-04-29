"""
AI content generator — uses the Anthropic Claude API to produce:
  • A narrated video script (scene-by-scene)
  • YouTube title, description, and tags
  • Scene image / B-roll search prompts

Prompt caching is enabled on the large system prompt to reduce cost.
"""

import json
import logging
from dataclasses import dataclass

import anthropic

from config import config

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are an expert YouTube content strategist and scriptwriter.
Given a video topic and optional extra instructions, produce:

1. "title"       – compelling YouTube title, max 70 chars
2. "description" – SEO-optimised description, 150-300 words, with 3 paragraphs and a call-to-action
3. "tags"        – list of 10-15 relevant tags (strings)
4. "script"      – array of scene objects, each with:
     • "scene_number"   (integer, 1-based)
     • "narration"      (spoken text for this scene, 2-4 sentences)
     • "visual_prompt"  (image/B-roll description for the video creator)
     • "duration_secs"  (suggested duration, integer 5-15)

Return ONLY valid JSON. No markdown fences, no extra text.
"""


@dataclass
class VideoContent:
    title: str
    description: str
    tags: list[str]
    script: list[dict]

    @property
    def full_narration(self) -> str:
        return " ".join(s["narration"] for s in self.script)

    @property
    def total_duration(self) -> int:
        return sum(s.get("duration_secs", 10) for s in self.script)


class AIGenerator:
    def __init__(self) -> None:
        self._client = anthropic.Anthropic(api_key=config.anthropic_api_key)

    def generate(self, topic: str, extra_prompt: str = "") -> VideoContent:
        user_message = f"Topic: {topic}"
        if extra_prompt:
            user_message += f"\n\nExtra instructions: {extra_prompt}"

        logger.info("Generating content for topic: %s", topic)

        response = self._client.messages.create(
            model=config.claude_model,
            max_tokens=4096,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    # Cache the large system prompt — saves tokens on repeated calls
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_message}],
        )

        raw = response.content[0].text.strip()
        data = json.loads(raw)

        content = VideoContent(
            title=data["title"],
            description=data["description"],
            tags=data["tags"],
            script=data["script"],
        )

        logger.info(
            "Generated %d scenes (%ds total) for: %s",
            len(content.script),
            content.total_duration,
            topic,
        )
        return content
