import JSZip from "jszip";
import type {
  TelegramExportJson,
  TelegramMessage,
  TelegramParseProgress,
  TelegramParseResult,
  TelegramParsedProperty,
  TelegramTextEntity,
} from "@/types/telegram-import";

const PROPERTY_CODE_RE =
  /(?:^|\n)\s*(?:property\s+)?code\s*[:：]\s*([A-Za-z0-9][A-Za-z0-9_-]*)/im;

const MAPS_URL_RE =
  /https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s)\]>"']*/gi;

type FieldKey =
  | "address"
  | "propertyType"
  | "tenure"
  | "bumiStatus"
  | "bedrooms"
  | "bathrooms"
  | "builtUp"
  | "landSize"
  | "price"
  | "state"
  | "district";

const FIELD_LABELS: Record<FieldKey, string[]> = {
  address: ["full address", "address", "alamat", "alamat hartanah", "property address"],
  propertyType: ["type", "property type", "jenis hartanah", "jenis rumah"],
  tenure: ["tenure", "freehold/leasehold", "pegangan"],
  bumiStatus: ["bumi status", "bumi lot", "non bumi", "lot bumi", "bumi lot/non bumi"],
  bedrooms: ["room", "rooms", "bedroom", "bedrooms", "bilik", "bilangan bilik"],
  bathrooms: [
    "bathroom",
    "bathrooms",
    "bilik air",
    "bilangan bilik air",
  ],
  builtUp: ["built up", "built-up", "size bangunan", "building size"],
  landSize: ["land area", "land size", "size tanah"],
  price: ["price", "asking price", "selling price", "target jualan", "harga"],
  state: ["state", "negeri"],
  district: ["district", "daerah", "area", "lokasi", "location"],
};

const LABEL_LINE_RE = buildLabelLineRegex();

function buildLabelLineRegex(): RegExp {
  const allLabels = Object.values(FIELD_LABELS)
    .flat()
    .concat(["code", "property code", "telegram code"])
    .map(escapeRegExp)
    .sort((a, b) => b.length - a.length);

  return new RegExp(
    `^\\s*(?:${allLabels.join("|")})\\s*[:：]\\s*.+$`,
    "i"
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** Convert Telegram text (string or entity array) into one plain string. */
export function normalizeTelegramText(
  text: TelegramTextEntity | TelegramTextEntity[] | undefined | null
): string {
  if (text == null) return "";
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    return text
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }
  if (typeof text === "object" && typeof text.text === "string") {
    return text.text;
  }
  return "";
}

export function detectPropertyCode(text: string): string | null {
  const match = text.match(PROPERTY_CODE_RE);
  return match?.[1]?.trim() || null;
}

export function parsePrice(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[,\s]/g, " ").trim();
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase().replace(/^rm\s*/i, "").trim();

  const milMatch = lower.match(/^([\d.]+)\s*(?:mil(?:lion)?|juta)\b/i);
  if (milMatch) {
    const n = Number.parseFloat(milMatch[1]);
    return Number.isFinite(n) ? Math.round(n * 1_000_000) : null;
  }

  const kMatch = lower.match(/^([\d.]+)\s*k\b/i);
  if (kMatch) {
    const n = Number.parseFloat(kMatch[1]);
    return Number.isFinite(n) ? Math.round(n * 1_000) : null;
  }

  const digits = lower.replace(/[^\d.]/g, "");
  if (!digits) return null;
  const n = Number.parseFloat(digits);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function parseCount(value: string): number | null {
  if (!value) return null;
  const match = value.match(/(\d+)/);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

function extractLabeledValue(text: string, labels: string[]): string {
  const sorted = [...labels].sort((a, b) => b.length - a.length);
  for (const label of sorted) {
    const re = new RegExp(
      `(?:^|\\n)[ \\t]*${escapeRegExp(label)}[ \\t]*[:：][ \\t]*(.*?)(?=\\n|$)`,
      "i"
    );
    const match = text.match(re);
    if (match) {
      const value = match[1].trim();
      if (value) return value;
    }
  }
  return "";
}

function extractMapsUrl(text: string): string {
  const match = text.match(MAPS_URL_RE);
  return match?.[0]?.replace(/[.,;]+$/, "") ?? "";
}

function cleanDescription(rawText: string): string {
  return rawText
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^(?:property\s+)?code\s*[:：]/i.test(trimmed)) return false;
      if (LABEL_LINE_RE.test(trimmed)) return false;
      if (/^amenities\s*[:：]?$/i.test(trimmed)) return false;
      if (/^access\s*[:：]?$/i.test(trimmed)) return false;
      if (/^t&c to cobroke\s*[:：]?$/i.test(trimmed)) return false;
      if (/^\d+\.\s/.test(trimmed)) return false;
      const withoutMaps = trimmed.replace(MAPS_URL_RE, "").trim();
      if (withoutMaps === "" && /google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(trimmed)) {
        return false;
      }
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function generateTitle(
  propertyType: string,
  district: string,
  address: string,
  telegramCode: string
): string {
  const location = district.trim() || address.trim();
  if (propertyType.trim() && location) {
    return `${propertyType.trim()} in ${location}`;
  }
  return `Property ${telegramCode}`;
}

function collectPhotoPaths(message: TelegramMessage): string[] {
  const paths: string[] = [];
  for (const key of ["photo", "file", "thumbnail"] as const) {
    const value = message[key];
    if (typeof value === "string" && value.trim()) {
      paths.push(normalizeZipPath(value.trim()));
    }
  }
  return paths;
}

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function stripRootPrefix(path: string, rootPrefix: string): string {
  const normalized = normalizeZipPath(path);
  if (rootPrefix && normalized.startsWith(rootPrefix)) {
    return normalized.slice(rootPrefix.length);
  }
  return normalized;
}

function findResultJsonPath(paths: string[]): string | null {
  const candidates = paths
    .map(normalizeZipPath)
    .filter((p) => /(^|\/)result\.json$/i.test(p) && !p.includes("__MACOSX"));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
  return candidates[0];
}

function getRootPrefix(resultPath: string): string {
  const idx = resultPath.toLowerCase().lastIndexOf("result.json");
  if (idx <= 0) return "";
  return resultPath.slice(0, idx);
}

function buildWarnings(property: Omit<TelegramParsedProperty, "warnings">): string[] {
  const warnings: string[] = [];
  if (!property.address) warnings.push("Missing address");
  if (property.price == null) warnings.push("Missing price");
  if (!property.propertyType) warnings.push("Missing property type");
  if (!property.tenure) warnings.push("Missing tenure");
  if (property.photoCount === 0) warnings.push("Missing photo");
  if (property.bedrooms == null) warnings.push("Missing bedrooms");
  if (property.bathrooms == null) warnings.push("Missing bathrooms");
  return warnings;
}

export interface ExtractedFields {
  address: string;
  propertyType: string;
  tenure: string;
  bumiStatus: string;
  builtUp: string;
  landSize: string;
  state: string;
  district: string;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number | null;
  mapsUrl: string;
  description: string;
  title: string;
  amenities: string[];
  internalNotes: string;
}

interface PropertyDraft {
  telegramCode: string;
  textParts: string[];
  photoPaths: string[];
  messageIds: number[];
}

export function extractFieldsFromText(
  rawText: string,
  telegramCode: string
): ExtractedFields {
  const address = extractLabeledValue(rawText, FIELD_LABELS.address);
  let propertyType = extractLabeledValue(rawText, FIELD_LABELS.propertyType);
  const tenure = extractLabeledValue(rawText, FIELD_LABELS.tenure);
  const bumiStatus = extractLabeledValue(rawText, FIELD_LABELS.bumiStatus);
  const builtUp = extractLabeledValue(rawText, FIELD_LABELS.builtUp);
  const landSize = extractLabeledValue(rawText, FIELD_LABELS.landSize);
  let state = extractLabeledValue(rawText, FIELD_LABELS.state);
  let district = extractLabeledValue(rawText, FIELD_LABELS.district);
  const bedrooms = parseCount(extractLabeledValue(rawText, FIELD_LABELS.bedrooms));
  const bathrooms = parseCount(extractLabeledValue(rawText, FIELD_LABELS.bathrooms));
  const price = parsePrice(extractLabeledValue(rawText, FIELD_LABELS.price));
  const mapsUrl = extractMapsUrl(rawText);
  const description = cleanDescription(rawText);

  if (!propertyType) propertyType = derivePropertyTypeFromTitle(rawText);
  if (!state) state = deriveStateFromAddress(address);
  if (!district) district = deriveDistrictFromAddress(address, state);

  const amenities = extractAmenities(rawText);
  const cobrokeTerms = extractCobrokeTerms(rawText);
  const internalNotes = [
    `Telegram Import Code: ${telegramCode}`,
    cobrokeTerms ? `T&C to cobroke:\n${cobrokeTerms}` : "",
  ].filter(Boolean).join("\n\n");

  const title = generateTitle(propertyType, district, address, telegramCode);

  return {
    address, propertyType, tenure, bumiStatus, builtUp, landSize,
    state, district, bedrooms, bathrooms, price, mapsUrl, description, title,
    amenities, internalNotes,
  };
}

function finalizeProperty(
  draft: PropertyDraft,
  zipPhotoLookup: Map<string, string>
): TelegramParsedProperty {
  const rawText = draft.textParts.join("\n\n").trim();
  const fields = extractFieldsFromText(rawText, draft.telegramCode);

  const uniquePhotos: string[] = [];
  const seen = new Set<string>();
  for (const path of draft.photoPaths) {
    const relative = path;
    const zipEntry =
      zipPhotoLookup.get(relative) ??
      zipPhotoLookup.get(relative.toLowerCase());
    if (!zipEntry) continue;
    if (seen.has(relative)) continue;
    if (!/\.(jpe?g|png|gif|webp|bmp)$/i.test(relative) && !relative.includes("photos/")) {
      continue;
    }
    seen.add(relative);
    uniquePhotos.push(relative);
  }

  const base: Omit<TelegramParsedProperty, "warnings"> = {
    telegramCode: draft.telegramCode,
    title: fields.title,
    address: fields.address,
    state: fields.state,
    district: fields.district,
    propertyType: fields.propertyType,
    tenure: fields.tenure,
    bumiStatus: fields.bumiStatus,
    landSize: fields.landSize,
    builtUp: fields.builtUp,
    bedrooms: fields.bedrooms,
    bathrooms: fields.bathrooms,
    price: fields.price,
    mapsUrl: fields.mapsUrl,
    description: fields.description,
    rawText,
    photoPaths: uniquePhotos,
    photoCount: uniquePhotos.length,
    messageIds: [...draft.messageIds],
  };

  return {
    ...base,
    warnings: buildWarnings(base),
  };
}

/**
 * Load a Telegram Desktop export ZIP and parse property listings.
 * All work happens in the browser; nothing is uploaded.
 */
export async function parseTelegramExportZip(
  file: File,
  onProgress?: (progress: TelegramParseProgress) => void
): Promise<{ result: TelegramParseResult; zip: JSZip }> {
  const report = (progress: TelegramParseProgress) => {
    onProgress?.(progress);
  };

  report({
    phase: "reading",
    current: 0,
    total: 1,
    message: "Reading ZIP archive…",
  });

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error("Invalid ZIP file. Please upload a valid Telegram export ZIP.");
  }

  report({
    phase: "finding",
    current: 0,
    total: 1,
    message: "Looking for result.json…",
  });

  const entryPaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
  const resultPath = findResultJsonPath(entryPaths);
  if (!resultPath) {
    throw new Error(
      "result.json was not found in the ZIP. Upload a complete Telegram Desktop export that includes result.json."
    );
  }

  const rootPrefix = getRootPrefix(resultPath);

  report({
    phase: "parsing-json",
    current: 0,
    total: 1,
    message: "Parsing result.json…",
  });

  let exportJson: TelegramExportJson;
  try {
    const raw = await zip.file(resultPath)!.async("string");
    exportJson = JSON.parse(raw) as TelegramExportJson;
  } catch {
    throw new Error("result.json could not be parsed. The file may be corrupted or invalid JSON.");
  }

  const messages = exportJson.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages is missing or empty in result.json.");
  }

  // Build lookup: relative path (as in Telegram JSON) -> zip entry path
  const zipPhotoLookup = new Map<string, string>();
  const zipEntryByPhotoPath: Record<string, string> = {};
  for (const entryPath of entryPaths) {
    const relative = stripRootPrefix(entryPath, rootPrefix);
    const lower = relative.toLowerCase();
    zipPhotoLookup.set(relative, entryPath);
    zipPhotoLookup.set(lower, entryPath);
    if (
      relative.startsWith("photos/") ||
      relative.startsWith("files/") ||
      /\.(jpe?g|png|gif|webp|bmp)$/i.test(relative)
    ) {
      zipEntryByPhotoPath[relative] = entryPath;
    }
  }

  const sorted = [...messages].sort((a, b) => {
    const aTime = Number(a.date_unixtime ?? 0);
    const bTime = Number(b.date_unixtime ?? 0);
    if (aTime !== bTime) return aTime - bTime;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  report({
    phase: "grouping",
    current: 0,
    total: sorted.length,
    message: "Grouping messages into property listings…",
  });

  const drafts: PropertyDraft[] = [];
  let current: PropertyDraft | null = null;
  const chunkSize = 100;

  for (let i = 0; i < sorted.length; i++) {
    const message = sorted[i];
    if (message.type && message.type !== "message") {
      continue;
    }

    const text = normalizeTelegramText(message.text);
    const code = text ? detectPropertyCode(text) : null;
    const photos = collectPhotoPaths(message).map((p) => stripRootPrefix(p, ""));

    if (code) {
      current = {
        telegramCode: code,
        textParts: text ? [text] : [],
        photoPaths: [...photos],
        messageIds: [message.id],
      };
      drafts.push(current);
    } else if (current) {
      current.messageIds.push(message.id);
      if (text.trim()) current.textParts.push(text);
      current.photoPaths.push(...photos);
    }

    if (i % chunkSize === 0) {
      report({
        phase: "grouping",
        current: i + 1,
        total: sorted.length,
        message: `Grouping messages… (${i + 1}/${sorted.length})`,
      });
      await yieldToBrowser();
    }
  }

  report({
    phase: "extracting",
    current: 0,
    total: drafts.length,
    message: "Extracting property fields…",
  });

  const properties: TelegramParsedProperty[] = [];
  for (let i = 0; i < drafts.length; i++) {
    properties.push(finalizeProperty(drafts[i], zipPhotoLookup));
    if (i % 20 === 0) {
      report({
        phase: "extracting",
        current: i + 1,
        total: drafts.length,
        message: `Extracting fields… (${i + 1}/${drafts.length})`,
      });
      await yieldToBrowser();
    }
  }

  report({
    phase: "done",
    current: properties.length,
    total: properties.length,
    message: `Parsed ${properties.length} property listing${properties.length === 1 ? "" : "s"}.`,
  });

  return {
    zip,
    result: {
      properties,
      messageCount: messages.length,
      zipEntryByPhotoPath,
    },
  };
}

/** Load a photo blob from the ZIP for a relative Telegram photo path. */
export async function loadPhotoBlob(
  zip: JSZip,
  relativePath: string,
  zipEntryByPhotoPath: Record<string, string>
): Promise<Blob | null> {
  const entryPath =
    zipEntryByPhotoPath[relativePath] ??
    zipEntryByPhotoPath[relativePath.toLowerCase()] ??
    Object.entries(zipEntryByPhotoPath).find(
      ([key]) => key.toLowerCase() === relativePath.toLowerCase()
    )?.[1];

  if (!entryPath) {
    const fallback = zip.file(relativePath) ?? zip.file(normalizeZipPath(relativePath));
    if (!fallback) return null;
    return fallback.async("blob");
  }

  const file = zip.file(entryPath);
  if (!file) return null;
  return file.async("blob");
}

export function downloadParsedJson(properties: TelegramParsedProperty[]): void {
  const payload = properties.map((p) => ({
    telegramCode: p.telegramCode,
    title: p.title,
    address: p.address,
    state: p.state,
    district: p.district,
    propertyType: p.propertyType,
    tenure: p.tenure,
    bumiStatus: p.bumiStatus,
    landSize: p.landSize,
    builtUp: p.builtUp,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    price: p.price,
    mapsUrl: p.mapsUrl,
    description: p.description,
    rawText: p.rawText,
    photoPaths: p.photoPaths,
    photoCount: p.photoCount,
    messageIds: p.messageIds,
    warnings: p.warnings,
  }));

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bidje-telegram-import-preview.json";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDuplicateCodes(properties: TelegramParsedProperty[]): Set<string> {
  const counts = new Map<string, number>();
  for (const p of properties) {
    counts.set(p.telegramCode, (counts.get(p.telegramCode) ?? 0) + 1);
  }
  const duplicates = new Set<string>();
  for (const [code, count] of counts) {
    if (count > 1) duplicates.add(code);
  }
  return duplicates;
}

const MALAYSIA_STATES = [
  "Kuala Lumpur", "Selangor", "Johor", "Penang", "Pulau Pinang", "Perak",
  "Negeri Sembilan", "Melaka", "Malacca", "Pahang", "Terengganu", "Kelantan",
  "Kedah", "Perlis", "Sabah", "Sarawak", "Putrajaya", "Labuan",
];

function deriveStateFromAddress(address: string): string {
  if (!address) return "";
  for (const state of MALAYSIA_STATES) {
    const re = new RegExp(`\\b${escapeRegExp(state)}\\b`, "i");
    if (re.test(address)) return state;
  }
  return "";
}

/** District is typically the comma-segment just before the state/postcode tail. */
function deriveDistrictFromAddress(address: string, state: string): string {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "";

  const withoutState = parts.filter((p) => {
    const isStateOnly = state && p.toLowerCase() === state.toLowerCase();
    const isPostcodeState = state && new RegExp(`^\\d{5}\\s+${escapeRegExp(state)}$`, "i").test(p);
    return !isStateOnly && !isPostcodeState;
  });

  if (withoutState.length === 0) return "";
  const last = withoutState[withoutState.length - 1];
  const postcodeMatch = last.match(/^\d{5}\s+(.+)$/);
  if (postcodeMatch) {
    return withoutState[withoutState.length - 2] ?? "";
  }
  return last;
}

function extractSection(text: string, startLabel: string, endLabels: string[]): string[] {
  const startRe = new RegExp(`(?:^|\\n)[ \\t]*${escapeRegExp(startLabel)}[ \\t]*[:：]?[ \\t]*\\n`, "i");
  const startMatch = text.match(startRe);
  if (!startMatch || startMatch.index == null) return [];

  const sectionStart = startMatch.index + startMatch[0].length;
  const rest = text.slice(sectionStart);

  let endIndex = rest.length;
  for (const endLabel of endLabels) {
    const endRe = new RegExp(`(?:^|\\n)[ \\t]*${escapeRegExp(endLabel)}`, "i");
    const endMatch = rest.match(endRe);
    if (endMatch && endMatch.index != null && endMatch.index < endIndex) {
      endIndex = endMatch.index;
    }
  }

  const block = rest.slice(0, endIndex);
  return block
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);
}

function extractAmenities(text: string): string[] {
  return extractSection(text, "Amenities", ["Access", "T&C to cobroke", "PRICE"]);
}

function extractCobrokeTerms(text: string): string {
  const lines = extractSection(text, "T&C to cobroke", ["PRICE"]);
  return lines.join("\n");
}

function derivePropertyTypeFromTitle(rawText: string): string {
  const firstLine = rawText.split(/\r?\n/).find((l) => l.trim() && !/^code\s*[:：]/i.test(l.trim()));
  if (!firstLine) return "";
  const match = firstLine.match(/^(.*?)\s+for\s+(?:sale|rent)\s+at\s+/i);
  return match?.[1]?.trim() || "";
}