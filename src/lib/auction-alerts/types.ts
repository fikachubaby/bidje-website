export type AuctionListing = {
    source: "lelongproperty";
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
};
