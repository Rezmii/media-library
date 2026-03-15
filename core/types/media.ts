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
  isFavorite?: boolean;
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

  // Filmy i Seriale (TMDB)
  cast?: { id: number; name: string; character: string; photoUrl: string | null }[];
  director?: string;
  directorId?: number;
  runtime?: number;

  // Tylko Seriale
  seasons?: {
    name: string;
    episodeCount: number;
    airDate: string;
    posterUrl: string | null;
    seasonNumber: number;
  }[];
  status?: string;
  description?: string;
}
