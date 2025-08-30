'use client';

import {
  ActionIcon,
  Box,
  Card,
  Grid,
  Image,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Play } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import {
  useGetBrowseCategoriesQuery,
  useGetNewReleasesQuery,
} from '@/lib/features/spotify/spotify-api';

export default function BrowsePage() {
  const auth = useAppSelector((state) => state.auth);

  const {
    data: newReleases,
    isLoading: releasesLoading,
    error: releasesError,
  } = useGetNewReleasesQuery(
    { limit: 12 },
    {
      skip: !auth.authenticated || !auth.accessToken,
    }
  );

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetBrowseCategoriesQuery(undefined, {
    skip: !auth.authenticated || !auth.accessToken,
  });

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

  return (
    <Layout>
      <Box p="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="xs">
              🎵 Browse Music
            </Title>
            <Text c="dimmed" size="sm">
              Explore new releases and music categories
            </Text>
          </Box>

          {/* Browse Categories */}
          <Box>
            <Title order={3} mb="md">
              Browse Categories
            </Title>
            {categoriesLoading ? (
              renderSkeletonGrid(8)
            ) : categoriesError ? (
              <Text c="red">Failed to load categories.</Text>
            ) : (
              <Grid gutter="md">
                {categories?.categories?.items?.slice(0, 8).map((category) => (
                  <Grid.Col
                    key={category.id}
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                  >
                    <Card withBorder p="sm">
                      <Stack gap="xs">
                        <Image
                          alt={category.name}
                          height={120}
                          radius="sm"
                          src={category.icons[0]?.url}
                          width="100%"
                          fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
                        />
                        <Stack gap={2}>
                          <Text fw={500} lineClamp={1} size="sm">
                            {category.name}
                          </Text>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Box>

          {/* New Releases */}
          <Box>
            <Title order={3} mb="md">
              New Releases
            </Title>
            {releasesLoading ? (
              renderSkeletonGrid(12)
            ) : releasesError ? (
              <Text c="red">Failed to load new releases.</Text>
            ) : (
              <Grid gutter="md">
                {newReleases?.items?.slice(0, 12).map((album) => (
                  <Grid.Col
                    key={album.id}
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                  >
                    <Card withBorder p="sm">
                      <Stack gap="xs">
                        <Box pos="relative">
                          <Image
                            src={album.images?.[0]?.url}
                            height={120}
                            width="100%"
                            fit="cover"
                            radius="sm"
                            fallbackSrc="https://placehold.co/300x300/1db954/ffffff?text=🎵"
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
                            {album.artists
                              ?.map((artist) => artist.name)
                              .join(', ')}
                          </Text>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      </Box>
    </Layout>
  );
}
