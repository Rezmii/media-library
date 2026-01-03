import { Film } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function MoviesPage() {
  const dbItems = await mediaRepository.getAll('MOVIE');

  const items = dbItems.map(mapDatabaseItemToUnified);

  return <LibraryView title="Filmy" items={items} icon={<Film className="h-8 w-8" />} />;
}
