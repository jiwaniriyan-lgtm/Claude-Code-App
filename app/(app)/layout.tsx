import Nav from '@/components/Nav';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
