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
};

export const mediaRepository = {
  // Pobieranie wszystkich elementów (z opcją filtrowania w przyszłości)
  getAll: async (type?: MediaType) => {
    return await db.mediaItem.findMany({
      where: type ? { type } : undefined,
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Dodawanie nowego elementu
  create: async (data: CreateMediaInput) => {
    return await db.mediaItem.create({
      data: {
        title: data.title,
        type: data.type,
        coverUrl: data.coverUrl,
        metadata: data.metadata ?? Prisma.JsonNull,
        status: Status.BACKLOG,
        tags: {
          connectOrCreate: data.tags?.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
  },

  // Zmiana statusu
  updateStatus: async (id: string, status: Status) => {
    return await db.mediaItem.update({
      where: { id },
      data: { status },
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
};
