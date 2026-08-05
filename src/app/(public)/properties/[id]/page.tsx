import { Navbar } from "@/components/layout/Navbar";
import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/properties/properties";

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);
    
    if (!property) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                {/* Render property details here */}
            </div>
        </main>
    );
}