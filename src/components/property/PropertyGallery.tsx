"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, X } from "lucide-react";
import { FavouriteButton } from "@/components/property/FavouriteButton";

interface PropertyGalleryProps {
  propertyId: string;
  title: string;
  images: string[];
  urgentSale?: boolean;
}

export function PropertyGallery({
  propertyId,
  title,
  images,
  urgentSale,
}: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const mainImage = images[0];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
        <div className="relative aspect-[16/10] sm:aspect-[16/9]">
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>

        {urgentSale && (
          <span className="absolute left-4 top-4 rounded-full bg-brand px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-black shadow-sm">
            Urgent Sale
          </span>
        )}

        <div className="absolute right-4 top-4">
          <FavouriteButton propertyId={propertyId} />
        </div>

        <button
          type="button"
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black"
        >
          <Images className="h-4 w-4" />
          View All Photos
        </button>
      </div>

      {showAllPhotos && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 sm:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                All Photos ({images.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowAllPhotos(false)}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Close photo gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt={`${title} — photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
