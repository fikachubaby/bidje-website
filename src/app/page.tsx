import { Hero } from "@/components/home/Hero";
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
      <Hero featuredProperty={featured[0]} />
      <div className="bg-white pt-20 sm:pt-24">
        <Categories />
        <FeaturedProperties properties={featured} />
        <LatestListings properties={latest} />
      </div>
    </>
  );
}
