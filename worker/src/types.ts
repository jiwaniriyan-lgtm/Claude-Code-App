// Mirror of lib/assembly/timeline.ts — kept in sync manually so the worker is
// self-contained and doesn't need to reach into the Next.js app's source tree.

export type Resolution = { width: number; height: number; fps?: number };

export type SceneSource =
  | { kind: 'image'; url: string; motion?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'static' }
  | { kind: 'video'; url: string; trimFromSec?: number; speed?: number };

export type Scene = {
  id: string;
  durationSec: number;
  source: SceneSource;
  caption?: string;
  voiceoverUrl?: string;
  transitionIn?: 'fade' | 'cut' | 'wipe';
  transitionDurationSec?: number;
};

export type Timeline = {
  version: 1;
  title: string;
  resolution: Resolution;
  musicUrl?: string;
  musicVolume?: number;
  voiceoverUrl?: string;
  subtitles?: {
    srt?: string;
    fontSize?: number;
    fontColor?: string;
    backgroundOpacity?: number;
    position?: 'bottom' | 'center' | 'top';
  };
  scenes: Scene[];
};

export type RenderJobRow = {
  id: string;
  user_id: string;
  workbook_id: string | null;
  kind: 'tts' | 'image' | 'video' | 'assembly';
  provider: string;
  provider_job_id: string | null;
  status: 'queued' | 'processing' | 'done' | 'failed' | 'canceled';
  input: { timeline?: Timeline } & Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
};
