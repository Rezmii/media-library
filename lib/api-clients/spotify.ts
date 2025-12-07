import { UnifiedMediaItem } from '@/core/types/media';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string;
  images: SpotifyImage[];
  artists: { name: string }[];
  external_urls: { spotify: string };
  popularity: number;
}

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
  };
}

// Funkcja pomocnicza do pobierania Tokenu (Client Credentials Flow)
async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Brak kluczy API Spotify w .env');
  }

  // Kodujemy klucze do Base64 zgodnie z wymogami Spotify
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Błąd autoryzacji Spotify: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Główna funkcja wyszukująca
export const spotifyClient = {
  searchAlbums: async (query: string): Promise<UnifiedMediaItem[]> => {
    try {
      const token = await getAccessToken();

      // Zapytanie do API Spotify
      const params = new URLSearchParams({
        q: query,
        type: 'album',
        limit: '20',
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify Search Error: ${response.statusText}`);
      }

      const data: SpotifySearchResponse = await response.json();

      return data.albums.items
        .filter((album) => {
          const title = album.name.toLowerCase();
          const isJunk =
            title.includes('karaoke') ||
            title.includes('tribute to') ||
            title.includes('cover version');

          return album.album_type === 'album' && !isJunk;
        })
        .slice(0, 8)
        .map((album) => ({
          externalId: album.id,
          type: 'ALBUM',
          title: album.name,
          coverUrl: album.images[0]?.url ?? null,
          releaseDate: album.release_date.split('-')[0],
          metadata: {
            artist: album.artists.map((a) => a.name).join(', '),
            spotifyUrl: album.external_urls.spotify,
            subtype: album.album_type,
            popularityScore: album.popularity,
          },
        }));
    } catch (error) {
      console.error('Błąd w spotifyClient:', error);
      return [];
    }
  },
};
