import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Prompt } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';
import { Clock, ImageIcon, Plus } from 'lucide-react';

interface PromptThreadProps {
    prompt: Prompt; // The currently viewed prompt
    rootItem: Prompt | null;
    variants: Prompt[];
}

export default function PromptThread({ prompt, rootItem, variants }: PromptThreadProps) {
    const router = useRouter();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl mx-auto space-y-8">
             
             {/* Thread Container */}
             <div className="relative border-l-2 border-slate-200 dark:border-slate-700/50 pl-8 ml-4 space-y-10 py-4">
                 
                 {/* 1. Parent Node */}
                 {rootItem && (
                    <div className="relative">
                        <div className={cn(
                            "absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 shadow-sm z-10",
                            rootItem.id === prompt.id 
                                ? "bg-emerald-500 border-white dark:border-[#1e293b] ring-2 ring-emerald-500/30" 
                                : "bg-slate-900 dark:bg-slate-100 border-white dark:border-black"
                        )} />
                        
                        <div 
                             onClick={() => router.push(`/prompts/${rootItem.id}`)}
                             className={cn(
                                 "group cursor-pointer border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row gap-5 p-5 relative",
                                 rootItem.id === prompt.id 
                                    ? "bg-white dark:bg-slate-800/60 border-emerald-500 ring-2 ring-emerald-500/20" 
                                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 hover:border-emerald-400 dark:hover:border-emerald-600"
                             )}
                        >
                             {rootItem.id === prompt.id && (
                                 <div className="absolute top-3 right-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                     Active
                                 </div>
                             )}

                             <div className="relative w-full md:w-40 h-40 md:h-32 bg-slate-100 dark:bg-slate-700/60 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                {rootItem.images && rootItem.images.length > 0 ? (
                                    <Image 
                                        src={`${API_BASE_URL}/static/${rootItem.id}/${rootItem.images[0].filename}`}
                                        alt="Thumbnail"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400"><ImageIcon className="w-8 h-8 opacity-25" /></div>
                                )}
                             </div>
                             
                             <div className="flex-1 min-w-0 flex flex-col justify-center">
                                 <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800">Original</Badge>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(rootItem.created_at).toLocaleDateString()}
                                    </span>
                                 </div>
                                 <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 truncate pr-16">{rootItem.title}</h3>
                                 <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">{rootItem.description || "No description provided."}</p>
                             </div>
                        </div>
                    </div>
                 )}

                 {/* 2. Variants List */}
                 {variants.map((variant, index) => (
                    <div key={variant.id} className="relative">
                         <div className={cn(
                             "absolute -left-[41px] top-12 w-5 h-5 rounded-full border-4 shadow-sm z-10",
                             variant.id === prompt.id 
                                ? "bg-emerald-500 border-white dark:border-[#1e293b] ring-2 ring-emerald-500/30" 
                                : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                         )} />
                         
                         <div 
                             onClick={() => router.push(`/prompts/${variant.id}`)}
                             className={cn(
                                 "group cursor-pointer border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row gap-5 p-5 relative",
                                 variant.id === prompt.id 
                                    ? "bg-white dark:bg-slate-800/60 border-emerald-500 ring-2 ring-emerald-500/20" 
                                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 hover:border-emerald-400 dark:hover:border-emerald-600"
                             )}
                        >
                             {variant.id === prompt.id && (
                                 <div className="absolute top-3 right-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                     Active
                                 </div>
                             )}

                             <div className="relative w-full md:w-40 h-40 md:h-32 bg-slate-100 dark:bg-slate-700/60 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                {variant.images && variant.images.length > 0 ? (
                                    <Image 
                                        src={`${API_BASE_URL}/static/${variant.id}/${variant.images[0].filename}`}
                                        alt="Thumbnail"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400"><ImageIcon className="w-8 h-8 opacity-25" /></div>
                                )}
                             </div>
                             
                             <div className="flex-1 min-w-0 flex flex-col justify-center">
                                 <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/60 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                        V{index + 1}
                                    </div>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(variant.created_at).toLocaleDateString()}
                                    </span>
                                 </div>
                                 <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 truncate pr-16">{variant.title}</h3>
                                 <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">{variant.description || "No description provided."}</p>
                             </div>
                        </div>
                    </div>
                 ))}

                 {/* 3. New Variant Action */}
                 <div className="relative pt-4">
                     <div className="absolute -left-[41px] top-7 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-black" />
                     <button 
                        onClick={() => router.push(`/create?parent_id=${rootItem?.id || prompt.id}`)} // Use passed rootItem which handles fallback
                        className="group flex items-center gap-3 w-full p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                     >
                         <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/60 group-hover:bg-white dark:group-hover:bg-slate-800 flex items-center justify-center transition-colors">
                             <Plus className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                             <span className="block font-bold">Create New Variant</span>
                             <span className="text-xs opacity-70">Branch off from this prompt to explore new ideas</span>
                         </div>
                     </button>
                 </div>

             </div>

          </div>
    );
}
