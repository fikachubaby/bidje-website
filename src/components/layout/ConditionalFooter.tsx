"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return <Footer isAdmin={isAdmin} />;
}