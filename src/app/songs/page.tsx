'use client';

import {
  ActionIcon,
  Box,
  Card,
  Group,
  Image,
  Loader,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Play } from 'lucide-react';
import { useCallback, useRef, useState, useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import { spotifyApi } from '@/lib/features/spotify/spotify-api';

export default function SongsPage() {
  const auth = useAppSelector((state) => state.auth);
  const [, setScrollPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const {
    data: savedTracksData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = spotifyApi.endpoints.getSavedTracksInfinite.useInfiniteQuery(
    { limit: 50 },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  // Flatten all pages into a single array
  const allTracks =
    savedTracksData?.pages.flatMap(
      (page: {
        items: Array<{
          track: {
            id: string;
            name: string;
            album?: { images?: Array<{ url: string }> };
            artists: Array<{ name: string }>;
            duration_ms: number;
          };
        }>;
      }) => page.items
    ) || [];
  const totalTracks = savedTracksData?.pages[0]?.total || 0;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatArtistNames = (artists: Array<{ name: string }>) => {
    return artists.map((artist) => artist.name).join(', ');
  };

  // Memoize the scroll handler to prevent unnecessary re-renders
  const handleScrollPositionChange = useCallback(
    (position: { x: number; y: number }) => {
      setScrollPosition(position);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce scroll events to improve performance
      scrollTimeoutRef.current = setTimeout(() => {
        if (!viewportRef.current || isFetchingNextPage || !hasNextPage) {
          return;
        }

        const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
        const threshold = 300; // Increased threshold for better UX
        const isNearBottom =
          scrollTop + clientHeight >= scrollHeight - threshold;

        if (isNearBottom) {
          fetchNextPage();
        }
      }, 100); // 100ms debounce
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Memoize the track cards to prevent unnecessary re-renders
  const trackCards = useMemo(() => {
    return allTracks
      .filter(
        (
          item
        ): item is {
          track: {
            id: string;
            name: string;
            album?: { images?: Array<{ url: string }> };
            artists: Array<{ name: string }>;
            duration_ms: number;
          };
        } =>
          item !== null &&
          item !== undefined &&
          item.track !== null &&
          item.track !== undefined
      )
      .map((item) => (
        <Card key={item.track.id} p="md">
          <Group>
            <Image
              src={item.track.album?.images?.[0]?.url}
              width={60}
              height={60}
              radius="sm"
              fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
              alt={`Album cover for ${item.track.name}`}
              loading="lazy"
            />
            <Box style={{ flex: 1 }}>
              <Text fw={500} lineClamp={1}>
                {item.track.name}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {formatArtistNames(item.track.artists)}
              </Text>
            </Box>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {formatDuration(item.track.duration_ms)}
              </Text>
              <ActionIcon
                variant="filled"
                size="md"
                radius="xl"
                style={{
                  backgroundColor: 'var(--mantine-color-green-6)',
                }}
              >
                <Play size={14} fill="white" />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ));
  }, [allTracks]);

  if (isLoading) {
    return (
      <Layout>
        <Box p="xl">
          <Title order={1} mb="lg">
            Your Songs
          </Title>
          <ScrollArea h="100%" type="auto" offsetScrollbars>
            <Stack gap="md">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} p="md">
                  <Group>
                    <Skeleton height={60} width={60} />
                    <Box style={{ flex: 1 }}>
                      <Skeleton height={20} width="60%" mb={8} />
                      <Skeleton height={16} width="40%" />
                    </Box>
                    <Skeleton height={16} width={40} />
                  </Group>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box p="xl">
          <Title order={1} mb="lg">
            Your Songs
          </Title>
          <Text c="red">Failed to load saved tracks. Please try again.</Text>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🎵 Your Songs
            </Title>
            <Text c="dimmed" size="sm">
              {totalTracks} saved tracks
            </Text>
          </Box>

          <ScrollArea
            h="100%"
            type="auto"
            offsetScrollbars
            viewportRef={viewportRef}
            onScrollPositionChange={handleScrollPositionChange}
            scrollbarSize={8}
            scrollHideDelay={500}
          >
            <Stack gap="md">
              {trackCards}

              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <Card p="md" withBorder>
                  <Group justify="center" gap="md">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">
                      Loading more tracks...
                    </Text>
                  </Group>
                </Card>
              )}

              {/* End of list indicator */}
              {!hasNextPage && allTracks.length > 0 && (
                <Text ta="center" c="dimmed" py="md">
                  You&apos;ve reached the end of your saved tracks
                </Text>
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Box>
    </Layout>
  );
}
