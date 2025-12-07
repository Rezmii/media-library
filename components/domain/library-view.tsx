'use client';

import { FolderOpen, Plus } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { MediaCard } from '@/components/domain/media-card';
import { SearchDialog } from '@/components/domain/search-dialog';
import { Button } from '@/components/ui/button';

interface LibraryViewProps {
  title: string;
  items: UnifiedMediaItem[];
  icon?: React.ReactNode;
}

export function LibraryView({ title, items, icon }: LibraryViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary rounded-lg bg-zinc-900 p-2">{icon}</div>}
          <div>
            <h1 className="mb-1 text-4xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-lg">
              {items.length} {items.length === 1 ? 'element' : 'elementów'} w kolekcji
            </p>
          </div>
        </div>

        <SearchDialog>
          <Button size="lg" className="gap-2 px-6 text-base">
            <Plus className="h-5 w-5" />
            Dodaj element
          </Button>
        </SearchDialog>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800/50 bg-zinc-900/20 py-24 text-center">
          <div className="mb-4 rounded-full bg-zinc-900 p-4">
            <FolderOpen className="h-10 w-10 text-zinc-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Pusto w tej kategorii</h3>
          <p className="mb-8 max-w-md text-zinc-500">
            Nie dodałeś jeszcze żadnych pozycji do sekcji "{title}".
          </p>
          <SearchDialog>
            <Button variant="secondary" size="lg">
              Rozpocznij wyszukiwanie
            </Button>
          </SearchDialog>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item) => (
            <MediaCard key={item.externalId} item={item} isAdded={true} />
          ))}
        </div>
      )}
    </div>
  );
}
