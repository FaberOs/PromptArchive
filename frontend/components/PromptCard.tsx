import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './ui/Badge';
import { Calendar, MoreVertical, FolderInput, Edit2, Trash2, Folder as FolderIcon, GitBranch, EyeOff, Eye } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import api from '@/lib/api';
import { bulkHide } from '@/lib/api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import type { Prompt, Folder, Category } from '@/lib/types';
import { API_BASE_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PromptCardProps {
  prompt: Prompt;
  folders?: Folder[];
  onMove?: () => void; // Callback to refresh parent
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export default function PromptCard({ prompt, folders = [], onMove, selectionMode, isSelected, onToggleSelect }: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const thumbnail = prompt.images && prompt.images.length > 0 ? prompt.images[0].url : null;
  const imageUrl = thumbnail ? `${API_BASE_URL}${thumbnail}` : null;

  const handleMove = async (folderId: number | null) => {
      try {
          await api.put(`/prompts/${prompt.id}`, { 
              title: prompt.title, 
              description: prompt.description,
              negative_prompt: prompt.negative_prompt,
              positive_prompts: prompt.positive_prompts.map((p) => p.content),
              categories: prompt.categories.map((c) => c.name),
              tags: prompt.tags.map((t) => t.name),
              is_nsfw: prompt.is_nsfw,
              prompt_type: prompt.prompt_type,
              folder_id: folderId 
          });
          if (onMove) onMove();
          setShowMoveModal(false);
      } catch (e) {
          console.error("Failed to move prompt", e);
      }
  };

  const handleDelete = async () => {
      try {
          await api.delete(`/prompts/${prompt.id}`);
          if (onMove) onMove(); // Refresh
          setShowDeleteModal(false);
      } catch (e) {
          console.error("Failed to delete", e);
      }
  };

  const handleToggleHidden = async () => {
    try {
      await bulkHide({ prompt_ids: [prompt.id], folder_ids: [], hidden: !prompt.is_hidden });
      toast.success(prompt.is_hidden ? 'Prompt restored' : 'Prompt hidden');
      if (onMove) onMove();
    } catch {
      toast.error('Failed to update visibility');
    }
    setIsOpen(false);
  };

  // --- Selection mode: click selects instead of navigating ---
  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelect) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect(prompt.id);
    }
  };

  return (
    <>
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative block bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600",
        selectionMode && "cursor-pointer",
        isSelected && "ring-2 ring-blue-500 border-blue-400 dark:border-blue-500 shadow-blue-200/50 dark:shadow-blue-900/50 shadow-lg",
        prompt.is_hidden && "opacity-50 saturate-[0.6]"
      )}
    >
      
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-2.5 left-2.5 z-20">
          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
            isSelected
              ? "bg-blue-500 border-blue-500 text-white shadow-md"
              : "border-white/80 bg-black/20 backdrop-blur-sm"
          )}>
            {isSelected && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
        </div>
      )}

      {/* Hidden indicator badge */}
      {prompt.is_hidden && !selectionMode && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/90 backdrop-blur-sm rounded-md shadow-sm" title="Hidden prompt">
          <EyeOff className="w-3 h-3 text-white" />
          <span className="text-[10px] font-semibold text-white">Hidden</span>
        </div>
      )}

      {/* Hidden icon when in selection mode (smaller, offset from checkbox) */}
      {prompt.is_hidden && selectionMode && (
        <div className="absolute top-2.5 left-9 z-10 p-0.5 bg-amber-500/80 rounded" title="Hidden">
          <EyeOff className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Hidden overlay */}
      {prompt.is_hidden && (
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-slate-900/5 via-transparent to-slate-900/10 dark:from-slate-900/20 dark:to-slate-900/30" />
      )}

      {/* Actions Menu */}
      {!selectionMode && (
      <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0" onClick={(e) => e.preventDefault()}>
            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shadow-md border border-slate-200/80 dark:border-slate-600/80 hover:scale-105 transition-transform cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className="w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200" align="end" sideOffset={4}>
                    <div className="flex flex-col gap-0.5">
                        <Link href={`/prompts/${prompt.id}`} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg text-left w-full transition-colors cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5" /> Edit / View
                        </Link>
                        <button 
                            onClick={() => { setIsOpen(false); setShowMoveModal(true); }}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg text-left w-full transition-colors cursor-pointer"
                        >
                            <FolderInput className="w-3.5 h-3.5" /> Move to folder
                        </button>
                        <button
                            onClick={handleToggleHidden}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg text-left w-full transition-colors cursor-pointer"
                        >
                            {prompt.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {prompt.is_hidden ? 'Show' : 'Hide'}
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2" />
                        <button 
                            onClick={() => { setIsOpen(false); setShowDeleteModal(true); }}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left w-full transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
      </div>
      )}

      <Link href={`/prompts/${prompt.id}`} className={cn("block", selectionMode && "pointer-events-none")}>
        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700/40 relative flex items-center justify-center overflow-hidden">
            {imageUrl ? (
            <Image 
                src={imageUrl} 
                alt={prompt.title} 
                fill 
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-500">
              <Calendar className="w-8 h-8 opacity-50" />
              <span className="text-xs font-medium">No Preview</span>
            </div>
            )}
        </div>
        <div className="p-4 space-y-2.5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate text-[15px] leading-snug">{prompt.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              {new Date(prompt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              {prompt.images && prompt.images.length > 1 && (
                <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-medium">{prompt.images.length} imgs</span>
              )}
              {prompt.variant_count > 0 && (
                <span className={`${prompt.images.length <= 1 ? 'ml-auto' : ''} text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded-md font-medium flex items-center gap-0.5`}>
                  <GitBranch className="w-2.5 h-2.5" /> {prompt.variant_count}
                </span>
              )}
            </div>
            {prompt.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {prompt.categories.slice(0, 3).map((cat: Category) => (
                    <Badge key={cat.id} variant="secondary" className="text-[11px] px-2 py-0.5 dark:bg-slate-700/60 dark:text-slate-300">{cat.name}</Badge>
                ))}
                {prompt.categories.length > 3 && (
                    <Badge variant="secondary" className="text-[11px] px-2 py-0.5 dark:bg-slate-700/60 dark:text-slate-300">+{prompt.categories.length - 3}</Badge>
                )}
              </div>
            )}
        </div>
      </Link>
    </div>

    {/* Move Modal */}
    <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move Prompt">
        <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-300">Select a destination folder for <strong>{prompt.title}</strong>.</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <button 
                    onClick={() => handleMove(0)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all text-left group cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:text-slate-600">
                        <FolderIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Root Library (No Folder)</span>
                </button>
                
                {folders.map(folder => (
                    <button 
                        key={folder.id}
                        onClick={() => handleMove(folder.id)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all text-left cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: folder.color }}>
                            <FolderIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{folder.name}</span>
                    </button>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowMoveModal(false)}>Cancel</Button>
            </div>
        </div>
    </Modal>

    {/* Delete Modal */}
    <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Prompt">
        <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-200">
                Are you sure you want to delete <strong>{prompt.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
        </div>
    </Modal>
    </>
  );
}
