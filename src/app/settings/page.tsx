'use client';

import {
  ActionIcon,
  Badge,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { Layout } from '@/components/Layout';
import { useGetCurrentUserProfileQuery } from '@/lib/features/spotify/spotify-api';
import {
  MANTINE_COLORS,
  setPrimaryColor,
  setThemeMode,
} from '@/lib/features/theme/theme-slice';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const { data: userProfile } = useGetCurrentUserProfileQuery(undefined, {
    skip: !auth.authenticated || !auth.accessToken,
  });

  // Settings state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [quality, setQuality] = useState('high');

  const handleThemeChange = (value: string | null) => {
    const newTheme = (value as 'light' | 'dark' | 'system') || 'system';
    dispatch(setThemeMode(newTheme));
  };

  const handlePrimaryColorChange = (color: string) => {
    if (MANTINE_COLORS.includes(color as (typeof MANTINE_COLORS)[number])) {
      dispatch(setPrimaryColor(color as (typeof MANTINE_COLORS)[number]));
    }
  };

  return (
    <Layout>
      <Container size="md" py="xl" style={{ minHeight: '100%' }}>
        <Stack gap="xl">
          {/* Header */}
          <div>
            <Title order={1} mb="xs">
              ⚙️ Settings
            </Title>
            <Text c="dimmed">
              Manage your app preferences and account settings
            </Text>
          </div>

          {/* Account Information */}
          <Paper p="lg" withBorder>
            <Title order={3} mb="md">
              Account
            </Title>
            <Stack gap="md">
              {userProfile && (
                <Group>
                  <Text fw={500}>Spotify Account:</Text>
                  <Text>{userProfile.display_name}</Text>
                  <Badge color="green" variant="light">
                    Connected
                  </Badge>
                </Group>
              )}
              {userProfile?.email && (
                <Group>
                  <Text fw={500}>Email:</Text>
                  <Text>{userProfile.email}</Text>
                </Group>
              )}
              <Group>
                <Text fw={500}>Account ID:</Text>
                <Text>{userProfile?.id || 'Loading...'}</Text>
              </Group>
            </Stack>
          </Paper>

          {/* App Settings */}
          <Paper p="lg" withBorder>
            <Title order={3} mb="md">
              App Settings
            </Title>
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Theme</Text>
                  <Text size="sm" c="dimmed">
                    Choose your preferred theme
                  </Text>
                </div>
                <Select
                  value={themeMode}
                  onChange={handleThemeChange}
                  data={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                  style={{ minWidth: 120 }}
                />
              </Group>

              <div>
                <Text fw={500} mb="xs">
                  Primary Color
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                  Choose your preferred primary color
                </Text>
                <Group gap="xs">
                  {MANTINE_COLORS.map((color) => (
                    <ActionIcon
                      key={color}
                      variant={primaryColor === color ? 'filled' : 'outline'}
                      color={color}
                      size="lg"
                      radius="xl"
                      onClick={() => handlePrimaryColorChange(color)}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    />
                  ))}
                </Group>
              </div>

              <Group justify="space-between">
                <div>
                  <Text fw={500}>Auto Refresh</Text>
                  <Text size="sm" c="dimmed">
                    Automatically refresh data
                  </Text>
                </div>
                <Switch
                  checked={autoRefresh}
                  onChange={(event) =>
                    setAutoRefresh(event.currentTarget.checked)
                  }
                />
              </Group>

              <Group justify="space-between">
                <div>
                  <Text fw={500}>Notifications</Text>
                  <Text size="sm" c="dimmed">
                    Enable push notifications
                  </Text>
                </div>
                <Switch
                  checked={notifications}
                  onChange={(event) =>
                    setNotifications(event.currentTarget.checked)
                  }
                />
              </Group>

              <Group justify="space-between">
                <div>
                  <Text fw={500}>Audio Quality</Text>
                  <Text size="sm" c="dimmed">
                    Choose streaming quality
                  </Text>
                </div>
                <Select
                  value={quality}
                  onChange={(value) => setQuality(value || 'high')}
                  data={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  style={{ minWidth: 120 }}
                />
              </Group>
            </Stack>
          </Paper>

          {/* About */}
          <Paper p="lg" withBorder>
            <Title order={3} mb="md">
              About
            </Title>
            <Stack gap="md">
              <Group>
                <Text fw={500}>Version:</Text>
                <Text>1.0.0</Text>
              </Group>
              <Group>
                <Text fw={500}>Built with:</Text>
                <Text>Next.js, Mantine, Redux Toolkit</Text>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Layout>
  );
}
