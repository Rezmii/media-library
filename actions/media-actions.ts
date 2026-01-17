'use server';

import { revalidatePath } from 'next/cache';

import { MediaType, Status } from '@prisma/client';
import Fuse from 'fuse.js';

import { UnifiedMediaItem } from '@/core/types/media';

import { googleBooksClient } from '@/lib/api-clients/google-books';
import { rawgClient } from '@/lib/api-clients/rawg';
import { spotifyClient } from '@/lib/api-clients/spotify';
import { tmdbClient } from '@/lib/api-clients/tmdb';
import { mediaRepository } from '@/lib/db/media-repository';

function revalidatePaths() {
  revalidatePath('/');
  revalidatePath('/games');
  revalidatePath('/movies');
  revalidatePath('/series');
  revalidatePath('/books');
  revalidatePath('/music');
}

async function getExistingLibraryMap(): Promise<Map<string, string>> {
  const allItems = await mediaRepository.getAll();

  const map = new Map<string, string>();

  allItems.forEach((item) => {
    const meta = item.metadata as Record<string, any>;

    if (meta && meta.externalId) {
      map.set(meta.externalId, item.id);
    }
  });

  return map;
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
        { name: 'title', weight: 1.0 }, // Tytuł najważniejszy
        { name: 'metadata.originalTitle', weight: 0.8 }, // Oryginalny tytuł (dla filmów)
        { name: 'metadata.author', weight: 0.8 }, // Autor książki
        { name: 'metadata.artist', weight: 0.7 }, // Artysta muzyczny
        { name: 'metadata.director', weight: 0.6 }, // Reżyser (jeśli dodamy w przyszłości)
        { name: 'metadata.actors', weight: 0.5 }, // Aktorzy (jeśli dodamy)
        { name: 'metadata.description', weight: 0.1 }, // Opis (mała waga, ale może pomóc)
      ],
      includeScore: true,
      threshold: 0.6,
      ignoreLocation: true,
      ignoreDiacritics: true,
    });

    const fusedResults = fuse.search(query);

    const existingMap = await getExistingLibraryMap();

    return fusedResults
      .map((result) => {
        const item = result.item;
        const dbId = existingMap.get(item.externalId);

        return {
          ...item,
          isAdded: !!dbId,
          externalId: dbId || item.externalId,
        };
      })
      .slice(0, 20);
  } catch (error) {
    console.error('Błąd wyszukiwania:', error);
    return [];
  }
}

export async function addToLibraryAction(item: UnifiedMediaItem, isBacklog: boolean = false) {
  try {
    const autoTags: string[] = [];

    if (item.metadata.platforms) autoTags.push(...item.metadata.platforms);
    if (item.metadata.categories) autoTags.push(...item.metadata.categories);
    if (item.metadata.originalType) autoTags.push(item.metadata.originalType);
    if (item.releaseDate) autoTags.push(item.releaseDate);

    const customCreatedAt = isBacklog ? new Date('2026-01-17T16:27:25Z') : undefined;

    await mediaRepository.create({
      title: item.title,
      type: item.type,
      coverUrl: item.coverUrl ?? undefined,
      metadata: {
        ...item.metadata,
        externalId: item.externalId,
      },
      tags: autoTags,
      createdAt: customCreatedAt,
    });

    revalidatePaths();

    return { success: true };
  } catch (error) {
    console.error('Błąd dodawania:', error);
    return { success: false, error: 'Nie udało się dodać elementu' };
  }
}

export async function updateStatusAction(id: string, status: Status) {
  try {
    await mediaRepository.updateStatus(id, status);

    revalidatePaths();

    return { success: true };
  } catch (error) {
    console.error('Błąd zmiany statusu:', error);
    return { success: false, error: 'Nie udało się zmienić statusu' };
  }
}

export async function updateMediaDetailsAction(
  id: string,
  rating: number | null,
  note: string | null
) {
  try {
    await mediaRepository.updateDetails(id, { rating, note });

    revalidatePaths();

    return { success: true };
  } catch (error) {
    console.error('Błąd aktualizacji detali:', error);
    return { success: false, error: 'Nie udało się zapisać.' };
  }
}

export async function addTagAction(itemId: string, tagName: string) {
  try {
    const normalizedTag = tagName.trim();
    if (!normalizedTag) return { success: false };

    await mediaRepository.addTag(itemId, normalizedTag);

    revalidatePaths();

    return { success: true };
  } catch (error) {
    console.error('Błąd dodawania tagu:', error);
    return { success: false };
  }
}

// AKCJA: Usuń Tag
export async function removeTagAction(itemId: string, tagName: string) {
  try {
    await mediaRepository.removeTag(itemId, tagName);
    revalidatePaths();
    return { success: true };
  } catch (error) {
    console.error('Błąd usuwania tagu:', error);
    return { success: false };
  }
}

export async function deleteMediaAction(id: string) {
  try {
    await mediaRepository.delete(id);

    // Odświeżamy wszystko
    revalidatePaths();

    return { success: true };
  } catch (error) {
    console.error('Błąd usuwania:', error);
    return { success: false, error: 'Nie udało się usunąć elementu' };
  }
}
