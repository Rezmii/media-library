// lib/api-clients/rawg.ts
import { UnifiedMediaItem } from '@/core/types/media';

const API_KEY = process.env.RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  released: string;
  parent_platforms: { platform: { name: string } }[];
  rating: number;
  added: number;
  metacritic: number | null;
  playtime: number;
  genres: { name: string }[];
}

interface RawgSearchResponse {
  results: RawgGame[];
}

interface RawgAddition {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  metacritic: number | null;
}

export interface UnifiedAddition {
  externalId: string;
  title: string;
  coverUrl: string | null;
  releaseDate?: string;
  rating?: number;
  metacritic?: number | null;
}

export const rawgClient = {
  searchGames: async (query: string): Promise<UnifiedMediaItem[]> => {
    if (!API_KEY) throw new Error('Brak RAWG_API_KEY w .env');

    try {
      const response = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=40`
      );

      if (!response.ok) {
        throw new Error(`RAWG Error: ${response.statusText}`);
      }

      const data: RawgSearchResponse = await response.json();

      return data.results

        .filter((game) => game.rating > 0)
        .slice(0, 15)
        .map((game) => ({
          externalId: game.id.toString(),
          type: 'GAME',
          title: game.name,
          coverUrl: game.background_image,
          releaseDate: game.released ? game.released.split('-')[0] : undefined,
          metadata: {
            platforms: game.parent_platforms?.map((p) => p.platform.name) || [],
            rawgRating: game.rating.toFixed(2),
            metacritic: game.metacritic,
            playtime: game.playtime,
            categories: game.genres?.map((g) => g.name),
          },
          popularityScore: Math.min(game.added / 100, 100),
          tags: game.genres?.map((g) => g.name) || [],
        }));
    } catch (error) {
      console.error('Błąd w rawgClient:', error);
      return [];
    }
  },

  // Pobiera DLC, edycje GOTY, expansiony i inne dodatki dla danej gry.
  // RAWG endpoint: /games/{id}/additions
  getAdditions: async (gameId: string): Promise<UnifiedAddition[]> => {
    if (!API_KEY) return [];

    try {
      const response = await fetch(
        `${BASE_URL}/games/${gameId}/additions?key=${API_KEY}&page_size=20`
      );

      if (!response.ok) return [];

      const data: { results: RawgAddition[] } = await response.json();

      return (data.results || []).map((addition) => ({
        externalId: addition.id.toString(),
        title: addition.name,
        coverUrl: addition.background_image,
        releaseDate: addition.released?.split('-')[0],
        rating: addition.rating,
        metacritic: addition.metacritic,
      }));
    } catch (error) {
      console.error('Błąd RAWG additions:', error);
      return [];
    }
  },
};
