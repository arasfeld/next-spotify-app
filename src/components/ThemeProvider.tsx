'use client';

import { createTheme, MantineProvider } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';

import { MANTINE_COLORS } from '@/lib/features/theme/theme-slice';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial theme
    updateSystemTheme(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  }, []);

  // Determine the actual theme to use
  const actualTheme = themeMode === 'system' ? systemTheme : themeMode;

  // Ensure we have a valid primary color
  const validPrimaryColor = MANTINE_COLORS.includes(
    primaryColor as (typeof MANTINE_COLORS)[number]
  )
    ? primaryColor
    : 'green';

  // Create Mantine theme
  const theme = createTheme({
    primaryColor: validPrimaryColor,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  });

  // Force a key change to ensure MantineProvider re-renders when theme changes
  const providerKey = `theme-${actualTheme}-${validPrimaryColor}`;

  return (
    <MantineProvider
      key={providerKey}
      theme={theme}
      defaultColorScheme={actualTheme}
    >
      {children}
    </MantineProvider>
  );
}
