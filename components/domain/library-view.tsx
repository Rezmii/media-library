'use client';

import { useMemo, useState } from 'react';

import { Check, Filter, FolderOpen, Plus, X, XCircle } from 'lucide-react';

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
import { MediaDetailsDialog } from './media-details-dialog';

interface LibraryViewProps {
  title: string;
  items: UnifiedMediaItem[];
  icon?: React.ReactNode;
}

export function LibraryView({ title, items, icon }: LibraryViewProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [items]);

  const availableTags = useMemo(() => {
    return Object.keys(tagCounts).sort();
  }, [tagCounts]);

  const filteredItems = useMemo(() => {
    if (selectedTags.length === 0) return items;
    return items.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
  }, [items, selectedTags]);

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

      <div className="flex items-center gap-2 pb-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtruj tagi</span>
              </div>
              {selectedTags.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4 bg-zinc-700" />
                  <span className="rounded-sm bg-zinc-800 px-1 font-mono text-xs text-zinc-300">
                    {selectedTags.length}
                  </span>
                </>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[200px] border-zinc-800 bg-zinc-950 p-0" align="start">
            <Command>
              <CommandInput placeholder="Szukaj taga..." className="h-9" />
              <CommandList>
                <CommandEmpty>Nie znaleziono tagu.</CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          if (isSelected) {
                            setSelectedTags((prev) => prev.filter((t) => t !== tag));
                          } else {
                            setSelectedTags((prev) => [...prev, tag]);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{tag}</span>
                        <span className="text-muted-foreground ml-auto font-mono text-xs">
                          {tagCounts[tag]}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                {selectedTags.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setSelectedTags([])}
                        className="cursor-pointer justify-center text-center text-red-400 hover:text-red-300"
                      >
                        Wyczyść filtry
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex h-8 items-center gap-1 border border-emerald-500/30 bg-zinc-800 px-2 pl-3 text-sm text-emerald-400 hover:bg-zinc-800"
          >
            {tag}
            <button
              onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
              className="ml-1 rounded-full p-0.5 text-emerald-500/50 transition-colors hover:bg-zinc-700 hover:text-emerald-400 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setSelectedTags([])}
            className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Resetuj
          </Button>
        )}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-zinc-500">Brak elementów zawierających wszystkie wybrane tagi.</p>
          <Button variant="outline" onClick={() => setSelectedTags([])}>
            Wyczyść filtry
          </Button>
        </div>
      )}

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
