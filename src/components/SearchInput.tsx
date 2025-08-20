'use client';

import { TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchInput() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ flex: 1 }}>
      <TextInput
        placeholder="Search for songs, artists, albums..."
        leftSection={<Search size={16} />}
        size="sm"
        radius="xl"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ flex: 1 }}
      />
    </form>
  );
}
