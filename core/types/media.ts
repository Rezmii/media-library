import { MediaType, Status } from '@prisma/client';

export interface UnifiedMediaItem {
  externalId: string;
  title: string;
  coverUrl: string | null;
  type: MediaType;
  releaseDate?: string;
  addedAt?: string;
  completedAt?: string | null;
  activityTs?: number;
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

  // Tylko Gry — DLC, edycje GOTY, expansiony (z RAWG additions)
  additions?: {
    externalId: string;
    title: string;
    coverUrl: string | null;
    releaseDate?: string;
    rating?: number;
    metacritic?: number | null;
  }[];

  // Tylko Gry — wydawca (z RAWG game details)
  publisher?: string;

  // Filmy / Seriale / Gry — zrzuty ekranu (max 4)
  screenshots?: string[];
}
