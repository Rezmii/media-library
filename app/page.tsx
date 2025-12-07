import { Plus } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { mediaRepository } from '@/lib/db/media-repository';

import { MediaCard } from '@/components/domain/media-card';
import { SearchDialog } from '@/components/domain/search-dialog';
import { Button } from '@/components/ui/button';

export default async function Dashboard() {
  const dbItems = await mediaRepository.getAll();

  const items: UnifiedMediaItem[] = dbItems.map((dbItem) => ({
    externalId: dbItem.id,
    title: dbItem.title,
    type: dbItem.type,
    coverUrl: dbItem.coverUrl,
    metadata: (dbItem.metadata as Record<string, any>) || {},
    releaseDate: dbItem.createdAt.getFullYear().toString(),
  }));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Biblioteka</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Twoja kolekcja gier, filmów, książek i muzyki ({items.length} elementów).
          </p>
        </div>
        <SearchDialog>
          <Button size="lg" className="gap-2 px-6 text-lg">
            <Plus className="h-5 w-5" />
            Dodaj nowy element
          </Button>
        </SearchDialog>
      </div>
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 py-20 text-center">
          <h3 className="mb-2 text-xl font-bold">Pusto tutaj...</h3>
          <p className="mb-6 max-w-md text-zinc-500">
            Twoja kolekcja nie ma jeszcze żadnych elementów. Użyj przycisku powyżej, aby dodać swoje
            ulubione gry, filmy lub książki.
          </p>
          <SearchDialog>
            <Button variant="secondary">Zacznij dodawać</Button>
          </SearchDialog>
        </div>
      )}

      <div className="xs:grid-cols-2 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {items.map((item) => (
          <MediaCard key={item.externalId} item={item} isAdded={true} />
        ))}
      </div>
    </div>
  );
}
