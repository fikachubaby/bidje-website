import crypto from "crypto";

// Hosts per Fiuu API Spec v13.97 (github.com/FiuuPayment/Documentation-Fiuu_API_Spec).
const isProd = () => process.env.FIUU_ENV?.trim() === "production";

function getPayBaseUrl() {
    return isProd() ? "https://pay.fiuu.com/RMS/pay" : "https://sandbox-payment.fiuu.com/RMS/pay";
}

/** Recurring (token charge) endpoint. Confirm the exact URL with Fiuu support and override via env if needed. */
function getRecurringUrl() {
    return (
        process.env.FIUU_RECURRING_URL ||
        (isProd()
            ? "https://pay.fiuu.com/RMS/API/Recurring/input_v7.php"
            : "https://sandbox-payment.fiuu.com/RMS/API/Recurring/input_v7.php")
    );
}

const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex");

/** Fiuu order IDs must be alphanumeric and at most 32 chars: a UUID without dashes fits exactly. */
export function toOrderId(paymentId: string) {
    return paymentId.replace(/-/g, "");
}

export function fromOrderId(orderId: string) {
    if (orderId.includes("-") || orderId.length !== 32) return orderId;
    return `${orderId.slice(0, 8)}-${orderId.slice(8, 12)}-${orderId.slice(12, 16)}-${orderId.slice(16, 20)}-${orderId.slice(20)}`;
}

export interface FiuuCheckoutParams {
    orderId: string;
    amount: number; // e.g. 500.00
    billName: string;
    billEmail: string;
    billMobile?: string;
    billDesc: string;
    returnUrl: string;
    callbackUrl: string;
    cancelUrl: string;
}

export function buildFiuuCheckoutForm(params: FiuuCheckoutParams) {
    const merchantId = process.env.FIUU_MERCHANT_ID!;
    const verifyKey = process.env.FIUU_VERIFY_KEY!;
    const amountStr = params.amount.toFixed(2);

    // vcode = md5(amount + merchantID + orderid + verifykey)
    const vcode = md5(`${amountStr}${merchantId}${params.orderId}${verifyKey}`);

    return {
        actionUrl: `${getPayBaseUrl()}/${merchantId}/`,
        fields: {
            amount: amountStr,
            orderid: params.orderId,
            bill_name: params.billName,
            bill_email: params.billEmail,
            // Real billing details are needed: "guest" details hide Fiuu's save-card option.
            bill_mobile: params.billMobile ?? "",
            bill_desc: params.billDesc,
            country: "MY",
            currency: "MYR",
            returnurl: params.returnUrl,
            callbackurl: params.callbackUrl,
            cancelurl: params.cancelUrl,
            vcode,
        },
    };
}

export interface FiuuCallbackPayload {
    tranID: string;
    orderid: string;
    status: string;
    domain: string;
    amount: string;
    currency: string;
    paydate: string;
    appcode: string;
    skey: string;
}

function expectedSkey(p: FiuuCallbackPayload, key: string) {
    const key0 = md5(`${p.tranID}${p.orderid}${p.status}${p.domain}${p.amount}${p.currency}`);
    return md5(`${p.paydate}${p.domain}${key0}${p.appcode}${key}`);
}

/**
 * Normal payments sign with the secret key; Fiuu's recurring sample signs token-charge
 * callbacks with the verify key, so accept either.
 */
export function verifyFiuuCallback(payload: FiuuCallbackPayload) {
    return [process.env.FIUU_SECRET_KEY, process.env.FIUU_VERIFY_KEY]
        .filter((k): k is string => Boolean(k))
        .some((key) => expectedSkey(payload, key) === payload.skey);
}

/** Card token details Fiuu returns in `extraP` once tokenization is enabled on the merchant account. */
export function parseExtraP(raw: string | undefined) {
    if (!raw) return null;
    try {
        const data = JSON.parse(raw) as { token?: string; ccbrand?: string; cclast4?: string };
        if (!data.token) return null;
        return {
            token: data.token,
            cardLabel: [data.ccbrand?.toUpperCase(), data.cclast4 ? `•••• ${data.cclast4}` : null].filter(Boolean).join(" ") || null,
        };
    } catch {
        return null;
    }
}

export interface TokenChargeParams {
    token: string;
    orderId: string;
    amount: number;
    billName: string;
    billEmail: string;
    billMobile?: string;
    description: string;
}

/**
 * Merchant-initiated charge of a saved card (Fiuu Recurring API v7, RecordType T).
 * "accepted" only means Fiuu received it; the final result arrives on the callback URL.
 */
export async function chargeFiuuToken(p: TokenChargeParams): Promise<{ accepted: boolean; reason?: string; tranID?: string }> {
    const merchantId = process.env.FIUU_MERCHANT_ID!;
    const verifyKey = process.env.FIUU_VERIFY_KEY!;
    const recordType = "T";
    const subMerchant = "";
    const currency = "MYR";
    const amount = p.amount.toFixed(2);
    const checksum = md5(`${recordType}${merchantId}${subMerchant}${p.token}${p.orderId}${currency}${amount}${verifyKey}`);
    const clean = (s: string) => s.replace(/\|/g, " ");

    const record = [
        recordType,
        merchantId,
        subMerchant,
        p.token,
        p.orderId,
        currency,
        amount,
        clean(p.billName),
        clean(p.billEmail),
        clean(p.billMobile ?? ""),
        clean(p.description),
        checksum,
        "",
    ].join("|");

    const res = await fetch(getRecurringUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ "0": record }).toString(),
    });
    const text = await res.text();
    try {
        const [first] = JSON.parse(text) as { status: string; reason?: string; tranID?: string }[];
        return { accepted: first?.status === "accepted", reason: first?.reason, tranID: first?.tranID };
    } catch {
        return { accepted: false, reason: `Unexpected response from Fiuu: ${text.slice(0, 200)}` };
    }
}
