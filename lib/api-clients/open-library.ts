// lib/api-clients/open-library.ts
import { UnifiedMediaItem } from '@/core/types/media';

const BASE_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org/b/id';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
  ratings_average?: number;
  ratings_count?: number;
  language?: string[];
  subject?: string[];
}

interface OpenLibraryResponse {
  num_found: number;
  docs: OpenLibraryDoc[];
}

export const openLibraryClient = {
  searchBooks: async (query: string): Promise<UnifiedMediaItem[]> => {
    try {
      const params = new URLSearchParams({
        q: query,
        lang: 'pl',
        limit: '20',
        fields:
          'key,title,author_name,cover_i,first_publish_year,number_of_pages_median,ratings_average,ratings_count,language,subject',
      });

      const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'MediaLibraryApp/1.0 (bartekr1221@gmail.com)',
        },
      });

      if (!response.ok) {
        throw new Error(`Open Library Error: ${response.statusText}`);
      }

      const data: OpenLibraryResponse = await response.json();

      return data.docs.map((doc) => {
        const cleanId = doc.key.replace('/works/', '');

        const coverUrl = doc.cover_i ? `${COVERS_URL}/${doc.cover_i}-L.jpg` : null;

        const rating = doc.ratings_average ? doc.ratings_average.toFixed(1) : undefined;

        const categories = doc.subject ? doc.subject.slice(0, 5) : [];

        const isPolish = doc.language?.includes('pol');

        return {
          externalId: cleanId,
          type: 'BOOK',
          title: doc.title,
          coverUrl: coverUrl,
          releaseDate: doc.first_publish_year?.toString(),
          metadata: {
            author: doc.author_name?.join(', ') || 'Nieznany autor',
            pageCount: doc.number_of_pages_median,
            categories: categories,
            openLibraryRating: rating,
            ratingsCount: doc.ratings_count,
            language: isPolish ? 'pl' : doc.language?.[0],
          },
          popularityScore: doc.ratings_count ? Math.min(doc.ratings_count, 100) : 0,
          tags: ['Książka', ...categories],
        };
      });
    } catch (error) {
      console.error('Błąd w openLibraryClient:', error);
      return [];
    }
  },
};
