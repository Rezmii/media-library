import { MediaItem, Tag } from '@prisma/client';

type DbItem = MediaItem & { tags?: Tag[] };

export interface MiniItem {
  id: string;
  title: string;
  coverUrl: string | null;
  rating: number | null;
  type: string;
}

export interface LibraryStats {
  year: number;

  total: number;
  perType: { type: string; count: number }[];
  perStatus: { status: string; count: number }[];

  completedTotal: number;
  completedThisYear: number;

  ratedCount: number;
  avgRating: number | null;
  ratingHistogram: { stars: number; count: number }[]; // 1..5

  topTags: { tag: string; count: number }[];

  totalGameHours: number;
  totalBookPages: number;
  gameHoursThisYear: number;
  bookPagesThisYear: number;

  topRatedThisYear: MiniItem[];
}

const TYPE_ORDER = ['GAME', 'MOVIE', 'SERIES', 'BOOK', 'ALBUM'];
const STATUS_ORDER = ['IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'BACKLOG'];

function meta(item: DbItem): Record<string, unknown> {
  return (item.metadata as Record<string, unknown>) || {};
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function computeLibraryStats(items: DbItem[], currentYear: number): LibraryStats {
  const perTypeMap: Record<string, number> = {};
  const perStatusMap: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let ratedCount = 0;
  let ratingSum = 0;
  let completedTotal = 0;
  let completedThisYear = 0;
  let totalGameHours = 0;
  let totalBookPages = 0;
  let gameHoursThisYear = 0;
  let bookPagesThisYear = 0;

  const completedThisYearItems: DbItem[] = [];

  for (const item of items) {
    perTypeMap[item.type] = (perTypeMap[item.type] || 0) + 1;
    perStatusMap[item.status] = (perStatusMap[item.status] || 0) + 1;

    item.tags?.forEach((t) => {
      tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
    });

    if (typeof item.rating === 'number' && item.rating >= 1 && item.rating <= 5) {
      ratingCounts[item.rating] += 1;
      ratedCount += 1;
      ratingSum += item.rating;
    }

    const m = meta(item);
    const playtime = item.type === 'GAME' ? num(m.playtime) : 0;
    const pages = item.type === 'BOOK' ? num(m.pageCount) : 0;
    totalGameHours += playtime;
    totalBookPages += pages;

    const isCompleted = item.status === 'COMPLETED';
    const completedInYear = isCompleted && item.completedAt?.getFullYear() === currentYear;

    if (isCompleted) completedTotal += 1;
    if (completedInYear) {
      completedThisYear += 1;
      gameHoursThisYear += playtime;
      bookPagesThisYear += pages;
      completedThisYearItems.push(item);
    }
  }

  const perType = TYPE_ORDER.filter((t) => perTypeMap[t]).map((type) => ({
    type,
    count: perTypeMap[type],
  }));

  const perStatus = STATUS_ORDER.filter((s) => perStatusMap[s]).map((status) => ({
    status,
    count: perStatusMap[status],
  }));

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 12);

  const ratingHistogram = [1, 2, 3, 4, 5].map((stars) => ({ stars, count: ratingCounts[stars] }));

  const topRatedThisYear: MiniItem[] = completedThisYearItems
    .filter((i) => typeof i.rating === 'number' && i.rating >= 4)
    .sort((a, b) => {
      const r = (b.rating ?? 0) - (a.rating ?? 0);
      if (r !== 0) return r;
      return (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0);
    })
    .slice(0, 10)
    .map((i) => ({
      id: i.id,
      title: i.title,
      coverUrl: i.coverUrl,
      rating: i.rating,
      type: i.type,
    }));

  return {
    year: currentYear,
    total: items.length,
    perType,
    perStatus,
    completedTotal,
    completedThisYear,
    ratedCount,
    avgRating: ratedCount > 0 ? ratingSum / ratedCount : null,
    ratingHistogram,
    topTags,
    totalGameHours,
    totalBookPages,
    gameHoursThisYear,
    bookPagesThisYear,
    topRatedThisYear,
  };
}

// --- Pomocnicze etykiety (PL) ---

export const TYPE_LABELS: Record<string, string> = {
  GAME: 'Gry',
  MOVIE: 'Filmy',
  SERIES: 'Seriale',
  BOOK: 'Książki',
  ALBUM: 'Albumy',
};

export const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'W trakcie',
  COMPLETED: 'Ukończone',
  ABANDONED: 'Porzucone',
  BACKLOG: 'Backlog',
};

export const MONTH_LABELS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];
