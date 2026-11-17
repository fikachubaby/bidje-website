import crypto from "crypto";

/** Env values trimmed and stripped of any trailing "# comment" pasted into the Vercel dashboard. */
const env = (name: string) => (process.env[name] ?? "").replace(/\s+#.*$/, "").trim();

const isProd = () => env("FIUU_ENV") === "production";

function getPayBaseUrl() {
    return isProd() ? "https://pay.fiuu.com/RMS/pay" : "https://sandbox-payment.fiuu.com/RMS/pay";
}

function getRecurringUrl() {
    return (
        env("FIUU_RECURRING_URL") ||
        (isProd()
            ? "https://pay.fiuu.com/RMS/API/Recurring/input_v7.php"
            : "https://sandbox-payment.fiuu.com/RMS/API/Recurring/input_v7.php")
    );
}

const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex");

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
    const merchantId = env("FIUU_MERCHANT_ID");
    const verifyKey = env("FIUU_VERIFY_KEY");
    const amountStr = params.amount.toFixed(2);

    const currency = "MYR";
    // This merchant has "Extended Verify Payment" on, so the currency is part of the signature:
    // vcode = md5(amount + merchantID + orderid + verifykey + currency). Set FIUU_EXTENDED_VCODE=false for the basic form.
    const extended = env("FIUU_EXTENDED_VCODE") !== "false";
    const vcode = md5(`${amountStr}${merchantId}${params.orderId}${verifyKey}${extended ? currency : ""}`);

    const fields: Record<string, string> = {
        amount: amountStr,
        orderid: params.orderId,
        bill_name: cleanText(params.billName, 128) || "Bidje Customer",
        bill_email: params.billEmail.trim(),
        bill_mobile: cleanMobile(params.billMobile),
        bill_desc: cleanText(params.billDesc, 255),
        country: "MY",
        currency,
        returnurl: params.returnUrl,
        callbackurl: params.callbackUrl,
        cancelurl: params.cancelUrl,
        vcode,
    };

    for (const k of Object.keys(fields)) if (!fields[k]) delete fields[k];

    return { actionUrl: `${getPayBaseUrl()}/${merchantId}/`, fields };
}

/** Letters, digits and basic punctuation only; Fiuu's form check rejects symbols like em dashes or emoji. */
function cleanText(s: string, max: number) {
    return s
        .normalize("NFKD")
        .replace(/[–—]/g, "-")
        .replace(/[^A-Za-z0-9 .,()\-'@/&:#]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

function cleanMobile(s: string | undefined) {
    const digits = (s ?? "").replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15 ? digits : "";
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

export function verifyFiuuCallback(payload: FiuuCallbackPayload) {
    return [env("FIUU_SECRET_KEY"), env("FIUU_VERIFY_KEY")]
        .filter((k): k is string => Boolean(k))
        .some((key) => expectedSkey(payload, key) === payload.skey);
}

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

export async function chargeFiuuToken(p: TokenChargeParams): Promise<{ accepted: boolean; reason?: string; tranID?: string }> {
    const merchantId = env("FIUU_MERCHANT_ID");
    const verifyKey = env("FIUU_VERIFY_KEY");
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
