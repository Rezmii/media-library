'use server';

import { revalidatePath } from 'next/cache';

import { MediaType } from '@prisma/client';
import Fuse from 'fuse.js';

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

export async function searchMediaAction(
  query: string,
  typeFilter?: MediaType | 'ALL'
): Promise<UnifiedMediaItem[]> {
  if (!query || query.length < 2) return [];

  const safeType = typeFilter || 'ALL';

  try {
    let rawResults: UnifiedMediaItem[] = [];

    const promises = [];

    if (safeType === 'ALL' || safeType === 'GAME') {
      promises.push(rawgClient.searchGames(query));
    }

    if (safeType === 'ALL' || safeType === 'MOVIE' || safeType === 'SERIES') {
      promises.push(
        tmdbClient.searchMoviesAndSeries(query).then((results) => {
          if (safeType === 'MOVIE') return results.filter((r) => r.type === 'MOVIE');
          if (safeType === 'SERIES') return results.filter((r) => r.type === 'SERIES');
          return results;
        })
      );
    }

    if (safeType === 'ALL' || safeType === 'ALBUM') {
      promises.push(spotifyClient.searchAlbums(query));
    }

    if (safeType === 'ALL' || safeType === 'BOOK') {
      promises.push(googleBooksClient.searchBooks(query));
    }

    const resultsArrays = await Promise.all(promises);
    rawResults = resultsArrays.flat();

    const fuse = new Fuse(rawResults, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'type', weight: 0.1 },
        { name: 'metadata.artist', weight: 0.2 },
        { name: 'metadata.author', weight: 0.2 },
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
    });

    const fusedResults = fuse.search(query);

    const existingIds = await getExistingLibraryIds();

    return fusedResults
      .map((result) => ({
        ...result.item,
        isAdded: existingIds.has(result.item.externalId),
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
