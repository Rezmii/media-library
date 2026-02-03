// lib/api-clients/google-books.ts
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const googleBooksClient = {
  enrichBookData: async (isbn?: string, title?: string, author?: string) => {
    if (!API_KEY) return null;

    let query = '';
    if (isbn) {
      query = `isbn:${isbn}`;
    } else if (title && author) {
      query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
    } else {
      return null;
    }

    try {
      const response = await fetch(
        `${BASE_URL}?q=${query}&key=${API_KEY}&maxResults=1&printType=books`
      );

      if (!response.ok) return null;
      const data = await response.json();

      if (!data.items || data.items.length === 0) return null;

      const info = data.items[0].volumeInfo;

      return {
        description: info.description,
        pageCount: info.pageCount,
        averageRating: info.averageRating,
        thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:').replace('&edge=curl', ''),
        publisher: info.publisher,
      };
    } catch (error) {
      console.error('Google Books Enrichment Error:', error);
      return null;
    }
  },
};
