# CopperAI — Project Brief & Technical Specification

> **Hand-off document for Claude Code to build out the production version of CopperAI.**
> Domain: `copperai.app` · Status: Working MVP (single HTML file) · Owner: Sameera 5 LLC

---

## 1. What CopperAI Is

CopperAI is an AI-powered video production studio for YouTube creators. It systematizes the entire content pipeline — from "I need a video idea" to "I have a script, voice settings, image prompts, thumbnail concepts, and platform-specific publishing bundles ready to go" — into one guided workflow.

**Two starting points for users:**

1. **Clone a YouTube Channel** — paste a channel URL/handle, upload reference frames and thumbnails, and the AI generates ideas in that creator's style.
2. **Have My Own Ideas** — pick a niche, paste reference transcripts, upload visual references, and the AI generates ideas tailored to your existing direction.

**Two flows that follow:**

- **Top-funnel:** AI generates 10 viral video ideas, each with a viral score, tier (VIRAL HIT / HIGH POTENTIAL / TRENDING), outlier factor, and viewer payoff.
- **Deep Dive Workbook:** click any idea → guided 9-step workbook produces a full script (custom duration), image prompts, voice direction, vidIQ-style thumbnails, vidIQ-style titles + descriptions, and adapted bundles for YouTube / Instagram / TikTok / Facebook.

**Why it works:** instead of asking creators to prompt-engineer at every step, CopperAI captures style references upfront (transcripts + images that the AI literally sees through GPT-4o vision) and threads that context through every subsequent generation. The output looks like the creator's existing channel, not generic AI slop.

---

## 2. Current Status

| Aspect | Detail |
|---|---|
| Stack | Single `index.html` file (HTML + CSS + vanilla JS) |
| Lines of code | ~1,800 |
| File size | ~99 KB |
| Backend | None (pure browser) |
| Persistence | `localStorage` |
| API | OpenAI (visitor brings their own key) |
| Model | `gpt-4o-mini` (vision-capable) |
| Hosted? | Not yet deployed — domain `copperai.app` is owned but not pointed |
| Auth? | None |
| Payments? | None |
| Mobile responsive? | Yes (breakpoint at 640px) |

The MVP is feature-complete for solo use. The path to production is mostly: add auth, move OpenAI calls server-side, swap localStorage for a real database, and deploy.

---

## 3. Full Feature Inventory

### 3.1 Landing page (Generate tab)

- **API key card** — visitor pastes their OpenAI key (`sk-...`), key is whitespace-stripped on save, stored in `localStorage`. Shows last 4 chars + length so user can verify what's saved.
- **🧪 Test button** — fires a 5-token call to OpenAI to verify the key works. Returns either ✓ success, the actual API error message, or a structured network-error diagnosis (lists 5 things to check).
- **Mode dropdown** — `<select>` with `Clone a YouTube Channel` and `Have My Own Ideas`. Designed to be extensible (new options added as more features ship).
- **Dynamic setup form** — fields rendered based on dropdown choice:
  - Clone path: channel URL/handle input + optional niche/category
  - Own Ideas path: niche chips (20 preset niches) + custom niche input
  - **Both paths share:**
    - 3 transcript text boxes (default), with **+ Add Another Transcript** button to add more, **Remove** button per box (when more than 1 exists)
    - 🎬 Style reference image uploads (multiple, auto-compressed to 1024px max, JPEG q0.85)
    - 🖼 Thumbnail reference image uploads (3-4 recommended)
    - ⏱ Duration chips: 5 / 10 / 15 / 25 / 30 / 45 min, 1 hour, 2 hours
    - 💭 Free-form notes textarea
- **Generate button** — only appears once a mode is picked. Validates required fields, sends rich context to AI, returns 10 ideas as cards.

### 3.2 Idea cards

Each card shows:
- Idea number
- Tier badge (VIRAL HIT / HIGH POTENTIAL / TRENDING) — color-coded
- Circular viral score gauge (70-99%) with color coding (≥92 green, ≥85 purple, else yellow)
- Title, description
- Outlier Factor box (red, 🚀)
- Viewer Payoff box (purple, 🎯)
- Three action buttons:
  - **🚀 Deep Dive →** (primary, gradient) — creates a workbook pre-filled with setup data, opens at the Script state
  - **📋 Copy** — copies the title to clipboard
  - **💾 Save** — adds to History tab (or **🗑 Remove** when on history page)

### 3.3 History tab

- Lists all saved ideas with their original niche tag and viral score
- Same card UI as Generate (read-only Save state shows ✓ Saved)
- 🗑 Clear All button (with confirm dialog)
- Badge in nav shows count
- Clicking Deep Dive on a history card creates a **fresh blank** workbook (does not pull from current setup data — fixes stale-context bug)

### 3.4 Workbooks tab

- Lists all in-progress and completed Deep Dive workbooks
- Each card shows: niche, idea title, progress bar (% done + skipped), updated time, Open / Delete buttons
- 🗑 Clear All
- Badge in nav shows count

### 3.5 Deep Dive workbook (the engine)

Each workbook has 9 sequential states. The user can navigate freely (Previous/Next), skip optional states, jump via the stepper, or generate via AI. All edits auto-save to localStorage every 350ms.

**Header:** editable workbook name (auto-saves), niche pill, original idea title (breadcrumb).

**Stepper:** horizontal scrolling, shows all 9 states with state-circle status (number / ✓ done / ⊘ skipped) and short label. Click any to jump.

**Bottom nav:** ← Previous · ⊘ Skip (only on optional states) · ⬇ Export · Next →

**The 9 states:**

#### State 1 — Channel Link (required)
- Input: YouTube channel URL or @handle
- AI output: 10-point research framework (title formulas, hook patterns, pacing, B-roll, voice, thumbnails, etc.)
- Pre-filled when arriving from the Clone setup path

#### State 2 — Transcripts & Visual References (optional, vision-enabled)
- Inputs: dynamic transcript boxes (default 3, add unlimited more)
- 🎬 Style reference image uploads
- 🖼 Thumbnail reference image uploads
- AI output: pattern extraction (hook formulas, story structure, visual style, thumbnail patterns) — **AI literally sees the uploaded images via GPT-4o vision**
- Pre-filled when arriving from setup (transcripts and images carry over)

#### State 3 — Analysis + Style DNA (optional)
- Input: optional style notes
- AI output: reusable Style DNA template (hook formula, tone, pacing, rhetorical devices, visual signature, thumbnail DNA, CTA format)

#### State 4 — Script (optional, custom kind)
- Custom UI: ⏱ duration selector (5/10/15/25/30/45 min, 1hr, 2hr) + notes textarea
- AI output: complete YouTube script targeting word count for selected duration (e.g. 10 min ≈ 1500 words, 2 hrs ≈ 18,000 words)
- Includes [BRACKETED VISUAL CUES] every 30-60 sec
- Token budget: 6000 (allows long-form scripts)
- Pre-filled with selected duration when arriving from setup
- **Workbooks coming from setup open here directly**

#### State 5 — Image + Video Prompts (optional, vision-enabled)
- Custom UI: notes textarea + 🎥 toggle "Also generate video clip prompts"
- AI output: 8 image prompts (Midjourney v6 / DALL-E 3 ready, --ar 16:9, scene-by-scene tied to script beats)
- If toggle on: also outputs `=== VIDEO CLIP PROMPTS ===` section with 6 short clip prompts (Runway Gen-3 / Sora / Kling, 5-10 sec each)
- Pulls style images from State 2 for vision context

#### State 6 — Voice Prompts (optional)
- Input: optional voice preferences
- AI output: ElevenLabs-ready direction (voice profile, stability/similarity/style sliders, 3 preset voice suggestions, WPM target, per-section emphasis, SSML/pause markers)

#### State 7 — Thumbnails (vidIQ-Style, optional, vision-enabled)
- Input: optional vidIQ score data, must-include text, banned colors
- AI output: Thumbnail DNA paragraph + 4 distinct thumbnail concepts (close-up face / object focus / split-screen / text-dominant) each with text overlay, Midjourney visual prompt, predicted CTR score
- Pulls thumbnail images from State 2 for vision context

#### State 8 — Title & Description (vidIQ-Style, optional)
- Input: optional vidIQ keyword data, brand notes
- AI output:
  - 5 title options (each with primary keyword + predicted CTR boost + reasoning)
  - Keyword strategy (3 head + 4 mid-tail + 3 long-tail with search intent)
  - Full description (above-the-fold hook + body + timestamps + links + hashtags + CTA)
  - 15 YouTube tags
  - Pinned comment (engagement-bait question)

#### State 9 — Multi-Platform Publish Bundle (optional, custom kind)
- Custom UI: platform tabs (YouTube / Instagram / TikTok / Facebook), edit each independently
- AI output: full bundle for each platform with `=== PLATFORM ===` headers, regex-sliced for tab switching
  - YouTube: title, description, tags, thumbnail text, image prompt, voice note, pinned comment
  - Instagram: ~60s adapted script, caption (≤2200 chars), 30 hashtags, cover prompt, voice note, on-screen text cues
  - TikTok: ~45s tight script, caption (≤150 chars), 5 hashtags, cover, voice note, trend hook suggestion
  - Facebook: 3-5 min landscape script, caption ending in question, hashtags, image prompt, targeting notes
- Token budget: 5000 (long output)
- Copy buttons: copy current platform / copy all platforms

### 3.6 Export

⬇ Export button on workbook produces a Markdown file with:
- Workbook metadata (name, niche, idea, score, dates)
- Each state with input + output (or _(skipped)_ marker)
- Image attachment counts (images themselves stay in localStorage)
- Filename: sanitized workbook name + `.md`

### 3.7 Misc

- Toast notifications (top-right, color-coded green/red)
- Skeleton loaders during generation
- Mobile responsive at 640px
- Inter font from Google Fonts
- Custom dark theme via CSS variables

---

## 4. User Flows

### 4.1 First-time user, Clone path

1. Land on Generate tab → see API key card
2. Paste OpenAI key → click 🧪 Test → ✓ success
3. Pick "🎯 Clone a YouTube Channel" from dropdown
4. Form expands: paste channel URL, optionally type niche
5. Add 3+ transcripts from that channel's top videos
6. Upload 5-10 style reference frames
7. Upload 3-4 reference thumbnails
8. Pick duration (e.g. "15 min")
9. Add optional notes
10. Click ⚡ Generate 10 Viral Ideas
11. AI returns 10 idea cards styled to match the cloned channel
12. Click 🚀 Deep Dive on best idea
13. Workbook opens at **State 4 (Script)** — duration is pre-selected, all upstream context is filled in
14. Click ⚡ Generate Script → 15-min script is written
15. → Next → State 5 → Generate image prompts → toggle video prompts on → Generate
16. → Next → State 6 → Generate voice direction
17. → Next → State 7 → Generate 4 thumbnail concepts
18. → Next → State 8 → Generate vidIQ-style title/description
19. → Next → State 9 → Generate multi-platform bundles
20. ⬇ Export as Markdown

### 4.2 Returning user

- API key restored from localStorage, status shown
- Last selected dropdown mode restored
- Workbooks tab shows all in-progress projects with progress bars
- Click any workbook to resume exactly where they left off

---

## 5. Data Model

### 5.1 localStorage keys

```js
copperai_apikey         // string — user's OpenAI API key
copperai_history        // JSON array — saved ideas
copperai_workbooks_v2   // JSON array — workbooks (current schema version)
copperai_setup_mode     // string — last selected dropdown mode
```

### 5.2 Idea object shape

```ts
type Idea = {
  title: string;           // ≤80 chars
  description: string;     // ≤120 chars
  viral_score: number;     // 70–99
  tier: 'VIRAL HIT' | 'HIGH POTENTIAL' | 'TRENDING';
  outlier_factor: string;  // ≤40 chars
  viewer_payoff: string;   // ≤40 chars
  _niche?: string;         // added when saved to history
  _savedAt?: number;       // unix ms
};
```

### 5.3 Workbook object shape

```ts
type Workbook = {
  id: string;                  // 'wb_<timestamp>'
  name: string;                // editable, defaults to truncated idea title
  niche: string;
  ideaTitle: string;
  ideaDescription: string;
  ideaScore: number;
  setupMode: 'clone' | 'own' | null;  // path that created it
  states: WorkbookState[];     // length 9
  currentStateIdx: number;     // 0-8
  createdAt: number;           // unix ms
  updatedAt: number;
};

type WorkbookState =
  | { n: 1, input: string, output: string, skipped: boolean }
  | { n: 2, input: string, output: string, skipped: boolean,
      transcripts: string[], styleImages: string[], thumbnailImages: string[] }
  // styleImages/thumbnailImages are base64 data URLs
  | { n: 3, input: string, output: string, skipped: boolean }
  | { n: 4, input: string, output: string, skipped: boolean, duration: string }
  | { n: 5, input: string, output: string, skipped: boolean, generateVideo: boolean }
  | { n: 6, input: string, output: string, skipped: boolean }
  | { n: 7, input: string, output: string, skipped: boolean }
  | { n: 8, input: string, output: string, skipped: boolean }
  | { n: 9, input: string, output: string, skipped: boolean };
  // State 9 output contains all 4 platforms with === PLATFORM === headers
```

### 5.4 Setup data (in-memory only)

```ts
type SetupData = {
  mode: 'clone' | 'own' | '';
  channelUrl: string;     // clone path
  niche: string;          // both paths
  transcripts: string[];  // default ['', '', '']
  styleImages: string[];  // base64 data URLs
  thumbnailImages: string[];
  duration: string;       // '5'|'10'|'15'|'25'|'30'|'45'|'60'|'120'
  notes: string;
};
```

---

## 6. Constants

```js
const NICHES = [
  'Finance','Weight Loss','Python','AI Tools','Productivity',
  'Crypto','Fitness','YouTube','Side Hustle','Self Help',
  'Mental Health','Dating','Travel','Meal Prep','Real Estate',
  'Marketing','Study Tips','Mindfulness','Car Reviews','Gaming'
];
const BATCH_SIZE = 10, MAX_IDEAS = 10;
const PLATFORMS = ['YouTube','Instagram','TikTok','Facebook'];
const DURATIONS = [
  { v:'5',  label:'5 min'   },
  { v:'10', label:'10 min'  },
  { v:'15', label:'15 min'  },
  { v:'25', label:'25 min'  },
  { v:'30', label:'30 min'  },
  { v:'45', label:'45 min'  },
  { v:'60', label:'1 hour'  },
  { v:'120',label:'2 hours' }
];
// Word count targets per duration (for AI script generation):
const DURATION_WORDS = {
  '5':750, '10':1500, '15':2250, '25':3750,
  '30':4500, '45':6750, '60':9000, '120':18000
};
```

---

## 7. Design System

```css
:root {
  --bg:     #0d0d1a;   /* page background */
  --bg2:    #13132a;   /* secondary surfaces */
  --bg3:    #1a1a35;   /* tertiary / inputs */
  --card:   #181830;   /* cards */
  --border: #2a2a4a;
  --purple: #a855f7;   /* primary brand */
  --pink:   #ec4899;   /* gradient pair with purple */
  --cyan:   #06b6d4;   /* niche tags */
  --green:  #22c55e;   /* success / done */
  --yellow: #eab308;   /* skipped / warning */
  --text:   #f1f5f9;
  --muted:  #94a3b8;
  --radius: 14px;
}

/* Primary button gradient */
background: linear-gradient(135deg, #7c3aed, #a855f7);

/* Deep Dive accent gradient (purple → pink) */
background: linear-gradient(135deg, #7c3aed, #ec4899);

/* Font: Inter (Google Fonts), weights 400/500/600/700/800/900 */
```

---

## 8. AI Prompts (Reference — these are the IP)

The MVP defines all 9 prompts inline in a `STATES` array. Each has a `buildPrompt(ctx)` function that takes the workbook context and returns a string. Key context fields available:

```js
ctx = {
  niche, ideaTitle, ideaDescription,
  input,           // current state's user input
  prev: { 1: '...', 2: '...', ... },  // outputs of previous states
  transcripts,     // state 2 only
  styleImagesCount, thumbnailImagesCount,  // state 2, 5, 7
  duration,        // state 4 only
  generateVideo    // state 5 only
}
```

When `useVision: true`, base64 image data URLs are passed alongside the prompt as `image_url` content blocks in the OpenAI message.

The actual prompt strings live in the `STATES` array in `index.html`. They've been iterated 5+ times based on output quality. **Preserve them verbatim in the rewrite** — they're the most valuable part of the MVP.

### Idea-generation prompt (top-funnel, in `fetchIdeas()`)

```
You are a viral YouTube content strategist. Generate 10 unique, highly clickable
YouTube video ideas using the context below.

CONTEXT:
{the user's mode + channel/niche + transcripts + image counts + duration + notes}

Generate 10 ideas that match this creator's style and have viral potential.

For each idea return a JSON object with EXACTLY these fields:
- title: (string) compelling clickable YouTube title (max 80 chars)
- description: (string) 1-2 sentence hook/concept (max 120 chars)
- viral_score: (number) viral probability 70-99
- tier: (string) one of: "VIRAL HIT", "HIGH POTENTIAL", "TRENDING"
- outlier_factor: (string) psychological hook phrase (max 40 chars)
- viewer_payoff: (string) what viewer gains phrase (max 40 chars)

Return ONLY a valid JSON array of 10 objects. No markdown, no explanation.
```

---

## 9. Production Roadmap (V2 priorities)

### Tier 1 — Required to launch publicly
1. **User authentication** — email/Google sign-in
2. **Backend proxy for OpenAI** — visitors no longer need their own key; the app uses ONE shared OpenAI key, owner pays per-visitor
3. **Database persistence** — Postgres or similar; replace localStorage so users can access workbooks across devices
4. **Image storage** — CDN/object store for uploaded reference images instead of base64 in DB
5. **Subscription billing** — Stripe; tiered pricing (free trial → paid)
6. **Rate limiting** — per-user token/usage caps to prevent abuse
7. **Domain deployment** — point `copperai.app` to the production app

### Tier 2 — Quality of life
8. **Mobile-first redesign** — current is responsive but not mobile-optimized
9. **Onboarding flow** — first-run tutorial, sample workbook
10. **Templates** — pre-built workbook starters per niche
11. **Workbook sharing** — public links, team collaboration
12. **Better export** — PDF, Notion sync, Google Docs

### Tier 3 — Real integrations (replace AI-simulation with actual APIs)
13. **vidIQ API** — real keyword volume + competition data, not AI estimates
14. **ElevenLabs API** — generate the actual MP3 voice file from the script
15. **DALL-E / Midjourney / Flux** — generate the actual thumbnail and B-roll images
16. **Runway / Sora / Kling** — generate actual video clips
17. **YouTube Data API** — direct upload to channel from the workbook
18. **Meta Graph API** — direct posting to Instagram / Facebook
19. **TikTok API** — direct posting

### Tier 4 — Scale
20. **Team accounts** — multi-seat
21. **Agency tier** — manage multiple creator workbooks
22. **AI fine-tuning** — train a model on each user's existing channel for even tighter style match

---

## 10. Recommended Production Stack

### Option A: Vercel + Supabase + Stripe (recommended for fastest path to production)

```
Frontend:    Next.js 14 (App Router) + TypeScript + Tailwind CSS
Auth:        Supabase Auth (email + OAuth)
Database:    Supabase Postgres
Storage:     Supabase Storage (for uploaded reference images)
Payments:    Stripe (subscription mode)
AI proxy:    Next.js Route Handlers / Server Actions
Hosting:     Vercel
Domain:      copperai.app → Vercel
```

**Pros:** fastest DX, mature ecosystem, generous free tiers. Auth + DB + storage from one vendor (Supabase) keeps things simple.

**Estimated monthly cost at 100 active users:** Supabase $25/mo + Vercel free + OpenAI ~$50-200 + Stripe % of revenue = ~$75-225/mo.

### Option B: Cloudflare full-stack (cheapest at scale)

```
Frontend:    Astro or Next.js on Cloudflare Pages
Auth:        Clerk or Supabase Auth (CF doesn't have first-party auth)
Database:    Cloudflare D1 (SQLite at the edge)
Storage:     Cloudflare R2 (S3-compatible, no egress fees)
Compute:     Cloudflare Workers (for OpenAI proxy)
Cache:       Cloudflare KV
Payments:    Stripe
Domain:      copperai.app → Cloudflare
```

**Pros:** lowest cost, no egress fees, fast globally. Better for heavy traffic.

**Cons:** more glue code; D1 has size limits; ecosystem less polished than Supabase.

**Recommendation:** start with Option A. If costs become a problem (10k+ users), migrate the heavy parts (image storage, OpenAI proxy) to Cloudflare.

---

## 11. Key Architectural Decisions for V2

### 11.1 Move OpenAI calls server-side

Right now, `index.html` calls `https://api.openai.com/v1/chat/completions` directly from the browser using `state.apiKey`. In V2:

- Browser calls `POST /api/generate` on your own backend
- Backend uses a single owner-controlled `OPENAI_API_KEY` env var
- Backend enforces per-user rate limits and logs usage
- Browser no longer touches OpenAI directly

This unlocks: shared key, abuse prevention, usage analytics, model swapping (Claude / Gemini fallbacks), and you stop exposing how prompts are constructed.

### 11.2 Database schema (Postgres / Supabase)

```sql
-- users (handled by Supabase Auth, just reference user_id)

create table workbooks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  name         text not null,
  niche        text,
  idea_title   text not null,
  idea_description text,
  idea_score   int,
  setup_mode   text,
  current_state_idx int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table workbook_states (
  id           uuid primary key default gen_random_uuid(),
  workbook_id  uuid references workbooks on delete cascade not null,
  state_n      int not null,           -- 1-9
  input        text default '',
  output       text default '',
  skipped      boolean default false,
  -- state-specific fields (jsonb for flexibility):
  metadata     jsonb default '{}',     -- { duration, generateVideo, transcripts: [] }
  unique (workbook_id, state_n)
);

create table workbook_images (
  id           uuid primary key default gen_random_uuid(),
  workbook_id  uuid references workbooks on delete cascade not null,
  state_n      int not null,
  kind         text not null,         -- 'style' | 'thumbnail'
  storage_path text not null,         -- Supabase Storage path
  ord          int not null,
  created_at   timestamptz default now()
);

create table saved_ideas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  title        text not null,
  description  text,
  viral_score  int,
  tier         text,
  outlier_factor text,
  viewer_payoff text,
  niche        text,
  saved_at     timestamptz default now()
);

create table usage_log (
  id           bigserial primary key,
  user_id      uuid references auth.users not null,
  endpoint     text not null,         -- 'generate_ideas' | 'generate_state' | etc
  tokens_in    int,
  tokens_out   int,
  cost_usd     numeric(10,4),
  created_at   timestamptz default now()
);

create index on workbooks(user_id, updated_at desc);
create index on saved_ideas(user_id, saved_at desc);
create index on usage_log(user_id, created_at desc);
```

### 11.3 API endpoints (V2)

```
POST   /api/auth/*            (Supabase handles)
GET    /api/workbooks         list user's workbooks
POST   /api/workbooks         create new
GET    /api/workbooks/:id     get one with all states
PATCH  /api/workbooks/:id     update name/state
DELETE /api/workbooks/:id     soft-delete

POST   /api/workbooks/:id/states/:n/generate
       body: { input, transcripts?, duration?, generateVideo? }
       returns: { output: string }

POST   /api/workbooks/:id/images
       body: multipart upload, kind=style|thumbnail
       returns: { url, id }

DELETE /api/workbooks/:id/images/:imgId

POST   /api/ideas/generate
       body: { setupData }
       returns: { ideas: Idea[] }

POST   /api/ideas/save        save to history
GET    /api/ideas/saved       list saved
DELETE /api/ideas/:id

GET    /api/usage             current month's usage stats

POST   /api/billing/checkout  Stripe Checkout session
POST   /api/billing/webhook   Stripe webhook
```

### 11.4 Pricing tiers (suggested starting point)

| Tier | Price | Workbooks | Ideas/mo | Vision images | Long scripts (45min+) |
|---|---|---|---|---|---|
| Free | $0 | 1 active | 30 | 5 total | ❌ |
| Creator | $19/mo | 10 active | 500 | unlimited | ✓ |
| Pro | $49/mo | unlimited | 2000 | unlimited | ✓ + video prompts |
| Agency | $149/mo | unlimited | 10000 | unlimited | ✓ + 3 team seats |

### 11.5 Component structure (Next.js)

```
app/
  (marketing)/
    page.tsx                    # landing page (public)
    pricing/page.tsx
  (app)/
    layout.tsx                  # auth guard
    generate/page.tsx           # current Generate tab
    workbooks/
      page.tsx                  # list
      [id]/page.tsx             # editor (Deep Dive)
    history/page.tsx
    settings/page.tsx
  api/
    workbooks/
    ideas/
    billing/

components/
  WorkbookStepper.tsx
  WorkbookState.tsx             # dispatches to renderers
  StateRenderers/
    SimpleState.tsx
    TranscriptsState.tsx
    ScriptState.tsx
    ImageVideoState.tsx
    PlatformState.tsx
  IdeaCard.tsx
  ImageUpload.tsx
  DurationPicker.tsx
  TranscriptList.tsx
  ApiKeyCard.tsx                # (replaced by usage stats post-migration)

lib/
  openai.ts                     # server-side wrapper
  prompts.ts                    # the 9 prompt builders + idea prompt
  supabase/
    client.ts
    server.ts
  stripe.ts
  imageCompress.ts              # client-side, port from MVP
```

---

## 12. Migration Strategy MVP → V2

1. **Stand up the new app skeleton** (Next.js + Supabase + Stripe setup, deployed to staging)
2. **Port the prompts** verbatim from `index.html` `STATES` array into `lib/prompts.ts`
3. **Port the design system** — copy CSS vars to Tailwind config, port component styles
4. **Build StateRenderers** mirroring the MVP's renderers (SimpleBody / TranscriptBody / ScriptBody / ImageVideoBody / PlatformBody)
5. **Wire OpenAI proxy** server-side
6. **Build setup form** mirroring MVP dropdown + dynamic fields
7. **Build workbook editor** mirroring the MVP stepper + state panel
8. **One-time import script** that lets MVP users upload their localStorage JSON to migrate existing workbooks (optional — most won't have data yet)
9. **Stripe integration** + paywall
10. **Launch**

Estimated build time for V2 production app at this scope: **80-120 dev hours** depending on polish.

---

## 13. Files Included in This Handoff

| File | What it is |
|---|---|
| `index.html` | Working MVP — single-file app, ~1,800 lines, ~99 KB. Drop into any static host and it works. |
| `COPPERAI_BRIEF.md` | This document. |

---

## 14. For Claude Code — Where to Start

If you're handing this to Claude Code to build the V2 production app:

> **Prompt to use:**
>
> "Read COPPERAI_BRIEF.md fully, then read index.html. Your job is to build the V2 production version per Section 9 (Tier 1 priorities) using the stack in Section 10 Option A (Next.js 14 + Supabase + Stripe + Vercel). Preserve the AI prompts in Section 8 verbatim — they are battle-tested and should not be rewritten. Preserve the 9-state workbook flow exactly. Start by:
> 1. Creating the Next.js project with TypeScript + Tailwind + ESLint
> 2. Setting up Supabase (run the SQL in Section 11.2)
> 3. Porting the prompts to `lib/prompts.ts`
> 4. Building the OpenAI server proxy at `app/api/workbooks/[id]/states/[n]/generate/route.ts`
> 5. Building the setup form / dropdown / image upload / duration picker components
> 6. Building the workbook editor with all 5 state renderer types
> 7. Adding Stripe billing with the tiers in Section 11.4
> 8. Deploying to Vercel + pointing copperai.app
>
> Ask me before touching: pricing numbers, brand voice copy, the AI prompts. Otherwise use your best judgment and proceed."

---

## 15. Open Questions / Decisions Pending

These decisions weren't made in the MVP and should be confirmed before V2 build:

1. **Pricing** — are the tiers in 11.4 about right? Free tier limits?
2. **Trial** — 7-day free trial of Creator tier, or just freemium?
3. **Brand voice** — current MVP uses casual/clean. Should V2 marketing copy be more aggressive ("clone any channel in 60 seconds") or more refined?
4. **Real integrations vs AI-simulated** — vidIQ data, ElevenLabs voice, DALL-E images: do you want these in V1, or stay AI-simulated for cost reasons?
5. **Direct social uploads** — YouTube Studio API integration is non-trivial; do we ship without it and add later?
6. **AI fallback model** — if OpenAI is down, fall back to Anthropic Claude or Google Gemini?
7. **Mobile app** — V2 web-first, or also React Native app?

---

*End of brief. Total ~3,800 words. Combined with `index.html`, this is a complete handoff package.*
