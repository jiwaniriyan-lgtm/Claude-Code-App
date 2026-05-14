# THE CONCRETE CADILLAC — LONG-FORM PRODUCTION PACKAGE

A self-contained content kit for producing a **16-minute long-form** video about a dramatized heist crew that scoops an armored truck into a cement mixer drum — and then realizes the drum was already full of wet concrete.

---

## FOLDER STRUCTURE
```
New Story/
└── Long_Form/
    ├── Script/
    │   └── story_script_long.md             ← 22-scene, ~16 min script
    ├── Character_Sheets/
    │   └── character_sheets.md              ← Lock characters & settings
    ├── Image_Prompts/
    │   └── higgsfield_image_prompts_long.md ← 30 image prompts (higgsfield.ai)
    ├── Video_Prompts/
    │   └── higgsfield_video_prompts_long.md ← 30 image-to-video motion prompts
    ├── Voice_Prompts/
    │   └── elevenlabs_voice_prompts_long.md ← Full narration, scene-by-scene, with SSML
    └── Production_Notes/
        └── README.md                         ← (you are here)
```

---

## RECOMMENDED PRODUCTION ORDER

1. **Lock the script** → `Script/story_script_long.md`
2. **Read the character sheets** → `Character_Sheets/character_sheets.md`
   - These descriptions go INTO every image prompt — consistency is everything for a 16-min film
3. **Generate the 30 stills in higgsfield.ai** → use `Image_Prompts/higgsfield_image_prompts_long.md`
   - Save as `IMG_01.png` … `IMG_30.png`
   - **Tip:** generate IMG_02 (Doc) first → save his face → use higgsfield's **Soul ID** / **Character Reference** to lock Doc across IMG_03, 04, 06, 07, 09, 12, 15, 18, 19, 22, 26, 28
   - Repeat for Mick, Cricket, Tommy
4. **Generate the 30 motion clips** via higgsfield image-to-video → use `Video_Prompts/higgsfield_video_prompts_long.md`
   - Save as `VID_01.mp4` … `VID_30.mp4`
5. **Generate 22 voice scenes** in ElevenLabs → use `Voice_Prompts/elevenlabs_voice_prompts_long.md`
   - Save as `VO_S01.wav` … `VO_S22.wav`
   - Generate scene-by-scene, NOT all at once (long-form drift)
6. **Edit + assemble** in DaVinci Resolve / Premiere / CapCut Pro:
   - V1: video clips
   - V2: B-roll, text overlays (timestamps, names, court documents)
   - A1: voice narration
   - A2: SFX (mixer rumble, fluorescent buzz, courtroom murmur, sirens, helicopters)
   - A3: cinematic underscore (ducked during punchlines)
7. **Export 16:9 at 1920×1080 or 4K H.264 30fps**
   - YouTube: -16 LUFS audio
   - Spotify Video: -14 LUFS audio

---

## VISUAL STYLE PROFILE (LOCKED — applied to every image prompt)
- Digital comic / graphic novel aesthetic, semi-realistic, NOT photorealistic
- Clean stylized linework, smooth skin, idealized features
- Cinematic directional lighting, soft diffused on faces
- Shallow depth of field, sharp subjects, softened backgrounds
- 16:9 horizontal cinematic composition, centered framing
- High detail faces/props, moderate backgrounds, clean environments
- Dual color treatment: rich saturated jewel tones OR desaturated grayscale with vignette

---

## TIMING MAP (script ↔ image ↔ video)

| Scene | Script Time | Images | Videos |
|-------|-------------|--------|--------|
| 1 Cold open | 0:00 – 0:35 | IMG_01 | VID_01 |
| 2 Meet Doc | 0:35 – 1:20 | IMG_02 | VID_02 |
| 3 The idea | 1:20 – 2:00 | IMG_03 | VID_03 |
| 4 Recruit | 2:00 – 2:50 | IMG_04, 05, 06 | VID_04, 05, 06 |
| 5 Practice | 2:50 – 3:40 | IMG_07, 08 | VID_07, 08 |
| 6 Night before | 3:40 – 4:25 | IMG_09, 10 | VID_09, 10 |
| 7 Warning | 4:25 – 5:00 | (B-roll cuts) | (extend VID_10) |
| 8 Tuesday | 5:00 – 5:45 | IMG_11 | VID_11 |
| 9 Approach | 5:45 – 6:25 | IMG_12, 13 | VID_12, 13 |
| 10 Scoop | 6:25 – 7:15 | IMG_14, 15 | VID_14, 15 |
| 11 Getaway | 7:15 – 8:00 | IMG_16, 17 | VID_16, 17 |
| 12 Realization | 8:00 – 9:00 | IMG_18, 19, 20 | VID_18, 19, 20 |
| 13 Hose fight | 9:00 – 9:50 | IMG_21, 22 | VID_21, 22 |
| 14 Calm guards | 9:50 – 10:30 | IMG_23 | VID_23 |
| 15 Perimeter | 10:30 – 11:15 | IMG_24 | VID_24 |
| 16 Tommy choice | 11:15 – 12:00 | IMG_25 | VID_25 |
| 17 Doc realizes | 12:00 – 12:45 | IMG_26 | VID_26 |
| 18 Arrest | 12:45 – 13:30 | IMG_27 | VID_27 |
| 19 Courtroom | 13:30 – 14:15 | IMG_28 | VID_28 |
| 20 Punchline | 14:15 – 15:00 | IMG_29 | VID_29 |
| 21 Tag | 15:00 – 15:45 | (cycle IMG_22, 26, 28 callbacks) | (extend VID_29) |
| 22 Outro | 15:45 – 16:00 | IMG_30 | VID_30 |

---

## TOOLS

| Asset | Tool | Notes |
|-------|------|-------|
| Stills | higgsfield.ai | 16:9, paste prompts as-is, use Character Reference / Soul ID |
| Motion | higgsfield.ai (image-to-video) | Feed each still as start frame |
| Voice | ElevenLabs | `eleven_multilingual_v2`, voice "Adam" (or test alternates) |
| SFX | epidemicsound / freesound.org | mixer rumble, fluorescent buzz, sirens, courtroom |
| Music | epidemicsound / artlist | cinematic true-crime suspense (slow tempo, ~70 BPM) |
| Edit | DaVinci Resolve / Premiere / CapCut Pro | 1920×1080 or 4K, 30fps |

---

## STYLE CONSISTENCY CHECKS
Before exporting the final video, verify:
- [ ] All 30 images share the same comic/graphic-novel rendering
- [ ] Doc looks like the same person in every shot he appears in
- [ ] Mick looks like the same person in every shot
- [ ] Cricket looks like the same person in every shot
- [ ] Tommy looks like the same person in every shot
- [ ] The red Mack cement mixer matches across IMG_07, 08, 11, 13, 15, 17, 18, 24, 29
- [ ] The navy Brinks F-750 matches across IMG_13, 15, 16, 20, 23
- [ ] Narrator voice volume is consistent across all 22 scenes (±1 dB)

---

## DISCLAIMER
"The Concrete Cadillac" is a **dramatized, fictional story** written in the style of true-crime narration. Names, dates, agencies, the heist itself, and the evidence inventory are all invented. Any resemblance to real persons, real crimes, real Brinks employees, or real federal investigations is coincidental.
