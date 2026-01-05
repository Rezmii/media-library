// lib/api-clients/tmdb.ts
import { UnifiedMediaItem } from '@/core/types/media';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

interface TmdbResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  vote_count: number;
  vote_average: number;
  popularity: number;
  known_for?: TmdbResult[];
}

interface TmdbSearchResponse {
  results: TmdbResult[];
}

export const tmdbClient = {
  searchMoviesAndSeries: async (query: string): Promise<UnifiedMediaItem[]> => {
    if (!API_KEY) throw new Error('Brak TMDB_API_KEY w .env');

    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=pl-PL`
      );

      if (!response.ok) {
        throw new Error(`TMDB Error: ${response.statusText}`);
      }

      const data: TmdbSearchResponse = await response.json();

      const allCandidates: TmdbResult[] = [];

      data.results.forEach((item) => {
        if (item.media_type === 'person' && item.known_for) {
          allCandidates.push(...item.known_for);
        } else if (item.media_type === 'movie' || item.media_type === 'tv') {
          allCandidates.push(item as unknown as TmdbResult);
        }
      });

      const uniqueResults = new Map<number, TmdbResult>();

      allCandidates.forEach((item) => {
        if (!uniqueResults.has(item.id)) {
          uniqueResults.set(item.id, item);
        }
      });

      const processedResults = Array.from(uniqueResults.values());

      return processedResults
        .filter((item) => {
          const isPopularEnough =
            (item.vote_count && item.vote_count > 2) || (item.popularity && item.popularity > 1);
          const hasPoster = !!item.poster_path;

          return isPopularEnough && hasPoster;
        })
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20)
        .map((item) => {
          const isMovie = item.media_type === 'movie';
          const title = isMovie ? item.title! : item.name!;

          return {
            externalId: item.id.toString(),
            type: isMovie ? 'MOVIE' : 'SERIES',
            title: title,
            coverUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
            releaseDate: (isMovie ? item.release_date : item.first_air_date)?.split('-')[0],
            metadata: {
              overview: item.overview,
              originalType: item.media_type,
              originalTitle: isMovie ? item.original_title : item.original_name,
              tmdbRating: item.vote_average.toFixed(1),
              backdropUrl: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : null,
              voteCount: item.vote_count,
            },
            popularityScore: Math.min(item.popularity, 100),
            tags: [isMovie ? 'Film' : 'Serial', item.original_title || '', title],
          };
        });
    } catch (error) {
      console.error('Błąd w tmdbClient:', error);
      return [];
    }
  },
};
