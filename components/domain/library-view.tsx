'use client';

import { useMemo, useState } from 'react';

import { Check, Filter, FolderOpen, Heart, Plus, X } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { MediaCard } from '@/components/domain/media-card';
import { SearchDialog } from '@/components/domain/search-dialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { DashboardHeader } from './dashboard-header';
import { MediaDetailsDialog } from './media-details-dialog';
import { MediaFilterBar } from './media-filter-bar';

interface LibraryViewProps {
  title: string;
  items: UnifiedMediaItem[];
  icon?: React.ReactNode;
}

export function LibraryView({ title, items, icon }: LibraryViewProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredItems = useMemo(() => {
    let result = items;

    if (showFavoritesOnly) {
      result = result.filter((item) => item.isFavorite);
    }

    if (selectedTags.length > 0) {
      result = result.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
    }

    return result;
  }, [items, selectedTags, showFavoritesOnly]);

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <DashboardHeader title={title} count={items.length} icon={icon} />

      {/* Użycie nowego komponentu */}
      {items.length > 0 && (
        <MediaFilterBar
          items={items}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesChange={setShowFavoritesOnly}
        />
      )}

      {/* Pusty stan dla filtrów */}
      {filteredItems.length === 0 && items.length > 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-zinc-500">Brak elementów spełniających kryteria filtrów.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedTags([]);
              setShowFavoritesOnly(false);
            }}
          >
            Wyczyść filtry
          </Button>
        </div>
      )}

      {/* Pusty stan dla braku elementów (Empty state) */}
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

      {/* Siatka z wynikami */}
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredItems.map((item) => (
            <MediaDetailsDialog key={item.externalId} item={item}>
              <MediaCard item={item} isAdded={true} />
            </MediaDetailsDialog>
          ))}
        </div>
      )}
    </div>
  );
}
