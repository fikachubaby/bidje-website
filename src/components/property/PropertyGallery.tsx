"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

function isVideoUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes(".mp4") || lower.startsWith("data:video/mp4");
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const mainMedia = images[0];
  const secondaryMedia = images.slice(1, 5);
  const remainingCount = Math.max(0, images.length - 5);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : (prev as number) - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : (prev as number) + 1));
  };

  return (
    <>
      {/* Media Gallery Grid */}
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:gap-3">
        {/* Main Feature Item */}
        <div
          onClick={() => openLightbox(0)}
          className="relative cursor-pointer overflow-hidden bg-neutral-900 md:col-span-2 md:row-span-2 min-h-65 md:min-h-105 group"
        >
          {isVideoUrl(mainMedia) ? (
            <div className="relative h-full w-full flex items-center justify-center bg-black">
              <video
                src={mainMedia}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                muted
                playsInline
                autoPlay
                loop
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute rounded-full bg-black/60 p-3 text-white backdrop-blur-sm">
                <Play className="h-6 w-6 fill-white" />
              </div>
            </div>
          ) : (
            <Image
              src={mainMedia}
              alt={`${title} - Main View`}
              fill
              priority
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          )}
        </div>

        {/* Secondary Gallery Items */}
        {secondaryMedia.map((mediaUrl, idx) => {
          const actualIndex = idx + 1;
          const isLast = idx === 3 && remainingCount > 0;
          const isVideo = isVideoUrl(mediaUrl);

          return (
            <div
              key={`${mediaUrl}-${actualIndex}`}
              onClick={() => openLightbox(actualIndex)}
              className="relative min-h-32.5 md:min-h-50 cursor-pointer overflow-hidden bg-neutral-900 group"
            >
              {isVideo ? (
                <div className="relative h-full w-full flex items-center justify-center bg-black">
                  <video
                    src={mediaUrl}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    muted
                    playsInline
                  />
                  <div className="absolute rounded-full bg-black/60 p-2 text-white backdrop-blur-sm">
                    <Play className="h-4 w-4 fill-white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={mediaUrl}
                  alt={`${title} - Image ${actualIndex + 1}`}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              )}

              {/* View All Overlay */}
              {isLast && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                  <span className="text-xl font-extrabold">+{remainingCount}</span>
                  <span className="text-xs font-semibold">More Media</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          {/* Top Action Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            <span className="text-xs font-bold text-white/80">
              {selectedIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
                aria-label="Next media"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Lightbox Content View */}
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-xl">
            {isVideoUrl(images[selectedIndex]) ? (
              <video
                src={images[selectedIndex]}
                controls
                autoPlay
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={images[selectedIndex]}
                alt={`${title} full view`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}