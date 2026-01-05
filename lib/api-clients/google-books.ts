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
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
}

interface GoogleBookResult {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBookResult[];
}

function getBestQualityCover(imageLinks?: GoogleBookVolumeInfo['imageLinks']): string | null {
  if (!imageLinks) return null;

  let url =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.small ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail;

  if (!url) return null;

  url = url.replace('http:', 'https:');

  url = url.replace('&edge=curl', '');

  return url;
}

export const googleBooksClient = {
  searchBooks: async (query: string): Promise<UnifiedMediaItem[]> => {
    if (!API_KEY) throw new Error('Brak GOOGLE_BOOKS_API_KEY w .env');

    try {
      const plPromise = fetch(
        `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=20&printType=books&langRestrict=pl`
      );

      const globalPromise = fetch(
        `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=20&printType=books`
      );

      const [plRes, globalRes] = await Promise.all([plPromise, globalPromise]);

      if (!plRes.ok || !globalRes.ok) {
        throw new Error(`Google Books Error`);
      }

      const [plData, globalData] = await Promise.all([plRes.json(), globalRes.json()]);

      const allItems: GoogleBookResult[] = [...(plData.items || []), ...(globalData.items || [])];

      const uniqueItems = Array.from(new Map(allItems.map((item) => [item.id, item])).values());

      return uniqueItems
        .filter((item) => {
          const info = item.volumeInfo;
          return info.authors && info.authors.length > 0 && info.title && info.imageLinks;
        })
        .slice(0, 15)
        .map((item) => {
          const info = item.volumeInfo;
          const secureCoverUrl = getBestQualityCover(info.imageLinks);

          const score = 30 + (info.ratingsCount ? Math.min(info.ratingsCount / 10, 70) : 0);

          return {
            externalId: item.id,
            type: 'BOOK',
            title: info.title,
            coverUrl: secureCoverUrl,
            releaseDate: info.publishedDate?.split('-')[0],
            metadata: {
              author: info.authors?.join(', ') || 'Unknown',
              pageCount: info.pageCount,
              categories: info.categories,
              description: info.description ? info.description.substring(0, 300) + '...' : '',
              googleRating: info.averageRating,
              language: info.language,
            },
            popularityScore: score,
            tags: info.categories || [],
          };
        });
    } catch (error) {
      console.error('Błąd w googleBooksClient:', error);
      return [];
    }
  },
};
