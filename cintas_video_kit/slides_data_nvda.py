"""
NVIDIA (NVDA) YouTube Video - 40 slides
========================================
Drop this file in place of slides_data.py (or import as slides_data_nvda)
to build the NVIDIA deep-dive instead of Cintas.

Each slide has:
    image_prompt   -> sent to image API
    voice_script   -> sent to ElevenLabs TTS
    on_screen_text -> rendered on the right-side text panel

Target total runtime: ~16 minutes
"""

GLOBAL_IMAGE_STYLE = (
    "modern editorial finance aesthetic, dark navy and electric green palette "
    "with neon teal accents, cinematic professional lighting, clean minimalist "
    "composition, photoreal where appropriate, no logos, no readable text in "
    "the image, 16:9 widescreen"
)

SLIDES = [
    # ---------------- 1. Cold open / hook ----------------
    {
        "image_prompt": "Cinematic ultra-wide shot of a vast modern data center hall "
                        "at night, endless rows of server racks glowing with green and "
                        "teal LEDs, soft blue ambient lighting, slight motion blur, "
                        "shafts of light, photoreal commercial cinematography",
        "voice_script": "What if I told you a single company is now worth more than the "
                        "entire economies of Japan, Germany, and India combined? It built "
                        "the brains behind Chat G P T, every major A I breakthrough of the "
                        "last three years, and over half of every gaming P C on the planet. "
                        "Today we're going deep on NVIDIA, ticker N V D A, sitting at a "
                        "five-trillion-dollar market cap. The real question is — at these "
                        "prices, is it still a buy, or are you walking into the most "
                        "expensive party in market history? Let's find out.",
        "on_screen_text": "The $5 Trillion Question"
    },

    # ---------------- 2. Disclaimer ----------------
    {
        "image_prompt": "Minimalist dark navy gradient background with subtle green data "
                        "grid pattern, soft golden spotlight, clean title card style, no people",
        "voice_script": "Quick note before we dive in. Everything you're about to hear is my "
                        "own research and opinion, shared purely for education and entertainment. "
                        "This is not financial advice. Stocks go up, stocks go down, and the "
                        "decision to buy or sell is always yours.",
        "on_screen_text": "Educational content only. Not financial advice."
    },

    # ---------------- 3. Stock profile ----------------
    {
        "image_prompt": "Modern fintech style infographic card on a dark navy gradient with "
                        "glowing green ticker symbol effect, subtle GPU silicon chip pattern "
                        "in the background, clean sans-serif typography feel",
        "voice_script": "NVIDIA trades on the NASDAQ under the ticker N V D A. It's in the "
                        "Technology sector, specifically semiconductors. Market cap is roughly "
                        "five point two trillion dollars, making it one of the most valuable "
                        "companies on Earth. Current price around two hundred and nineteen "
                        "dollars a share, with twenty four billion shares outstanding. Beta "
                        "of two point two four — meaning this stock moves more than twice as "
                        "much as the broader market in both directions. Buckle in.",
        "on_screen_text": "NVDA  |  NASDAQ  |  Mega Cap  |  ~$5.2 Trillion"
    },

    # ---------------- 4. Investment thesis ----------------
    {
        "image_prompt": "Stock chart on a dark trading platform background, an aggressive "
                        "vertical green line shooting up off the top of the frame, soft glow "
                        "on data points, S and P 500 comparison line tiny in orange below",
        "voice_script": "My one-line thesis on NVIDIA. It's the most dominant technology "
                        "company of our generation — and it's priced for perfection. The "
                        "business itself is extraordinary, but the stock is sitting at "
                        "all-time highs, and any disappointment could mean a sharp pullback. "
                        "Today we'll look at why the underlying business deserves a premium — "
                        "and what could still take it down.",
        "on_screen_text": "Dominant business. Priced for perfection."
    },

    # ---------------- 5. What does NVIDIA do? ----------------
    {
        "image_prompt": "Close-up macro photograph of a glowing green N V I D I A style "
                        "G P U printed circuit board, intricate gold pin traces, dramatic "
                        "studio lighting, shallow depth of field, hyper-real product shot",
        "voice_script": "NVIDIA designs graphics processing units — GPUs. Originally these "
                        "chips were for gaming, rendering pixels for video games. But somewhere "
                        "along the way, NVIDIA realized GPUs were also incredibly good at the "
                        "math behind artificial intelligence. Now, more than eighty percent of "
                        "NVIDIA's revenue comes from one place — data centers — where their "
                        "chips power virtually every major A I model in production. Chat G P T. "
                        "Claude. Gemini. Tesla's Autopilot. If it requires massive parallel "
                        "computing, it almost certainly runs on NVIDIA hardware.",
        "on_screen_text": "GPUs for gaming. Then everything else."
    },

    # ---------------- 6. Two segments ----------------
    {
        "image_prompt": "Split screen editorial illustration: left side a gamer at a "
                        "high-end RGB-lit P C playing an action game on a glowing monitor; "
                        "right side a massive data center hall with rack after rack of "
                        "servers stretching to vanishing point, both halves connected by "
                        "a glowing green stream of light, modern editorial style",
        "voice_script": "NVIDIA operates in two segments. Graphics — which is the consumer "
                        "side. GeForce GPUs for gamers. Quadro and RTX cards for professionals. "
                        "Automotive infotainment. And Omniverse for 3D simulation. Then there's "
                        "Compute and Networking — which is where the real money is. Data center "
                        "AI chips like the H one hundred and the B one hundred. Networking "
                        "platforms. NVIDIA Drive for autonomous vehicles. Jetson for robotics. "
                        "And A I Enterprise software. The data center segment alone is roughly "
                        "ten times bigger than gaming today.",
        "on_screen_text": "Two segments: Graphics + Compute & Networking"
    },

    # ---------------- 7. The CUDA story ----------------
    {
        "image_prompt": "Abstract digital network illustration: a glowing green central chip "
                        "node connected by countless thin teal light streams to thousands of "
                        "tiny developer icons spread across the frame, conceptual ecosystem "
                        "visualization, dark background",
        "voice_script": "Here's what most people miss about NVIDIA. The hardware isn't even "
                        "the moat. It's the software. In two thousand seven, NVIDIA released "
                        "a programming platform called CUDA — and they gave it away for free. "
                        "They convinced an entire generation of computer scientists and PhDs "
                        "to write their A I code in CUDA. Today, virtually every A I framework — "
                        "PyTorch, TensorFlow, JAX — is optimized for CUDA. If you want to switch "
                        "away from NVIDIA, you'd have to rewrite millions of lines of code. "
                        "That's not a chip company. That's the most powerful software lock-in "
                        "in modern technology.",
        "on_screen_text": "CUDA: the moat nobody can copy"
    },

    # ---------------- 8. Scale ----------------
    {
        "image_prompt": "Aerial view of NVIDIA-style modern corporate headquarters with "
                        "futuristic glass architecture, surrounded by sweeping data-grid "
                        "patterns and tiny glowing developer avatars across a world map, "
                        "modern data-visualization style",
        "voice_script": "Let's talk scale. NVIDIA has forty two thousand employees and spends "
                        "eighteen and a half billion dollars a year — yes, a year — on research "
                        "and development. That R and D budget alone is bigger than the entire "
                        "revenue of most public companies. There are over four million developers "
                        "writing CUDA code worldwide. The infrastructure required to challenge "
                        "NVIDIA today is so massive, it's almost mathematically impossible for "
                        "any new entrant to catch up.",
        "on_screen_text": "42,000 employees  •  $18.5B R&D  •  4M+ developers"
    },

    # ---------------- 9. Revenue chart ----------------
    {
        "image_prompt": "Vertical bar chart on dark navy background with bars rising "
                        "dramatically, last three bars towering off the top of the frame "
                        "in bright green-to-teal gradient, financial dashboard aesthetic, "
                        "subtle glow",
        "voice_script": "NVIDIA's revenue chart is unlike anything in modern market history. "
                        "In fiscal twenty twenty three, revenue was twenty seven billion. By "
                        "the trailing twelve months ending January twenty twenty six, it's "
                        "two hundred and sixteen billion. That's not growth — that's a vertical "
                        "line. Most of that explosion is one product — the H one hundred A I "
                        "chip — which goes for around thirty thousand dollars each, with margins "
                        "that would make any luxury brand jealous.",
        "on_screen_text": "Revenue: $27B → $216B in 3 years"
    },

    # ---------------- 10. Net income ----------------
    {
        "image_prompt": "Bar chart with six rising green bars showing explosive earnings "
                        "growth on a dark navy background, subtle glow effect on the tallest "
                        "bars, premium dashboard look",
        "voice_script": "Net income tells the same story. NVIDIA made four point four billion "
                        "dollars in fiscal twenty twenty three. By LTM twenty twenty six, it's "
                        "one hundred and twenty billion. That's a twenty-seven-fold increase "
                        "in three years. For perspective, NVIDIA now earns more in a single "
                        "quarter than most Fortune five hundred companies earn in a decade.",
        "on_screen_text": "Net Income: $4.4B → $120B (27× in 3 years)"
    },

    # ---------------- 11. Cash flow ----------------
    {
        "image_prompt": "Cinematic photoreal image of stacks of US hundred-dollar bills "
                        "flowing like water from a glowing GPU shaped pipe into a massive "
                        "vault, dramatic blue and green lighting, dark moody atmosphere",
        "voice_script": "Cash flow is even more staggering. Operating cash flow last year was "
                        "one hundred and three billion dollars. Free cash flow — what's left "
                        "after capital spending — was eighty four billion. To put that in "
                        "context, NVIDIA is generating more annual free cash flow than the "
                        "G D P of countries like Croatia or Lebanon. It is a cash machine on "
                        "a scale we've literally never seen before.",
        "on_screen_text": "Operating Cash Flow: $103B  •  Free Cash Flow: $84B"
    },

    # ---------------- 12. Margins ----------------
    {
        "image_prompt": "Side-by-side dual bar chart comparing tall bright green N V D A "
                        "bars against shorter grey industry-average bars, financial "
                        "dashboard style, dark navy background",
        "voice_script": "Now the margins, which are arguably the most insane part of the "
                        "whole story. Gross margin is seventy one percent. The semiconductor "
                        "industry average is around fifty percent. Operating margin is sixty "
                        "percent. Industry average around twenty. Net margin is fifty six "
                        "percent. That means for every dollar of sales, NVIDIA keeps fifty "
                        "six cents in pure profit. These are software-company margins on a "
                        "hardware business. It shouldn't be possible — but it is.",
        "on_screen_text": "Gross 71%  •  Operating 60%  •  Net 56%"
    },

    # ---------------- 13. ROE / ROIC ----------------
    {
        "image_prompt": "Glowing 3D infographic of two huge percentage numbers floating "
                        "above a chart, blue and gold accents, financial magazine cover "
                        "style, dark background",
        "voice_script": "Return on Equity is one hundred and one percent. Return on Invested "
                        "Capital is ninety three percent. Translation — NVIDIA generates back "
                        "every single dollar of shareholder equity in less than twelve months. "
                        "These numbers aren't just rare. They're borderline absurd. Most great "
                        "companies in history would kill for a twenty percent R O E. NVIDIA "
                        "is at one hundred.",
        "on_screen_text": "ROE: 101.5%  •  ROIC: 93.6%"
    },

    # ---------------- 14. Free cash flow per share ----------------
    {
        "image_prompt": "Two panel infographic: left a rising line chart labeled 'Free Cash "
                        "Flow Per Share' in bright green; right a descending line labeled "
                        "'Shares Outstanding' in orange, dark navy financial dashboard",
        "voice_script": "Free cash flow per share has gone from six cents in twenty seventeen "
                        "to three dollars and forty one cents today. And NVIDIA is using that "
                        "cash aggressively — buying back its own shares. Over the last twelve "
                        "months alone, they repurchased forty billion dollars of stock. Shares "
                        "outstanding are quietly shrinking, which means every share you own "
                        "becomes a slightly bigger piece of the company.",
        "on_screen_text": "FCF/Share ↑   •   Shares Outstanding ↓"
    },

    # ---------------- 15. Dividend (mostly irrelevant for NVDA) ----------------
    {
        "image_prompt": "Wooden desk with a calculator and a small dividend cheque, a stock "
                        "chart screen in the background showing a steeply rising line, warm "
                        "soft lighting, photoreal",
        "voice_script": "The dividend is essentially symbolic. Four cents per share annually, "
                        "for a yield of zero point zero two percent. NVIDIA is not an income "
                        "stock. It's a pure growth and capital appreciation story. If you want "
                        "dividends, look elsewhere. If you want compounders that reinvest "
                        "everything back into R and D and buybacks — this is your archetype.",
        "on_screen_text": "Dividend Yield: ~0.02% (essentially zero)"
    },

    # ---------------- 16. Moat intro ----------------
    {
        "image_prompt": "Cinematic image of a futuristic glowing fortress shaped like a "
                        "G P U with neon-green water moat surrounding it, dramatic stormy "
                        "sky, conceptual editorial illustration",
        "voice_script": "Now let's talk moat. Because numbers like one hundred percent R O E "
                        "don't happen by accident. NVIDIA has what analysts call a wide moat. "
                        "Some assessments rate it ten out of ten on every single moat factor. "
                        "Here are the three that matter most.",
        "on_screen_text": "Why Nobody Can Catch Up"
    },

    # ---------------- 17. Moat 1 - CUDA ----------------
    {
        "image_prompt": "Conceptual editorial illustration of a developer's hands typing on "
                        "a glowing laptop, lines of code in CUDA-style syntax floating "
                        "around them, dark blue and green ambient light, photoreal",
        "voice_script": "Moat number one — CUDA software lock-in. We talked about this earlier "
                        "but it bears repeating. Switching off NVIDIA isn't just buying a "
                        "different chip. It's rewriting your entire codebase. Re-training your "
                        "team. Re-validating every model. It's a multi-year project. Most "
                        "companies decide it's just not worth it. That's why NVIDIA's customer "
                        "retention in A I workloads is effectively one hundred percent.",
        "on_screen_text": "Moat #1 — CUDA Software Lock-In"
    },

    # ---------------- 18. Moat 2 - R&D scale ----------------
    {
        "image_prompt": "Dramatic photo of a chip design lab with scientists in clean-room "
                        "suits looking at giant screens showing GPU silicon layouts, blue "
                        "ambient lighting, premium editorial documentary style",
        "voice_script": "Moat number two — R and D scale. NVIDIA spends eighteen point five "
                        "billion dollars a year on research and development. AMD spends six "
                        "billion. Most of NVIDIA's competitors don't even have eighteen billion "
                        "in revenue, let alone R and D budget. This compounding R and D advantage "
                        "means NVIDIA stays one to two architectural generations ahead of "
                        "everyone else, year after year.",
        "on_screen_text": "Moat #2 — $18.5B R&D Budget"
    },

    # ---------------- 19. Moat 3 - Network effect ----------------
    {
        "image_prompt": "Glowing network visualization with millions of tiny dots connected "
                        "by green and teal light streams, forming a globe-shaped structure, "
                        "dark background, conceptual tech illustration",
        "voice_script": "Moat number three — network effects. Four million developers write "
                        "CUDA code. Every university teaches CUDA. Every A I library is "
                        "optimized for it. The more developers there are, the more software "
                        "gets written. The more software, the more reasons to choose NVIDIA "
                        "hardware. The flywheel just keeps spinning faster, and competitors "
                        "have no way to break in.",
        "on_screen_text": "Moat #3 — 4M Developer Network Effect"
    },

    # ---------------- 20. Competitors intro ----------------
    {
        "image_prompt": "Three chess pieces on a dark chessboard, one massive king piece "
                        "in glowing green dominating two smaller, dim grey pawns, moody "
                        "dramatic lighting, conceptual business image",
        "voice_script": "Let's actually look at who could potentially take NVIDIA's throne. "
                        "Spoiler — nobody, soon. But there are three categories of competitors "
                        "worth understanding.",
        "on_screen_text": "Who Could Possibly Compete?"
    },

    # ---------------- 21. vs AMD ----------------
    {
        "image_prompt": "Two GPU cards side by side on a dark surface, one glowing brightly "
                        "in green, the other dimmer in red, dramatic side lighting, "
                        "photoreal product photography",
        "voice_script": "First — A M D. They make legitimately great GPUs. Their MI three "
                        "hundred X chip is a credible alternative for some A I inference "
                        "workloads. But A M D's market cap is around two hundred billion. "
                        "NVIDIA's is over five trillion. That's a twenty-five-fold difference. "
                        "And A M D's software stack — called ROCm — is years behind CUDA in "
                        "maturity. A M D is a real competitor in gaming GPUs. In A I, it's "
                        "still distantly second.",
        "on_screen_text": "AMD: Strong #2, but 25× smaller"
    },

    # ---------------- 22. vs Intel ----------------
    {
        "image_prompt": "An aging giant statue partially crumbling in a desert at sunset, "
                        "conceptual editorial photo, symbolic of a former tech leader falling "
                        "behind, dramatic warm lighting",
        "voice_script": "Second — Intel. For decades, Intel was the king of chips. But they "
                        "fundamentally missed the A I wave. Their Gaudi A I accelerator has "
                        "negligible market share. Intel today is more of a former giant trying "
                        "to claw its way back than a real threat to NVIDIA. Their fundamental "
                        "issue is they bet on traditional CPUs while NVIDIA bet on parallel "
                        "GPUs — and history vindicated NVIDIA.",
        "on_screen_text": "Intel: Missed the AI wave entirely"
    },

    # ---------------- 23. vs hyperscaler custom chips ----------------
    {
        "image_prompt": "Three small glowing chip silhouettes labeled with abstract symbols "
                        "approaching a much larger glowing green G P U at the center, "
                        "conceptual editorial composite, dark background",
        "voice_script": "Third — and the most interesting threat — hyperscaler custom chips. "
                        "Google has T P Us. Amazon has Inferentia and Trainium. Microsoft has "
                        "Maia. These companies are designing their own chips specifically to "
                        "reduce their dependence on NVIDIA. The threat is real, but here's the "
                        "thing — even Google still spends tens of billions a year on NVIDIA "
                        "chips. Custom silicon is great for specific workloads, but it lacks "
                        "NVIDIA's flexibility. For now, the hyperscalers are NVIDIA's biggest "
                        "customers, not its biggest rivals.",
        "on_screen_text": "Custom Chips: Real threat, but slow burn"
    },

    # ---------------- 24. Stock performance vs SP500 ----------------
    {
        "image_prompt": "Stock chart with two lines on a dark background: a steep neon green "
                        "line rocketing upward labeled N V D A, a thin flat orange line below "
                        "labeled S and P 500, trading terminal aesthetic",
        "voice_script": "Now let's look at the stock performance. Over the past year, NVIDIA "
                        "is up eighty seven percent. The S and P 500 is up maybe twelve. Over "
                        "ten years, NVIDIA has compounded at a rate that would have turned ten "
                        "thousand dollars into well over three hundred thousand. This is one "
                        "of the best-performing large-cap stocks in U S market history.",
        "on_screen_text": "1-yr: +87.6%  •  10-yr: ~35× return"
    },

    # ---------------- 25. The 10-year wealth illustration ----------------
    {
        "image_prompt": "A small pile of gold coins on the left side of frame transforming "
                        "into a massive mountain of gold coins on the right side, with a "
                        "green stock chart line rising above them, cinematic moody lighting",
        "voice_script": "Think about this. Ten years ago, NVIDIA traded for around six dollars "
                        "a share. Today it's two hundred and nineteen. That's roughly thirty "
                        "five times your money. A ten thousand dollar investment in twenty "
                        "sixteen would be worth over three hundred and fifty thousand today. "
                        "And that's not from speculation — that's from the underlying business "
                        "literally growing thirty fold in earnings. The stock has just been "
                        "tracking the fundamentals.",
        "on_screen_text": "$10,000 in 2016  →  $350,000+ today"
    },

    # ---------------- 26. Growth drivers intro ----------------
    {
        "image_prompt": "Cinematic image of a futuristic highway stretching to the horizon "
                        "at sunrise, glowing green markers along the road symbolizing growth "
                        "milestones, hopeful epic mood",
        "voice_script": "So here's the trillion dollar question. After all this growth, is "
                        "there more left in the tank? Let's look at the three biggest drivers "
                        "for the next decade.",
        "on_screen_text": "Where Does the Next Decade Come From?"
    },

    # ---------------- 27. AI infrastructure capex ----------------
    {
        "image_prompt": "Massive futuristic data center under construction with cranes and "
                        "glowing server installations, dramatic sunset lighting, the scale "
                        "is enormous, photoreal editorial style",
        "voice_script": "Driver number one — A I infrastructure spending. Big Tech is on track "
                        "to spend over four hundred billion dollars on A I infrastructure in "
                        "twenty twenty six alone. Meta, Microsoft, Google, Amazon, Oracle — "
                        "all committed to multi-year buildouts. NVIDIA captures the lion's share "
                        "of that spend. And here's the kicker — the growth doesn't appear to "
                        "be slowing. If anything, capex announcements keep getting raised "
                        "every quarter.",
        "on_screen_text": "Driver #1 — $400B+ AI Capex in 2026"
    },

    # ---------------- 28. Sovereign AI ----------------
    {
        "image_prompt": "World map at night with major countries glowing in different colors, "
                        "data center icons appearing in Saudi Arabia, UAE, Singapore, India, "
                        "Japan, dark space-style background, futuristic geopolitics theme",
        "voice_script": "Driver number two — sovereign A I. Countries are realizing that A I "
                        "compute is the new strategic resource — the new oil. Saudi Arabia, "
                        "the U A E, Singapore, India, Japan — all building their own national "
                        "A I infrastructure. And all of them are buying NVIDIA. This is an "
                        "entirely new category of customer — governments — and it's growing "
                        "from essentially zero just two years ago.",
        "on_screen_text": "Driver #2 — Sovereign AI (new category)"
    },

    # ---------------- 29. Robotics + autonomous ----------------
    {
        "image_prompt": "Humanoid robot standing in a modern factory beside a self-driving "
                        "car prototype, both with subtle green glowing accents, premium "
                        "editorial product photography, slightly futuristic but realistic",
        "voice_script": "Driver number three — physical A I. NVIDIA Drive for autonomous "
                        "vehicles. Jetson for robotics. Omniverse for digital twins of "
                        "factories and warehouses. The next decade isn't just A I in the "
                        "cloud — it's A I in cars, in factories, in homes, in surgical "
                        "robots. NVIDIA owns the developer platform for all of it. This is "
                        "a tens-of-billions market that barely existed five years ago.",
        "on_screen_text": "Driver #3 — Physical AI (robots, cars, factories)"
    },

    # ---------------- 30. Balance sheet ----------------
    {
        "image_prompt": "Three glowing white metric panels on a dark navy background showing "
                        "large numeric ratios with subtle green accent bars, modern dashboard "
                        "design",
        "voice_script": "The balance sheet is, frankly, fortress-grade. Total debt of eight "
                        "billion against operating cash flow of one hundred and three billion. "
                        "Debt to EBITDA of zero point zero six — basically debt-free. Current "
                        "ratio of three point nine. Interest coverage of five hundred and one "
                        "times. They have sixty two billion in cash and short-term investments. "
                        "NVIDIA could literally pay off all its debt with one month of free "
                        "cash flow.",
        "on_screen_text": "Debt/EBITDA 0.06×  •  Current 3.91×  •  Cash $62.5B"
    },

    # ---------------- 31. Valuation intro ----------------
    {
        "image_prompt": "Vintage brass weighing scale balancing a stack of US dollar coins "
                        "against a glowing G P U chip, soft moody studio lighting, "
                        "conceptual finance image",
        "voice_script": "OK so the business is incredible. But the real question every investor "
                        "is asking — is the stock too expensive at these levels? Let's look at "
                        "valuation three ways. Trailing P E. Forward P E. And discounted cash "
                        "flow.",
        "on_screen_text": "Is It Too Expensive?"
    },

    # ---------------- 32. P/E trailing ----------------
    {
        "image_prompt": "Line chart on a dark trading-platform background with horizontal "
                        "dashed lines marking historical P E average and current level, "
                        "subtle green and orange callouts, clean fintech style",
        "voice_script": "Surprise. Despite trading at all-time highs, NVIDIA's trailing P E "
                        "is actually compressed. Current P E is forty three point nine. The "
                        "five year average is sixty three. The ten year average is fifty six. "
                        "So NVIDIA today is cheaper, on a P E basis, than it has been on average "
                        "for the last five years. Why? Because earnings are growing faster than "
                        "the stock price. That's a beautiful thing.",
        "on_screen_text": "Current P/E 43.9× vs 5-yr Avg 62.9×"
    },

    # ---------------- 33. Forward P/E ----------------
    {
        "image_prompt": "Crystal ball or telescope pointing toward a glowing future graph, "
                        "deep blue and green tones, premium editorial conceptual photo, "
                        "dark background",
        "voice_script": "Forward P E is even more interesting. Based on analyst projections "
                        "of next year's earnings of eleven dollars and thirteen cents per share, "
                        "NVIDIA's forward P E is just nineteen point seven. For context, the "
                        "S and P 500 trades at about twenty two forward P E. That means — if "
                        "analyst projections are right — NVIDIA is actually trading at a discount "
                        "to the broader market. A company growing earnings at twenty three "
                        "percent per year, priced cheaper than the index.",
        "on_screen_text": "Forward P/E: 19.7×  (S&P 500: ~22×)"
    },

    # ---------------- 34. DCF ----------------
    {
        "image_prompt": "Speedometer style gauge with the needle pointing just inside an "
                        "orange overvalued zone, large numeric display showing intrinsic "
                        "value vs price, clean financial dashboard",
        "voice_script": "Discounted cash flow gives us a different angle. Using a twenty three "
                        "percent five-year growth rate, then tapering, with a roughly eight "
                        "percent discount rate — intrinsic value comes out to one hundred and "
                        "ninety six dollars a share. The current price is two hundred and "
                        "nineteen. That's about a twelve percent premium. So by DCF, NVIDIA "
                        "is slightly overvalued. Not crazy overvalued, but no longer a bargain.",
        "on_screen_text": "DCF: Intrinsic $196 vs Price $219 (~12% premium)"
    },

    # ---------------- 35. Risks intro ----------------
    {
        "image_prompt": "Bright red warning triangle floating over a glitchy dark stock "
                        "chart, subtle smoke and dramatic lighting, conceptual risk image",
        "voice_script": "No stock is a slam dunk. And at five trillion dollars, NVIDIA carries "
                        "real risks. Let's talk about the two that could actually hurt you.",
        "on_screen_text": "What Could Go Wrong?"
    },

    # ---------------- 36. Risk 1: AI capex cycle ----------------
    {
        "image_prompt": "A modern data center construction site abruptly stopped, cranes "
                        "frozen mid-air, abandoned half-built server racks, moody overcast "
                        "lighting, editorial photo style",
        "voice_script": "Risk number one — concentration in A I capex. NVIDIA's revenue "
                        "depends heavily on a handful of hyperscalers continuing to spend "
                        "aggressively on A I infrastructure. If Microsoft, Meta, Google, or "
                        "Amazon ever decides they've over-invested in GPUs, or if A I demand "
                        "cools, NVIDIA's earnings could halve overnight. Remember twenty twenty "
                        "two — when crypto mining demand evaporated, NVIDIA's revenue flatlined "
                        "for a full year. The same thing could happen with A I demand. It's "
                        "a feast-or-famine industry.",
        "on_screen_text": "Risk #1 — Hyperscaler AI Capex Cycle"
    },

    # ---------------- 37. Risk 2: Competition + geopolitics ----------------
    {
        "image_prompt": "A world globe with red lines representing trade restrictions cutting "
                        "across a glowing green chip, dramatic dark background, conceptual "
                        "geopolitics theme",
        "voice_script": "Risk number two — competition and geopolitics. China is one of "
                        "NVIDIA's largest end markets, and U S export controls keep tightening. "
                        "If those controls expand, NVIDIA loses access to a market worth tens "
                        "of billions. Meanwhile, custom chips from hyperscalers are slowly "
                        "chipping away at market share. Even a ten percent share loss in data "
                        "center would meaningfully compress earnings. Neither risk is immediate "
                        "— but both compound over years.",
        "on_screen_text": "Risk #2 — China Exports + Custom Chips"
    },

    # ---------------- 38. Bull case summary ----------------
    {
        "image_prompt": "Clean editorial summary card on a dark gradient with five short "
                        "icon-led bullet rows evoking moat, margins, growth, balance sheet, "
                        "and valuation, professional finance magazine layout, no readable text",
        "voice_script": "Let me pull it all together. The bull case. Wide moat from CUDA. "
                        "One hundred and one percent R O E. Seventy one percent gross margins. "
                        "Triple digit growth that's still continuing. Fortress balance sheet "
                        "with sixty two billion in cash. The most important company of the A I "
                        "era. The trade-offs. Slightly overvalued by DCF. High beta — moves "
                        "twice as much as the market. If A I capex disappoints for even one "
                        "quarter, this stock can drop thirty percent in a week. But long term, "
                        "the trajectory still looks unstoppable.",
        "on_screen_text": "The Bull Case in One Slide"
    },

    # ---------------- 39. Personal take ----------------
    {
        "image_prompt": "Thoughtful investor in a modern home office looking at multiple "
                        "monitors with glowing green stock charts and analyst notes, warm "
                        "ambient lighting, conceptual editorial photo",
        "voice_script": "My personal take. NVIDIA isn't a value stock. It's a quality-at-a-premium "
                        "stock. The kind you size carefully, expect drawdowns from, and hold "
                        "for a decade. If you're going in here at all-time highs, dollar cost "
                        "average. Don't go all-in at two hundred and twenty. Watch the next "
                        "earnings report on May twentieth. If hyperscaler guidance stays strong, "
                        "the thesis is intact. If they cut capex — revisit your position fast. "
                        "Either way, this is a stock every serious investor needs to understand.",
        "on_screen_text": "My Personal Take"
    },

    # ---------------- 40. CTA ----------------
    {
        "image_prompt": "Warm thank you end screen with a clean subscribe button glow, soft "
                        "golden bokeh background, room top right and bottom left for thumbnail "
                        "placeholders, premium YouTube outro feel",
        "voice_script": "That's the full NVIDIA breakdown. If this was helpful, smash the "
                        "like button, hit subscribe, and drop a comment with the next stock "
                        "you want me to break down. I read every comment. Stay curious, stay "
                        "disciplined, and I'll see you in the next one.",
        "on_screen_text": "Like  •  Subscribe  •  Comment your next stock"
    },
]

assert len(SLIDES) == 40, f"Expected 40 slides, found {len(SLIDES)}"
