import { googleBooksClient } from '@/lib/api-clients/google-books';
import { rawgClient } from '@/lib/api-clients/rawg';
import { spotifyClient } from '@/lib/api-clients/spotify';
import { tmdbClient } from '@/lib/api-clients/tmdb';

// Nowy import

export default async function TestPage() {
  // Pobieramy WSZYSTKO naraz
  const [albums, games, movies, books] = await Promise.all([
    spotifyClient.searchAlbums('Taco Hemingway'),
    rawgClient.searchGames('Cyberpunk'),
    tmdbClient.searchMoviesAndSeries('Inception'),
    googleBooksClient.searchBooks('Clean Code'), // Szukamy książki dla programistów
  ]);

  const allMedia = [...albums, ...games, ...movies, ...books];

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-8 text-3xl font-bold">OmniTracker - Complete Media Test</h1>

      {/* Grid responsywny: 2 kolumny na tel, 6 na dużym ekranie */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
        {allMedia.map((item) => (
          <div
            key={`${item.type}-${item.externalId}`}
            className="group relative flex flex-col gap-2"
          >
            {/* Okładka z efektem hover */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-zinc-800 shadow-lg transition-colors group-hover:border-zinc-500">
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                  No Image
                </div>
              )}

              {/* Badge Typu */}
              <div className="absolute top-2 right-2">
                <span
                  className={`rounded border border-white/20 px-2 py-1 text-[10px] font-bold text-white shadow-md shadow-black ${item.type === 'GAME' ? 'bg-green-600' : ''} ${item.type === 'MOVIE' ? 'bg-blue-600' : ''} ${item.type === 'ALBUM' ? 'bg-purple-600' : ''} ${item.type === 'BOOK' ? 'bg-yellow-600' : ''} ${item.type === 'SERIES' ? 'bg-orange-600' : ''} `}
                >
                  {item.type}
                </span>
              </div>
            </div>

            {/* Opis */}
            <div>
              <h3 className="truncate text-sm font-semibold text-zinc-100" title={item.title}>
                {item.title}
              </h3>
              <p className="truncate text-xs text-zinc-500">
                {/* Inteligentne wyświetlanie "autora" w zależności od typu */}
                {item.type === 'ALBUM' && item.metadata.artist}
                {item.type === 'BOOK' && item.metadata.author}
                {item.type === 'GAME' && 'Gra Wideo'}
                {item.type === 'MOVIE' && item.releaseDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
