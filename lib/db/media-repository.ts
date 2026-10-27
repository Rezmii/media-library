// lib/db/media-repository.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { MediaType, Prisma, PrismaClient, Status } from '@prisma/client';

import { sortTimestamp } from '@/core/activity';

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

    // Sortowanie malejaco po sortTimestamp (patrz core/activity.ts):
    // - recznie przeciagnieta pozycja -> orderAt,
    // - w przeciwnym razie max(createdAt, completedAt, lastProgressAt).
    // Ukonczenie / nowy sezon czyszcza orderAt, wiec i tak wypychaja na gore.
    // Edycje (ulubione/ocena/notatka) nie ruszaja zadnej z tych dat.
    // Drugorzedny klucz: stabilne id (UUID), malejaco.
    return items.sort((a, b) => {
      const diff = sortTimestamp(b) - sortTimestamp(a);
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

  // Zmiana statusu. Przy przejsciu na COMPLETED ustawiamy completedAt=now() i
  // czyscimy reczna pozycje (orderAt), wiec element wskakuje na gore. Cofniecie
  // statusu z COMPLETED czysci completedAt. createdAt NIE jest ruszany.
  updateStatus: async (id: string, status: Status) => {
    const completed = status === 'COMPLETED';
    return await db.mediaItem.update({
      where: { id },
      data: {
        status,
        completedAt: completed ? new Date() : null,
        ...(completed && { orderAt: null }),
      },
    });
  },

  // Reczna kolejnosc z przeciagania: zapis wielu znacznikow w jednej transakcji.
  setOrderAt: async (updates: { id: string; orderAt: Date }[]) => {
    return db.$transaction(
      updates.map((u) =>
        db.mediaItem.update({
          where: { id: u.id },
          data: { orderAt: u.orderAt },
        })
      )
    );
  },

  updateDetails: async (id: string, data: { rating: number | null; note: string | null }) => {
    return db.mediaItem.update({
      where: { id },
      data: {
        // 0 = "brak oceny" (domyslna wartosc gwiazdek w modalu) -> zapisujemy null
        rating: data.rating && data.rating > 0 ? data.rating : null,
        note: data.note,
      },
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

  updateCompletedSeasons: async (id: string, completedSeasons: number[], markProgress = true) => {
    const item = await db.mediaItem.findUnique({ where: { id } });
    if (!item) return;

    const metadata = (item.metadata as Record<string, any>) || {};
    const previous: number[] = Array.isArray(metadata.completedSeasons)
      ? metadata.completedSeasons
      : [];

    // Zaznaczenie NOWEGO sezonu = postep -> serial wskakuje na gore list
    // (odznaczenie sezonu nie przesuwa pozycji). Postep czysci tez reczna
    // pozycje z przeciagania.
    const progressed = markProgress && completedSeasons.some((n) => !previous.includes(n));
    if (progressed) {
      metadata.lastProgressAt = new Date().toISOString();
    }
    metadata.completedSeasons = completedSeasons;

    return db.mediaItem.update({
      where: { id },
      data: { metadata, ...(progressed && { orderAt: null }) },
    });
  },

  // Niestandardowe flagi trzymane w metadata.flags. value=true ustawia,
  // value=false usuwa klucz (brak = wylaczona).
  updateFlag: async (id: string, flagKey: string, value: boolean) => {
    const item = await db.mediaItem.findUnique({ where: { id } });
    if (!item) return;

    const metadata = (item.metadata as Record<string, any>) || {};
    const flags = { ...(metadata.flags || {}) };
    if (value) {
      flags[flagKey] = true;
    } else {
      delete flags[flagKey];
    }
    metadata.flags = flags;

    return db.mediaItem.update({
      where: { id },
      data: { metadata },
    });
  },
};
