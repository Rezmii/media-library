import { LayoutGrid } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function Dashboard() {
  const dbItems = await mediaRepository.getAll();

  const items = dbItems.map(mapDatabaseItemToUnified);

  return <LibraryView title="Biblioteka" items={items} icon={<LayoutGrid className="h-8 w-8" />} />;
}
