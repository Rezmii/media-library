'use client';

import { useState } from 'react';

import { addTagAction, removeTagAction } from '@/actions/media-actions';
import { Plus, Tag as TagIcon, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagManagerProps {
  itemId: string;
  initialTags: string[];
}

export function TagManager({ itemId, initialTags }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [isInputVisible, setInputVisible] = useState(false);

  const handleAddTag = async () => {
    if (!inputValue.trim()) return;
    const newTag = inputValue.trim();

    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setInputValue('');
      setInputVisible(false);

      const result = await addTagAction(itemId, newTag);
      if (!result.success) {
        toast.error('Błąd dodawania tagu');
        setTags(initialTags);
      }
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    await removeTagAction(itemId, tagToRemove);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <TagIcon className="h-4 w-4 text-emerald-500" /> Tagi / Kategorie
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-300 transition-all hover:bg-zinc-700"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-red-400 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {isInputVisible ? (
          <div className="animate-in fade-in zoom-in flex items-center gap-2 duration-200">
            <Input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputValue.length > 0) handleAddTag();
                else setInputVisible(false);
              }}
              className="h-7 w-32 border-zinc-700 bg-zinc-900 text-xs focus-visible:ring-emerald-500/50"
              placeholder="Nowy tag..."
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputVisible(true)}
            className="h-7 gap-1 border-dashed border-zinc-700 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
          >
            <Plus className="h-3 w-3" /> Dodaj
          </Button>
        )}
      </div>
    </div>
  );
}
