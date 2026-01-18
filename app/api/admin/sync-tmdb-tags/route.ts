import { NextResponse } from 'next/server';

import { MediaType } from '@prisma/client';

import { tmdbClient } from '@/lib/api-clients/tmdb';
import { mediaRepository } from '@/lib/db/media-repository';

// Uruchomienie: http://localhost:3000/api/admin/sync-tmdb-tags
export async function GET() {
  try {
    console.log('🎬 Rozpoczynam synchronizację tagów TMDB (Filmy i Seriale)...');

    // 1. Pobierz wszystkie filmy i seriale
    const movies = await mediaRepository.getAll('MOVIE');
    const series = await mediaRepository.getAll('SERIES');

    // Łączymy w jedną listę do przetworzenia
    const allItems = [...movies, ...series];

    let updatedCount = 0;
    let errorsCount = 0;
    let skippedCount = 0;

    console.log(`📊 Znaleziono łącznie ${allItems.length} elementów.`);

    // 2. Iteracja
    for (const item of allItems) {
      const meta = item.metadata as any;
      const tmdbId = meta.externalId; // Czasem ID jest tu, czasem tu

      if (!tmdbId) {
        console.log(`⚠️ Pomijam "${item.title}" - brak externalId.`);
        skippedCount++;
        continue;
      }

      // Symulujemy opóźnienie 250ms, żeby nie przekroczyć limitów API TMDB
      await new Promise((r) => setTimeout(r, 250));

      console.log(`🔍 Pobieram dane dla: [${item.type}] "${item.title}"...`);

      try {
        // Upewniamy się, że typ jest poprawny dla klienta TMDB
        const typeForClient = item.type === 'MOVIE' || item.type === 'SERIES' ? item.type : 'MOVIE'; // Fallback, choć nie powinien wystąpić

        const details = await tmdbClient.getDetails(tmdbId, typeForClient);

        if (details) {
          const newTags = new Set<string>();

          // A. Gatunki
          if (details.genres) {
            details.genres.forEach((g) => newTags.add(g));
          }

          // B. Reżyser (tylko filmy)
          if (details.director) {
            newTags.add(details.director);
          }

          // C. Aktorzy (Top 5)
          if (details.cast) {
            details.cast.slice(0, 5).forEach((actor) => newTags.add(actor.name));
          }

          // 3. Zapisz tagi w bazie
          if (newTags.size > 0) {
            for (const tagName of Array.from(newTags)) {
              // Dodajemy tag (funkcja addTag w repo sama dba o unikalność)
              await mediaRepository.addTag(item.id, tagName);
            }
            updatedCount++;
          } else {
            console.log(`ℹ️ Brak nowych tagów dla "${item.title}"`);
          }
        } else {
          console.error(`❌ API TMDB nie zwróciło danych dla "${item.title}" (ID: ${tmdbId})`);
          errorsCount++;
        }
      } catch (err) {
        console.error(`❌ Błąd przetwarzania "${item.title}":`, err);
        errorsCount++;
      }
    }

    // 4. Podsumowanie
    return NextResponse.json({
      message: 'Synchronizacja TMDB zakończona',
      summary: {
        totalProcessed: allItems.length,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errorsCount,
      },
    });
  } catch (error) {
    console.error('Błąd krytyczny skryptu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
