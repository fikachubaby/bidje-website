import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin } from "lucide-react";
import { FavouriteButton } from "@/components/property/FavouriteButton";

type Property = {
  id: string;
  badge: string;
  title: string;
  location: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  offers: string;
  score: number;
  rating: string;
  image: string;
};

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.07)] transition duration-300 hover:-translate-y-2 hover:border-[#ffd400] hover:shadow-[0_24px_55px_rgba(0,0,0,0.14)]">
      <div className="relative">
        <Link href={`/properties/${property.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={property.image}
              alt={property.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

            <span className="absolute left-4 top-4 rounded-full bg-[#ffd400] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide">
              {property.badge}
            </span>

            <span className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-black/70 px-3 py-2 text-white backdrop-blur">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-white/60">
                Investment Score
              </span>
              <span className="text-lg font-black text-[#ffd400]">
                {property.score}/100
              </span>
            </span>
          </div>
        </Link>

        <FavouriteButton
          propertyId={property.id}
          className="absolute right-4 top-4 z-10 shadow-lg"
        />
      </div>

      <Link href={`/properties/${property.id}`} className="block p-5 pb-0">
        <p className="text-sm font-semibold text-neutral-500">Asking Price</p>
        <p className="mt-1 text-2xl font-black tracking-tight">{property.price}</p>

        <h3 className="mt-4 text-lg font-black">{property.title}</h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
          <MapPin className="h-4 w-4 shrink-0" />
          {property.location}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-neutral-200 rounded-xl border border-neutral-200 bg-neutral-50 py-3 text-center text-sm">
          <span className="flex items-center justify-center gap-1">
            <BedDouble className="h-4 w-4" />
            {property.bedrooms}
          </span>

          <span className="flex items-center justify-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </span>

          <span>{property.size}</span>
        </div>

        <div className="mt-4 rounded-2xl border border-[#f0dda0] bg-[#fff9dc] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                Bidje Rating
              </p>
              <p className="mt-1 font-black text-green-700">{property.rating}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                Score
              </p>
              <p className="mt-1 text-xl font-black">{property.score}</p>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[#ffd400]"
              style={{ width: `${property.score}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-neutral-600">
          {property.offers}
        </p>
      </Link>

      <div className="p-5 pt-4">
        <Link
          href={`/properties/${property.id}/make-offer`}
          className="block rounded-xl border-2 border-black bg-[#ffd400] px-4 py-3.5 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
        >
          Submit Offer
        </Link>

        <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
          RM500 commitment fee applies
        </p>
      </div>
    </article>
  );
}
