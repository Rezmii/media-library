import { Gamepad2 } from 'lucide-react';

import { UnifiedMediaItem } from '@/core/types/media';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function GamesPage() {
  const dbItems = await mediaRepository.getAll('GAME');

  const items: UnifiedMediaItem[] = dbItems.map((dbItem) => ({
    externalId: dbItem.id,
    title: dbItem.title,
    type: dbItem.type,
    coverUrl: dbItem.coverUrl,
    metadata: (dbItem.metadata as Record<string, any>) || {},
    releaseDate: dbItem.createdAt.getFullYear().toString(),
    status: dbItem.status,
  }));

  return <LibraryView title="Gry" items={items} icon={<Gamepad2 className="h-8 w-8" />} />;
}
