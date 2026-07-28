"use client";

import {
  Building2,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminView } from "@/types/admin";

const navItems: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "offers", label: "Buyer Offers", icon: HandCoins },
  { id: "imports", label: "Telegram Import", icon: Upload },
];

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
}

export function AdminSidebar({
  activeView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  onSignOut,
}: AdminSidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-neutral-950 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <p className="text-xl font-black tracking-tight">
            BIDJE<span className="text-brand">.</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              Admin
            </span>
          </p>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onNavigate(id);
                onCloseMobile();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                activeView === id
                  ? "bg-brand text-black"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, onMenuClick, actions }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="rounded-lg border border-neutral-200 p-2 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 lg:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
