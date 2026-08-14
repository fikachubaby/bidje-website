// src/components/admin/layout/AdminHeader.tsx
"use client";

import { useState } from "react";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import type { AdminHeaderProps } from "@/types/admin";
import { translate as t } from "@/lib/i18n/getTranslation";

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