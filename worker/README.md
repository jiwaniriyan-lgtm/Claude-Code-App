# CopperAI Render Worker

Background service that turns `render_jobs` rows (kind=`assembly`) into final
MP4s using FFmpeg. Lives outside the Next.js app so it can have its own deps
and run somewhere with persistent compute.

## What it does

1. Polls Supabase every few seconds for `render_jobs` where
   `status='queued' AND kind='assembly'`.
2. Atomically claims one job (sets `status='processing'`).
3. Reads `input.timeline` (see `lib/assembly/timeline.ts` in the main app for
   the schema), downloads each scene's image/video and any audio assets,
   renders each scene with FFmpeg, concatenates them, mixes voiceover +
   ducked music, optionally burns subtitles.
4. Uploads the final MP4 to the `workbook-video` Supabase Storage bucket,
   inserts a `media_assets` row, marks the job `done`.

## Run locally

```bash
cd worker
cp .env.example .env  # fill in SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
pnpm install
pnpm dev              # watch mode
# or
pnpm once             # process one job then exit (useful for cron / testing)
```

You don't need to install FFmpeg yourself — `@ffmpeg-installer/ffmpeg` pulls
in a static binary at install time.

## Deploy options

| Host       | Notes |
|------------|-------|
| **Railway**  | Easiest. Add the `worker/` directory as a service, set env, deploy. |
| **Fly.io**   | `fly launch` from the worker dir, scale to `vm-size=shared-cpu-2x` for faster renders. |
| **Render**   | Background worker type, no HTTP port needed. |
| **Modal**    | If you want GPU-accelerated NVENC encoding (10x speedup for long videos). |
| **A spare VPS** | Run under systemd. See `worker.service.example`. |

The worker is stateless — you can run multiple replicas. The `claim` step is
race-free thanks to `update … where status='queued'`.

## Environment

```
SUPABASE_URL=                     # or NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=
POLL_INTERVAL_MS=4000             # optional, default 4s
FFMPEG_VERBOSE=                   # set to 1 to print ffmpeg stderr lines
```

## Cost expectations

A 60-second 1080p video with 12 scenes (mostly images + Ken Burns + voiceover
+ music + subtitles) renders in ~25-40 seconds on a 2-vCPU host. Disk usage
during render is roughly 3-4× the final MP4 size — make sure `/tmp` has room.

## Adding new capabilities

- **Word-level subtitles:** add `whisper.ts` that runs OpenAI Whisper on the
  voiceover MP3 to produce per-word timings; replace the SRT generated from
  the script with that for sub-second accuracy.
- **Transitions:** the assembler currently does hard cuts. Add a `xfade`
  pass between scenes — small change in `assembler.ts` (concat → pairwise
  `xfade=transition=…:offset=…`).
- **Avatar overlays / talking heads:** render the avatar video separately
  (Heygen / Higgsfield), then add a fourth filter that overlays it as a
  PiP on the bottom-right.
