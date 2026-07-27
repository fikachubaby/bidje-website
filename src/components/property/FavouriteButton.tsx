"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  propertyId: string;
  className?: string;
}

export function FavouriteButton({ propertyId, className }: FavouriteButtonProps) {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bidje-favourites");
    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        setIsFavourite(ids.includes(propertyId));
      } catch {
        /* ignore invalid storage */
      }
    }
  }, [propertyId]);

  function toggleFavourite() {
    const stored = localStorage.getItem("bidje-favourites");
    let ids: string[] = [];
    if (stored) {
      try {
        ids = JSON.parse(stored);
      } catch {
        ids = [];
      }
    }

    const next = isFavourite
      ? ids.filter((id) => id !== propertyId)
      : [...ids, propertyId];

    localStorage.setItem("bidje-favourites", JSON.stringify(next));
    setIsFavourite(!isFavourite);
  }

  return (
    <button
      type="button"
      onClick={toggleFavourite}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white",
        className
      )}
      aria-label={isFavourite ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={isFavourite}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isFavourite ? "fill-red-500 text-red-500" : "text-neutral-700"
        )}
      />
    </button>
  );
}
