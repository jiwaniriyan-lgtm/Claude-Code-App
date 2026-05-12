#!/usr/bin/env python3
"""
assemble_video.py  --  bulletproof split-layout build
=====================================================

Pillow handles ALL layout/composition (image side + text panel side, fonts,
colors, padding). ffmpeg only has to turn one static composite PNG into a
video clip with audio. No time-varying filters, no overlay graphs, no
drawtext, no drawbox. Works on the most stripped-down ffmpeg build.

For each slide we produce a 1920x1080 frame:

    [ AI image 960x1080 ]   [ Text panel 960x1080 ]
     <letterboxed on navy>   <title + accent + footer>

Image side alternates left/right per slide for visual variety. Add fancy
animation later in CapCut -- this is the clean base layer.

Outputs:
    /Users/sheazad/Downloads/Cintas/_frames/frame-NN.png
    /Users/sheazad/Downloads/Cintas/_clips/clip-NN.mp4
    /Users/sheazad/Downloads/Cintas/Cintas_Stock_Deep_Dive.mp4
"""

import os
import sys
import json
import pathlib
import shutil
import subprocess
import tempfile
import importlib

from PIL import Image, ImageDraw, ImageFont

# Pick which dataset to use via SLIDES_MODULE env var:
#   set SLIDES_MODULE=slides_data         (Cintas, default)
#   set SLIDES_MODULE=slides_data_nvda    (NVIDIA)
_slides_module_name = os.environ.get("SLIDES_MODULE", "slides_data")
_slides_module = importlib.import_module(_slides_module_name)
SLIDES = _slides_module.SLIDES


# ---------------------------------------------------------------------------
def _default_output_root() -> pathlib.Path:
    """Cross-platform output folder. Override with CINTAS_OUTPUT env var.
    If using slides_data_nvda, default to a sibling NVIDIA folder."""
    env = os.environ.get("CINTAS_OUTPUT")
    if env:
        return pathlib.Path(env)
    project_name = "NVIDIA" if "nvda" in _slides_module_name.lower() else "Cintas"
    if sys.platform.startswith("win"):
        return pathlib.Path(rf"C:\Video Project API\{project_name}")
    if sys.platform == "darwin":
        return pathlib.Path.home() / "Downloads" / project_name
    return pathlib.Path.home() / project_name


OUTPUT_ROOT = _default_output_root()
IMAGES_DIR  = OUTPUT_ROOT / "Images"
VOICE_DIR   = OUTPUT_ROOT / "Voice"
FRAMES_DIR  = OUTPUT_ROOT / "_frames"
CLIPS_DIR   = OUTPUT_ROOT / "_clips"
FINAL_VIDEO = OUTPUT_ROOT / "Cintas_Stock_Deep_Dive.mp4"

W, H              = 1920, 1080
HALF_W            = 960
TAIL_SILENCE_SEC  = 0.6
TARGET_TOTAL_SEC  = 16 * 60

BG_RGB     = (10, 22, 40)     # dark navy
TEXT_RGB   = (245, 245, 245)
ACCENT_RGB = (212, 175, 55)   # gold


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def need(binary: str):
    if shutil.which(binary) is None:
        sys.exit(f"ERROR: '{binary}' is not installed. brew install {binary}")


def probe_duration(mp3_path: pathlib.Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "json", str(mp3_path),
    ])
    return float(json.loads(out)["format"]["duration"])


def _try_font(path, size, index=0):
    if not pathlib.Path(path).exists():
        return None
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            return None


def get_font(size, bold=True):
    """Find a usable font on Mac, Windows or Linux. Prefers bold if requested."""
    candidates = []
    if bold:
        # ---- Windows bold ----
        candidates += [
            (r"C:\Windows\Fonts\arialbd.ttf",   0),  # Arial Bold
            (r"C:\Windows\Fonts\segoeuib.ttf",  0),  # Segoe UI Bold
            (r"C:\Windows\Fonts\calibrib.ttf",  0),  # Calibri Bold
            (r"C:\Windows\Fonts\verdanab.ttf",  0),  # Verdana Bold
        ]
        # ---- macOS bold ----
        candidates += [
            ("/System/Library/Fonts/HelveticaNeue.ttc", 1),
            ("/System/Library/Fonts/Helvetica.ttc",     1),
            ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
        ]
        # ---- Linux bold ----
        candidates += [
            ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 0),
            ("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 0),
        ]
    # ---- Regular weight fallbacks (all platforms) ----
    candidates += [
        (r"C:\Windows\Fonts\arial.ttf",     0),
        (r"C:\Windows\Fonts\segoeui.ttf",   0),
        (r"C:\Windows\Fonts\calibri.ttf",   0),
        ("/System/Library/Fonts/HelveticaNeue.ttc", 0),
        ("/System/Library/Fonts/Helvetica.ttc",     0),
        ("/System/Library/Fonts/Supplemental/Arial.ttf", 0),
        ("/Library/Fonts/Arial.ttf", 0),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 0),
    ]
    for p, i in candidates:
        f = _try_font(p, size, i)
        if f:
            return f
    return ImageFont.load_default()


def wrap_to_width(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
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


def letterbox(image: Image.Image, target_w: int, target_h: int,
              bg_color=BG_RGB) -> Image.Image:
    iw, ih = image.size
    scale = min(target_w / iw, target_h / ih)
    new_w, new_h = max(1, int(iw * scale)), max(1, int(ih * scale))
    resized = image.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGB", (target_w, target_h), bg_color)
    canvas.paste(resized, ((target_w - new_w) // 2, (target_h - new_h) // 2))
    return canvas


# ---------------------------------------------------------------------------
# Text panel (960x1080)
# ---------------------------------------------------------------------------
def render_text_panel(text: str, width: int = HALF_W,
                      height: int = H) -> Image.Image:
    img = Image.new("RGB", (width, height), BG_RGB)
    draw = ImageDraw.Draw(img)

    if   len(text) < 25:  size = 96
    elif len(text) < 45:  size = 78
    elif len(text) < 70:  size = 64
    else:                 size = 52

    title_font   = get_font(size, bold=True)
    caption_font = get_font(28,   bold=False)

    pad_x = 80
    max_text_w = width - 2 * pad_x
    lines = wrap_to_width(draw, text, title_font, max_text_w)
    if len(lines) > 5 and size > 52:
        size = 52
        title_font = get_font(size, bold=True)
        lines = wrap_to_width(draw, text, title_font, max_text_w)

    line_h = int(size * 1.25)
    total_h = line_h * len(lines)
    accent_h = 8
    block_h = total_h + 60 + accent_h
    y0 = (height - block_h) // 2

    # gold accent bar
    draw.rectangle([pad_x, y0, pad_x + 120, y0 + accent_h], fill=ACCENT_RGB)

    # title lines
    y = y0 + accent_h + 50
    for line in lines:
        draw.text((pad_x, y), line, fill=TEXT_RGB, font=title_font)
        y += line_h

    # footer
    draw.text((pad_x, height - 80),
              "Cintas Corporation  •  CTAS",
              fill=ACCENT_RGB, font=caption_font)
    return img


# ---------------------------------------------------------------------------
# Full 1920x1080 composite
# ---------------------------------------------------------------------------
def render_composite(idx: int, ai_image_path: pathlib.Path,
                     text: str, out_path: pathlib.Path) -> None:
    canvas = Image.new("RGB", (W, H), BG_RGB)
    ai_panel  = letterbox(Image.open(ai_image_path).convert("RGB"), HALF_W, H)
    text_panel = render_text_panel(text, HALF_W, H)

    image_left = (idx % 2 == 1)  # odd: image LEFT, even: image RIGHT
    if image_left:
        canvas.paste(ai_panel,   (0,      0))
        canvas.paste(text_panel, (HALF_W, 0))
    else:
        canvas.paste(text_panel, (0,      0))
        canvas.paste(ai_panel,   (HALF_W, 0))

    canvas.save(out_path, "PNG", optimize=True)


# ---------------------------------------------------------------------------
# Per-slide clip (composite PNG + voice MP3)
# ---------------------------------------------------------------------------
def build_slide_clip(idx: int, composite_path: pathlib.Path,
                     mp3_path: pathlib.Path, out_clip: pathlib.Path) -> None:
    voice_dur = probe_duration(mp3_path)
    clip_dur  = voice_dur + TAIL_SILENCE_SEC
    D = f"{clip_dur:.3f}"

    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-loop", "1", "-t", D, "-i", str(composite_path),
        "-i", str(mp3_path),
        "-vf", "scale=1920:1080,format=yuv420p,setsar=1",
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


# ---------------------------------------------------------------------------
def concat_clips(clip_paths, out_path):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        for p in clip_paths:
            f.write(f"file '{p}'\n")
        list_file = f.name
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", list_file,
        "-c", "copy", str(out_path),
    ], check=True)


# ---------------------------------------------------------------------------
def main():
    need("ffmpeg")
    need("ffprobe")
    if not IMAGES_DIR.exists() or not VOICE_DIR.exists():
        sys.exit("Run generate_assets.py first.")

    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    CLIPS_DIR.mkdir(parents=True, exist_ok=True)

    # ---- Step 1: render Pillow composites (split-layout PNGs) ------------
    print("Rendering composite frames (Pillow)...")
    for idx, slide in enumerate(SLIDES, start=1):
        ai_path = IMAGES_DIR / f"IMG-{idx}.png"
        if not ai_path.exists():
            sys.exit(f"Missing AI image: {ai_path}")
        text = slide.get("on_screen_text") or f"Slide {idx}"
        frame = FRAMES_DIR / f"frame-{idx:02d}.png"
        if not frame.exists():
            render_composite(idx, ai_path, text, frame)

    # ---- Step 2: per-slide clips ----------------------------------------
    clip_paths = []
    total = 0.0
    for idx, slide in enumerate(SLIDES, start=1):
        mp3   = VOICE_DIR  / f"Voice-{idx}.mp3"
        frame = FRAMES_DIR / f"frame-{idx:02d}.png"
        if not mp3.exists():
            sys.exit(f"Missing voice: {mp3}")
        clip = CLIPS_DIR / f"clip-{idx:02d}.mp4"
        print(f"[{idx}/{len(SLIDES)}] building {clip.name} ...")
        build_slide_clip(idx, frame, mp3, clip)
        total += probe_duration(clip)
        clip_paths.append(clip)

    print(f"\nTotal runtime before final stitch: {total:.1f}s  (target {TARGET_TOTAL_SEC}s)")

    # ---- Step 3: pad to 16:00 if short ----------------------------------
    if total < TARGET_TOTAL_SEC - 5:
        pad = TARGET_TOTAL_SEC - total
        print(f"Padding final clip with {pad:.1f}s to hit 16:00")
        last = clip_paths[-1]
        padded = CLIPS_DIR / "clip-40-padded.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(last),
            "-vf", f"tpad=stop_mode=clone:stop_duration={pad}",
            "-af", f"apad=pad_dur={pad}",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            str(padded),
        ], check=True)
        clip_paths[-1] = padded

    # ---- Step 4: concat -------------------------------------------------
    print("Concatenating ...")
    concat_clips(clip_paths, FINAL_VIDEO)
    print(f"\nDONE -> {FINAL_VIDEO}")
    print(f"(Intermediate clips and frames kept in _clips/ and _frames/ -- delete when happy.)")


if __name__ == "__main__":
    main()
