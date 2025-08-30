'use client';

import {
  ActionIcon,
  Box,
  Card,
  Group,
  Image,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import { useGetSavedTracksQuery } from '@/lib/features/spotify/spotify-api';

const ITEMS_PER_PAGE = 50;

export default function SongsPage() {
  const [page, setPage] = useState(1);
  const auth = useAppSelector((state) => state.auth);

  const {
    data: savedTracksResponse,
    isLoading,
    error,
  } = useGetSavedTracksQuery(
    {
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatArtistNames = (artists: Array<{ name: string }>) => {
    return artists.map((artist) => artist.name).join(', ');
  };

  if (isLoading) {
    return (
      <Layout>
        <Box p="xl">
          <Title order={1} mb="lg">
            Your Songs
          </Title>
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

  const savedTracks = savedTracksResponse?.items || [];
  const totalPages = Math.ceil(
    (savedTracksResponse?.total || 0) / ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🎵 Your Songs
            </Title>
            <Text c="dimmed" size="sm">
              {savedTracksResponse?.total || 0} saved tracks
            </Text>
          </Box>

          <Stack gap="md">
            {savedTracks.map((item) => (
              <Card key={item.track.id} p="md">
                <Group>
                  <Image
                    src={item.track.album?.images?.[0]?.url}
                    width={60}
                    height={60}
                    radius="sm"
                    fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
                    alt={`Album cover for ${item.track.name}`}
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
            ))}
          </Stack>

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
