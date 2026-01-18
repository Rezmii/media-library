import { MediaType, Status } from '@prisma/client';

export interface UnifiedMediaItem {
  externalId: string;
  title: string;
  coverUrl: string | null;
  type: MediaType;
  releaseDate?: string;
  addedAt?: string;
  metadata: Record<string, any>;
  isAdded?: boolean;
  popularityScore?: number;

  status?: Status;

  note?: string | null;
  rating?: number | null;

  tags: string[];
}

export interface UnifiedMediaDetails {
  // Wspólne
  genres?: string[];

  // Muzyka
  tracks?: { title: string; duration: number; features: string[] }[];

  // Przyszłościowo dla Filmów/Gier (możesz to rozszerzać)
  cast?: string[];
  director?: string;
  playtime?: number;
  achievements_count?: number;
}
