// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';

import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'Next Spotify App',
  description: 'A web-based Spotify client with all your favorite features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
