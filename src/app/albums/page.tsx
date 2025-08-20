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
import { useGetSavedAlbumsQuery } from '@/lib/features/spotify/spotify-api';

interface SavedAlbumItem {
  album: {
    id: string;
    name: string;
    images?: Array<{ url: string }>;
    artists: Array<{ name: string }>;
  };
  added_at: string;
}

const ITEMS_PER_PAGE = 50;

export default function AlbumsPage() {
  const [page, setPage] = useState(1);
  const auth = useAppSelector((state) => state.auth as any);

  const {
    data: savedAlbumsResponse,
    isLoading,
    error,
  } = useGetSavedAlbumsQuery(
    {
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  const formatArtistNames = (artists: Array<{ name: string }>) => {
    return artists.map((artist) => artist.name).join(', ');
  };

  if (isLoading) {
    return (
      <Layout>
        <Box p="xl">
          <Title order={1} mb="lg">
            Your Albums
          </Title>
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

  const savedAlbums = savedAlbumsResponse?.items || [];
  const totalPages = Math.ceil(
    (savedAlbumsResponse?.total || 0) / ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              💿 Your Albums
            </Title>
            <Text c="dimmed" size="sm">
              {savedAlbumsResponse?.total || 0} saved albums
            </Text>
          </Box>

          {savedAlbums.length === 0 ? (
            <Text c="dimmed">No saved albums found.</Text>
          ) : (
            <Stack gap="md">
              {savedAlbums.map((item: SavedAlbumItem) => (
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
