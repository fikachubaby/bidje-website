"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/ButtonProps";
import { StatCard } from "@/components/admin/ui/StatCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { supabase } from "@/lib/supabase/supabase";
import { submitOfferToSupabase } from "@/lib/offers/submitOffer";
import { clearPendingOffer } from "@/lib/offers/pendingOffer";
import { useReminders } from "@/hooks/useReminders";
import { formatDueIn } from "@/lib/reminders";
import type { DashboardViewProps } from "@/types/admin";

const OPEN_OFFER_STATUSES = ["Submitted", "Pending Documents", "Under Verification", "Verification Rejected", "Verified"];

export function DashboardView({
  properties,
  totalPropertiesCount,
  offers,
  onAddProperty,
}: DashboardViewProps) {
  const { reminders, loading: remindersLoading, sendNow } = useReminders();

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

  const published = properties.filter((p) => p.status === "Published").length;
  const underOffer = properties.filter((p) => p.status === "Under Offer").length;
  const sold = properties.filter((p) => p.status === "Sold").length;
  const pendingOffers = offers.filter((o) => OPEN_OFFER_STATUSES.includes(o.status)).length;

  const recent = [...properties]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const displayTotalProperties = totalPropertiesCount ?? properties.length;

  const upcomingReminders = reminders
    .filter((r) => r.status === "scheduled")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const overdueCount = reminders.filter(
    (r) => r.status === "scheduled" && new Date(r.dueDate).getTime() < Date.now()
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button onClick={onAddProperty}>
          <Plus className="h-5 w-5" />
          Add property
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total properties" value={displayTotalProperties} />
        <StatCard label="Published" value={published} />
        <StatCard label="Under offer" value={underOffer} />
        <StatCard label="Pending offers" value={pendingOffers} />
      </div>

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

        <article className="dashboard-card">
          <h2 className="dashboard-heading">Quick stats</h2>
          <dl className="mt-6 space-y-4">
            <div className="dashboard-stat-item">
              <dt className="dashboard-subtext">Draft listings</dt>
              <dd className="font-black">{properties.filter((p) => p.status === "Draft").length}</dd>
            </div>
            <div className="dashboard-stat-item">
              <dt className="dashboard-subtext">Sold</dt>
              <dd className="font-black">{sold}</dd>
            </div>
            <div className="dashboard-stat-item">
              <dt className="dashboard-subtext">Total offers</dt>
              <dd className="font-black">{offers.length}</dd>
            </div>
            <div className="dashboard-stat-item">
              <dt className="dashboard-subtext">Accepted offers</dt>
              <dd className="font-black">
                {offers.filter((o) => o.status === "Accepted").length}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <article className="dashboard-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="dashboard-heading">Upcoming reminders</h2>
            <p className="mt-1 dashboard-subtext">
              Legal, renovation, and follow-up deadlines across your properties.
              {overdueCount > 0 && (
                <span className="ml-2 font-bold text-red-600">{overdueCount} overdue</span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-neutral-100">
          {remindersLoading ? (
            <p className="py-8 text-center dashboard-subtext">Loading reminders...</p>
          ) : upcomingReminders.length === 0 ? (
            <p className="py-8 text-center dashboard-subtext">
              No scheduled reminders. Add one from a property or offer page.
            </p>
          ) : (
            upcomingReminders.map((r) => (
              <div key={r.id} className="dashboard-row">
                <div className="min-w-0">
                  <p className="truncate font-bold text-neutral-900">{r.title}</p>
                  <p className="dashboard-subtext">
                    {r.propertyTitle ?? "—"} · {r.investorName ?? r.investorEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-black ${new Date(r.dueDate).getTime() < Date.now() ? "text-red-600" : "text-neutral-900"}`}>
                    {formatDueIn(r.dueDate)}
                  </p>
                  <button
                    type="button"
                    onClick={() => sendNow(r.id)}
                    className="mt-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    Send now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}