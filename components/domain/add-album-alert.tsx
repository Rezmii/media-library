'use client';

import { useState } from 'react';

import { Archive, Disc, Plus } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface AddAlbumAlertProps {
  children: React.ReactNode;
  onConfirm: (isBacklog: boolean) => void;
  isSaving: boolean;
}

export function AddAlbumAlert({ children, onConfirm, isSaving }: AddAlbumAlertProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (isBacklog: boolean) => {
    onConfirm(isBacklog);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md border-zinc-800 bg-zinc-950">
        <AlertDialogHeader>
          <AlertDialogTitle>Dodawanie Albumu</AlertDialogTitle>
          <AlertDialogDescription>
            Uzupełniasz stary katalog czy słuchasz tego na bieżąco? Wybór wpłynie na kolejność
            sortowania.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-4">
          {/* OPCJA 1: NOWOŚĆ */}
          <Button
            variant="outline"
            className="group h-auto justify-start gap-4 border-zinc-800 py-4 hover:border-emerald-500/50 hover:bg-zinc-900"
            onClick={() => handleSelect(false)}
            disabled={isSaving}
          >
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <Disc className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-zinc-200">Bieżący odsłuch</div>
              <div className="text-xs text-zinc-500">Dodaj jako najnowszy (na górę listy)</div>
            </div>
          </Button>

          {/* OPCJA 2: ARCHIWUM */}
          <Button
            variant="outline"
            className="group h-auto justify-start gap-4 border-zinc-800 py-4 hover:border-blue-500/50 hover:bg-zinc-900"
            onClick={() => handleSelect(true)}
            disabled={isSaving}
          >
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Archive className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-zinc-200">Uzupełnianie braków</div>
              <div className="text-xs text-zinc-500">Dodaj jako stary (na dół listy)</div>
            </div>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="w-full border-zinc-800 bg-transparent hover:bg-zinc-900">
            Anuluj
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
