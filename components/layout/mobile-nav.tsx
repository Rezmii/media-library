'use client';

import { useState } from 'react';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { SidebarContent } from './sidebar';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 bg-zinc-950 p-0">
        {/* Dodajemy Title i Description dla dostępności (wymóg Shadcn/Dialog) */}
        <SheetTitle className="sr-only">Menu nawigacyjne</SheetTitle>
        <SheetDescription className="sr-only">Główna nawigacja aplikacji</SheetDescription>

        {/* Renderujemy samą treść bez blokady 'hidden' */}
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
