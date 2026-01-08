import Link from 'next/link';

import { navItems } from '@/config/nav';
import { ArrowRight, LayoutGrid, Sparkles } from 'lucide-react';

import { mapDatabaseItemToUnified } from '@/core/mappers/media-mapper';

import { mediaRepository } from '@/lib/db/media-repository';
import { cn } from '@/lib/utils';

import { DashboardHeader } from '@/components/domain/dashboard-header';
import { MediaCard } from '@/components/domain/media-card';
import { MediaDetailsDialog } from '@/components/domain/media-details-dialog';
import { Separator } from '@/components/ui/separator';

// Potrzebne do warunkowych klas

export default async function Dashboard() {
  const dbItems = await mediaRepository.getAll();
  const items = dbItems.map(mapDatabaseItemToUnified);

  // ZMIANA 1: Pobieramy 6 elementów, żeby móc zrobić układ 3+3 na średnich ekranach
  const latestItems = items.slice(0, 6);

  const categories = navItems
    .flatMap((group) => group.items)
    .filter((item) => item.href !== '/' && item.href !== '/settings');

  return (
    <div className="animate-in fade-in space-y-12 duration-500">
      <DashboardHeader
        title="Biblioteka"
        count={items.length}
        icon={<LayoutGrid className="h-8 w-8" />}
      />

      {items.length > 0 && (
        <section className="space-y-6">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Ostatnio dodane
          </div>

          {/* ZMIANA 2: Responsywny Grid 
             - Mobile: 1 kolumna
             - SM: 2 kolumny (dla 6 elementów -> 3 rzędy)
             - LG: 3 kolumny (dla 6 elementów -> 2 rzędy)
             - XL: 5 kolumn (dla 5 elementów -> 1 rząd)
          */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {latestItems.map((item, index) => {
              // ZMIANA 3: Ukrywanie 6-tego elementu na Mobile i XL
              // - hidden sm:block -> ukryty na mobile, widoczny od SM w górę
              // - xl:hidden -> ukryty ponownie na XL (bo tam chcemy tylko 5)
              const isSixthItem = index === 5;

              return (
                <div
                  key={item.externalId}
                  className={cn(isSixthItem && 'hidden sm:block xl:hidden')}
                >
                  <MediaDetailsDialog item={item}>
                    <MediaCard item={item} isAdded={true} />
                  </MediaDetailsDialog>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* DIVIDER */}
      <Separator className="bg-zinc-800" />

      {/* SEKCJA 2: KAFELKI KATEGORII */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-zinc-200">Przeglądaj kategorie</h3>

        {/* ZMIANA 4: Grid dla kategorii
            - SM/LG: 2 lub 3 kolumny (zeby pomiescic 6 elementow włącznie z tagami)
            - XL: 5 kolumn (tylko główne kategorie)
        */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;

            // Sprawdzamy czy to kategoria "Tagi" (po href lub tytule)
            // Zakładam, że masz link do tagów w navItems, np. /tags lub href zawiera 'tags'
            const isTagsCategory =
              category.href.includes('tags') || category.title.toLowerCase() === 'tagi';

            let count = 0;
            if (category.href.includes('games'))
              count = items.filter((i) => i.type === 'GAME').length;
            else if (category.href.includes('movies'))
              count = items.filter((i) => i.type === 'MOVIE').length;
            else if (category.href.includes('books'))
              count = items.filter((i) => i.type === 'BOOK').length;
            else if (category.href.includes('music'))
              count = items.filter((i) => i.type === 'ALBUM').length;
            else if (category.href.includes('series'))
              count = items.filter((i) => i.type === 'SERIES').length;

            return (
              <Link
                key={category.href}
                href={category.href}
                // ZMIANA 5: Ukrywamy "Tagi" na ekranach XL (xl:hidden)
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:scale-[1.02] hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl',
                  isTagsCategory && 'xl:hidden'
                )}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-zinc-950 p-3 ring-1 ring-white/5 transition-colors group-hover:bg-black group-hover:text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 -translate-x-2 text-zinc-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>

                <div>
                  <h4 className="mb-1 text-lg font-bold text-zinc-100 group-hover:text-white">
                    {category.title}
                  </h4>
                  <p className="text-sm font-medium text-zinc-500">
                    {/* Dla tagów nie liczymy elementów w ten sposób, chyba że masz logikę */}
                    {isTagsCategory
                      ? 'Przeglądaj'
                      : `${count} ${count === 1 ? 'element' : 'elementów'}`}
                  </p>
                </div>

                <div className="bg-primary/5 group-hover:bg-primary/10 absolute -right-12 -bottom-12 h-32 w-32 rounded-full blur-3xl transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
