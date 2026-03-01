import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconClassName?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, iconClassName, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'text-center py-24 bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl',
      className
    )}>
      <div className={cn(
        'inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/60 mb-4',
        iconClassName
      )}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{description}</p>
    </div>
  );
}
