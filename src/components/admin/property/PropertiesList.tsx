"use client";

import { useState } from "react";
import { Copy, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";
import { PropertyPreviewModal } from "@/components/admin/property/PropertyPreviewModal";
import { formatPrice } from "@/lib/utils";
import { PROPERTY_STATUSES, type AdminProperty, type PropertyStatus } from "@/types/property";

interface PropertiesListProps {
  properties: AdminProperty[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: PropertyStatus | "All";
  setStatusFilter: (status: PropertyStatus | "All") => void;
  onAdd: () => void;
  onEdit: (property: AdminProperty) => void;
  onDelete: (id: string) => void;
  onDuplicate: (property: AdminProperty) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
}

export function PropertiesList({
  properties,
  loading,
  page,
  setPage,
  totalPages,
  totalCount,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
}: PropertiesListProps) {
  const [previewProperty, setPreviewProperty] = useState<AdminProperty | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button onClick={onAdd}>
          <Plus className="mr-1 h-5 w-5" />
          Add property
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-neutral-400" />
          <FormInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search database by name, location, or type..."
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
          <table className="w-full min-w-[800px] text-left text-sm">
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                    Loading properties from database...
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                    No properties match your filter criteria.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/50">
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setPreviewProperty(property)}
                        className="text-left font-bold text-neutral-900 transition-colors hover:text-blue-600"
                      >
                        {property.name}
                      </button>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {property.propertyType} · {property.tenure}
                      </p>
                      {property.telegramCode && (
                        <p className="mt-1 text-xs font-mono font-semibold text-neutral-600">
                          {property.telegramCode}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      <p>{property.district}, {property.state}</p>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-400">
                        {property.address}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-black text-neutral-900">
                      {formatPrice(property.price)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={property.status} />
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

      <PaginationDashboard
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={10}
        onPageChange={setPage}
      />

      {previewProperty && (
        <PropertyPreviewModal
          property={previewProperty}
          onClose={() => setPreviewProperty(null)}
          onEdit={(property) => {
            setPreviewProperty(null);
            onEdit(property);
          }}
        />
      )}
    </div>
  );
}