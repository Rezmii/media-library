// lib/db/media-repository.ts
import { MediaType, Prisma, PrismaClient, Status } from '@prisma/client';

// Singleton dla Prismy (zapobiega tworzeniu wielu połączeń w dev mode)
const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;

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
  getAll: async () => {
    return await db.mediaItem.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        updatedAt: 'desc',
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
        status: Status.BACKLOG, // Domyślnie wpada do "Do zrobienia"
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
};
