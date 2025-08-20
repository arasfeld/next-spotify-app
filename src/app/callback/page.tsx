'use client';

import { Button, Container, Loader, Stack, Text, Title } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';

import { setCredentials } from '@/lib/features/auth/auth-slice';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setError(error);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      return;
    }

    // Prevent multiple API calls
    if (hasProcessed.current || isProcessing) {
      return;
    }

    hasProcessed.current = true;
    setIsProcessing(true);

    // Exchange code for tokens
    const exchangeCodeForTokens = async () => {
      try {
        // Get the code verifier from localStorage
        const codeVerifier = localStorage.getItem('code_verifier');

        if (!codeVerifier) {
          throw new Error('Code verifier not found');
        }

        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, codeVerifier }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || 'Failed to exchange code for tokens'
          );
        }

        const tokens = await response.json();
        dispatch(setCredentials(tokens));

        // Clean up the code verifier immediately after successful exchange
        localStorage.removeItem('code_verifier');

        // Navigate to home page
        router.push('/');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    exchangeCodeForTokens();
  }, [searchParams, dispatch, router, isProcessing]);

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Stack
          gap="xl"
          align="center"
          justify="center"
          style={{ minHeight: '50vh' }}
        >
          <Title order={1} c="red">
            Authentication Error
          </Title>
          <Text>{error}</Text>
          <Button onClick={() => router.push('/login')}>Try Again</Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack
        gap="xl"
        align="center"
        justify="center"
        style={{ minHeight: '50vh' }}
      >
        <Loader size="lg" />
        <Title order={3}>Authenticating...</Title>
        <Text>Please wait while we complete your login.</Text>
      </Stack>
    </Container>
  );
}
