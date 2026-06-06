// lib/db/media-repository.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { MediaType, Prisma, PrismaClient, Status } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// --- REPOZYTORIUM ---

export type CreateMediaInput = {
  title: string;
  type: MediaType;
  coverUrl?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt?: Date;
};

export const mediaRepository = {
  // Pobieranie wszystkich elementów (z opcją filtrowania w przyszłości)
  getAll: async (type?: MediaType) => {
    const items = await db.mediaItem.findMany({
      where: type ? { type } : undefined,
      include: {
        tags: true,
      },
    });

    // Sortowanie po "dacie aktywnosci" = GREATEST(createdAt, completedAt) malejaco.
    // - Ukonczenie ustawia completedAt=now() -> element wskakuje na gore.
    // - Edycje (ulubione/ocena/notatka) NIE ruszaja zadnej z tych dat -> brak
    //   przeskokow.
    // - GREATEST gwarantuje, ze element nigdy nie zatonie ponizej swojej daty
    //   dodania (chroni recznie ustawiona kolejnosc starych pozycji).
    // Drugorzedny klucz: stabilne id (UUID).
    const activity = (item: (typeof items)[number]) =>
      Math.max(item.createdAt.getTime(), item.completedAt?.getTime() ?? 0);

    return items.sort((a, b) => {
      const diff = activity(b) - activity(a);
      if (diff !== 0) return diff;
      return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
    });
  },

  // Dodawanie nowego elementu
  create: async (data: CreateMediaInput) => {
    const defaultStatus = data.type === 'MOVIE' ? Status.COMPLETED : Status.IN_PROGRESS;
    return await db.mediaItem.create({
      data: {
        title: data.title,
        type: data.type,
        coverUrl: data.coverUrl,
        metadata: data.metadata ?? Prisma.JsonNull,
        status: defaultStatus,
        createdAt: data.createdAt,
        tags: {
          connectOrCreate: data.tags?.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
  },

  // Zmiana statusu. Przy przejsciu na COMPLETED ustawiamy completedAt=now()
  // (element wskakuje na gore wg "daty aktywnosci"). Cofniecie statusu z
  // COMPLETED czysci completedAt (null). createdAt NIE jest ruszany.
  updateStatus: async (id: string, status: Status) => {
    return await db.mediaItem.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });
  },

  updateDetails: async (id: string, data: { rating: number | null; note: string | null }) => {
    return db.mediaItem.update({
      where: { id },
      data: {
        rating: data.rating,
        note: data.note,
      },
    });
  },

  updateCoverUrl: async (id: string, coverUrl: string) => {
    return db.mediaItem.update({
      where: { id },
      data: { coverUrl },
    });
  },

  addTag: async (mediaId: string, tagName: string) => {
    return db.mediaItem.update({
      where: { id: mediaId },
      data: {
        tags: {
          connectOrCreate: {
            where: { name: tagName },
            create: { name: tagName },
          },
        },
      },
    });
  },

  removeTag: async (mediaId: string, tagName: string) => {
    return db.mediaItem.update({
      where: { id: mediaId },
      data: {
        tags: {
          disconnect: { name: tagName },
        },
      },
    });
  },

  delete: async (id: string) => {
    return db.mediaItem.delete({
      where: { id },
    });
  },

  toggleFavorite: async (id: string, isFavorite: boolean) => {
    return db.mediaItem.update({
      where: { id },
      data: { isFavorite },
    });
  },

  updateCompletedSeasons: async (id: string, completedSeasons: number[]) => {
    const item = await db.mediaItem.findUnique({ where: { id } });
    if (!item) return;

    const metadata = (item.metadata as Record<string, any>) || {};
    metadata.completedSeasons = completedSeasons;

    return db.mediaItem.update({
      where: { id },
      data: { metadata },
    });
  },
};
