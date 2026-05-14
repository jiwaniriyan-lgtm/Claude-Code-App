# ELEVENLABS — VOICE PROMPTS (Long-Form)
### Project: "The Concrete Cadillac" (~16 min)

**PLATFORM:** ElevenLabs
**RECOMMENDED MODEL:** `eleven_multilingual_v2` (best emotional range for long-form narration)
**ALTERNATE:** `eleven_turbo_v2_5` (faster generation, similar quality, slightly less expressive)

---

## PRIMARY NARRATOR — "THE SMIRKING DOCUMENTARIAN"

### Recommended Library Voice
`Adam` — deep American male, smooth, slight gravel. Perfect default.
**Alternates:** `Brian`, `Arnold`, `Antoni` (test all four — same 30-second seed line — pick what hits)

### Voice Design Prompt (if creating a custom voice)
> "A deep, smooth, slightly gravel-textured American male voice, age 38–42. Confident, dry, and quietly amused — like a true-crime documentary host who has narrated this kind of story so many times he can't help smirking. Pacing is unhurried, measured. Articulation is crisp but never theatrical. Mid-range pitch with warm chest resonance. Subtle smile-in-voice on punchlines. No vocal fry. No NPR softness — this is closer to a late-night HBO doc narrator."

### Recommended ElevenLabs Settings
| Setting | Value | Why |
|---------|-------|-----|
| **Stability** | 40 | Allows the smirk and pacing variation |
| **Similarity Boost** | 80 | Keeps voice consistent across all 22 scenes |
| **Style Exaggeration** | 30 | Adds dry comedic timing without overdoing it |
| **Speaker Boost** | ON | Cleaner low-end for the chest resonance |
| **Output Format** | MP3 192kbps OR WAV 44.1kHz | WAV for editing, MP3 for direct publish |

---

## CHARACTER VOICES (for in-scene dialogue cameos)

### DOC HALLORAN
- **Voice:** `Daniel` or `Roger` (mid-50s male, weathered, intelligent)
- **Settings:** Stability 50 / Similarity 80 / Style 25
- **Lines:** "Boys, we did it." / "Get the hose." / "I think we have a problem." / "Huh." / "No, Your Honor. It did not."
- **Delivery:** Confident, dry, slightly defeated by the end.

### MICK SALUZZI
- **Voice:** `Drew` or any deeper male, minimal range
- **Settings:** Stability 70 / Similarity 85 / Style 10
- **Lines:** "Okay." (the only word he says aloud in the script)
- **Delivery:** Flat, low, final.

### CRICKET BOUDREAUX
- **Voice:** `Sam` or `Ethan` with a SOUTHERN/CAJUN accent prompt
- **Settings:** Stability 35 / Similarity 75 / Style 50
- **Lines:** "Let's go cook a goose."
- **Delivery:** Bayou drawl, half-asleep confidence.

### TOMMY MARSH
- **Voice:** `Josh` or `Ethan` (late 20s male, clean)
- **Settings:** Stability 45 / Similarity 80 / Style 25
- **Lines:** "I'm sorry."
- **Delivery:** Quiet, sincere, no theatrics.

### RAYMOND CASTILLO (Brinks guard)
- **Voice:** `Bill` or `Daniel`
- **Settings:** Stability 55 / Similarity 80 / Style 20
- **Delivery:** Calm, professional, mildly inconvenienced.

### JUDGE ELEANOR FRASIER
- **Voice:** `Charlotte` or `Lily` (mature female, authoritative)
- **Settings:** Stability 60 / Similarity 85 / Style 25
- **Lines:** "Mr. Halloran. Did it ever — at any point during the eleven months you were planning this — occur to you to check what was inside the mixer?"
- **Delivery:** Dry, measured, paternal disappointment.

---

## NARRATION SCRIPT — SCENE-BY-SCENE
*(Paste each scene as a SEPARATE generation in ElevenLabs. Long-form pro tip: don't paste all 16 minutes as one prompt — the voice drifts. Generate per-scene, then concatenate in your editor.)*

**SSML supported:** `<break time="X.Xs" />` for pacing, `<emphasis>` for stress. Use sparingly.

---

### SCENE 1 — COLD OPEN (~35s)
**Tone:** Conspiratorial, slow, weighty.
> "There's a cement mixer sitting in an FBI evidence lot in Ohio. <break time="0.6s" /> It's been there since 2009. <break time="0.5s" /> The drum has never been opened. <break time="0.7s" /> And inside that drum — sealed in twelve tons of concrete — <break time="0.4s" /> is a 2008 Ford F-750 armored truck containing four-point-two million dollars in unmarked bills. <break time="1.0s" /> This is the story of how it got in there. <break time="0.5s" /> And why nobody — not the FBI, not the engineers, not the four men who put it there — <break time="0.5s" /> has ever been able to get it out."

---

### SCENE 2 — MEET DOC (~45s)
**Tone:** Wry character introduction. Smirk on the divorce line.
> "Every heist story starts with a guy who has too much time and not enough money. <break time="0.4s" /> This one starts with Eugene 'Doc' Halloran. <break time="0.3s" /> Fifty-two years old. Two-time felon. Three-time divorcé. <break time="0.5s" /> And — by his own estimation — 'the smartest man in Lorain County, Ohio,' <break time="0.4s" /> which is a claim that, depending on your standards, may or may not have ever been true. <break time="0.7s" /> Doc had a theory. <break time="0.3s" /> He'd been studying armored truck routes for eleven months. Every Tuesday morning, a Brinks F-750 left a regional bank at exactly 9:47 AM, hit the same five red lights in the same order, and arrived at a Federal Reserve drop point at 10:14. <break time="0.4s" /> Twenty-seven minutes. Five lights. Doc had timed it himself, in a Honda Civic, forty-three times. <break time="0.6s" /> He had identified the perfect light. He had identified the perfect window. <break time="0.4s" /> What he needed — and this is where things get interesting — was a way to make an armored truck disappear in ninety seconds, in broad daylight, in the middle of an intersection."

---

### SCENE 3 — THE IDEA (~40s)
**Tone:** Setup → punchline. Hit "thirty percent" with comic timing.
> "The idea came to him at a strip club in Cleveland — <break time="0.5s" /> which, statistically, is where about thirty percent of all American crime ideas come from. <break time="0.6s" /> He was watching a cement mixer rumble past the window. <break time="0.4s" /> And he had what he later described, in his recorded confession, as 'the cleanest thought of my entire life.' <break time="0.8s" /> The drum on a standard cement mixer is approximately eight feet wide and ten feet long. A Brinks F-750 armored truck — Doc had measured one in a parking lot, with a tape measure, while pretending to be lost — is seven feet four inches wide and just under twenty feet long. <break time="0.4s" /> The truck wouldn't fit nose-first. <break time="0.3s" /> But it would fit <emphasis>sideways.</emphasis> <break time="0.5s" /> Just barely. With the right approach angle. And the right ramp. <break time="0.6s" /> Doc spent the next three weeks designing the ramp."

---

### SCENE 4 — RECRUITING THE CREW (~50s)
**Tone:** Three quick character beats. Hit the Cricket DUI joke clean.
> "Doc needed three men. <break time="0.6s" /> He needed a driver who could handle a fully-loaded mixer truck at sixty miles an hour. That was Cricket Boudreaux — Louisiana-born, Cleveland-residing, fifteen DUIs, never crashed once. <break time="0.4s" /> Cricket said yes immediately. <break time="0.3s" /> Cricket said yes to everything immediately. <break time="0.4s" /> That's how Cricket ended up with fifteen DUIs. <break time="0.8s" /> He needed a muscle man — someone who could move a six-hundred-pound steel ramp into position in under twelve seconds. That was Mick Saluzzi. <break time="0.4s" /> Mick said three words during the entire recruitment meeting. <break time="0.4s" /> The third word was <emphasis>'okay.'</emphasis> <break time="0.8s" /> And he needed a fourth man. A lookout. A runner. Someone young, hungry, and replaceable. Doc found him at a Denny's in Sandusky. Tommy Marsh. Twenty-eight. Clean record. Eager. <break time="0.4s" /> Doc liked him immediately. <break time="0.6s" /> Doc should have liked him less."

---

### SCENE 5 — WAREHOUSE PRACTICE (~50s)
**Tone:** Factual, building momentum. Slow on the final "forty-one times."
> "For six weeks, in a rented warehouse outside Elyria, the crew practiced. <break time="0.6s" /> Doc built a plywood replica of a Brinks F-750. Mick and Cricket ran the scoop maneuver until they could do it in eighty-seven seconds with the lights off. Tommy ran the perimeter sweep until he could clear three city blocks in two minutes flat. <break time="0.7s" /> The plan was beautiful in its specifics. <break time="0.5s" /> At 9:51 AM, on a Tuesday, the Brinks truck would stop at the red light at the corner of Broadway and 28th. Cricket would already be there in the cement mixer, two cars behind. The light would turn green. Cricket would accelerate. Mick would deploy the ramp from the back of the mixer at exactly the moment of impact. The mixer would scoop the armored truck — sideways, at speed, into the open drum — and the drum would close, and Cricket would drive away. <break time="0.6s" /> Ninety seconds. Maybe less. <break time="0.7s" /> They practiced it forty-one times. <break time="0.5s" /> It worked forty-one times."

---

### SCENE 6 — THE NIGHT BEFORE (~45s)
**Tone:** Reflective, almost tender — then the final beat lands cold.
> "The night before the heist, the four men did what every crew in every heist movie has done since 'The Asphalt Jungle' in 1950. <break time="0.5s" /> They went their separate ways. They made peace with whoever they made peace with. They prepared. <break time="0.7s" /> Doc smoked four cigarettes on his porch and called his daughter, who didn't pick up. <break time="0.6s" /> Mick did three hundred pushups in his basement, drank a protein shake, and fell asleep on a weight bench. <break time="0.6s" /> Cricket drank a bottle of Wild Turkey in his '94 Camaro behind a Waffle House and woke up at 4 AM with no memory of the previous six hours, which, for Cricket, was Tuesday. <break time="0.8s" /> And Tommy Marsh sat on the edge of a motel bed in Avon, Ohio, and made a phone call. <break time="0.6s" /> The call lasted seventeen minutes. <break time="0.4s" /> The person on the other end of the call worked for the federal government."

---

### SCENE 7 — THE WARNING (~35s)
**Tone:** Cold, factual, withheld. End line is the gut-punch.
> "The ATF had been running Tommy Marsh as an undercover asset for nine months. He had been planted in a separate operation entirely — a stolen-firearms ring out of Toledo — but his handler had instructed him to take any side work that came his way, document it, and report. <break time="0.6s" /> The cement mixer plan was, by Tommy's own admission, <break time="0.3s" /> 'the dumbest thing I've ever been asked to participate in, and I've been asked to participate in some dumb things.' <break time="0.8s" /> The ATF made a decision that morning. <break time="0.4s" /> A decision that, in retrospect, the federal government has refused to discuss publicly. <break time="0.7s" /> They let the heist happen."

---

### SCENE 8 — TUESDAY MORNING (~45s)
**Tone:** Documentary procedural. Lean into the unfolding dread.
> "Tuesday, October 21st, 2008. <break time="0.4s" /> Sunrise at 7:43 AM. <break time="0.7s" /> The cement mixer — which they had stolen, three nights earlier, from a construction site in Avon Lake — pulled out of a Denny's parking lot at exactly 8:30 AM. <break time="0.4s" /> Cricket at the wheel, Mick in the passenger seat, Doc and Tommy following one block behind in a beige 1999 Pontiac Grand Am. <break time="0.6s" /> Everything was on schedule. <break time="0.7s" /> What none of them knew — what none of them <emphasis>could</emphasis> have known, because nobody on Doc's crew had ever, in their entire lives, operated a cement mixer for a legitimate purpose — was that a working cement mixer, on a Tuesday morning, in October, in Ohio, three days after being stolen from an active construction site… is almost certainly already full of something. <break time="0.6s" /> In this case, it was full of twelve tons of slow-set Portland cement. <break time="0.4s" /> Mixed Friday afternoon. Slow-rotating ever since. Still — technically — wet. <break time="0.6s" /> Nobody had checked. <break time="0.4s" /> Why would they."

---

### SCENE 9 — APPROACH (~40s)
**Tone:** Building. Beat by beat. Treat the time stamps like ticking.
> "9:46 AM. <break time="0.4s" /> The Brinks F-750 turned onto Broadway exactly on schedule, sixty-one seconds ahead of Doc's projected window. <break time="0.4s" /> Doc — watching from the Grand Am with a pair of military-surplus binoculars — would later describe this moment as the happiest of his entire adult life. <break time="0.7s" /> The light at Broadway and 28th turned red at 9:47:14. <break time="0.4s" /> The Brinks truck stopped at 9:47:18. <break time="0.4s" /> The cement mixer rolled up behind it at 9:47:23. <break time="0.7s" /> And at 9:47:24, Cricket Boudreaux turned to Mick Saluzzi and said the only line he had rehearsed for the entire operation: <break time="0.6s" /> 'Let's go cook a goose.'"

---

### SCENE 10 — THE SCOOP (~50s)
**Tone:** Climax. Speed up through the action. Slow down on Castillo's quote. Big drop on the final three sentences.
> "At 9:47:31, the light turned green. <break time="0.4s" /> Cricket floored it. <break time="0.6s" /> The cement mixer hit forty-eight miles an hour in under two seconds, struck the rear quarter of the Brinks truck at a calculated angle of seventeen degrees, and — exactly as Doc had drawn it on a strip club napkin nine months earlier — <emphasis>scooped</emphasis> the armored truck sideways into the open drum. <break time="0.8s" /> The two Brinks guards inside the F-750 would later testify that they did not, at first, understand what had happened. <break time="0.4s" /> One of them, the senior officer — a man named Raymond Castillo, twenty-two years with the company — described the experience as, quote, <break time="0.4s" /> 'being inside a tumbling washing machine, except the washing machine was also somehow a roller coaster, and also we were upside down, and also there was a lot of wet concrete.' <break time="0.9s" /> Because that's the thing. <break time="0.5s" /> The drum was already full. <break time="0.6s" /> And the drum was still rotating."

---

### SCENE 11 — THE GETAWAY (~50s)
**Tone:** Wild, almost slapstick — but the narrator never breaks. Hit "they had not done it" flat.
> "Cricket drove. <break time="0.4s" /> He drove the way Cricket Boudreaux drives everything — with absolute confidence and no awareness of his surroundings. <break time="0.4s" /> The mixer went seventy-two miles an hour through a residential zone. Wet concrete sloshed out the top of the drum in great gray waves, coating the road behind them, two parked cars, a mailbox, and a Yorkshire terrier named Buttons who survived but has, according to the owner, <break time="0.3s" /> 'never been the same.' <break time="0.8s" /> Inside the drum, the Brinks truck was rotating. <break time="0.3s" /> So were the two guards. <break time="0.3s" /> So was four point two million dollars in unmarked bills. <break time="0.3s" /> So was twelve tons of slowly hardening concrete. <break time="0.7s" /> They reached the warehouse in Elyria at 9:54 AM. Seven minutes after impact. Cricket parked the mixer. Mick killed the engine. The drum coasted to a stop with a deep, wet groan that Mick would later describe, in court, as 'the sound a planet would make if it was dying.' <break time="0.7s" /> Doc walked into the warehouse at 9:56 AM, beaming. <break time="0.4s" /> 'Boys,' he said. 'We did it.' <break time="0.7s" /> They had not done it."

---

### SCENE 12 — THE REALIZATION (~55s)
**Tone:** Beat-by-beat character work. Each man climbs the ladder, each reaction lands.
> "Doc climbed the ladder first. <break time="0.5s" /> He looked into the drum, expecting to see a sideways armored truck — battered, dented, but intact, sitting on a thin film of residual cement dust. <break time="0.7s" /> What he saw instead was a sideways armored truck — battered, dented, sitting in approximately ten and a half tons of wet, gray, slowly thickening Portland cement, with two visibly conscious Brinks guards waving at him from a small triangle of exposed windshield. <break time="0.8s" /> Doc stared. <break time="0.5s" /> Mick climbed the ladder behind him. Mick stared too. <break time="0.5s" /> Cricket climbed the ladder, lit a cigarette, looked into the drum, said 'huh,' and climbed back down. <break time="0.7s" /> Tommy stayed at the bottom of the ladder, because Tommy already knew what was in the drum, because Tommy had been told the night before, by his ATF handler, that the drum had been full of wet cement for approximately ninety-six hours. <break time="0.5s" /> Tommy did not climb the ladder. <break time="0.8s" /> Doc, at the top of the ladder, said the single most useful thing he would say in the entire operation: <break time="0.5s" /> 'Get the hose.'"

---

### SCENE 13 — FIGHT AGAINST THE CONCRETE (~50s)
**Tone:** Procedural tension. Numbers drop like sand through fingers.
> "Portland cement, once mixed with water, begins to set within forty-five minutes. It reaches what engineers call 'initial set' — when it can no longer be reshaped — at approximately three hours. By four hours, it has bonded chemically to anything it touches. By six hours, the bond is permanent. <break time="0.7s" /> The crew had — according to the timer on Mick's Casio watch, recovered from evidence and entered into the trial record — three hours and seventeen minutes. <break time="0.7s" /> They had two garden hoses, a shop vac, four five-gallon buckets, and a broken pressure washer Cricket had bought from a guy named Stinky. <break time="0.8s" /> They got approximately six hundred pounds of cement out in the first hour. <break time="0.5s" /> The drum contained twenty-four thousand pounds. <break time="0.7s" /> Doc, sitting on the warehouse floor at the two-hour mark, looked up at his crew — covered head to toe in gray sludge, exhausted, defeated — and said the second-most-useful thing he would say in the entire operation: <break time="0.5s" /> 'Boys, I think we have a problem.'"

---

### SCENE 14 — GUARDS STILL INSIDE (~40s)
**Tone:** Quiet comedy contrast. Calm domestic absurdity.
> "Meanwhile — inside the slowly-hardening drum — the two Brinks guards were, in their own quiet way, having the best day of their careers. <break time="0.7s" /> Raymond Castillo had radioed in their position at 9:51 AM, four minutes after impact, using the truck's panic transponder. The transponder, by federal regulation, broadcasts a continuous GPS signal that is, deliberately, impossible to disable from inside the vehicle. <break time="0.6s" /> The Brinks dispatch had picked up the signal immediately. <break time="0.4s" /> The Cleveland FBI had picked up the dispatch alert at 9:53. <break time="0.4s" /> The Ohio State Patrol had set up a perimeter at 9:59. <break time="0.7s" /> By the time Doc said 'I think we have a problem' — at the two-hour mark, sitting on the warehouse floor — the entire warehouse was already surrounded. <break time="0.7s" /> Doc just hadn't looked outside yet."

---

### SCENE 15 — THE PERIMETER (~45s)
**Tone:** Slow, weighty. Set up the climax.
> "The standoff lasted four hours. <break time="0.7s" /> Not because the FBI couldn't enter — they could have, at any time, with overwhelming force — but because the FBI was waiting for two things. <break time="0.7s" /> First, they were waiting for the concrete to harden completely. Because as long as the drum was wet, there was a non-zero chance that the crew could still drive away, or somehow extract the truck, or do any of the things Doc had spent eleven months planning to do. Once the concrete set, the truck was, in the words of the on-scene FBI tactical commander, <break time="0.4s" /> 'a paperweight inside a paperweight.' <break time="0.8s" /> And second, they were waiting for Tommy. <break time="0.7s" /> Tommy Marsh — twenty-eight, baby-faced, the new guy — was supposed to walk out of the warehouse at exactly 1:30 PM, hands up, on his own. That was the deal. That was always the deal. He would walk out, the FBI would move in, Tommy would keep his cover, and the operation would close cleanly. <break time="0.7s" /> Tommy did not walk out at 1:30."

---

### SCENE 16 — TOMMY'S CHOICE (~45s)
**Tone:** Reflective. Almost gentle.
> "Tommy stayed. <break time="0.6s" /> In his post-arrest interviews — and there were many of them — Tommy could never fully explain why. He had a clear path out. He had a federal handler waiting in a Crown Victoria two blocks away. He had immunity already signed in a sealed envelope in a Toledo field office. <break time="0.8s" /> The most honest thing Tommy ever said about it was this: <break time="0.4s" /> 'I just wanted to see what was going to happen.' <break time="0.8s" /> And what was going to happen — was nothing. <break time="0.4s" /> Nothing was going to happen. <break time="0.7s" /> The concrete was going to harden. The truck was going to be sealed inside it. The guards were going to be rescued through a six-hour cutting operation that would, eventually, require the partial demolition of the warehouse roof. The four crew members would be arrested without incident at 5:47 PM. <break time="0.7s" /> But Tommy stayed for one more hour. <break time="0.4s" /> Because he wanted to see Doc's face when Doc figured it out. <break time="0.6s" /> He waited a long time."

---

### SCENE 17 — DOC FIGURES IT OUT (~45s)
**Tone:** Quietest scene. Almost a whisper on Tommy's "I'm sorry."
> "Doc figured it out at 4:18 PM. <break time="0.6s" /> Not the concrete. He'd figured the concrete out hours ago. He figured <emphasis>Tommy</emphasis> out. <break time="0.7s" /> He looked at Tommy — clean, dry, not panicking, not exhausted, not gray — and he understood, the way a man understands his own death, that Tommy had known the whole time. <break time="0.8s" /> Doc didn't move. He didn't yell. He didn't reach for the .38 in his waistband. <break time="0.5s" /> He just looked at Tommy and said one word. <break time="0.6s" /> 'Huh.' <break time="0.9s" /> Cricket, asleep in the corner, woke up briefly, asked what time it was, and went back to sleep. <break time="0.5s" /> Mick, who had been silently watching this exchange, said nothing — because Mick said nothing about anything, ever. <break time="0.7s" /> And Tommy, the new guy, the baby-face, the ATF asset, said the last thing he would ever say to Doc Halloran, the smartest man in Lorain County, Ohio: <break time="0.6s" /> 'I'm sorry.' <break time="0.6s" /> He meant it."

---

### SCENE 18 — THE ARREST (~55s)
**Tone:** Procedural with comedy beats on Cricket. Long final image.
> "At 5:47 PM, the FBI's tactical team entered the warehouse through the loading dock door. <break time="0.6s" /> Doc was on the ground before the second flashbang went off. <break time="0.5s" /> Mick lay down on his own. <break time="0.5s" /> Cricket — and this is in the official tactical report — was <break time="0.3s" /> 'asleep, snoring, and required to be physically rolled onto his stomach.' <break time="0.8s" /> Tommy stood, hands up, and was 'arrested' for show. He was released at the booking station two hours later. He has not given a public interview since. <break time="0.8s" /> And the cement mixer — silent now, the drum fully set, twelve tons of concrete fused permanently around a 2008 Ford F-750 — sat in the warehouse for another three days, while the FBI tried to figure out what, exactly, to do with it. <break time="0.7s" /> They tried jackhammers. <break time="0.4s" /> They tried diamond saws. <break time="0.4s" /> They tried — and this is real, this is in the evidence inventory — a controlled water-jet cutting operation that took eleven hours and produced one (1) hole, approximately the size of a softball, through which a fiber-optic camera was inserted to confirm that the truck was, indeed, still inside, and that the money was, indeed, still inside the truck. <break time="0.8s" /> They closed the hole back up. <break time="0.7s" /> The truck has been inside the drum, inside the mixer, inside an FBI evidence lot, ever since."

---

### SCENE 19 — THE COURTROOM (~50s)
**Tone:** Build to the Judge's question. Drop Doc's reply flat.
> "The trial was short. <break time="0.6s" /> Doc Halloran pleaded guilty to armed robbery, kidnapping of the two Brinks guards, grand theft auto, possession of a stolen commercial vehicle, and — at the prosecutor's specific insistence — 'illegal disposal of approximately twenty-four thousand pounds of Portland cement in a manner inconsistent with EPA guidelines.' <break time="0.8s" /> He got nineteen years. <break time="0.4s" /> Mick Saluzzi got fifteen. <break time="0.4s" /> Cricket Boudreaux got eleven, plus, separately, a sixteenth DUI charge that the State of Ohio filed against him for operating a commercial vehicle under the influence during the commission of the heist itself. <break time="0.9s" /> When the judge — a woman named Eleanor Frasier, who had presided over Cuyahoga County criminal court for twenty-three years — read the sentences, she paused, looked at Doc over the top of her glasses, and asked him one question. <break time="0.7s" /> 'Mr. Halloran. Did it ever — at any point during the eleven months you were planning this — occur to you to check what was inside the mixer?' <break time="0.7s" /> Doc considered this carefully. <break time="0.5s" /> Then he said: <break time="0.4s" /> 'No, Your Honor. It did not.' <break time="0.8s" /> The judge nodded once and moved on."

---

### SCENE 20 — THE PUNCHLINE (~50s)
**Tone:** Reflective documentary close. Settle in.
> "The cement mixer is still there. <break time="0.7s" /> It's been moved twice — once in 2013, from an outdoor lot to a covered warehouse, after a particularly bad winter cracked the concrete by approximately three centimeters and the FBI panicked that the truck might somehow shift and damage the evidentiary integrity of the four point two million dollars inside, which they cannot reach. <break time="0.8s" /> Once again in 2019, to a permanent climate-controlled facility outside Cincinnati, where it now sits in a row of similarly-unsolvable evidence — a yacht with a hole in it, a 1976 Cadillac filled with concrete from a separate unrelated incident, and what appears to be a refrigerator nobody is willing to open. <break time="0.8s" /> Every two years, the FBI commissions a structural engineering review to determine whether modern cutting technology has advanced to the point where the truck can be safely extracted. Every two years, the engineers conclude that it cannot — not without destroying the truck, the money, or both. <break time="0.7s" /> The four point two million dollars is still inside. <break time="0.5s" /> It is, by a strict legal definition, still considered stolen. <break time="0.5s" /> It is also, by every practical definition, gone."

---

### SCENE 21 — THE TAG (~45s)
**Tone:** Where-are-they-now. Smirk on Tommy's promotion.
> "Doc Halloran was released on parole in October of 2024. He lives, as of this recording, in a trailer in Sandusky, Ohio. He has not given an interview. He has not written a book. He has not, as far as anyone knows, attempted any new crimes. <break time="0.8s" /> Mick Saluzzi was released in 2022. He works at a hardware store in Lorain. When asked, by a local reporter, what he thought about the cement mixer being moved to Cincinnati, Mick reportedly said three words. <break time="0.5s" /> The third word was 'okay.' <break time="0.8s" /> Cricket Boudreaux is still inside. He has applied for parole four times and been denied four times, mostly because of incidents involving the prison's industrial kitchen that the warden has declined to comment on. <break time="0.8s" /> And Tommy Marsh — the new guy, the baby face, the ATF asset who stayed for one more hour because he wanted to see Doc figure it out — was promoted in 2010. He runs an undercover division now. His operations have, collectively, recovered an estimated forty-seven million dollars in stolen assets. <break time="0.7s" /> None of those operations have ever involved a cement mixer."

---

### SCENE 22 — OUTRO (~15s)
**Tone:** Sign-off. Smirk all the way up.
> "There's a cement mixer sitting in an FBI evidence lot in Ohio. <break time="0.5s" /> It will be there forever. <break time="0.7s" /> Subscribe — <break time="0.4s" /> and I'll tell you what's in the refrigerator."

---

## EXPORT WORKFLOW

1. **Generate scene-by-scene** (22 separate ElevenLabs generations). Long-form drift is real; this protects you.
2. **Export each as WAV 44.1kHz** for cleanest editing.
3. **Name them** `VO_S01.wav` → `VO_S22.wav`.
4. **Drop into editor** (DaVinci Resolve / Premiere / CapCut Pro), align to scene markers in `Script/story_script_long.md`.
5. **Process voice bus:**
   - High-pass filter @ 80 Hz
   - De-esser (light, around 5–7 kHz)
   - Compressor: ratio 3:1, threshold -18 dB, attack 15ms, release 90ms
   - Subtle reverb: short room, 8% wet (only for "narrator in study" feel)
6. **Loudness target:** -16 LUFS for YouTube, -14 LUFS for Spotify Video.
7. **Layer SFX** (cement mixer rumble, fluorescent buzz, courtroom murmur, fire crackle, distant siren) at -12 to -18 dB below voice.
8. **Underscore:** Slow cinematic true-crime track at -22 dB. Pause music for the punchline beats (e.g. "Get the hose." / "Huh." / "It did not.").

---

## CHECKLIST (per scene)
- [ ] Voice generated
- [ ] Stability/Similarity verified consistent with other scenes
- [ ] WAV exported
- [ ] Aligned to image/video cut
- [ ] SFX layer added
- [ ] Music duck applied at key beats
