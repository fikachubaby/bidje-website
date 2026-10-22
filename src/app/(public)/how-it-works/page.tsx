import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import HowItWorks from "@/components/home/HowItWorks";

export const metadata: Metadata = {
    title: "How It Works | Bidje",
};

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <HowItWorks />
        </main>
    );
}
