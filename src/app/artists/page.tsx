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
import { useGetSavedArtistsQuery } from '@/lib/features/spotify/spotify-api';

const ITEMS_PER_PAGE = 50;

export default function ArtistsPage() {
  const [page, setPage] = useState(1);
  const auth = useAppSelector((state) => state.auth);

  const {
    data: savedArtistsResponse,
    isLoading,
    error,
  } = useGetSavedArtistsQuery(
    {
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  if (isLoading) {
    return (
      <Layout>
        <Box p="xl">
          <Title order={1} mb="lg">
            Your Artists
          </Title>
          <Stack gap="md">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} p="md">
                <Group>
                  <Skeleton height={80} width={80} radius="50%" />
                  <Box style={{ flex: 1 }}>
                    <Skeleton height={24} width="50%" mb={8} />
                    <Skeleton height={16} width="30%" />
                  </Box>
                  <Skeleton height={32} width={32} radius="50%" />
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
            Your Artists
          </Title>
          <Text c="red">
            Failed to load followed artists. Please try again.
          </Text>
        </Box>
      </Layout>
    );
  }

  const savedArtists = savedArtistsResponse?.items || [];
  const totalPages = Math.ceil(
    (savedArtistsResponse?.total || 0) / ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🎤 Your Artists
            </Title>
            <Text c="dimmed" size="sm">
              {savedArtistsResponse?.total || 0} followed artists
            </Text>
          </Box>

          {savedArtists.length === 0 ? (
            <Text c="dimmed">No followed artists found.</Text>
          ) : (
            <Stack gap="md">
              {savedArtists.map((artist) => (
                <Card key={artist.id} p="md" withBorder>
                  <Group>
                    <Image
                      src={artist.images?.[0]?.url}
                      width={80}
                      height={80}
                      radius="50%"
                      fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎤"
                      alt={`Artist photo for ${artist.name}`}
                    />
                    <Box style={{ flex: 1 }}>
                      <Text size="lg" fw={500}>
                        {artist.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Artist
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
              ))}
            </Stack>
          )}

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
