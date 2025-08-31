'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Image,
  Loader,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { Clock, Play } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useRef, useState, useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import { spotifyApi } from '@/lib/features/spotify/spotify-api';
import type { Track } from '@/lib/types';

export default function PlaylistPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const auth = useAppSelector((state) => state.auth);
  const [, setScrollPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Fetch playlist metadata
  const {
    data: playlistData,
    isLoading: playlistLoading,
    error: playlistError,
  } = spotifyApi.useGetPlaylistQuery(playlistId || '', {
    skip: !auth.authenticated || !auth.accessToken || !playlistId,
  });

  // Fetch playlist tracks with infinite query
  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = spotifyApi.endpoints.getPlaylistTracksInfinite.useInfiniteQuery(
    {
      playlistId: playlistId || '',
      limit: 100,
    },
    {
      skip: !auth.authenticated || !auth.accessToken || !playlistId,
    }
  );

  // Flatten all pages into a single array
  const allTracks =
    tracksData?.pages.flatMap((page: { items: Array<{ track: Track }> }) =>
      page.items.map((item: { track: Track }) => item.track).filter(Boolean)
    ) || [];

  // Show loading skeleton when data is loading
  const isLoading = playlistLoading || tracksLoading;
  const error = playlistError || tracksError;
  const playlist = playlistData;

  // Format time in MM:SS
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = () => {
    // TODO: Implement play track functionality
  };

  const handlePlayPlaylist = () => {
    // TODO: Implement play entire playlist functionality
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

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    return allTracks
      .filter((track): track is Track => track !== null && track !== undefined)
      .map((track: Track, index: number) => (
        <Table.Tr key={`${track.id}-${index}`}>
          <Table.Td>
            <Text size="sm" c="dimmed">
              {index + 1}
            </Text>
          </Table.Td>
          <Table.Td>
            <Group gap="sm">
              <Box style={{ width: 50, height: 50, flexShrink: 0 }}>
                <Image
                  src={track.album?.images?.[0]?.url}
                  alt={track.name || 'Track'}
                  width="100%"
                  height="100%"
                  fit="cover"
                  radius="sm"
                  fallbackSrc="https://placehold.co/50x50/1db954/ffffff?text=🎵"
                  loading="lazy"
                />
              </Box>
              <Tooltip
                label={track.name || 'Unknown Track'}
                disabled={!track.name}
              >
                <Text size="sm" fw={500} lineClamp={1}>
                  {track.name || 'Unknown Track'}
                </Text>
              </Tooltip>
            </Group>
          </Table.Td>
          <Table.Td>
            <Tooltip
              label={
                track.artists
                  ?.map((artist: { name: string }) => artist.name)
                  .join(', ') || 'Unknown Artist'
              }
              disabled={!track.artists?.length}
            >
              <Text size="sm" c="dimmed" lineClamp={1}>
                {track.artists
                  ?.map((artist: { name: string }) => artist.name)
                  .join(', ') || 'Unknown Artist'}
              </Text>
            </Tooltip>
          </Table.Td>
          <Table.Td>
            <Tooltip
              label={track.album?.name || 'Unknown Album'}
              disabled={!track.album?.name}
            >
              <Text size="sm" c="dimmed" lineClamp={1}>
                {track.album?.name || 'Unknown Album'}
              </Text>
            </Tooltip>
          </Table.Td>
          <Table.Td>
            <Text size="sm" c="dimmed" ta="center">
              {formatTime(track.duration_ms || 0)}
            </Text>
          </Table.Td>
          <Table.Td>
            <ActionIcon
              size="sm"
              title="Play track"
              variant="subtle"
              onClick={handlePlayTrack}
            >
              <Play size={16} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      ));
  }, [allTracks, formatTime, handlePlayTrack]);

  // Loading skeleton component
  const PlaylistSkeleton = () => (
    <Layout>
      <Stack h="calc(100vh - 60px)" gap={0} style={{ overflow: 'hidden' }}>
        {/* Fixed Playlist Header Skeleton */}
        <Paper p="lg" style={{ flexShrink: 0 }}>
          <Group gap="lg">
            <Skeleton height={200} width={200} radius="md" />
            <Stack gap="md" style={{ flex: 1 }}>
              <div>
                <Skeleton height={24} width={80} mb="xs" />
                <Skeleton height={32} width={300} mb="xs" />
                <Skeleton height={16} width={400} mb="md" />
                <Skeleton height={16} width={200} />
              </div>
              <Skeleton height={36} width={80} />
            </Stack>
          </Group>
        </Paper>

        {/* Table Skeleton */}
        <Paper
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ScrollArea h="100%" type="auto" offsetScrollbars>
            <Table stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 50 }}>#</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Artist</Table.Th>
                  <Table.Th>Album</Table.Th>
                  <Table.Th style={{ width: 100 }}>
                    <Group gap="xs" justify="center">
                      <Clock size={16} />
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ width: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Array.from({ length: 20 }, (_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Skeleton height={16} width={20} />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Skeleton height={50} width={50} radius="sm" />
                        <Skeleton height={16} width={200} />
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={16} width={150} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={16} width={150} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={16} width={40} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={16} width={16} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Stack>
    </Layout>
  );

  if (isLoading) {
    return <PlaylistSkeleton />;
  }

  if (error || !playlist) {
    return (
      <Layout>
        <Container size="lg" py="xl">
          <Text c="red">Failed to load playlist</Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Stack h="calc(100vh - 60px)" gap={0} style={{ overflow: 'hidden' }}>
        {/* Fixed Playlist Header */}
        <Paper
          p="lg"
          style={{
            flexShrink: 0,
          }}
        >
          <Group gap="lg">
            <Box style={{ width: 200, height: 200, flexShrink: 0 }}>
              <Image
                src={playlist.images?.[0]?.url}
                alt={playlist.name || 'Playlist'}
                width="100%"
                height="100%"
                fit="cover"
                radius="md"
                fallbackSrc="https://placehold.co/200x200/1db954/ffffff?text=🎵"
              />
            </Box>
            <Stack gap="md" style={{ flex: 1 }}>
              <div>
                <Badge variant="light" mb="xs">
                  Playlist
                </Badge>
                <Title order={1} mb="xs">
                  {playlist.name || 'Untitled Playlist'}
                </Title>
                {playlist.description && (
                  <Text c="dimmed" mb="md">
                    {playlist.description}
                  </Text>
                )}
                <Text size="sm" c="dimmed">
                  Created by {playlist.owner?.display_name || 'Unknown'} •{' '}
                  {playlist.tracks?.total || 0} tracks
                </Text>
              </div>
              <Group>
                <Button
                  leftSection={<Play size={16} />}
                  onClick={handlePlayPlaylist}
                  size="md"
                >
                  Play
                </Button>
              </Group>
            </Stack>
          </Group>
        </Paper>

        {/* Scrollable Table Container */}
        <Paper
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ScrollArea
            h="100%"
            type="auto"
            offsetScrollbars
            viewportRef={viewportRef}
            onScrollPositionChange={handleScrollPositionChange}
            scrollbarSize={8}
            scrollHideDelay={500}
          >
            <Table highlightOnHover stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 50 }}>#</Table.Th>
                  <Table.Th style={{ minWidth: 300 }}>Title</Table.Th>
                  <Table.Th style={{ width: 200 }}>Artist</Table.Th>
                  <Table.Th style={{ width: 200 }}>Album</Table.Th>
                  <Table.Th style={{ width: 80 }}>
                    <Group gap="xs" justify="center">
                      <Clock size={16} />
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ width: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {allTracks.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed" py="xl">
                        No tracks found
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  tableRows
                )}
              </Table.Tbody>
            </Table>

            {/* Loading indicator for infinite scroll */}
            {isFetchingNextPage && (
              <Box p="md" style={{ flexShrink: 0 }}>
                <Group justify="center" gap="md">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    Loading more tracks...
                  </Text>
                </Group>
              </Box>
            )}

            {/* End of list indicator */}
            {!hasNextPage && allTracks.length > 0 && (
              <Text ta="center" c="dimmed" py="md">
                You&apos;ve reached the end of this playlist
              </Text>
            )}
          </ScrollArea>
        </Paper>
      </Stack>
    </Layout>
  );
}
