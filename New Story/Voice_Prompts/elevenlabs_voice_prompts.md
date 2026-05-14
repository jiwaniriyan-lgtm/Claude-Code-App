# ELEVENLABS — VOICE PROMPTS
### Project: "The $18 Bill Heist"

**PLATFORM:** ElevenLabs (TTS / Voice Design / Voice Cloning)
**RECOMMENDED MODEL:** `eleven_multilingual_v2` (best emotional range) or `eleven_turbo_v2_5` (faster, near-equal quality)

---

## RECOMMENDED VOICE PROFILES (PICK ONE)

### Option A — "The Smirking Narrator" (PRIMARY RECOMMENDATION)
- **ElevenLabs Library Voice:** `Adam`, `Arnold`, or `Antoni` (deep male, dry)
- **Style:** Netflix true-crime narrator with a knowing smirk. Slightly amused. Never breaks. Almost bored at how dumb the criminals were.
- **Voice Design Prompt (if creating custom):**
  > "A deep, smooth, slightly raspy American male voice in his late 30s. Confident, dry, and faintly amused — like a true-crime documentary host who has seen it all. Tone is calm and measured with an undertone of sarcastic disbelief. Pacing is unhurried. Mid-range pitch with warm gravel."

### Option B — "The Hyped Storyteller"
- **ElevenLabs Library Voice:** `Josh` or `Sam`
- **Style:** Punchier, faster, TikTok-energy. Good if you want viral-snappy.
- **Voice Design Prompt:**
  > "An energetic, punchy American male voice in his late 20s. Confident, fast-paced, conversational with sharp comedic timing. Slight smirk in the delivery. Mid-to-high pitch, crisp articulation, slight street-smart edge."

### Option C — "The Deadpan Female Narrator"
- **ElevenLabs Library Voice:** `Rachel` or `Domi`
- **Style:** Dry, deadpan female delivery — comedy contrast.
- **Voice Design Prompt:**
  > "A calm, dry, deadpan American female voice in her early 30s. Smooth mid-low pitch, unhurried pacing, with subtle sarcasm woven into every line. Sounds like a podcast host who finds everything mildly ridiculous."

---

## ELEVENLABS VOICE SETTINGS (RECOMMENDED)

| Setting | Value | Why |
|---------|-------|-----|
| **Stability** | 35–45 | Lower = more emotional/dynamic delivery |
| **Similarity Boost** | 75–85 | Keep voice consistent across clips |
| **Style Exaggeration** | 25–40 | Adds the "smirk" without overdoing it |
| **Speaker Boost** | ON | Cleaner, more present audio |
| **Model** | eleven_multilingual_v2 | Best for nuanced narration |

---

## FULL NARRATION SCRIPT — WITH SSML / DELIVERY CUES
*(Paste each block separately into ElevenLabs for best per-line control. Use `<break time="0.5s" />` tags for pacing — ElevenLabs supports basic SSML.)*

---

### LINE 01 — HOOK (Scene 1)
**Delivery:** Calm, dry, conspiratorial. Hit "eighteen-dollar bills" with a tiny pause before it.
> "In 2007, a counterfeit ring got caught… <break time="0.6s" /> because they printed <break time="0.3s" /> eighteen-dollar bills."

---

### LINE 02 — MEET THE CREW (Scene 2)
**Delivery:** Dry, listing tone. Slight smirk on "flawless".
> "Meet the crew. <break time="0.4s" /> Three guys. <break time="0.3s" /> One printer. <break time="0.4s" /> And a plan so flawless… <break time="0.5s" /> they forgot the United States doesn't make eighteen-dollar bills."

---

### LINE 03 — THE PLAN (Scene 3)
**Delivery:** Mock-instructional. Land "weird" with comedic timing.
> "Their strategy? <break time="0.4s" /> Skip the boring fives, tens, and twenties. <break time="0.5s" /> Go straight for the eighteen — <break time="0.3s" /> because nobody would suspect a number that weird."

---

### LINE 04 — GAS STATION (Scene 4)
**Delivery:** Build suspense. Drop voice slightly on the clerk's question — almost whispered.
> "Their first stop? A gas station. <break time="0.5s" /> The clerk took one look, blinked twice, <break time="0.4s" /> and asked the question that ended the entire operation: <break time="0.7s" /> Sir… what is this?"

---

### LINE 05 — THE PANIC (Scene 5)
**Delivery:** Fast clip on the action verbs, then slow down on the punchline list.
> "He ran. <break time="0.3s" /> He left a trail. <break time="0.4s" /> A trail of evidence with his fingerprints, <break time="0.3s" /> his face on CCTV, <break time="0.3s" /> and an address printed on the receipt he forgot to grab."

---

### LINE 06 — THE BUST (Scene 6)
**Delivery:** Steady, factual. The repetition at the end is the joke — let it land.
> "Within forty-eight hours, the Secret Service was at the door. <break time="0.5s" /> The printer was still running. <break time="0.4s" /> Still printing. <break time="0.4s" /> Still wrong."

---

### LINE 07 — COURTROOM (Scene 7)
**Delivery:** Drop into the judge's voice impression — dry, paternal, exasperated.
> "In court, the judge held up the evidence and asked the only question that mattered: <break time="0.6s" /> Did none of you… <break time="0.4s" /> check?"

---

### LINE 08 — MUSEUM PUNCHLINE (Scene 8)
**Delivery:** Reflective, slower. Like closing a documentary.
> "Today, that bill hangs in a training museum — <break time="0.4s" /> a permanent reminder that crime doesn't pay… <break time="0.6s" /> especially when your denomination doesn't exist."

---

### LINE 09 — CTA / OUTRO (Scene 9)
**Delivery:** Smirk turned all the way up. Sign-off energy.
> "Follow — <break time="0.3s" /> because somewhere out there… <break time="0.5s" /> someone's printing twenty-three-dollar bills <break time="0.3s" /> right now."

---

## CHARACTER VOICES (OPTIONAL — FOR EXTRA POLISH)

### Voice: The Gas Station Clerk
- **Voice:** `Charlie` or any older neutral male
- **Line:** "Sir… what is this?"
- **Settings:** Stability 50, Similarity 80, Style 30
- **Delivery:** Confused, slow, slightly Midwestern.

### Voice: The Judge
- **Voice:** `Daniel` or any deeper authoritative male
- **Line:** "Did none of you… check?"
- **Settings:** Stability 55, Similarity 85, Style 40
- **Delivery:** Dry, paternal, slightly disappointed.

---

## EXPORT WORKFLOW
1. Generate each line individually in ElevenLabs (lets you re-roll just the bad ones).
2. Export as **MP3 192kbps** or **WAV 44.1kHz** (WAV preferred for editing).
3. Import to your video editor (CapCut / Premiere / DaVinci) and align to the scene timecodes in `Script/story_script.md`.
4. Add room tone / SFX layer underneath (cash register, fluorescent buzz, courtroom, fire crackle).
5. Bus the voice through a light compressor (ratio 3:1, threshold -18dB) and a high-pass at 80Hz for that "podcast" weight.

---

## QUICK-REFERENCE TABLE
| # | Line | Mood | Delivery Speed |
|---|------|------|----------------|
| 01 | Hook | Conspiratorial | Slow |
| 02 | Crew intro | Dry list | Medium |
| 03 | The plan | Mock-instructional | Medium |
| 04 | Gas station | Suspense → whisper | Slow |
| 05 | Panic run | Fast → slow | Fast then medium |
| 06 | The bust | Factual deadpan | Medium |
| 07 | Courtroom | Judge impression | Slow |
| 08 | Museum | Reflective | Slow |
| 09 | CTA | Smirking sign-off | Medium |
