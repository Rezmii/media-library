// config/nav.ts
import { BookOpen, Disc, Film, Gamepad2, LayoutGrid, Settings, Tags } from 'lucide-react';

export const navItems = [
  {
    title: 'Biblioteka',
    items: [
      {
        title: 'Wszystko',
        href: '/',
        icon: LayoutGrid,
      },
      {
        title: 'Gry',
        href: '/games',
        icon: Gamepad2,
      },
      {
        title: 'Filmy i Seriale',
        href: '/movies',
        icon: Film,
      },
      {
        title: 'Książki',
        href: '/books',
        icon: BookOpen,
      },
      {
        title: 'Muzyka',
        href: '/music',
        icon: Disc,
      },
    ],
  },
  {
    title: 'Inne',
    items: [
      {
        title: 'Kategorie / Tagi',
        href: '/tags',
        icon: Tags,
      },
      {
        title: 'Ustawienia',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];
