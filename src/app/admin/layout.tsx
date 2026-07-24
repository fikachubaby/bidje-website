import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bidje Admin — Property CMS",
  description: "Staff administration portal for managing Bidje property listings and buyer offers.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-neutral-100">{children}</div>;
}
