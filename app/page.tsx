'use client';

import { Plus } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { MediaCard } from '@/components/domain/media-card';
import { Button } from '@/components/ui/button';

// Przykładowe dane (Mock) - tylko do testu wyglądu
const MOCK_ITEMS: UnifiedMediaItem[] = [
  {
    externalId: '1',
    title: 'The Witcher 3: Wild Hunt',
    type: 'GAME',
    // RAWG image
    coverUrl: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    metadata: { platforms: ['PC', 'PS5', 'Xbox'] },
  },
  {
    externalId: '2',
    title: 'Interstellar',
    type: 'MOVIE',
    // TMDB link
    coverUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniL6C8z1BHu8fGzb4epfZw.jpg',
    releaseDate: '2014',
    metadata: {},
  },
  {
    externalId: '3',
    title: 'Szprycer',
    type: 'ALBUM',
    // Spotify CDN (działa publicznie)
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b27341e31d6ea1d493dd779338fc',
    metadata: { artist: 'Taco Hemingway' },
  },
  {
    externalId: '4',
    title: 'Clean Code',
    type: 'BOOK',
    // Google Books image
    coverUrl:
      'https://books.google.com/books/content?id=_i6bDeoCQzsC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    metadata: { author: 'Robert C. Martin' },
  },
  {
    externalId: '5',
    title: 'Breaking Bad',
    type: 'SERIES',
    coverUrl: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o4zHU1Zq2.jpg',
    releaseDate: '2008',
    metadata: {},
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Biblioteka</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Twoja kolekcja gier, filmów, książek i muzyki.
          </p>
        </div>
        <Button size="lg" className="gap-2 text-lg">
          <Plus className="h-5 w-5" /> Dodaj element
        </Button>
      </div>
      <div className="xs:grid-cols-2 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {MOCK_ITEMS.map((item) => (
          <MediaCard
            key={item.externalId}
            item={item}
            onAdd={() => alert(`Dodano: ${item.title}`)}
          />
        ))}
      </div>
    </div>
  );
}
