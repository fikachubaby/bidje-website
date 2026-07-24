import Categories from "@/components/home/Categories";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import Footer from "@/components/home/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import HowItWorks from "@/components/home/HowItWorks";
import Navbar from "@/components/home/Navbar";
import Statistics from "@/components/home/Statistics";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <HeroSearch />
      <Statistics />
      <Categories />
      <FeaturedProperties />
      <HowItWorks />
      <Footer />
    </main>
  );
}
