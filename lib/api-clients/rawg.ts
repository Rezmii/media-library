// lib/api-clients/rawg.ts
import { UnifiedMediaItem } from '@/core/types/media';

const API_KEY = process.env.RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  released: string;
  platforms: { platform: { name: string } }[];
  rating: number;
}

interface RawgSearchResponse {
  results: RawgGame[];
}

export const rawgClient = {
  searchGames: async (query: string): Promise<UnifiedMediaItem[]> => {
    if (!API_KEY) throw new Error('Brak RAWG_API_KEY w .env');

    try {
      const response = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=10`
      );

      if (!response.ok) {
        throw new Error(`RAWG Error: ${response.statusText}`);
      }

      const data: RawgSearchResponse = await response.json();

      return data.results.map((game) => ({
        externalId: game.id.toString(),
        type: 'GAME',
        title: game.name,
        coverUrl: game.background_image,
        releaseDate: game.released ? game.released.split('-')[0] : undefined,
        metadata: {
          platforms: game.platforms?.map((p) => p.platform.name) || [],
          rawgRating: game.rating,
        },
      }));
    } catch (error) {
      console.error('Błąd w rawgClient:', error);
      return [];
    }
  },
};
