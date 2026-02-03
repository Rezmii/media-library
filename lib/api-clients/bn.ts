// lib/api-clients/bn.ts
const BASE_URL = 'https://data.bn.org.pl/api/institutions/bibs.json';

export const bnClient = {
  findBook: async (title: string, author?: string) => {
    try {
      const params = new URLSearchParams({
        title: title,
        limit: '1',
      });
      if (author) params.append('author', author);

      const response = await fetch(`${BASE_URL}?${params.toString()}`);
      if (!response.ok) return null;

      const data = await response.json();
      if (!data.bibs || data.bibs.length === 0) return null;

      const book = data.bibs[0];
      return {
        publisher: book.publisher,
        place: book.place,
        isbn: book.isbnIssn,
      };
    } catch (error) {
      return null;
    }
  },
};
