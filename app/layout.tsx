import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'CopperAI — AI Video Production Studio for YouTube',
  description:
    'AI-powered video production for serious creators. From idea to script to multi-platform publish bundle, in one guided workflow.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://copperai.app'),
  openGraph: {
    title: 'CopperAI — AI Video Production Studio',
    description: 'From idea to publish-ready bundle. One guided workflow.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
