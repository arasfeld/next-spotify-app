import type { Image } from './image';

export interface User {
  display_name: string;
  email: string;
  id: string;
  images: Image[];
}
