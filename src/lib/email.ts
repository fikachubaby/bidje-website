import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
    return sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject,
        html,
    });
}