'use client';

import Image from 'next/image';

import { Check, Plus } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { MediaBadge } from './media-badge';

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

  return (
    <div className="group relative flex w-full flex-col gap-3">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm transition-all duration-300 group-hover:border-zinc-700 group-hover:shadow-md">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={item.coverUrl.includes('google')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 font-medium text-zinc-700">
            No Image
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {onAdd && (
            <Button
              size="icon"
              variant={isAdded ? 'secondary' : 'default'}
              className={cn(
                'h-12 w-12 scale-75 rounded-full transition-transform duration-300 group-hover:scale-100',
                isAdded && 'bg-emerald-600 text-white hover:bg-emerald-700'
              )}
              onClick={() => onAdd(item)}
              disabled={isAdded}
            >
              {isAdded ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
          )}
        </div>

        <div className="absolute top-2 right-2 opacity-90">
          <MediaBadge type={item.type} />
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-1.5 px-1">
        <h3 className="truncate text-lg leading-snug font-bold text-zinc-100" title={item.title}>
          {item.title}
        </h3>
        <p className="text-md truncate font-medium text-zinc-400">{getSubtitle()}</p>
      </div>
    </div>
  );
}
