import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Prompt } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Trash2, ImageIcon, Upload, ArrowLeft, GitBranch, ChevronUp, ChevronDown } from 'lucide-react';
import ImageViewer from '@/components/ImageViewer';
import { API_BASE_URL } from '@/lib/constants';
import clsx from 'clsx';

interface PromptGalleryProps {
    prompt: Prompt;
    variants: Prompt[];
    isEditing: boolean;
    previewVariant: Prompt | null;
    setPreviewVariant: (variant: Prompt | null) => void;
    onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteImage: (id: number) => void;
    uploadingImage: boolean;
}

export default function PromptGallery({ 
    prompt, 
    variants, 
    isEditing, 
    previewVariant, 
    setPreviewVariant,
    onUploadImage,
    onDeleteImage,
    uploadingImage
}: PromptGalleryProps) {
    const router = useRouter();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    
    // Carousel Refs and State
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const hasImages = prompt.images && prompt.images.length > 0;
    const activeImage = hasImages ? prompt.images[activeImageIndex] : null;

    // Determine what image to show
    const displayImage = previewVariant 
        ? (previewVariant.images && previewVariant.images.length > 0 ? previewVariant.images[0] : null) 
        : activeImage;

    // Images for the viewer
    const viewerImages = previewVariant ? (previewVariant.images || []) : prompt.images;

    // Check Scroll Capability
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            setCanScrollUp(scrollTop > 0);
            setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1); // -1 for tolerance
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [variants]); // Re-check when variants change

    const handleScroll = () => checkScroll();

    const scroll = (direction: 'up' | 'down') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 100; // Approx one item height
            scrollContainerRef.current.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // --- Edit Mode Gallery ---
    if (isEditing) {
        return (
            <div className="border border-dashed border-slate-300 dark:border-slate-600/60 rounded-xl p-6 bg-slate-50 dark:bg-slate-800/40">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Manage Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {prompt.images.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                            <Image 
                            src={`${API_BASE_URL}${img.url}`} 
                            alt="Thumbnail" 
                            fill 
                            unoptimized
                            className="object-cover"
                            />
                            <button
                                onClick={() => onDeleteImage(img.id)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                title="Delete Image"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {prompt.images.length < 4 && (
                        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600/60 rounded-lg aspect-square flex flex-col items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700/40 transition-colors cursor-pointer bg-white/50 dark:bg-slate-800/40">
                            {uploadingImage ? (
                                <div className="animate-spin w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        multiple
                                        onChange={onUploadImage}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-6 h-6 mb-2" />
                                    <span className="text-xs">Add Image</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- View Mode Gallery ---
    if (!hasImages && (!variants.length || prompt.parent_id)) {
        return (
            <div className="w-full h-48 bg-white dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                <span>No images attached</span>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-2 md:p-4 shadow-xl border border-slate-200 dark:border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-4 h-[600px] lg:h-auto min-h-[500px]"> 
                {/* Fixed height container for layout stability, though responsive content inside */}
                
                {/* Comparison Carousel (Vertical) */}
                {!prompt.parent_id && variants.length > 0 && (
                    <div className="relative flex flex-col lg:w-28 flex-shrink-0 h-full max-h-[500px]">
                        
                         {/* Up Arrow */}
                         <button 
                            onClick={() => scroll('up')}
                            className={cn(
                                "absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md transition-all hover:scale-110",
                                canScrollUp ? "opacity-100 visible" : "opacity-0 invisible"
                            )}
                         >
                            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                         </button>

                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-1 hidden lg:block">
                            Variants
                        </div>
                        
                        {/* Scroll Container */}
                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex lg:flex-col gap-3 overflow-auto p-2 scrollbar-none h-full bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40 items-center lg:items-center scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar standard/IE
                        >
                            {/* Current (Parent) */}
                            <div 
                                onClick={() => setPreviewVariant(null)}
                                className={cn(
                                    "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all",
                                    previewVariant === null
                                        ? "border-2 border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 shadow-md scale-105 z-10" 
                                        : "border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                                )}
                                title="Original"
                            >
                                {prompt.images && prompt.images.length > 0 ? (
                                    <Image 
                                        src={`${API_BASE_URL}${prompt.images[0].url}`} 
                                        alt="Original" 
                                        fill 
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-700/60 text-slate-400"><ImageIcon className="w-5 h-5" /></div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold px-1 py-0.5 text-center truncate">
                                    ORIGINAL
                                </div>
                            </div>

                            {/* Variants */}
                            {variants.map((v, idx) => (
                                <div 
                                    key={v.id}
                                    onClick={() => setPreviewVariant(v)}
                                    className={cn(
                                        "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all group",
                                        previewVariant?.id === v.id
                                            ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-105 z-10" 
                                            : "border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                                    )}
                                    title={v.title}
                                >
                                    {v.images && v.images.length > 0 ? (
                                        <Image 
                                            src={`${API_BASE_URL}/static/${v.id}/${v.images[0].filename}`} 
                                            alt={v.title} 
                                            fill 
                                            unoptimized
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-700/60 text-slate-400"><ImageIcon className="w-5 h-5" /></div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold px-1 py-0.5 text-center truncate">
                                        V{idx + 1}
                                    </div>
                                    
                                    {/* Quick Link Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/prompts/${v.id}`);
                                        }}
                                        className="absolute top-1 right-1 bg-white/90 dark:bg-black/80 text-slate-900 dark:text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                        title="Open Details"
                                    >
                                        <ArrowLeft className="w-3 h-3 rotate-180" />
                                    </button>
                                </div>
                            ))}
                        </div>

                         {/* Down Arrow */}
                         <button 
                            onClick={() => scroll('down')}
                            className={cn(
                                "absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md transition-all hover:scale-110",
                                canScrollDown ? "opacity-100 visible" : "opacity-0 invisible"
                            )}
                         >
                            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                         </button>
                    </div>
                )}

                {/* Main Display */}
                <div className="flex-1 space-y-4 min-w-0 flex flex-col h-full">
                    {/* Main Image Area */}
                    <div className="relative flex-1 min-h-[300px] bg-slate-100 dark:bg-black/30 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700/40 group flex items-center justify-center">
                        {displayImage ? (
                            <>
                                <img 
                                    src={`${API_BASE_URL}${displayImage.url || ('/static/' + previewVariant?.id + '/' + displayImage.filename)}`} 
                                    alt="Main Preview" 
                                    className="w-auto h-auto max-h-[70vh] max-w-full object-contain cursor-zoom-in"
                                    onClick={() => setIsViewerOpen(true)}
                                />
                                
                                {/* Preview Overlay Info */}
                                {previewVariant && (
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                        <div className="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <GitBranch className="w-3 h-3" />
                                            Previewing Variant
                                        </div>
                                    </div>
                                )}

                                {/* Fullscreen Hint */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/50 text-slate-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-sm">
                                        Fullscreen View
                                    </div>
                                </div>
                            </>
                        ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ImageIcon className="w-12 h-12 opacity-20 mb-2" />
                                <span>No image available</span>
                                </div>
                        )}
                    </div>

                    {/* Controls / Thumbnails */}
                    {previewVariant ? (
                        /* Variant Preview Controls */
                        <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/40 flex items-center justify-between animate-in fade-in slide-in-from-top-1 flex-shrink-0">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{previewVariant.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-1">{previewVariant.description || "No description"}</p>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => router.push(`/prompts/${previewVariant.id}`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 ml-4"
                            >
                                View Full Details <ArrowLeft className="w-3 h-3 rotate-180 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        /* Standard Thumbnails (only if original has multiple images) */
                        prompt.images.length > 1 && (
                            <div className="flex justify-center gap-3 overflow-x-auto py-2 flex-shrink-0">
                                {prompt.images.map((img, idx) => (
                                    <button 
                                        key={img.id}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={clsx(
                                            "relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                            activeImageIndex === idx 
                                                ? "border-emerald-500 ring-2 ring-emerald-500/20 opacity-100" 
                                                : "border-transparent opacity-50 hover:opacity-80"
                                        )}
                                    >
                                        <Image 
                                            src={`${API_BASE_URL}${img.url}`} 
                                            alt="Thumbnail" 
                                            fill 
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Lightbox Modal (Global) */}
            {(hasImages || (previewVariant && previewVariant.images && previewVariant.images.length > 0)) && (
                <ImageViewer 
                    images={viewerImages} 
                    initialIndex={previewVariant ? 0 : activeImageIndex}
                    isOpen={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                />
            )}
        </div>
    );
}