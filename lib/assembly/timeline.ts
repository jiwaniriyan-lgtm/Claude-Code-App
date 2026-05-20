/**
 * Timeline schema for the assembly worker.
 *
 * A Timeline describes a final video: an ordered list of Scenes, each backed
 * by either an image (Ken Burns / zoom-pan) or a video clip, plus an optional
 * voiceover audio track and subtitle overlay.
 *
 * The /api/render-assembly route persists a Timeline as render_jobs.input;
 * the worker (worker/index.ts) reads it back, fetches assets, runs ffmpeg,
 * and uploads the final MP4.
 */

export type Resolution = {
  width: number;
  height: number;
  /** 30 by default. Set to 24 for cinematic, 60 for action. */
  fps?: number;
};

export const RESOLUTIONS = {
  '16:9_1080p': { width: 1920, height: 1080, fps: 30 },
  '9:16_1080p': { width: 1080, height: 1920, fps: 30 },
  '1:1_1080p':  { width: 1080, height: 1080, fps: 30 },
} satisfies Record<string, Resolution>;

export type SceneSource =
  | { kind: 'image'; url: string; motion?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'static' }
  | { kind: 'video'; url: string; trimFromSec?: number; speed?: number };

export type Scene = {
  id: string;
  /** Seconds. If voiceoverUrl is set, durationSec is auto-clamped to its length. */
  durationSec: number;
  source: SceneSource;
  /** Caption shown over the scene (single line, displayed centered or as subtitle). */
  caption?: string;
  /** Per-scene narration (if absent, top-level audio is used). */
  voiceoverUrl?: string;
  /** "fade" | "cut" | "wipe". Default "cut". */
  transitionIn?: 'fade' | 'cut' | 'wipe';
  transitionDurationSec?: number;
};

export type Timeline = {
  version: 1;
  title: string;
  resolution: Resolution;
  /** Background music URL (looped, ducked under voiceover by ~12 dB). */
  musicUrl?: string;
  musicVolume?: number;        // 0..1, default 0.18
  /** A single voiceover that spans the whole video. If set, all scenes share it. */
  voiceoverUrl?: string;
  /** Burn subtitles into the video. */
  subtitles?: {
    /** SRT contents, OR generated from voiceoverUrl + scene captions when absent. */
    srt?: string;
    fontSize?: number;
    fontColor?: string;        // "#FFFFFF"
    backgroundOpacity?: number; // 0..1
    position?: 'bottom' | 'center' | 'top';
    /** When true, worker calls OpenAI Whisper on the voiceover and generates word-level SRT. */
    transcribeVoiceover?: boolean;
  };
  /** Optional xfade transitions between scenes (hard cuts by default). */
  transitions?: {
    type: 'fade' | 'wipeleft' | 'wiperight' | 'slideleft' | 'slideright' | 'circleopen' | 'dissolve';
    durationSec: number;
  };
  scenes: Scene[];
};

export function totalDurationSec(t: Timeline): number {
  return t.scenes.reduce((acc, s) => acc + s.durationSec, 0);
}
