#!/usr/bin/env python3
"""
assemble_video.py  --  split-layout video with pen-style text reveal
====================================================================

For each slide we build a 1920x1080 frame:

    [ AI image 960x1080 ]   [ Text panel 960x1080 ]
     <letterbox on navy>     <text writes in L->R>

The image side alternates between left and right every slide for visual
variety. The text panel is pre-rendered with Pillow (so we don't need
ffmpeg's drawtext filter) and then revealed progressively by ffmpeg
using a time-varying crop -- looks like a hand "writing" the text in.

Outputs:
    /Users/sheazad/Downloads/Cintas/_text_panels/panel-NN.png   (per slide)
    /Users/sheazad/Downloads/Cintas/_clips/clip-NN.mp4          (per slide)
    /Users/sheazad/Downloads/Cintas/Cintas_Stock_Deep_Dive.mp4  (final)
"""

import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import textwrap

from PIL import Image, ImageDraw, ImageFont

from slides_data import SLIDES

# ----------------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------------
OUTPUT_ROOT = pathlib.Path("/Users/sheazad/Downloads/Cintas")
IMAGES_DIR  = OUTPUT_ROOT / "Images"
VOICE_DIR   = OUTPUT_ROOT / "Voice"
PANELS_DIR  = OUTPUT_ROOT / "_text_panels"
CLIPS_DIR   = OUTPUT_ROOT / "_clips"
FINAL_VIDEO = OUTPUT_ROOT / "Cintas_Stock_Deep_Dive.mp4"

# ----------------------------------------------------------------------------
# Visual config
# ----------------------------------------------------------------------------
W, H              = 1920, 1080      # final canvas
HALF_W            = 960             # each side
TAIL_SILENCE_SEC  = 0.6             # gap between slides
TARGET_TOTAL_SEC  = 16 * 60         # 960s

BG_RGB            = (10, 22, 40)    # dark navy
BG_HEX            = "0x0a1628"      # ffmpeg color form
TEXT_RGB          = (245, 245, 245)
ACCENT_RGB        = (212, 175, 55)  # gold


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def need(binary: str):
    if shutil.which(binary) is None:
        sys.exit(f"ERROR: '{binary}' is not installed. brew install {binary}")


def probe_duration(mp3_path: pathlib.Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "json", str(mp3_path),
    ])
    return float(json.loads(out)["format"]["duration"])


def _try_font(path: str, size: int, index: int = 0):
    if not pathlib.Path(path).exists():
        return None
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            return None


def get_font(size: int, bold: bool = True):
    """Find a usable system font on macOS, prefer bold."""
    candidates = []
    if bold:
        candidates += [
            ("/System/Library/Fonts/HelveticaNeue.ttc", 1),    # Bold
            ("/System/Library/Fonts/Helvetica.ttc",     1),
            ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
            ("/Library/Fonts/Arial Bold.ttf",                     0),
        ]
    candidates += [
        ("/System/Library/Fonts/HelveticaNeue.ttc", 0),
        ("/System/Library/Fonts/Helvetica.ttc",     0),
        ("/System/Library/Fonts/Supplemental/Arial.ttf", 0),
        ("/Library/Fonts/Arial.ttf",                     0),
    ]
    for path, idx in candidates:
        f = _try_font(path, size, idx)
        if f is not None:
            return f
    return ImageFont.load_default()


def render_text_panel(text: str, out_path: pathlib.Path,
                      w: int = HALF_W, h: int = H) -> None:
    """
    Pre-render the slide's text panel as a PNG.
    Layout: gold accent bar near top, then large title text, top-left aligned.
    """
    img = Image.new("RGB", (w, h), BG_RGB)
    draw = ImageDraw.Draw(img)

    # Pick base font size based on text length
    if   len(text) < 25:  size = 96
    elif len(text) < 45:  size = 78
    elif len(text) < 70:  size = 64
    else:                 size = 52

    title_font   = get_font(size, bold=True)
    caption_font = get_font(28,   bold=False)

    # Word-wrap by pixel width, not char count
    pad_x = 80
    max_text_w = w - 2 * pad_x

    def wrap_to_width(s, font, max_w):
        words = s.split()
        lines, cur = [], ""
        for word in words:
            test = (cur + " " + word).strip()
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines

    lines = wrap_to_width(text, title_font, max_text_w)

    # If wrapping produced too many lines, drop the font down once more
    if len(lines) > 5 and size > 52:
        size = 52
        title_font = get_font(size, bold=True)
        lines = wrap_to_width(text, title_font, max_text_w)

    line_h = int(size * 1.25)
    total_text_h = line_h * len(lines)
    accent_h = 8
    block_h = total_text_h + 60 + accent_h
    y0 = (h - block_h) // 2

    # Gold accent bar
    draw.rectangle([pad_x, y0, pad_x + 120, y0 + accent_h], fill=ACCENT_RGB)

    # Title lines
    y = y0 + accent_h + 50
    for line in lines:
        draw.text((pad_x, y), line, fill=TEXT_RGB, font=title_font)
        y += line_h

    # Small caption strip at the bottom
    caption = "Cintas Corporation  •  CTAS"
    bbox = draw.textbbox((0, 0), caption, font=caption_font)
    cw = bbox[2] - bbox[0]
    draw.text((pad_x, h - 80), caption, fill=ACCENT_RGB, font=caption_font)

    img.save(out_path)


# ----------------------------------------------------------------------------
# Per-slide clip builder
# ----------------------------------------------------------------------------
def build_slide_clip(idx: int, img_path: pathlib.Path, mp3_path: pathlib.Path,
                     panel_path: pathlib.Path, out_clip: pathlib.Path) -> None:
    voice_dur = probe_duration(mp3_path)
    clip_dur  = voice_dur + TAIL_SILENCE_SEC
    D = f"{clip_dur:.3f}"
    # Finish revealing text by ~85% of the voice duration so the viewer
    # has a moment to read before the next slide.
    reveal_dur = max(2.0, voice_dur * 0.85)
    R = f"{reveal_dur:.3f}"

    # Alternate sides: odd idx (1,3,5...) image on LEFT;  even idx image on RIGHT
    image_left = (idx % 2 == 1)
    img_x   = 0      if image_left else HALF_W
    panel_x = HALF_W if image_left else 0

    # ffmpeg filter graph
    # 1. Image -> scale to 960x1080 with navy letterbox
    # 2. Panel -> stays FULL SIZE (no variable crop)
    # 3. Canvas -> solid navy 1920x1080
    # 4. Overlay image, then overlay full panel
    # 5. Slide a navy "cover" rectangle off to the right to reveal text L->R
    filter_complex = (
        f"[0:v]scale={HALF_W}:{H}:force_original_aspect_ratio=decrease,"
        f"pad={HALF_W}:{H}:(ow-iw)/2:(oh-ih)/2:color={BG_HEX},setsar=1,format=yuv420p[img];"
        f"[1:v]setsar=1,format=yuv420p[txt];"
        f"color=c={BG_HEX}:s={W}x{H}:d={D},format=yuv420p[bg];"
        f"[bg][img]overlay={img_x}:0[bg2];"
        f"[bg2][txt]overlay={panel_x}:0[bg3];"
        f"[bg3]drawbox="
        f"x='{panel_x}+{HALF_W}*t/{R}':y=0:"
        f"w='max(0\\,{HALF_W}*(1-t/{R}))':h={H}:"
        f"color={BG_HEX}@1.0:t=fill[v]"
    )

    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-loop", "1", "-t", D, "-i", str(img_path),
        "-loop", "1", "-t", D, "-i", str(panel_path),
        "-i", str(mp3_path),
        "-filter_complex", filter_complex,
        "-map", "[v]", "-map", "2:a",
        "-af", f"apad=pad_dur={TAIL_SILENCE_SEC}",
        "-r", "25",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(out_clip),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write("\n--- ffmpeg stderr ---\n")
        sys.stderr.write(result.stderr)
        sys.stderr.write("\n--- command ---\n")
        sys.stderr.write(" ".join(cmd) + "\n")
        raise RuntimeError(f"ffmpeg failed on slide {idx} (exit {result.returncode})")


# ----------------------------------------------------------------------------
# Concat
# ----------------------------------------------------------------------------
def concat_clips(clip_paths, out_path: pathlib.Path):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        for p in clip_paths:
            f.write(f"file '{p}'\n")
        list_file = f.name
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", list_file,
        "-c", "copy", str(out_path),
    ], check=True)


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main():
    need("ffmpeg")
    need("ffprobe")

    if not IMAGES_DIR.exists() or not VOICE_DIR.exists():
        sys.exit("Run generate_assets.py first.")

    PANELS_DIR.mkdir(parents=True, exist_ok=True)
    CLIPS_DIR.mkdir(parents=True, exist_ok=True)

    # --- Step 1: render text panels with Pillow ---
    print("Rendering text panels...")
    for idx, slide in enumerate(SLIDES, start=1):
        text = slide.get("on_screen_text") or f"Slide {idx}"
        panel = PANELS_DIR / f"panel-{idx:02d}.png"
        if not panel.exists():
            render_text_panel(text, panel)

    # --- Step 2: build each clip ---
    clip_paths = []
    total = 0.0
    for idx, slide in enumerate(SLIDES, start=1):
        img   = IMAGES_DIR / f"IMG-{idx}.png"
        mp3   = VOICE_DIR  / f"Voice-{idx}.mp3"
        panel = PANELS_DIR / f"panel-{idx:02d}.png"
        if not img.exists() or not mp3.exists():
            sys.exit(f"Missing asset for slide {idx}: {img} / {mp3}")

        clip = CLIPS_DIR / f"clip-{idx:02d}.mp4"
        print(f"[{idx}/{len(SLIDES)}] building {clip.name} ...")
        build_slide_clip(idx, img, mp3, panel, clip)
        total += probe_duration(clip)
        clip_paths.append(clip)

    print(f"\nTotal runtime before final stitch: {total:.1f}s  (target {TARGET_TOTAL_SEC}s)")

    # --- Step 3: pad to exactly 16 minutes if short ---
    if total < TARGET_TOTAL_SEC - 5:
        pad = TARGET_TOTAL_SEC - total
        print(f"Padding final clip with {pad:.1f}s to hit 16:00")
        last_clip = clip_paths[-1]
        padded = CLIPS_DIR / "clip-40-padded.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(last_clip),
            "-vf", f"tpad=stop_mode=clone:stop_duration={pad}",
            "-af", f"apad=pad_dur={pad}",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            str(padded),
        ], check=True)
        clip_paths[-1] = padded

    # --- Step 4: concat ---
    print("Concatenating ...")
    concat_clips(clip_paths, FINAL_VIDEO)
    print(f"\nDONE -> {FINAL_VIDEO}")
    print(f"(Intermediate clips kept at {CLIPS_DIR} -- delete when happy.)")


if __name__ == "__main__":
    main()
