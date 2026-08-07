"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader, AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { DashboardView } from "@/components/admin/dashboard/DashboardView";
import { LoginForm } from "@/components/auth/LoginForm";
import { OffersView } from "@/components/admin/offers/OffersView";
import { PropertiesView } from "@/components/admin/property/PropertiesView";
import { PropertyFormModal } from "@/components/admin/property/PropertyFormModal";
import { TelegramImportView } from "@/components/admin/telegram-import/TelegramImportView";

import { useSession } from "@/lib/auth/useSession";
import { useAdminProperties } from "@/lib/hooks/useAdminProperties";
import { supabase } from "@/lib/supabase/supabase";

import type {
  AdminProperty,
  AdminPropertyInput,
  AdminView,
  BuyerOffer,
  OfferStatus,
} from "@/types/property";

const VIEW_META: Record<AdminView, { title: string; subtitle: string }> = {
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
    subtitle: "Upload a Telegram Desktop JSON export and review property listings.",
  },
};

export default function AdminPortal() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  // Custom Hook for isolated business logic
  const {
    properties,
    saveProperty,
    deleteProperty,
    updateStatus,
    duplicateProperty,
  } = useAdminProperties(Boolean(user));

  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);

  // Modal Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingProperty(null);
    setEditorOpen(true);
  }, []);

  const handleOpenEdit = useCallback((property: AdminProperty) => {
    setEditingProperty(property);
    setEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingProperty(null);
  }, []);

  const handleSave = async (input: AdminPropertyInput) => {
    try {
      await saveProperty(input, editingProperty?.id);
      handleCloseEditor();
    } catch {
      alert("Failed to save property");
    }
  };

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMobileNav(false);
    router.push("/");
  }, [router]);

  const handleUpdateOffer = useCallback(
    async (id: string, status: OfferStatus) => {
      setOffers((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
      if (status === "Accepted") {
        const offer = offers.find((item) => item.id === id);
        if (offer) await updateStatus(offer.propertyId, "Under Offer");
      }
    },
    [offers, updateStatus]
  );

  if (sessionLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100">
        <p className="text-sm font-medium text-neutral-500">Loading admin portal…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-5 py-10">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <p className="text-3xl font-black tracking-tight">
            BIDJE<span className="text-yellow-400">.</span>
          </p>
          <h1 className="mt-6 text-2xl font-black text-neutral-900">Staff login</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to manage property listings and buyer offers.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </main>
    );
  }

  const meta = VIEW_META[activeView];

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
          {activeView === "dashboard" && (
            <DashboardView
              properties={properties}
              offers={offers}
              onAddProperty={handleOpenCreate}
            />
          )}

          {activeView === "properties" && (
            <PropertiesView
              properties={properties}
              onAdd={handleOpenCreate}
              onEdit={handleOpenEdit}
              onDelete={deleteProperty}
              onDuplicate={duplicateProperty}
              onStatusChange={updateStatus}
            />
          )}

          {activeView === "offers" && (
            <OffersView
              offers={offers}
              properties={properties}
              onUpdateStatus={handleUpdateOffer}
            />
          )}

          {activeView === "imports" && <TelegramImportView />}
        </section>
      </div>

      <PropertyFormModal
        open={editorOpen}
        editingProperty={editingProperty}
        onClose={handleCloseEditor}
        onSave={handleSave}
      />
    </div>
  );
}