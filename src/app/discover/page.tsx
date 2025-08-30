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
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Play } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import {
  useGetCurrentlyPlayingQuery,
  useGetNewReleasesQuery,
  useGetRecentlyPlayedQuery,
  useGetSavedAlbumsQuery,
  useGetTopArtistsQuery,
  useGetTopTracksQuery,
} from '@/lib/features/spotify/spotify-api';

import type { Album, Artist, Track } from '@/lib/types';

export default function DiscoverPage() {
  const auth = useAppSelector((state) => state.auth);

  const { data: topTracks, isLoading: topTracksLoading } = useGetTopTracksQuery(
    { timeRange: 'short_term' },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  const { data: topArtists, isLoading: topArtistsLoading } =
    useGetTopArtistsQuery(
      { timeRange: 'short_term' },
      {
        skip: !auth.authenticated || !auth.accessToken,
      }
    );

  const { data: newReleases, isLoading: newReleasesLoading } =
    useGetNewReleasesQuery(
      { limit: 20 },
      {
        skip: !auth.authenticated || !auth.accessToken,
      }
    );

  const { data: recentlyPlayed, isLoading: recentlyPlayedLoading } =
    useGetRecentlyPlayedQuery(undefined, {
      skip: !auth.authenticated || !auth.accessToken,
    });

  const { data: currentlyPlaying } = useGetCurrentlyPlayingQuery(undefined, {
    skip: !auth.authenticated || !auth.accessToken,
  });

  const { data: savedAlbums, isLoading: savedAlbumsLoading } =
    useGetSavedAlbumsQuery(
      { limit: 8 },
      {
        skip: !auth.authenticated || !auth.accessToken,
      }
    );

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

  const renderTrackGrid = (
    tracks: Track[],
    title: string,
    loading: boolean
  ) => (
    <Box>
      <Title order={3} mb="md">
        {title}
      </Title>
      {loading ? (
        renderSkeletonGrid(8)
      ) : (
        <Grid gutter="md">
          {tracks?.slice(0, 8).map((track, index) => (
            <Grid.Col
              key={`${track.id}-${index}`}
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            >
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
                      {track.artists?.map((artist) => artist.name).join(', ')}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderArtistGrid = (
    artists: Artist[],
    title: string,
    loading: boolean
  ) => (
    <Box>
      <Title order={3} mb="md">
        {title}
      </Title>
      {loading ? (
        renderSkeletonGrid(8)
      ) : (
        <Grid gutter="md">
          {artists?.slice(0, 8).map((artist) => (
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
      )}
    </Box>
  );

  const renderAlbumGrid = (
    albums: Album[],
    title: string,
    loading: boolean
  ) => (
    <Box>
      <Title order={3} mb="md">
        {title}
      </Title>
      {loading ? (
        renderSkeletonGrid(8)
      ) : (
        <Grid gutter="md">
          {albums?.slice(0, 8).map((album) => (
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
                      {album.artists?.map((artist) => artist.name).join(', ')}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🎵 Discover Music
            </Title>
            <Text c="dimmed" size="sm">
              Explore your music library and discover new tracks
            </Text>
          </Box>

          <ScrollArea h="100%" type="auto" offsetScrollbars>
            <Stack gap="xl">
              {/* Currently Playing */}
              {currentlyPlaying?.item && (
                <Card withBorder p="md">
                  <Stack gap="md">
                    <Title order={3}>Currently Playing</Title>
                    <Group gap="md">
                      <Image
                        src={currentlyPlaying.item.album?.images?.[0]?.url}
                        height={80}
                        width={80}
                        fit="cover"
                        radius="sm"
                        fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
                        alt={`Album cover for ${currentlyPlaying.item.name}`}
                      />
                      <Stack gap={4}>
                        <Text fw={500}>{currentlyPlaying.item.name}</Text>
                        <Text size="sm" c="dimmed">
                          {currentlyPlaying.item.artists
                            ?.map((artist: { name: string }) => artist.name)
                            .join(', ')}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {currentlyPlaying.item.album?.name}
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Card>
              )}

              {/* Top Tracks */}
              {renderTrackGrid(
                topTracks?.items || [],
                'Your Top Tracks',
                topTracksLoading
              )}

              {/* Top Artists */}
              {renderArtistGrid(
                topArtists?.items || [],
                'Your Top Artists',
                topArtistsLoading
              )}

              {/* Recently Played */}
              {renderTrackGrid(
                recentlyPlayed?.items?.map(
                  (item: { track: Track }) => item.track
                ) || [],
                'Recently Played',
                recentlyPlayedLoading
              )}

              {/* New Releases */}
              {renderAlbumGrid(
                newReleases?.items || [],
                'New Releases',
                newReleasesLoading
              )}

              {/* Saved Albums */}
              {renderAlbumGrid(
                savedAlbums?.items?.map(
                  (item: { album: Album }) => item.album
                ) || [],
                'Your Saved Albums',
                savedAlbumsLoading
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Box>
    </Layout>
  );
}
