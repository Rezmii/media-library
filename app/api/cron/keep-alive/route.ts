import { NextResponse } from 'next/server';

import { mediaRepository } from '@/lib/db/media-repository';

// Vercel Cron uderza w ten endpoint zgodnie z harmonogramem w vercel.json.
// Przy każdym wywołaniu Vercel automatycznie dokleja nagłówek
// `Authorization: Bearer ${CRON_SECRET}` (jeśli zmienna jest ustawiona w ENV),
// dzięki czemu endpoint jest niedostępny publicznie.
//
// Cel: realne (choć minimalne) zapytanie do Postgresa, żeby Supabase
// zarejestrował aktywność i nie spauzował projektu po 7 dniach bezruchu.

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const itemCount = await mediaRepository.count();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      itemCount,
    });
  } catch (error) {
    console.error('Keep-alive: błąd zapytania do bazy', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
