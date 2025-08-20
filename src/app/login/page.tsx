'use client';

import {
  Box,
  Button,
  Center,
  Container,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { ExternalLink, Music, Play, Radio } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';

import { LogoIcon } from '@/components/LogoIcon';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
  'http://127.0.0.1:3000/callback';

const SCOPES = [
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-collaborative',
  'playlist-read-private',
  'user-follow-read',
  'user-library-read',
  'user-read-currently-playing',
  'user-read-email',
  'user-read-private',
  'user-read-recently-played',
  'user-top-read',
];

// PKCE helper functions
const generateRandomString = (length: number) => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export default function LoginPage() {
  const theme = useMantineTheme();
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const themeMode = useAppSelector((state) => state.theme.mode);

  const handleLogin = async () => {
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store code verifier in localStorage for the callback
    window.localStorage.setItem('code_verifier', codeVerifier);

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(
      {
        client_id: CLIENT_ID!,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(' '),
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      }
    )}`;

    window.location.href = authUrl;
  };

  // Get primary color from theme
  const primaryColorValue =
    theme.colors[primaryColor as keyof typeof theme.colors]?.[6] ||
    theme.colors.green[6];
  const primaryColorLight =
    theme.colors[primaryColor as keyof typeof theme.colors]?.[5] ||
    theme.colors.green[5];

  // Theme-aware colors - use Redux store theme mode
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const backgroundStart = isDark ? theme.colors.dark[8] : theme.colors.gray[0];
  const backgroundEnd = isDark ? theme.colors.dark[6] : theme.colors.gray[2];
  const titleColor = isDark ? theme.white : theme.colors.dark[9];
  const titleGradientEnd = isDark ? theme.colors.gray[3] : theme.colors.gray[6];
  const descriptionColor = isDark ? theme.colors.gray[3] : theme.colors.gray[7];
  const subtitleColor = isDark ? theme.colors.gray[5] : theme.colors.gray[6];
  const featureColor = isDark ? theme.colors.gray[5] : theme.colors.gray[6];
  const iconColor = isDark ? theme.colors.gray[4] : theme.colors.gray[5];

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${backgroundStart} 0%, ${backgroundEnd} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, ${primaryColorValue}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${theme.colors.blue[6]}15 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${theme.colors.violet[6]}10 0%, transparent 50%)
          `,
          opacity: 0.6,
        }}
      />

      {/* Floating Icons */}
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          color: iconColor,
          opacity: 0.3,
        }}
      >
        <Music size={40} />
      </Box>
      <Box
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          color: iconColor,
          opacity: 0.3,
        }}
      >
        <Play size={30} />
      </Box>
      <Box
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '20%',
          color: iconColor,
          opacity: 0.3,
        }}
      >
        <Radio size={35} />
      </Box>

      <Container size="sm" style={{ position: 'relative', zIndex: 1 }}>
        <Center style={{ minHeight: '100vh' }}>
          <Stack align="center" gap="xl" justify="center" w="100%">
            {/* Logo Section */}
            <Stack align="center" gap="md">
              <LogoIcon size={80} />
              <Title
                order={1}
                size="3rem"
                ta="center"
                style={{
                  background: `linear-gradient(135deg, ${titleColor} 0%, ${titleGradientEnd} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                }}
              >
                Welcome to
                <br />
                Spotify Desktop
              </Title>
            </Stack>

            {/* Description */}
            <Stack align="center" gap="xs">
              <Text
                size="xl"
                ta="center"
                c={descriptionColor}
                style={{ maxWidth: 400 }}
              >
                Access your music library, discover new tracks, and enjoy your
                favorite playlists
              </Text>
              <Text size="md" ta="center" c={subtitleColor}>
                Connect your Spotify account to get started
              </Text>
            </Stack>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              size="xl"
              radius="xl"
              rightSection={<ExternalLink size={20} />}
              style={{
                background: `linear-gradient(135deg, ${primaryColorValue} 0%, ${primaryColorLight} 100%)`,
                border: 'none',
                boxShadow: `0 8px 32px ${primaryColorValue}40`,
                transition: 'all 0.3s ease',
                minWidth: 200,
              }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 40px ${primaryColorValue}60`,
                  },
                },
              }}
            >
              Connect with Spotify
            </Button>

            {/* Features */}
            <Stack gap="md" mt="xl">
              <Text size="sm" c={featureColor} ta="center">
                ✨ Personalized recommendations
              </Text>
              <Text size="sm" c={featureColor} ta="center">
                🎵 Your saved tracks, albums & artists
              </Text>
              <Text size="sm" c={featureColor} ta="center">
                📱 Browse featured playlists & new releases
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
