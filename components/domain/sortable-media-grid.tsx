'use client';

import { useRef } from 'react';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { computeReorderUpdates, type OrderEntry } from '@/core/reorder';
import { UnifiedMediaItem } from '@/core/types/media';

import { cn } from '@/lib/utils';

import { MediaCard } from './media-card';
import { MediaDetailsDialog } from './media-details-dialog';

interface SortableMediaGridProps {
  items: UnifiedMediaItem[]; // juz przefiltrowane i posortowane malejaco po dacie
  className?: string;
  onReorder: (updates: OrderEntry[]) => void;
}

export function SortableMediaGrid({ items, className, onReorder }: SortableMediaGridProps) {
  // Po upuszczeniu przegladarka wysyla "click" — tlumimy go, zeby nie otwierac modala.
  const suppressClick = useRef(false);

  const sensors = useSensors(
    // Mysz: przeciaganie dopiero po przesunieciu o 8 px, wiec zwykly klik otwiera modal.
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Dotyk: przytrzymanie, zeby przewijanie strony dzialalo normalnie.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const releaseClick = () => {
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    releaseClick();
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.externalId === active.id);
    const newIndex = items.findIndex((i) => i.externalId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const entries: OrderEntry[] = items.map((i) => ({ id: i.externalId, ts: i.activityTs ?? 0 }));
    const updates = computeReorderUpdates(arrayMove(entries, oldIndex, newIndex), newIndex);
    if (updates.length > 0) onReorder(updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => {
        suppressClick.current = true;
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={releaseClick}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'Aby przenieść kartę, naciśnij spację lub Enter. Strzałkami zmieniasz pozycję, spacją lub Enterem upuszczasz, Escape anuluje.',
        },
      }}
    >
      <SortableContext items={items.map((i) => i.externalId)} strategy={rectSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableCard key={item.externalId} id={item.externalId} suppressClick={suppressClick}>
              <MediaDetailsDialog item={item}>
                <MediaCard item={item} isAdded={true} />
              </MediaDetailsDialog>
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({
  id,
  suppressClick,
  children,
}: {
  id: string;
  suppressClick: React.RefObject<boolean>;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Aktywator = sam wrapper: klawiatura rusza karte tylko gdy fokus jest na nim,
  // a Enter na samej karcie (wewnetrzny przycisk) dalej otwiera modal.
  const setRefs = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    setActivatorNodeRef(el);
  };

  // Zdarzenia z portali (otwarty modal) babelkuja po drzewie React do tej karty.
  // Reagujemy tylko na te, ktore naprawde zaczely sie w jej DOM — inaczej
  // zaznaczanie tekstu czy spacja w notatce w modalu ruszalyby karte pod spodem.
  const guardedListeners = Object.fromEntries(
    Object.entries(listeners ?? {}).map(([name, handler]) => [
      name,
      (event: React.SyntheticEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.target as Node)) return;
        (handler as (e: React.SyntheticEvent<HTMLElement>) => void)(event);
      },
    ])
  );

  return (
    <div
      ref={setRefs}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 30 : undefined,
        position: 'relative',
      }}
      {...attributes}
      {...guardedListeners}
      onClickCapture={(e) => {
        if (suppressClick.current && e.currentTarget.contains(e.target as Node)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className={cn(
        'touch-manipulation rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60',
        isDragging && 'cursor-grabbing opacity-80'
      )}
    >
      {children}
    </div>
  );
}
