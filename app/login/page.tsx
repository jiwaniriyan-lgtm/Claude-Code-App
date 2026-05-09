'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/generate';
  const initialError = params.get('error') ? 'Authentication failed. Try again.' : '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>(initialError);
  const [isError, setIsError] = useState(!!initialError);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        setMessage('Check your inbox to confirm your email.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        router.push(next);
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <div className="generator" style={{ paddingTop: 60 }}>
      <div className="gen-card" style={{ maxWidth: 440, margin: '0 auto' }}>
        <div className="logo" style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="l1">Copper</span><span className="l2">AI</span>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 24, fontSize: '.9rem' }}>
          {mode === 'signin' ? 'Sign in to your studio' : 'Create your studio'}
        </p>

        <button onClick={handleGoogle} disabled={loading} className="action-btn" style={{ width: '100%', padding: 14, marginBottom: 16, border: '1px solid var(--border)', color: 'var(--text)' }}>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: '.78rem', margin: '4px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          OR
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="setup-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="setup-input"
          />
          <button type="submit" disabled={loading} className="gen-btn">
            {loading ? <span className="spinner" /> : null}
            <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 16, fontSize: '.85rem', color: isError ? '#f87171' : 'var(--green)', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '.85rem', color: 'var(--muted)' }}>
          {mode === 'signin' ? (
            <>New here? <button type="button" onClick={() => setMode('signup')} style={{ color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>Create an account</button></>
          ) : (
            <>Have an account? <button type="button" onClick={() => setMode('signin')} style={{ color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>Sign in</button></>
          )}
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: '.8rem' }}>
          <Link href="/" style={{ color: 'var(--muted)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
