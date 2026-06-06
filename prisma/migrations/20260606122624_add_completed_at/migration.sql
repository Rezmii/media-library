-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- Backfill: dla istniejacych ukonczonych pozycji ustaw date ukonczenia na
-- date ostatniej aktualizacji (updatedAt). Data dodania (createdAt) zostaje
-- nietknieta. Pozycje nie-ukonczone maja completedAt NULL.
UPDATE "MediaItem" SET "completedAt" = "updatedAt" WHERE "status" = 'COMPLETED';
