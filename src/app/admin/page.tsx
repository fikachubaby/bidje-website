import { Suspense } from "react";
import AdminPortal from "@/components/admin/layout/AdminPortal";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-neutral-100">
          <p className="text-sm font-medium text-neutral-500">Loading...</p>
        </main>
      }
    >
      <AdminPortal />
    </Suspense>
  );
}
