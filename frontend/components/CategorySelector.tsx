import { useState, useEffect, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, X, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import type { Category } from '@/lib/types';

interface CategorySelectorProps {
    selected: string[]; // List of category NAMES
    onChange: (categories: string[]) => void;
}

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            setLoading(true);
            try {
                const res = await api.get('/categories/');
                setCategories(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, []);

    const filtered = useMemo(() => {
        if (!query) return categories;
        return categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }, [categories, query]);

    const handleSelect = (name: string) => {
        if (selected.includes(name)) {
            onChange(selected.filter(s => s !== name));
        } else {
            onChange([...selected, name]);
        }
    };

    const handleRemove = (name: string) => {
        onChange(selected.filter(s => s !== name));
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <div 
                    className="min-h-[2.5rem] w-full rounded-md border border-slate-300 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex flex-wrap gap-2 items-center justify-between"
                >
                    {selected.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selected.map(cat => (
                                <Badge key={cat} variant="secondary" className="pr-1">
                                    {cat}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(cat);
                                        }}
                                        className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-slate-500">Select categories...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content 
                    className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-md shadow-lg z-50 max-h-[300px] flex flex-col"
                    align="start"
                    sideOffset={5}
                >
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700/50 sticky top-0 bg-white dark:bg-slate-800 z-10">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                className="w-full pl-8 pr-2 py-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                                placeholder="Search category..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-1">
                        {loading ? (
                            <div className="p-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-2 text-center text-xs text-slate-500">No categories found.</div>
                        ) : (
                            filtered.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleSelect(cat.name)}
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer",
                                        selected.includes(cat.name) ? "text-slate-900 dark:text-slate-100 font-medium bg-slate-50 dark:bg-slate-700/40" : "text-slate-700 dark:text-slate-300"
                                    )}
                                >
                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center border border-slate-300 dark:border-slate-600 rounded-sm", 
                                        selected.includes(cat.name) ? "bg-slate-900 dark:bg-slate-100 border-transparent" : "opacity-50"
                                    )}>
                                        {selected.includes(cat.name) && <Check className="h-3 w-3 text-white dark:text-slate-900" />}
                                    </div>
                                    {cat.name}
                                </div>
                            ))
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
