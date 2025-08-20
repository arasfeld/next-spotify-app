'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { type PropsWithChildren } from 'react';

import { Header } from './Header';
import { Navbar } from './Navbar';

export function Layout({ children }: PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header px={12}>
        <Header onToggle={toggle} opened={opened} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
