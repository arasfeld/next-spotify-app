import type { Artist } from './artist';
import type { Image } from './image';

export interface Album {
  artists: Artist[];
  id: string;
  images: Image[];
  name: string;
}
