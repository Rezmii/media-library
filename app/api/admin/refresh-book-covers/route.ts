import { NextResponse } from 'next/server';

import { revalidatePath } from 'next/cache';

import { mediaRepository } from '@/lib/db/media-repository';

// Wchodzisz na: http://localhost:3000/api/admin/refresh-book-covers
// (lub https://media-library-hazel.vercel.app/api/admin/refresh-book-covers w produkcji)

function upgradeZoom(url: string): string {
  if (/[?&]zoom=\d+/.test(url)) {
    return url.replace(/([?&])zoom=\d+/, '$1zoom=3');
  }
  return url + (url.includes('?') ? '&' : '?') + 'zoom=3';
}

export async function GET() {
  try {
    const books = await mediaRepository.getAll('BOOK');
    let updated = 0;
    let skipped = 0;

    for (const book of books) {
      if (!book.coverUrl || !book.coverUrl.includes('books.google.')) {
        skipped++;
        continue;
      }

      const newUrl = upgradeZoom(book.coverUrl);
      if (newUrl === book.coverUrl) {
        skipped++;
        continue;
      }

      await mediaRepository.updateCoverUrl(book.id, newUrl);
      updated++;
    }

    revalidatePath('/');
    revalidatePath('/books');

    return NextResponse.json({
      message: 'Refresh okładek zakończony',
      total: books.length,
      updated,
      skipped,
    });
  } catch (error) {
    console.error('Błąd refreshu okładek:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
