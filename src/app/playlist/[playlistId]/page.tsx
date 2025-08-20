'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { Clock, Play } from 'lucide-react';
import { useParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import {
  useGetPlaylistQuery,
  useGetPlaylistTracksQuery,
} from '@/lib/features/spotify/spotify-api';

export default function PlaylistPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const auth = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(0);
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitchingPlaylist, setIsSwitchingPlaylist] = useState(false);
  const tracksPerPage = 100;
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Fetch playlist metadata
  const {
    data: playlistData,
    isLoading: playlistLoading,
    error: playlistError,
  } = useGetPlaylistQuery(playlistId || '', {
    skip: !auth.authenticated || !auth.accessToken || !playlistId,
  });

  // Fetch playlist tracks with pagination
  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
  } = useGetPlaylistTracksQuery(
    {
      playlistId: playlistId || '',
      limit: tracksPerPage,
      offset: currentPage * tracksPerPage,
    },
    {
      skip: !auth.authenticated || !auth.accessToken || !playlistId,
    }
  );

  // Reset tracks and pagination when playlist ID changes
  useEffect(() => {
    setIsSwitchingPlaylist(true);
    setAllTracks([]);
    setCurrentPage(0);
    setIsLoadingMore(false);
  }, [playlistId]);

  // Update all tracks when new data is loaded
  useEffect(() => {
    if (tracksData?.items) {
      const newTracks = tracksData.items
        .map((item: any) => item.track)
        .filter(Boolean);

      if (currentPage === 0) {
        // First page, replace all tracks
        setAllTracks(newTracks);
      } else {
        // Subsequent pages, append tracks
        setAllTracks((prev) => {
          // Check for duplicates by track ID
          const existingIds = new Set(prev.map((track: any) => track.id));
          const uniqueNewTracks = newTracks.filter(
            (track: any) => !existingIds.has(track.id)
          );

          return [...prev, ...uniqueNewTracks];
        });
      }

      // Reset loading state
      setIsLoadingMore(false);
      setIsSwitchingPlaylist(false);
    }
  }, [tracksData, currentPage, tracksPerPage]);

  // Show loading skeleton when switching playlists or when data is loading
  const isLoading = playlistLoading || tracksLoading || isSwitchingPlaylist;
  const error = playlistError || tracksError;
  const playlist = playlistData;

  // Check if we have more tracks to load
  const hasMoreTracks =
    playlist &&
    allTracks.length < playlist.tracks.total &&
    (tracksData?.items?.length === tracksPerPage || currentPage === 0);

  // Format time in MM:SS
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (trackUri: string) => {
    // TODO: Implement play track functionality
  };

  const handlePlayPlaylist = () => {
    // TODO: Implement play entire playlist functionality
  };

  const handleLoadMore = useCallback(() => {
    if (
      !isLoadingMore &&
      hasMoreTracks &&
      allTracks.length < (playlist?.tracks?.total || 0)
    ) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [
    isLoadingMore,
    hasMoreTracks,
    allTracks.length,
    playlist?.tracks?.total,
    tracksData?.items?.length,
    tracksPerPage,
  ]);

  // Set up scroll listener when component mounts and ref is available
  useLayoutEffect(() => {
    if (!tableContainerRef.current) return;

    const handleScroll = () => {
      if (!tableContainerRef.current || isLoadingMore) {
        return;
      }

      // Don't load more if we already have all tracks or if we've reached the end
      if (
        allTracks.length >= (playlist?.tracks?.total || 0) ||
        !hasMoreTracks
      ) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } =
        tableContainerRef.current;

      // Only trigger if we're near the bottom (within 200px)
      const threshold = 200;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom) {
        handleLoadMore();
      }
    };

    const containerElement = tableContainerRef.current;
    containerElement.addEventListener('scroll', handleScroll);

    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
    };
  }, [
    isLoadingMore,
    handleLoadMore,
    allTracks.length,
    playlist?.tracks?.total,
  ]);

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
          <div style={{ flex: 1, overflow: 'auto' }}>
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
          </div>
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
          <div
            ref={tableContainerRef}
            style={{
              flex: 1,
              overflow: 'auto',
            }}
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
                  allTracks.map((track: any, index: number) => (
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
                            />
                          </Box>
                          <Tooltip
                            label={track.name || 'Unknown Track'}
                            disabled={!track.name}
                          >
                            <Text
                              size="sm"
                              fw={500}
                              lineClamp={1}
                              style={{ maxWidth: 200 }}
                            >
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
                          <Text
                            size="sm"
                            c="dimmed"
                            lineClamp={1}
                            style={{ maxWidth: 150 }}
                          >
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
                          <Text
                            size="sm"
                            c="dimmed"
                            lineClamp={1}
                            style={{ maxWidth: 150 }}
                          >
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
                          onClick={() => handlePlayTrack(track.uri || '')}
                        >
                          <Play size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <Group justify="center" p="md" style={{ flexShrink: 0 }}>
                <Text size="sm" c="dimmed">
                  Loading more tracks...
                </Text>
              </Group>
            )}
          </div>
        </Paper>
      </Stack>
    </Layout>
  );
}
