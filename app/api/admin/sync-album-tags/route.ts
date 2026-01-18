import { NextResponse } from 'next/server';

import { spotifyClient } from '@/lib/api-clients/spotify';
import { mediaRepository } from '@/lib/db/media-repository';

// Ten endpoint uruchomisz wchodząc na: http://localhost:3000/api/admin/sync-album-tags
export async function GET() {
  try {
    console.log('🔄 Rozpoczynam synchronizację tagów albumów...');

    // 1. Pobierz wszystkie albumy z bazy
    const albums = await mediaRepository.getAll('ALBUM');
    let updatedCount = 0;
    let errorsCount = 0;

    // 2. Iteruj po albumach
    for (const album of albums) {
      const meta = album.metadata as any;

      // Sprawdź czy mamy ID ze Spotify
      const spotifyId = meta.externalId;
      if (!spotifyId) {
        console.log(`⚠️ Pomijam "${album.title}" - brak externalId w metadanych.`);
        continue;
      }

      // 3. Pobierz detale ze Spotify
      // Dodajemy małe opóźnienie, żeby nie zabić API (Rate Limiting)
      await new Promise((r) => setTimeout(r, 200));

      console.log(`🎵 Pobieram dane dla: "${album.title}"...`);
      const details = await spotifyClient.getAlbumDetails(spotifyId);

      if (details) {
        // Zbieramy tagi: Gatunki + Artysta
        const newTags = new Set<string>();

        // Gatunki
        if (details.genres) {
          details.genres.forEach((g) => newTags.add(g));
        }

        // Artysta (z metadanych bazy)
        if (meta.artist) {
          newTags.add(meta.artist);
        }

        // 4. Zapisz tagi w bazie
        if (newTags.size > 0) {
          const tagsArray = Array.from(newTags);

          // Używamy for...of żeby dodać każdy tag
          for (const tagName of tagsArray) {
            await mediaRepository.addTag(album.id, tagName);
          }
          updatedCount++;
        }
      } else {
        console.error(`❌ Błąd pobierania danych dla "${album.title}"`);
        errorsCount++;
      }
    }

    return NextResponse.json({
      message: 'Synchronizacja zakończona',
      totalAlbums: albums.length,
      updated: updatedCount,
      errors: errorsCount,
    });
  } catch (error) {
    console.error('Błąd krytyczny skryptu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
