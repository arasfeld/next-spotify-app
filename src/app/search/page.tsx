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
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Play } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import { useSearchQuery } from '@/lib/features/spotify/spotify-api';

const ITEMS_PER_PAGE = 20;

export default function SearchPage() {
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

  const renderTrackGrid = (tracks: any[]) => (
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
                    width="100%"
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
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
                  <Text size="xs" c="dimmed">
                    {formatDuration(track.duration_ms)}
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );

  const renderArtistGrid = (artists: any[]) => (
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
                    width="100%"
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎤"
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

  const renderAlbumGrid = (albums: any[]) => (
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
                    width="100%"
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=💿"
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

  const renderPlaylistGrid = (playlists: any[]) => (
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
                    width="100%"
                    fit="cover"
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=📜"
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
                    onClick={() => router.push(`/playlist/${playlist.id}`)}
                  >
                    <Play size={16} fill="white" />
                  </ActionIcon>
                </Box>
                <Stack gap={2}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {playlist.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    By {playlist.owner?.display_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {playlist.tracks?.total || 0} tracks
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );

  const renderResults = () => {
    if (!searchResults) return null;

    const { tracks, artists, albums, playlists } = searchResults;
    const totalResults =
      (tracks?.total || 0) +
      (artists?.total || 0) +
      (albums?.total || 0) +
      (playlists?.total || 0);

    return (
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {totalResults} results for "{query}"
          </Text>
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
            size="sm"
          />
        </Group>

        {searchType.includes('track') && tracks?.items?.length > 0 && (
          <Box>
            <Title order={3} mb="md">
              Tracks
            </Title>
            {renderTrackGrid(tracks.items)}
          </Box>
        )}

        {searchType.includes('artist') && artists?.items?.length > 0 && (
          <Box>
            <Title order={3} mb="md">
              Artists
            </Title>
            {renderArtistGrid(artists.items)}
          </Box>
        )}

        {searchType.includes('album') && albums?.items?.length > 0 && (
          <Box>
            <Title order={3} mb="md">
              Albums
            </Title>
            {renderAlbumGrid(albums.items)}
          </Box>
        )}

        {searchType.includes('playlist') && playlists?.items?.length > 0 && (
          <Box>
            <Title order={3} mb="md">
              Playlists
            </Title>
            {renderPlaylistGrid(playlists.items)}
          </Box>
        )}

        {totalResults === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No results found for "{query}"
          </Text>
        )}

        {/* Pagination for single type searches */}
        {searchType !== 'track,artist,album,playlist' &&
          totalResults > ITEMS_PER_PAGE && (
            <Group justify="center">
              <Pagination
                total={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                value={page}
                onChange={setPage}
                size="sm"
              />
            </Group>
          )}
      </Stack>
    );
  };

  if (!query) {
    return (
      <Layout>
        <Box p="xl">
          <Stack
            gap="xl"
            align="center"
            justify="center"
            style={{ minHeight: '50vh' }}
          >
            <Title order={1}>🔍 Search</Title>
            <Text c="dimmed" size="lg">
              Enter a search term to find music
            </Text>
          </Stack>
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
              🔍 Search Results
            </Title>
            <Text c="dimmed" size="sm">
              Searching for "{query}"
            </Text>
          </Box>

          {isLoading ? (
            renderSkeletonGrid(12)
          ) : error ? (
            <Text c="red">Failed to load search results.</Text>
          ) : (
            renderResults()
          )}
        </Stack>
      </Box>
    </Layout>
  );
}
