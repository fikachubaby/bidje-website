"use client";

import { Copy, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PROPERTY_STATUSES, type AdminProperty, type PropertyStatus } from "@/types/property";

interface PropertiesViewProps {
  properties: AdminProperty[];
  onAdd: () => void;
  onEdit: (property: AdminProperty) => void;
  onDelete: (id: string) => void;
  onDuplicate: (property: AdminProperty) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
}

export function PropertiesView({
  properties,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
}: PropertiesViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "All">("All");

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return properties.filter((property) => {
      const matchesSearch =
        !term ||
        [
          property.name,
          property.address,
          property.state,
          property.district,
          property.propertyType,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesStatus = statusFilter === "All" || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <AdminButton onClick={onAdd}>
          <Plus className="h-5 w-5" />
          Add property
        </AdminButton>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-neutral-400" />
          <FormInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location, or type"
            className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
          />
        </div>
        <FormSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | "All")}
          className="mt-0 sm:w-48"
        >
          <option value="All">All statuses</option>
          {PROPERTY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-5 py-4 font-bold text-neutral-600">Property</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Location</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Price</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Status</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                    No properties match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((property) => (
                  <tr key={property.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-bold text-neutral-900">{property.name}</p>
                      <p className="text-neutral-500">
                        {property.propertyType} · {property.tenure} · {property.bumiStatus}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      <p>{property.district}, {property.state}</p>
                      <p className="mt-1 max-w-xs truncate text-xs text-neutral-400">
                        {property.address}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-black text-neutral-900">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <StatusBadge status={property.status} />
                        <FormSelect
                          value={property.status}
                          onChange={(e) =>
                            onStatusChange(property.id, e.target.value as PropertyStatus)
                          }
                          className="mt-0 py-2 text-xs"
                        >
                          {PROPERTY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </FormSelect>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(property)}
                          className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                          aria-label="Edit property"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicate(property)}
                          className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                          aria-label="Duplicate property"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(property.id)}
                          className="rounded-lg border border-neutral-200 p-2 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete property"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        Showing {filtered.length} of {properties.length} properties
      </p>
    </div>
  );
}