'use client';

import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { FolderOpen } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { MediaCard } from '@/components/domain/media-card';
import { SearchDialog } from '@/components/domain/search-dialog';
import { Button } from '@/components/ui/button';

import { DashboardHeader } from './dashboard-header';
import { LocalSearchBar } from './local-search-bar';
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
  const [searchQuery, setSearchQuery] = useState('');

  const [randomOrder, setRandomOrder] = useState<Record<string, number>>({});

  useEffect(() => {
    const orderMap: Record<string, number> = {};
    items.forEach((item) => {
      orderMap[item.externalId] = Math.random();
    });
    setRandomOrder(orderMap);
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (showFavoritesOnly) {
      result = result.filter((item) => item.isFavorite);

      result.sort((a, b) => {
        const valA = randomOrder[a.externalId] ?? 0;
        const valB = randomOrder[b.externalId] ?? 0;
        return valA - valB;
      });
    }

    if (selectedTags.length > 0) {
      result = result.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
    }

    if (searchQuery.trim() !== '') {
      const fuse = new Fuse(result, {
        keys: [
          { name: 'title', weight: 2.0 },
          { name: 'metadata.originalTitle', weight: 1.5 },
          { name: 'metadata.author', weight: 1.5 },
          { name: 'metadata.artist', weight: 1.5 },
          { name: 'metadata.director', weight: 1.2 },
          { name: 'tags', weight: 1.0 },
          { name: 'metadata.platforms', weight: 1.0 },
          { name: 'metadata.categories', weight: 1.0 },
          { name: 'metadata.publisher', weight: 0.8 },
          { name: 'releaseDate', weight: 0.5 },
          { name: 'note', weight: 0.5 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
      });

      result = fuse.search(searchQuery).map((res) => res.item);
    }

    return result;
  }, [items, selectedTags, showFavoritesOnly, searchQuery, randomOrder]);

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <DashboardHeader title={title} count={items.length} icon={icon} />

      {/* Użycie nowego komponentu */}
      {items.length > 0 && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <MediaFilterBar
            items={items}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            showFavoritesOnly={showFavoritesOnly}
            onFavoritesChange={setShowFavoritesOnly}
          />

          <div className="w-full shrink-0 lg:w-72">
            <LocalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Szukaj (tytuł, twórca, tag...)"
            />
          </div>
        </div>
      )}

      {/* Pusty stan dla filtrów */}
      <AnimatePresence mode="wait">
        {filteredItems.length === 0 && items.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <p className="text-zinc-500">Brak wyników dla wybranych kryteriów.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTags([]);
                setShowFavoritesOnly(false);
                setSearchQuery('');
              }}
            >
              Wyczyść filtry
            </Button>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800/50 bg-zinc-900/20 py-24 text-center"
          >
            <div className="mb-4 rounded-full bg-zinc-900 p-4">
              <FolderOpen className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Pusto tutaj</h3>
            <SearchDialog>
              <Button variant="secondary" size="lg">
                Rozpocznij wyszukiwanie
              </Button>
            </SearchDialog>
          </motion.div>
        ) : (
          /* SIATKA Z ANIMACJĄ LAYOUTU */
          <motion.div
            layout // To sprawia, że kafelki płynnie się przesuwają na nowe pozycje
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.externalId}
                  layout // Płynne przesuwanie
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <MediaDetailsDialog item={item}>
                    <MediaCard item={item} isAdded={true} />
                  </MediaDetailsDialog>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
