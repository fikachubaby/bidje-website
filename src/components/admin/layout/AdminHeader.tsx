"use client";

import { useState } from "react";
import { Menu, ChevronDown, User, LogOut, Bell, ClipboardList, Tag, ArrowRight } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import type { AdminHeaderProps } from "@/types/admin";
import type { AdminView } from "@/types/property";
import { translate as t } from "@/lib/i18n/getTranslation";
interface AdminNotificationBellProps {
    onNavigate: (view: AdminView) => void;
}

export function AdminNotificationBell({ onNavigate }: AdminNotificationBellProps) {
    const [open, setOpen] = useState(false);
    const { counts, loading } = useAdminNotifications();

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="View notifications"
            >
                <Bell className="h-5 w-5" />
                {!loading && counts.total > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
                        {counts.total > 99 ? "99+" : counts.total}
                    </span>
                )}
            </button>

            {/* Popover Dropdown */}
            {open && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 z-30 w-80 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 px-1">
                            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                                Notifications
                            </h3>
                            {counts.total > 0 ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                    {counts.total} Pending
                                </span>
                            ) : (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    All Clear
                                </span>
                            )}
                        </div>

                        <div className="mt-2 space-y-1.5">
                            {/* Listing Requests */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onNavigate("property-requests");
                                }}
                                className="flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600 border border-amber-100">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Listing Requests</p>
                                        <p className="text-[11px] text-neutral-500">
                                            {counts.propertyRequests} awaiting review
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-neutral-400" />
                            </button>

                            {/* Offers */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onNavigate("offers");
                                }}
                                className="flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100">
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Property Offers</p>
                                        <p className="text-[11px] text-neutral-500">
                                            {counts.offers} pending action
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-neutral-400" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
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

                    {/* Real-time Notification Bell */}
                    <AdminNotificationBell onNavigate={onNavigate} />

                    {/* User Profile Dropdown */}
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