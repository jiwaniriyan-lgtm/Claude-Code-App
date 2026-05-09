import Nav from '@/components/Nav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <footer>
        © {new Date().getFullYear()} Sameera 5 LLC · CopperAI · <a href="mailto:hello@copperai.app">hello@copperai.app</a>
      </footer>
    </>
  );
}
