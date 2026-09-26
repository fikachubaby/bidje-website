import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsApp(toNumber: string, templateSid: string, variables: Record<string, string>) {
    return client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${toNumber}`,
        contentSid: templateSid,
        contentVariables: JSON.stringify(variables),
    });
}