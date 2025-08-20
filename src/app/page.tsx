'use client';

import { useState } from 'react';

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = 'force-dynamic';

import {
  Avatar,
  Badge,
  Box,
  Card,
  Container,
  Grid,
  Group,
  Image,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Clock, Music, Play, User } from 'lucide-react';

import { Layout } from '@/components/Layout';
import {
  useGetRecentlyPlayedQuery,
  useGetTopArtistsQuery,
  useGetTopTracksQuery,
} from '@/lib/features/spotify/spotify-api';
import { TimeRange } from '@/lib/types';

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.MediumTerm);

  const { data: topArtists, isLoading: artistsLoading } = useGetTopArtistsQuery(
    {
      timeRange,
    }
  );
  const { data: topTracks, isLoading: tracksLoading } = useGetTopTracksQuery({
    timeRange,
  });
  const { data: recentlyPlayed, isLoading: recentLoading } =
    useGetRecentlyPlayedQuery();

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case TimeRange.ShortTerm:
        return 'Last 4 weeks';
      case TimeRange.MediumTerm:
        return 'Last 6 months';
      case TimeRange.LongTerm:
        return 'Last year';
      default:
        return 'Last 6 months';
    }
  };

  return (
    <Layout>
      <Container size="xl" py="md">
        <Stack gap="xl">
          {/* Header */}
          <Box>
            <Title order={1} mb="xs">
              🎵 Your Music Dashboard
            </Title>
            <Text c="dimmed" size="sm">
              Discover your listening patterns and favorite music
            </Text>
          </Box>

          {/* Time Range Filter */}
          <Card withBorder p="md">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Clock size={20} />
                  <Text fw={500}>Time Period</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {getTimeRangeLabel(timeRange)}
                </Text>
              </Group>
              <SegmentedControl
                value={timeRange}
                onChange={(value) => setTimeRange(value as TimeRange)}
                data={[
                  { label: '4 Weeks', value: TimeRange.ShortTerm },
                  { label: '6 Months', value: TimeRange.MediumTerm },
                  { label: '1 Year', value: TimeRange.LongTerm },
                ]}
                fullWidth
                disabled={artistsLoading || tracksLoading}
              />
            </Stack>
          </Card>

          <Grid gutter="md">
            {/* Recently Played Tracks */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder h="100%">
                <Stack gap="md">
                  <Group gap="xs">
                    <Play size={20} />
                    <Title order={3}>Recently Played</Title>
                  </Group>

                  <ScrollArea h={400}>
                    <Stack gap="sm">
                      {recentLoading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <Group
                              key={i}
                              gap="sm"
                              p="xs"
                              style={{ borderRadius: 8 }}
                            >
                              <Skeleton height={40} width={40} radius="sm" />
                              <Stack gap={2} style={{ flex: 1 }}>
                                <Skeleton height={16} width="60%" />
                                <Skeleton height={12} width="40%" />
                              </Stack>
                              <Skeleton height={20} width={30} radius="xl" />
                            </Group>
                          ))
                        : recentlyPlayed?.items
                            ?.slice(0, 10)
                            .map((item, index) => (
                              <Group
                                key={`${item.track?.id}-${item.played_at}-${index}`}
                                gap="sm"
                                p="xs"
                                style={{ borderRadius: 8 }}
                              >
                                <Avatar
                                  src={item.track?.album?.images?.[0]?.url}
                                  size="md"
                                  radius="sm"
                                />
                                <Stack gap={2} style={{ flex: 1 }}>
                                  <Text size="sm" fw={500} lineClamp={1}>
                                    {item.track?.name}
                                  </Text>
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    {item.track?.artists
                                      ?.map((artist) => artist.name)
                                      .join(', ')}
                                  </Text>
                                </Stack>
                                <Badge variant="light" size="xs">
                                  #{index + 1}
                                </Badge>
                              </Group>
                            ))}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Top Artists */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder h="100%">
                <Stack gap="md">
                  <Group gap="xs">
                    <User size={20} />
                    <Title order={3}>Top Artists</Title>
                  </Group>

                  <ScrollArea h={400}>
                    <Stack gap="sm">
                      {artistsLoading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <Group
                              key={i}
                              gap="sm"
                              p="xs"
                              style={{ borderRadius: 8 }}
                            >
                              <Skeleton height={50} width={50} radius="xl" />
                              <Stack gap={2} style={{ flex: 1 }}>
                                <Skeleton height={16} width="70%" />
                                <Skeleton height={12} width="40%" />
                              </Stack>
                              <Skeleton height={24} width={35} radius="xl" />
                            </Group>
                          ))
                        : topArtists?.items
                            ?.slice(0, 10)
                            .map((artist, index) => (
                              <Group
                                key={artist.id}
                                gap="sm"
                                p="xs"
                                style={{ borderRadius: 8 }}
                              >
                                <Avatar
                                  src={artist.images?.[0]?.url}
                                  size="lg"
                                  radius="xl"
                                />
                                <Stack gap={2} style={{ flex: 1 }}>
                                  <Text size="sm" fw={500}>
                                    {artist.name}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    #{index + 1} Artist
                                  </Text>
                                </Stack>
                                <Badge variant="light" size="sm">
                                  #{index + 1}
                                </Badge>
                              </Group>
                            ))}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Top Tracks */}
            <Grid.Col span={12}>
              <Card withBorder>
                <Stack gap="md">
                  <Group gap="xs">
                    <Music size={20} />
                    <Title order={3}>Top Tracks</Title>
                  </Group>

                  <Grid gutter="md">
                    {tracksLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                            <Card withBorder p="sm">
                              <Stack gap="xs">
                                <Skeleton
                                  height={100}
                                  width="100%"
                                  radius="sm"
                                />
                                <Stack gap={2}>
                                  <Skeleton height={16} width="80%" />
                                  <Skeleton height={12} width="60%" />
                                  <Group justify="space-between" align="center">
                                    <Skeleton height={12} width={40} />
                                    <Skeleton
                                      height={16}
                                      width={25}
                                      radius="xl"
                                    />
                                  </Group>
                                </Stack>
                              </Stack>
                            </Card>
                          </Grid.Col>
                        ))
                      : topTracks?.items?.slice(0, 6).map((track, index) => (
                          <Grid.Col
                            key={track.id}
                            span={{ base: 12, sm: 6, md: 4 }}
                          >
                            <Card withBorder p="sm">
                              <Stack gap="xs">
                                <Image
                                  src={track.album?.images?.[0]?.url}
                                  height={100}
                                  width="100%"
                                  fit="cover"
                                  radius="sm"
                                  fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
                                />
                                <Stack gap={2}>
                                  <Text size="sm" fw={500} lineClamp={1}>
                                    {track.name}
                                  </Text>
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    {track.artists
                                      ?.map((artist) => artist.name)
                                      .join(', ')}
                                  </Text>
                                  <Group justify="space-between" align="center">
                                    <Text size="xs" c="dimmed">
                                      {formatDuration(track.duration_ms)}
                                    </Text>
                                    <Badge variant="light" size="xs">
                                      #{index + 1}
                                    </Badge>
                                  </Group>
                                </Stack>
                              </Stack>
                            </Card>
                          </Grid.Col>
                        ))}
                  </Grid>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Layout>
  );
}
