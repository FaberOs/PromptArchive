"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, PlusCircle, Tag, Lock, Unlock, Menu, X, Moon, Sun } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";
import { useSecurity } from "./SecurityProvider";
import { useSuiteTheme, requestSuiteTheme } from "@suite/ui";
import PinModal from "./PinModal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isNsfwUnlocked } = useSecurity();
  const theme = useSuiteTheme();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const handlePrivateClick = (e: React.MouseEvent) => {
    if (!isNsfwUnlocked) {
      e.preventDefault();
      setIsPinModalOpen(true);
      return;
    }
    setMobileOpen(false);
  };

  const navItems = [
    { href: "/", icon: LayoutGrid, label: "Library", active: pathname === "/" },
    {
      href: "/create",
      icon: PlusCircle,
      label: "New Prompt",
      active: pathname === "/create",
    },
    {
      href: "/categories",
      icon: Tag,
      label: "Categories",
      active: pathname === "/categories",
    },
  ];

  const isPrivateActive = pathname === "/nsfw";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-pa-border px-4 py-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <div>
              <AppLogo size={42} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold leading-[1.05] text-pa-text">
                Prompt
                <br />
                Archive
              </h1>
            </div>
          </div>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-pa-muted-soft">
            Local Offline Storage
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-pa-muted-soft hover:bg-pa-surface hover:text-pa-text lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3" aria-label="Main navigation">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-pa-muted-soft">Menu</p>

        {navItems.map(({ href, icon: Icon, label, active }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group relative flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors",
              active ? "bg-pa-primary text-pa-paper" : "text-pa-muted hover:bg-pa-surface hover:text-pa-text",
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                active ? "text-pa-paper" : "text-pa-muted-soft group-hover:text-pa-muted",
              )}
              strokeWidth={1.8}
            />
            {label}
          </Link>
        ))}

        <div className="mt-3 border-t border-pa-border pt-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-pa-muted-soft">Private</p>
          <Link
            href="/nsfw"
            onClick={handlePrivateClick}
            className={cn(
              "group relative flex min-h-[44px] items-center justify-between gap-3 rounded-pa-lg px-3 text-[14px] font-medium transition-colors duration-[var(--pa-motion-base)]",
              isPrivateActive
                ? "bg-pa-private text-white shadow-pa-subtle"
                : "text-pa-muted hover:bg-pa-private-soft hover:text-pa-private",
            )}
          >
            <div className="flex items-center gap-3">
              <Lock
                className={cn(
                  "h-[18px] w-[18px]",
                  isPrivateActive ? "text-white" : "text-pa-muted-soft group-hover:text-pa-private",
                )}
                strokeWidth={1.8}
              />
              Private Library
            </div>
            {isNsfwUnlocked ? (
              <Unlock className={cn("h-3.5 w-3.5", isPrivateActive ? "text-white/70" : "opacity-40")} />
            ) : (
              <Lock className={cn("h-3.5 w-3.5", isPrivateActive ? "text-white/70" : "opacity-40")} />
            )}
          </Link>
        </div>
      </nav>

      <div className="border-t border-pa-border px-4 py-3">
        <button
          type="button"
          onClick={() => requestSuiteTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="flex w-full items-center justify-between rounded-pa-lg px-3 py-2.5 text-xs font-medium text-pa-muted transition-colors hover:bg-pa-surface hover:text-pa-text"
        >
          <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pa-surface text-pa-muted">
            {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-pa-warning" />}
          </span>
        </button>
        <span className="mt-3 block text-[10px] font-medium text-pa-muted-soft">v1.3.0</span>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    <>
      {mobileOpen && <style>{`body { overflow: hidden; }`}</style>}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed left-3 top-3 z-pa-sidebar-toggle rounded-pa-lg border border-pa-border bg-pa-paper p-2 text-pa-muted shadow-pa-subtle transition-colors hover:bg-pa-surface sm:left-4 sm:top-4 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-pa-sidebar-overlay bg-pa-ink/50 backdrop-blur-sm lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMobileOpen(false);
          }}
          tabIndex={-1}
          ref={(node) => node?.focus()}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-pa-sidebar-panel h-screen w-[232px] border-r border-pa-border bg-pa-paper text-pa-text transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-[var(--pa-motion-slow)]",
          "max-lg:-translate-x-full max-lg:shadow-pa-modal",
          mobileOpen && "max-lg:translate-x-0",
        )}
        aria-modal={mobileOpen ? true : undefined}
      >
        {sidebarContent}
      </div>

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          router.push("/nsfw");
        }}
      />
    </>,
    document.body,
  );
}
