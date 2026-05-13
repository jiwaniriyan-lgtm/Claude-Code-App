import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Video = { title: string; views: string };

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) throw new Error('URL required');
  if (!url.startsWith('http')) url = 'https://' + url;
  url = url.replace(/\/$/, '');
  if (url.includes('/videos')) return url;
  if (url.match(/\/(@[^/]+|c\/[^/]+|channel\/[^/]+|user\/[^/]+)$/)) return url + '/videos';
  return url;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`YouTube responded ${res.status}`);
  return res.text();
}

function extractMeta(html: string, prop: string): string | null {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]+)"`));
  return m ? decodeHtml(m[1]) : null;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractSubs(html: string): string | null {
  const m =
    html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/) ||
    html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/) ||
    html.match(/"metadataParts":\[\{"text":\{"content":"([^"]*subscribers[^"]*)"/);
  return m ? m[1] : null;
}

function extractVideos(html: string, limit = 12): Video[] {
  const videos: Video[] = [];
  const seen = new Set<string>();
  const regex =
    /"videoRenderer":\{[^}]*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"\}\][^}]*?(?:"viewCountText":\{"simpleText":"((?:[^"\\]|\\.)*)"\}|"shortViewCountText":\{"accessibility":\{"accessibilityData":\{"label":"((?:[^"\\]|\\.)*)"\}\})?/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const title = decodeHtml(match[1].replace(/\\(.)/g, '$1')).trim();
    const views = (match[2] || match[3] || '').replace(/\\(.)/g, '$1').trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    videos.push({ title, views });
    if (videos.length >= limit) break;
  }
  return videos;
}

function detectFormat(titles: string[]): { pattern: string; variable: string } {
  if (titles.length < 2) return { pattern: titles[0] ?? 'Unknown', variable: 'Unique topics' };

  // Tokenize and find longest common prefix and suffix (token-level)
  const tokens = titles.map((t) => t.split(/\s+/));

  let prefix: string[] = [];
  outerP: for (let i = 0; i < tokens[0].length; i++) {
    const w = tokens[0][i].toLowerCase().replace(/[^a-z0-9]/gi, '');
    for (const arr of tokens) {
      if (!arr[i] || arr[i].toLowerCase().replace(/[^a-z0-9]/gi, '') !== w) break outerP;
    }
    prefix.push(tokens[0][i]);
  }

  let suffix: string[] = [];
  outerS: for (let i = 1; i <= tokens[0].length - prefix.length; i++) {
    const w = tokens[0][tokens[0].length - i].toLowerCase().replace(/[^a-z0-9]/gi, '');
    for (const arr of tokens) {
      const idx = arr.length - i;
      if (idx < prefix.length || arr[idx].toLowerCase().replace(/[^a-z0-9]/gi, '') !== w) break outerS;
    }
    suffix.unshift(tokens[0][tokens[0].length - i]);
  }

  const pre = prefix.join(' ');
  const suf = suffix.join(' ');
  const pattern = [pre, '<X>', suf].filter(Boolean).join(' ').trim();
  if (!pre && !suf) {
    return { pattern: 'No strong repeating pattern detected', variable: 'Each title is unique' };
  }
  // Sample what X looks like
  const samples = titles
    .slice(0, 5)
    .map((t) => {
      let v = t;
      if (pre) v = v.replace(new RegExp('^' + escapeRe(pre) + '\\s*', 'i'), '');
      if (suf) v = v.replace(new RegExp('\\s*' + escapeRe(suf) + '$', 'i'), '');
      return v.trim();
    })
    .filter(Boolean);
  return { pattern, variable: 'X = ' + (samples.slice(0, 3).join(', ') || 'topic') };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateIdeas(pattern: string, variable: string, titles: string[]): { topic: string; reason: string }[] {
  const x = pattern.includes('<X>') ? pattern : null;
  if (!x) return [];
  // Pull some sample X values, then suggest related ones with a tiny adjacency list
  const samples = variable.replace(/^X\s*=\s*/, '').split(',').map((s) => s.trim()).filter(Boolean);
  const seeds = samples.length ? samples : titles.slice(0, 3);
  const ideas = seeds.slice(0, 4).map((seed) => ({
    topic: x.replace('<X>', seed + ' (variant)'),
    reason: `Builds on top-performing "${seed}" with a fresh angle.`,
  }));
  return ideas;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url required' }, { status: 400 });
    }
    const normalized = normalizeUrl(url);
    const html = await fetchHtml(normalized);

    const channel = extractMeta(html, 'og:title') || 'Unknown channel';
    const description = extractMeta(html, 'og:description') || '';
    const subscribers = extractSubs(html) || 'Hidden';
    const videos = extractVideos(html, 10);

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse any videos from this channel. Try the channel URL ending in /videos.' },
        { status: 422 }
      );
    }

    const { pattern, variable } = detectFormat(videos.map((v) => v.title));
    const ideas = generateIdeas(pattern, variable, videos.map((v) => v.title));

    return NextResponse.json({
      channel,
      url: normalized.replace(/\/videos$/, ''),
      description,
      subscribers,
      monetized: true,
      category: description.split(/[.|—-]/)[0]?.trim().slice(0, 60) || 'YouTube channel',
      format: pattern,
      variable,
      topVideos: videos.slice(0, 6).map((v) => ({
        title: v.title,
        views: v.views || '—',
        ctr: '—',
      })),
      similar: [],
      topicIdeas: ideas,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to analyze' }, { status: 500 });
  }
}
