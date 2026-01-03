'use client';

import { useState } from 'react';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue ?? value) >= star;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className={cn(
              'transition-transform hover:scale-110 focus:outline-none',
              readOnly && 'cursor-default hover:scale-100'
            )}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 w-4 text-sm font-medium text-zinc-500">{hoverValue ?? value}/5</span>
    </div>
  );
}
