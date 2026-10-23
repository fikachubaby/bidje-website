# BIDJE Auction WhatsApp Alerts

## WhatsApp template

Create this template in Meta WhatsApp Manager:

- Name: `bidje_auction_alert_v1`
- Category: Marketing
- Language: English (US)

Body:

```text
BIDJE Auction Alert

{{1}}
📍 {{2}}
💰 Reserve Price: {{3}}
📅 Auction Date: {{4}}

Source: {{5}}

Please verify the auction status before taking action.
```

Sample variables:

1. `1 Storey Terrace House`
2. `Jalan Example 1, 43000 Kajang, Selangor`
3. `RM 300,000`
4. `25 Oct 2026`
5. `https://www.lelongproperty.com.my/search?keyword=Jalan%20Example%201`

## Current filters

- Selangor: landed property only, reserve price <= RM400,000
- Negeri Sembilan: landed property only, reserve price <= RM300,000
- Johor Bahru: landed property only, reserve price <= RM400,000

## Runtime flow

1. Vercel cron calls `/api/cron/auction-alerts` every 10 minutes.
2. The source adapter checks recent LelongProperty search results.
3. Matching listings are stored in Supabase.
4. `auction_alert_deliveries` prevents duplicate alerts per recipient.
5. Meta WhatsApp Cloud API sends the approved template.
6. Failed sends can be retried on later cron runs.

## Required Vercel variables

- `CRON_SECRET`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_WABA_ID`
- `META_WHATSAPP_AUCTION_TEMPLATE_NAME=bidje_auction_alert_v1`
- `META_WHATSAPP_AUCTION_TEMPLATE_LANG=en_US`
- `META_GRAPH_API_VERSION=v24.0`
- `AUCTION_ALERT_RECIPIENTS`
- `AUCTION_ALERT_SOURCE_MAX_PAGES=1`

Never commit the real access token to GitHub.

## Database

Apply `supabase/migrations/20261020_auction_alerts.sql` before enabling the cron in production.

## Live test

After the environment variables, database migration, and approved Meta template are ready, deploy the feature branch and trigger:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://<preview-or-production-domain>/api/cron/auction-alerts
```

A successful response includes `matches`, `sent`, `skipped`, and `failed` counters.
