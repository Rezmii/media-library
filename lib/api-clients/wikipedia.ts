// Spotify API nie zwraca opisow albumow. Wikipedia ma za to wikipedie
// (kalambur) wiekszosci popularnych wydan. Strategia:
//   1. opensearch z fraza "{title} {artist} album" -> najlepszy tytul artykulu
//   2. REST page summary dla tego tytulu -> pierwszy paragraf
//
// Bez klucza, bez limitu (Wikipedia ma hojne anonymous quotas). Robimy 2
// requesty rownolegle to nie da rady - musimy znac tytul z search zanim
// poprosimy o summary.

const USER_AGENT = 'media-library/1.0 (hobby project)';

async function findArticleTitle(query: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&namespace=0&search=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    // opensearch zwraca [query, titles[], descriptions[], urls[]]
    const data = (await res.json()) as [string, string[], string[], string[]];
    return data?.[1]?.[0] || null;
  } catch {
    return null;
  }
}

async function getSummary(pageTitle: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data: { extract?: string; type?: string } = await res.json();
    // Disambiguation pages nie maja sensownego opisu
    if (data.type === 'disambiguation') return null;
    return data.extract?.trim() || null;
  } catch {
    return null;
  }
}

export const wikipediaClient = {
  // Probuje znalezc opis albumu na angielskiej Wikipedii.
  // Zwraca null jesli nie znajdzie nic sensownego.
  getAlbumDescription: async (title: string, artist: string): Promise<string | null> => {
    if (!title || !artist) return null;

    const pageTitle = await findArticleTitle(`${title} ${artist} album`);
    if (!pageTitle) return null;

    return getSummary(pageTitle);
  },
};
