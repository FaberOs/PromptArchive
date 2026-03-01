import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4"
        onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
        }}
        ref={overlayRef}
    >
      <div className={cn(
          "bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 transform transition-all scale-100 flex flex-col max-h-[90vh]",
          className
      )}>
        <div className="flex items-center justify-between p-6 pb-0">
            {title && <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>}
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-full transition-colors ml-auto cursor-pointer"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
}
