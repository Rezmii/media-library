// lib/api-clients/google-books.ts
import { UnifiedMediaItem } from '@/core/types/media';

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

interface GoogleBookVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail: string;
    smallThumbnail?: string;
  };
}

interface GoogleBookResult {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBookResult[];
}

export const googleBooksClient = {
  searchBooks: async (query: string): Promise<UnifiedMediaItem[]> => {
    if (!API_KEY) throw new Error('Brak GOOGLE_BOOKS_API_KEY w .env');

    try {
      const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=10&printType=books`
      );

      if (!response.ok) {
        throw new Error(`Google Books Error: ${response.statusText}`);
      }

      const data: GoogleBooksResponse = await response.json();

      if (!data.items) return [];

      return data.items.map((item) => {
        const info = item.volumeInfo;

        const secureCoverUrl = info.imageLinks?.thumbnail
          ? info.imageLinks.thumbnail.replace('http:', 'https:')
          : null;

        return {
          externalId: item.id,
          type: 'BOOK',
          title: info.title,
          coverUrl: secureCoverUrl,
          releaseDate: info.publishedDate?.split('-')[0],
          metadata: {
            author: info.authors?.join(', ') || 'Unknown Author',
            pageCount: info.pageCount,
            categories: info.categories,
            description: info.description ? info.description.substring(0, 200) + '...' : '',
          },
        };
      });
    } catch (error) {
      console.error('Błąd w googleBooksClient:', error);
      return [];
    }
  },
};
