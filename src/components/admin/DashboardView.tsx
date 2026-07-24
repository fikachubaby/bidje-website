"use client";

import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatCard } from "@/components/admin/ui/StatCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import type { AdminProperty, BuyerOffer } from "@/types/admin";

interface DashboardViewProps {
  properties: AdminProperty[];
  offers: BuyerOffer[];
  onAddProperty: () => void;
}

export function DashboardView({ properties, offers, onAddProperty }: DashboardViewProps) {
  const published = properties.filter((p) => p.status === "Published").length;
  const underOffer = properties.filter((p) => p.status === "Under Offer").length;
  const sold = properties.filter((p) => p.status === "Sold").length;
  const pendingOffers = offers.filter((o) => o.status === "Pending").length;

  const recent = [...properties]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <AdminButton onClick={onAddProperty}>
          <Plus className="h-5 w-5" />
          Add property
        </AdminButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total properties" value={properties.length} />
        <StatCard label="Published" value={published} />
        <StatCard label="Under offer" value={underOffer} />
        <StatCard label="Pending offers" value={pendingOffers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-black text-neutral-900">Recent properties</h2>
          <p className="mt-1 text-sm text-neutral-500">Latest updated listings in your CMS.</p>

          <div className="mt-6 divide-y divide-neutral-100">
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                No properties yet. Add your first listing to get started.
              </p>
            ) : (
              recent.map((property) => (
                <div
                  key={property.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-neutral-900">{property.name}</p>
                    <p className="text-sm text-neutral-500">
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

        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-neutral-900">Quick stats</h2>
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-neutral-500">Draft listings</dt>
              <dd className="font-black">{properties.filter((p) => p.status === "Draft").length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-neutral-500">Sold</dt>
              <dd className="font-black">{sold}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-neutral-500">Total offers</dt>
              <dd className="font-black">{offers.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-neutral-500">Accepted offers</dt>
              <dd className="font-black">
                {offers.filter((o) => o.status === "Accepted").length}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  );
}
