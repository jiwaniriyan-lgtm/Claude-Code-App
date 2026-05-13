import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Video = { title: string; views: string };

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) throw new Error('URL required');
  if (!url.startsWith('http')) url = 'https://' + url;
  url = url.replace(/\/$/, '');
  // Always hit the /videos tab — that's where the grid lives.
  if (url.match(/\/(@[^/]+|c\/[^/]+|channel\/[^/]+|user\/[^/]+)$/)) url += '/videos';
  return url;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Cookie: 'CONSENT=YES+1; PREF=hl=en&gl=US',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  return res.text();
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractMeta(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name|itemprop)=["']${prop}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${prop}["']`,
  );
  const m = html.match(re);
  return m ? decodeHtml(m[1] || m[2]) : null;
}

// Strategy A: var ytInitialData = {...};
// Strategy B: ytInitialData":{...} embedded in larger JSON
function extractInitialData(html: string): any | null {
  const candidates: number[] = [];
  const markerA = html.indexOf('var ytInitialData = ');
  if (markerA !== -1) candidates.push(markerA + 'var ytInitialData = '.length);
  const markerB = html.indexOf('window["ytInitialData"] = ');
  if (markerB !== -1) candidates.push(markerB + 'window["ytInitialData"] = '.length);

  for (const start of candidates) {
    let s = start;
    while (s < html.length && html[s] !== '{') s++;
    if (s >= html.length) continue;
    const end = matchBraces(html, s);
    if (end === -1) continue;
    try {
      return JSON.parse(html.slice(s, end));
    } catch {
      /* fall through */
    }
  }
  return null;
}

function matchBraces(s: string, start: number): number {
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\') {
      escape = true;
      continue;
    }
    if (c === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

function getText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.simpleText) return node.simpleText;
  if (Array.isArray(node.runs)) return node.runs.map((r: any) => r.text || '').join('');
  if (node.accessibility?.accessibilityData?.label) return node.accessibility.accessibilityData.label;
  return '';
}

function walkVideos(node: any, out: Video[], seen: Set<string>, limit: number): void {
  if (out.length >= limit || !node || typeof node !== 'object') return;
  if (node.videoRenderer || node.gridVideoRenderer) {
    const v = node.videoRenderer || node.gridVideoRenderer;
    const title = getText(v.title).trim();
    const views = getText(v.viewCountText) || getText(v.shortViewCountText) || '';
    if (title && !seen.has(title)) {
      seen.add(title);
      out.push({ title, views });
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const c of node) walkVideos(c, out, seen, limit);
    return;
  }
  for (const k of Object.keys(node)) {
    walkVideos(node[k], out, seen, limit);
    if (out.length >= limit) return;
  }
}

// Fallback: regex over raw HTML. Looks for title runs followed soon after
// by a videoId, which is the standard layout in videoRenderer JSON.
function extractVideosRegex(html: string, limit = 12): Video[] {
  const out: Video[] = [];
  const seen = new Set<string>();
  const re = /"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.){3,200}?)"\}\][^{}]{0,2000}?"videoId":"[A-Za-z0-9_-]{11}"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const title = decodeHtml(m[1].replace(/\\"/g, '"').replace(/\\u0026/g, '&').replace(/\\(.)/g, '$1')).trim();
    if (title && !seen.has(title) && title.length > 2 && !/^[A-Z]{2,4}$/.test(title)) {
      seen.add(title);
      out.push({ title, views: '' });
      if (out.length >= limit) break;
    }
  }
  return out;
}

function extractSubsFromHtml(html: string): string | null {
  return (
    html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/)?.[1] ||
    html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/)?.[1] ||
    html.match(/"metadataParts":\[\{"text":\{"content":"([^"]*subscribers?[^"]*)"/)?.[1] ||
    html.match(/([\d.]+[KMB]?\s+subscribers)/i)?.[1] ||
    null
  );
}

function detectFormat(titles: string[]): { pattern: string; variable: string } {
  if (titles.length < 2) return { pattern: titles[0] ?? 'Unknown', variable: 'Unique topics' };
  const tokens = titles.map((t) => t.split(/\s+/));
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/gi, '');

  let prefix: string[] = [];
  outerP: for (let i = 0; i < tokens[0].length; i++) {
    const w = norm(tokens[0][i]);
    for (const arr of tokens) {
      if (!arr[i] || norm(arr[i]) !== w) break outerP;
    }
    prefix.push(tokens[0][i]);
  }

  let suffix: string[] = [];
  outerS: for (let i = 1; i <= tokens[0].length - prefix.length; i++) {
    const w = norm(tokens[0][tokens[0].length - i]);
    for (const arr of tokens) {
      const idx = arr.length - i;
      if (idx < prefix.length || norm(arr[idx]) !== w) break outerS;
    }
    suffix.unshift(tokens[0][tokens[0].length - i]);
  }

  const pre = prefix.join(' ');
  const suf = suffix.join(' ');
  if (!pre && !suf) {
    return { pattern: 'No strong repeating pattern detected', variable: 'Each title is unique' };
  }
  const pattern = [pre, '<X>', suf].filter(Boolean).join(' ').trim();
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
  if (!pattern.includes('<X>')) return [];
  const samples = variable.replace(/^X\s*=\s*/, '').split(',').map((s) => s.trim()).filter(Boolean);
  const seeds = samples.length ? samples : titles.slice(0, 3);
  return seeds.slice(0, 4).map((seed) => ({
    topic: pattern.replace('<X>', seed + ' (your angle)'),
    reason: `Builds on top-performing "${seed}" with a fresh take.`,
  }));
}

export async function POST(req: Request) {
  const debug: Record<string, any> = {};
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url required' }, { status: 400 });
    }
    const target = normalizeUrl(url);
    debug.target = target;

    const html = await fetchHtml(target);
    debug.htmlLength = html.length;

    if (html.length < 5000) {
      return NextResponse.json(
        { error: 'YouTube returned an empty/blocked page. Try again in a minute.', debug },
        { status: 502 }
      );
    }

    const data = extractInitialData(html);
    debug.foundInitialData = !!data;

    const videos: Video[] = [];
    if (data) walkVideos(data, videos, new Set(), 12);
    debug.videosFromJson = videos.length;

    if (videos.length === 0) {
      const regexVideos = extractVideosRegex(html, 12);
      debug.videosFromRegex = regexVideos.length;
      videos.push(...regexVideos);
    }

    if (videos.length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not parse any videos from this channel. The channel may have no public uploads.',
          debug,
        },
        { status: 422 }
      );
    }

    const channel = extractMeta(html, 'og:title') || 'Unknown channel';
    const description = extractMeta(html, 'og:description') || '';
    const subscribers = extractSubsFromHtml(html) || 'Hidden';

    const titles = videos.map((v) => v.title);
    const { pattern, variable } = detectFormat(titles);
    const ideas = generateIdeas(pattern, variable, titles);

    return NextResponse.json({
      channel,
      url: target.replace(/\/videos$/, ''),
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
    return NextResponse.json({ error: err?.message || 'Failed to analyze', debug }, { status: 500 });
  }
}
