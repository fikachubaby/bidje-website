import HeroSearch from "@/components/ui/HeroSearch";
import HowItWorks from "@/components/home/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";
import Statistics from "@/components/home/Statistics";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { CategoryBrowser } from "@/components/home/CategoryBrowser";

export default function HomePage() {
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
