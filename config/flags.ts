import { BookMarked, Ticket, Users, type LucideIcon } from 'lucide-react';

// Niestandardowe "flagi" (kategorie) przypinane do pozycji per typ medium.
// Przechowywane w metadata.flags: { [key]: true }. Brak klucza = flaga wylaczona.

export interface FlagDef {
  key: string;
  label: string; // wariant "posiada" (np. "Z Blanką")
  labelNeg: string; // wariant "nie posiada" (np. "Bez Blanki") — do filtra
  description: string; // opis w tooltipie (fallback, np. w filtrze przy widoku mieszanym)
  descriptionByType?: Record<string, string>; // opis zalezny od typu medium
  icon: LucideIcon;
  types: string[]; // typy mediow, ktorych dotyczy
}

export const MEDIA_FLAGS: FlagDef[] = [
  {
    key: 'withBox',
    label: 'Z Blanką',
    labelNeg: 'Bez Blanki',
    description: 'Obejrzane / ograne razem z Blanką.',
    descriptionByType: {
      GAME: 'Ograne razem z Blanką.',
      MOVIE: 'Obejrzane razem z Blanką.',
      SERIES: 'Obejrzane razem z Blanką.',
    },
    icon: Users,
    types: ['GAME', 'MOVIE', 'SERIES'],
  },
  {
    key: 'inCinema',
    label: 'W kinie',
    labelNeg: 'Nie w kinie',
    description: 'Obejrzane na dużym ekranie w kinie.',
    icon: Ticket,
    types: ['MOVIE'],
  },
  {
    key: 'physical',
    label: 'Wersja fizyczna',
    labelNeg: 'Wersja cyfrowa',
    description: 'Papierowa książka, a nie ebook.',
    icon: BookMarked,
    types: ['BOOK'],
  },
];

export function flagsForType(type: string): FlagDef[] {
  return MEDIA_FLAGS.filter((f) => f.types.includes(type));
}
