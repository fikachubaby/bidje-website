import Categories from "@/components/home/Categories";
import HeroSearch from "@/components/ui/HeroSearch";
import HowItWorks from "@/components/home/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";
import Statistics from "@/components/home/Statistics";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <HeroSearch />
      <Statistics />
      <Categories />
      <HowItWorks />
    </main>
  );
}
