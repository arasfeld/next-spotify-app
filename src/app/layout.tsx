// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import {
  ColorSchemeScript,
  createTheme,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next Spotify App',
  description: 'A web-based Spotify client with all your favorite features',
};

const theme = createTheme({
  /** Put your mantine theme override here */
});

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
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
