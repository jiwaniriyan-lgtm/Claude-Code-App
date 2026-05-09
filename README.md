# CopperAI — V2 Production App

> AI-powered video production studio for YouTube creators. Next.js 14 + Supabase + Stripe.
> Replaces the single-file MVP at `mvp/index.html` (preserved for reference and rollback).

This repository was generated from `COPPERAI_BRIEF.md` per Section 9 Tier 1 + Section 10 Option A. See `COPPERAI_BRIEF.md` for the full product spec.

---

## What's in here

```
app/
  (marketing)/         landing + pricing (public)
  (app)/               authenticated app
    generate/          setup form + idea generation
    workbooks/         list + [id] editor
    history/           saved ideas
    settings/          account + billing
  api/                 server-side proxy (OpenAI, Stripe, workbooks, ideas)
  auth/callback        OAuth + email-link callback
  login/               sign-in / sign-up

components/            React UI (Nav, Toast, IdeaCard, SetupForm, WorkbookEditor)
lib/
  prompts.ts           ★ The 9-state prompt library — VERBATIM port from MVP. Don't paraphrase.
  openai.ts            single-key server proxy
  supabase/            client + server + middleware helpers
  stripe.ts            Stripe wrapper
  auth.ts              tier limit checks
  integrations.ts      stub adapters for V1.1+ (Anthropic, vidIQ, ElevenLabs, Heygen, Higgsfield)
  exportMarkdown.ts    workbook → .md export
  imageCompress.ts     client-side resize (1024px / JPEG q0.85, ported from MVP)

supabase/
  migrations/0001_init.sql    full schema + RLS + storage bucket per Section 11.2

mvp/index.html          Original single-file MVP (preserved, deployable today).
COPPERAI_BRIEF.md       Hand-off brief.
```

---

## Decisions baked in

These were confirmed with the owner during build (see Section 15 of the brief):

| Decision | Setting |
|---|---|
| Pricing tiers | Section 11.4 verbatim — Free $0 / Creator $19 / Pro $49 / Agency $149 |
| Trial | 7-day free trial of any paid tier, card upfront |
| Brand voice | Refined / professional |
| Real integrations | **None in V1.** All prompts AI-simulated. Stub adapters in `lib/integrations.ts` for V1.1+ |
| Storage | Supabase Storage (R2 later if egress becomes an issue) |
| Auth | Supabase Auth, email + Google |
| Sequencing | V1 ships simulated → V1.1 adds Anthropic + vidIQ → V1.2 adds ElevenLabs → V1.3 adds Heygen/Higgsfield |

---

## Deployment — first time

You'll need accounts + keys for: **Supabase**, **OpenAI**, **Stripe**, **Vercel**, and **Google** (OAuth).

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API: copy the URL, anon key, and service role key into `.env.local`.
3. SQL editor → paste and run `supabase/migrations/0001_init.sql`.
4. Authentication → Providers → enable **Email** and **Google**.
   - For Google, follow [Supabase's Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google) to set the OAuth client ID/secret.
5. Authentication → URL configuration → set Site URL to `https://copperai.app` and add `https://copperai.app/auth/callback` to redirect URLs.

### 2. Stripe

1. Create a Stripe account, switch to **Test mode** for setup.
2. Create three products in Stripe Dashboard → Products:
   - **Creator** — $19/month recurring
   - **Pro** — $49/month recurring
   - **Agency** — $149/month recurring
3. Copy each product's price id (`price_...`) into `.env.local` as `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_AGENCY`.
4. Developers → API keys → copy publishable + secret keys.
5. Developers → Webhooks → Add endpoint: `https://copperai.app/api/billing/webhook` with these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_failed`
   Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

### 3. OpenAI

[platform.openai.com/api-keys](https://platform.openai.com/api-keys) → create a key with billing set up. Paste into `OPENAI_API_KEY`. Default model is `gpt-4o-mini` (set `OPENAI_MODEL` to override).

### 4. Vercel

1. Push this repo to GitHub.
2. Import into Vercel → Framework: Next.js (auto-detected).
3. Environment Variables: paste everything from `.env.example` (with real values).
4. Deploy.
5. Domain settings → add `copperai.app` + `www.copperai.app`. Update DNS at your registrar.

### 5. Local dev

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev                  # http://localhost:3000
```

### 6. Migrating the MVP's local users

The original MVP stored everything in `localStorage` per device. Existing users will need to:
1. Sign up on the V2 site.
2. (Optional) Ship a one-time import flow that reads old localStorage JSON. Not implemented in V1 — most users likely have minimal data yet, but the V2 schema (`workbooks`, `workbook_states`, `saved_ideas`) maps directly from the old shapes.

If you want to keep the old single-file site available during transition, host `mvp/index.html` separately at e.g. `mvp.copperai.app`.

---

## V1.1+ roadmap

Stub adapters live in `lib/integrations.ts` — fill in the function bodies, set the env keys, and call them from the relevant routes.

| Version | Adds | Effort | Files to touch |
|---|---|---|---|
| V1.1 | Anthropic Claude fallback | ~1 day | `lib/openai.ts` (wrap with try/catch + fallback to `lib/integrations.ts:callClaude`) |
| V1.1 | vidIQ keyword data | ~1 day | `lib/integrations.ts:fetchVidIQ*` + States 7/8 routes pass real data into prompts |
| V1.2 | ElevenLabs voice MP3 | ~2 days | New `app/api/workbooks/[id]/voice/generate/route.ts` async job, audio bucket in Supabase Storage, audio player in `WorkbookEditor` State 6 |
| V1.3 | Heygen + Higgsfield video | ~3-5 days | Async jobs (Vercel cron / Inngest / QStash), webhook routes, video player |

---

## Testing

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # production build
```

For Stripe webhooks locally, use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

---

## Scope notes / known V1 simplifications

These are intentional V1 cuts, not bugs:

1. **Setup form images don't pre-populate the workbook.** The MVP carried staged images from setup → State 2 client-side. In V1 the setup form sends image *counts* to the idea-generation prompt; the user re-uploads in State 2 of the workbook for vision context. Reason: avoids a complex pre-attach flow before the workbook exists. Fix in V1.x: upload to a temp prefix, then move on workbook creation.
2. **No "Load more" pagination on idea cards.** Always returns 10 — extend `MAX_IDEAS` in `lib/constants.ts` if needed.
3. **No team seats yet despite the Agency tier.** Stripe checkout works; multi-user is V1.4+.
4. **Markdown export only.** Brief Tier 2 #12 (PDF / Notion / Google Docs) is post-launch.
5. **No first-run tutorial.** Brief Tier 2 #9.

---

## License & ownership

Owned by Sameera 5 LLC. All AI prompt strings in `lib/prompts.ts` are battle-tested IP — preserve verbatim, don't paraphrase.
