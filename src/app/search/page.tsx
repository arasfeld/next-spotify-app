'use client';

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = 'force-dynamic';

import {
  ActionIcon,
  Box,
  Card,
  Grid,
  Group,
  Image,
  Pagination,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Play } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import { useSearchQuery } from '@/lib/features/spotify/spotify-api';
import type { Album, Artist, Playlist, Track } from '@/lib/types';

const ITEMS_PER_PAGE = 20;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAppSelector((state) => state.auth);

  const [searchType, setSearchType] = useState('track,artist,album,playlist');
  const [page, setPage] = useState(1);

  const query = searchParams.get('q') || '';

  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearchQuery(
    {
      query,
      type: searchType,
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    },
    {
      skip: !auth.authenticated || !auth.accessToken || !query,
    }
  );

  // Reset page when query or type changes
  useEffect(() => {
    setPage(1);
  }, [query, searchType]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatArtistNames = (artists: Array<{ name: string }>) => {
    return artists?.map((artist) => artist.name).join(', ') || '';
  };

  const renderSkeletonGrid = (count: number) => (
    <Grid gutter="md">
      {Array.from({ length: count }).map((_, index) => (
        <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder p="sm">
            <Stack gap="xs">
              <Skeleton height={120} width="100%" radius="sm" />
              <Stack gap={2}>
                <Skeleton height={16} width="80%" />
                <Skeleton height={12} width="60%" />
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );

  const renderTrackGrid = (tracks: Track[]) => (
    <Grid gutter="md">
      {tracks
        .filter((track) => track !== null)
        .map((track) => (
          <Grid.Col key={track.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card withBorder p="sm">
              <Stack gap="xs">
                <Box pos="relative">
                  <Image
                    src={track.album?.images?.[0]?.url}
                    height={120}
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
                    alt={`Album cover for ${track.name}`}
                  />
                  <ActionIcon
                    variant="filled"
                    size="lg"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'var(--mantine-color-green-6)',
                    }}
                  >
                    <Play size={16} fill="white" />
                  </ActionIcon>
                </Box>
                <Stack gap={2}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {track.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {formatArtistNames(track.artists)}
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );

  const renderArtistGrid = (artists: Artist[]) => (
    <Grid gutter="md">
      {artists
        .filter((artist) => artist !== null)
        .map((artist) => (
          <Grid.Col key={artist.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card withBorder p="sm">
              <Stack gap="xs">
                <Box pos="relative">
                  <Image
                    src={artist.images?.[0]?.url}
                    height={120}
                    fit="cover"
                    radius="50%"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎤"
                    alt={`Artist photo for ${artist.name}`}
                  />
                  <ActionIcon
                    variant="filled"
                    size="lg"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'var(--mantine-color-green-6)',
                    }}
                  >
                    <Play size={16} fill="white" />
                  </ActionIcon>
                </Box>
                <Stack gap={2}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {artist.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Artist
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );

  const renderAlbumGrid = (albums: Album[]) => (
    <Grid gutter="md">
      {albums
        .filter((album) => album !== null)
        .map((album) => (
          <Grid.Col key={album.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card withBorder p="sm">
              <Stack gap="xs">
                <Box pos="relative">
                  <Image
                    src={album.images?.[0]?.url}
                    height={120}
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=💿"
                    alt={`Album cover for ${album.name}`}
                  />
                  <ActionIcon
                    variant="filled"
                    size="lg"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'var(--mantine-color-green-6)',
                    }}
                  >
                    <Play size={16} fill="white" />
                  </ActionIcon>
                </Box>
                <Stack gap={2}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {album.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {formatArtistNames(album.artists)}
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );

  const renderPlaylistGrid = (playlists: Playlist[]) => (
    <Grid gutter="md">
      {playlists
        .filter((playlist) => playlist !== null)
        .map((playlist) => (
          <Grid.Col key={playlist.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card withBorder p="sm">
              <Stack gap="xs">
                <Box pos="relative">
                  <Image
                    src={playlist.images?.[0]?.url}
                    height={120}
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=📜"
                    alt={`Playlist cover for ${playlist.name}`}
                  />
                  <ActionIcon
                    variant="filled"
                    size="lg"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'var(--mantine-color-green-6)',
                    }}
                  >
                    <Play size={16} fill="white" />
                  </ActionIcon>
                </Box>
                <Stack gap={2}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {playlist.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Playlist • {playlist.tracks?.total || 0} tracks
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );

  const renderResults = () => {
    if (isLoading) {
      return renderSkeletonGrid(ITEMS_PER_PAGE);
    }

    if (error) {
      return (
        <Text c="red" ta="center" py="xl">
          Failed to load search results. Please try again.
        </Text>
      );
    }

    if (!searchResults) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          Enter a search term to find music
        </Text>
      );
    }

    const { tracks, artists, albums, playlists } = searchResults;

    return (
      <Stack gap="xl">
        {tracks?.items && tracks.items.length > 0 && (
          <Box>
            <Title order={2} mb="md">
              Tracks
            </Title>
            {renderTrackGrid(tracks.items)}
          </Box>
        )}

        {artists?.items && artists.items.length > 0 && (
          <Box>
            <Title order={2} mb="md">
              Artists
            </Title>
            {renderArtistGrid(artists.items)}
          </Box>
        )}

        {albums?.items && albums.items.length > 0 && (
          <Box>
            <Title order={2} mb="md">
              Albums
            </Title>
            {renderAlbumGrid(albums.items)}
          </Box>
        )}

        {playlists?.items && playlists.items.length > 0 && (
          <Box>
            <Title order={2} mb="md">
              Playlists
            </Title>
            {renderPlaylistGrid(playlists.items)}
          </Box>
        )}

        {!tracks?.items?.length &&
          !artists?.items?.length &&
          !albums?.items?.length &&
          !playlists?.items?.length && (
            <Text c="dimmed" ta="center" py="xl">
              No results found for &quot;{query}&quot;
            </Text>
          )}
      </Stack>
    );
  };

  const totalResults =
    (searchResults?.tracks?.items?.length || 0) +
    (searchResults?.artists?.items?.length || 0) +
    (searchResults?.albums?.items?.length || 0) +
    (searchResults?.playlists?.items?.length || 0);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🔍 Search
            </Title>
            {query && (
              <Text c="dimmed" size="sm">
                Results for &quot;{query}&quot;
              </Text>
            )}
          </Box>

          {query && (
            <SegmentedControl
              value={searchType}
              onChange={setSearchType}
              data={[
                { label: 'All', value: 'track,artist,album,playlist' },
                { label: 'Tracks', value: 'track' },
                { label: 'Artists', value: 'artist' },
                { label: 'Albums', value: 'album' },
                { label: 'Playlists', value: 'playlist' },
              ]}
            />
          )}

          <ScrollArea h="calc(100vh - 200px)" type="auto" offsetScrollbars>
            {renderResults()}
          </ScrollArea>

          {totalPages > 1 && (
            <Group justify="center">
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
                size="sm"
              />
            </Group>
          )}
        </Stack>
      </Box>
    </Layout>
  );
}

// Loading fallback component
function SearchLoading() {
  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🔍 Search
            </Title>
          </Box>
          <ScrollArea h="calc(100vh - 200px)" type="auto" offsetScrollbars>
            <Grid gutter="md">
              {Array.from({ length: 20 }).map((_, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card withBorder p="sm">
                    <Stack gap="xs">
                      <Skeleton height={120} width="100%" radius="sm" />
                      <Stack gap={2}>
                        <Skeleton height={16} width="80%" />
                        <Skeleton height={12} width="60%" />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </ScrollArea>
        </Stack>
      </Box>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
