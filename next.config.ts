import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' }, // Spotify
      { protocol: 'https', hostname: 'media.rawg.io' }, // RAWG (Gry)
      { protocol: 'https', hostname: 'image.tmdb.org' }, // TMDB (Filmy)
      { protocol: 'https', hostname: 'books.google.com' }, // Google Books
      { protocol: 'https', hostname: 'books.google.pl' }, // Google Books (lokalne)
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
    ],
  },
};

export default nextConfig;
