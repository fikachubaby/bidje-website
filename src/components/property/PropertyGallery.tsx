"tsx"
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback if images array is empty
  const safeImages = images.length > 0 ? images : ["/placeholder-property.jpg"];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Display Frame */}
      <div className="relative group aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm">
        <Image
          src={safeImages[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          priority
          className="object-cover transition-transform duration-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
          sizes="(max-width: 1024px) 100vw, 75vw"
        />

        {/* Zoom Action Overlay Icon */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="absolute right-4 top-4 rounded-full bg-black/60 p-2.5 text-white backdrop-blur-md transition hover:bg-black/80"
          aria-label="Zoom image"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Carousel Navigation Arrows (Visible on Hover if multiple images) */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-black shadow-md backdrop-blur-md transition hover:bg-white opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-black shadow-md backdrop-blur-md transition hover:bg-white opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        <div className="absolute bottom-4 right-4 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
          {currentIndex + 1} / {safeImages.length}
        </div>
      </div>

      {/* Thumbnails Track (Supports 1 to 15+ images scrollable horizontally) */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${currentIndex === idx
                  ? "border-[#ffd400] scale-95 shadow-md"
                  : "border-transparent opacity-70 hover:opacity-100"
                }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative h-[85vh] w-[85vw] max-w-6xl">
            <Image
              src={safeImages[currentIndex]}
              alt={`${title} zoomed view`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}