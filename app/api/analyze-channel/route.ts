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
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

// Find ytInitialData JSON by scanning for the opening `{` after the marker
// and tracking brace depth until the matching close.
function extractInitialData(html: string): any | null {
  const markers = ['var ytInitialData = ', 'window["ytInitialData"] = ', 'ytInitialData = '];
  let start = -1;
  for (const m of markers) {
    const i = html.indexOf(m);
    if (i !== -1) {
      start = i + m.length;
      break;
    }
  }
  if (start === -1) return null;
  // start should now be at `{`
  while (start < html.length && html[start] !== '{') start++;
  if (start >= html.length) return null;

  let depth = 0;
  let inStr = false;
  let escape = false;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
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
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) return null;
  try {
    return JSON.parse(html.slice(start, end));
  } catch {
    return null;
  }
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
  if (out.length >= limit) return;
  if (!node || typeof node !== 'object') return;

  if (node.videoRenderer || node.gridVideoRenderer) {
    const v = node.videoRenderer || node.gridVideoRenderer;
    const title = getText(v.title).trim();
    const views =
      getText(v.viewCountText) ||
      getText(v.shortViewCountText) ||
      '';
    if (title && !seen.has(title)) {
      seen.add(title);
      out.push({ title, views });
    }
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) walkVideos(child, out, seen, limit);
    return;
  }
  for (const key of Object.keys(node)) {
    walkVideos(node[key], out, seen, limit);
    if (out.length >= limit) return;
  }
}

function extractSubsFromData(data: any): string | null {
  // Try a few well-known locations
  const stack: any[] = [data];
  while (stack.length) {
    const n = stack.pop();
    if (!n || typeof n !== 'object') continue;
    if (n.subscriberCountText) return getText(n.subscriberCountText);
    if (n.metadataParts && Array.isArray(n.metadataParts)) {
      for (const p of n.metadataParts) {
        const t = getText(p.text);
        if (t && /subscribers?/i.test(t)) return t;
      }
    }
    if (Array.isArray(n)) {
      for (const c of n) stack.push(c);
    } else {
      for (const k of Object.keys(n)) stack.push(n[k]);
    }
  }
  return null;
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
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url required' }, { status: 400 });
    }
    const normalized = normalizeUrl(url);
    const html = await fetchHtml(normalized);
    if (html.length < 1000) {
      return NextResponse.json(
        { error: 'YouTube returned an empty page (possibly rate-limited). Try again in a minute.' },
        { status: 502 }
      );
    }

    const data = extractInitialData(html);

    const videos: Video[] = [];
    if (data) walkVideos(data, videos, new Set(), 12);

    if (videos.length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not parse any videos. The channel may be empty, age-gated, or YouTube changed its page format.',
          debug: { htmlLength: html.length, foundInitialData: !!data },
        },
        { status: 422 }
      );
    }

    const channel = extractMeta(html, 'og:title') || 'Unknown channel';
    const description = extractMeta(html, 'og:description') || '';
    const subscribers = (data && extractSubsFromData(data)) || 'Hidden';

    const titles = videos.map((v) => v.title);
    const { pattern, variable } = detectFormat(titles);
    const ideas = generateIdeas(pattern, variable, titles);

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
