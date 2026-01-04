import { MediaItem, Tag } from '@prisma/client';

import { UnifiedMediaItem } from '@/core/types/media';

type DbMediaItem = MediaItem & { tags?: Tag[] };

export function mapDatabaseItemToUnified(dbItem: DbMediaItem): UnifiedMediaItem {
  return {
    externalId: dbItem.id,
    title: dbItem.title,
    type: dbItem.type,
    coverUrl: dbItem.coverUrl,
    status: dbItem.status,
    rating: dbItem.rating,
    note: dbItem.note,

    metadata: (dbItem.metadata as Record<string, any>) || {},
    releaseDate: dbItem.createdAt.getFullYear().toString(),
    isAdded: true,
    tags: dbItem.tags?.map((tag) => tag.name) || [],
  };
}
