'use client';

import Image from 'next/image';

import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { DeleteMediaButton } from './delete-media-button';
import { MediaBadge } from './media-badge';
import { StatusSelector } from './status-selector';

interface MediaCardProps {
  item: UnifiedMediaItem;
  onAdd?: (item: UnifiedMediaItem) => void;
  isAdded?: boolean;
}

export function MediaCard({ item, onAdd, isAdded = false }: MediaCardProps) {
  const getSubtitle = () => {
    switch (item.type) {
      case 'ALBUM':
        return item.metadata.artist;
      case 'BOOK':
        return item.metadata.author;
      case 'GAME':
        return item.metadata.platforms?.[0] || 'PC';
      case 'MOVIE':
      case 'SERIES':
        return item.releaseDate;
      default:
        return item.releaseDate;
    }
  };

  const isCompleted = item.status === 'COMPLETED';
  const isInProgress = item.status === 'IN_PROGRESS';
  const isAbandoned = item.status === 'ABANDONED';

  return (
    <div
      className={cn('group relative flex w-full flex-col gap-3 transition-opacity duration-500')}
    >
      <div
        className={cn(
          'relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-sm transition-all duration-300',

          // Domyślny border (znika gdy wchodzą statusy, żeby nie dublować ramek)
          !item.status && 'border border-zinc-800 group-hover:border-zinc-600',

          // STYL: W TRAKCIE (Niebieska poświata zamiast żółtej)
          isInProgress && 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] ring-2 ring-blue-500',

          isCompleted && 'shadow-none ring-2 ring-emerald-500',

          isAbandoned && 'ring-2 ring-red-900/80'
        )}
      >
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-105',
              isAbandoned && 'opacity-50 grayscale'
            )}
            unoptimized={item.coverUrl.includes('google')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 font-medium text-zinc-700">
            Brak zdjęcia
          </div>
        )}
        {!item.status && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-all duration-300',
              isAdded ? 'bg-black/60 opacity-100' : 'bg-black/60 opacity-0 group-hover:opacity-100'
            )}
          >
            {onAdd && (
              <Button
                size="icon"
                variant={isAdded ? 'secondary' : 'default'}
                className={cn(
                  'h-12 w-12 scale-75 rounded-full transition-transform duration-300 group-hover:scale-100',
                  isAdded && 'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAdded) onAdd(item);
                }}
                disabled={isAdded}
              >
                {isAdded ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              </Button>
            )}
          </div>
        )}

        {item.status ? (
          <>
            <div className="absolute top-2 right-2 left-2 z-10 flex items-start justify-between">
              <MediaBadge type={item.type} />

              <StatusSelector id={item.externalId} currentStatus={item.status} />
            </div>
            <div className="absolute right-2 bottom-2 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <DeleteMediaButton
                id={item.externalId}
                title={item.title}
                className="h-8 w-8 rounded-full border border-white/10 bg-black/60 text-zinc-400 shadow-sm backdrop-blur-md hover:border-red-500/50 hover:bg-red-950/80 hover:text-red-400"
              />
            </div>
          </>
        ) : (
          <div className="absolute top-2 left-2 opacity-90">
            <MediaBadge type={item.type} />
          </div>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-1.5 px-1">
        <h3
          className={cn(
            'truncate text-sm leading-tight font-semibold text-zinc-100 transition-colors'
          )}
          title={item.title}
        >
          {item.title}
        </h3>
        <p className="text-md truncate font-medium text-zinc-400">{getSubtitle()}</p>
      </div>
    </div>
  );
}
