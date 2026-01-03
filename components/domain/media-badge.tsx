// components/domain/media-badge.tsx
import { MediaType } from '@prisma/client';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

interface MediaBadgeProps {
  type: MediaType | string;
  className?: string;
}

export function MediaBadge({ type, className }: MediaBadgeProps) {
  const badges: Record<string, { label: string; color: string }> = {
    GAME: { label: 'Gra', color: 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20' },
    MOVIE: { label: 'Film', color: 'text-blue-400 border-blue-500/50 shadow-blue-500/20' },
    SERIES: {
      label: 'Serial',
      color: 'text-indigo-400 border-indigo-500/50 shadow-indigo-500/20',
    },
    BOOK: { label: 'Książka', color: 'text-amber-400 border-amber-500/50 shadow-amber-500/20' },
    ALBUM: { label: 'Album', color: 'text-rose-400 border-rose-500/50 shadow-rose-500/20' },
  };

  const key = type.toString().toUpperCase();
  const colorClass = badges[key].color || 'text-zinc-400 border-zinc-500/50';

  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-black/80 px-2.5 py-1 text-xs tracking-wider uppercase shadow-sm backdrop-blur-md',
        colorClass,
        className
      )}
    >
      {badges[key].label}
    </Badge>
  );
}
