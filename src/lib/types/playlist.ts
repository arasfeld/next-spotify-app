import type { Image } from './image';
import type { User } from './user';

export interface SpotifyPlaylist {
  collaborative: boolean;
  description: string | null;
  id: string;
  images: Image[];
  name: string;
  owner: User;
  public: boolean;
  tracks: {
    total: number;
  };
}

export interface PlaylistsResponse {
  items: SpotifyPlaylist[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}
