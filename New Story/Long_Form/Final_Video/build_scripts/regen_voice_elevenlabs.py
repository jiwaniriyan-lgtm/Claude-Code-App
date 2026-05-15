#!/usr/bin/env python3
"""
Regenerate all 22 narration MP3s using the ElevenLabs API.
Works on macOS out of the box — no pip install needed.

SETUP (one-time):
  1. Add the voice to your ElevenLabs library:
     https://elevenlabs.io/app/voice-library?voiceId=nzFihrBIvB34imQBuxub
  2. Get your API key:
     https://elevenlabs.io/app/settings/api-keys
  3. Export it in your shell:
     export ELEVEN_API_KEY="sk_xxxxxxxxxxxxxxx"

USAGE:
  ./regen_voice_elevenlabs.py
  ELEVEN_VOICE_ID=otherid ./regen_voice_elevenlabs.py
  ELEVEN_MODEL=eleven_turbo_v2_5 ./regen_voice_elevenlabs.py
  STABILITY=0.5 SIMILARITY=0.85 STYLE=0.4 ./regen_voice_elevenlabs.py
"""

import json
import os
import ssl
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path


def get_ssl_context() -> ssl.SSLContext:
    """Build an SSL context that works on macOS even when Python's bundled
    CA bundle isn't installed. Tries certifi first; auto-installs it if
    missing; falls back to the macOS Install Certificates command path."""
    try:
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass

    print("  (one-time setup: installing certifi for SSL...)")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--quiet", "--user", "certifi"]
        )
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where())
    except Exception as exc:
        print(f"  ❌ could not install certifi automatically: {exc}")
        print()
        print("  Fix manually with ONE of:")
        print(f"    1. {sys.executable} -m pip install --user certifi")
        print("    2. /Applications/Python\\ 3.*/Install\\ Certificates.command")
        sys.exit(1)


SSL_CONTEXT = get_ssl_context()

API_KEY = os.environ.get("ELEVEN_API_KEY", "").strip()
VOICE_ID = os.environ.get("ELEVEN_VOICE_ID", "nzFihrBIvB34imQBuxub").strip()
MODEL = os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2").strip()
STABILITY = float(os.environ.get("STABILITY", "0.40"))
SIMILARITY = float(os.environ.get("SIMILARITY", "0.80"))
STYLE = float(os.environ.get("STYLE", "0.30"))

if not API_KEY:
    print("❌ ELEVEN_API_KEY not set.")
    print()
    print("Get your key: https://elevenlabs.io/app/settings/api-keys")
    print("Then run:")
    print("  export ELEVEN_API_KEY='sk_xxxxxxxxxxxxxxx'")
    print("  ./regen_voice_elevenlabs.py")
    sys.exit(1)

OUT = Path(__file__).parent.parent / "audio_placeholder"
OUT.mkdir(parents=True, exist_ok=True)

print(f"Voice ID:   {VOICE_ID}")
print(f"Model:      {MODEL}")
print(f"Stability:  {STABILITY}  |  Similarity: {SIMILARITY}  |  Style: {STYLE}")
print(f"Output:     {OUT}")
print()

SCENES = {
    1: "There's a cement mixer sitting in an FBI evidence lot in Ohio. It's been there since 2009. The drum has never been opened. And inside that drum, sealed in twelve tons of concrete, is a 2008 Ford F-750 armored truck containing four point two million dollars in unmarked bills. This is the story of how it got in there. And why nobody, not the FBI, not the engineers, not the four men who put it there, has ever been able to get it out.",

    2: "Every heist story starts with a guy who has too much time and not enough money. This one starts with Eugene Doc Halloran. Fifty-two years old. Two-time felon. Three-time divorcé. And, by his own estimation, the smartest man in Lorain County, Ohio, which is a claim that, depending on your standards, may or may not have ever been true. Doc had a theory. He'd been studying armored truck routes for eleven months. Every Tuesday morning, a Brinks F-750 left a regional bank at exactly 9:47 AM, hit the same five red lights in the same order, and arrived at a Federal Reserve drop point at 10:14. Twenty-seven minutes. Five lights. Doc had timed it himself, in a Honda Civic, forty-three times. He had identified the perfect light. He had identified the perfect window. What he needed, and this is where things get interesting, was a way to make an armored truck disappear in ninety seconds, in broad daylight, in the middle of an intersection.",

    3: "The idea came to him at a strip club in Cleveland, which, statistically, is where about thirty percent of all American crime ideas come from. He was watching a cement mixer rumble past the window. And he had what he later described, in his recorded confession, as the cleanest thought of my entire life. The drum on a standard cement mixer is approximately eight feet wide and ten feet long. A Brinks F-750 armored truck, Doc had measured one in a parking lot with a tape measure while pretending to be lost, is seven feet four inches wide and just under twenty feet long. The truck wouldn't fit nose-first. But it would fit sideways. Just barely. With the right approach angle. And the right ramp. Doc spent the next three weeks designing the ramp.",

    4: "Doc needed three men. He needed a driver who could handle a fully-loaded mixer truck at sixty miles an hour. That was Cricket Boudreaux. Louisiana-born, Cleveland-residing, fifteen DUIs, never crashed once. Cricket said yes immediately. Cricket said yes to everything immediately. That's how Cricket ended up with fifteen DUIs. He needed a muscle man, someone who could move a six-hundred-pound steel ramp into position in under twelve seconds. That was Mick Saluzzi. Mick said three words during the entire recruitment meeting. The third word was okay. And he needed a fourth man. A lookout. A runner. Someone young, hungry, and replaceable. Doc found him at a Denny's in Sandusky. Tommy Marsh. Twenty-eight. Clean record. Eager. Doc liked him immediately. Doc should have liked him less.",

    5: "For six weeks, in a rented warehouse outside Elyria, the crew practiced. Doc built a plywood replica of a Brinks F-750. Mick and Cricket ran the scoop maneuver until they could do it in eighty-seven seconds with the lights off. Tommy ran the perimeter sweep until he could clear three city blocks in two minutes flat. The plan was beautiful in its specifics. At 9:51 AM, on a Tuesday, the Brinks truck would stop at the red light at the corner of Broadway and 28th. Cricket would already be there in the cement mixer, two cars behind. The light would turn green. Cricket would accelerate. Mick would deploy the ramp from the back of the mixer at exactly the moment of impact. The mixer would scoop the armored truck, sideways, at speed, into the open drum. And the drum would close. And Cricket would drive away. Ninety seconds. Maybe less. They practiced it forty-one times. It worked forty-one times.",

    6: "The night before the heist, the four men did what every crew in every heist movie has done since The Asphalt Jungle in 1950. They went their separate ways. They made peace with whoever they made peace with. They prepared. Doc smoked four cigarettes on his porch and called his daughter, who didn't pick up. Mick did three hundred pushups in his basement, drank a protein shake, and fell asleep on a weight bench. Cricket drank a bottle of Wild Turkey in his '94 Camaro behind a Waffle House and woke up at 4 AM with no memory of the previous six hours, which, for Cricket, was Tuesday. And Tommy Marsh sat on the edge of a motel bed in Avon, Ohio, and made a phone call. The call lasted seventeen minutes. The person on the other end of the call worked for the federal government.",

    7: "The ATF had been running Tommy Marsh as an undercover asset for nine months. He had been planted in a separate operation entirely, a stolen firearms ring out of Toledo, but his handler had instructed him to take any side work that came his way, document it, and report. The cement mixer plan was, by Tommy's own admission, the dumbest thing I've ever been asked to participate in, and I've been asked to participate in some dumb things. The ATF made a decision that morning. A decision that, in retrospect, the federal government has refused to discuss publicly. They let the heist happen.",

    8: "Tuesday, October 21st, 2008. Sunrise at 7:43 AM. The cement mixer, which they had stolen three nights earlier from a construction site in Avon Lake, pulled out of a Denny's parking lot at exactly 8:30 AM. Cricket at the wheel, Mick in the passenger seat, Doc and Tommy following one block behind in a beige 1999 Pontiac Grand Am. Everything was on schedule. What none of them knew, what none of them could have known, because nobody on Doc's crew had ever, in their entire lives, operated a cement mixer for a legitimate purpose, was that a working cement mixer, on a Tuesday morning, in October, in Ohio, three days after being stolen from an active construction site, is almost certainly already full of something. In this case, it was full of twelve tons of slow-set Portland cement. Mixed Friday afternoon. Slow-rotating ever since. Still, technically, wet. Nobody had checked. Why would they.",

    9: "9:46 AM. The Brinks F-750 turned onto Broadway exactly on schedule, sixty-one seconds ahead of Doc's projected window. Doc, watching from the Grand Am with a pair of military-surplus binoculars, would later describe this moment as the happiest of his entire adult life. The light at Broadway and 28th turned red at 9:47:14. The Brinks truck stopped at 9:47:18. The cement mixer rolled up behind it at 9:47:23. And at 9:47:24, Cricket Boudreaux turned to Mick Saluzzi and said the only line he had rehearsed for the entire operation: Let's go cook a goose.",

    10: "At 9:47:31, the light turned green. Cricket floored it. The cement mixer hit forty-eight miles an hour in under two seconds, struck the rear quarter of the Brinks truck at a calculated angle of seventeen degrees, and, exactly as Doc had drawn it on a strip club napkin nine months earlier, scooped the armored truck sideways into the open drum. The two Brinks guards inside the F-750 would later testify that they did not, at first, understand what had happened. One of them, the senior officer, a man named Raymond Castillo, twenty-two years with the company, described the experience as, quote, being inside a tumbling washing machine, except the washing machine was also somehow a roller coaster, and also we were upside down, and also there was a lot of wet concrete. Because that's the thing. The drum was already full. And the drum was still rotating.",

    11: "Cricket drove. He drove the way Cricket Boudreaux drives everything: with absolute confidence and no awareness of his surroundings. The mixer went seventy-two miles an hour through a residential zone. Wet concrete sloshed out the top of the drum in great gray waves, coating the road behind them, two parked cars, a mailbox, and a Yorkshire terrier named Buttons who survived but has, according to the owner, never been the same. Inside the drum, the Brinks truck was rotating. So were the two guards. So was four point two million dollars in unmarked bills. So was twelve tons of slowly hardening concrete. They reached the warehouse in Elyria at 9:54 AM. Seven minutes after impact. Cricket parked the mixer. Mick killed the engine. The drum coasted to a stop with a deep, wet groan that Mick would later describe, in court, as the sound a planet would make if it was dying. Doc walked into the warehouse at 9:56 AM, beaming. Boys, he said. We did it. They had not done it.",

    12: "Doc climbed the ladder first. He looked into the drum, expecting to see a sideways armored truck. Battered, dented, but intact, sitting on a thin film of residual cement dust. What he saw instead was a sideways armored truck. Battered, dented, sitting in approximately ten and a half tons of wet, gray, slowly thickening Portland cement, with two visibly conscious Brinks guards waving at him from a small triangle of exposed windshield. Doc stared. Mick climbed the ladder behind him. Mick stared too. Cricket climbed the ladder, lit a cigarette, looked into the drum, said huh, and climbed back down. Tommy stayed at the bottom of the ladder, because Tommy already knew what was in the drum, because Tommy had been told the night before, by his ATF handler, that the drum had been full of wet cement for approximately ninety-six hours. Tommy did not climb the ladder. Doc, at the top of the ladder, said the single most useful thing he would say in the entire operation: Get the hose.",

    13: "Portland cement, once mixed with water, begins to set within forty-five minutes. It reaches what engineers call initial set, when it can no longer be reshaped, at approximately three hours. By four hours, it has bonded chemically to anything it touches. By six hours, the bond is permanent. The crew had, according to the timer on Mick's Casio watch, recovered from evidence and entered into the trial record, three hours and seventeen minutes. They had two garden hoses, a shop vac, four five-gallon buckets, and a broken pressure washer Cricket had bought from a guy named Stinky. They got approximately six hundred pounds of cement out in the first hour. The drum contained twenty-four thousand pounds. Doc, sitting on the warehouse floor at the two-hour mark, looked up at his crew, covered head to toe in gray sludge, exhausted, defeated, and said the second-most-useful thing he would say in the entire operation: Boys, I think we have a problem.",

    14: "Meanwhile, inside the slowly-hardening drum, the two Brinks guards were, in their own quiet way, having the best day of their careers. Raymond Castillo had radioed in their position at 9:51 AM, four minutes after impact, using the truck's panic transponder. The transponder, by federal regulation, broadcasts a continuous GPS signal that is, deliberately, impossible to disable from inside the vehicle. The Brinks dispatch had picked up the signal immediately. The Cleveland FBI had picked up the dispatch alert at 9:53. The Ohio State Patrol had set up a perimeter at 9:59. By the time Doc said I think we have a problem, at the two-hour mark, sitting on the warehouse floor, the entire warehouse was already surrounded. Doc just hadn't looked outside yet.",

    15: "The standoff lasted four hours. Not because the FBI couldn't enter. They could have, at any time, with overwhelming force. But because the FBI was waiting for two things. First, they were waiting for the concrete to harden completely. Because as long as the drum was wet, there was a non-zero chance that the crew could still drive away, or somehow extract the truck, or do any of the things Doc had spent eleven months planning to do. Once the concrete set, the truck was, in the words of the on-scene FBI tactical commander, a paperweight inside a paperweight. And second, they were waiting for Tommy. Tommy Marsh, twenty-eight, baby-faced, the new guy, was supposed to walk out of the warehouse at exactly 1:30 PM, hands up, on his own. That was the deal. That was always the deal. He would walk out, the FBI would move in, Tommy would keep his cover, and the operation would close cleanly. Tommy did not walk out at 1:30.",

    16: "Tommy stayed. In his post-arrest interviews, and there were many of them, Tommy could never fully explain why. He had a clear path out. He had a federal handler waiting in a Crown Victoria two blocks away. He had immunity already signed in a sealed envelope in a Toledo field office. The most honest thing Tommy ever said about it was this: I just wanted to see what was going to happen. And what was going to happen was nothing. Nothing was going to happen. The concrete was going to harden. The truck was going to be sealed inside it. The guards were going to be rescued through a six-hour cutting operation that would, eventually, require the partial demolition of the warehouse roof. The four crew members would be arrested without incident at 5:47 PM. But Tommy stayed for one more hour. Because he wanted to see Doc's face when Doc figured it out. He waited a long time.",

    17: "Doc figured it out at 4:18 PM. Not the concrete. He'd figured the concrete out hours ago. He figured Tommy out. He looked at Tommy, clean, dry, not panicking, not exhausted, not gray, and he understood, the way a man understands his own death, that Tommy had known the whole time. Doc didn't move. He didn't yell. He didn't reach for the .38 in his waistband. He just looked at Tommy and said one word. Huh. Cricket, asleep in the corner, woke up briefly, asked what time it was, and went back to sleep. Mick, who had been silently watching this exchange, said nothing, because Mick said nothing about anything, ever. And Tommy, the new guy, the baby-face, the ATF asset, said the last thing he would ever say to Doc Halloran, the smartest man in Lorain County, Ohio: I'm sorry. He meant it.",

    18: "At 5:47 PM, the FBI's tactical team entered the warehouse through the loading dock door. Doc was on the ground before the second flashbang went off. Mick lay down on his own. Cricket, and this is in the official tactical report, was asleep, snoring, and required to be physically rolled onto his stomach. Tommy stood, hands up, and was arrested for show. He was released at the booking station two hours later. He has not given a public interview since. And the cement mixer, silent now, the drum fully set, twelve tons of concrete fused permanently around a 2008 Ford F-750, sat in the warehouse for another three days, while the FBI tried to figure out what, exactly, to do with it. They tried jackhammers. They tried diamond saws. They tried, and this is real, this is in the evidence inventory, a controlled water-jet cutting operation that took eleven hours and produced one hole, approximately the size of a softball, through which a fiber-optic camera was inserted to confirm that the truck was, indeed, still inside, and that the money was, indeed, still inside the truck. They closed the hole back up. The truck has been inside the drum, inside the mixer, inside an FBI evidence lot, ever since.",

    19: "The trial was short. Doc Halloran pleaded guilty to armed robbery, kidnapping of the two Brinks guards, grand theft auto, possession of a stolen commercial vehicle, and, at the prosecutor's specific insistence, illegal disposal of approximately twenty-four thousand pounds of Portland cement in a manner inconsistent with EPA guidelines. He got nineteen years. Mick Saluzzi got fifteen. Cricket Boudreaux got eleven, plus, separately, a sixteenth DUI charge that the State of Ohio filed against him for operating a commercial vehicle under the influence during the commission of the heist itself. When the judge, a woman named Eleanor Frasier, who had presided over Cuyahoga County criminal court for twenty-three years, read the sentences, she paused, looked at Doc over the top of her glasses, and asked him one question. Mr. Halloran. Did it ever, at any point during the eleven months you were planning this, occur to you to check what was inside the mixer? Doc considered this carefully. Then he said: No, Your Honor. It did not. The judge nodded once and moved on.",

    20: "The cement mixer is still there. It's been moved twice. Once in 2013, from an outdoor lot to a covered warehouse, after a particularly bad winter cracked the concrete by approximately three centimeters and the FBI panicked that the truck might somehow shift and damage the evidentiary integrity of the four point two million dollars inside, which they cannot reach. Once again in 2019, to a permanent climate-controlled facility outside Cincinnati, where it now sits in a row of similarly-unsolvable evidence: a yacht with a hole in it, a 1976 Cadillac filled with concrete from a separate unrelated incident, and what appears to be a refrigerator nobody is willing to open. Every two years, the FBI commissions a structural engineering review to determine whether modern cutting technology has advanced to the point where the truck can be safely extracted. Every two years, the engineers conclude that it cannot, not without destroying the truck, the money, or both. The four point two million dollars is still inside. It is, by a strict legal definition, still considered stolen. It is also, by every practical definition, gone.",

    21: "Doc Halloran was released on parole in October of 2024. He lives, as of this recording, in a trailer in Sandusky, Ohio. He has not given an interview. He has not written a book. He has not, as far as anyone knows, attempted any new crimes. Mick Saluzzi was released in 2022. He works at a hardware store in Lorain. When asked, by a local reporter, what he thought about the cement mixer being moved to Cincinnati, Mick reportedly said three words. The third word was okay. Cricket Boudreaux is still inside. He has applied for parole four times and been denied four times, mostly because of incidents involving the prison's industrial kitchen that the warden has declined to comment on. And Tommy Marsh, the new guy, the baby face, the ATF asset who stayed for one more hour because he wanted to see Doc figure it out, was promoted in 2010. He runs an undercover division now. His operations have, collectively, recovered an estimated forty-seven million dollars in stolen assets. None of those operations have ever involved a cement mixer.",

    22: "There's a cement mixer sitting in an FBI evidence lot in Ohio. It will be there forever. Subscribe, and I'll tell you what's in the refrigerator.",
}

total_chars = sum(len(t) for t in SCENES.values())
print(f"Total characters: {total_chars}  (≈{total_chars//1000}k ElevenLabs credits)")
print()

url_template = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128"

for n, text in SCENES.items():
    out_mp3 = OUT / f"VO_S{n:02d}.mp3"
    print(f"  → VO_S{n:02d}.mp3  ({len(text):4d} chars)  ", end="", flush=True)

    payload = {
        "text": text,
        "model_id": MODEL,
        "voice_settings": {
            "stability": STABILITY,
            "similarity_boost": SIMILARITY,
            "style": STYLE,
            "use_speaker_boost": True,
        },
    }

    req = urllib.request.Request(
        url_template,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120, context=SSL_CONTEXT) as resp:
            audio_bytes = resp.read()
        if len(audio_bytes) < 1000:
            print(f"❌ response too small ({len(audio_bytes)} bytes)")
            print(audio_bytes.decode("utf-8", errors="replace"))
            sys.exit(1)
        out_mp3.write_bytes(audio_bytes)
        print(f"✓  ({len(audio_bytes)//1024} KB)")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"❌ HTTP {e.code}")
        print(body)
        if e.code == 401:
            print("\n→ Your API key is invalid. Check https://elevenlabs.io/app/settings/api-keys")
        elif e.code == 400 and "voice_not_found" in body.lower():
            print(f"\n→ Voice {VOICE_ID} is not in your library. Add it here:")
            print(f"  https://elevenlabs.io/app/voice-library?voiceId={VOICE_ID}")
        elif e.code == 401 and "quota" in body.lower():
            print("\n→ You're out of ElevenLabs credits. Top up: https://elevenlabs.io/app/subscription")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌ Network error: {e}")
        sys.exit(1)

print()
print(f"✓ Done. {len(SCENES)} narration files regenerated with ElevenLabs voice {VOICE_ID}")
print()
print("Now rebuild the video:")
print("  ./build_video.sh")
