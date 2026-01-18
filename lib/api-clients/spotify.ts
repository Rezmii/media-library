import { UnifiedMediaItem } from '@/core/types/media';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface SpotifyTrack {
  id: string;
  name: string;
  track_number: number;
  duration_ms: number;
  artists: SpotifyArtist[];
}

interface SpotifyArtistFull {
  id: string;
  name: string;
  genres: string[];
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  name: string;
  id: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album_type: 'album' | 'single' | 'compilation' | 'EP';
  release_date: string;
  total_tracks: number;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  popularity?: number;
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
        market: 'PL',
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

          const isFullAlbum = album.album_type === 'album';
          const isEP = album.album_type === 'single' && album.total_tracks > 3;

          return (isFullAlbum || isEP) && !isJunk;
        })
        .slice(0, 25)
        .map((album) => {
          const coverUrl = album.images[0]?.url || null;
          const allArtists = album.artists.map((a) => a.name);

          let preciseType = album.album_type;

          if (album.album_type === 'single' && album.total_tracks > 3) {
            if (album.total_tracks > 3) {
              preciseType = 'EP';
            } else {
              preciseType = 'single';
            }
          } else if (album.album_type === 'album') {
            preciseType = 'album';
          }

          return {
            externalId: album.id,
            type: 'ALBUM',
            title: album.name,
            coverUrl: coverUrl,
            releaseDate: album.release_date.split('-')[0],
            metadata: {
              artist: allArtists.join(', '),
              totalTracks: album.total_tracks,
              spotifyUrl: album.external_urls.spotify,
              subtype: preciseType,
              popularityScore: album.popularity,
            },
            tags: ['Muzyka', preciseType],
          };
        });
    } catch (error) {
      console.error('Błąd w spotifyClient:', error);
      return [];
    }
  },

  getAlbumDetails: async (albumId: string) => {
    try {
      const token = await getAccessToken();

      const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!albumResponse.ok) return null;
      const albumData = await albumResponse.json();

      let genres: string[] = [];
      if (albumData.artists && albumData.artists.length > 0) {
        const artistId = albumData.artists[0].id;
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (artistResponse.ok) {
          const artistData: SpotifyArtistFull = await artistResponse.json();
          genres = artistData.genres || [];
        }
      }

      const tracks = albumData.tracks.items.map((track: SpotifyTrack) => {
        const albumArtistIds = albumData.artists.map((a: any) => a.id);
        const featArtists = track.artists
          .filter((a) => !albumArtistIds.includes(a.id))
          .map((a) => a.name);

        return {
          title: track.name,
          duration: track.duration_ms,
          features: featArtists,
        };
      });

      return {
        tracks,
        genres: genres.slice(0, 5),
      };
    } catch (error) {
      console.error('Błąd pobierania detali albumu:', error);
      return null;
    }
  },
};
