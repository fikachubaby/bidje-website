import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

type SendGridError = {
    message?: string;
    response?: {
        body?: {
            errors?: { message?: string }[];
        };
    };
};

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        return await sgMail.send({
            to,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject,
            html,
        });
    } catch (err: unknown) {
        const e = err as SendGridError;
        const detail = e?.response?.body?.errors?.[0]?.message;
        throw new Error(detail ?? e?.message ?? "SendGrid error");
    }
}
