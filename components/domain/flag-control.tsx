'use client';

import { useState } from 'react';

import { toggleFlagAction } from '@/actions/media-actions';
import { toast } from 'sonner';

import type { FlagDef } from '@/config/flags';

import { cn } from '@/lib/utils';

// Kolory zgodne z MediaBadge danego typu medium.
const TYPE_ICON_ACTIVE: Record<string, string> = {
  GAME: 'border-emerald-500/50 text-emerald-400',
  MOVIE: 'border-blue-500/50 text-blue-400',
  SERIES: 'border-indigo-500/50 text-indigo-400',
  BOOK: 'border-amber-500/50 text-amber-400',
  ALBUM: 'border-rose-500/50 text-rose-400',
};

const TYPE_CHIP_ACTIVE: Record<string, string> = {
  GAME: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
  MOVIE: 'border-blue-500/50 bg-blue-950/40 text-blue-300',
  SERIES: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
  BOOK: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
  ALBUM: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
};

interface FlagControlProps {
  itemId: string;
  type: string;
  def: FlagDef;
  initialActive: boolean;
  mode: 'icon' | 'chip';
}

export function FlagControl({ itemId, type, def, initialActive, mode }: FlagControlProps) {
  const [active, setActive] = useState(initialActive);
  const [pending, setPending] = useState(false);
  const Icon = def.icon;
  const description = def.descriptionByType?.[type] ?? def.description;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const next = !active;
    setActive(next);
    setPending(true);
    const res = await toggleFlagAction(itemId, def.key, next);
    setPending(false);

    if (!res.success) {
      setActive(!next);
      toast.error('Nie udało się zapisać kategorii');
    }
  };

  // Tryb chip — w modalu, z widoczną etykietą
  if (mode === 'chip') {
    return (
      <button
        type="button"
        onClick={toggle}
        title={description}
        aria-pressed={active}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
          active
            ? TYPE_CHIP_ACTIVE[type] || 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
            : 'border-zinc-700 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
        )}
      >
        <Icon className="h-4 w-4" />
        {def.label}
      </button>
    );
  }

  // Tryb ikony — na kafelku. Aktywna: zawsze widoczna. Nieaktywna: ukryta z
  // układu (display:none, więc aktywne dosuwają się w lewo bez luki) i pojawia
  // się dopiero na hover kafelka, wyszarzona — można ją kliknąć, by włączyć.
  return (
    <div className={cn('group/flag relative', !active && 'hidden group-hover:block')}>
      <button
        type="button"
        onClick={toggle}
        aria-label={def.label}
        aria-pressed={active}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border bg-black/60 shadow-sm backdrop-blur-md transition-all hover:scale-110',
          active
            ? TYPE_ICON_ACTIVE[type] || 'border-emerald-500/50 text-emerald-400'
            : 'border-white/10 text-zinc-400 hover:text-zinc-200'
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>

      {/* Tooltip (otwiera się w dół i w prawo, żeby nie przycinał go overflow kafelka) */}
      <div className="pointer-events-none absolute top-full left-0 z-50 mt-1.5 hidden w-max max-w-[200px] rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-left shadow-xl group-hover/flag:block">
        <div className="text-xs font-semibold text-zinc-100">{def.label}</div>
        <div className="text-[11px] leading-snug text-zinc-400">{description}</div>
      </div>
    </div>
  );
}
