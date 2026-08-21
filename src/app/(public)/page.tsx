import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import HeroSearch from "@/components/ui/HeroSearch";
import HowItWorks from "@/components/home/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";
import Statistics from "@/components/home/Statistics";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { PropertyBrowseTabs } from "@/components/home/PropertyBrowseTabs";
import type { DBProperty, DBPropertyImage } from "@/types/property";

export default async function HomePage() {
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

  // Fetch a reasonable pool of live, published properties for the browse widget.
  // We over-fetch a bit (60) since it's split three ways (type / hot / urgent) client-side.
  const { data: browseProperties, error } = await supabase
    .from("properties")
    .select(`
      id, title, asking_price, full_address, state, district,
      property_type, area_sqft, bedrooms, bathrooms,
      is_featured, urgent_sale, status, bidje_score,
      property_images ( image_url, is_cover, display_order )
    `)
    .in("status", ["Published"])
    .order("created_at", { ascending: false })
    .limit(60);

  console.log("browseProperties:", browseProperties?.length, "error:", error);

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <HeroSearch />
      <FeaturedListings />
      <Statistics />
      <PropertyBrowseTabs properties={browseProperties ?? []} />
      <HowItWorks />
    </main>
  );
}