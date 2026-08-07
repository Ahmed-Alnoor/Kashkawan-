# Order emails

Two emails go out when a customer places an order:

| Message | To | Purpose |
| --- | --- | --- |
| **Order confirmation** | the customer | Their reference number, order summary and what happens next |
| **New order** | the branch | Everything the kitchen and the driver need, in the customer's own language |

Both are sent through [Resend](https://resend.com). Both have an HTML and a
plain-text part — the plain-text one is what most kitchen printers use.

---

## The site works before you switch email on

This is deliberate. With no credentials set:

- orders still validate and still receive a reference number;
- the confirmation page **does not** claim an email was sent;
- it shows *"Email confirmation is not switched on yet — please keep your
  reference number and call us to confirm"*;
- the server logs a warning naming the missing variables.

Nothing fails silently, and nothing tells the customer something untrue.

---

## Switching it on

### 1. Create a Resend account and verify your domain

1. Sign up at <https://resend.com>.
2. **Domains → Add Domain** → enter `kashkawan.ae`.
3. Add the DNS records Resend gives you (SPF, DKIM and, if offered, DMARC) at
   your domain registrar. Verification usually completes within the hour.

You cannot send from an unverified domain — mail will bounce or land in spam.

### 2. Create an API key

**API Keys → Create API Key**, with *Sending access*. Copy it once; Resend does
not show it again.

### 3. Set the environment variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ORDER_EMAIL_FROM=Kashkawan Cafeteria <orders@kashkawan.ae>
ORDER_EMAIL_TO=branch@kashkawan.ae
ORDER_EMAIL_REPLY_TO=            # optional
```

- `ORDER_EMAIL_FROM` — the domain part **must** be the domain you verified.
- `ORDER_EMAIL_TO` — comma-separate several recipients:
  `branch@kashkawan.ae,manager@kashkawan.ae`.
- `ORDER_EMAIL_REPLY_TO` — where a customer's reply lands. Defaults to the
  first `ORDER_EMAIL_TO` address.

Locally: put them in `.env.local`.
On Vercel: Project → Settings → Environment Variables, then redeploy.

### 4. Check it

Place a test order on the site. You should get the customer email; the branch
inbox should get the order. The confirmation page will now say *"We have
emailed a copy to …"*.

---

## What happens if a send fails

`sendOrderEmails` uses `Promise.allSettled`, so one failure cannot take the
other down.

- **Customer email fails** — the order still succeeded. The confirmation page
  falls back to the "keep your reference and call us" wording.
- **Branch email fails** — logged as an error with the order reference. This is
  the failure that matters: watch your host's logs for
  `[orders] KSH-… — restaurant notification failed`.

If you want a hard guarantee that no order is ever missed, add a second
notification channel (a webhook into WhatsApp Business or a Google Sheet) in
`src/app/api/orders/route.ts` alongside the email call.

---

## Duplicate orders

The checkout generates one `idempotencyKey` per attempt and reuses it across
retries. The API remembers keys it has already accepted for 30 minutes and
returns the *original* reference for a replay, so a double-click, an impatient
refresh, or a retry after a dropped connection cannot create a second order.

That memory lives in the server process (`src/app/api/orders/route.ts`). It
resets on deploy, and it is per-instance. For a single branch on a single
instance this is the right trade-off: no extra infrastructure, and the worst
case is one duplicate that the team spots on the confirmation call.

**If you scale to multiple instances**, move the `seenOrders` and `requestLog`
maps to a shared store. The change is confined to that one file:

```ts
// Replace the two Maps with, e.g., Upstash Redis
const existing = await redis.get(`order:${order.idempotencyKey}`);
if (existing) return NextResponse.json({ reference: existing, duplicate: true });
await redis.set(`order:${order.idempotencyKey}`, reference, { ex: 1800 });
```

---

## Editing the email design

`src/lib/email/templates.ts`. It is deliberately plain: inline-styled tables,
no React Email, no external CSS — the combination that survives Gmail, Outlook
and iOS Mail. The palette constants at the top mirror the brand colours.

To preview your changes without sending anything:

```bash
npx tsx --tsconfig tsconfig.json scripts/preview-emails.ts
open .email-preview/customer-en.html
```
