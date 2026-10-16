import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-neutral-50 text-black">
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                <main>{children}</main>
            </div>
        </div>
    );
}