'use client';

import { useEffect, useState, useTransition } from 'react';

import { usePathname } from 'next/navigation';

import { addToLibraryAction, searchMediaAction } from '@/actions/media-actions';
import { MediaType } from '@prisma/client';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { UnifiedMediaItem } from '@/core/types/media';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { MediaCard } from './media-card';

interface SearchDialogProps {
  children: React.ReactNode;
}

export function SearchDialog({ children }: SearchDialogProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedMediaItem[]>([]);
  const [isSearching, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const getSearchContext = (): { type: MediaType | 'ALL'; label: string } => {
    if (pathname.startsWith('/games')) return { type: 'GAME', label: 'gry' };
    if (pathname.startsWith('/movies')) return { type: 'MOVIE', label: 'filmu' };
    if (pathname.startsWith('/series')) return { type: 'SERIES', label: 'serialu' };
    if (pathname.startsWith('/books')) return { type: 'BOOK', label: 'książki' };
    if (pathname.startsWith('/music')) return { type: 'ALBUM', label: 'albumu' };
    return { type: 'ALL', label: 'gry, filmu, książki...' };
  };

  const context = getSearchContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        startTransition(async () => {
          const data = await searchMediaAction(query, context.type);
          setResults(data);
        });
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, context.type]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Obsługa dodawania
  const handleAdd = async (item: UnifiedMediaItem) => {
    setIsAdding(item.externalId);
    const result = await addToLibraryAction(item);
    setIsAdding(null);

    if (result.success) {
      setOpen(false);
      setQuery('');
      setResults([]);

      toast.success('Dodano do biblioteki', {
        description: `"${item.title}" trafiło do Twojej kolekcji.`,
      });
    } else {
      toast.error('Błąd', {
        description: 'Nie udało się dodać elementu.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex h-[80vh] max-w-5xl flex-col overflow-hidden border-zinc-800 bg-zinc-950 p-0">
        <div className="space-y-4 border-b border-zinc-800 p-6">
          <DialogTitle className="text-xl font-bold">Dodaj do biblioteki</DialogTitle>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder={`Wpisz tytuł ${context.label}...`}
              className="h-12 border-zinc-800 bg-zinc-900/50 pl-10 text-lg focus-visible:ring-emerald-500/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 animate-spin text-emerald-500" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-950/50 p-6">
          {results.length === 0 && !isSearching && query.length > 0 && (
            <div className="py-10 text-center text-zinc-500">Brak wyników dla "{query}"</div>
          )}

          {results.length === 0 && query.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-zinc-600">
              <Search className="h-10 w-10 opacity-20" />
              <p>Wpisz co najmniej 2 znaki, aby rozpocząć wyszukiwanie...</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {results.map((item) => (
              <div key={`${item.type}-${item.externalId}`} className="relative">
                <MediaCard item={item} onAdd={handleAdd} isAdded={item.isAdded || false} />
                {isAdding === item.externalId && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
