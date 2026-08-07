import { NextResponse, type NextRequest } from "next/server";
import { orderSchema, validateLinesAgainstMenu } from "@/lib/order-schema";
import { priceOrder } from "@/lib/order-summary";
import { generateOrderReference } from "@/lib/format";
import { customerEmail, restaurantEmail } from "@/lib/email/templates";
import { isEmailConfigured, readEmailConfig, sendOrderEmails } from "@/lib/email/send";
import { isServiceableArea } from "@/data/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Order intake.
 *
 * Trust boundary: nothing from the request body is believed except the
 * customer's own contact and address text. Item ids, options and every price
 * are re-resolved against src/data/menu.ts, so a tampered payload cannot
 * change what an order costs or smuggle in a dish that is not on the menu.
 */

/* ------------------------------------------------------------------ */
/* Duplicate suppression                                               */
/*                                                                     */
/* Two protections, both in-memory:                                    */
/*   1. idempotencyKey — the same submission replayed (double click,   */
/*      retry after a flaky network) returns the FIRST reference       */
/*      instead of creating a second order.                            */
/*   2. a small per-IP rate limit.                                     */
/*                                                                     */
/* In-memory state is per-instance and resets on deploy. That is the   */
/* right trade-off here: the worst case is one duplicated order that   */
/* the branch spots on the confirmation call, and it keeps the site    */
/* dependency-free. Swap in Redis/Upstash if the branch ever runs      */
/* multiple instances — see docs/EMAIL.md.                             */
/* ------------------------------------------------------------------ */

type Seen = { reference: string; at: number };

const IDEMPOTENCY_TTL_MS = 30 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;

const seenOrders = new Map<string, Seen>();
const requestLog = new Map<string, number[]>();

const prune = (now: number) => {
  for (const [key, entry] of seenOrders) {
    if (now - entry.at > IDEMPOTENCY_TTL_MS) seenOrders.delete(key);
  }
  for (const [key, times] of requestLog) {
    const recent = times.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length === 0) requestLog.delete(key);
    else requestLog.set(key, recent);
  }
};

const clientKey = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
};

const isRateLimited = (key: string, now: number): boolean => {
  const times = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (times.length >= RATE_MAX) {
    requestLog.set(key, times);
    return true;
  }
  requestLog.set(key, [...times, now]);
  return false;
};

/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  const now = Date.now();
  prune(now);

  if (request.headers.get("content-type")?.includes("application/json") !== true) {
    return NextResponse.json({ error: "unsupported_media_type" }, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_failed",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const order = parsed.data;

  // Honeypot: a bot filled the hidden field. Answer 200 so it learns nothing,
  // but do not create an order.
  if (order.website && order.website.length > 0) {
    return NextResponse.json({ reference: generateOrderReference(), emailed: false });
  }

  // Replay of a submission we already accepted — return the original reference
  // rather than creating a second order.
  const existing = seenOrders.get(order.idempotencyKey);
  if (existing) {
    return NextResponse.json({
      reference: existing.reference,
      duplicate: true,
      emailed: isEmailConfigured(),
    });
  }

  if (isRateLimited(clientKey(request), now)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // The area allowlist is enforced here as well as in the schema, so adding an
  // area to the enum without adding it to AREAS can never open delivery up.
  if (order.fulfilment === "delivery") {
    if (!order.address || !isServiceableArea(order.address.areaId)) {
      return NextResponse.json(
        { error: "validation_failed", issues: [{ path: "address.areaId", message: "areaUnserved" }] },
        { status: 400 },
      );
    }
  }

  const menuProblems = validateLinesAgainstMenu(order.lines);
  if (menuProblems.length > 0) {
    return NextResponse.json(
      { error: "validation_failed", issues: menuProblems.map((message) => ({ path: "lines", message })) },
      { status: 400 },
    );
  }

  const priced = priceOrder(order);
  if (priced.lines.length === 0) {
    return NextResponse.json(
      { error: "validation_failed", issues: [{ path: "lines", message: "emptyCart" }] },
      { status: 400 },
    );
  }

  const reference = generateOrderReference();
  // Claim the key before sending, so a double submit that lands while the
  // first request is still in flight cannot create a second order.
  seenOrders.set(order.idempotencyKey, { reference, at: now });

  const config = readEmailConfig();

  if (!config) {
    // Email is not configured yet. The order is still valid and still gets a
    // reference; the confirmation page tells the customer to call it through.
    console.warn(
      `[orders] ${reference} accepted but email is not configured — set RESEND_API_KEY, ORDER_EMAIL_FROM and ORDER_EMAIL_TO. See docs/EMAIL.md.`,
    );
    return NextResponse.json({ reference, emailed: false, emailConfigured: false });
  }

  const context = { reference, order, priced, locale: order.locale };

  try {
    const result = await sendOrderEmails({
      config,
      customerAddress: order.customer.email,
      customerMessage: customerEmail(context),
      restaurantMessage: restaurantEmail(context),
      reference,
    });

    if (result.restaurant === "failed") {
      // The branch not getting the order is the failure that matters. Tell the
      // customer honestly so they can phone it in.
      console.error(`[orders] ${reference} — restaurant notification failed`);
    }

    return NextResponse.json({
      reference,
      emailed: result.customer === "sent",
      restaurantNotified: result.restaurant === "sent",
      emailConfigured: true,
    });
  } catch (error) {
    console.error(`[orders] ${reference} — email dispatch threw`, error);
    // The order is recorded and the customer has a reference; surface the
    // email failure rather than pretending it worked.
    return NextResponse.json({
      reference,
      emailed: false,
      restaurantNotified: false,
      emailConfigured: true,
    });
  }
}

export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
