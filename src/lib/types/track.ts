import type { Album } from './album';
import type { Artist } from './artist';

export interface RecentlyPlayedItem {
  played_at: string;
  track: Track;
}

export interface Track {
  album: Album;
  artists: Artist[];
  duration_ms: number;
  id: string;
  name: string;
  uri: string;
}
