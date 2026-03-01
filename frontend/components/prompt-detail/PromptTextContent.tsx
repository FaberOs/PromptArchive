import type { Prompt, PromptEditData } from '@/lib/types';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import JsonViewer from '@/components/JsonViewer';
import { CopyButton } from '@/components/ui/CopyButton';
import { Code, Terminal, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface PromptTextContentProps {
    prompt: Prompt; // This will be the DYNAMIC/DISPLAY prompt (active variant or main)
    isEditing: boolean;
    editData: PromptEditData;
    setEditData: (data: PromptEditData) => void;
    isPreviewingVariant: boolean;
    variantLabel: string;
}

export default function PromptTextContent({ 
    prompt, 
    isEditing, 
    editData, 
    setEditData,
    isPreviewingVariant,
    variantLabel 
}: PromptTextContentProps) {
    
    const handlePositivePromptChange = (index: number, value: string) => {
        const newPrompts = [...editData.positive_prompts];
        newPrompts[index] = value;
        setEditData({ ...editData, positive_prompts: newPrompts });
    };

    // Determine current type (Edit mode takes precedence)
    const currentType = isEditing ? editData.prompt_type : prompt.prompt_type;

    return (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Type Switcher (Edit Mode Only) */}
            {isEditing && (
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prompt Type:</span>
                        <div className="flex bg-white dark:bg-slate-700/40 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <button
                            onClick={() => setEditData({ ...editData, prompt_type: 'structured' })}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all",
                                currentType === 'structured' 
                                    ? "bg-emerald-500 text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <Terminal className="w-4 h-4" /> Standard
                        </button>
                        <button
                            onClick={() => setEditData({ ...editData, prompt_type: 'json' })}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all",
                                currentType === 'json' 
                                    ? "bg-purple-600 text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <Code className="w-4 h-4" /> JSON Workflow
                        </button>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto">
                        Switching types will preserve text but might need reformatting.
                    </span>
                </div>
            )}

            {/* Content Body */}
            {currentType === 'json' ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            JSON Workflow
                        </h3>
                        {!isEditing && (
                            <Badge className={cn(
                                "ml-auto",
                                isPreviewingVariant ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                            )}>
                                {variantLabel}
                            </Badge>
                        )}
                    </div>
                    {isEditing ? (
                        <Textarea 
                            value={editData.positive_prompts[0] || ''} 
                            onChange={(e) => handlePositivePromptChange(0, e.target.value)}
                            className="font-mono text-sm min-h-[400px] bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50"
                            placeholder="{ ... }"
                        />
                    ) : (
                        <div className="relative group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm overflow-hidden">
                            <JsonViewer json={prompt.positive_prompts[0]?.content} />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={prompt.positive_prompts[0]?.content} variant="outline" label="Copy JSON" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Positive Prompts
                            </h3>
                            {!isEditing && (
                                <Badge className={cn(
                                    "ml-auto",
                                    isPreviewingVariant ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                                )}>
                                    {variantLabel}
                                </Badge>
                            )}
                        </div>
                        
                        <div className="space-y-3">
                            {isEditing ? (
                                <>
                                {editData.positive_prompts.map((p: string, i: number) => (
                                    <div key={i}>
                                        <label className="text-xs text-slate-400 mb-1 block">Prompt {i + 1}</label>
                                        <Textarea 
                                            value={p} 
                                            onChange={(e) => handlePositivePromptChange(i, e.target.value)}
                                            className="font-mono text-sm"
                                            rows={3}
                                        />
                                    </div>
                                ))}
                                {editData.positive_prompts.length < 3 && (
                                    <Button variant="outline" size="sm" onClick={() => setEditData({...editData, positive_prompts: [...editData.positive_prompts, '']})}>
                                        + Add Prompt
                                    </Button>
                                )}
                                </>
                            ) : (
                                prompt.positive_prompts.map((pp) => (
                                    <div key={pp.id} className="relative group bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all">
                                        <p className="text-base text-slate-800 dark:text-slate-300 font-mono leading-relaxed pr-10 whitespace-pre-wrap">
                                            {pp.content}
                                        </p>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CopyButton text={pp.content} variant="outline" label="Copy" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-2">
                            <AlertOctagon className="w-5 h-5 text-red-500" />
                            Negative Prompt
                        </h3>
                        
                        {isEditing ? (
                            <Textarea 
                                value={editData.negative_prompt} 
                                onChange={(e) => setEditData({...editData, negative_prompt: e.target.value})}
                                className="font-mono text-sm"
                                rows={3}
                            />
                        ) : (
                            <div className="relative group bg-red-50/30 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg p-6 shadow-sm hover:border-red-200 dark:hover:border-red-800 hover:shadow-md transition-all">
                                <p className="text-base text-slate-800 dark:text-slate-300 font-mono leading-relaxed pr-10 whitespace-pre-wrap">
                                    {prompt.negative_prompt}
                                </p>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton text={prompt.negative_prompt} variant="outline" label="Copy" />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
