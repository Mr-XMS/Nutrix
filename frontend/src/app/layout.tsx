import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nutrix',
  description: 'NDIS provider management built for small operators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans text-ink-900 bg-white">
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-geist-sans)',
              fontSize: '13px',
              border: '0.5px solid rgba(15, 20, 25, 0.1)',
              borderRadius: '8px',
            },
          }}
        />
      </body>
    </html>
  );
}
