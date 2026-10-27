import { MediaItem, Tag } from '@prisma/client';

import { sortTimestamp } from '@/core/activity';
import { UnifiedMediaItem } from '@/core/types/media';

type DbMediaItem = MediaItem & { tags?: Tag[] };

export function mapDatabaseItemToUnified(dbItem: DbMediaItem): UnifiedMediaItem {
  const metadata = (dbItem.metadata as Record<string, any>) || {};

  return {
    externalId: dbItem.id,
    title: dbItem.title,
    type: dbItem.type,
    coverUrl: dbItem.coverUrl,
    status: dbItem.status,
    // 0 traktujemy jako brak oceny (starsze rekordy zapisane z domyslnym 0)
    rating: dbItem.rating && dbItem.rating > 0 ? dbItem.rating : null,
    note: dbItem.note,

    metadata: (dbItem.metadata as Record<string, any>) || {},
    releaseDate: metadata.releaseDate || dbItem.createdAt.getFullYear().toString(),
    addedAt: dbItem.createdAt.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    completedAt: dbItem.completedAt
      ? dbItem.completedAt.toLocaleDateString('pl-PL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : null,
    // Sortowalna "data aktywnosci" — ta sama logika co sort w repozytorium.
    activityTs: sortTimestamp(dbItem),
    isAdded: true,
    isFavorite: dbItem.isFavorite,
    tags: dbItem.tags?.map((tag) => tag.name) || [],
  };
}
