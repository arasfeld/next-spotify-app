export * from './album';
export * from './artist';
export * from './image';
export * from './playlist';
export * from './time-range';
export * from './tokens';
export * from './track';
export * from './user';

// Spotify API response types
export interface SpotifyApiResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

export interface RecentlyPlayedItem {
  track: {
    id: string;
    name: string;
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
  };
  played_at: string;
}
