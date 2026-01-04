'use client';

import { useState } from 'react';

import Image from 'next/image';

import { updateMediaDetailsAction } from '@/actions/media-actions';
import {
  AlignLeft,
  BookOpen,
  Calendar,
  Clock,
  Disc,
  ExternalLink,
  Mic2,
  Music2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { MediaBadge } from './media-badge';
import { StarRating } from './star-rating';
import { StatusSelector } from './status-selector';

interface MediaDetailsDialogProps {
  item: UnifiedMediaItem;
  children: React.ReactNode;
}

export function MediaDetailsDialog({ item, children }: MediaDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(item.note || '');
  const [rating, setRating] = useState(item.rating || 0);
  const [isSaving, setIsSaving] = useState(false);

  const description =
    item.metadata?.overview || item.metadata?.description || 'Brak opisu dla tego elementu.';

  const heroImage = item.metadata?.backdropUrl || item.coverUrl;

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateMediaDetailsAction(item.externalId, rating, note);
    setIsSaving(false);

    if (result.success) {
      toast.success('Zapisano zmiany');
      setOpen(false);
    } else {
      toast.error('Błąd zapisu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>

      <DialogContent className="flex h-[95vh] w-[95vw] flex-col gap-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 md:h-[80vh] md:w-[80vw] md:max-w-[80vw] md:flex-row">
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        <div className="relative h-48 w-full shrink-0 bg-zinc-900 md:h-full md:w-[40%] lg:w-[35%]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={item.title}
              fill
              className="object-cover opacity-90 md:opacity-100"
              unoptimized={heroImage.includes('google')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xl font-bold text-zinc-700">
              Brak zdjęcia
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:hidden" />
        </div>

        <div className="relative flex h-full flex-1 flex-col overflow-hidden">
          {/* Scrollowalna zawartość */}
          <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6 md:p-10">
            {/* 1. Header */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                {/* Badge i Status */}
                <div className="flex items-center gap-3">
                  <MediaBadge type={item.type} className="px-3 py-1 text-sm" />
                  {item.isAdded && (
                    <StatusSelector id={item.externalId} currentStatus={item.status || 'BACKLOG'} />
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-3xl leading-tight font-black tracking-tight text-zinc-100 md:text-5xl">
                  {item.title}
                </h2>

                {item.metadata.originalTitle && item.metadata.originalTitle !== item.title && (
                  <p className="mb-3 text-lg text-zinc-500 italic">{item.metadata.originalTitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-base text-zinc-400">
                  {item.releaseDate && (
                    <span className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1">
                      <Calendar className="h-4 w-4" />
                      {item.releaseDate}
                    </span>
                  )}
                  {item.metadata.tmdbRating && (
                    <span className="flex items-center gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 font-bold text-yellow-500">
                      {item.metadata.tmdbRating}
                    </span>
                  )}

                  {item.metadata.googleRating && (
                    <span className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 font-bold text-zinc-200">
                      <span className="mr-1 text-xs text-zinc-500 uppercase">Google</span>
                      <span className="text-lg text-zinc-300">{item.metadata.googleRating}</span>
                      <span className="text-xs text-zinc-500">/5</span>
                    </span>
                  )}

                  {item.metadata.pageCount > 0 && (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <BookOpen className="h-4 w-4" />
                      {item.metadata.pageCount} str.
                    </span>
                  )}

                  {item.metadata.totalTracks && (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Disc className="h-4 w-4" />
                      {item.metadata.totalTracks} utw.
                    </span>
                  )}

                  {item.metadata.metacritic && (
                    <span className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1">
                      <span className="mr-1 text-sm uppercase">Metascore</span>
                      <span
                        className={cn(
                          'text-lg',
                          item.metadata.metacritic >= 80
                            ? 'text-emerald-500'
                            : item.metadata.metacritic >= 60
                              ? 'text-yellow-500'
                              : 'text-red-500'
                        )}
                      >
                        {item.metadata.metacritic}
                      </span>
                    </span>
                  )}
                  {item.metadata.playtime > 0 && (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Clock className="h-4 w-4" />
                      {item.metadata.playtime}h
                    </span>
                  )}
                  <span className="font-medium text-zinc-300">
                    {item.type === 'GAME' && (item.metadata.platforms as string[])?.join(', ')}
                    {item.type === 'BOOK' && item.metadata.author}
                    {item.type === 'ALBUM' && item.metadata.artist}
                  </span>
                </div>
              </div>
              {item.type === 'ALBUM' && (
                <div className="mt-6 space-y-4">
                  {/* Link do Spotify */}
                  {item.metadata.spotifyUrl && (
                    <div className="pt-2">
                      <a
                        href={item.metadata.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-[#1DB954] transition-colors hover:text-[#1ed760]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Otwórz w Spotify
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-px w-full bg-zinc-800/50" />

            {/* 2. Opis */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-200">
                <AlignLeft className="h-5 w-5 text-emerald-500" /> O tym tytule
              </h3>
              <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
                {description}
              </p>
            </div>

            {/* 3. Sekcja Użytkownika */}
            {item.isAdded ? (
              <div className="mt-8 space-y-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                      Twoja Ocena
                    </label>
                    <div className="origin-left scale-110">
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                    Prywatna Notatka
                  </label>
                  <Textarea
                    placeholder="Tutaj możesz zapisać swoje przemyślenia, postępy lub recenzję..."
                    className="min-h-[120px] resize-none border-zinc-800 bg-zinc-950 text-base focus:border-emerald-500/50"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-6 py-10 text-center text-blue-200">
                Dodaj ten element do biblioteki, aby odblokować notatki i oceny.
              </div>
            )}

            <div className="h-10" />
          </div>

          {item.isAdded && (
            <div className="flex justify-end border-t border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="gap-2 bg-emerald-600 px-8 text-base font-semibold text-white hover:bg-emerald-700"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
