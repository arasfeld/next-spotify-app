import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import Image from 'next/image';

export default function Home() {
  return (
    <Stack
      gap="xl"
      align="center"
      justify="center"
      style={{ minHeight: '100vh' }}
    >
      <Stack gap="lg" align="center" ta="center">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <Stack gap="xs" ta="left">
          <Text size="sm">
            Get started by editing{' '}
            <Text
              component="code"
              size="sm"
              fw={600}
              bg="gray.1"
              px="xs"
              py={2}
              style={{ borderRadius: 4 }}
              span
            >
              src/app/page.tsx
            </Text>
            .
          </Text>
          <Text size="sm">Save and see your changes instantly.</Text>
        </Stack>

        <Group gap="md" justify="center" wrap="wrap">
          <Button
            component="a"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={
              <Image
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
              />
            }
            size="md"
          >
            Deploy now
          </Button>

          <Button
            component="a"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="md"
          >
            Read our docs
          </Button>
        </Group>
      </Stack>

      <Group gap="lg" justify="center" wrap="wrap">
        <Anchor
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          size="sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Image src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </Anchor>

        <Anchor
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          size="sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Image src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </Anchor>

        <Anchor
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          size="sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Image src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </Anchor>
      </Group>
    </Stack>
  );
}
