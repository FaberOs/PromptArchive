"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import clsx from 'clsx';
import type { PromptImage } from '@/lib/types';
import { API_BASE_URL } from '@/lib/constants';

interface ImageViewerProps {
  images: PromptImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  // Handle Navigation
  const nextImage = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, nextImage, prevImage]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-40"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-40"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Content */}
      <div 
        className={clsx(
            "relative w-full h-full flex p-4",
            isZoomed ? "overflow-auto items-start justify-start" : "items-center justify-center overflow-hidden"
        )}
        onClick={(e) => {
            // Only close if clicking the background, not the image
            if (e.target === e.currentTarget) onClose(); 
        }}
      >
        <div 
            className={clsx(
                "relative transition-transform duration-300 ease-out",
                isZoomed ? "cursor-zoom-out min-w-full min-h-full" : "cursor-zoom-in w-full h-full flex items-center justify-center"
            )}
            style={{ 
                width: isZoomed ? 'auto' : '100%', 
                height: isZoomed ? 'auto' : '100%',
                maxWidth: isZoomed ? 'none' : '100%',
                maxHeight: isZoomed ? 'none' : '100%',
                aspectRatio: isZoomed ? 'auto' : undefined,
                margin: isZoomed ? 'auto' : '0'
            }}
            onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
            }}
        >
            <Image
                src={`${API_BASE_URL}${currentImage.url}`}
                alt="Fullscreen view"
                fill={!isZoomed}
                width={isZoomed ? 0 : undefined}
                height={isZoomed ? 0 : undefined}
                sizes="100vw"
                style={isZoomed ? { width: 'auto', height: 'auto', minWidth: '100vw' } : { objectFit: 'contain' }}
                unoptimized
                className={clsx(
                    "select-none", 
                    isZoomed ? "" : "max-w-full max-h-full"
                )}
            />
        </div>

        {/* Zoom Hint / Counter */}
        {!isZoomed && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/50 text-white rounded-full text-sm backdrop-blur-md pointer-events-none">
                <span>{currentIndex + 1} / {images.length}</span>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="flex items-center gap-1 text-white/70">
                    {isZoomed ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
                    {isZoomed ? "Click to fit" : "Click to zoom"}
                </span>
            </div>
        )}
      </div>
    </div>
  );
}
