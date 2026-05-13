'use client';

import { useState } from 'react';

type TabId =
  | 'research'
  | 'title'
  | 'script'
  | 'voiceover'
  | 'visuals'
  | 'thumbnail'
  | 'soundtrack'
  | 'description'
  | 'video';

const TABS: { id: TabId; label: string }[] = [
  { id: 'research', label: 'Research' },
  { id: 'title', label: 'Title' },
  { id: 'script', label: 'Script' },
  { id: 'voiceover', label: 'Voiceover' },
  { id: 'visuals', label: 'Visuals' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'soundtrack', label: 'Soundtrack' },
  { id: 'description', label: 'Description' },
  { id: 'video', label: 'Video' },
];

// ─── Research data ────────────────────────────────────────────────────────────
type Niche = {
  channel: string;
  url: string;
  subscribers: string;
  monetized: boolean;
  category: string;
  format: string;
  variable: string;
  topVideos: { title: string; views: string; ctr: string }[];
  similar: string[];
  topicIdeas: { topic: string; reason: string }[];
};

const NICHES: Niche[] = [
  {
    channel: '@masterpov',
    url: 'https://www.youtube.com/@masterpov',
    subscribers: '9.1K',
    monetized: true,
    category: 'Physical Labor Careers',
    format: 'Every level of <X> career',
    variable: 'X = physically risky job',
    topVideos: [
      { title: 'Every Level of Car Mechanic Career', views: '1.2M', ctr: '11.4%' },
      { title: 'Every Level of Welder Life', views: '880K', ctr: '9.8%' },
      { title: 'Every Level of Skyscraper Ironworker', views: '640K', ctr: '12.1%' },
    ],
    similar: ['@chillguy', '@bluecollarpov', '@tradesmanlife'],
    topicIdeas: [
      { topic: 'Every Level of Cave Diver', reason: 'Underwater + dangerous = retention spike' },
      { topic: 'Every Level of Free Soloer', reason: 'No-harness climbing — extreme stakes hook' },
      { topic: 'Every Level of Scuba Diver', reason: 'Depth progression matches "every level" format' },
      { topic: 'Every Level of Wildfire Firefighter', reason: 'Physical danger + clear career ladder' },
    ],
  },
  {
    channel: '@fern-tv',
    url: 'https://www.youtube.com/@fern-tv',
    subscribers: '2.1M',
    monetized: true,
    category: 'Geopolitical Mini-Docs',
    format: 'The <secret/biggest/hidden> <noun> <action>',
    variable: 'X = hidden geopolitical story',
    topVideos: [
      { title: 'The Secret Drone Army Hunting Cartel Bosses', views: '4.8M', ctr: '14.2%' },
      { title: 'The Biggest Prison Break You Never Heard Of', views: '3.1M', ctr: '12.6%' },
      { title: "The Hunt for America's Top War Criminal", views: '2.4M', ctr: '11.9%' },
    ],
    similar: ['@JohnnyHarris', '@RealLifeLore', '@KrazaM'],
    topicIdeas: [
      { topic: 'The Secret Bank Funding Every Coup', reason: 'Conspiracy hook + financial angle' },
      { topic: 'The Hidden War Inside the Arctic Circle', reason: 'Geography + escalating tension' },
      { topic: 'The Spy Ship Nobody Talks About', reason: 'Specific object + secrecy framing' },
    ],
  },
  {
    channel: '@bizlifepov',
    url: 'https://www.youtube.com/@bizlifepov',
    subscribers: '420K',
    monetized: true,
    category: 'Career POV (white-collar)',
    format: 'Your life as a <X>',
    variable: 'X = high-status profession',
    topVideos: [
      { title: 'Your Life as an Electrical Engineer', views: '2.4M', ctr: '13.0%' },
      { title: 'Your Life as a Software Engineer', views: '1.8M', ctr: '12.4%' },
      { title: 'Your Life as a Surgeon', views: '1.5M', ctr: '11.7%' },
    ],
    similar: ['@careermachine', '@humandecode', '@worklifepov'],
    topicIdeas: [
      { topic: 'Your Life as an Air Traffic Controller', reason: 'High stress + clear level progression' },
      { topic: 'Your Life as a Hedge Fund Quant', reason: 'Status + salary numbers drive CTR' },
      { topic: 'Your Life as a Patent Lawyer', reason: 'Underexplored white-collar niche' },
    ],
  },
];

// ─── Title / script data ──────────────────────────────────────────────────────
const TITLES_BY_CHANNEL: Record<string, string[]> = {
  '@fern-tv': [
    'The Secret Drone Army Hunting Cartel Bosses',
    'The Biggest Prison Break You Never Heard Of',
    "The Hunt for America's Top War Criminal",
  ],
  '@masterpov': [
    'Every Level of Cave Diver Career',
    'Every Level of Free Soloer Career',
    'Every Level of Scuba Diver Career',
  ],
  '@bizlifepov': [
    'Your Life as an Electrical Engineer',
    'Your Life as a Hedge Fund Quant',
    'Your Life as an Air Traffic Controller',
  ],
};

const SCRIPTS: Record<string, string> = {
  'The Secret Drone Army Hunting Cartel Bosses': `Somewhere high above the Mexican desert, invisible to the naked eye, America's secret drone army is on the hunt.

It's been going on for more than twenty years. The U.S. government runs one of the most sustained covert drone operations ever, watching cartel bosses through mountains and jungles. MQ-9 Reapers—the same drones used in counterterrorism worldwide—circle above drug labs. The CIA and Homeland Security fly them. The Mexican military requests the surveillance. The footage has led to arrests of the world's most wanted.

Joaquín El Chapo Guzmán escaped prison in 2001. For years, nobody found him. Then the drones started watching. They tracked his movements across Sinaloa. In 2013, surveillance identified a hidden meeting. By 2014, Mexican marines walked into a Mazatlán hotel room and put him in handcuffs.

The drones don't fire missiles here. They watch, listen, and map. Cell signals get intercepted. Convoys get followed for weeks. Patterns emerge. Then a strike team moves in on the ground.

Today, the program is bigger than ever — and almost nobody is supposed to know it exists.`,
  'Every Level of Cave Diver Career': `Level 1 — The Open Water Diver. You just got your first certification. You can go 18 meters down. The cave entrance looks like a doorway into nothing. You don't go in. Yet.

Level 2 — The Cavern Diver. Within sight of daylight. Always. The rule is simple: if you can't see the exit, you don't belong here.

Level 3 — The Full Cave Diver. Now you go past the light. Three lights, two regulators, a continuous guideline back to open water. One mistake at this depth and nobody is coming to get you.

Level 4 — The Stage Diver. You carry extra tanks. You stage them along the line for the return. You're spending hours underground now.

Level 5 — The CCR Cave Explorer. Closed-circuit rebreathers. No bubbles. You can stay under for eight hours. The caves you visit have never been mapped.

Level 6 — The Mount Everest of Diving. The Sistema Huautla. The Pearse Resurgence. Less than fifty people on Earth are qualified to be here. The water is colder than ice. The decompression is twelve hours. And the people who reach the end of the line — sometimes don't come back.`,
  'Your Life as an Electrical Engineer': `Level 1 — The Fresh Graduate. You just got your bachelor's degree in electrical engineering. You have a diploma, a soldering iron, and forty-seven job applications open. Forty-six of them won't reply. Starting salary: $72,000.

Level 2 — The Junior Engineer. You're at your first firm. You spend most of your day reading datasheets and asking the senior engineer questions you're afraid are stupid. They aren't.

Level 3 — The Project Engineer. You own a subsystem. PCB layout, firmware, the EMI test that's failing for reasons nobody understands. Salary: $98,000.

Level 4 — The Senior Engineer. You sign off on designs that ship to a million customers. A single decimal in the wrong place is a recall.

Level 5 — The Staff Engineer. You aren't really an engineer anymore. You're a translator between business and physics. Salary: $185,000.

Level 6 — The Principal. There are maybe twelve people on Earth who understand what you do. The company pays you to never leave.`,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function DemoPage() {
  const [active, setActive] = useState<TabId>('research');
  const [niche, setNiche] = useState<Niche>(NICHES[1]); // Fern as default
  const [selectedTitle, setSelectedTitle] = useState(TITLES_BY_CHANNEL['@fern-tv'][0]);

  const goto = (id: TabId) => setActive(id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-1">Instant Video Studio</h1>
        <p className="text-slate-500 mb-6">
          Niche research, style copy, and every production step — all generated instantly.
        </p>

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
            {active === 'research' && (
              <ResearchStep
                niches={NICHES}
                selected={niche}
                onSelect={(n) => {
                  setNiche(n);
                  const preset = TITLES_BY_CHANNEL[n.channel]?.[0];
                  const firstVideo = n.topVideos?.[0]?.title;
                  setSelectedTitle(preset ?? firstVideo ?? '');
                }}
                onContinue={() => goto('title')}
              />
            )}
            {active === 'title' && (
              <TitleStep
                niche={niche}
                titles={
                  TITLES_BY_CHANNEL[niche.channel] ??
                  (niche.topicIdeas?.length
                    ? niche.topicIdeas.map((i) => i.topic)
                    : niche.topVideos?.map((v) => v.title) ?? [])
                }
                selected={selectedTitle}
                onSelect={setSelectedTitle}
                onContinue={() => goto('script')}
              />
            )}
            {active === 'script' && (
              <ScriptStep title={selectedTitle} onContinue={() => goto('voiceover')} />
            )}
            {active === 'voiceover' && <VoiceoverStep onContinue={() => goto('visuals')} />}
            {active === 'visuals' && <VisualsStep onContinue={() => goto('thumbnail')} />}
            {active === 'thumbnail' && (
              <ThumbnailStep title={selectedTitle} onContinue={() => goto('soundtrack')} />
            )}
            {active === 'soundtrack' && <SoundtrackStep onContinue={() => goto('description')} />}
            {active === 'description' && (
              <DescriptionStep title={selectedTitle} onContinue={() => goto('video')} />
            )}
            {active === 'video' && (
              <VideoStep
                title={selectedTitle}
                onRestart={() => {
                  setActive('research');
                  setNiche(NICHES[1]);
                  setSelectedTitle(TITLES_BY_CHANNEL['@fern-tv'][0]);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
      {children}
    </span>
  );
}

// ─── Research ─────────────────────────────────────────────────────────────────
function ResearchStep({
  niches,
  selected,
  onSelect,
  onContinue,
}: {
  niches: Niche[];
  selected: Niche;
  onSelect: (n: Niche) => void;
  onContinue: () => void;
}) {
  const [url, setUrl] = useState(selected.url);
  const [analyzed, setAnalyzed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setError(null);
    const preset = niches.find((n) => url.toLowerCase().includes(n.channel.replace('@', '').toLowerCase()));
    if (preset) {
      onSelect(preset);
      setAnalyzed(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        const dbg = data.debug ? ` [${JSON.stringify(data.debug)}]` : '';
        throw new Error((data.error || 'Failed to analyze') + dbg);
      }
      onSelect(data as Niche);
      setAnalyzed(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StepHeader
        icon={<SearchIcon />}
        title="Niche Finder"
        subtitle="Paste a competitor channel — we'll identify the format, find similar channels, and suggest topics in your style."
        cta="Continue to Title"
        onCta={onContinue}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>1</Badge>
          <h3 className="font-bold text-lg">Analyze a Channel</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/@channel"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={analyze}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-3"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {niches.map((n) => (
            <button
              key={n.channel}
              onClick={() => {
                onSelect(n);
                setUrl(n.url);
                setAnalyzed(true);
              }}
              className={`p-3 rounded-xl border text-left text-sm transition ${
                selected.channel === n.channel
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="font-semibold">{n.channel}</p>
              <p className="text-slate-500 text-xs">{n.subscribers} subs</p>
            </button>
          ))}
        </div>
      </div>

      {analyzed && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge>2</Badge>
              <h3 className="font-bold text-lg">Channel Analysis</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <Stat label="Channel" value={selected.channel} />
              <Stat label="Subscribers" value={selected.subscribers} />
              <Stat
                label="Monetized"
                value={selected.monetized ? '✓ Yes' : '✗ No'}
                color={selected.monetized ? 'text-green-600' : 'text-slate-500'}
              />
              <Stat label="Category" value={selected.category} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-500 mb-1">Detected format pattern</p>
              <p className="font-mono text-blue-700 font-semibold">{selected.format}</p>
              <p className="text-sm text-slate-500 mt-2">
                Repeating variable: <span className="font-semibold text-slate-700">{selected.variable}</span>
              </p>
            </div>
            <p className="text-sm text-slate-500 mb-2">Top performing videos (sorted by popular)</p>
            <div className="space-y-2">
              {selected.topVideos.map((v) => (
                <div key={v.title} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <span className="font-semibold text-sm truncate">{v.title}</span>
                  <span className="text-xs text-slate-500 shrink-0">
                    {v.views} views • CTR {v.ctr}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge>3</Badge>
              <h3 className="font-bold text-lg">Similar Channels</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.similar.map((s) => (
                <span key={s} className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Low-to-medium competition detected — this niche is viable for a new entrant.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge>4</Badge>
              <h3 className="font-bold text-lg">Suggested Topic Ideas (in your style)</h3>
            </div>
            <div className="space-y-3">
              {selected.topicIdeas.map((t) => (
                <div key={t.topic} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="font-semibold">{t.topic}</p>
                  <p className="text-sm text-slate-500">{t.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`font-bold ${color ?? 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────
function TitleStep({
  niche,
  titles,
  selected,
  onSelect,
  onContinue,
}: {
  niche: Niche;
  titles: string[];
  selected: string;
  onSelect: (t: string) => void;
  onContinue: () => void;
}) {
  const [custom, setCustom] = useState('');
  return (
    <div>
      <StepHeader
        icon={<YouTubeIcon />}
        title="Generate from Channel Style"
        subtitle={`Style copied from ${niche.channel} — format: ${niche.format}`}
        cta="Continue to Script"
        onCta={onContinue}
      />

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-900">
        ✨ Generated instantly from <strong>{niche.channel}</strong>'s top videos.
      </div>

      <p className="font-semibold mb-2">Generated titles</p>
      <div className="space-y-3 mb-6">
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

      <p className="font-semibold mb-2">Or write your own</p>
      <div className="flex gap-3">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Type a custom title..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white"
        />
        <button
          onClick={() => custom && onSelect(custom)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-5"
        >
          Use this title
        </button>
      </div>
    </div>
  );
}

// ─── Script ───────────────────────────────────────────────────────────────────
function ScriptStep({ title, onContinue }: { title: string; onContinue: () => void }) {
  const [webSearch, setWebSearch] = useState(true);
  const script = SCRIPTS[title] ?? SCRIPTS['The Secret Drone Army Hunting Cartel Bosses'];
  return (
    <div>
      <StepHeader
        icon={<DocIcon />}
        title="Script Generator"
        subtitle="Engaging scripts optimized for viewer retention"
        cta="Continue to Voiceover"
        onCta={onContinue}
      />
      <div className="border border-slate-200 rounded-xl px-5 py-4 mb-2 font-semibold">{title}</div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">Your selected title</p>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={webSearch}
            onChange={(e) => setWebSearch(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-semibold text-slate-700">Web search</span>
          <span className="text-slate-400">(more accurate facts)</span>
        </label>
      </div>
      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 whitespace-pre-wrap leading-relaxed text-slate-700 max-h-[420px] overflow-y-auto">
        {script}
      </div>
    </div>
  );
}

// ─── Voiceover ────────────────────────────────────────────────────────────────
function VoiceoverStep({ onContinue }: { onContinue: () => void }) {
  const voices = ['Adam (Narrator)', 'Sarah (Documentary)', 'Liam (Energetic)', 'Mia (Calm)'];
  const [voice, setVoice] = useState(voices[0]);
  return (
    <div>
      <StepHeader
        icon={<MicIcon />}
        title="Voiceover Generator"
        subtitle="Professional AI voiceovers from your script"
        cta="Continue to Visuals"
        onCta={onContinue}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {voices.map((v) => (
          <button
            key={v}
            onClick={() => setVoice(v)}
            className={`p-3 rounded-xl border text-sm font-semibold text-left ${
              voice === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="text-slate-500 mb-2">Script Preview</p>
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 mb-2 text-slate-700">
        Level 1 — The fresh graduate. You just got your degree...
      </div>
      <p className="text-slate-500 text-sm mb-8">296 words • Estimated duration: ~2 min</p>

      <h3 className="text-xl font-bold mb-4">Your Voiceover</h3>
      <FakeAudioPlayer duration="2:13" />
    </div>
  );
}

// ─── Visuals ──────────────────────────────────────────────────────────────────
function VisualsStep({ onContinue }: { onContinue: () => void }) {
  const [animate, setAnimate] = useState(true);
  const [style, setStyle] = useState<string>('2D Art');
  const [autoHeaders, setAutoHeaders] = useState(true);
  const [autoCharts, setAutoCharts] = useState(true);
  const styles = ['Cinematic', '2D Art', 'Documentary', 'Photo-real', '3D Render', 'Anime'];
  const models = ['Nano Banana 1K', 'Flux Schnell', 'SDXL Lightning'];
  const [model, setModel] = useState(models[0]);

  return (
    <div>
      <StepHeader
        icon={<FilmIcon />}
        title="Visual Generator"
        subtitle="AI images for each scene — with smart overlays"
        cta="Continue to Thumbnail"
        onCta={onContinue}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Field label="1. Aspect ratio">
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white">
            <option>16:9</option>
            <option>9:16</option>
            <option>1:1</option>
          </select>
        </Field>
        <Field label="2. Image model">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
          >
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="3. Animate?">
          <button
            onClick={() => setAnimate((v) => !v)}
            className={`w-full px-4 py-3 rounded-xl border font-semibold ${
              animate ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {animate ? '✓ Animate' : 'Static'}
          </button>
        </Field>
        <Field label="4. Image count">
          <input
            defaultValue={30}
            disabled={animate}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
          />
          {animate && <p className="text-slate-400 text-xs mt-2">Locked to 30 for animation</p>}
        </Field>
      </div>

      <h3 className="font-bold mb-3">5. Choose style</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
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

      <h3 className="font-bold mb-3">6. Smart overlays</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <Toggle
          label="Auto headers"
          desc='Detects level/section headers (e.g. "Level 1") and adds animated titles'
          on={autoHeaders}
          onChange={setAutoHeaders}
        />
        <Toggle
          label="Auto charts"
          desc="Detects stats/numbers in the script and renders charts automatically"
          on={autoCharts}
          onChange={setAutoCharts}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-bold mb-3">Preview (auto-generated scenes)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { kind: 'header', label: 'LEVEL 1' },
            { kind: 'image', label: 'Fresh Graduate' },
            { kind: 'chart', label: '47 applied / 1 reply' },
            { kind: 'image', label: 'First office' },
            { kind: 'header', label: 'LEVEL 2' },
            { kind: 'image', label: 'Junior engineer' },
            { kind: 'chart', label: 'Salary: $72K → $98K' },
            { kind: 'image', label: 'Senior at whiteboard' },
          ].map((p, i) => (
            <ScenePreview key={i} kind={p.kind as any} label={p.label} enabled={p.kind === 'image' || (p.kind === 'header' ? autoHeaders : autoCharts)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`p-4 rounded-xl border text-left ${
        on ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold">{label}</span>
        <span className={`w-10 h-6 rounded-full ${on ? 'bg-blue-600' : 'bg-slate-300'} relative transition`}>
          <span
            className={`absolute top-0.5 ${on ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow`}
          />
        </span>
      </div>
      <p className="text-xs text-slate-500">{desc}</p>
    </button>
  );
}

function ScenePreview({ kind, label, enabled }: { kind: 'header' | 'image' | 'chart'; label: string; enabled: boolean }) {
  if (!enabled && kind !== 'image') {
    return (
      <div className="aspect-video rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
        {kind} disabled
      </div>
    );
  }
  if (kind === 'header') {
    return (
      <div className="aspect-video rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold tracking-wider">
        {label}
      </div>
    );
  }
  if (kind === 'chart') {
    return (
      <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-3 flex flex-col justify-end">
        <p className="text-xs font-semibold text-blue-900 mb-2">{label}</p>
        <div className="flex items-end gap-1 h-12">
          <div className="flex-1 bg-blue-600 rounded-sm" style={{ height: '30%' }} />
          <div className="flex-1 bg-blue-600 rounded-sm" style={{ height: '55%' }} />
          <div className="flex-1 bg-blue-600 rounded-sm" style={{ height: '80%' }} />
          <div className="flex-1 bg-blue-600 rounded-sm" style={{ height: '100%' }} />
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-semibold text-center px-2">
      {label}
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function ThumbnailStep({ title, onContinue }: { title: string; onContinue: () => void }) {
  const [text, setText] = useState('CHANGE NEVER WORKS');
  return (
    <div>
      <StepHeader
        icon={<ImageIcon />}
        title="Thumbnail Generator"
        subtitle="Eye-catching thumbnails — manual or auto"
        cta="Continue to Soundtrack"
        onCta={onContinue}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>1</Badge>
          <h3 className="font-bold text-lg">Reference Image</h3>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 aspect-video flex items-center justify-center text-white relative overflow-hidden">
          <div className="absolute top-6 left-8 bg-red-600 px-4 py-2 font-extrabold tracking-wider">UNAWARE</div>
          <div className="text-6xl">🛰️</div>
          <div className="absolute bottom-6 right-8 text-3xl font-extrabold tracking-wide text-right max-w-[60%] leading-tight">
            {text}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>2</Badge>
          <h3 className="font-bold text-lg">Manual Mode — edit text</h3>
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white mb-4 font-semibold"
        />
        <p className="text-sm text-slate-500">Title context: <strong>{title}</strong></p>
      </div>
    </div>
  );
}

// ─── Soundtrack ───────────────────────────────────────────────────────────────
function SoundtrackStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <StepHeader
        icon={<MusicIcon />}
        title="Soundtrack Generator"
        subtitle="AI background music matched to your voiceover mood"
        cta="Continue to Description"
        onCta={onContinue}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>1</Badge>
          <h3 className="font-bold text-lg">Audio Source</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MusicIcon />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Generated Voiceover</p>
            <p className="text-sm text-slate-500">Duration: 2:13 • Ready for soundtrack generation</p>
          </div>
          <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>2</Badge>
          <h3 className="font-bold text-lg">Audio Segments (auto mood-matched)</h3>
        </div>
        <Segment n={1} time="0:00 — 0:42 (42s)" desc="Soft, mysterious ambient music building anticipation, subtle electronic undertones" />
        <Segment n={2} time="0:42 — 1:38 (56s)" desc="Energetic, inspiring corporate music with driving rhythm and uplifting synths" />
        <Segment n={3} time="1:38 — 2:13 (35s)" desc="Triumphant, emotional orchestral finale with powerful crescendo" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge>3</Badge>
          <h3 className="font-bold text-lg">Generated Soundtrack</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">✓</span>
            <div>
              <p className="font-bold">Soundtrack Generated!</p>
              <p className="text-sm text-slate-500">Length matches your voiceover</p>
            </div>
          </div>
          <FakeAudioPlayer duration="2:13" />
        </div>
      </div>
    </div>
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

// ─── Description ──────────────────────────────────────────────────────────────
function DescriptionStep({ title, onContinue }: { title: string; onContinue: () => void }) {
  const timestamps = [
    { t: '0:00', label: 'Intro — The Hook' },
    { t: '0:18', label: 'Level 1 — The Fresh Graduate' },
    { t: '0:42', label: 'Level 2 — The Junior' },
    { t: '1:08', label: 'Level 3 — The Project Lead' },
    { t: '1:38', label: 'Level 4 — The Senior' },
    { t: '1:55', label: 'Level 5 — The Staff Engineer' },
    { t: '2:05', label: 'Level 6 — The Principal' },
  ];
  const hashtags = ['#career', '#engineering', '#salary', '#worklife', '#pov'];
  return (
    <div>
      <StepHeader
        icon={<TextIcon />}
        title="Description Generator"
        subtitle="SEO-optimized description with auto timestamps and hashtags"
        cta="Continue to Video"
        onCta={onContinue}
      />
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
        <p className="text-slate-700 mb-4">
          In this video we break down <strong>{title}</strong> — every stage of the career, what
          the salary actually looks like, and the moments that decide who makes it to the top. Watch
          to the end for the level almost no one reaches.
        </p>
        <p className="font-semibold mb-2">⏱ Timestamps</p>
        <div className="space-y-1 mb-4">
          {timestamps.map((t) => (
            <p key={t.t} className="text-sm text-slate-600 font-mono">
              <span className="text-blue-600">{t.t}</span> &nbsp; {t.label}
            </p>
          ))}
        </div>
        <p className="font-semibold mb-2">🔖 Tags</p>
        <div className="flex flex-wrap gap-2">
          {hashtags.map((h) => (
            <span key={h} className="bg-white border border-slate-200 rounded-full px-3 py-1 text-sm text-slate-700">
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Video ────────────────────────────────────────────────────────────────────
function VideoStep({ title, onRestart }: { title: string; onRestart: () => void }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold mb-2">Your Video is Ready!</h2>
      <p className="text-slate-500 mb-6">Preview — {title}</p>
      <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center text-white mb-6 relative">
        <div className="text-6xl">▶</div>
        <div className="absolute bottom-3 left-4 text-sm bg-black/60 px-2 py-1 rounded">0:36 / 2:13</div>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={onRestart}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white font-semibold inline-flex items-center gap-2 hover:bg-slate-50"
        >
          ↻ New Project
        </button>
        <button className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-2">
          Upload to YouTube <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold mb-2">{label}</p>
      {children}
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

function SearchIcon() { return <span className="text-2xl">🔍</span>; }
function YouTubeIcon() {
  return <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">▶</div>;
}
function DocIcon() { return <span className="text-2xl">📄</span>; }
function MicIcon() { return <span className="text-2xl">🎙</span>; }
function FilmIcon() { return <span className="text-2xl">🎬</span>; }
function ImageIcon() { return <span className="text-2xl">🖼</span>; }
function MusicIcon() { return <span className="text-2xl">🎵</span>; }
function TextIcon() { return <span className="text-2xl">📝</span>; }
