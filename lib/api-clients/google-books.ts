// lib/api-clients/google-books.ts
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Google Books domyślnie zwraca thumbnail z zoom=1 (~128 px). zoom=3 daje ~512 px tej samej okładki.
function upscaleGoogleBooksCover(url: string | undefined): string | undefined {
  if (!url || !url.includes('books.google.')) return url;
  if (/[?&]zoom=\d+/.test(url)) {
    return url.replace(/([?&])zoom=\d+/, '$1zoom=3');
  }
  return url + (url.includes('?') ? '&' : '?') + 'zoom=3';
}

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
        thumbnail: upscaleGoogleBooksCover(
          info.imageLinks?.thumbnail?.replace('http:', 'https:').replace('&edge=curl', '')
        ),
        publisher: info.publisher,
      };
    } catch (error) {
      console.error('Google Books Enrichment Error:', error);
      return null;
    }
  },
};
