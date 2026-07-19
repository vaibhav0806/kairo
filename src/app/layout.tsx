import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '../styles.css';

export const metadata: Metadata = {
  title: 'Kairo — Learn any creative tool',
  description: 'Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.',
  icons: '/favicon.svg'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
