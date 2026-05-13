# CopperAI deploy checklist

End-to-end steps to take this repo and turn `copperai.app` into a working,
clickable URL. Nothing here is automatic — Claude cannot do these for you
because they require account credentials.

Estimated time: **30-60 minutes** if you already have accounts.

---

## 0. Required accounts

- Vercel (https://vercel.com) — hosts the Next.js app
- Supabase (https://supabase.com) — auth, database, storage
- OpenAI (https://platform.openai.com) — scripts + Whisper transcription
- ElevenLabs (https://elevenlabs.io) — voiceovers + voice clone
- Replicate (https://replicate.com) — image gen + video animation
- Railway / Fly.io / Render — hosts the render worker (any one works)
- Stripe (optional, only if you ever want paid plans)

---

## 1. Supabase

1. Create a new project.
2. Open the **SQL editor** and run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_media_pipeline.sql`
3. Copy the following from **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`  (keep secret — server only)
4. **Authentication → URL Configuration**: add your Vercel domain
   (e.g. `https://copperai.app`) and `http://localhost:3000` to the
   allowed redirect URLs.

---

## 2. ElevenLabs

1. Generate an API key in **Profile → API Keys** → `ELEVENLABS_API_KEY`.
2. (Optional) Upload your own voice samples through the CopperAI Settings
   page after deploy, or skip and use one of the premade voices.

---

## 3. Replicate

1. Create an API token at **Account → API Tokens** → `REPLICATE_API_TOKEN`.
2. Default models used by the app (override with env vars if you want):
   - Image: `black-forest-labs/flux-1.1-pro` (~$0.04 per image)
   - Video: `kwaivgi/kling-v2.1` (~$0.30 per 5-sec clip)

---

## 4. Vercel

1. Push this repo to GitHub if it isn't already.
2. **Vercel → New Project → Import the repo.** Framework preset: **Next.js**.
3. Under **Environment Variables**, paste:

```
NEXT_PUBLIC_SITE_URL=https://copperai.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
ELEVENLABS_API_KEY=...
REPLICATE_API_TOKEN=...
REPLICATE_IMAGE_MODEL=black-forest-labs/flux-1.1-pro
REPLICATE_VIDEO_MODEL=kwaivgi/kling-v2.1
```

4. Deploy. Wait for the build to finish.
5. **Settings → Domains → Add `copperai.app`** (and `www.copperai.app`).
   Vercel will tell you which DNS records to add at your registrar.
6. At your registrar, add the records Vercel asked for. Wait for DNS to
   propagate (usually a few minutes).
7. Visit `https://copperai.app` — should load.

---

## 5. Render worker (the FFmpeg service)

The Vercel functions can't render long videos (60s execution cap), so the
worker lives separately.

### Railway (easiest, ~$5/mo)

1. New project → **Deploy from GitHub repo** → pick this repo.
2. Set the **Root Directory** to `worker/`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Environment variables:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...           # optional — enables Whisper subtitles
POLL_INTERVAL_MS=4000
```

6. Deploy. Check the logs for `[worker] starting`.

### Fly.io alternative

```bash
cd worker
fly launch --no-deploy
# edit fly.toml: cmd = "node dist/index.js"
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=...
fly deploy
```

---

## 6. Smoke test

1. Sign up at `https://copperai.app/login` (creates a row in `profiles`).
2. Go to **Generate** → pick "Have My Own Ideas", pick a niche, click
   Generate. Verify 10 ideas appear.
3. Click **Deep Dive** on one idea. Walk through states 4 (Script) and
   5 (Image + Video Prompts). Generate each.
4. Open the workbook detail page. Top banner should say
   **"Ready to render a final video"** with a **Render full video →** button.
5. Click it. Watch the pipeline:
   - voiceover (~15-30s)
   - 8 images in parallel (~30-60s)
   - assembly (~30-90s, depends on worker host)
6. Final MP4 plays at the bottom and lands in the **Library** tab.

---

## 7. Costs (rough, per generated video)

| Item                              | Cost   |
|-----------------------------------|--------|
| Script generation (GPT-4o-mini)   | ~$0.01 |
| Voiceover (ElevenLabs, 5 min)     | ~$0.40 |
| 8 Flux images                      | ~$0.32 |
| Final assembly                     | $0     |
| Whisper subtitles (optional)       | ~$0.04 |
| **Total**                          | **~$0.80** |

Plus a flat ~$5-10/mo for hosting (Vercel free tier + Railway worker).

---

## Troubleshooting

- **Sign-in loops** — make sure your Vercel domain is in Supabase auth
  allowed URLs.
- **"Storage upload failed"** — confirm `0002_media_pipeline.sql` ran;
  the three new buckets must exist.
- **Worker logs show `[worker] starting` but jobs sit in `queued`** —
  the worker's `SUPABASE_SERVICE_ROLE_KEY` is wrong or the URL points to
  a different project.
- **`ffmpeg: command not found`** — should never happen; the
  `@ffmpeg-installer/ffmpeg` package ships its own binary. If it does,
  reinstall `node_modules` on the worker host.
- **Assembly produces black video** — your Replicate image URLs may be
  expiring before the worker downloads them. The pipeline already stores
  outputs in your Supabase bucket so this shouldn't happen; double-check
  that media_assets rows exist for each image.
