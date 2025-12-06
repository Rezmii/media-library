// lib/api-clients/tmdb.ts
import { UnifiedMediaItem } from '@/core/types/media';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TmdbResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
}

interface TmdbSearchResponse {
  results: TmdbResult[];
}

export const tmdbClient = {
  searchMoviesAndSeries: async (query: string): Promise<UnifiedMediaItem[]> => {
    if (!API_KEY) throw new Error('Brak TMDB_API_KEY w .env');

    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
      );

      if (!response.ok) {
        throw new Error(`TMDB Error: ${response.statusText}`);
      }

      const data: TmdbSearchResponse = await response.json();

      return data.results
        .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => {
          const isMovie = item.media_type === 'movie';

          return {
            externalId: item.id.toString(),
            type: isMovie ? 'MOVIE' : 'SERIES',
            title: isMovie ? item.title! : item.name!,
            coverUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
            releaseDate: (isMovie ? item.release_date : item.first_air_date)?.split('-')[0],
            metadata: {
              overview: item.overview,
              originalType: item.media_type,
            },
          };
        });
    } catch (error) {
      console.error('Błąd w tmdbClient:', error);
      return [];
    }
  },
};
