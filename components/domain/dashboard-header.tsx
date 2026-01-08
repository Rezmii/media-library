'use client';

import { Plus } from 'lucide-react';

import { SearchDialog } from '@/components/domain/search-dialog';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  count?: number;
  icon?: React.ReactNode;
}

export function DashboardHeader({ title, count, icon }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="text-primary rounded-xl bg-zinc-900/80 p-3 ring-1 ring-white/10">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {count !== undefined && (
            <p className="text-muted-foreground mt-1 text-lg">
              {count} {count === 1 ? 'element' : 'elementów'} w kolekcji
            </p>
          )}
        </div>
      </div>

      <SearchDialog>
        <Button size="lg" className="gap-2 px-6 text-base">
          <Plus className="h-5 w-5" />
          Dodaj element
        </Button>
      </SearchDialog>
    </div>
  );
}
