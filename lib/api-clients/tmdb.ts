// lib/api-clients/tmdb.ts
import { UnifiedMediaItem } from '@/core/types/media';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  known_for_department: string;
}

interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
}

interface TmdbSeason {
  name: string;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  season_number: number;
}

interface TmdbImage {
  file_path: string;
}

interface TmdbDetailsResponse {
  genres: { name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  credits: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
  seasons?: TmdbSeason[];
  status?: string;
  images?: {
    backdrops: TmdbImage[];
  };
}

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
      // TMDB z language=pl-PL filtruje wyniki tylko do pozycji z polskim tlumaczeniem,
      // przez co znikaja klasyczne anime (Naruto 2002, Pokemon 1997, Dragon Ball Z 1989
      // itd.). Wykonujemy 2 zapytania rownolegle: en-US ma wszystko (baza), pl-PL
      // nadpisuje pojedyncze itemy polskimi tytulami tam gdzie istnieja
      // (np. "Pokemon: Detektyw Pikachu").
      const buildUrl = (lang: string) =>
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=${lang}`;

      const [enRes, plRes] = await Promise.all([fetch(buildUrl('en-US')), fetch(buildUrl('pl-PL'))]);

      if (!enRes.ok && !plRes.ok) {
        throw new Error(`TMDB Error: ${enRes.statusText}`);
      }

      const enData: TmdbSearchResponse = enRes.ok ? await enRes.json() : { results: [] };
      const plData: TmdbSearchResponse = plRes.ok ? await plRes.json() : { results: [] };

      // Merge po id: EN jako baza, PL nadpisuje (zachowuje polskie tytuly)
      const merged = new Map<number, TmdbResult>();
      enData.results.forEach((item) => merged.set(item.id, item));
      plData.results.forEach((item) => merged.set(item.id, item));

      const allCandidates: TmdbResult[] = [];

      Array.from(merged.values()).forEach((item) => {
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
  getDetails: async (externalId: string, type: 'MOVIE' | 'SERIES') => {
    if (!API_KEY) return null;

    try {
      const endpoint = type === 'MOVIE' ? 'movie' : 'tv';

      // include_image_language=en,null - bez tego TMDB filtruje obrazki po language=pl-PL
      // i zwraca pusto dla wiekszosci tytulow. "null" = backdropy bez tekstu (najlepsze).
      const url = `${BASE_URL}/${endpoint}/${externalId}?api_key=${API_KEY}&language=pl-PL&append_to_response=credits,images&include_image_language=en,null`;

      const res = await fetch(url);
      if (!res.ok) return null;

      const data: TmdbDetailsResponse = await res.json();

      const genres = data.genres.map((g) => g.name);

      const cast = data.credits.cast.slice(0, 10).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        photoUrl: actor.profile_path ? `${IMAGE_BASE_URL}${actor.profile_path}` : null,
      }));

      let director: string | undefined = undefined;
      let directorId: number | undefined = undefined;
      if (type === 'MOVIE') {
        const directorObj = data.credits.crew.find((c) => c.job === 'Director');
        if (directorObj) {
          director = directorObj.name;
          directorId = directorObj.id;
        }
      }

      const runtime =
        data.runtime ||
        (data.episode_run_time && data.episode_run_time.length > 0 ? data.episode_run_time[0] : 0);

      const seasons = data.seasons
        ?.filter((s) => s.season_number > 0)
        .map((s) => ({
          name: s.name,
          episodeCount: s.episode_count,
          airDate: s.air_date?.split('-')[0] || '?',
          posterUrl: s.poster_path ? `${IMAGE_BASE_URL}${s.poster_path}` : null,
          seasonNumber: s.season_number,
        }));

      const screenshots = (data.images?.backdrops || [])
        .slice(0, 4)
        .map((b) => `${BACKDROP_BASE_URL}${b.file_path}`);

      return {
        genres,
        cast,
        director,
        directorId,
        runtime,
        seasons,
        status: data.status,
        screenshots,
      };
    } catch (error) {
      console.error('Błąd TMDB getDetails:', error);
      return null;
    }
  },
};
