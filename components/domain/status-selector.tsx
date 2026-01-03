'use client';

import { useState } from 'react';

import { updateStatusAction } from '@/actions/media-actions';
import { Status } from '@prisma/client';
import { CheckCircle2, Circle, Loader2, PlayCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StatusSelectorProps {
  id: string;
  currentStatus: Status;
}

export function StatusSelector({ id, currentStatus }: StatusSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusConfig: Record<Status, { label: string; icon: any; color: string }> = {
    BACKLOG: { label: 'Do zrobienia', icon: Circle, color: 'text-zinc-400' },
    IN_PROGRESS: { label: 'W trakcie', icon: PlayCircle, color: 'text-blue-400' },
    COMPLETED: { label: 'Ukończone', icon: CheckCircle2, color: 'text-emerald-400' },
    ABANDONED: { label: 'Porzucone', icon: XCircle, color: 'text-red-400' },
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    const result = await updateStatusAction(id, newStatus);
    setIsUpdating(false);

    if (result.success) {
      toast.success('Zmieniono status', {
        description: `Nowy status: ${statusConfig[newStatus].label}`,
      });
    } else {
      toast.error('Błąd', { description: 'Nie udało się zapisać zmian.' });
    }
  };

  const CurrentIcon = statusConfig[currentStatus].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'h-7 gap-1.5 border border-white/10 bg-black/60 px-2 text-xs font-semibold shadow-sm backdrop-blur-md transition-all hover:bg-black/80',
            statusConfig[currentStatus].color
          )}
          disabled={isUpdating}
          onClick={(e) => e.stopPropagation()}
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CurrentIcon className="h-3.5 w-3.5" />
          )}
          {statusConfig[currentStatus].label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-zinc-800 bg-zinc-950">
        {(Object.keys(statusConfig) as Status[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(status);
              }}
              className="cursor-pointer gap-2 focus:bg-zinc-900"
            >
              <Icon className={cn('h-4 w-4', config.color)} />
              <span className="text-zinc-300">{config.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
