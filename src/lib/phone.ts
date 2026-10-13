/**
 * Normalize a phone number to E.164 (e.g. "+60123456789").
 * Defaults to Malaysia (+60) for local-looking numbers.
 * Returns null if the number can't be turned into a valid E.164 number.
 *
 * Handles:
 *   "0123456789"        -> "+60123456789"
 *   "012-345 6789"      -> "+60123456789"
 *   "60123456789"       -> "+60123456789"
 *   "+60 12-345 6789"   -> "+60123456789"
 *   "0060123456789"     -> "+60123456789"
 *   "123456789"         -> "+60123456789" (missing leading 0)
 *   "+6591234567" (SG)  -> "+6591234567" (kept as-is)
 */
export function normalizePhone(raw: string | null | undefined, defaultCountryCode = "60"): string | null {
    if (!raw) return null;

    const value = raw.trim();
    if (!value) return null;

    const hasPlus = value.startsWith("+");

    // Keep digits only
    let digits = value.replace(/\D/g, "");
    if (!digits) return null;

    if (hasPlus) {
        // Already international format
    } else if (digits.startsWith("00")) {
        // 00 international prefix
        digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
        // Local format: 012... -> 6012...
        digits = defaultCountryCode + digits.slice(1);
    } else if (digits.startsWith(defaultCountryCode)) {
        // Already has country code without "+"
    } else {
        // Local number missing the leading 0 (e.g. 123456789)
        digits = defaultCountryCode + digits;
    }

    const e164 = `+${digits}`;

    // E.164: + followed by 8-15 digits, first digit not 0
    if (!/^\+[1-9]\d{7,14}$/.test(e164)) return null;

    // Extra sanity check for Malaysian numbers: +60 followed by 8-10 digits
    if (e164.startsWith("+60") && !/^\+60\d{8,10}$/.test(e164)) return null;

    return e164;
}

/**
 * True if the number is a Malaysian mobile number (+601x...).
 * WhatsApp needs a mobile number, so landlines (e.g. +603...) won't work.
 */
export function isMalaysianMobile(e164: string): boolean {
    return /^\+601\d{8,9}$/.test(e164);
}
