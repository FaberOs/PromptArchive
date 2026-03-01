import { useState } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, ArrowLeft, FolderOpen, X, Check, FilePlus, EyeOff, Eye } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { Modal } from './ui/Modal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Folder as FolderType } from '@/lib/types';
import { API_BASE_URL } from '@/lib/constants';
import { bulkHide } from '@/lib/api';
import { toast } from 'sonner';

interface FolderGridProps {
  folders: FolderType[];
  currentFolderId: number | null;
  onSelectFolder: (id: number | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onUpdateFolder: (id: number, name: string, color: string) => void;
  onDeleteFolder: (id: number) => void;
  selectionMode?: boolean;
  selectedFolderIds?: Set<number>;
  onToggleFolderSelect?: (id: number) => void;
  onRefresh?: () => void;
}

export default function FolderGrid({ 
    folders, 
    currentFolderId, 
    onSelectFolder, 
    onCreateFolder, 
    onUpdateFolder, 
    onDeleteFolder,
    selectionMode,
    selectedFolderIds = new Set(),
    onToggleFolderSelect,
    onRefresh,
}: FolderGridProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderColor, setNewFolderColor] = useState("#3b82f6");
    const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);

    const colors = [
        "#3b82f6", // Blue
        "#ef4444", // Red
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#6b7280", // Gray
        "#14b8a6", // Teal
    ];

    const handleCreate = () => {
        if (!newFolderName.trim()) return;
        onCreateFolder(newFolderName, newFolderColor);
        setNewFolderName("");
        setNewFolderColor("#3b82f6");
        setIsCreating(false);
    };

    const handleUpdate = () => {
        if (!editingFolder || !editingFolder.name.trim()) return;
        onUpdateFolder(editingFolder.id, editingFolder.name, editingFolder.color);
        setEditingFolder(null);
    };

    if (currentFolderId !== null) {
        // We are inside a folder, show Breadcrumb / Back Navigation
        const currentFolder = folders.find(f => f.id === currentFolderId);
        return (
            <div className={cn(
                "mb-6 flex items-center justify-between bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4",
                currentFolder?.is_hidden && "border-amber-200 dark:border-amber-800/50"
            )}>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => onSelectFolder(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentFolder?.color + '20' }}>
                            <FolderOpen className="w-4 h-4" style={{ color: currentFolder?.color }} />
                        </div>
                        {currentFolder?.name}
                        {currentFolder?.is_hidden && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                <EyeOff className="w-3 h-3" /> Hidden
                            </span>
                        )}
                    </div>
                </div>
                
                <Button 
                    size="sm"
                    onClick={() => router.push(`/create?folder_id=${currentFolderId}`)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                >
                    <FilePlus className="w-4 h-4 mr-2" /> New Prompt
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                {/* Create New Folder Button */}
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-600/50 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-300 group h-40 cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:scale-110 transition-all duration-300 mb-2">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors">New Folder</span>
                </button>

                {/* Folder List */}
                {folders.map(folder => (
                    <div 
                        key={folder.id} 
                        className={cn(
                            "group relative bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 overflow-hidden",
                            editingFolder?.id === folder.id ? "ring-2 ring-blue-500" : "",
                            selectionMode && selectedFolderIds.has(folder.id) && "ring-2 ring-blue-500 border-blue-400 dark:border-blue-500 shadow-blue-200/50 dark:shadow-blue-900/50 shadow-lg",
                            folder.is_hidden && "opacity-50 saturate-[0.6]"
                        )}
                        onClick={() => {
                            if (selectionMode && onToggleFolderSelect) {
                                onToggleFolderSelect(folder.id);
                            } else if (!editingFolder) {
                                onSelectFolder(folder.id);
                            }
                        }}
                    >
                        {/* Color Bar */}
                        <div className="h-1 w-full" style={{ backgroundColor: folder.color }} />

                        {/* Selection checkbox */}
                        {selectionMode && (
                          <div className="absolute top-3 left-2 z-20">
                            <div className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                              selectedFolderIds.has(folder.id)
                                ? "bg-blue-500 border-blue-500 text-white shadow-md"
                                : "border-white/80 bg-black/20 backdrop-blur-sm"
                            )}>
                              {selectedFolderIds.has(folder.id) && (
                                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Hidden indicator badge */}
                        {folder.is_hidden && !selectionMode && (
                          <div className="absolute top-3 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/90 backdrop-blur-sm rounded-md shadow-sm" title="Hidden folder">
                            <EyeOff className="w-3 h-3 text-white" />
                            <span className="text-[10px] font-semibold text-white">Hidden</span>
                          </div>
                        )}

                        {/* Hidden icon when in selection mode */}
                        {folder.is_hidden && selectionMode && (
                          <div className="absolute top-3 left-9 z-10 p-0.5 bg-amber-500/80 rounded" title="Hidden">
                            <EyeOff className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 p-3 flex flex-col gap-2">
                            {/* Preview Grid */}
                            <div className="flex-1 bg-slate-100 dark:bg-slate-700/30 rounded-lg overflow-hidden relative border border-slate-100 dark:border-slate-700/40">
                                {folder.preview_images && folder.preview_images.length > 0 ? (
                                    <div className="grid grid-cols-2 h-full w-full gap-px bg-slate-200 dark:bg-slate-700/50">
                                        {folder.preview_images.slice(0, 4).map((url, idx) => (
                                            <div key={idx} className="relative w-full h-full bg-white dark:bg-slate-800/60">
                                                <Image 
                                                    src={`${API_BASE_URL}${url}`} 
                                                    fill
                                                    className="object-cover" 
                                                    alt=""
                                                    unoptimized
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-500">
                                        <Folder className="w-8 h-8" style={{ color: folder.color, fill: folder.color, fillOpacity: 0.2 }} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-1 flex-1 pr-2" title={folder.name}>
                                    {folder.name}
                                </h3>
                            </div>
                        </div>

                        {/* Actions Menu (Prevent click bubbling) */}
                        {!selectionMode && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute top-3 right-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <button className="p-1 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:scale-110 transition-transform">
                                        <MoreVertical className="w-3 h-3" />
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content sideOffset={4} className="w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-lg p-1 z-50 flex flex-col gap-0.5">
                                        <button 
                                            onClick={() => setEditingFolder(folder)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg text-left w-full transition-colors cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await bulkHide({ prompt_ids: [], folder_ids: [folder.id], hidden: !folder.is_hidden });
                                                    toast.success(folder.is_hidden ? 'Folder restored' : 'Folder hidden');
                                                    if (onRefresh) onRefresh();
                                                } catch { toast.error('Failed to update visibility'); }
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg text-left w-full transition-colors cursor-pointer"
                                        >
                                            {folder.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            {folder.is_hidden ? 'Show' : 'Hide'}
                                        </button>
                                        <button 
                                            onClick={() => onDeleteFolder(folder.id)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left w-full transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </div>
                        )}

                        {/* Edit Modal (Inline) */}
                        {editingFolder?.id === folder.id && (
                            <div 
                                className="absolute inset-0 bg-white dark:bg-slate-800 z-10 p-3 flex flex-col gap-2 rounded-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Input 
                                    value={editingFolder.name} 
                                    onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
                                    className="h-7 text-sm"
                                    autoFocus
                                />
                                <div className="flex gap-1 justify-between items-center">
                                    <div className="flex gap-1">
                                        {colors.slice(0, 4).map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setEditingFolder({...editingFolder, color: c})}
                                                className={cn(
                                                    "w-3 h-3 rounded-full",
                                                    editingFolder.color === c ? "ring-1 ring-slate-400" : ""
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingFolder(null)} className="p-1 hover:bg-slate-100 rounded"><X className="w-3 h-3" /></button>
                                        <button onClick={handleUpdate} className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"><Check className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Folder Modal */}
            <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Create New Folder">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Folder Name</label>
                        <Input 
                            value={newFolderName} 
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="e.g. Character Portraits"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Color Tag</label>
                        <div className="flex gap-3 flex-wrap">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setNewFolderColor(c)}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-transform hover:scale-110",
                                        newFolderColor === c ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600 scale-110" : ""
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create Folder</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
