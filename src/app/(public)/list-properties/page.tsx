"use client";

import { useState } from "react";
import { ListPropertyModal } from "@/components/property/ListPropertyModal";
import { Navbar } from "@/components/layout/Navbar";

export default function ListPropertyPage() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <main className="min-h-screen bg-neutral-900">
            <Navbar />
            <ListPropertyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </main>
    );
}