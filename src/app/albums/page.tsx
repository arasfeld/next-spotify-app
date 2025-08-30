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

interface SavedAlbumItem {
  album: {
    id: string;
    name: string;
    images?: Array<{ url: string }>;
    artists: Array<{ name: string }>;
  };
  added_at: string;
}

export default function AlbumsPage() {
  const auth = useAppSelector((state) => state.auth);
  const [, setScrollPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const {
    data: savedAlbumsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = spotifyApi.endpoints.getSavedAlbumsInfinite.useInfiniteQuery(
    { limit: 50 },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  // Flatten all pages into a single array
  const allAlbums =
    savedAlbumsData?.pages.flatMap(
      (page: { items: Array<SavedAlbumItem> }) => page.items
    ) || [];
  const totalAlbums = savedAlbumsData?.pages[0]?.total || 0;

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

  // Memoize the album cards to prevent unnecessary re-renders
  const albumCards = useMemo(() => {
    return allAlbums
      .filter(
        (item): item is SavedAlbumItem => item !== null && item !== undefined
      )
      .map((item) => (
        <Card key={item.album.id} p="md" withBorder>
          <Group>
            <Box style={{ flexShrink: 0 }}>
              <Image
                src={item.album.images?.[0]?.url}
                width={80}
                height={80}
                fit="cover"
                radius="sm"
                fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=💿"
                alt={`Album cover for ${item.album.name}`}
                loading="lazy"
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="lg" fw={500} lineClamp={1}>
                {item.album.name}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {formatArtistNames(item.album.artists)}
              </Text>
              <Text size="xs" c="dimmed">
                Saved on {new Date(item.added_at).toLocaleDateString()}
              </Text>
            </Box>
            <ActionIcon
              variant="filled"
              size="lg"
              radius="xl"
              style={{
                backgroundColor: 'var(--mantine-color-green-6)',
              }}
            >
              <Play size={16} fill="white" />
            </ActionIcon>
          </Group>
        </Card>
      ));
  }, [allAlbums]);

  if (isLoading) {
    return (
      <Layout>
        <Box p="xl">
          <Title order={1} mb="lg">
            Your Albums
          </Title>
          <ScrollArea h="100%" type="auto" offsetScrollbars>
            <Stack gap="md">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} p="md">
                  <Group>
                    <Skeleton height={80} width={80} />
                    <Box style={{ flex: 1 }}>
                      <Skeleton height={24} width="60%" mb={8} />
                      <Skeleton height={16} width="40%" mb={4} />
                      <Skeleton height={14} width="30%" />
                    </Box>
                    <Skeleton height={32} width={32} radius="50%" />
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
            Your Albums
          </Title>
          <Text c="red">Failed to load saved albums. Please try again.</Text>
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
              💿 Your Albums
            </Title>
            <Text c="dimmed" size="sm">
              {totalAlbums} saved albums
            </Text>
          </Box>

          {allAlbums.length === 0 ? (
            <Text c="dimmed">No saved albums found.</Text>
          ) : (
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
                {albumCards}

                {/* Loading indicator for infinite scroll */}
                {isFetchingNextPage && (
                  <Card p="md" withBorder>
                    <Group justify="center" gap="md">
                      <Loader size="sm" />
                      <Text size="sm" c="dimmed">
                        Loading more albums...
                      </Text>
                    </Group>
                  </Card>
                )}

                {/* End of list indicator */}
                {!hasNextPage && allAlbums.length > 0 && (
                  <Text ta="center" c="dimmed" py="md">
                    You&apos;ve reached the end of your saved albums
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Box>
    </Layout>
  );
}
