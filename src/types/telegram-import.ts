export interface TelegramParsedProperty {
  telegramCode: string;
  title: string;
  address: string;
  state: string;
  district: string;
  propertyType: string;
  tenure: string;
  bumiStatus: string;
  landSize: string;
  builtUp: string;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number | null;
  mapsUrl: string;
  description: string;
  rawText: string;
  photoPaths: string[];
  photoCount: number;
  messageIds: number[];
  warnings: string[];
}

export type TelegramTextEntity =
  | string
  | {
      type?: string;
      text?: string;
    };

export interface TelegramMessage {
  id: number;
  type?: string;
  date?: string;
  date_unixtime?: string | number;
  text?: TelegramTextEntity | TelegramTextEntity[];
  photo?: string;
  file?: string;
  thumbnail?: string;
  media_type?: string;
}

export interface TelegramExportJson {
  name?: string;
  type?: string;
  id?: number;
  messages?: TelegramMessage[];
}

export interface TelegramParseProgress {
  phase: "reading" | "finding" | "parsing-json" | "grouping" | "extracting" | "done";
  current: number;
  total: number;
  message: string;
}

export interface TelegramParseResult {
  properties: TelegramParsedProperty[];
  messageCount: number;
  /** Relative photo paths present in the ZIP (normalized). */
  zipEntryByPhotoPath: Record<string, string>;
}

export type TelegramListingFilter =
  | "all"
  | "complete"
  | "warnings"
  | "missing-photos"
  | "duplicates";
