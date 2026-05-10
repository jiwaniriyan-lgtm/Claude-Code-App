# 📱 CAPCUT ASSEMBLY GUIDE
## "The Brutal Truth About Why Investors Fail in 2026"

**Goal:** Take the 40 generated assets + ElevenLabs voiceover and produce one final 15-min MP4, ready for YouTube upload.

**Estimated time:** 2–3 hours (most spent on cuts, not setup)
**Cost:** $0 (CapCut is free — desktop or mobile)
**Difficulty:** Beginner — no prior editing skills needed

---

# 🚀 BEFORE YOU START — DOWNLOAD EVERYTHING

Create a folder on your desktop called `INVESTORS_VIDEO/` with these subfolders:

```
INVESTORS_VIDEO/
├── 01_thumbnails/      ← 4 PNG files
├── 02_broll_images/    ← 24 PNG files
├── 03_broll_videos/    ← 12 MP4 files
├── 04_voiceover/       ← 1 MP3 from ElevenLabs (you generate this)
├── 05_music/           ← 1 royalty-free track (your choice)
└── 06_export/          ← final MP4 lands here
```

### Step 0a — Download all 40 assets
All URLs are in `mvp/Why_Most_Investors_Fail_ASSET_MANIFEST.md`. On Mac/PC, right-click each link → "Save link as…" into the right folder. Or use this terminal one-liner if you're comfortable:

```bash
# Run from inside INVESTORS_VIDEO/03_broll_videos/
curl -O https://d8j0ntlcm91z4.cloudfront.net/.../VID-01.mp4
# (paste each MP4 URL one by one)
```

### Step 0b — Render the voiceover in ElevenLabs
1. Go to https://elevenlabs.io → Speech Synthesis
2. Voice: **Adam** | Model: **eleven_multilingual_v2**
3. Settings: Stability `0.45`, Similarity `0.75`, Style `0.50`, Speaker Boost ON
4. Paste the full SSML script from `Why_Most_Investors_Fail_FULL_VIDEO_PACKAGE.md` (Section 3)
5. Click Generate → download MP3 → save as `04_voiceover/VO_full.mp3`

### Step 0c — Pick background music
Free options: **YouTube Audio Library** (filter: cinematic, no attribution required)
Recommended track vibe: cinematic, light tension, ~90 BPM, instrumental
Save as `05_music/bg_music.mp3`

---

# 1️⃣ CAPCUT — PROJECT SETUP (5 min)

1. Open CapCut → **New Project**
2. Click ⚙️ icon → set:
   - **Resolution:** 1920×1080 (Full HD)
   - **Frame rate:** 30 fps (or 24 fps if you prefer cinematic)
   - **Aspect ratio:** 16:9
3. **Import** (Ctrl/Cmd+I) → select **all** files from `INVESTORS_VIDEO/` → done

You'll now see all 40+ assets in the **Media** panel on the left.

---

# 2️⃣ LAY DOWN THE VOICEOVER FIRST (anchor track)

This is the trick that makes everything else easy: **the voiceover dictates timing**, so we drop it in before any visuals.

1. Drag `VO_full.mp3` onto the timeline → it lands on **Audio Track 1**
2. Position it at `0:00`
3. Lock the track (🔒 icon on left of track) so you don't move it by accident

**Why this matters:** Now every B-roll cut snaps to a moment in the narration, not the other way around.

---

# 3️⃣ TIMELINE ASSEMBLY — segment by segment

> 💡 Drag each clip onto **Video Track 1**. When the script transitions to the next segment, drop the next clip at that exact timestamp. Trim with the **split tool** (S key) at the boundary.

## 🎬 SEGMENT-BY-SEGMENT DROP-IN MAP

| Time | What you say | Drop on Video Track | How long |
|---|---|---|---|
| **0:00–0:06** | "Did you know nearly 90% of individual investors fail…" | `VID-01.mp4` (worried investor dolly-in) | 6s |
| **0:06–0:12** | "What if I told you the reason might be simpler…" | `VID-02.mp4` (90% particle reveal) | 6s |
| **0:12–0:15** | "Stick around, because today…" | `IMG-01.png` (host close-up, hold) | 3s |
| **0:15–0:23** | "Welcome back to the channel…" | `VID-03.mp4` (office crane shot) | 8s |
| **0:23–0:45** | "If you're new here, I'm your guide…" | `IMG-03.png` → `IMG-04.png` (cut every 8s) | 22s |
| **0:45–1:00** | "But first, let's explore why so many people get it wrong." | `IMG-02.png` (90% stat plate, hold) | 15s |
| **1:00–1:30** | **SEGMENT 1 intro:** "Let's talk about emotions…" | `IMG-05.png` (panic seller still) | 30s |
| **1:30–1:36** | "In the world of investing, those emotional decisions…" | `VID-04.mp4` (frustrated at desk) | 6s |
| **1:36–2:10** | "Research shows fear and greed…" | `VID-05.mp4` (smoke metaphor) | 7s, then loop or hold last frame |
| **2:10–2:25** | "When the market dips, fear takes over…" | `IMG-07.png` (red ticker) | 15s |
| **2:25–2:50** | "On the flip side, during a market rally…" | `IMG-06.png` (split portrait) | 25s |
| **2:50–3:00** | "So how do we combat emotional decision-making?" | `IMG-08.png` (calm planner) | 10s |
| **3:00–3:15** | **SEGMENT 2:** "Next up — lack of research." | `IMG-09.png` (frustrated researcher) | 15s |
| **3:15–3:23** | "Picture this: you wouldn't buy a car…" | `VID-06.mp4` (research time-lapse) | 8s |
| **3:23–3:45** | "Statistics show over 50% of people invest based on tips…" | `IMG-10.png` (influencer warning) | 22s |
| **3:45–3:52** | "So here's a tip — take time to read up…" | `VID-07.mp4` (library push-in) | 7s |
| **3:52–4:10** | "Use online courses, webinars…" | `IMG-11.png` (books) | 18s |
| **4:10–5:00** | "Knowledge is power…" | `IMG-12.png` (data analyst) | 50s |
| **5:00–5:15** | **SEGMENT 3:** "The third big mistake — timing the market." | `IMG-13.png` (crystal ball) | 15s |
| **5:15–5:22** | "This is like predicting the weather…" | `VID-08.mp4` (glass orb storm) | 7s |
| **5:22–5:50** | "Many investors believe they can buy low and sell high…" | `IMG-14.png` (DCA chart) | 28s |
| **5:50–5:58** | "What if I told you investing regularly…" | `VID-09.mp4` (DCA animation) | 8s |
| **5:58–6:30** | "This strategy lets you build wealth…" | `IMG-15.png` (snowball) | 32s |
| **6:30–7:00** | "Remember — it's not about timing the market…" | Hold on `IMG-15.png` | 30s |
| **7:00–7:15** | **SEGMENT 4:** "Now let's talk diversification…" | `IMG-16.png` (eggs basket) | 15s |
| **7:15–7:22** | "But this strategy can be a recipe for disaster…" | `VID-10.mp4` (eggs tipping) | 7s |
| **7:22–7:50** | "Diversification reduces risk…" | `IMG-17.png` (basket flat-lay) | 28s |
| **7:50–8:30** | "Aim to spread investments across asset classes…" | `IMG-18.png` (asset triptych) | 40s |
| **8:30–9:00** | "So take a few moments to evaluate…" | Hold on `IMG-18.png` | 30s |
| **9:00–9:30** | **SEGMENT 5:** "Now let's get personal. Goals." | `IMG-19.png` (compass) | 30s |
| **9:30–10:00** | "Whether you're saving for retirement, a house…" | `IMG-20.png` (target with arrows) | 30s |
| **10:00–10:45** | "Write down your goals, track progress…" | `IMG-21.png` (notebook plan) | 45s |
| **10:45–11:00** | "Trust me — when you have a 'why'…" | Hold on `IMG-21.png` | 15s |
| **11:00–11:08** | **CLIMAX:** "Patience is your best friend…" | `IMG-22.png` (sapling) | 8s |
| **11:08–11:16** | "The stock market is like a garden…" | `VID-11.mp4` (money tree orchard) | 8s |
| **11:16–12:00** | "Many investors become impatient…" | `IMG-23.png` (long-term mountain chart) | 44s |
| **12:00–12:50** | "Historically, markets recover over time…" | Hold on `IMG-23.png` | 50s |
| **12:50–13:00** | "Investing is a marathon, not a sprint." | Slow zoom on `IMG-23.png` | 10s |
| **13:00–13:06** | **CTA:** "If you found value today…" | `VID-12.mp4` (host subscribe) | 6s |
| **13:06–14:00** | "Hit subscribe and ring the bell…" | `IMG-24.png` (host warm) | 54s |
| **14:00–15:00** | "Check out the next video on screen…" | Hold on `IMG-24.png` | 60s |

---

# 4️⃣ POLISH PASSES (do these in order — 30 min each)

## Pass 1 — Cuts on the beat
- Play through. Anywhere there's a long static image (>10s), **split it** (S key) and add a subtle Ken Burns zoom: select clip → right panel → **Animation** → "Zoom In Slow" or "Zoom Out Slow"

## Pass 2 — Transitions between segments
- Click the seam between two clips → **Transitions** menu → use:
  - **"Dip to Black"** (0.3s) at every major segment boundary (0:15, 1:00, 3:00, 5:00, 7:00, 9:00, 11:00, 13:00)
  - **"Cross Fade"** (0.2s) for image-to-image cuts within a segment

## Pass 3 — Text overlays (the chapter titles)
At each segment start, add a text overlay that pops on screen for ~3s:

| Time | Text |
|---|---|
| 1:00 | "MISTAKE #1: EMOTIONS" |
| 3:00 | "MISTAKE #2: LACK OF RESEARCH" |
| 5:00 | "MISTAKE #3: TIMING THE MARKET" |
| 7:00 | "MISTAKE #4: NO DIVERSIFICATION" |
| 9:00 | "MISTAKE #5: NO GOALS" |
| 11:00 | "THE ANTIDOTE: PATIENCE" |

CapCut → **Text** tab → "Default" → font: **Impact** or **Bebop**, 80pt, white with black drop shadow → animate in: "Pop In", animate out: "Slide Out"

## Pass 4 — Background music
1. Drag `bg_music.mp3` onto **Audio Track 2**
2. Lower volume to **15%** (so it sits under the voiceover)
3. Add **fade-in** (1s) at start and **fade-out** (2s) at end
4. If track ends before 15:00, copy and paste another instance to fill

## Pass 5 — Audio polish
- Click voiceover track → **Audio** tab → enable:
  - **Noise Reduction:** Low
  - **Voice Enhance:** ON
  - **Volume:** boost to +3dB if voice sounds quiet vs music

## Pass 6 — End screen (last 20 seconds)
At 14:40, add:
- A small thumbnail of your "next video" in the lower-left (use any of the unused IMG-XX as placeholder)
- A "SUBSCRIBE" text in lower-right with a pulsing animation

---

# 5️⃣ EXPORT SETTINGS

CapCut → **Export** button (top-right):

| Setting | Value |
|---|---|
| Resolution | 1080p |
| Frame Rate | 30 fps |
| Bitrate | **High** (or custom 12 Mbps) |
| Format | MP4 |
| Codec | H.264 |

Click **Export** → wait ~5–10 min (depends on your CPU) → file lands in `06_export/Investors_Final.mp4` ✅

---

# 6️⃣ UPLOAD TO YOUTUBE

1. youtube.com → **Create** → **Upload Video**
2. Drop `Investors_Final.mp4`
3. **Title:** `The Brutal Truth About Why Investors Fail in 2026` (vidIQ scored 80/100)
4. **Description:** copy from `Why_Most_Investors_Fail_FULL_VIDEO_PACKAGE.md` Section 6
5. **Tags:** copy from same section
6. **Thumbnail:** upload your edited THUMB-1 with text overlay
7. **Visibility:** Schedule for the next Tuesday or Thursday at 2 PM in your audience's timezone (highest CTR windows for finance content)
8. **Pinned comment:** post the prompt comment from Section 6 immediately after publishing

---

# ⏱️ TIME BUDGET

| Phase | Time |
|---|---|
| Step 0 — download + voiceover render | 30 min |
| Step 1 — project setup | 5 min |
| Step 2 — voiceover anchor | 5 min |
| Step 3 — timeline assembly | 60 min |
| Step 4 — polish passes (1–6) | 60 min |
| Step 5 — export | 10 min |
| Step 6 — YouTube upload | 15 min |
| **TOTAL** | **~3 hours** |

---

# 🆘 TROUBLESHOOTING

**"My voiceover is longer/shorter than the script timing."**
→ ElevenLabs pace varies. Don't fight it — let the voiceover dictate timing and stretch/shrink B-roll to match. The minute-marks above are a guide, not gospel.

**"A clip is shorter than I need."**
→ Right-click → **Freeze Frame** to extend the last frame, or duplicate the clip and reverse one copy for a "boomerang" loop.

**"Audio sounds muddy."**
→ Music volume too high. Drop background music to 10% and re-export.

**"YouTube flagged my thumbnail."**
→ The split-screen one is safe. If you used the panic-face thumbnail, soften the red and add a smile/calm element on the right side.

---

**That's it.** Follow this top-to-bottom and you'll have a finished, upload-ready 15-minute YouTube video by tonight.
