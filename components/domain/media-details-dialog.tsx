'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { updateMediaDetailsAction } from '@/actions/media-actions';
import { getMediaDetailsAction } from '@/actions/media-actions';
import {
  AlignLeft,
  BookOpen,
  Calendar,
  CalendarPlus,
  Clapperboard,
  Clock,
  Disc,
  ExternalLink,
  ListMusic,
  Loader2,
  Plus,
  Save,
  Tv,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { UnifiedMediaDetails, UnifiedMediaItem } from '@/core/types/media';

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

import { AddAlbumAlert } from './add-album-alert';
import { DeleteMediaButton } from './delete-media-button';
import { MediaBadge } from './media-badge';
import { StarRating } from './star-rating';
import { StatusSelector } from './status-selector';
import { TagManager } from './tag-manager';

interface MediaDetailsDialogProps {
  item: UnifiedMediaItem;
  children: React.ReactNode;
  onAdd?: (item: UnifiedMediaItem, isBacklog: boolean) => void;
}

export function MediaDetailsDialog({ item, children, onAdd }: MediaDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(item.note || '');
  const [rating, setRating] = useState(item.rating || 0);
  const [isSaving, setIsSaving] = useState(false);

  const [details, setDetails] = useState<UnifiedMediaDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (open && !details) {
      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        const cleanId = item.isAdded ? item.metadata?.externalId : item.externalId;
        if (cleanId) {
          const res = await getMediaDetailsAction(cleanId, item.type);
          if (res.success && res.data) {
            setDetails(res.data);
          }
        }
        setIsLoadingDetails(false);
      };
      fetchDetails();
    }
  }, [open, item.type, item.externalId, item.isAdded, item.metadata]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const description =
    item.metadata?.overview || item.metadata?.description || 'Brak opisu dla tego elementu.';

  const heroImage = item.metadata?.backdropUrl || item.coverUrl;

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);

    const result = await updateMediaDetailsAction(item.externalId, newRating, note);

    if (result.success) {
      toast.success('Zaktualizowano ocenę');
    } else {
      toast.error('Błąd zapisu oceny');
      setRating(item.rating || 0);
    }
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    const result = await updateMediaDetailsAction(item.externalId, rating, note);
    setIsSaving(false);

    if (result.success) {
      toast.success('Zapisano zmiany');
    } else {
      toast.error('Błąd zapisu');
    }
  };

  const handleAddFromModal = async (isBacklog: boolean = false) => {
    if (onAdd) {
      setIsSaving(true);
      await onAdd(item, isBacklog);
      setIsSaving(false);
      setOpen(false);
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
              unoptimized
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
                    <span
                      className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1"
                      title="Data premiery"
                    >
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      {item.releaseDate}
                    </span>
                  )}

                  {item.isAdded && item.addedAt && (
                    <span
                      className="flex items-center gap-2 rounded-md border border-emerald-900/30 bg-emerald-950/30 px-3 py-1 text-emerald-200/80"
                      title="Data dodania do biblioteki"
                    >
                      <CalendarPlus className="h-4 w-4 text-emerald-500" />
                      {item.addedAt}
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

            {item.type === 'ALBUM' && (
              <div className="mt-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-200">
                  <ListMusic className="h-5 w-5 text-emerald-500" /> Lista utworów
                </h3>

                {isLoadingDetails ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                  </div>
                ) : details ? (
                  <div className="flex flex-col gap-1">
                    {details.tracks?.map((track, index) => (
                      <div
                        key={index}
                        className="group flex items-start justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-900/50"
                      >
                        <div className="flex gap-3">
                          <span className="w-5 text-right font-mono text-zinc-600">
                            {index + 1}.
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-300">{track.title}</span>
                            {track.features.length > 0 && (
                              <span className="text-xs text-zinc-500">
                                feat. {track.features.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-zinc-600 group-hover:text-zinc-400">
                          {formatTime(track.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">
                    Nie udało się pobrać listy utworów.
                  </p>
                )}
              </div>
            )}

            {(item.type === 'MOVIE' || item.type === 'SERIES') && details && (
              <div className="mt-8 space-y-8">
                {/* 1. INFORMACJE OGÓLNE (Reżyser / Czas) */}
                <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
                  {/* Reżyser (tylko filmy) */}
                  {details.director && (
                    <div className="flex items-center gap-2">
                      <Clapperboard className="h-5 w-5 text-emerald-500" />
                      <span className="text-zinc-500">Reżyseria:</span>
                      <span className="font-medium text-zinc-200">{details.director}</span>
                    </div>
                  )}

                  {/* Czas trwania */}
                  {item.type === 'MOVIE' && details.runtime && details.runtime > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium text-zinc-200">
                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. SEZONY (Tylko Seriale) */}
                {item.type === 'SERIES' && details.seasons && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-200">
                      <Tv className="h-5 w-5 text-emerald-500" /> Sezony
                    </h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {details.seasons.map((season) => (
                        <div
                          key={season.name}
                          className="flex gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-2"
                        >
                          {season.posterUrl ? (
                            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
                              <Image
                                src={season.posterUrl}
                                alt={season.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-12 shrink-0 rounded bg-zinc-800" />
                          )}
                          <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-zinc-200">{season.name}</span>
                            <span className="text-xs text-zinc-500">
                              {season.episodeCount} odc. • {season.airDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. OBSADA (Filmy i Seriale) */}
                {details.cast && details.cast.length > 0 && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-200">
                      <Users className="h-5 w-5 text-emerald-500" /> Obsada
                    </h3>

                    {/* Grid aktorów */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {details.cast.map((actor) => (
                        <div
                          key={actor.name}
                          className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900"
                        >
                          {actor.photoUrl ? (
                            <Image
                              src={actor.photoUrl}
                              alt={actor.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-zinc-800 text-zinc-700">
                              Brak foto
                            </div>
                          )}

                          {/* Overlay z nazwiskiem */}
                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 opacity-100">
                            <span className="text-sm leading-tight font-bold text-white">
                              {actor.name}
                            </span>
                            <span className="truncate text-xs text-zinc-400">
                              {actor.character}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Sekcja Użytkownika */}
            {item.isAdded ? (
              <div className="mt-8 space-y-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                      Twoja Ocena
                    </label>
                    <div className="origin-left scale-110">
                      <StarRating value={rating} onChange={handleRatingChange} />
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
              <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="mb-2 text-lg font-bold text-zinc-200">Nie masz tego w bibliotece</h3>
                <p className="mb-4 text-zinc-400">
                  Dodaj ten tytuł, aby móc śledzić postępy, wystawiać oceny i pisać notatki.
                </p>
              </div>
            )}

            <hr className="border-zinc-800" />

            {item.isAdded && (
              <>
                <hr className="my-6 border-zinc-800" />
                <div className="space-y-2">
                  <TagManager itemId={item.externalId} initialTags={item.tags} />
                </div>
              </>
            )}
          </div>

          {item.isAdded ? (
            <div className="flex justify-end gap-2 border-t border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm">
              <DeleteMediaButton
                id={item.externalId}
                title={item.title}
                size="lg"
                onSuccess={() => setOpen(false)}
                className="text-zinc-500 hover:bg-red-950/30 hover:text-red-400"
              />
              <Button
                onClick={handleSaveNote}
                disabled={isSaving}
                size="lg"
                className="gap-2 bg-emerald-600 px-8 text-base font-semibold text-white hover:bg-emerald-700"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </div>
          ) : (
            <>
              {/* LOGIKA WARUNKOWA: Jeśli to ALBUM, pokaż Alert wyboru. Jeśli nie, zwykły przycisk. */}
              {item.type === 'ALBUM' ? (
                <AddAlbumAlert onConfirm={handleAddFromModal} isSaving={isSaving}>
                  <div className="flex justify-end gap-2 border-t border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm">
                    <Button
                      size="lg"
                      className="gap-2 bg-white px-8 text-base font-semibold text-black hover:bg-zinc-200"
                    >
                      <Plus className="h-5 w-5" />
                      {isSaving ? 'Dodawanie...' : 'Dodaj do biblioteki'}
                    </Button>
                  </div>
                </AddAlbumAlert>
              ) : (
                <div className="flex justify-end gap-2 border-t border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm">
                  <Button
                    onClick={() => handleAddFromModal(false)}
                    disabled={isSaving}
                    size="lg"
                    className="gap-2 bg-white px-8 text-base font-semibold text-black hover:bg-zinc-200"
                  >
                    <Plus className="h-5 w-5" />
                    {isSaving ? 'Dodawanie...' : 'Dodaj do biblioteki'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
