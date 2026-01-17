import { MediaItem, Tag } from '@prisma/client';

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
    rating: dbItem.rating,
    note: dbItem.note,

    metadata: (dbItem.metadata as Record<string, any>) || {},
    releaseDate: metadata.releaseDate || dbItem.createdAt.getFullYear().toString(),
    addedAt: dbItem.createdAt.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    isAdded: true,
    tags: dbItem.tags?.map((tag) => tag.name) || [],
  };
}
