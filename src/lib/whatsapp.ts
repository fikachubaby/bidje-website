import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function toE164(phone: string, defaultCountryCode = "60"): string {
    const digits = phone.replace(/\D/g, "");
    if (phone.startsWith("+")) return phone;
    if (digits.startsWith("0")) return `+${defaultCountryCode}${digits.slice(1)}`;
    return `+${digits}`;
}

export async function sendWhatsApp(toNumber: string, templateSid: string, variables: Record<string, string>) {
    const formattedNumber = toE164(toNumber);
    return client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedNumber}`,
        contentSid: templateSid,
        contentVariables: JSON.stringify(variables),
    });
}