'use client';

import { useState } from 'react';

import { deleteMediaAction } from '@/actions/media-actions';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteMediaButtonProps {
  id: string;
  title: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: () => void;
}

export function DeleteMediaButton({
  id,
  title,
  className,
  size = 'icon',
  onSuccess,
}: DeleteMediaButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    const result = await deleteMediaAction(id);

    if (result.success) {
      toast.success('Element usunięty', {
        description: `Usunięto "${title}" z biblioteki.`,
      });
      if (onSuccess) onSuccess();
    } else {
      setIsDeleting(false);
      toast.error('Błąd', { description: 'Nie udało się usunąć elementu.' });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn('transition-colors', className)}
          onClick={(e) => e.stopPropagation()}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="border-zinc-800 bg-zinc-950">
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno usunąć?</AlertDialogTitle>
          <AlertDialogDescription>
            Trwale usuniesz "{title}" ze swojej biblioteki. Twoje notatki i ocena również zostaną
            usunięte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-zinc-700 bg-transparent hover:bg-zinc-900">
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
