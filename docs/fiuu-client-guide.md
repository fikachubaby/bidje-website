# Fiuu – Details needed to connect Bidje

To connect your Fiuu account to Bidje, we need a few details from your Fiuu Merchant Portal.
This takes about 5 minutes. You don't need to share your portal password.

## Option A (recommended) – Add us as a user

If your portal lets you add users (look for **User Management** or **Sub-account**), add our developer with
view/settings access. We can then copy the details ourselves. If you can't find this option, use Option B.

## Option B – Copy the details yourself

1. Log in to the Fiuu Merchant Portal: **https://portal.fiuu.com**
2. Find these values and copy them:

| Detail | Where to find it (the menu may differ slightly by account) |
|---|---|
| **Merchant ID** | *Merchant Profile → General Info* (or the *Home* page) |
| **Verify Key** | *Merchant Profile* (the "Verify Key" field) or *Transactions → Settings* |
| **Secret Key** | *Transactions → Settings* (or the *Home* page) |
| **Account type** | Is this a **Sandbox (testing)** or a **Live** account? Please send both if you have them. |

**Important:**
- Copy the **actual key**. If it shows as dots (••••), click the "show" or "eye" icon first.
- Don't include extra spaces at the start or end.
- If you can't find a key, contact Fiuu support and ask for the *Merchant ID, Verify Key and Secret Key for payment gateway (API) integration*.

## How to send them to us

These keys work like a password for receiving payments. Please **don't** post them in a group chat or a shared document.
Send them privately, in a direct message or email to our developer only, or through a password manager share link.

## Later: URLs we'll ask you to set

Once the integration is ready, we'll send you three website addresses (Return URL, Callback URL and Notification URL)
to enter in the portal under *Merchant Profile / Transactions → Settings*. You don't need to do anything for this yet.
