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
import {
  MediaFilterBar,
  type SortDir,
  type SortKey,
  type StatusValue,
} from './media-filter-bar';

interface LibraryViewProps {
  title: string;
  items: UnifiedMediaItem[];
  icon?: React.ReactNode;
  initialSortKey?: SortKey;
}

export function LibraryView({ title, items, icon, initialSortKey }: LibraryViewProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<StatusValue[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>(initialSortKey ?? 'date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Stabilna kolejnosc losowa dla sortu "Losowo" / widoku ulubionych. Liczona
  // w useEffect (po mount), zeby nie bylo rozjazdu hydratacji SSR vs klient.
  const [randomOrder, setRandomOrder] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.externalId] = Math.random();
    });
    setRandomOrder(map);
  }, [items]);

  // Wlaczenie "Ulubione" automatycznie przelacza sort na losowy (jak dawniej);
  // wylaczenie wraca do daty.
  const handleFavoritesChange = (show: boolean) => {
    setShowFavoritesOnly(show);
    setSortKey(show ? 'random' : 'date');
  };

  // Opcja sortu "Długość" ma sens tylko gdy w widoku są gry z playtime.
  const lengthSortAvailable = useMemo(
    () => items.some((i) => typeof i.metadata?.playtime === 'number' && i.metadata.playtime > 0),
    [items]
  );

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (showFavoritesOnly) {
      result = result.filter((item) => item.isFavorite);
    }

    if (selectedStatuses.length > 0) {
      result = result.filter(
        (item) => item.status && selectedStatuses.includes(item.status as StatusValue)
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
    }

    // Wyszukiwanie ma wlasna kolejnosc trafnosci (Fuse) — wtedy nie sortujemy.
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

      return fuse.search(searchQuery).map((res) => res.item);
    }

    // Sort losowy: stabilny w obrebie sesji (randomOrder), kierunek bez znaczenia.
    if (sortKey === 'random') {
      result.sort(
        (a, b) => (randomOrder[a.externalId] ?? 0) - (randomOrder[b.externalId] ?? 0)
      );
      return result;
    }

    // Sortowanie (porownanie w sensie rosnacym, kierunek aplikowany na koncu).
    const primary = (a: UnifiedMediaItem, b: UnifiedMediaItem) => {
      switch (sortKey) {
        case 'rating':
          return (a.rating ?? -1) - (b.rating ?? -1);
        case 'title':
          return a.title.localeCompare(b.title, 'pl');
        case 'year':
          return (parseInt(a.releaseDate ?? '', 10) || 0) - (parseInt(b.releaseDate ?? '', 10) || 0);
        case 'length':
          return (Number(a.metadata?.playtime) || 0) - (Number(b.metadata?.playtime) || 0);
        case 'date':
        default:
          return (a.activityTs ?? 0) - (b.activityTs ?? 0);
      }
    };

    result.sort((a, b) => {
      let r = primary(a, b);
      r = sortDir === 'desc' ? -r : r;
      if (r !== 0) return r;
      // Stabilny tiebreak (niezalezny od kierunku).
      return a.externalId < b.externalId ? -1 : a.externalId > b.externalId ? 1 : 0;
    });

    return result;
  }, [
    items,
    selectedTags,
    showFavoritesOnly,
    searchQuery,
    selectedStatuses,
    sortKey,
    sortDir,
    randomOrder,
  ]);

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
            onFavoritesChange={handleFavoritesChange}
            selectedStatuses={selectedStatuses}
            onStatusesChange={setSelectedStatuses}
            sortKey={sortKey}
            onSortKeyChange={setSortKey}
            sortDir={sortDir}
            onSortDirChange={setSortDir}
            lengthSortAvailable={lengthSortAvailable}
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
                setSelectedStatuses([]);
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
