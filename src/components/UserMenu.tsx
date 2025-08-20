'use client';

import { Avatar, Button, Group, Menu, Modal, Text } from '@mantine/core';
import { LogOut, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { logout } from '@/lib/features/auth/auth-slice';
import { useGetCurrentUserProfileQuery } from '@/lib/features/spotify/spotify-api';

export function UserMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const auth = useAppSelector((state) => state.auth);
  const { data: userProfile } = useGetCurrentUserProfileQuery(undefined, {
    skip: !auth.authenticated || !auth.accessToken,
  });

  // Get the first (largest) profile image, or fallback to null
  const profileImageUrl = userProfile?.images?.[0]?.url || null;

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API fails
    } finally {
      // Always clear client-side state and redirect
      dispatch(logout());
      setShowLogoutModal(false);
      router.push('/login');
    }
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Avatar radius="xl" src={profileImageUrl} size="md">
            <User size={16} />
          </Avatar>
        </Menu.Target>

        <Menu.Dropdown>
          {userProfile && (
            <Menu.Item disabled>
              <Text size="sm" fw={500}>
                {userProfile.display_name}
              </Text>
              {userProfile.email && (
                <Text size="xs" c="dimmed">
                  {userProfile.email}
                </Text>
              )}
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item
            leftSection={<Settings size={16} />}
            onClick={() => router.push('/settings')}
          >
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            leftSection={<LogOut size={16} />}
            onClick={openLogoutModal}
            color="red"
          >
            Log out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        centered
      >
        <Text mb="lg">
          Are you sure you want to log out? You'll need to sign in again to
          access your Spotify account.
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleLogout}
            leftSection={<LogOut size={16} />}
          >
            Log out
          </Button>
        </Group>
      </Modal>
    </>
  );
}
