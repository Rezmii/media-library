'use server';

import { revalidatePath } from 'next/cache';

import { UnifiedMediaItem } from '@/core/types/media';

import { googleBooksClient } from '@/lib/api-clients/google-books';
import { rawgClient } from '@/lib/api-clients/rawg';
import { spotifyClient } from '@/lib/api-clients/spotify';
import { tmdbClient } from '@/lib/api-clients/tmdb';
import { mediaRepository } from '@/lib/db/media-repository';

async function getExistingLibraryIds(): Promise<Set<string>> {
  const allItems = await mediaRepository.getAll();
  const ids = new Set<string>();

  allItems.forEach((item) => {
    const meta = item.metadata as Record<string, any>;
    if (meta && meta.externalId) {
      ids.add(meta.externalId);
    }
  });

  return ids;
}

export async function searchMediaAction(query: string): Promise<UnifiedMediaItem[]> {
  if (!query || query.length < 2) return [];

  try {
    const [albums, games, movies, books] = await Promise.all([
      spotifyClient.searchAlbums(query),
      rawgClient.searchGames(query),
      tmdbClient.searchMoviesAndSeries(query),
      googleBooksClient.searchBooks(query),
    ]);

    let allResults = [...games, ...movies, ...albums, ...books];

    allResults = allResults.sort(() => Math.random() - 0.5);

    const existingIds = await getExistingLibraryIds();

    return allResults
      .map((item) => ({
        ...item,
        isAdded: existingIds.has(item.externalId),
      }))
      .slice(0, 20);
  } catch (error) {
    console.error('Błąd wyszukiwania:', error);
    return [];
  }
}

export async function addToLibraryAction(item: UnifiedMediaItem) {
  try {
    const autoTags: string[] = [];

    if (item.metadata.platforms) autoTags.push(...item.metadata.platforms);
    if (item.metadata.categories) autoTags.push(...item.metadata.categories);
    if (item.metadata.originalType) autoTags.push(item.metadata.originalType);
    if (item.releaseDate) autoTags.push(item.releaseDate);

    await mediaRepository.create({
      title: item.title,
      type: item.type,
      coverUrl: item.coverUrl ?? undefined,
      metadata: {
        ...item.metadata,
        externalId: item.externalId,
      },
      tags: autoTags,
    });

    revalidatePath('/');
    revalidatePath('/games');
    revalidatePath('/movies');
    revalidatePath('/books');
    revalidatePath('/albums');
    revalidatePath('/series');

    return { success: true };
  } catch (error) {
    console.error('Błąd dodawania:', error);
    return { success: false, error: 'Nie udało się dodać elementu' };
  }
}
