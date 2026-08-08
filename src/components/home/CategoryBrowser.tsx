import Link from "next/link";
import {
    Building2,
    Home,
    Store,
    Gavel,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";

interface CategoryItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    badge: string;
    icon: React.ElementType;
    colorBg: string;
    iconBg: string;
    iconColor: string;
}

const CATEGORIES: CategoryItem[] = [
    {
        id: "landed",
        slug: "landed",
        title: "Landed Properties",
        description: "Terrace, semi-detached, and bungalows with private compound space.",
        badge: "Popular",
        icon: Home,
        colorBg: "hover:border-[#ffd400]/60 hover:bg-[#fffdf0]",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-800",
    },
    {
        id: "high-rise",
        slug: "high-rise",
        title: "High-Rise Units",
        description: "Condominiums, apartments, and serviced suites with full amenities.",
        badge: "High Demand",
        icon: Building2,
        colorBg: "hover:border-blue-300 hover:bg-blue-50/40",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-800",
    },
    {
        id: "commercial",
        slug: "commercial",
        title: "Commercial Units",
        description: "Shoplots, office suites, and retail hubs ideal for business yield.",
        badge: "High Yield",
        icon: Store,
        colorBg: "hover:border-emerald-300 hover:bg-emerald-50/40",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-800",
    },
    {
        id: "auction",
        slug: "auction",
        title: "Bank Auctions",
        description: "Distressed and bank-foreclosed properties below estimated market value.",
        badge: "Below Market",
        icon: Gavel,
        colorBg: "hover:border-purple-300 hover:bg-purple-50/40",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-800",
    },
];

export function CategoryBrowser() {
    return (
        <section className="bg-white py-16 sm:py-24 border-b border-neutral-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-neutral-700">
                        <Sparkles className="h-3.5 w-3.5 text-black" />
                        Explore Investment Options
                    </div>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                        Browse by Property Type
                    </h2>
                    <p className="mt-2 max-w-xl text-base text-neutral-600">
                        Find the right asset class tailored to your investment target and budget requirements.
                    </p>
                </div>

                {/* Category Grid */}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                href={`/properties?category=${category.slug}`}
                                className={`group relative flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 transition duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md ${category.colorBg}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${category.iconBg} ${category.iconColor}`}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </div>

                                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-neutral-700 group-hover:bg-black group-hover:text-white transition-colors">
                                            {category.badge}
                                        </span>
                                    </div>

                                    <h3 className="mt-6 text-xl font-extrabold text-black">
                                        {category.title}
                                    </h3>

                                    <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                                        {category.description}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs font-bold text-black">
                                    <span>Explore listings</span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-neutral-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-[#ffd400]">
                                        <ArrowUpRight className="h-3.5 w-3.5 text-black" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}