"use client";

import { useState } from "react";
import { Settings, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { ADMIN_NAV_ITEMS, ADMIN_SETTINGS_ITEMS } from "@/constants/admin-navigation";
import type { AdminSidebarProps } from "@/types/admin";
import { translate as t } from "@/lib/i18n/getTranslation";

export function AdminSidebar({
  activeView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const isSettingsActive = activeView === "users" || activeView === "audit-logs";
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

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
            {t("Main.title")}<span className="text-brand">.</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              {t("AdminManagement.admin")}
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
          {ADMIN_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
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

          {/* Settings Section with Subitems */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                isSettingsActive
                  ? "bg-white/10 text-white"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 shrink-0" />
                <span>{t("AdminManagement.settings")}</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  settingsOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {settingsOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                {ADMIN_SETTINGS_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onNavigate(id);
                      onCloseMobile();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      activeView === id
                        ? "bg-brand text-black font-bold"
                        : "text-neutral-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}