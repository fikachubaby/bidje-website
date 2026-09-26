import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/supabase-admin';
import { sendWhatsApp } from '@/lib/whatsapp';
import { sendEmail } from '@/lib/email';

export async function GET(req: Request) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reminders, error } = await supabaseAdmin
        .from('reminders')
        .select(`
      *,
      profiles!reminders_investor_id_fkey (full_name, email, phone),
      properties (title)
    `)
        .eq('status', 'scheduled');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let sentCount = 0;

    for (const rem of reminders ?? []) {
        const daysLeft = Math.ceil(
            (new Date(rem.due_date).getTime() - Date.now()) / 86400000
        );
        if (!rem.remind_days_before.includes(daysLeft)) continue;

        const investor = rem.profiles;
        const property = rem.properties;

        if ((rem.channel === 'whatsapp' || rem.channel === 'both') && investor.phone) {
            try {
                await sendWhatsApp(investor.phone, 'HX_your_template_sid', {
                    1: investor.full_name ?? 'Investor',
                    2: property.title,
                    3: rem.title,
                    4: rem.due_date,
                });
                await logReminder(rem.id, 'whatsapp', 'sent');
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                await logReminder(rem.id, 'whatsapp', 'failed', message);
            }
        }

        if ((rem.channel === 'email' || rem.channel === 'both') && investor.email) {
            try {
                await sendEmail(
                    investor.email,
                    `Reminder: ${rem.title}`,
                    `<p>Hi ${investor.full_name ?? ''}, your property <b>${property.title}</b> update: ${rem.title} is due on ${rem.due_date}.</p>`
                );
                await logReminder(rem.id, 'email', 'sent');
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                await logReminder(rem.id, 'whatsapp', 'failed', message);
            }
        }

        await supabaseAdmin
            .from('reminders')
            .update({ last_sent_at: new Date().toISOString() })
            .eq('id', rem.id);

        sentCount++;
    }

    return NextResponse.json({ success: true, checked: reminders?.length ?? 0, sent: sentCount });
}

async function logReminder(reminderId: string, channel: 'whatsapp' | 'email', status: 'sent' | 'failed', errorMessage?: string) {
    await supabaseAdmin.from('reminder_logs').insert({
        reminder_id: reminderId,
        channel,
        status,
        error_message: errorMessage,
    });
}