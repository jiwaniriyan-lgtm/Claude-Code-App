# THE $18 BILL HEIST — PRODUCTION PACKAGE

A self-contained content kit for producing a short-form video about the (loosely true) story of a counterfeit ring that printed $18 bills.

---

## FOLDER STRUCTURE
```
New Story/
├── Script/
│   └── story_script.md            ← Full 9-scene script (~90 sec)
├── Image_Prompts/
│   └── higgsfield_image_prompts.md ← 10 image prompts (higgsfield.ai)
├── Video_Prompts/
│   └── higgsfield_video_prompts.md ← 10 video prompts (image-to-video)
├── Voice_Prompts/
│   └── elevenlabs_voice_prompts.md ← Narration + voice settings (ElevenLabs)
└── Production_Notes/
    └── README.md                   ← (you are here)
```

---

## RECOMMENDED PRODUCTION ORDER

1. **Lock the script** → `Script/story_script.md`
2. **Generate the 10 stills** in higgsfield.ai → `Image_Prompts/`
   - Save them as `IMG_01.png` … `IMG_10.png`
3. **Feed each still into higgsfield image-to-video** → `Video_Prompts/`
   - Save as `VID_01.mp4` … `VID_10.mp4`
4. **Generate narration** in ElevenLabs → `Voice_Prompts/`
   - Save as `VO_01.wav` … `VO_09.wav` (one per line)
5. **Edit in CapCut / Premiere / DaVinci**
   - Drop video clips on V1
   - Drop voice clips on A1
   - Add SFX on A2 (cha-ching, fluorescent buzz, sirens, fire crackle, gavel)
   - Add a low-volume cinematic underscore on A3 (true-crime style)
6. **Export 16:9** at 1920×1080 or 4K, H.264, 30fps

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

## TOOLS
| Asset | Tool | Notes |
|-------|------|-------|
| Stills | higgsfield.ai | 16:9, use full prompts as-is |
| Motion | higgsfield.ai (image-to-video) | Feed each generated still as start frame |
| Voice | ElevenLabs | `eleven_multilingual_v2`, voice "Adam" or custom |
| SFX | freesound.org / epidemicsound | Light layer for realism |
| Music | epidemicsound / artlist | True-crime / cinematic suspense |
| Edit | CapCut / Premiere / DaVinci Resolve | 1920×1080 or 4K, 30fps |

---

## DISCLAIMER
The "$18 bill counterfeit ring" is a dramatized story. Real-world counterfeiting cases have featured comically obvious mistakes (wrong denominations, misspellings, wrong presidents), but specific names, dates, and dialogue here are stylized for narrative impact. Treat as entertainment, not journalism.
