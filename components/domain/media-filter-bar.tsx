'use client';

import { useEffect, useMemo, useState } from 'react';

import { Check, ChevronDown, Filter, Heart, X } from 'lucide-react';

// Dodano ChevronDown

import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';

// ... (funkcja getTagCategory pozostaje bez zmian)
function getTagCategory(tag: string): string {
  const trimmed = tag.trim();
  const lowerTag = trimmed.toLowerCase();

  // 1. Rok wydania i dekady
  if (/^(19|20)\d{2}$/.test(trimmed)) return 'Rok wydania';
  if (/lata \d{2}/.test(lowerTag) || /\d{4}s/.test(lowerTag)) return 'Okresy';

  // 2. Platformy
  const platforms = [
    'PC',
    'PlayStation',
    'PS4',
    'PS5',
    'Xbox',
    'Nintendo',
    'Switch',
    'macOS',
    'Linux',
    'iOS',
    'Android',
  ];
  if (platforms.some((p) => new RegExp(`\\b${p}\\b`, 'i').test(trimmed))) return 'Platformy';

  // 3. Typy mediów
  const mediaTypes = [
    'książka',
    'film',
    'serial',
    'gra',
    'muzyka',
    'album',
    'ep',
    'single',
    'podcast',
    'audiobook',
  ];
  if (mediaTypes.includes(lowerTag)) return 'Typ medium';

  // 4. Firmy / Wytwórnie / Studia
  const companies = [
    'press',
    'publishing',
    'records',
    'studio',
    'entertainment',
    'productions',
    'games',
    'music',
    'books',
    'wydawnictwo',
  ];
  if (companies.some((c) => new RegExp(`\\b${c}\\b`, 'i').test(trimmed))) return 'Wydawcy i Studia';

  // 5. Zgadywanie gatunków i tematyki
  const genres = [
    'rock',
    'jazz',
    'pop',
    'metal',
    'rap',
    'hip hop',
    'indie',
    'synth',
    'ambient',
    'blues',
    'classical',
    'punk',
    'akcja',
    'action',
    'komedia',
    'comedy',
    'dramat',
    'drama',
    'thriller',
    'horror',
    'sci-fi',
    'science fiction',
    'fantasy',
    'romans',
    'romance',
    'dokument',
    'documentary',
    'rpg',
    'fps',
    'mmo',
    'strategia',
    'strategy',
    'symulacja',
    'simulation',
    'sport',
    'familijny',
    'anime',
    'manga',
    'psychology',
    'biography',
    'history',
    'science',
    'management',
    'finance',
    'educational',
    'western',
    'wojenny',
    'kryminal',
    'crime',
  ];
  if (genres.some((g) => new RegExp(`\\b${g}\\b`, 'i').test(trimmed))) return 'Gatunki i Tematyka';

  // 6. Twórcy (Autorzy, Aktorzy, Reżyserzy)
  if (/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(trimmed)) return 'Twórcy';

  const words = trimmed.split(/\s+/);
  if (words.length >= 2 && words.length <= 4) {
    const isName = words.every((word) => {
      if (
        ['de', 'van', 'von', 'der', 'la', 'di', 'del', 'le', 'mc', 'mac'].includes(
          word.toLowerCase()
        )
      )
        return true;
      if (/^\p{Lu}\.?$/u.test(word)) return true;
      return /^\p{Lu}[\p{L}\-']+$/u.test(word);
    });
    if (isName) return 'Twórcy';
  }

  // 7. Reszta
  return 'Inne tagi';
}

interface MediaFilterBarProps {
  items: UnifiedMediaItem[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showFavoritesOnly: boolean;
  onFavoritesChange: (show: boolean) => void;
}

export function MediaFilterBar({
  items,
  selectedTags,
  onTagsChange,
  showFavoritesOnly,
  onFavoritesChange,
}: MediaFilterBarProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(''); // Stan wyszukiwarki tagów
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]); // Zwijanie (domyślnie puste)

  // Reset wyszukiwarki po zamknięciu okienka
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  // Grupowanie tagów
  const groupedTags = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    const groups: Record<string, { tag: string; count: number }[]> = {};

    Object.entries(counts).forEach(([tag, count]) => {
      const category = getTagCategory(tag);
      if (!groups[category]) groups[category] = [];
      groups[category].push({ tag, count });
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    });

    return groups;
  }, [items]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex flex-wrap items-center gap-2">
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

          <PopoverContent className="w-[260px] border-zinc-800 bg-zinc-950 p-0" align="start">
            <Command>
              {/* Podpinamy stan search do CommandInput */}
              <CommandInput
                placeholder="Szukaj taga..."
                className="h-9"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="custom-scrollbar max-h-[400px] overflow-y-auto">
                <CommandEmpty>Nie znaleziono tagu.</CommandEmpty>

                {Object.entries(groupedTags).map(([category, tagsArray]) => {
                  if (tagsArray.length === 0) return null;

                  // Kategoria jest rozwinięta jeśli użyto wyszukiwarki LUB ręcznie rozwinięto
                  const isExpanded = search.length > 0 || expandedCategories.includes(category);

                  return (
                    <div key={category}>
                      <CommandGroup
                        className="text-zinc-400"
                        // Podmieniamy nagłówek na interaktywny element
                        heading={
                          <div
                            className="-mx-1 -my-1 flex cursor-pointer items-center justify-between rounded px-1 py-1 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
                            onClick={(e) => {
                              e.stopPropagation(); // Żeby kliknięcie nie zamknęło głównego menu
                              if (search.length === 0) {
                                toggleCategory(category);
                              }
                            }}
                          >
                            <span>{category}</span>
                            {/* Pokazujemy strzałkę tylko gdy nie ma aktywnego wyszukiwania */}
                            {search.length === 0 && (
                              <ChevronDown
                                className={cn(
                                  'h-3 w-3 text-zinc-500 transition-transform duration-200',
                                  isExpanded ? 'rotate-180' : ''
                                )}
                              />
                            )}
                          </div>
                        }
                      >
                        {isExpanded &&
                          tagsArray.map(({ tag, count }) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <CommandItem
                                key={tag}
                                onSelect={() => toggleTag(tag)}
                                className="cursor-pointer"
                              >
                                <div
                                  className={cn(
                                    'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-colors',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'opacity-50 [&_svg]:invisible'
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                </div>
                                <span className="truncate">{tag}</span>
                                <span className="text-muted-foreground ml-auto pl-2 font-mono text-xs">
                                  {count}
                                </span>
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                      <CommandSeparator className="bg-zinc-800/50" />
                    </div>
                  );
                })}

                {selectedTags.length > 0 && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onTagsChange([])}
                      className="cursor-pointer justify-center py-2 text-center font-medium text-red-400 hover:text-red-300"
                    >
                      Wyczyść filtry tagów
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
          className={cn(
            'h-9 border-dashed transition-all',
            showFavoritesOnly
              ? 'border-red-500/50 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          )}
        >
          <Heart className={cn('mr-2 h-4 w-4', showFavoritesOnly && 'fill-current')} />
          Ulubione
        </Button>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex h-8 items-center gap-1 border border-emerald-500/30 bg-zinc-800 px-2 pl-3 text-sm text-emerald-400 hover:bg-zinc-800"
            >
              <span className="max-w-[200px] truncate">{tag}</span>
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 rounded-full p-0.5 text-emerald-500/50 transition-colors hover:bg-zinc-700 hover:text-emerald-400 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            onClick={() => onTagsChange([])}
            className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Resetuj wszystko
          </Button>
        </div>
      )}
    </div>
  );
}
