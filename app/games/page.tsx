import { Gamepad2 } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function GamesPage() {
  const dbItems = await mediaRepository.getAll('GAME');

  const items = dbItems.map(mapDatabaseItemToUnified);

  return <LibraryView title="Gry" items={items} icon={<Gamepad2 className="h-8 w-8" />} />;
}
