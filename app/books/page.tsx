import { BookOpen } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function BooksPage() {
  const dbItems = await mediaRepository.getAll('BOOK');

  const items = dbItems.map(mapDatabaseItemToUnified);

  return <LibraryView title="Książki" items={items} icon={<BookOpen className="h-8 w-8" />} />;
}
