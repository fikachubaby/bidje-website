import { Navbar } from "@/components/layout/Navbar";

export default function SearchPropertiesPage() {
    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <h1 className="text-3xl font-black">Search Properties</h1>
            </div>
        </main>
    );
}