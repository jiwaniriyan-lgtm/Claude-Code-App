import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function LandingPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? '/generate' : '/login?next=/generate';
  const ctaLabel = user ? 'Open studio' : 'Start free — 7 day trial';

  return (
    <>
      <div className="hero">
        <div className="badge">AI Video Production Studio</div>
        <h1>
          <span className="gradient">Niche Intelligence.</span>
          <br />
          Viral Ideas That Win.
        </h1>
        <p>
          From idea to script to publish-ready bundle for every platform — one guided workflow,
          built for creators who treat YouTube like a craft.
        </p>
        <Link href={ctaHref} className="hero-cta">
          <span className="play"></span>
          {ctaLabel}
        </Link>
      </div>

      <div className="generator">
        <div className="gen-card">
          <div className="section-label">How it works</div>
          <ol style={{ paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.8, fontSize: '.95rem' }}>
            <li><strong style={{ color: 'var(--text)' }}>Set the style.</strong> Drop a channel URL or pick your niche; paste reference transcripts; upload style + thumbnail references.</li>
            <li><strong style={{ color: 'var(--text)' }}>Generate 10 ideas.</strong> Each scored, tiered, and matched to the creator voice you defined.</li>
            <li><strong style={{ color: 'var(--text)' }}>Deep Dive.</strong> A 9-state workbook turns one idea into a script, image prompts, voice direction, vidIQ-style thumbnails, SEO titles + descriptions, and platform bundles for YouTube, Instagram, TikTok and Facebook.</li>
            <li><strong style={{ color: 'var(--text)' }}>Export.</strong> Markdown out, ready for your editor and publishing flow.</li>
          </ol>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={ctaHref} className="tier-cta primary" style={{ flex: 1 }}>{ctaLabel}</Link>
            <Link href="/pricing" className="tier-cta" style={{ flex: 1 }}>See pricing</Link>
          </div>
        </div>
      </div>
    </>
  );
}
