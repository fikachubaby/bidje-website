import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, ImageOff } from "lucide-react";

import { FavouriteButton } from "@/components/property/FavouriteButton";
import type { Property } from "@/types/property";
import { formatArea, formatCategory, formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

function getRatingLabel(score: number): string {
  if (score >= 80) return "Good Buy";
  if (score >= 65) return "Fair Value";
  return "Review Carefully";
}

export function PropertyCard({ property }: PropertyCardProps) {
  const hasValidImages =
    (property.imageUrl && property.imageUrl.trim() !== "") ||
    (Array.isArray(property.images) && property.images.length > 0 && property.images[0]?.trim() !== "");

  const image = hasValidImages
    ? (property.imageUrl || property.images?.[0])
    : "/placeholder-property.jpg";

  const score = property.bidjeScore ?? 85;
  const ratingLabel = getRatingLabel(score);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-[#ffd400] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]">
      <div className="relative">
        <Link href={`/properties/${property.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
            {hasValidImages ? (
              <Image
                src={image!}
                alt={property.title || "Property image"}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              /* Custom "No Image Available" State */
              <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 text-neutral-400 transition duration-700 group-hover:scale-105">
                <ImageOff className="h-10 w-10 stroke-1 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">No Image Available</span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

            <span className="absolute left-4 top-4 rounded-full bg-[#ffd400] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black">
              {formatCategory(property.category)}
            </span>

            <span className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-black/70 px-3 py-2 text-white backdrop-blur">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-white/60">
                Investment Score
              </span>
              <span className="text-lg font-black text-[#ffd400]">
                {score}/100
              </span>
            </span>
          </div>
        </Link>

        <FavouriteButton
          propertyId={property.id}
          className="absolute right-4 top-4 z-10 shadow-lg"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Asking Price</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-black">
            {formatPrice(property.price, property.currency)}
          </p>

          <Link href={`/properties/${property.id}`} className="block">
            <h3 className="mt-3 line-clamp-1 text-lg font-black text-black transition-colors group-hover:text-neutral-800">
              {property.title}
            </h3>
          </Link>

          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-neutral-600">
            <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="line-clamp-1">{property.location}</span>
          </p>

          {/* Key Specs */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-neutral-200 rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-center text-xs font-bold text-neutral-700">
            <span className="flex items-center justify-center gap-1">
              <BedDouble className="h-4 w-4 text-neutral-500" />
              {property.bedrooms ?? "-"} Bed
            </span>

            <span className="flex items-center justify-center gap-1">
              <Bath className="h-4 w-4 text-neutral-500" />
              {property.bathrooms ?? "-"} Bath
            </span>

            <span className="flex items-center justify-center">
              {property.areaSqft ? formatArea(property.areaSqft) : "N/A"}
            </span>
          </div>

          {/* Investment Rating Box */}
          <div className="mt-4 rounded-2xl border border-[#f0dda0] bg-[#fff9dc] p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                  Bidje Rating
                </p>
                <p className="mt-0.5 text-xs font-black text-green-700">{ratingLabel}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                  Score
                </p>
                <p className="mt-0.5 text-base font-black text-black">{score}</p>
              </div>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#ffd400]"
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <Link
            href={`/properties/${property.id}/make-offer`}
            className="block w-full rounded-xl border-2 border-black bg-[#ffd400] py-3 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
          >
            Submit Offer
          </Link>

          <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
            RM500 commitment fee applies
          </p>
        </div>
      </div>
    </article>
  );
}