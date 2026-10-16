"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { RoundIconButton } from "@/components/property/RoundIconButton";

interface ShareButtonProps {
  title: string;
  text?: string;
  /** Path or absolute URL to share; defaults to the current page. */
  url?: string;
  className?: string;
}

/** Opens the device share sheet, or copies the page link where sharing isn't supported. */
export function ShareButton({ title, text, url: shareUrl, className }: ShareButtonProps) {
  async function handleShare(e: React.MouseEvent) {
    // Cards may wrap the button in a link; don't navigate when sharing.
    e.preventDefault();
    e.stopPropagation();
    const url = shareUrl ? new URL(shareUrl, window.location.origin).href : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // AbortError just means the user closed the share sheet.
        if ((err as Error).name !== "AbortError") toast.error("Couldn't share this property");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <RoundIconButton onClick={handleShare} className={className} aria-label="Share this property">
      <Share2 className="h-5 w-5 text-neutral-700" />
    </RoundIconButton>
  );
}
