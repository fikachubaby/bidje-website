import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import HeroSearch from "@/components/ui/HeroSearch";
import HowItWorks from "@/components/home/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { PropertyBrowseTabs } from "@/components/home/PropertyBrowseTabs";
import SubscriptionBanner from "@/components/home/SubscriptionBanner";
import { PROPERTY_TYPES } from "@/types/property";

const PAGE_SIZE_OPTIONS = [9, 18, 27, 54];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string; size?: string }>;
}) {
  const sp = await searchParams;

  const sizeParam = Number(sp.size);
  const pageSize = PAGE_SIZE_OPTIONS.includes(sizeParam) ? sizeParam : 9;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const activeType = PROPERTY_TYPES.find((t) => t === sp.type);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  // Fetch only the current page of live, published properties.
  // `count: "exact"` returns the real total in the DB for the pagination footer.
  let query = supabase
    .from("properties")
    .select(
      `
      id, title, slug, asking_price, full_address, state, district,
      property_type, area_sqft, bedrooms, bathrooms,
      is_featured, urgent_sale, status, bidje_score,
      property_images ( image_url, is_cover, display_order )
    `,
      { count: "exact" }
    )
    .in("status", ["Published"])
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (activeType) {
    query = query.eq("property_type", activeType);
  }

  const { data: browseProperties, count, error } = await query;

  if (error) {
    console.error("browseProperties error:", error);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <HeroSearch />
      <FeaturedListings />
      <SubscriptionBanner />
      <PropertyBrowseTabs
        properties={browseProperties ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        activeType={activeType ?? "All"}
      />
      <HowItWorks />
    </main>
  );
}
