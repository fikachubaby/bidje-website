"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader, AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { DashboardView } from "@/components/admin/dashboard/DashboardView";
import { LoginForm } from "@/components/admin/auth/LoginForm";
import { OffersView } from "@/components/admin/offers/OffersView";
import { PropertiesView } from "@/components/admin/property/PropertiesView";
import { PropertyFormModal } from "@/components/admin/property/PropertyFormModal";
import { TelegramImportView } from "@/components/admin/telegram-import/TelegramImportView";
import { isAuthenticated, login, logout } from "@/lib/auth/admin-auth";
import type {
  AdminProperty,
  AdminPropertyInput,
  AdminView,
  BuyerOffer,
  OfferStatus,
  PropertyStatus,
} from "@/types/property";

const viewMeta: Record<AdminView, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of your property listings and buyer activity.",
  },
  properties: {
    title: "Property management",
    subtitle: "Add, edit, publish, duplicate, or delete listings.",
  },
  offers: {
    title: "Buyer offers",
    subtitle: "Review incoming offers and update their status.",
  },
  imports: {
    title: "Telegram Import",
    subtitle:
      "Upload a Telegram Desktop JSON export and review property listings before importing.",
  },
};

export default function AdminPortal() {
  const [authenticated, setAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);

  // Fetch properties from Supabase API
  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/properties");
      const data = await res.json();
      if (res.ok) {
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  }, []);

  // Fetch offers from Supabase API (Replace with your actual offers endpoint if path differs)
  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/offers");
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  }, []);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    if (isAuthenticated()) {
      fetchProperties();
      fetchOffers();
    }
    setHydrated(true);
  }, [fetchProperties, fetchOffers]);

  const handleLogin = useCallback((email: string, password: string) => {
    const success = login(email, password);
    if (success) {
      setAuthenticated(true);
      fetchProperties();
      fetchOffers();
    }
    return success;
  }, [fetchProperties, fetchOffers]);

  const handleSignOut = useCallback(() => {
    logout();
    setAuthenticated(false);
    setMobileNav(false);
  }, []);

  const openCreate = useCallback(() => {
    setEditingProperty(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((property: AdminProperty) => {
    setEditingProperty(property);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingProperty(null);
  }, []);

  // Save (Create or Update)
  const handleSaveProperty = useCallback(
    async (input: AdminPropertyInput) => {
      try {
        const isEdit = Boolean(editingProperty);
        const endpoint = isEdit
          ? `/api/admin/properties/${editingProperty?.id}`
          : "/api/admin/properties";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!res.ok) throw new Error("Failed to save property");

        await fetchProperties();
        closeEditor();
      } catch (err) {
        console.error("Save error:", err);
        alert("Failed to save property");
      }
    },
    [editingProperty, closeEditor, fetchProperties]
  );

  // Delete
  const handleDeleteProperty = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this property listing? This cannot be undone.")) return;

      try {
        const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete property");
        await fetchProperties();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete property");
      }
    },
    [fetchProperties]
  );

  // Status Change API helper
  const handleStatusChange = useCallback(
    async (id: string, status: PropertyStatus) => {
      try {
        const res = await fetch(`/api/admin/properties/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) throw new Error("Failed to update status");
        await fetchProperties();
      } catch (err) {
        console.error("Status update error:", err);
      }
    },
    [fetchProperties]
  );

  // Duplicate Property
  const handleDuplicateProperty = useCallback(
    async (property: AdminProperty) => {
      try {
        const duplicateInput: AdminPropertyInput = {
          name: `${property.name} (Copy)`,
          price: property.price,
          address: property.address,
          state: property.state,
          district: property.district,
          propertyType: property.propertyType,
          tenure: property.tenure,
          bumiStatus: property.bumiStatus,
          landSize: property.landSize,
          builtUp: property.builtUp,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          description: property.description,
          mapsUrl: property.mapsUrl,
          images: property.images || [],
          status: "Draft" as PropertyStatus,
        };

        const res = await fetch("/api/admin/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(duplicateInput),
        });

        if (!res.ok) throw new Error("Failed to duplicate property");
        await fetchProperties();
      } catch (err) {
        console.error("Duplicate error:", err);
      }
    },
    [fetchProperties]
  );

  // Update Offer Status (Sync with backend API if available)
  const handleUpdateOffer = useCallback(async (id: string, status: OfferStatus) => {
    try {
      // Optional: Add backend API call here if you have an /api/admin/offers/[id] endpoint
      /*
      await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      */

      setOffers((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));

      if (status === "Accepted") {
        const offer = offers.find((item) => item.id === id);
        if (offer) {
          await handleStatusChange(offer.propertyId, "Under Offer");
        }
      }
    } catch (err) {
      console.error("Error updating offer:", err);
    }
  }, [offers, handleStatusChange]);

  if (!hydrated) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100">
        <p className="text-sm font-medium text-neutral-500">Loading admin portal…</p>
      </main>
    );
  }

  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const meta = viewMeta[activeView];

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
        onSignOut={handleSignOut}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <AdminHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setMobileNav(true)}
        />

        <section className="flex-1 p-5 lg:p-8">
          {activeView === "dashboard" ? (
            <DashboardView
              properties={properties}
              offers={offers}
              onAddProperty={openCreate}
            />
          ) : null}

          {activeView === "properties" ? (
            <PropertiesView
              properties={properties}
              onAdd={openCreate}
              onEdit={openEdit}
              onDelete={handleDeleteProperty}
              onDuplicate={handleDuplicateProperty}
              onStatusChange={handleStatusChange}
            />
          ) : null}

          {activeView === "offers" ? (
            <OffersView
              offers={offers}
              properties={properties}
              onUpdateStatus={handleUpdateOffer}
            />
          ) : null}

          {activeView === "imports" ? <TelegramImportView /> : null}
        </section>
      </div>

      <PropertyFormModal
        open={editorOpen}
        editingProperty={editingProperty}
        onClose={closeEditor}
        onSave={handleSaveProperty}
      />
    </div>
  );
}