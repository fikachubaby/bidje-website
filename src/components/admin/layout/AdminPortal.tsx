"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { translate as t } from "@/lib/i18n/getTranslation";
import { AdminHeader, AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { DashboardView } from "@/components/admin/dashboard/DashboardView";
import { LoginForm } from "@/components/auth/LoginForm";
import { OffersView } from "@/components/admin/offers/OffersView";
import { PropertiesList } from "@/components/admin/property/PropertiesList";
import { PropertyFormModal } from "@/components/admin/property/PropertyFormModal";
import { TelegramImportView } from "@/components/admin/telegram-import/TelegramImportView";
import { UsersManagementView } from "@/components/admin/settings/UsersManagementView";
import { AuditLogsView } from "@/components/admin/settings/AuditLogsView";
import { ProfileView } from "@/components/admin/settings/ProfileView";
import { SubscriberManagement } from "@/components/admin/subscriber/SubscriberManagement";

import { useSession } from "@/lib/auth/useSession";
import { useAdminProperties, useAdminOffers } from "@/lib/hooks/useAdminProperties";
import { supabase } from "@/lib/supabase/supabase";
import { VIEW_META } from "@/config/adminMeta";

import type {
  AdminProperty,
  AdminPropertyInput,
  AdminView,
  OfferStatus,
} from "@/types/property";

export default function AdminPortal() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const {
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
    saveProperty,
    deleteProperty,
    updateStatus,
    duplicateProperty,
  } = useAdminProperties(Boolean(user));

  const {
    offers,
    loading: loadingOffers,
    page: offersPage,
    setPage: setOffersPage,
    totalPages: offersTotalPages,
    totalCount: totalOffersCount,
    search: offersSearch,
    setSearch: setOffersSearch,
    statusFilter: offersStatusFilter,
    setStatusFilter: setOffersStatusFilter,
    updateOfferStatus
  } = useAdminOffers(Boolean(user));
  
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);

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
      const isEditing = Boolean(editingProperty);
      await saveProperty(input, editingProperty?.id);

      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        actor_id: userData.user?.id || null,
        action: isEditing ? `Updated property '${input.name}'` : `Created property '${input.name}'`,
        entity: "properties",
        entity_id: editingProperty?.id || null,
      });

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
      try {
        await updateOfferStatus(id, status);
        if (status === "Accepted") {
          const offer = offers.find((item) => item.id === id);
          if (offer) await updateStatus(offer.propertyId, "Under Offer");
        }
      } catch {
        alert("Failed to update offer status");
      }
    },
    [offers, updateStatus, updateOfferStatus]
  );

  if (sessionLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100">
        <p className="text-sm font-medium text-neutral-500">{t("Main.status.loadingInfo")}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-5 py-10">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <p className="text-3xl font-black tracking-tight">
            {t("Main.title")}<span className="text-yellow-400">.</span>
          </p>
          <h1 className="mt-6 text-2xl font-black text-neutral-900">{t("AdminManagement.staff")} {t("Authentication.signIn")}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {t("Main.heading3")}
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </main>
    );
  }

  const meta = VIEW_META[activeView] || VIEW_META.dashboard;

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <AdminHeader
          title={meta.title}
          subtitle={meta.subtitle}
          userEmail={user.email}
          onMenuClick={() => setMobileNav(true)}
          onNavigate={setActiveView}
          onSignOut={handleSignOut}
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
            <PropertiesList
              properties={properties}
              loading={loading}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              totalCount={totalCount}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
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
              loading={loadingOffers}
              page={offersPage}
              setPage={setOffersPage}
              totalPages={offersTotalPages}
              totalCount={totalOffersCount}
              search={offersSearch}
              setSearch={setOffersSearch}
              statusFilter={offersStatusFilter}
              setStatusFilter={setOffersStatusFilter}
              onUpdateStatus={handleUpdateOffer}
            />
          )}

          {activeView === "subscribers" && <SubscriberManagement />}
          {activeView === "imports" && <TelegramImportView />}

          {/* New Settings & Profile View Components */}
          {activeView === "users" && <UsersManagementView />}
          {activeView === "audit-logs" && <AuditLogsView />}
          {activeView === "profile" && <ProfileView user={user} />}
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