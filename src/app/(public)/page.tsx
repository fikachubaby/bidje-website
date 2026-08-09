import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import HeroSearch from "@/components/ui/HeroSearch";
import HowItWorks from "@/components/home/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";
import Statistics from "@/components/home/Statistics";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { CategoryBrowser } from "@/components/home/CategoryBrowser";

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

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <HeroSearch />
      <FeaturedListings />
      <Statistics />
      <CategoryBrowser />
      <HowItWorks />
    </main>
  );
}