"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type JSZip from "jszip";
import {
  getDuplicateCodes,
  loadPhotoBlob,
  parseTelegramExportZip,
} from "@/lib/telegram/telegram-import";
import type {
  TelegramListingFilter,
  TelegramParseProgress,
  TelegramParsedProperty,
} from "@/types/telegram-import";
import { ListingTable } from "./ListingTable";
import { ReviewModal } from "./ReviewModal";
import { SummaryCards } from "./SummaryCards";
import { UploadSection } from "./UploadSection";

const PAGE_SIZE = 20;

function propertyKey(property: TelegramParsedProperty, index: number): string {
  return `${property.telegramCode}::${property.messageIds[0] ?? index}`;
}

export function TelegramImportView() {
  const zipRef = useRef<JSZip | null>(null);
  const zipEntryByPhotoPathRef = useRef<Record<string, string>>({});
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState<TelegramParseProgress | null>(null);
  const [properties, setProperties] = useState<TelegramParsedProperty[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [parsed, setParsed] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TelegramListingFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [reviewDraft, setReviewDraft] = useState<TelegramParsedProperty | null>(null);
  const [reviewMainUrl, setReviewMainUrl] = useState<string | null>(null);

  const revokeAllObjectUrls = useCallback(() => {
    for (const url of objectUrlsRef.current.values()) {
      URL.revokeObjectURL(url);
    }
    objectUrlsRef.current.clear();
    setThumbnails({});
    setReviewMainUrl(null);
  }, []);

  const clearFile = useCallback(() => {
    revokeAllObjectUrls();
    zipRef.current = null;
    zipEntryByPhotoPathRef.current = {};
    setFile(null);
    setError(null);
    setParsing(false);
    setProgress(null);
    setProperties([]);
    setMessageCount(0);
    setParsed(false);
    setSearch("");
    setFilter("all");
    setPage(1);
    setSelected(new Set());
    setReviewIndex(null);
    setReviewDraft(null);
  }, [revokeAllObjectUrls]);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls.values()) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  const acceptFile = useCallback((next: File | null) => {
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".zip")) {
      setError("Please upload a .zip file.");
      return;
    }
    setError(null);
    setParsed(false);
    setProperties([]);
    setMessageCount(0);
    setSelected(new Set());
    setPage(1);
    revokeAllObjectUrls();
    zipRef.current = null;
    zipEntryByPhotoPathRef.current = {};
    setFile(next);
  }, [revokeAllObjectUrls]);

  const handleParse = useCallback(async () => {
    if (!file) return;
    setParsing(true);
    setError(null);
    setProgress({
      phase: "reading",
      current: 0,
      total: 1,
      message: "Starting…",
    });
    revokeAllObjectUrls();

    try {
      const { zip, result } = await parseTelegramExportZip(file, setProgress);
      zipRef.current = zip;
      zipEntryByPhotoPathRef.current = result.zipEntryByPhotoPath;
      setProperties(result.properties);
      setMessageCount(result.messageCount);
      setParsed(true);
      setSelected(new Set());
      setPage(1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse the Telegram export.";
      setError(message);
      setParsed(false);
      setProperties([]);
      setMessageCount(0);
    } finally {
      setParsing(false);
    }
  }, [file, revokeAllObjectUrls]);

  const duplicateCodes = useMemo(() => getDuplicateCodes(properties), [properties]);

  const summary = useMemo(() => {
    const withPhotos = properties.filter((p) => p.photoCount > 0).length;
    const missingPrice = properties.filter((p) => p.price == null).length;
    const withWarnings = properties.filter((p) => p.warnings.length > 0).length;
    return {
      messages: messageCount,
      groups: properties.length,
      withPhotos,
      missingPrice,
      withWarnings,
      duplicates: duplicateCodes.size,
    };
  }, [properties, messageCount, duplicateCodes]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return properties
      .map((property, index) => ({ property, index, key: propertyKey(property, index) }))
      .filter(({ property }) => {
        const matchesSearch =
          !term ||
          [property.telegramCode, property.title, property.address]
            .join(" ")
            .toLowerCase()
            .includes(term);

        if (!matchesSearch) return false;

        switch (filter) {
          case "complete":
            return property.warnings.length === 0;
          case "warnings":
            return property.warnings.length > 0;
          case "missing-photos":
            return property.photoCount === 0;
          case "duplicates":
            return duplicateCodes.has(property.telegramCode);
          default:
            return true;
        }
      });
  }, [properties, search, filter, duplicateCodes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    let cancelled = false;
    const zip = zipRef.current;
    if (!zip || pageItems.length === 0) return;

    const loadVisible = async () => {
      const next: Record<string, string> = {};
      const neededKeys = new Set<string>();

      for (const { property, key } of pageItems) {
        const path = property.photoPaths[0];
        if (!path) continue;
        neededKeys.add(key);

        const existing = objectUrlsRef.current.get(key);
        if (existing) {
          next[key] = existing;
          continue;
        }

        try {
          const blob = await loadPhotoBlob(zip, path, zipEntryByPhotoPathRef.current);
          if (!blob || cancelled) continue;
          const url = URL.createObjectURL(blob);
          objectUrlsRef.current.set(key, url);
          next[key] = url;
        } catch {
          // Skip broken photos
        }
      }

      for (const [key, url] of objectUrlsRef.current.entries()) {
        if (key.startsWith("review::")) continue;
        if (!neededKeys.has(key)) {
          URL.revokeObjectURL(url);
          objectUrlsRef.current.delete(key);
        }
      }

      if (!cancelled) setThumbnails(next);
    };

    void loadVisible();
    return () => {
      cancelled = true;
    };
  }, [pageItems]);

  const visibleKeys = useMemo(() => pageItems.map((item) => item.key), [pageItems]);

  const allVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((key) => selected.has(key));

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const key of visibleKeys) next.add(key);
      return next;
    });
  };

  const deselectVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const key of visibleKeys) next.delete(key);
      return next;
    });
  };

  const deselectAll = () => setSelected(new Set());

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openReview = async (index: number) => {
    const property = properties[index];
    if (!property) return;
    setReviewIndex(index);
    setReviewDraft({
      ...property,
      photoPaths: [...property.photoPaths],
      messageIds: [...property.messageIds],
      warnings: [...property.warnings],
    });

    const reviewKey = "review::main";
    const existing = objectUrlsRef.current.get(reviewKey);
    if (existing) {
      URL.revokeObjectURL(existing);
      objectUrlsRef.current.delete(reviewKey);
    }
    setReviewMainUrl(null);

    const path = property.photoPaths[0];
    const zip = zipRef.current;
    if (path && zip) {
      try {
        const blob = await loadPhotoBlob(zip, path, zipEntryByPhotoPathRef.current);
        if (blob) {
          const url = URL.createObjectURL(blob);
          objectUrlsRef.current.set(reviewKey, url);
          setReviewMainUrl(url);
        }
      } catch {
        setReviewMainUrl(null);
      }
    }
  };

  const closeReview = () => {
    const reviewKey = "review::main";
    const existing = objectUrlsRef.current.get(reviewKey);
    if (existing) {
      URL.revokeObjectURL(existing);
      objectUrlsRef.current.delete(reviewKey);
    }
    setReviewMainUrl(null);
    setReviewIndex(null);
    setReviewDraft(null);
  };

  const saveReview = () => {
    if (reviewIndex == null || !reviewDraft) return;
    const updated = { ...reviewDraft };
    const location = updated.district.trim() || updated.address.trim();
    updated.title =
      updated.propertyType.trim() && location
        ? `${updated.propertyType.trim()} in ${location}`
        : `Property ${updated.telegramCode}`;
    const warnings: string[] = [];
    if (!updated.address) warnings.push("Missing address");
    if (updated.price == null) warnings.push("Missing price");
    if (!updated.propertyType) warnings.push("Missing property type");
    if (!updated.tenure) warnings.push("Missing tenure");
    if (updated.photoCount === 0) warnings.push("Missing photo");
    if (updated.bedrooms == null) warnings.push("Missing bedrooms");
    if (updated.bathrooms == null) warnings.push("Missing bathrooms");
    updated.warnings = warnings;

    setProperties((items) =>
      items.map((item, i) => (i === reviewIndex ? updated : item))
    );
    closeReview();
  };

  const handleImportSelected = async (selectedListings: TelegramParsedProperty[]) => {
    try {
      const response = await fetch("/api/admin/import-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: selectedListings }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import listings");
      }

      alert(`Successfully imported ${data.importedCount} listings to Supabase!`);
    } catch (error) {
      console.error("Import error:", error);
      alert(error instanceof Error ? error.message : "Failed to import");
    }
  };

  return (
    <div className="space-y-6">
      <UploadSection
        file={file}
        parsing={parsing}
        progress={progress}
        error={error}
        onAcceptFile={acceptFile}
        onClearFile={clearFile}
        onParse={handleParse}
      />

      {parsed ? (
        <>
          <SummaryCards summary={summary} />

          <ListingTable
            properties={properties}
            search={search}
            filter={filter}
            page={page}
            selected={selected}
            thumbnails={thumbnails}
            duplicateCodes={duplicateCodes}
            filtered={filtered}
            pageItems={pageItems}
            allVisibleSelected={allVisibleSelected}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onFilterChange={(val) => {
              setFilter(val);
              setPage(1);
            }}
            onPageChange={setPage}
            onSelectAllVisible={selectAllVisible}
            onDeselectVisible={deselectVisible}
            onDeselectAll={deselectAll}
            onToggleSelect={toggleSelect}
            onOpenReview={openReview}
            onImportSelected={handleImportSelected}
          />
        </>
      ) : null}

      <ReviewModal
        draft={reviewDraft}
        mainUrl={reviewMainUrl}
        onClose={closeReview}
        onSave={saveReview}
        setReviewDraft={setReviewDraft}
      />
    </div>
  );
}