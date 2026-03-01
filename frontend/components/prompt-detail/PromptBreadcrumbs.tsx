import { Layout, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Prompt } from '@/lib/types';

interface PromptBreadcrumbsProps {
    prompt: Prompt;
    parentPrompt: Prompt | null;
}

export default function PromptBreadcrumbs({ prompt, parentPrompt }: PromptBreadcrumbsProps) {
    const router = useRouter();

    return (
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 overflow-hidden whitespace-nowrap">
            <button onClick={() => router.push(prompt.is_nsfw ? '/nsfw' : '/')} className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors">
                <Layout className="w-4 h-4" /> 
                {prompt.is_nsfw ? 'Private' : 'Library'}
            </button>
            
            {/* Folder Breadcrumb */}
            {prompt.folder && (
                <>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                    <button 
                        onClick={() => {
                            const base = prompt.is_nsfw ? '/nsfw' : '/';
                            const params = new URLSearchParams({ folder_id: String(prompt.folder!.id) });
                            if (prompt.folder!.is_hidden) params.set('show_hidden', '1');
                            router.push(`${base}?${params.toString()}`);
                        }} 
                        className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors"
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: prompt.folder!.color }} />
                        {prompt.folder!.name}
                        {prompt.folder!.is_hidden && (
                            <EyeOff className="w-3 h-3 text-amber-500 ml-0.5" />
                        )}
                    </button>
                </>
            )}

            {/* Parent Prompt Breadcrumb (for Variants) */}
            {parentPrompt && (
                <>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                    <button 
                        onClick={() => router.push(`/prompts/${parentPrompt.id}`)} 
                        className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors truncate max-w-[150px] flex items-center gap-1"
                        title={parentPrompt.title}
                    >
                        {parentPrompt.title}
                        {parentPrompt.is_hidden && (
                            <EyeOff className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                    </button>
                </>
            )}

            {/* Current Prompt */}
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px] flex items-center gap-1" title={prompt.title}>
                {prompt.title}
                {prompt.is_hidden && (
                    <EyeOff className="w-3 h-3 text-amber-500 flex-shrink-0" />
                )}
            </span>
        </nav>
    );
}
