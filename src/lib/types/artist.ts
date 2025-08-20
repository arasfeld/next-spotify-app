import type { Image } from './image';

export interface Artist {
  id: string;
  images: Image[];
  name: string;
}
