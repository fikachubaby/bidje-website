export const VALID_STATES: Record<string, string> = {
    "kuala-lumpur": "Kuala Lumpur",
    "selangor": "Selangor",
    "perak": "Perak",
    "melaka": "Melaka",
    "negeri-sembilan": "Negeri Sembilan",
    "pulau-pinang": "Pulau Pinang",
    "kedah": "Kedah",
};

export const VALID_DISTRICTS: Record<string, Record<string, string>> = {
    "kuala-lumpur": {
        "mont-kiara": "Mont Kiara",
        "bangsar": "Bangsar",
        "cheras": "Cheras",
    },
    "selangor": {
        "petaling-jaya": "Petaling Jaya",
        "shah-alam": "Shah Alam",
        "subang-jaya": "Subang Jaya",
    },
};

export const VALID_CATEGORIES: Record<string, string> = {
    "landed": "Landed",
    "high-rise": "High Rise",
    "commercial": "Commercial",
    "land": "Land",
    "auction": "Auction",
};

export function getStateName(slug: string): string | undefined {
    return VALID_STATES[slug.toLowerCase()];
}

export function getDistrictName(stateSlug: string, districtSlug: string): string | undefined {
    return VALID_DISTRICTS[stateSlug.toLowerCase()]?.[districtSlug.toLowerCase()];
}

export function getCategoryName(slug: string): string | undefined {
    return VALID_CATEGORIES[slug.toLowerCase()];
}

export function isValidState(slug: string): boolean {
    return Boolean(getStateName(slug));
}

export function isValidCategory(slug: string): boolean {
    return Boolean(getCategoryName(slug));
}

export function isValidDistrict(stateSlug: string, districtSlug: string): boolean {
    return Boolean(getDistrictName(stateSlug, districtSlug));
}