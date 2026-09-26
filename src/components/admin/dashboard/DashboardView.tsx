"use client";

import { useEffect, useState } from "react";
import { Plus, Bell, AlertTriangle, Send, Calendar, Sparkles, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/ButtonProps";
import { StatCard } from "@/components/admin/ui/StatCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ListingBreakdownCard } from "./ListingBreakdownCard";
import { supabase } from "@/lib/supabase/supabase";
import { submitOfferToSupabase } from "@/lib/offers/submitOffer";
import { clearPendingOffer } from "@/lib/offers/pendingOffer";
import { useReminders } from "@/hooks/useReminders";
import { formatDueIn } from "@/lib/reminders";
import { OFFER_STATUSES } from "@/types/offer";
import type { DashboardViewProps } from "@/types/admin";

interface StatusCounts {
  published: number | null;
  underOffer: number | null;
  draft: number | null;
  sold: number | null;
}

export function DashboardView({
  properties,
  totalPropertiesCount,
  offers,
  onAddProperty,
}: DashboardViewProps) {
  const { reminders, loading: remindersLoading, sendNow } = useReminders();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [counts, setCounts] = useState<StatusCounts>({
    published: null,
    underOffer: null,
    draft: null,
    sold: null,
  });

  // Auto-process pending offer stored in session storage
  useEffect(() => {
    async function processPendingOffer() {
      const rawPending = sessionStorage.getItem("bidje:pendingOffer");
      if (!rawPending) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        const pendingData = JSON.parse(rawPending);
        if (pendingData.propertyId) {
          const res = await submitOfferToSupabase({
            propertyId: pendingData.propertyId,
            userId: session.user.id,
            data: pendingData,
          });
          if (res.success) {
            clearPendingOffer();
            window.location.reload();
          }
        }
      } catch {
        clearPendingOffer();
      }
    }

    void processPendingOffer();
  }, []);

  // Fetch exact status counts directly from Supabase DB
  useEffect(() => {
    async function fetchExactStatusCounts() {
      const fetchCount = async (status: string) => {
        const { count, error } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("status", status);
        return error ? null : count;
      };

      const [published, underOffer, draft, sold] = await Promise.all([
        fetchCount("Published"),
        fetchCount("Under Offer"),
        fetchCount("Draft"),
        fetchCount("Sold"),
      ]);

      setCounts({
        published,
        underOffer,
        draft,
        sold,
      });
    }

    void fetchExactStatusCounts();
  }, [properties]);

  // Safe handler to prevent accidental double clicks while sending reminders
  const handleSendReminder = async (id: string) => {
    if (sendingId) return;
    try {
      setSendingId(id);
      await sendNow(id);
    } finally {
      setSendingId(null);
    }
  };

  // Fallbacks to local array filtering if DB queries return null
  const displayTotalProperties = totalPropertiesCount ?? properties.length;
  const displayPublished = counts.published ?? properties.filter((p) => p.status === "Published").length;
  const displayUnderOffer = counts.underOffer ?? properties.filter((p) => p.status === "Under Offer").length;
  const displayDraft = counts.draft ?? properties.filter((p) => p.status === "Draft").length;
  const displaySold = counts.sold ?? properties.filter((p) => p.status === "Sold").length;

  const pendingOffers = offers.filter((o) => OFFER_STATUSES.includes(o.status)).length;
  const acceptedOffers = offers.filter((o) => o.status === "Accepted").length;

  const recent = [...properties]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingReminders = reminders
    .filter((r) => r.status === "scheduled")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const overdueCount = reminders.filter(
    (r) => r.status === "scheduled" && new Date(r.dueDate).getTime() < Date.now()
  ).length;

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Overview</h1>
          <p className="text-xs font-semibold text-neutral-500">Live property metrics and actionable tasks</p>
        </div>
        <Button onClick={onAddProperty} className="gap-2">
          <Plus className="h-4 w-4" />
          Add property
        </Button>
      </div>

      {/* Primary Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total properties" value={displayTotalProperties} />
        <StatCard label="Published" value={displayPublished} />
        <StatCard label="Under offer" value={displayUnderOffer} />
        <StatCard label="Pending offers" value={pendingOffers} />
      </div>

      {/* Interactive Reminders Banner */}
      <article className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50/50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700">
              <Bell className="h-5 w-5 animate-bell-ring" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-neutral-900">Upcoming Reminders</h2>
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    {overdueCount} Overdue
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">Urgent tasks, legal deadlines, and investor updates</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {remindersLoading ? (
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-neutral-200">
              <p className="text-xs font-medium text-neutral-400">Loading scheduled reminders...</p>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <div className="flex h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-white/50 text-neutral-400">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-medium">All caught up! No scheduled reminders pending.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {upcomingReminders.map((r) => {
                const isOverdue = new Date(r.dueDate).getTime() < Date.now();
                const isSending = sendingId === r.id;

                return (
                  <div
                    key={r.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${isOverdue
                        ? "border-red-200 bg-red-50/40 hover:border-red-300"
                        : "border-neutral-200 bg-white hover:border-neutral-300 shadow-xs"
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide ${isOverdue ? "text-red-600" : "text-neutral-500"
                            }`}
                        >
                          <Calendar className="h-3 w-3" />
                          {formatDueIn(r.dueDate)}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-1 font-bold text-neutral-900 text-sm">{r.title}</p>
                      <p className="line-clamp-1 text-xs text-neutral-500 mt-0.5">
                        {r.propertyTitle ?? "—"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                      <span className="truncate text-[11px] font-semibold text-neutral-400">
                        {r.investorName ?? r.investorEmail ?? "General"}
                      </span>
                      <button
                        type="button"
                        disabled={isSending || sendingId !== null}
                        onClick={() => handleSendReminder(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>

      {/* Grid: Recent Properties & Listing Breakdown */}
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="dashboard-card lg:col-span-2">
          <h2 className="dashboard-heading">Recent properties</h2>
          <p className="mt-1 dashboard-subtext">Latest updated listings in your CMS.</p>

          <div className="mt-6 divide-y divide-neutral-100">
            {recent.length === 0 ? (
              <p className="py-8 text-center dashboard-subtext">
                No properties yet. Add your first listing to get started.
              </p>
            ) : (
              recent.map((property) => (
                <div key={property.id} className="dashboard-row">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-neutral-900">{property.name}</p>
                    <p className="dashboard-subtext">
                      {property.district}, {property.state} · {property.propertyType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-neutral-900">{formatPrice(property.price)}</p>
                    <StatusBadge status={property.status} className="mt-2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <ListingBreakdownCard
          totalProperties={displayTotalProperties}
          published={displayPublished}
          underOffer={displayUnderOffer}
          draft={displayDraft}
          sold={displaySold}
          acceptedOffersCount={acceptedOffers}
          totalOffersCount={offers.length}
        />
      </div>
    </div>
  );
}
