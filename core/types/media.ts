import { MediaType } from '@prisma/client';

export interface UnifiedMediaItem {
  externalId: string;
  title: string;
  coverUrl: string | null;
  type: MediaType;
  releaseDate?: string;
  metadata: Record<string, any>;
  isAdded?: boolean;
  popularityScore?: number;
}
