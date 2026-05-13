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
  return url.replace(/\/$/, '').replace(/\/videos$/, '');
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      // Skip the consent interstitial that YouTube serves to some regions / fresh clients
      Cookie: 'CONSENT=YES+1; PREF=hl=en',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  return res.text();
}

function extractMeta(html: string, prop: string): string | null {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name|itemprop)="${prop}"[^>]+content="([^"]+)"`));
  return m ? decodeHtml(m[1]) : null;
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

function extractChannelId(html: string): string | null {
  return (
    html.match(/"channelId":"(UC[A-Za-z0-9_-]{20,})"/)?.[1] ||
    html.match(/<meta[^>]+itemprop="channelId"[^>]+content="(UC[A-Za-z0-9_-]{20,})"/)?.[1] ||
    html.match(/channel\/(UC[A-Za-z0-9_-]{20,})/)?.[1] ||
    null
  );
}

function extractSubsFromHtml(html: string): string | null {
  return (
    html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/)?.[1] ||
    html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/)?.[1] ||
    html.match(/"metadataParts":\[\{"text":\{"content":"([^"]*subscribers?[^"]*)"/)?.[1] ||
    null
  );
}

function parseRssVideos(xml: string): { channelName: string; videos: Video[] } {
  // First <title> is the channel name; subsequent <title> inside <entry> are videos.
  const channelNameMatch = xml.match(/<title>([^<]+)<\/title>/);
  const channelName = channelNameMatch ? decodeHtml(channelNameMatch[1]) : '';

  const videos: Video[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null) {
    const entry = m[1];
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    const views = entry.match(/<media:statistics\s+views="(\d+)"/)?.[1];
    if (title) {
      videos.push({
        title: decodeHtml(title).trim(),
        views: views ? formatViews(parseInt(views, 10)) : '',
      });
    }
  }
  return { channelName, videos };
}

function formatViews(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B views';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M views';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K views';
  return n + ' views';
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
    const baseUrl = normalizeUrl(url);
    debug.baseUrl = baseUrl;

    let html = '';
    try {
      html = await fetchText(baseUrl);
      debug.htmlLength = html.length;
    } catch (e: any) {
      debug.htmlFetchError = e?.message;
    }

    // Try several places for channel ID
    let channelId: string | null = null;
    if (html) channelId = extractChannelId(html);
    if (!channelId) {
      // URL itself might already be /channel/UC...
      channelId = baseUrl.match(/channel\/(UC[A-Za-z0-9_-]{20,})/)?.[1] || null;
    }
    debug.channelId = channelId;

    if (!channelId) {
      return NextResponse.json(
        {
          error:
            'Could not find the channel ID. Try pasting the URL directly from your browser address bar (e.g. https://www.youtube.com/@handle).',
          debug,
        },
        { status: 422 }
      );
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const xml = await fetchText(rssUrl);
    debug.rssLength = xml.length;

    const { channelName, videos } = parseRssVideos(xml);
    debug.videoCount = videos.length;

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'No videos found in the channel RSS feed.', debug },
        { status: 422 }
      );
    }

    // Sort by views desc when we have view counts
    videos.sort((a, b) => parseViewsToNumber(b.views) - parseViewsToNumber(a.views));

    const channel =
      (html && extractMeta(html, 'og:title')) ||
      channelName ||
      'Unknown channel';
    const description = (html && extractMeta(html, 'og:description')) || '';
    const subscribers = (html && extractSubsFromHtml(html)) || 'Hidden';

    const titles = videos.map((v) => v.title);
    const { pattern, variable } = detectFormat(titles);
    const ideas = generateIdeas(pattern, variable, titles);

    return NextResponse.json({
      channel,
      url: baseUrl,
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
    return NextResponse.json(
      { error: err?.message || 'Failed to analyze', debug },
      { status: 500 }
    );
  }
}

function parseViewsToNumber(s: string): number {
  if (!s) return 0;
  const m = s.match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = m[2]?.toUpperCase() === 'B' ? 1e9 : m[2]?.toUpperCase() === 'M' ? 1e6 : m[2]?.toUpperCase() === 'K' ? 1e3 : 1;
  return n * mult;
}
