import { Heart } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';

import { LibraryView } from '@/components/domain/library-view';

export default async function FavoritesPage() {
  const dbItems = await mediaRepository.getAll();
  const items = dbItems.map(mapDatabaseItemToUnified);

  const favoriteItems = items.filter((item) => item.isFavorite);

  for (let i = favoriteItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [favoriteItems[i], favoriteItems[j]] = [favoriteItems[j], favoriteItems[i]];
  }

  return (
    <div className="animate-in fade-in duration-500">
      <LibraryView
        title="Moje Ulubione"
        items={favoriteItems}
        icon={<Heart className="h-8 w-8 fill-white text-white" />}
      />
    </div>
  );
}
