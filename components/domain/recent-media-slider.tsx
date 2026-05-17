'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { MediaCard } from './media-card';
import { MediaDetailsDialog } from './media-details-dialog';

const ITEMS_PER_PAGE = 5;

interface RecentMediaSliderProps {
  items: UnifiedMediaItem[];
}

export function RecentMediaSlider({ items }: RecentMediaSliderProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  const start = page * ITEMS_PER_PAGE;
  const currentItems = items.slice(start, start + ITEMS_PER_PAGE);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const showControls = totalPages > 1;

  const goPrev = () => canPrev && setPage((p) => p - 1);
  const goNext = () => canNext && setPage((p) => p + 1);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Ostatnio dodane
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <span
              className="hidden text-xs font-medium tracking-wider text-zinc-500 uppercase sm:block"
              aria-live="polite"
            >
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Poprzednie"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all',
                canPrev
                  ? 'hover:border-zinc-700 hover:bg-zinc-900 hover:text-emerald-400'
                  : 'cursor-not-allowed opacity-30'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Następne"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all',
                canNext
                  ? 'hover:border-zinc-700 hover:bg-zinc-900 hover:text-emerald-400'
                  : 'cursor-not-allowed opacity-30'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {currentItems.map((item) => (
            <MediaDetailsDialog key={item.externalId} item={item}>
              <MediaCard item={item} isAdded={true} />
            </MediaDetailsDialog>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
