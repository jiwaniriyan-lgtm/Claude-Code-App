'use client';

import { useState } from 'react';

type TabId = 'title' | 'script' | 'voiceover' | 'visuals' | 'thumbnail' | 'soundtrack' | 'video';

const TABS: { id: TabId; label: string }[] = [
  { id: 'title', label: 'Title' },
  { id: 'script', label: 'Script' },
  { id: 'voiceover', label: 'Voiceover' },
  { id: 'visuals', label: 'Visuals' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'soundtrack', label: 'Soundtrack' },
  { id: 'video', label: 'Video' },
];

const TITLES = [
  'The Secret Drone Army Hunting Cartel Bosses',
  'The Biggest Prison Break You Never Heard Of',
  "The Hunt for America's Top War Criminal",
];

const SCRIPT = `Somewhere high above the Mexican desert, invisible to the naked eye, America's secret drone army is on the hunt.

It's been going on for more than twenty years. The U.S. government runs one of the most sustained covert drone operations ever, watching cartel bosses through mountains and jungles. MQ-9 Reapers—the same drones used in counterterrorism worldwide—circle above drug labs. The CIA and Homeland Security fly them. The Mexican military requests the surveillance. The footage has led to arrests of the world's most wanted.

Joaquín El Chapo Guzmán escaped prison in 2001. For years, nobody found him. Then the drones started watching. They tracked his movements across Sinaloa. In 2013, surveillance identified a hidden meeting. By 2014, Mexican marines walked into a Mazatlán hotel room and put him in handcuffs.

The drones don't fire missiles here. They watch, listen, and map. Cell signals get intercepted. Convoys get followed for weeks. Patterns emerge. Then a strike team moves in on the ground.

Today, the program is bigger than ever — and almost nobody is supposed to know it exists.`;

export default function DemoPage() {
  const [active, setActive] = useState<TabId>('title');
  const [selectedTitle, setSelectedTitle] = useState(TITLES[0]);

  const goto = (id: TabId) => setActive(id);
  const nextOf = (id: TabId): TabId => {
    const i = TABS.findIndex((t) => t.id === id);
    return TABS[Math.min(i + 1, TABS.length - 1)].id;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-1">Instant Video Studio</h1>
        <p className="text-slate-500 mb-6">Every step generates instantly — no waiting.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-wrap gap-1 px-4 pt-4 pb-4 bg-slate-50 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => goto(t.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  active === t.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {active === 'title' && (
              <TitleStep
                titles={TITLES}
                selected={selectedTitle}
                onSelect={setSelectedTitle}
                onContinue={() => goto('script')}
              />
            )}
            {active === 'script' && (
              <ScriptStep title={selectedTitle} onContinue={() => goto(nextOf('script'))} />
            )}
            {active === 'voiceover' && <VoiceoverStep onContinue={() => goto(nextOf('voiceover'))} />}
            {active === 'visuals' && <VisualsStep onContinue={() => goto(nextOf('visuals'))} />}
            {active === 'thumbnail' && <ThumbnailStep onContinue={() => goto(nextOf('thumbnail'))} />}
            {active === 'soundtrack' && <SoundtrackStep onContinue={() => goto('video')} />}
            {active === 'video' && <VideoStep onRestart={() => { setActive('title'); setSelectedTitle(TITLES[0]); }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  icon,
  title,
  subtitle,
  cta,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>
      </div>
      {cta && (
        <button
          onClick={onCta}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-3 inline-flex items-center gap-2 shrink-0"
        >
          {cta} <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}

function TitleStep({
  titles,
  selected,
  onSelect,
  onContinue,
}: {
  titles: string[];
  selected: string;
  onSelect: (t: string) => void;
  onContinue: () => void;
}) {
  const [url, setUrl] = useState('https://www.youtube.com/@fern-tv');
  return (
    <div>
      <StepHeader
        icon={<YouTubeIcon />}
        title="Generate from YouTube Channel"
        subtitle="Analyze a YouTube channel and generate titles in their style"
      />
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 inline-flex items-center justify-center gap-2"
        >
          Continue to Script <span aria-hidden>→</span>
        </button>
      </div>
      <div className="space-y-3">
        {titles.map((t) => {
          const isSel = t === selected;
          return (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition font-semibold ${
                isSel
                  ? 'bg-blue-50 border-blue-500 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScriptStep({ title, onContinue }: { title: string; onContinue: () => void }) {
  return (
    <div>
      <StepHeader
        icon={<DocIcon />}
        title="Script Generator"
        subtitle="Generate engaging video scripts optimized for viewer retention"
        cta="Continue to Voiceover"
        onCta={onContinue}
      />
      <div className="border border-slate-200 rounded-xl px-5 py-4 mb-2 font-semibold">{title}</div>
      <p className="text-slate-400 text-sm mb-4">Your selected title</p>
      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 whitespace-pre-wrap leading-relaxed text-slate-700 max-h-[420px] overflow-y-auto">
        {SCRIPT}
      </div>
    </div>
  );
}

function VoiceoverStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <StepHeader
        icon={<MicIcon />}
        title="Voiceover Generator"
        subtitle="Generate professional AI voiceovers from your script"
        cta="Continue to Visuals"
        onCta={onContinue}
      />
      <p className="text-slate-500 mb-2">Script Preview</p>
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 mb-2 text-slate-700">
        Somewhere high above the Mexican desert, invisible to the naked eye, America's secret drone army is on the hunt...
      </div>
      <p className="text-slate-500 text-sm mb-8">296 words • Estimated duration: ~2 min</p>

      <h3 className="text-xl font-bold mb-4">Your Voiceover</h3>
      <FakeAudioPlayer duration="2:13" />
    </div>
  );
}

function VisualsStep({ onContinue }: { onContinue: () => void }) {
  const [animate, setAnimate] = useState(true);
  const [style, setStyle] = useState<string | null>('Cinematic');
  const styles = ['Cinematic', 'Documentary', 'Anime', 'Photo-real', '3D Render', 'Vintage'];

  return (
    <div>
      <StepHeader
        icon={<FilmIcon />}
        title="Visual Generator"
        subtitle="Generate stunning AI images for each scene of your video"
        cta="Continue to Thumbnail"
        onCta={onContinue}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Field label="1. Select aspect ratio">
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white">
            <option>16:9</option>
            <option>9:16</option>
            <option>1:1</option>
          </select>
        </Field>
        <Field label="2. Select quality">
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white">
            <option>Best (90 credits)</option>
            <option>Standard (45 credits)</option>
          </select>
        </Field>
        <Field label="3. Animate images?">
          <button
            onClick={() => setAnimate((v) => !v)}
            className={`w-full px-4 py-3 rounded-xl border font-semibold ${
              animate ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {animate ? '✓ Animate' : 'Static'}
          </button>
        </Field>
        <Field label="4. Set image count">
          <input
            defaultValue={30}
            disabled={animate}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
          />
          {animate && <p className="text-slate-400 text-xs mt-2">Images locked to 30 for animation</p>}
        </Field>
      </div>

      <h3 className="font-bold mb-3">5. Choose style</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {styles.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`p-4 rounded-xl border text-left font-semibold ${
              style === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThumbnailStep({ onContinue }: { onContinue: () => void }) {
  const [generated, setGenerated] = useState(false);
  return (
    <div>
      <StepHeader
        icon={<ImageIcon />}
        title="Thumbnail Generator"
        subtitle="Create an eye-catching thumbnail for your video"
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>1</Badge>
          <h3 className="font-bold text-lg">Select Reference Image</h3>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-slate-400">🔗</span>
          <span className="flex-1 text-slate-500 text-sm truncate">https://www.youtube.com/watch?v=m_4zaXSLW...</span>
          <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 aspect-video flex items-center justify-center text-white relative overflow-hidden">
          <div className="absolute top-6 left-8 bg-red-600 px-4 py-2 font-extrabold tracking-wider">DANGER</div>
          <div className="text-6xl">🛰️</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>2</Badge>
          <h3 className="font-bold text-lg">Edit Description</h3>
        </div>
        <textarea
          rows={3}
          defaultValue={'Create a shadowy desert landscape, and on the right side a Cartel Boss highlighted in blue. The Cartel Boss has a red tag above that says "UNAWARE". Above him, a large military-style drone flies over.'}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={() => {
              setGenerated(true);
              setTimeout(onContinue, 200);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-3"
          >
            ✨ {generated ? 'Generated!' : 'Generate Thumbnail'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SoundtrackStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <StepHeader
        icon={<MusicIcon />}
        title="Soundtrack Generator"
        subtitle="Generate AI-powered background music for your video"
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>1</Badge>
          <h3 className="font-bold text-lg">Audio Source</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><MusicIcon /></div>
          <div className="flex-1">
            <p className="font-semibold">Generated Voiceover</p>
            <p className="text-sm text-slate-500">Duration: 2:13 • Your voiceover is ready for soundtrack generation</p>
          </div>
          <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
        </div>
        <p className="text-sm text-slate-500">Your generated voiceover is pre-loaded. The AI will create background music that complements your narration.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>2</Badge>
          <h3 className="font-bold text-lg">Audio Segments</h3>
        </div>
        <Segment n={1} time="0:00 — 0:42 (42s)" desc="Soft, mysterious ambient music building anticipation, subtle electronic undertones" />
        <Segment n={2} time="0:42 — 1:38 (56s)" desc="Energetic, inspiring corporate music with driving rhythm and uplifting synths" />
        <Segment n={3} time="1:38 — 2:13 (35s)" desc="Triumphant, emotional orchestral finale with powerful crescendo" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>3</Badge>
          <h3 className="font-bold text-lg">Generate & Download Soundtrack</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">✓</span>
            <div>
              <p className="font-bold">Soundtrack Generated!</p>
              <p className="text-sm text-slate-500">Your AI-powered background music is ready</p>
            </div>
          </div>
          <FakeAudioPlayer duration="2:13" />
        </div>
        <button
          onClick={onContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-4 inline-flex items-center justify-center gap-2"
        >
          View Final Video <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function VideoStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold mb-2">Your Video is Ready!</h2>
      <p className="text-slate-500 mb-6">Here's a preview of what your AI-generated video would look like</p>
      <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center text-white mb-6 relative">
        <div className="text-6xl">▶</div>
        <div className="absolute bottom-3 left-4 text-sm bg-black/60 px-2 py-1 rounded">0:36 / 2:13</div>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={onRestart}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white font-semibold inline-flex items-center gap-2 hover:bg-slate-50"
        >
          ↻ Restart Demo
        </button>
        <button className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-2">
          Start Creating <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold mb-2">{label}</p>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
      {children}
    </span>
  );
}

function Segment({ n, time, desc }: { n: number; time: string; desc: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
      <div className="flex items-center gap-3 mb-2">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">Segment {n}</span>
        <span className="font-mono text-sm text-slate-600">{time}</span>
      </div>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  );
}

function FakeAudioPlayer({ duration }: { duration: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 flex items-center gap-4">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="w-11 h-11 rounded-full border-2 border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600"
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <span className="text-sm text-slate-600 w-10">0:00</span>
      <div className="flex-1 h-2 bg-slate-200 rounded-full relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600" />
      </div>
      <span className="text-sm text-slate-600 w-10">{duration}</span>
      <span className="text-slate-400">🔊</span>
      <div className="w-20 h-2 bg-slate-200 rounded-full relative">
        <div className="absolute left-0 top-0 h-full w-3/4 bg-blue-600 rounded-full" />
      </div>
    </div>
  );
}

function YouTubeIcon() {
  return (
    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">▶</div>
  );
}
function DocIcon() {
  return <span className="text-2xl">📄</span>;
}
function MicIcon() {
  return <span className="text-2xl">🎙</span>;
}
function FilmIcon() {
  return <span className="text-2xl">🎬</span>;
}
function ImageIcon() {
  return <span className="text-2xl">🖼</span>;
}
function MusicIcon() {
  return <span className="text-2xl">🎵</span>;
}
