import crypto from "crypto";

function getBaseUrl() {
    return process.env.FIUU_ENV === "production"
        ? "https://pg.fiuu.com/RMS/pay" // confirm exact MY production URL with Fiuu
        : "https://pg-sandbox.fiuu.com/RMS/pay"; // confirm exact MY sandbox URL with Fiuu
}

export interface FiuuCheckoutParams {
    orderId: string; // must be unique, alphanumeric, <=32 chars
    amount: number; // e.g. 500.00
    billName: string;
    billEmail: string;
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
    const vcode = crypto
        .createHash("md5")
        .update(`${amountStr}${merchantId}${params.orderId}${verifyKey}`)
        .digest("hex");

    return {
        actionUrl: `${getBaseUrl()}/${merchantId}`,
        fields: {
            amount: amountStr,
            orderid: params.orderId,
            bill_name: params.billName,
            bill_email: params.billEmail,
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

export function verifyFiuuCallback(payload: {
    tranID: string;
    orderid: string;
    status: string;
    domain: string;
    amount: string;
    currency: string;
    paydate: string;
    appcode: string;
    skey: string;
}) {
    const secretKey = process.env.FIUU_SECRET_KEY!;
    const key0 = crypto
        .createHash("md5")
        .update(`${payload.tranID}${payload.orderid}${payload.status}${payload.domain}${payload.amount}${payload.currency}`)
        .digest("hex");
    const key1 = crypto
        .createHash("md5")
        .update(`${payload.paydate}${payload.domain}${key0}${payload.appcode}${secretKey}`)
        .digest("hex");

    return key1 === payload.skey;
}