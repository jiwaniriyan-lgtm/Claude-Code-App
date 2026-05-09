import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav className="nav">
      <Link href={user ? '/generate' : '/'} className="logo" style={{ textDecoration: 'none' }}>
        <span className="l1">Copper</span>
        <span className="l2">AI</span>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link href="/generate" className="nav-btn">Generate</Link>
            <Link href="/history" className="nav-btn">History</Link>
            <Link href="/workbooks" className="nav-btn">Workbooks</Link>
            <Link href="/settings" className="nav-btn">Settings</Link>
            <form action="/api/auth/signout" method="post" style={{ display: 'inline' }}>
              <button type="submit" className="nav-btn">Sign out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/pricing" className="nav-btn">Pricing</Link>
            <Link href="/login" className="nav-btn active">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
}
