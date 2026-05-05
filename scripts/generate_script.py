"""Generate a structured video script from an idea.

Usage:
    python scripts/generate_script.py "Hull Suite + RSI strategy backtest"
    python scripts/generate_script.py --slug hull-rsi-backtest "Hull Suite + RSI strategy backtest"

Writes videos/<slug>/script.md with hook, body sections, CTA, b-roll cues, timestamps.
v1 emits a structured template. Wiring an LLM call is a TODO.
"""
from __future__ import annotations

import argparse
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"


def slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower())
    s = re.sub(r"[\s_]+", "-", s).strip("-")
    return s[:60] or "untitled"


TEMPLATE = """# {title}

> Slug: `{slug}` | Created: {created} | Status: draft

## Metadata
- **Pillar:** [strategy backtest | indicator breakdown | tutorial | mistakes]
- **Target length:** 8-12 min
- **Source project:** [Hull+RSI | T3 screener | MTF levels | levels+ORB | other]

---

## 0:00 - 0:15 | HOOK
[Open with the result, not the setup. Show the equity curve or the punchline chart first.]

[B-ROLL: equity curve / final stat / "X% return over Y years"]

> Example pattern: "This Pine Script strategy returned 47% over 3 years on SPY.
> But here's the catch most backtests hide..."

---

## 0:15 - 0:45 | CONTEXT
[Why this matters. Who this is for. What you'll show.]

[B-ROLL: TradingView chart, ticker symbol fade-in]

---

## 0:45 - 4:00 | BODY 1 - The Setup
[Walk through the indicator/strategy logic. Show the Pine Script code in chunks,
not all at once. Highlight the line that matters.]

[B-ROLL: Pine Script editor zoomed to specific lines]
[B-ROLL: indicator on chart with annotations]

---

## 4:00 - 7:00 | BODY 2 - The Test
[Run the backtest. Show win rate, drawdown, equity curve. Be honest about losing trades.]

[B-ROLL: TradingView strategy tester panel]
[B-ROLL: drawdown chart - DON'T HIDE THIS]

---

## 7:00 - 9:00 | BODY 3 - The Catch / Nuance
[Where this breaks. Repainting? Slippage? Market regime dependence? Overfit risk?]

[B-ROLL: example of strategy failing in different conditions]

---

## 9:00 - 9:45 | TAKEAWAY
[One sentence the viewer should walk away with. No hype.]

---

## 9:45 - 10:00 | CTA
[Subscribe + link to the Pine Script in description / pinned comment.]

> "Code's in the description. If you want the screener version, that's next week's video. Subscribe."

---

## B-roll shot list
- [ ] Equity curve screenshot (final result)
- [ ] Pine Script editor: key lines highlighted
- [ ] Strategy tester panel
- [ ] Drawdown chart
- [ ] Example trade (winner)
- [ ] Example trade (loser - mandatory)

## Description draft
[Title]

[2-sentence summary]

Pine Script: [link or pinned comment]
Related videos: [links]

Timestamps:
0:00 Hook
0:15 Context
0:45 The setup
4:00 The test
7:00 The catch
9:00 Takeaway

#PineScript #TradingView #Trading

---

<!-- TODO: replace this template body with an LLM call (Gemini or Claude) -->
<!-- using the idea + project notes as context. For v1, edit by hand. -->
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("idea", help="Video idea / working title")
    parser.add_argument("--slug", help="Override auto-generated slug")
    parser.add_argument("--force", action="store_true", help="Overwrite existing script.md")
    args = parser.parse_args()

    slug = args.slug or slugify(args.idea)
    folder = VIDEOS / slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "images").mkdir(exist_ok=True)
    (folder / "raw").mkdir(exist_ok=True)
    (folder / "final").mkdir(exist_ok=True)

    script_path = folder / "script.md"
    if script_path.exists() and not args.force:
        print(f"Script already exists at {script_path}. Use --force to overwrite.")
        return

    script_path.write_text(
        TEMPLATE.format(title=args.idea, slug=slug, created=date.today().isoformat()),
        encoding="utf-8",
    )
    print(f"Wrote {script_path}")


if __name__ == "__main__":
    main()
