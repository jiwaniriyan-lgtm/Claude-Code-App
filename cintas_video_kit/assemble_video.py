#!/usr/bin/env python3
"""
assemble_video.py
=================
Stitches IMG-1..IMG-40 + Voice-1..Voice-40 into a single ~16 minute MP4.

Logic:
    - For each slide N: take Voice-N.mp3, measure its duration, then create a
      video clip of IMG-N.png matching that duration + a small tail of silence
      (default 0.6s) for a natural beat between slides.
    - Optional: burn the slide's on-screen text in the lower third.
    - Concatenate all 40 clips.
    - If total runtime is short of 16:00, pad the final clip; if it overshoots,
      we keep it (a couple of seconds long/short is fine).

Output:
    /Users/sheazad/Downloads/Cintas/Cintas_Stock_Deep_Dive.mp4

DEPENDENCIES:
    pip install -r requirements.txt
    ffmpeg must be installed on the Mac (brew install ffmpeg).
"""

import json
import math
import pathlib
import shutil
import subprocess
import sys
import textwrap
import tempfile

from slides_data import SLIDES

OUTPUT_ROOT  = pathlib.Path("/Users/sheazad/Downloads/Cintas")
IMAGES_DIR   = OUTPUT_ROOT / "Images"
VOICE_DIR    = OUTPUT_ROOT / "Voice"
FINAL_VIDEO  = OUTPUT_ROOT / "Cintas_Stock_Deep_Dive.mp4"

TAIL_SILENCE_SEC   = 0.6     # gap between slides
TARGET_TOTAL_SEC   = 16 * 60 # 960s
BURN_TEXT_OVERLAY  = True    # set False to skip text overlay
FONT_FILE          = "/System/Library/Fonts/Supplemental/Arial.ttf"  # Mac default
RESOLUTION         = "1920x1080"


def need(binary: str):
    if shutil.which(binary) is None:
        sys.exit(f"ERROR: '{binary}' is not installed. brew install {binary}")


def probe_duration(mp3_path: pathlib.Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "json", str(mp3_path),
    ])
    return float(json.loads(out)["format"]["duration"])


def escape_drawtext(s: str) -> str:
    # ffmpeg drawtext requires special chars escaped
    return (
        s.replace("\\", "\\\\")
         .replace(":", "\\:")
         .replace("'", "’")  # curly apostrophe sidesteps escape hell
         .replace("%", "\\%")
    )


def build_slide_clip(img: pathlib.Path, mp3: pathlib.Path,
                     overlay_text: str, out_clip: pathlib.Path) -> None:
    voice_dur = probe_duration(mp3)
    clip_dur  = voice_dur + TAIL_SILENCE_SEC
    w, h = RESOLUTION.split("x")

    # Simple, robust: scale image to fit 1920x1080 with letterboxing if needed.
    # No zoompan -- it's flaky on ffmpeg 7.x and CapCut adds Ken-Burns better anyway.
    vf = (
        f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
        f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black,"
        f"setsar=1,format=yuv420p"
    )

    if BURN_TEXT_OVERLAY and overlay_text:
        wrapped = "\n".join(textwrap.wrap(overlay_text, width=60))
        safe = escape_drawtext(wrapped)
        vf += (
            f",drawtext=fontfile='{FONT_FILE}':text='{safe}':"
            f"fontcolor=white:fontsize=42:line_spacing=8:"
            f"box=1:boxcolor=black@0.55:boxborderw=24:"
            f"x=(w-text_w)/2:y=h-text_h-90"
        )

    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-loop", "1", "-t", f"{clip_dur:.3f}", "-i", str(img),
        "-i", str(mp3),
        "-vf", vf,
        "-af", f"apad=pad_dur={TAIL_SILENCE_SEC}",
        "-r", "25",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(out_clip),
    ]
    # Show ffmpeg's actual error if it fails -- no more silent failures
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write("\n--- ffmpeg stderr ---\n")
        sys.stderr.write(result.stderr)
        sys.stderr.write("\n--- command ---\n")
        sys.stderr.write(" ".join(cmd) + "\n")
        raise RuntimeError(f"ffmpeg failed on {img.name} (exit {result.returncode})")


def concat_clips(clip_paths, out_path: pathlib.Path):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        for p in clip_paths:
            f.write(f"file '{p}'\n")
        list_file = f.name

    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file,
        "-c", "copy", str(out_path),
    ]
    subprocess.run(cmd, check=True)


def main():
    need("ffmpeg")
    need("ffprobe")

    if not IMAGES_DIR.exists() or not VOICE_DIR.exists():
        sys.exit("Run generate_assets.py first.")

    tmp_dir = OUTPUT_ROOT / "_clips"
    tmp_dir.mkdir(exist_ok=True)

    clip_paths = []
    total = 0.0
    for idx, slide in enumerate(SLIDES, start=1):
        img = IMAGES_DIR / f"IMG-{idx}.png"
        mp3 = VOICE_DIR  / f"Voice-{idx}.mp3"
        if not img.exists() or not mp3.exists():
            sys.exit(f"Missing asset for slide {idx}: {img} / {mp3}")

        clip = tmp_dir / f"clip-{idx:02d}.mp4"
        print(f"[{idx}/{len(SLIDES)}] building {clip.name} ...")
        build_slide_clip(img, mp3, slide.get("on_screen_text", ""), clip)
        total += probe_duration(clip)
        clip_paths.append(clip)

    print(f"\nTotal runtime before final stitch: {total:.1f}s  (target {TARGET_TOTAL_SEC}s)")

    if total < TARGET_TOTAL_SEC - 5:
        pad = TARGET_TOTAL_SEC - total
        print(f"Padding final clip with {pad:.1f}s of held image to hit 16:00")
        last_clip = clip_paths[-1]
        padded = tmp_dir / "clip-40-padded.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-i", str(last_clip),
            "-vf", f"tpad=stop_mode=clone:stop_duration={pad}",
            "-af", f"apad=pad_dur={pad}",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            str(padded),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        clip_paths[-1] = padded

    print("Concatenating ...")
    concat_clips(clip_paths, FINAL_VIDEO)
    print(f"\nDONE -> {FINAL_VIDEO}")
    print("You can delete the _clips/ folder once you're happy with the result.")


if __name__ == "__main__":
    main()
