import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { MapPin } from "lucide-react";

const VALID_STATES: Record<string, string> = {
    "kuala-lumpur": "Kuala Lumpur",
    "selangor": "Selangor",
    "perak": "Perak",
    "melaka": "Melaka",
    "negeri-sembilan": "Negeri Sembilan",
};

interface StatePageProps {
    params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
    const { state } = await params;
    const stateName = VALID_STATES[state.toLowerCase()];

    if (!stateName) {
        return { title: "Properties | Bidje" };
    }

    return {
        title: `Properties for Sale in ${stateName} | Houses, Land & Commercial | Bidje`,
        description: `Find properties for sale in ${stateName}. Browse residential houses, land, and commercial properties in ${stateName} with market valuations and direct offer tools.`,
        alternates: {
            canonical: `https://bidje.com/properties/location/${state.toLowerCase()}`,
        },
        openGraph: {
            title: `Properties for Sale in ${stateName} | Bidje`,
            description: `Explore top properties for sale across ${stateName}. Submit direct offers online with Bidje.`,
        },
    };
}

export default async function StatePropertiesPage({ params }: StatePageProps) {
    const { state } = await params;
    const stateName = VALID_STATES[state.toLowerCase()];

    if (!stateName) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl border-2 border-black bg-[#ffd400] p-8 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/70">
                        <MapPin className="h-4 w-4" /> State Region
                    </div>
                    <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                        Properties for Sale in {stateName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                        Explore residential, landed, commercial, and land listings in {stateName}.
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <Link
                        href="/properties"
                        className="text-sm font-bold text-neutral-600 hover:underline"
                    >
                        &larr; View all listings
                    </Link>
                </div>
            </div>
        </main>
    );
}