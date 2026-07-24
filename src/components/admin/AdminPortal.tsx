"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminHeader, AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardView } from "@/components/admin/DashboardView";
import { LoginForm } from "@/components/admin/LoginForm";
import { OffersView } from "@/components/admin/OffersView";
import { PropertiesView } from "@/components/admin/PropertiesView";
import { PropertyFormModal } from "@/components/admin/PropertyFormModal";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { isAuthenticated, login, logout } from "@/lib/admin-auth";
import {
  createProperty,
  loadOffers,
  loadProperties,
  saveOffers,
  saveProperties,
  toPropertyInput,
  updateProperty,
} from "@/lib/admin-storage";
import type {
  AdminProperty,
  AdminPropertyInput,
  AdminView,
  BuyerOffer,
  OfferStatus,
  PropertyStatus,
} from "@/types/admin";

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

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setProperties(loadProperties());
    setOffers(loadOffers());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProperties(properties);
  }, [properties, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveOffers(offers);
  }, [offers, hydrated]);

  const handleLogin = useCallback((email: string, password: string) => {
    const success = login(email, password);
    if (success) setAuthenticated(true);
    return success;
  }, []);

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

  const handleSaveProperty = useCallback(
    (input: AdminPropertyInput) => {
      if (editingProperty) {
        setProperties((items) =>
          items.map((item) =>
            item.id === editingProperty.id ? updateProperty(item, input) : item
          )
        );
      } else {
        setProperties((items) => [createProperty(input), ...items]);
      }
      closeEditor();
    },
    [editingProperty, closeEditor]
  );

  const handleDeleteProperty = useCallback((id: string) => {
    if (window.confirm("Delete this property listing? This cannot be undone.")) {
      setProperties((items) => items.filter((item) => item.id !== id));
    }
  }, []);

  const handleDuplicateProperty = useCallback((property: AdminProperty) => {
    setProperties((items) => [
      createProperty({
        ...toPropertyInput(property),
        name: `${property.name} (Copy)`,
        status: "Draft",
      }),
      ...items,
    ]);
  }, []);

  const handleStatusChange = useCallback((id: string, status: PropertyStatus) => {
    setProperties((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }, []);

  const handleUpdateOffer = useCallback((id: string, status: OfferStatus) => {
    setOffers((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));

    if (status === "Accepted") {
      const offer = offers.find((item) => item.id === id);
      if (offer) {
        setProperties((items) =>
          items.map((item) =>
            item.id === offer.propertyId ? { ...item, status: "Under Offer" } : item
          )
        );
      }
    }
  }, [offers]);

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
          actions={
            activeView === "properties" ? (
              <AdminButton onClick={openCreate}>
                <Plus className="h-5 w-5" />
                Add property
              </AdminButton>
            ) : null
          }
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
