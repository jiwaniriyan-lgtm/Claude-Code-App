# THE CONCRETE CADILLAC — Final Video Build Kit

This folder produces a single MP4 you can drop into **CapCut**, then layer real voice and auto-generate captions.

## ⚙️ What's here
```
Final_Video/
├── audio_placeholder/        ← 22 placeholder MP3s (espeak-ng, robotic)
│   ├── VO_S01.mp3  …  VO_S22.mp3
├── build_scripts/
│   ├── scene_narration.py    ← regenerate placeholder audio (already run)
│   └── build_video.sh        ← Mac assembly script (RUN THIS)
├── images/                   ← created by build_video.sh (curl-downloaded from higgsfield)
├── output/                   ← created by build_video.sh → concrete_cadillac.mp4
└── README.md                 ← (you are here)
```

---

## 🚀 Build the video on your Mac (5 minutes)

### Prerequisites
```bash
brew install ffmpeg     # one-time install
```

### Run the build
```bash
cd ~/path/to/Claude-Code-App
git pull origin claude/counterfeit-story-media-iBCLR
cd "New Story/Long_Form/Final_Video/build_scripts"
chmod +x build_video.sh
./build_video.sh
```

### What it does
1. Downloads all 30 higgsfield images → `images/`
2. Builds each scene as a slideshow clip with slow Ken Burns zoom, fade-in/out
3. Muxes the per-scene WAV audio onto each clip
4. Concatenates all 22 scenes → `output/concrete_cadillac.mp4`

**Output:** a single MP4, ~21 min, 1920×1080, 30fps, with placeholder narration synced to image cuts.

---

## 🎬 In CapCut

1. **Open CapCut** → New Project → Import `output/concrete_cadillac.mp4`
2. **(Recommended) Replace the audio:**
   - In ElevenLabs, generate 22 high-quality narration clips using the scripts in `../Voice_Prompts/elevenlabs_voice_prompts_long.md` (voice: `Adam`, settings already there)
   - Right-click the video clip → **Separate Audio**
   - Mute or delete the placeholder audio track
   - Drag your 22 ElevenLabs WAVs onto the audio timeline, sync by scene markers
3. **Auto-generate captions:**
   - Click **Text** → **Auto Captions** → Select track → Choose language → Generate
   - CapCut will transcribe automatically with timing
4. **Style the captions:**
   - Pick a TikTok / YouTube Shorts caption style
   - Position bottom-center, large font, with shadow
5. **Add SFX / music** (optional, recommended):
   - cement mixer rumble (-12dB) during scenes 8–11
   - fluorescent buzz (-18dB) during warehouse scenes
   - courtroom murmur (-18dB) during scene 19
   - underscore: slow cinematic true-crime track at -22dB throughout, duck during punchlines
6. **Export:** 1080p H.264, 30fps, target -16 LUFS for YouTube / -14 LUFS for Spotify Video

---

## 📋 Scene → Image → Audio map

| Scene | Audio | Image(s) | Duration (placeholder) |
|-------|-------|----------|------------------------|
| 1  | VO_S01.mp3 | IMG_01 | 32s |
| 2  | VO_S02.mp3 | IMG_02 | 68s |
| 3  | VO_S03.mp3 | IMG_03 | 51s |
| 4  | VO_S04.mp3 | IMG_04, 05, 06 | 57s |
| 5  | VO_S05.mp3 | IMG_07, 08 | 63s |
| 6  | VO_S06.mp3 | IMG_09 | 53s |
| 7  | VO_S07.mp3 | IMG_10 | 39s |
| 8  | VO_S08.mp3 | IMG_11 | 66s |
| 9  | VO_S09.mp3 | IMG_12, 13 | 44s |
| 10 | VO_S10.mp3 | IMG_14, 15 | 59s |
| 11 | VO_S11.mp3 | IMG_16, 17, 18 | 69s |
| 12 | VO_S12.mp3 | IMG_19, 20 | 67s |
| 13 | VO_S13.mp3 | IMG_21 | 64s |
| 14 | VO_S14.mp3 | IMG_22, 23 | 53s |
| 15 | VO_S15.mp3 | IMG_24 | 64s |
| 16 | VO_S16.mp3 | IMG_25 | 58s |
| 17 | VO_S17.mp3 | IMG_26 | 59s |
| 18 | VO_S18.mp3 | IMG_27 | 85s |
| 19 | VO_S19.mp3 | IMG_28 | 72s |
| 20 | VO_S20.mp3 | IMG_29 | 77s |
| 21 | VO_S21.mp3 | IMG_29 (callback) | 75s |
| 22 | VO_S22.mp3 | IMG_30 | 10s |
| **Total** | | **~21 min** (espeak pace) — ~16-18 min with ElevenLabs |

---

## ⚠️ Important Notes

- **Placeholder audio is robotic** (espeak-ng, fully offline). It's there to give you scene timing. Replace with ElevenLabs `Adam` voice (or your preferred narrator) for the final cut.
- **The image URLs are direct CloudFront** from higgsfield.ai. They'll stay live as long as your higgsfield account does. If you want a permanent local copy, the script already downloads them to `images/`.
- **Total build time:** ~3-5 min on a modern Mac. Most of that is downloading images + ffmpeg encoding.
- If a download fails (CDN hiccup), just re-run the script — it skips files already present.

---

## 🛠️ Troubleshooting

**`ffmpeg: command not found`** → `brew install ffmpeg`

**`curl: command not found`** → preinstalled on macOS; if missing, `brew install curl`

**Image fails to download** → re-run the script (idempotent). If persistent, copy the URL from the script and paste in browser to test.

**Audio out of sync with images** → CapCut handles this perfectly when you replace audio — just snap each ElevenLabs clip to its scene boundary.

**Captions wrong** → in CapCut, double-click any caption to edit. For consistent style, set caption style once then apply to all.
