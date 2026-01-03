import { Tv } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function SeriesPage() {
  const dbItems = await mediaRepository.getAll('SERIES');

  const items = dbItems.map(mapDatabaseItemToUnified);

  return <LibraryView title="Seriale" items={items} icon={<Tv className="h-8 w-8" />} />;
}
