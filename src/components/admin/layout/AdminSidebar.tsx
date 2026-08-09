"use client";

import { useState } from "react";
import {
  Building2,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  Upload,
  X,
  UserRoundCheck,
  Megaphone,
  Settings,
  Users,
  FileText,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminView } from "@/types/property";
import { translate as t } from "@/lib/i18n/getTranslation";

const navItems: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "subscribers", label: "Subscribers", icon: UserRoundCheck },
  { id: "offers", label: "Offers", icon: HandCoins },
  { id: "ads", label: "Advertisements", icon: Megaphone },
  { id: "imports", label: "Telegram Import", icon: Upload },
];

const settingsItems: { id: AdminView; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "audit-logs", label: "Audit Logs", icon: FileText },
];

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

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
                {settingsItems.map(({ id, label, icon: Icon }) => (
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

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  userEmail?: string;
  onMenuClick: () => void;
  onNavigate: (view: AdminView) => void;
  onSignOut: () => void;
  actions?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle,
  userEmail,
  onMenuClick,
  onNavigate,
  onSignOut,
  actions,
}: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        <div className="flex flex-wrap items-center gap-3">
          {actions}

          {/* Top Header User Profile Dropdown & Sign Out */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-900 text-white text-xs">
                {userEmail?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="max-w-[140px] truncate">{userEmail || "Admin User"}</span>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 z-20 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-neutral-100 px-3 py-2">
                    <p className="text-xs font-medium text-neutral-400">{t("Main.heading4")}</p>
                    <p className="truncate text-xs font-bold text-neutral-900">{userEmail}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate("profile");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      <User className="h-4 w-4 text-neutral-500" />
                      {t("Main.status.update")} {t("AdminManagement.profile")}
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("Authentication.logout")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}