"""
Cintas (CTAS) YouTube Video — 40 slides
Each slide has:
    image_prompt   -> sent to image API
    voice_script   -> sent to ElevenLabs TTS
    on_screen_text -> overlay text drawn on top of the image (optional)

Target total runtime: ~16 minutes (~24 sec per slide on average).
"""

GLOBAL_IMAGE_STYLE = (
    "modern editorial finance aesthetic, dark navy and teal palette with gold accents, "
    "cinematic professional lighting, clean minimalist composition, photoreal where appropriate, "
    "no logos, no readable text in the image, 16:9 widescreen"
)

SLIDES = [
    {
        "image_prompt": "Cinematic ultra-wide shot of a modern American industrial park at golden hour, "
                        "a clean white delivery van with stylized blue workwear branding parked at a "
                        "warehouse loading bay, workers in matching navy uniforms walking with crisp "
                        "folded shirts in their arms, shafts of warm sunlight, shallow depth of field, "
                        "photoreal commercial photography",
        "voice_script": "What if I told you one of the best performing stocks of the last decade isn't a "
                        "tech giant, isn't an AI company, and doesn't even sell a product most investors "
                        "get excited about? It rents out work uniforms. It cleans floor mats. It refills "
                        "first aid kits. And over the last ten years it has crushed the S and P 500. "
                        "Today we're going deep on Cintas, ticker C T A S, and I'll walk you through why "
                        "this so-called boring business might be the kind of compounder serious investors "
                        "quietly love, and what the current pullback could mean.",
        "on_screen_text": "A $70 Billion Compounder Hiding in Plain Sight"
    },
    {
        "image_prompt": "Minimalist dark navy background with subtle pinstripe texture, soft golden spotlight, "
                        "clean serif title card design, no people",
        "voice_script": "Quick note before we dive in. Everything you're about to hear is my own research "
                        "and opinion, shared purely for education and entertainment. This is not financial "
                        "advice. Stocks go up, stocks go down, and the decision to buy or sell is always yours.",
        "on_screen_text": "Educational content only. Not financial advice."
    },
    {
        "image_prompt": "Modern fintech style infographic card on a dark gradient background, a glowing blue "
                        "ticker symbol effect, subtle line art icons for industrials and business services, "
                        "clean sans-serif typography feel, soft chart line in the background",
        "voice_script": "Cintas trades on the NASDAQ under the ticker C T A S. It sits inside the industrials "
                        "sector, specifically specialty business services. It's a large cap name worth around "
                        "seventy billion dollars, and while its revenue is loosely tied to the economy, the "
                        "business model is unusually steady. We'll see why in a minute.",
        "on_screen_text": "CTAS  |  NASDAQ  |  Large Cap  |  ~$69.9B"
    },
    {
        "image_prompt": "Stock chart on a dark trading platform background, a steady upward staircase line in "
                        "teal, a recent dip highlighted with a soft red glow, an S and P 500 comparison line "
                        "below it in orange, clean minimal UI",
        "voice_script": "My one line thesis on Cintas is simple. It's a highly predictable, recurring revenue "
                        "compounding machine, and the recent price pullback may be giving long term investors "
                        "a more reasonable entry into a business that almost never goes on sale. Let me defend "
                        "that statement with the numbers.",
        "on_screen_text": "Thesis: A predictable compounding machine — now on sale"
    },
    {
        "image_prompt": "Split screen illustration: left side a friendly route driver in a navy and white uniform "
                        "handing freshly pressed shirts to a restaurant manager; right side a clean modern "
                        "infographic showing four icons (uniform, first aid kit, fire extinguisher, floor mat) "
                        "connected to a central delivery truck, flat modern editorial illustration style",
        "voice_script": "So what does Cintas actually do? At the core, Cintas is the largest provider of uniform "
                        "rental and workplace services in North America. It serves more than one million "
                        "businesses across the U S, Canada, and Latin America. It designs, manufactures, cleans, "
                        "and delivers uniforms, but it also runs four overlapping service lines. Uniform rental "
                        "and facility services, things like floor mats, mops, restroom supplies. First aid and "
                        "safety, which is its fastest growing segment. Fire protection, extinguishers, sprinklers, "
                        "alarms. And direct sales of uniforms and gear. Most people see a Cintas truck and think "
                        "uniform company. The reality is, Cintas is a subscription logistics business wearing a "
                        "uniform company's clothing.",
        "on_screen_text": "Uniforms • Facility Services • First Aid • Fire Protection"
    },
    {
        "image_prompt": "Photoreal close up of a clean industrial laundry conveyor inside a brightly lit facility, "
                        "neatly tagged and folded workshirts moving down the line, workers in the background "
                        "quality checking garments, slight bokeh, warm clinical lighting",
        "voice_script": "Here's what makes this business special. Roughly eighty to eighty five percent of "
                        "Cintas's revenue is recurring. It comes from contracts that automatically renew week "
                        "after week. Once a business signs on, switching providers is a nightmare. You'd have "
                        "to re-size every employee, re-brand all the garments, renegotiate prices, and reschedule "
                        "deliveries. So most customers don't switch. Cintas keeps about ninety five percent of "
                        "them, and the average client stays for more than ten years. That kind of stickiness is "
                        "what gives this stock its compounder reputation.",
        "on_screen_text": "80–85% recurring  •  95% retention  •  10+ year customer life"
    },
    {
        "image_prompt": "Wide aerial map illustration of North America with glowing blue dots representing "
                        "hundreds of distribution centers and pulsing lines connecting them to small city clusters, "
                        "a fleet of small delivery vans animated along the routes, dark navy background with "
                        "subtle grid, modern data visualization style",
        "voice_script": "Now think about the physical footprint. Cintas runs four hundred seventy eight processing "
                        "facilities and over twelve thousand delivery routes across three hundred thirty cities. "
                        "That's forty eight thousand three hundred employees handling pickups, drop offs, repairs, "
                        "replacements, every single week. It even owns five of its own manufacturing plants, so it "
                        "produces its standard uniform lines in house instead of relying on third parties. This "
                        "kind of route density is almost impossible to copy. A new entrant would need years of "
                        "losses just to build the network.",
        "on_screen_text": "478 facilities • 12,100 routes • 330 cities • 48,300 employees"
    },
    {
        "image_prompt": "Clean modern donut chart on a dark background, four colored segments labeled in spirit as "
                        "Uniform Rental, First Aid, Fire Protection, Direct Sales, soft glow around the chart, "
                        "minimalist fintech design",
        "voice_script": "Looking at the revenue mix. Uniform rental and facility services is still king at about "
                        "seventy seven percent of sales. First aid and safety brings in nearly twelve percent and "
                        "is the fastest growing slice. Fire protection adds another eight percent. Direct uniform "
                        "sales are the smallest piece. The gross margins on each of these are strong. Roughly "
                        "forty nine percent for uniforms, fifty seven percent for first aid and safety, and around "
                        "forty seven percent for the rest. These are not the margins of a boring commodity business.",
        "on_screen_text": "Revenue Mix:  Uniforms 77%  |  First Aid 12%  |  Fire 8%  |  Direct 3%"
    },
    {
        "image_prompt": "Animated style bar chart with six rising bars in a clean blue to teal gradient, dark "
                        "background, modern motion graphics aesthetic",
        "voice_script": "Now let's get into the numbers, because this is where Cintas really earns its reputation. "
                        "Revenue has gone up every single year. From seven point one billion in twenty twenty one "
                        "to over eleven billion on a trailing twelve month basis. That's not flashy growth, but "
                        "it's the kind of steady climb that compounds beautifully over decades.",
        "on_screen_text": "Revenue: $7.1B → $11.0B (2021 → LTM)"
    },
    {
        "image_prompt": "Bar chart with six rising green bars showing income growth on a dark navy background, "
                        "subtle glow effect on the tallest bars, modern dashboard style",
        "voice_script": "Net income tells the same story. Up every year, from one point one billion to nearly "
                        "two billion. And profits are growing faster than revenue, which means margins are "
                        "quietly expanding.",
        "on_screen_text": "Net Income: $1.1B → $1.93B"
    },
    {
        "image_prompt": "Abstract image of clean stacks of US dollar coins flowing like water from an industrial "
                        "pipe into a glowing vault, dark cinematic lighting, photoreal",
        "voice_script": "And it's not just accounting profit. Cash flow from operations has nearly doubled in "
                        "five years, hitting two point two billion dollars on a trailing basis. Cintas is a "
                        "real cash generating machine, and that cash funds dividends, buybacks, and acquisitions.",
        "on_screen_text": "Operating Cash Flow: $1.36B → $2.20B"
    },
    {
        "image_prompt": "Side by side comparison bar chart, taller bars on the left towering over shorter grey "
                        "bars on the right, sleek financial dashboard look, dark background",
        "voice_script": "Compare Cintas to the broader industry, and the gap is huge. Gross margin averages "
                        "around forty seven percent versus an industry average of thirty five. Net margin "
                        "averages sixteen percent versus less than ten for the industry. So Cintas keeps about "
                        "sixty cents more profit on every dollar of sales than its peers. That's a moat showing "
                        "up in the income statement.",
        "on_screen_text": "Gross Margin 47% vs 35%  |  Net Margin 16% vs 10%"
    },
    {
        "image_prompt": "Stylized infographic of a large percentage number rising out of a chart, blue and gold "
                        "accents, financial magazine style, dark gradient background",
        "voice_script": "Return on equity is the metric that great compounders all share. And Cintas is delivering "
                        "over forty one percent. It's averaged about thirty seven percent for five years and it's "
                        "been climbing. Translation. For every dollar shareholders have invested, the company is "
                        "generating forty one cents back. Year after year.",
        "on_screen_text": "Return on Equity: 41.2% (LTM)"
    },
    {
        "image_prompt": "Two panel infographic, left panel shows a rising line chart, right panel shows a "
                        "descending line, clean modern dashboard look on dark navy",
        "voice_script": "Free cash flow per share has been climbing steadily. Partly because the business is "
                        "growing, and partly because Cintas keeps buying back its own stock. Shares outstanding "
                        "have been quietly shrinking. The only thing to flag here is that the pending UniFirst "
                        "acquisition will add about fourteen million new shares, slightly diluting the share "
                        "count for the first time in years. That's a known and intentional trade off.",
        "on_screen_text": "FCF/Share ↑   •   Shares Outstanding ↓ (~404M)"
    },
    {
        "image_prompt": "Calendar pages flipping to reveal a steadily rising dividend cheque on a wooden desk, "
                        "soft warm lighting, photoreal, financial editorial style",
        "voice_script": "For income investors, the yield looks small at about one percent, but the dividend "
                        "itself has grown at fifteen percent a year for the last five years. That kind of "
                        "dividend growth, sustained, is what turns a modest yield today into a serious income "
                        "stream a decade from now.",
        "on_screen_text": "Dividend 5-yr CAGR: 15%  •  Yield: ~0.99%"
    },
    {
        "image_prompt": "Cinematic image of a medieval style stone fortress fused with a modern logistics "
                        "warehouse, glowing teal water moat around it, dramatic sky, conceptual editorial "
                        "illustration",
        "voice_script": "Now let's talk about the moat. Because numbers like these don't happen by accident. "
                        "There are three big reasons Cintas is so hard to compete with.",
        "on_screen_text": "Why Nobody Can Easily Steal This Business"
    },
    {
        "image_prompt": "Bird's eye view of city streets with multiple service trucks weaving efficient "
                        "overlapping routes, glowing path lines connecting hundreds of small business pins, "
                        "infographic meets photoreal style",
        "voice_script": "First. Economies of scale. Especially route density. Twelve thousand routes across "
                        "three hundred thirty cities means every truck makes more stops per day, and every "
                        "facility processes more garments per shift. The cost per delivery is structurally "
                        "lower than any smaller rival can achieve. A new entrant would burn years of losses "
                        "just trying to build a footprint that could compete.",
        "on_screen_text": "Moat #1 — Economies of Scale"
    },
    {
        "image_prompt": "A frustrated office manager surrounded by paperwork, measuring tape, fabric swatches "
                        "and contract documents, sticky notes everywhere, headache visualized with subtle "
                        "motion lines, editorial illustration style",
        "voice_script": "Second. Switching costs. If you're a restaurant chain with five thousand employees "
                        "and you want to leave Cintas, you have to re-measure every worker, re-brand all the "
                        "garments, renegotiate prices, and disrupt your delivery schedule. Most customers "
                        "decide it's just not worth the headache. That's why retention sits around ninety "
                        "five percent.",
        "on_screen_text": "Moat #2 — High Switching Costs"
    },
    {
        "image_prompt": "Close up of a healthcare worker in clean medical scrubs, a fire safety inspector with "
                        "a clipboard in the background, and a construction worker in flame resistant clothing, "
                        "a montage united by clean professional uniforms, warm photoreal style",
        "voice_script": "Third. Brand and regulatory expertise. Cintas has a ninety five year reputation as the "
                        "safe choice in industries where one mistake is catastrophic. Hospitals, fire protection "
                        "clients, OSHA regulated workplaces. They don't want to gamble on the new guy. As "
                        "regulations get more complex, that institutional knowledge becomes harder for new "
                        "players to replicate.",
        "on_screen_text": "Moat #3 — Brand & Compliance Expertise"
    },
    {
        "image_prompt": "Three pawn pieces on a chessboard, two large in the foreground and one being lifted "
                        "off the board, dramatic moody lighting, conceptual business image",
        "voice_script": "Let's zoom out and look at the competitive landscape. Because something major is "
                        "happening here.",
        "on_screen_text": "The Big Three are about to become the Big Two"
    },
    {
        "image_prompt": "Three blue skyscraper style bar charts of dramatically different heights against a "
                        "clean white grid background, the tallest bar towering above the others, modern "
                        "financial graphic style",
        "voice_script": "In market cap terms, this isn't really a fight. Cintas is worth nearly seventy billion "
                        "dollars. UniFirst, the third largest player, is about four point five billion. Vestis "
                        "is just one point three billion. Cintas is roughly the size of its two largest rivals "
                        "combined, times ten. The North American uniform rental market alone is about twenty "
                        "one billion dollars a year, plus another twenty seven billion in workplace supplies. "
                        "So plenty of room to grow.",
        "on_screen_text": "Market Cap:  CTAS $69.9B   |   UNF $4.5B   |   VSTS $1.3B"
    },
    {
        "image_prompt": "A small truck struggling uphill on a dusty road while a large fleet of clean modern "
                        "vans cruise past on a smooth highway above, conceptual editorial photo composite",
        "voice_script": "Vestis became the second largest U S pure play uniform services operator after spinning "
                        "out of Aramark in twenty twenty three. But the spin off was rough. Vestis lost its "
                        "financial support, lost route density, and lost customers. Many of those customers went "
                        "straight to Cintas, the only company big enough to absorb them. Today Vestis is "
                        "shrinking, while Cintas is expanding. Their net profit margin is negative. Cintas's is "
                        "seventeen and a half percent.",
        "on_screen_text": "Vestis (VSTS): shrinking since 2023 spin-off"
    },
    {
        "image_prompt": "Two corporate logos abstracted into puzzle pieces clicking together against a soft "
                        "blue gradient background, golden glow at the seam, modern M and A graphic",
        "voice_script": "And then there's UniFirst, the third largest player with about two hundred fifty "
                        "service locations and three hundred thousand customer sites. On March eleventh, twenty "
                        "twenty six, Cintas announced a definitive agreement to buy UniFirst for three hundred "
                        "ten dollars a share. Half cash, half stock. That's an enterprise value of roughly "
                        "five and a half billion dollars. Interestingly, this is the third time Cintas has tried "
                        "to acquire UniFirst. Two earlier attempts in twenty twenty two and January twenty twenty "
                        "five fell apart. This time it's official.",
        "on_screen_text": "Cintas → UniFirst:  $310/share  •  EV ~$5.5B"
    },
    {
        "image_prompt": "Pie chart of the North American uniform rental market, one massive segment growing "
                        "visibly larger as a smaller segment merges into it, clean financial infographic style",
        "voice_script": "Why does this deal matter? Four reasons. One. It lifts Cintas's market share from "
                        "about thirty five percent to roughly forty six percent, turning the Big Three into a "
                        "Big Two. Two. Combined customer count jumps to about one point five million, a forty "
                        "percent increase. Three. Combining delivery routes is expected to deliver about three "
                        "hundred seventy five million dollars in cost savings over four years. And four. Cintas "
                        "now gets to cross sell its high margin first aid, safety, and fire protection services "
                        "to two million new uniformed employees. If the deal closes, it's a massive runway. The "
                        "risk? Antitrust approval from the F T C. If regulators block it, Cintas pays a three "
                        "hundred fifty million dollar reverse termination fee. Meaningful, but not a balance "
                        "sheet threat.",
        "on_screen_text": "35% → 46% market share  •  +40% customers  •  $375M synergies"
    },
    {
        "image_prompt": "Stock chart with three lines: a powerful rising line, a flat line, and a declining "
                        "line, dark trading terminal background, glowing data points",
        "voice_script": "Now compare the stock performance. Over the past five years, Cintas is up over one "
                        "hundred percent. Over ten years, it's up nearly six hundred eighty five percent. "
                        "UniFirst has barely moved. Vestis is down almost fifty percent. The market has already "
                        "priced in the fact that scale wins in this industry, and Cintas has the scale.",
        "on_screen_text": "10-yr Return:  CTAS +685%  |  UNF +140%  |  VSTS −49%"
    },
    {
        "image_prompt": "A clean white road stretching into the horizon at sunrise, modern delivery trucks "
                        "driving forward with anticipation, hopeful cinematic mood",
        "voice_script": "So if you're a long term investor, the real question is. Where's the next decade of "
                        "growth coming from?",
        "on_screen_text": "Where does the next decade of growth come from?"
    },
    {
        "image_prompt": "Friendly nurse in clean light blue medical scrubs greeting a patient in a modern "
                        "hospital corridor, soft natural lighting, photoreal documentary style",
        "voice_script": "Driver number one. The UniFirst deal. Beyond cost savings, this expands Cintas's "
                        "customer base by forty percent and pushes it deeper into the medical scrubs market, "
                        "which is structurally growing because of the aging population in the U S. UniFirst "
                        "alone generated two point four three billion dollars in revenue last year. That's "
                        "immediate top line growth the day the deal closes.",
        "on_screen_text": "Growth Driver #1 — Route Network Expansion"
    },
    {
        "image_prompt": "A route service representative inside a small business showing the manager a clean "
                        "first aid wall cabinet alongside a uniform delivery cart, warm friendly atmosphere, "
                        "editorial photo style",
        "voice_script": "Driver number two. Cross selling. Cintas already has a relationship with over a "
                        "million businesses. Many of them only use one service. Selling them an additional "
                        "first aid program or a fire extinguisher inspection contract costs almost nothing. "
                        "The truck is already showing up. These are higher margin services, and they massively "
                        "boost lifetime customer value.",
        "on_screen_text": "Growth Driver #2 — Cross-Selling"
    },
    {
        "image_prompt": "Three glowing white panels on a dark background showing large numeric values, subtle "
                        "blue and gold accent bars, modern dashboard design",
        "voice_script": "And the balance sheet is rock solid. Current ratio of one point two five means short "
                        "term assets comfortably cover short term liabilities. Debt to EBITDA below one. That's "
                        "exceptionally low for a company this size. And debt servicing eats up less than five "
                        "percent of cash flow. So Cintas has plenty of firepower to absorb the UniFirst deal "
                        "and keep investing without overleveraging.",
        "on_screen_text": "Current Ratio 1.25×  •  Debt/EBITDA 0.88×  •  Debt Service 4.85%"
    },
    {
        "image_prompt": "A vintage brass weighing scale balancing a stack of US dollar coins against a small "
                        "printed stock certificate, soft moody studio lighting, conceptual finance image",
        "voice_script": "All of this looks great on paper. But is the stock actually a good buy at today's "
                        "price? Let's look at valuation two ways. Price to earnings, and discounted cash flow.",
        "on_screen_text": "Is it cheap? Let's run the numbers."
    },
    {
        "image_prompt": "P/E ratio chart with a horizontal dashed line at the average, a candle line dipping "
                        "back down to it from a peak, clean trading platform style",
        "voice_script": "Cintas trades at a price to earnings ratio of about thirty six point seven times. "
                        "Which is actually slightly below its ten year average of thirty seven point seven. So "
                        "compared to its own history, the stock is fairly priced. Not cheap. Not expensive. The "
                        "recent pullback pushed it from the fifties back to the average. It's not a deep value "
                        "play. Premium businesses rarely are.",
        "on_screen_text": "P/E Current 36.7×  |  Avg 37.7×  |  High 57.2×  |  Low 18.4×"
    },
    {
        "image_prompt": "Clean financial spreadsheet on a dark monitor, key cells highlighted in soft teal "
                        "showing growth rates and discount inputs, slight chromatic glow, professional "
                        "analyst desk",
        "voice_script": "For the discounted cash flow, I'm using the company's own five year E P S growth of "
                        "about sixteen point eight percent, and a blended analyst projection of about twelve "
                        "point three percent going forward. Discount rate of six point three four percent, "
                        "operating cash flow of two point two billion, and roughly four hundred five million "
                        "shares outstanding.",
        "on_screen_text": "DCF Inputs:  Growth 12–17%  •  Discount 6.34%  •  OCF $2.2B"
    },
    {
        "image_prompt": "A speedometer style gauge with the needle resting almost exactly in the middle "
                        "between an undervalued green zone and an overvalued red zone, clean financial "
                        "dashboard",
        "voice_script": "In the base case, assuming fifteen percent free cash flow per share growth for five "
                        "years, then tapering to twelve point seven percent, then four percent terminal. "
                        "Intrinsic value comes out to about one hundred seventy four dollars and sixty nine "
                        "cents per share. The current price is one hundred seventy five dollars and ninety "
                        "cents. So in the base case, Cintas is trading essentially at fair value. About a "
                        "zero point seven percent premium. That's not a screaming bargain, but it's a "
                        "reasonable entry for a long term holder.",
        "on_screen_text": "DCF Base Case:  Intrinsic $174.69  vs  Price $175.90"
    },
    {
        "image_prompt": "Same speedometer style gauge, this time the needle leaning slightly into the orange "
                        "overvalued zone, clean financial dashboard",
        "voice_script": "If we get more conservative and just use the twelve point six seven percent analyst "
                        "growth rate across the board, which is more cautious, intrinsic value drops to about "
                        "one hundred fifty five dollars and seventy seven cents per share. That puts the stock "
                        "about thirteen percent above fair value. So the takeaway is, Cintas is not cheap. It's "
                        "either fairly valued or slightly expensive depending on your assumptions. For long "
                        "term compounders like this, fair value can still be a perfectly fine buy. Just don't "
                        "expect a deep discount.",
        "on_screen_text": "DCF Conservative:  Intrinsic $155.77  •  ~13% premium"
    },
    {
        "image_prompt": "A red warning triangle floating over a dark stock chart background, subtle smoke and "
                        "dramatic lighting, conceptual risk image",
        "voice_script": "No stock is a slam dunk. So let's talk about what could go wrong.",
        "on_screen_text": "What could go wrong?"
    },
    {
        "image_prompt": "A rising oil barrel price chart in red, overlaid with a row of trucks and a pay stub "
                        "icon, dark serious editorial mood",
        "voice_script": "First. Cost inflation. With forty eight thousand three hundred employees on payroll, "
                        "Cintas is exposed to wage inflation. Healthcare benefits costs jumped five point eight "
                        "percent year over year. About nine hundred employees are unionized. And rising diesel "
                        "prices, driven partly by Middle East tensions, directly raise transportation costs. If "
                        "wage inflation outpaces pricing for twenty four months, operating margin could compress "
                        "by about one hundred basis points and F Y twenty twenty seven operating income could "
                        "drop by one hundred twenty six to one hundred ninety million dollars. That's a three "
                        "to four percent hit to E P S.",
        "on_screen_text": "Risk #1 — Wage, Healthcare & Diesel Inflation"
    },
    {
        "image_prompt": "A judge's gavel coming down on a paper document, red rubber stamp partially showing, "
                        "dramatic editorial photo",
        "voice_script": "Second. The UniFirst deal could be blocked. Merging the number one and number three "
                        "players raises serious antitrust questions. The Federal Trade Commission has to sign "
                        "off. If regulators kill the deal, Cintas owes UniFirst a three hundred fifty million "
                        "dollar reverse termination fee, and the growth story tied to this acquisition "
                        "disappears. The core business still works, but a lot of the medium term upside is "
                        "tied to this merger going through.",
        "on_screen_text": "Risk #2 — FTC Could Block the UniFirst Deal"
    },
    {
        "image_prompt": "A clean editorial summary card on a dark gradient background, five short bullet icons "
                        "evoking recurring revenue, scale, margins, M and A, and a balance sheet, professional "
                        "finance magazine layout",
        "voice_script": "So let me pull all of this together. Cintas is the dominant player in a sticky, "
                        "recurring revenue business with ninety five percent customer retention. It's growing "
                        "revenue, profits, and cash flow every single year. Margins are double the industry "
                        "average. Return on equity is over forty percent. The balance sheet is conservative. "
                        "A transformative acquisition is on the table that could push market share to nearly "
                        "fifty percent and unlock a million new cross sell opportunities. The pullback has "
                        "brought the stock back to its long term average valuation. The trade offs are real. "
                        "Wage inflation, diesel costs, and F T C risk. But the long term thesis is clean and "
                        "well defined.",
        "on_screen_text": "The Bull Case in One Slide"
    },
    {
        "image_prompt": "A calm investor in a comfortable home office looking thoughtfully at a glowing stock "
                        "chart on a large monitor, warm ambient lighting, conceptual editorial photo",
        "voice_script": "My personal take? Cintas isn't a stock you buy hoping to double in a year. It's the "
                        "kind of business you tuck into a long term portfolio and let do its thing for the next "
                        "decade. If the UniFirst deal closes, this story gets even more interesting. If it "
                        "doesn't, the underlying business is still one of the best in industrial services. As "
                        "always. Do your own homework, size your position based on your risk tolerance, and "
                        "never bet the farm on one ticker.",
        "on_screen_text": "My Personal Take"
    },
    {
        "image_prompt": "Warm thank you end screen with a clean subscribe button glow, soft golden bokeh "
                        "background, space top right and bottom left for video thumbnails",
        "voice_script": "That's the full Cintas breakdown. If this was helpful, smash the like button, hit "
                        "subscribe, and drop a comment telling me which stock you want me to break down next. "
                        "I read every comment. Stay curious, stay disciplined, and I'll see you in the next one.",
        "on_screen_text": "Like  •  Subscribe  •  Comment your next stock"
    },
]

# Sanity check
assert len(SLIDES) == 40, f"Expected 40 slides, found {len(SLIDES)}"
