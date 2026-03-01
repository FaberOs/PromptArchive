import type { Prompt, Folder } from '@/lib/types';
import PromptCard from '@/components/PromptCard';
import { PromptCardSkeleton } from '@/components/skeletons/PromptCardSkeleton';
import { Button } from '@/components/ui/Button';

interface PromptGridProps {
  prompts: Prompt[];
  folders?: Folder[];
  loading: boolean;
  total: number;
  debouncedSearch?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onMove: () => void;
  emptyState: React.ReactNode;
  selectionMode?: boolean;
  selectedPromptIds?: Set<number>;
  onTogglePromptSelect?: (id: number) => void;
}

export function PromptGrid({
  prompts,
  folders,
  loading,
  total,
  debouncedSearch,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onMove,
  emptyState,
  selectionMode,
  selectedPromptIds,
  onTogglePromptSelect,
}: PromptGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {debouncedSearch && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} {total === 1 ? 'result' : 'results'} for{' '}
          <span className="font-medium text-slate-900 dark:text-slate-100">&ldquo;{debouncedSearch}&rdquo;</span>
        </p>
      )}

      {prompts.length === 0 ? (
        emptyState
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                folders={folders}
                onMove={onMove}
                selectionMode={selectionMode}
                isSelected={selectedPromptIds?.has(p.id)}
                onToggleSelect={onTogglePromptSelect}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading...' : `Load More (${prompts.length} of ${total})`}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
