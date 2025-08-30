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
