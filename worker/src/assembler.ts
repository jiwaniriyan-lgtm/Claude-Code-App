import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { download } from './download';
import { transcribeToSrt } from './whisper';
import type { Scene, Timeline } from './types';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export type AssemblyResult = {
  outputPath: string;
  workDir: string;
  durationSec: number;
};

/**
 * Build the final MP4 for a Timeline.
 *
 * Strategy: render each scene to its own normalized clip first (consistent
 * resolution, fps, no audio), then concat them via the concat demuxer, then
 * mux in the global voiceover and optional music, then burn subtitles.
 *
 * This is robust and matches how Remotion / Shotstack do it under the hood.
 * The downside is more disk I/O than a single filter_complex; the upside is
 * each scene's filter graph is small and easy to debug.
 */
export async function assemble(timeline: Timeline): Promise<AssemblyResult> {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cai-render-'));
  const { width, height, fps = 30 } = timeline.resolution;

  // 1) Download all source assets in parallel
  const sourceFiles = await Promise.all(
    timeline.scenes.map((s, i) => {
      const ext = s.source.kind === 'image' ? guessImageExt(s.source.url) : '.mp4';
      return download(s.source.url, workDir, `src_${i}${ext}`);
    }),
  );

  // 2) Render each scene to a normalized silent MP4
  const sceneClips: string[] = [];
  for (let i = 0; i < timeline.scenes.length; i++) {
    const scene = timeline.scenes[i];
    const out = path.join(workDir, `scene_${i}.mp4`);
    await renderScene(scene, sourceFiles[i], out, { width, height, fps });
    sceneClips.push(out);
  }

  // 3) Join scene clips — concat demuxer (hard cuts) or xfade chain
  let concatOut: string;
  if (timeline.transitions && sceneClips.length > 1) {
    concatOut = await xfadeChain(sceneClips, timeline, workDir);
  } else {
    const concatList = path.join(workDir, 'concat.txt');
    await fs.writeFile(concatList, sceneClips.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
    concatOut = path.join(workDir, 'concat.mp4');
    await runFfmpeg((cmd) =>
      cmd
        .input(concatList)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy', '-movflags', '+faststart'])
        .save(concatOut),
    );
  }

  // 4) Mux audio (voiceover ± music)
  const audioMixOut = await muxAudio(timeline, concatOut, workDir);

  // 5) Optional subtitle burn-in. If transcribeVoiceover is requested and we
  //    have a voiceover, run Whisper for word-accurate timings; otherwise use
  //    the provided SRT verbatim.
  let finalOut = audioMixOut;
  let srt: string | null = timeline.subtitles?.srt ?? null;
  if (timeline.subtitles?.transcribeVoiceover && timeline.voiceoverUrl) {
    try {
      const voicePath = await download(timeline.voiceoverUrl, workDir, 'voiceover_for_whisper.mp3');
      srt = await transcribeToSrt(voicePath);
    } catch (err) {
      console.error('[assembler] whisper failed, falling back to provided srt:', err);
    }
  }
  if (timeline.subtitles && srt && srt.trim()) {
    const srtPath = path.join(workDir, 'subs.srt');
    await fs.writeFile(srtPath, srt);
    finalOut = path.join(workDir, 'final.mp4');
    await burnSubtitles(audioMixOut, srtPath, finalOut, timeline.subtitles);
  }

  const durationSec = timeline.scenes.reduce((a, s) => a + s.durationSec, 0);
  return { outputPath: finalOut, workDir, durationSec };
}

// ─── Scene rendering ──────────────────────────────────────────────────────

async function renderScene(
  scene: Scene,
  srcFile: string,
  outFile: string,
  res: { width: number; height: number; fps: number },
): Promise<void> {
  const dur = scene.durationSec;

  if (scene.source.kind === 'image') {
    const motion = scene.source.motion ?? 'static';
    // Ken Burns via zoompan. We render at higher resolution then zoompan applies.
    const totalFrames = Math.ceil(dur * res.fps);
    let zoompan: string;
    switch (motion) {
      case 'zoom_in':
        zoompan = `zoompan=z='min(zoom+0.0008,1.2)':d=${totalFrames}:s=${res.width}x${res.height}:fps=${res.fps}`;
        break;
      case 'zoom_out':
        zoompan = `zoompan=z='if(eq(on,0),1.2,max(zoom-0.0008,1.0))':d=${totalFrames}:s=${res.width}x${res.height}:fps=${res.fps}`;
        break;
      case 'pan_left':
        zoompan = `zoompan=z=1.1:x='iw*0.1-(iw*0.1)*on/${totalFrames}':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${res.width}x${res.height}:fps=${res.fps}`;
        break;
      case 'pan_right':
        zoompan = `zoompan=z=1.1:x='(iw*0.1)*on/${totalFrames}':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${res.width}x${res.height}:fps=${res.fps}`;
        break;
      default:
        zoompan = `scale=${res.width}:${res.height}:force_original_aspect_ratio=increase,crop=${res.width}:${res.height}`;
    }

    await runFfmpeg((cmd) =>
      cmd
        .input(srcFile)
        .inputOptions(['-loop', '1', '-framerate', String(res.fps)])
        .outputOptions([
          '-t', String(dur),
          '-vf', `${zoompan},format=yuv420p`,
          '-c:v', 'libx264',
          '-preset', 'veryfast',
          '-crf', '20',
          '-pix_fmt', 'yuv420p',
          '-r', String(res.fps),
          '-an',
        ])
        .save(outFile),
    );
    return;
  }

  // video source
  const trim = scene.source.trimFromSec ?? 0;
  const speed = scene.source.speed ?? 1;
  const speedFilter = speed === 1 ? '' : `,setpts=${(1 / speed).toFixed(4)}*PTS`;
  await runFfmpeg((cmd) =>
    cmd
      .input(srcFile)
      .inputOptions(trim > 0 ? ['-ss', String(trim)] : [])
      .outputOptions([
        '-t', String(dur),
        '-vf', `scale=${res.width}:${res.height}:force_original_aspect_ratio=increase,crop=${res.width}:${res.height}${speedFilter},format=yuv420p`,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '20',
        '-pix_fmt', 'yuv420p',
        '-r', String(res.fps),
        '-an',
      ])
      .save(outFile),
  );
}

// ─── Audio mux ────────────────────────────────────────────────────────────

async function muxAudio(timeline: Timeline, videoIn: string, workDir: string): Promise<string> {
  const hasVoice = !!timeline.voiceoverUrl;
  const hasMusic = !!timeline.musicUrl;
  const out = path.join(workDir, 'with_audio.mp4');

  if (!hasVoice && !hasMusic) {
    // No audio — just copy
    await runFfmpeg((cmd) =>
      cmd.input(videoIn).outputOptions(['-c', 'copy', '-movflags', '+faststart']).save(out),
    );
    return out;
  }

  const inputs: string[] = [videoIn];
  if (hasVoice) inputs.push(await download(timeline.voiceoverUrl!, workDir, 'voiceover.mp3'));
  if (hasMusic) inputs.push(await download(timeline.musicUrl!, workDir, 'music.mp3'));

  await runFfmpeg((cmd) => {
    inputs.forEach((p) => cmd.input(p));

    // Index 0 = video, 1 = voiceover (if present), then music
    const voiceIdx = hasVoice ? 1 : -1;
    const musicIdx = hasMusic ? (hasVoice ? 2 : 1) : -1;

    let filter: string;
    if (hasVoice && hasMusic) {
      const musicVol = timeline.musicVolume ?? 0.18;
      filter =
        `[${musicIdx}:a]volume=${musicVol},aloop=loop=-1:size=2e9[mus];` +
        `[${voiceIdx}:a][mus]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=250[ducked];` +
        `[ducked]apad,atrim=duration=${trimToTotalDuration(timeline)}[aout]`;
    } else if (hasVoice) {
      filter = `[${voiceIdx}:a]apad,atrim=duration=${trimToTotalDuration(timeline)}[aout]`;
    } else {
      const musicVol = timeline.musicVolume ?? 0.4;
      filter = `[${musicIdx}:a]volume=${musicVol},aloop=loop=-1:size=2e9,atrim=duration=${trimToTotalDuration(timeline)}[aout]`;
    }

    cmd
      .complexFilter(filter)
      .outputOptions([
        '-map', '0:v:0',
        '-map', '[aout]',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-movflags', '+faststart',
      ])
      .save(out);
  });
  return out;
}

function trimToTotalDuration(timeline: Timeline): number {
  return timeline.scenes.reduce((a, s) => a + s.durationSec, 0);
}

// ─── Subtitle burn-in ─────────────────────────────────────────────────────

async function burnSubtitles(
  videoIn: string,
  srtPath: string,
  out: string,
  opts: NonNullable<Timeline['subtitles']>,
): Promise<void> {
  const fontSize = opts.fontSize ?? 28;
  const color = (opts.fontColor ?? '#FFFFFF').replace('#', '');
  // Use SubStation Alpha style override via libass for nicer look
  const styles = [
    `Fontsize=${fontSize}`,
    `PrimaryColour=&H00${swapToAss(color)}`,
    `OutlineColour=&H00000000`,
    `BorderStyle=3`,
    `Outline=2`,
    `Shadow=0`,
    `Alignment=${opts.position === 'top' ? 8 : opts.position === 'center' ? 5 : 2}`,
    `MarginV=60`,
  ].join(',');

  await runFfmpeg((cmd) =>
    cmd
      .input(videoIn)
      .outputOptions([
        '-vf', `subtitles=${srtPath.replace(/:/g, '\\:').replace(/'/g, "\\'")}:force_style='${styles}'`,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '20',
        '-c:a', 'copy',
        '-movflags', '+faststart',
      ])
      .save(out),
  );
}

function swapToAss(hex: string): string {
  // FFmpeg/libass uses BBGGRR not RRGGBB
  const r = hex.slice(0, 2), g = hex.slice(2, 4), b = hex.slice(4, 6);
  return `${b}${g}${r}`;
}

// ─── xfade chain ──────────────────────────────────────────────────────────

async function xfadeChain(clips: string[], timeline: Timeline, workDir: string): Promise<string> {
  const tr = timeline.transitions!;
  const dur = Math.max(0.1, Math.min(tr.durationSec, 2));
  const out = path.join(workDir, 'concat.mp4');

  const durations = await Promise.all(clips.map((c) => probeDuration(c)));

  const filters: string[] = [];
  let lastLabel = '0:v';
  let runningOffset = 0;

  for (let i = 1; i < clips.length; i++) {
    runningOffset += durations[i - 1] - dur;
    const outLabel = `vx${i}`;
    filters.push(`[${lastLabel}][${i}:v]xfade=transition=${tr.type}:duration=${dur}:offset=${runningOffset.toFixed(3)}[${outLabel}]`);
    lastLabel = outLabel;
  }

  await runFfmpeg((cmd) => {
    clips.forEach((c) => cmd.input(c));
    cmd
      .complexFilter(filters)
      .outputOptions([
        '-map', `[${lastLabel}]`,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '20',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
      ])
      .save(out);
  });
  return out;
}

function probeDuration(file: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, data) => {
      if (err) return reject(err);
      const d = data.format?.duration;
      if (typeof d === 'number') resolve(d);
      else reject(new Error('no duration'));
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function guessImageExt(url: string): string {
  const m = url.toLowerCase().match(/\.(png|jpe?g|webp|gif)(\?|$)/);
  return m ? `.${m[1].replace('jpeg', 'jpg')}` : '.jpg';
}

function runFfmpeg(setup: (cmd: ffmpeg.FfmpegCommand) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();
    setup(cmd);
    cmd
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .on('stderr', (line) => {
        if (process.env.FFMPEG_VERBOSE) console.error(line);
      });
  });
}
