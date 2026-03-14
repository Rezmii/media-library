'use client';

import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface LocalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocalSearchBar({
  value,
  onChange,
  placeholder = 'Szukaj wszędzie...',
}: LocalSearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border-zinc-800 bg-zinc-900/50 pr-8 pl-9 text-sm placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
