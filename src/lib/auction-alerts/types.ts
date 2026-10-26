export type AuctionSourceName =
    | "lelongproperty"
    | "lelongtips"
    | "elelong"
    | "seremban-land-office"
    | "ngchanmau"
    | "listinglelong"
    | "ehsanauctioneers";

export type AuctionListing = {
    source: AuctionSourceName;
    externalKey: string;
    sourceUrl: string;
    title: string;
    address: string;
    state: string;
    reservePrice: number;
    auctionDate: string | null; // YYYY-MM-DD
    propertyType: string;
};

export type AuctionAlertRule = {
    sourceState: string;
    label: string;
    maxReservePrice: number;
    addressMustInclude?: string[];
    addressMustIncludeAny?: string[];
};

export type AuctionSourceResult = {
    source: AuctionSourceName;
    listings: AuctionListing[];
    pagesFetched: number;
    errors: string[];
};
