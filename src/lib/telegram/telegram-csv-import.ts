import type { TelegramParsedProperty } from "@/types/telegram-import";
import { PROPERTY_STATUSES, type PropertyStatus } from "@/types/property";

/** Header aliases → canonical column. Headers are matched case-insensitively, ignoring spaces/underscores. */
const COLUMN_ALIASES: Record<string, string[]> = {
  telegramCode: ["telegram_code", "code", "telegramcode"],
  title: ["title"],
  address: ["full_address", "address", "fulladdress"],
  state: ["state"],
  district: ["district"],
  mapsUrl: ["google_maps_url", "location", "maps_url", "mapsurl", "googlemapsurl"],
  propertyType: ["property_type", "type", "propertytype"],
  tenure: ["tenure"],
  bumiStatus: ["bumi_status", "bumi", "bumistatus"],
  bedrooms: ["bedrooms", "room", "rooms"],
  bathrooms: ["bathrooms", "bathroom"],
  builtUp: ["built_up_size", "built_up", "builtup", "builtupsize"],
  landSize: ["land_size", "land_area", "landsize", "landarea"],
  price: ["asking_price", "price", "askingprice"],
  description: ["description"],
  internalNotes: ["internal_notes", "internalnotes", "notes"],
  status: ["status"],
};

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, "");

/** RFC 4180 CSV parser: handles quoted cells with commas, quotes ("") and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^﻿/, "");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows
    .map((r) => r.map((c) => c.replace(/\r\n?/g, "\n")))
    .filter((r) => r.some((c) => c.trim() !== ""));
}

/** "RM 565,000.00 (Negotiable)" → 565000 */
function parsePrice(value: string): number | null {
  const cleaned = value.replace(/\(.*?\)/g, "").replace(/,/g, "");
  const match = cleaned.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function parseCount(value: string): number | null {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeTenure(value: string): string {
  const v = value.toLowerCase();
  if (v.includes("free")) return "Freehold";
  if (v.includes("lease")) return "Leasehold";
  return "";
}

function normalizeBumi(value: string): string {
  const v = value.toLowerCase().replace(/[^a-z]/g, "");
  if (v === "bumi") return "Bumi";
  if (v === "nonbumi") return "Non Bumi";
  if (v === "both") return "Both";
  return "Unknown";
}

function normalizeStatus(value: string): PropertyStatus {
  const match = PROPERTY_STATUSES.find((s) => s.toLowerCase() === value.trim().toLowerCase());
  return match ?? "Published";
}

export function parseTelegramCsv(text: string): TelegramParsedProperty[] {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error("The CSV has no property rows. Make sure the first row is the header.");
  }

  const headers = rows[0].map(normalizeHeader);
  const columnIndex: Record<string, number> = {};
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = headers.findIndex((h) => aliases.map(normalizeHeader).includes(h));
    if (idx >= 0) columnIndex[key] = idx;
  }
  if (columnIndex.telegramCode === undefined) {
    throw new Error('The CSV is missing the "telegram_code" column.');
  }

  return rows.slice(1).map((cells, rowIdx) => {
    const get = (key: string) => {
      const idx = columnIndex[key];
      return idx === undefined ? "" : (cells[idx] ?? "").trim();
    };
    const rowNumber = rowIdx + 2;
    const telegramCode = get("telegramCode") || `CSV-ROW-${rowNumber}`;
    const propertyType = get("propertyType").replace(/\.$/, "");
    const district = get("district");
    const address = get("address");

    const property: TelegramParsedProperty = {
      telegramCode,
      title: get("title") || `${propertyType || "Property"} ${telegramCode}`,
      address,
      state: get("state"),
      district,
      propertyType,
      tenure: normalizeTenure(get("tenure")),
      bumiStatus: normalizeBumi(get("bumiStatus")),
      landSize: get("landSize"),
      builtUp: get("builtUp"),
      bedrooms: parseCount(get("bedrooms")),
      bathrooms: parseCount(get("bathrooms")),
      price: parsePrice(get("price")),
      mapsUrl: get("mapsUrl").replace(/\.$/, ""),
      description: get("description"),
      internalNotes: get("internalNotes"),
      status: normalizeStatus(get("status")),
      source: "csv",
      rawText: cells.join("\n"),
      photoPaths: [],
      photoCount: 0,
      messageIds: [rowNumber],
      warnings: [],
    };

    if (!get("telegramCode")) property.warnings.push("Missing telegram code");
    if (!address) property.warnings.push("Missing address");
    if (!property.state) property.warnings.push("Missing state");
    if (property.price == null) property.warnings.push("Missing price");
    if (!propertyType) property.warnings.push("Missing property type");
    if (!property.tenure) property.warnings.push("Missing tenure");
    if (property.bedrooms == null) property.warnings.push("Missing bedrooms");
    if (property.bathrooms == null) property.warnings.push("Missing bathrooms");
    return property;
  });
}
