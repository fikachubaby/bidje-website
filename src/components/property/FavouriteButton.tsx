"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { RoundIconButton } from "@/components/property/RoundIconButton";

interface FavouriteButtonProps {
  propertyId: string;
  className?: string;
}

export function FavouriteButton({ propertyId, className }: FavouriteButtonProps) {
  const { isSaved, toggle, ready } = useWishlist();
  const saved = isSaved(propertyId);

  return (
    <RoundIconButton
      onClick={(e) => {
        // Cards wrap the button in a link; don't navigate when favouriting.
        e.preventDefault();
        e.stopPropagation();
        void toggle(propertyId);
      }}
      disabled={!ready}
      className={className}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
    >
      <Heart
        className={cn("h-5 w-5 transition-colors", saved ? "fill-red-500 text-red-500" : "text-neutral-700")}
      />
    </RoundIconButton>
  );
}
