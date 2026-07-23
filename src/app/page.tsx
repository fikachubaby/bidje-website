import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/home/SearchBar";
import { Categories } from "@/components/home/Categories";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { LatestListings } from "@/components/home/LatestListings";
import { getFeaturedProperties, getLatestListings } from "@/lib/properties";

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    getFeaturedProperties(),
    getLatestListings(),
  ]);

  return (
    <>
      <Hero />
      <SearchBar />
      <Categories />
      <FeaturedProperties properties={featured} />
      <LatestListings properties={latest} />
    </>
  );
}
