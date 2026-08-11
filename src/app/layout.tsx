import type { Metadata } from "next";
import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bidje.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bidje | Real Estate & Direct Property Offers in Malaysia",
    template: "%s | Bidje",
  },
  description: "Buy and sell residential properties, land, and commercial units in KL, Selangor, Perak, Melaka, and Negeri Sembilan.",
  keywords: [
    "Property Malaysia",
    "Rumah untuk dijual",
    "Kuala Lumpur properties",
    "Selangor real estate",
    "Perak land for sale",
    "Direct property offer",
    "Bidje score"
  ],
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: siteUrl,
    siteName: "Bidje",
    title: "Bidje | Real Estate & Direct Property Offers in Malaysia",
    description: "Buy and sell residential properties, land, and commercial units across Malaysia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bidje | Real Estate & Direct Property Offers",
    description: "Buy and sell residential properties, land, and commercial units across Malaysia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <Toaster richColors position="top-right" />
        <Footer />
      </body>
    </html>
  );
}
