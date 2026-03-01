"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, PlusCircle, Tag, Database, Moon, Sun, ShieldAlert, Lock, Unlock, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from './ThemeProvider';
import { useSecurity } from './SecurityProvider';
import PinModal from './PinModal';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isNsfwUnlocked } = useSecurity();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileOpen]);

  const handleNsfwClick = (e: React.MouseEvent) => {
    if (!isNsfwUnlocked) {
      e.preventDefault();
      setIsPinModalOpen(true);
    }
  };

  const navItems = [
    { href: '/', icon: LayoutGrid, label: 'Library', active: pathname === '/' },
    { href: '/create', icon: PlusCircle, label: 'New Prompt', active: pathname === '/create' },
    { href: '/categories', icon: Tag, label: 'Categories', active: pathname === '/categories' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Database className="w-4.5 h-4.5 text-white dark:text-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white leading-none">PROMPT ARCHIVE</h1>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Local Offline Storage</span>
          </div>
        </div>
        {/* Mobile close button */}
        <button 
          onClick={() => setMobileOpen(false)} 
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Menu</p>
        
        {navItems.map(({ href, icon: Icon, label, active }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              active
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Icon className={clsx("w-[18px] h-[18px] transition-colors", active ? "text-white dark:text-slate-900" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200")} />
            {label}
          </Link>
        ))}

        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-700/40">
            <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-widest">Private</p>
            <Link
                href="/nsfw"
                onClick={handleNsfwClick}
                className={clsx(
                "relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                pathname === '/nsfw' 
                    ? "bg-red-500 text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                )}
            >
                <div className="flex items-center gap-3">
                    <ShieldAlert className={clsx("w-[18px] h-[18px]", pathname === '/nsfw' ? "text-white" : "")} />
                    NSFW
                </div>
                {isNsfwUnlocked 
                  ? <Unlock className={clsx("w-3.5 h-3.5", pathname === '/nsfw' ? "text-white/70" : "opacity-40")} /> 
                  : <Lock className={clsx("w-3.5 h-3.5", pathname === '/nsfw' ? "text-white/70" : "opacity-40")} />
                }
            </Link>
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700/40">
         <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all duration-200 group"
         >
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <div className="w-7 h-7 bg-white dark:bg-slate-600/60 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-slate-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
         </button>
      </div>

      {/* Version */}
      <div className="px-5 py-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        v1.3.0
      </div>
    </div>
  );

  return (
    <>
    {/* Mobile hamburger button */}
    <button
      onClick={() => setMobileOpen(true)}
      className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white dark:bg-[#1a2236] border border-slate-200 dark:border-slate-700/40 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>

    {/* Mobile overlay */}
    {mobileOpen && (
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        onClick={() => setMobileOpen(false)}
      />
    )}

    {/* Sidebar */}
    <div className={clsx(
      "w-64 bg-white dark:bg-[#1a2236] border-r border-slate-200 dark:border-slate-700/40 text-slate-900 dark:text-white h-screen fixed left-0 top-0 z-50 transition-all duration-300",
      // Mobile: slide in/out
      "max-lg:-translate-x-full max-lg:shadow-2xl",
      mobileOpen && "max-lg:translate-x-0"
    )}>
      {sidebarContent}
    </div>

    <PinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={() => {
            setIsPinModalOpen(false);
            router.push('/nsfw');
        }}
    />
    </>
  );
}
