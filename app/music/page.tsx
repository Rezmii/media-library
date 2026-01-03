import { Disc } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function MusicPage() {
  const dbItems = await mediaRepository.getAll('ALBUM');

  const items = dbItems.map(mapDatabaseItemToUnified);

  return <LibraryView title="Albumy" items={items} icon={<Disc className="h-8 w-8" />} />;
}
