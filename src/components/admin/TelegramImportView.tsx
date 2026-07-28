"use client";

import {
  AlertTriangle,
  CheckSquare,
  Download,
  FileArchive,
  ImageIcon,
  Search,
  Square,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type JSZip from "jszip";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/admin/ui/FormField";
import { Modal } from "@/components/admin/ui/Modal";
import { StatCard } from "@/components/admin/ui/StatCard";
import {
  downloadParsedJson,
  formatFileSize,
  getDuplicateCodes,
  loadPhotoBlob,
  parseTelegramExportZip,
} from "@/lib/telegram-import";
import { cn, formatPrice } from "@/lib/utils";
import type {
  TelegramListingFilter,
  TelegramParseProgress,
  TelegramParsedProperty,
} from "@/types/telegram-import";

const PAGE_SIZE = 20;

function propertyKey(property: TelegramParsedProperty, index: number): string {
  return `${property.telegramCode}::${property.messageIds[0] ?? index}`;
}

function ThumbnailCell({
  url,
  code,
}: {
  url: string | null;
  code: string;
}) {
  if (!url) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
        <ImageIcon className="h-5 w-5" aria-hidden />
        <span className="sr-only">No photo for {code}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Thumbnail for ${code}`}
      className="h-14 w-14 rounded-xl object-cover"
    />
  );
}

export function TelegramImportView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<JSZip | null>(null);
  const zipEntryByPhotoPathRef = useRef<Record<string, string>>({});
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  // Load object URLs only for visible thumbnails
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
          // Skip broken photos silently for preview
        }
      }

      // Revoke URLs that are no longer on this page (keep review modal URL separate)
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
    setReviewDraft({ ...property, photoPaths: [...property.photoPaths], messageIds: [...property.messageIds], warnings: [...property.warnings] });

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
    // Recompute title & warnings lightly from edited fields
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

  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : parsing
        ? 5
        : 0;

  return (
    <div className="space-y-6">
      {/* Upload */}
      <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
        <h2 className="text-xl font-black text-neutral-900">Upload Telegram Export</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Upload the complete Telegram export ZIP containing result.json and the photos
          folder.
        </p>

        <div
          className={cn(
            "mt-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragOver
              ? "border-brand bg-brand/10"
              : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const dropped = e.dataTransfer.files?.[0] ?? null;
            acceptFile(dropped);
          }}
        >
          <FileArchive className="mx-auto h-10 w-10 text-neutral-400" />
          <p className="mt-3 text-sm font-bold text-neutral-700">
            Drag and drop a .zip file here
          </p>
          <p className="mt-1 text-xs text-neutral-500">or choose a file from your computer</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <AdminButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
            >
              <Upload className="h-4 w-4" />
              Choose ZIP
            </AdminButton>
            {file ? (
              <AdminButton
                type="button"
                variant="secondary"
                onClick={clearFile}
                disabled={parsing}
              >
                <X className="h-4 w-4" />
                Clear file
              </AdminButton>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {file ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-neutral-900">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
            </div>
            <AdminButton type="button" onClick={handleParse} disabled={parsing}>
              {parsing ? "Parsing…" : "Parse Export"}
            </AdminButton>
          </div>
        ) : null}

        {parsing && progress ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-neutral-700">{progress.message}</p>
              <p className="font-bold text-neutral-500">{progressPercent}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}
      </article>

      {parsed ? (
        <>
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Telegram messages" value={summary.messages} />
            <StatCard label="Property groups" value={summary.groups} />
            <StatCard label="Listings with photos" value={summary.withPhotos} />
            <StatCard label="Listings missing price" value={summary.missingPrice} />
            <StatCard label="Listings with warnings" value={summary.withWarnings} />
            <StatCard label="Duplicate property codes" value={summary.duplicates} />
          </div>

          {/* Filters & actions */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 shrink-0 text-neutral-400" />
              <FormInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by code, title or address"
                className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
              />
            </div>
            <FormSelect
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as TelegramListingFilter);
                setPage(1);
              }}
              className="mt-0 lg:w-56"
            >
              <option value="all">All listings</option>
              <option value="complete">Complete</option>
              <option value="warnings">Has warnings</option>
              <option value="missing-photos">Missing photos</option>
              <option value="duplicates">Duplicate codes</option>
            </FormSelect>
            <AdminButton type="button" variant="secondary" onClick={() => downloadParsedJson(properties)}>
              <Download className="h-4 w-4" />
              Download Parsed JSON
            </AdminButton>
          </div>

          {/* Selection bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <AdminButton type="button" variant="secondary" size="sm" onClick={selectAllVisible}>
              <CheckSquare className="h-4 w-4" />
              Select all visible
            </AdminButton>
            <AdminButton type="button" variant="ghost" size="sm" onClick={deselectAll}>
              <Square className="h-4 w-4" />
              Deselect all
            </AdminButton>
            <p className="text-sm font-bold text-neutral-600">
              {selected.size} selected
            </p>
            <div className="ml-auto flex flex-col items-end gap-1">
              <AdminButton type="button" disabled title="Coming in a later phase">
                Import Selected to Supabase
              </AdminButton>
              <p className="max-w-sm text-right text-xs text-neutral-500">
                Supabase import and permanent photo storage will be connected after the
                parsed listings are reviewed.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={() =>
                          allVisibleSelected ? deselectVisible() : selectAllVisible()
                        }
                        aria-label="Select all visible"
                      />
                    </th>
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Beds / Baths</th>
                    <th className="px-4 py-3">Photos</th>
                    <th className="px-4 py-3">Warnings</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-neutral-500">
                        No listings match the current filters.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map(({ property, index, key }) => (
                      <tr
                        key={key}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(key)}
                            onChange={() => toggleSelect(key)}
                            aria-label={`Select ${property.telegramCode}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ThumbnailCell url={thumbnails[key] ?? null} code={property.telegramCode} />
                        </td>
                        <td className="px-4 py-3 font-bold text-neutral-900">
                          {property.telegramCode}
                          {duplicateCodes.has(property.telegramCode) ? (
                            <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                              Dup
                            </span>
                          ) : null}
                        </td>
                        <td className="max-w-[12rem] truncate px-4 py-3 text-neutral-800">
                          {property.title}
                        </td>
                        <td className="max-w-[14rem] truncate px-4 py-3 text-neutral-600">
                          {property.address || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-neutral-900">
                          {property.price != null ? formatPrice(property.price) : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {property.propertyType || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                          {property.bedrooms ?? "—"} / {property.bathrooms ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{property.photoCount}</td>
                        <td className="px-4 py-3">
                          {property.warnings.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {property.warnings.length}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <AdminButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void openReview(index)}
                          >
                            Review
                          </AdminButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
              <p className="text-sm text-neutral-500">
                Showing {(currentPage - 1) * PAGE_SIZE + (pageItems.length ? 1 : 0)}–
                {(currentPage - 1) * PAGE_SIZE + pageItems.length} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </AdminButton>
                <span className="text-sm font-bold text-neutral-700">
                  Page {currentPage} / {totalPages}
                </span>
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </AdminButton>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Review modal */}
      <Modal
        open={reviewDraft != null}
        onClose={closeReview}
        title={reviewDraft ? `Review ${reviewDraft.telegramCode}` : "Review"}
        description="Edit parsed fields for this browser session only. Changes are not saved to localStorage."
        wide
      >
        {reviewDraft ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div>
                {reviewMainUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reviewMainUrl}
                    alt="Main property photo"
                    className="h-56 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <p className="mt-2 text-sm font-bold text-neutral-600">
                  {reviewDraft.photoCount} photo{reviewDraft.photoCount === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Telegram code">
                  <FormInput
                    value={reviewDraft.telegramCode}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, telegramCode: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Title">
                  <FormInput
                    value={reviewDraft.title}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, title: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Address" wide>
                  <FormInput
                    value={reviewDraft.address}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, address: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="State">
                  <FormInput
                    value={reviewDraft.state}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, state: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="District">
                  <FormInput
                    value={reviewDraft.district}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, district: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Property type">
                  <FormInput
                    value={reviewDraft.propertyType}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, propertyType: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Tenure">
                  <FormInput
                    value={reviewDraft.tenure}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, tenure: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Bumi status">
                  <FormInput
                    value={reviewDraft.bumiStatus}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, bumiStatus: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Land size">
                  <FormInput
                    value={reviewDraft.landSize}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, landSize: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Built-up">
                  <FormInput
                    value={reviewDraft.builtUp}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, builtUp: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Bedrooms">
                  <FormInput
                    type="number"
                    value={reviewDraft.bedrooms ?? ""}
                    onChange={(e) =>
                      setReviewDraft({
                        ...reviewDraft,
                        bedrooms: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </FormField>
                <FormField label="Bathrooms">
                  <FormInput
                    type="number"
                    value={reviewDraft.bathrooms ?? ""}
                    onChange={(e) =>
                      setReviewDraft({
                        ...reviewDraft,
                        bathrooms: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </FormField>
                <FormField label="Price (MYR)">
                  <FormInput
                    type="number"
                    value={reviewDraft.price ?? ""}
                    onChange={(e) =>
                      setReviewDraft({
                        ...reviewDraft,
                        price: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </FormField>
                <FormField label="Google Maps URL" wide>
                  <FormInput
                    value={reviewDraft.mapsUrl}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, mapsUrl: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Description" wide>
                  <FormTextarea
                    rows={4}
                    value={reviewDraft.description}
                    onChange={(e) =>
                      setReviewDraft({ ...reviewDraft, description: e.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>

            {reviewDraft.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-bold text-amber-900">Warnings</p>
                <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
                  {reviewDraft.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <FormField label="Raw Telegram text">
              <FormTextarea rows={8} value={reviewDraft.rawText} readOnly />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Message IDs">
                <FormTextarea
                  rows={3}
                  value={reviewDraft.messageIds.join(", ")}
                  readOnly
                />
              </FormField>
              <FormField label="Photo paths">
                <FormTextarea
                  rows={3}
                  value={reviewDraft.photoPaths.join("\n") || "—"}
                  readOnly
                />
              </FormField>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <AdminButton type="button" variant="secondary" onClick={closeReview}>
                Cancel
              </AdminButton>
              <AdminButton type="button" onClick={saveReview}>
                Save changes
              </AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
