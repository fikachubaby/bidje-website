import { normalizePhone } from "@/lib/phone";

type SendTemplateArgs = {
    to: string;
    templateName: string;
    languageCode?: string;
    variables: string[];
};

type MetaMessagesResponse = {
    messages?: Array<{ id?: string }>;
    error?: {
        message?: string;
        type?: string;
        code?: number;
        error_subcode?: number;
        fbtrace_id?: string;
    };
};

function getRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is not configured`);
    return value;
}

/**
 * Send an approved WhatsApp template through Meta WhatsApp Cloud API.
 *
 * The access token is a secret and must exist only in server-side env vars.
 */
export async function sendMetaWhatsAppTemplate({
    to,
    templateName,
    languageCode = "en_US",
    variables,
}: SendTemplateArgs): Promise<{ messageId: string | null; raw: MetaMessagesResponse }> {
    const accessToken = getRequiredEnv("META_WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = getRequiredEnv("META_WHATSAPP_PHONE_NUMBER_ID");
    const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() || "v24.0";

    const normalized = normalizePhone(to);
    if (!normalized) throw new Error(`Invalid WhatsApp recipient: ${to}`);

    const endpoint = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalized.replace(/^\+/, ""),
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                components: [
                    {
                        type: "body",
                        parameters: variables.map((text) => ({
                            type: "text",
                            text: String(text || "-"),
                        })),
                    },
                ],
            },
        }),
        cache: "no-store",
    });

    let payload: MetaMessagesResponse = {};
    try {
        payload = (await response.json()) as MetaMessagesResponse;
    } catch {
        // Keep an empty payload so the status error below is still useful.
    }

    if (!response.ok) {
        const detail =
            payload.error?.message ||
            `${response.status} ${response.statusText}`;
        throw new Error(`Meta WhatsApp send failed: ${detail}`);
    }

    return {
        messageId: payload.messages?.[0]?.id ?? null,
        raw: payload,
    };
}
