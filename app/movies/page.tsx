import { Film } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function MoviesPage() {
  const dbItems = await mediaRepository.getAll('MOVIE');

  const items: UnifiedMediaItem[] = dbItems.map((dbItem) => ({
    externalId: dbItem.id,
    title: dbItem.title,
    type: dbItem.type,
    coverUrl: dbItem.coverUrl,
    metadata: (dbItem.metadata as Record<string, any>) || {},
    releaseDate: dbItem.createdAt.getFullYear().toString(),
  }));

  return <LibraryView title="Filmy" items={items} icon={<Film className="h-8 w-8" />} />;
}
