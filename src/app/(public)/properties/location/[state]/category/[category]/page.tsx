import { Navbar } from "@/components/layout/Navbar";

interface StateCategoryPageProps {
    params: Promise<{ state: string; category: string }>;
}

export default async function StateCategoryPropertiesPage({ params }: StateCategoryPageProps) {
    const { state, category } = await params;

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <h1 className="text-3xl font-black capitalize">
                    {category.replace("-", " ")} Properties in {state.replace("-", " ")}
                </h1>
            </div>
        </main>
    );
}