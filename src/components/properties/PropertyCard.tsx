import Image from "next/image";
import Link from "next/link";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
import type { Property } from "@/types/property";
import { formatArea, formatCategory, formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-brand/30 hover:shadow-xl hover:shadow-neutral-900/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-800 backdrop-blur-sm">
          {formatCategory(property.category)}
        </span>
        {property.category === "auction" && (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            Auction
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xl font-bold text-neutral-900">
          {formatPrice(property.price, property.currency)}
        </p>
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-neutral-800 group-hover:text-brand">
          {property.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.location}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
          {property.bedrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            {formatArea(property.areaSqft)}
          </span>
        </div>
      </div>
    </Link>
  );
}
