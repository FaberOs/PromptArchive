import type { Prompt, PromptEditData } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Clock, ImageIcon, GitBranch } from 'lucide-react';
import CategorySelector from '@/components/CategorySelector';

interface PromptMetaProps {
    prompt: Prompt;
    isEditing: boolean;
    editData: PromptEditData;
    setEditData: (data: PromptEditData) => void;
}

export default function PromptMeta({ prompt, isEditing, editData, setEditData }: PromptMetaProps) {
    const hasImages = prompt.images && prompt.images.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Title */}
            <div>
                {isEditing ? (
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
                        <Input 
                            value={editData.title} 
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            className="text-lg font-bold"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {prompt.parent_id && (
                            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">
                                <GitBranch className="w-3 h-3" /> Variant
                            </div>
                        )}
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 leading-tight">{prompt.title}</h1>
                    </div>
                )}
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50 pb-6">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {new Date(prompt.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {hasImages && (
                    <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        {prompt.images.length} Image{prompt.images.length !== 1 && 's'}
                    </div>
                )}
                
                {/* Categories & Tags */}
                {isEditing ? (
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</label>
                             <CategorySelector 
                                selected={editData.categories || []} 
                                onChange={(cats) => setEditData({...editData, categories: cats})}
                             />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tags (CSV)</label>
                             <Input 
                                value={editData.tags} 
                                onChange={(e) => setEditData({...editData, tags: e.target.value})}
                             />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 ml-auto">
                        {prompt.categories.map((c) => (
                            <Badge key={c.id} variant="default">
                                {c.name}
                            </Badge>
                        ))}
                        {prompt.tags.map((t) => (
                            <Badge key={t.id} variant="secondary">
                                #{t.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Description */}
            {(prompt.description || isEditing) && (
                <div className="bg-white dark:bg-slate-800/60 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    {isEditing ? (
                        <div className="space-y-1">
                             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                             <Textarea 
                                value={editData.description} 
                                onChange={(e) => setEditData({...editData, description: e.target.value})}
                                rows={3}
                             />
                        </div>
                    ) : (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                            {prompt.description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
