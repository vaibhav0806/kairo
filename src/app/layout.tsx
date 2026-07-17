import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/geist';
import '@fontsource/instrument-serif';
import '../styles.css';

export const metadata: Metadata = {
  title: 'Kairo — Learn by doing',
  description: 'Ask Kairo about what is on your screen and get one clear next step while you learn.',
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
