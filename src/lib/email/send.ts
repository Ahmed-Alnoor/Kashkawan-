import { Resend } from "resend";

/**
 * Transactional email.
 *
 * The site is designed to work with email switched OFF. When RESEND_API_KEY is
 * missing, `isEmailConfigured()` returns false, the order still succeeds and
 * gets a reference number, and the confirmation page tells the customer to
 * keep that reference and call the branch. Nothing silently swallows a failure.
 *
 * Required environment variables (see .env.example and docs/EMAIL.md):
 *   RESEND_API_KEY        — Resend API key
 *   ORDER_EMAIL_FROM      — verified sender, e.g. "Kashkawan <orders@kashkawan.ae>"
 *   ORDER_EMAIL_TO        — branch inbox that receives new orders
 *   ORDER_EMAIL_REPLY_TO  — optional, defaults to ORDER_EMAIL_TO
 */

export type EmailConfig = {
  apiKey: string;
  from: string;
  to: string[];
  replyTo?: string;
};

export const readEmailConfig = (): EmailConfig | null => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ORDER_EMAIL_FROM?.trim();
  const to = process.env.ORDER_EMAIL_TO?.trim();

  if (!apiKey || !from || !to) return null;

  return {
    apiKey,
    from,
    to: to
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean),
    replyTo: process.env.ORDER_EMAIL_REPLY_TO?.trim() || undefined,
  };
};

export const isEmailConfigured = (): boolean => readEmailConfig() !== null;

export type SendResult = {
  customer: "sent" | "failed" | "skipped";
  restaurant: "sent" | "failed" | "skipped";
};

type Message = { subject: string; html: string; text: string };

export async function sendOrderEmails({
  config,
  customerAddress,
  customerMessage,
  restaurantMessage,
  reference,
}: {
  config: EmailConfig;
  customerAddress: string;
  customerMessage: Message;
  restaurantMessage: Message;
  reference: string;
}): Promise<SendResult> {
  const resend = new Resend(config.apiKey);

  const headers = {
    // Lets mail clients thread retries of the same order together.
    "X-Entity-Ref-ID": reference,
  };

  const [restaurant, customer] = await Promise.allSettled([
    resend.emails.send({
      from: config.from,
      to: config.to,
      replyTo: customerAddress,
      subject: restaurantMessage.subject,
      html: restaurantMessage.html,
      text: restaurantMessage.text,
      headers,
    }),
    resend.emails.send({
      from: config.from,
      to: [customerAddress],
      replyTo: config.replyTo ?? config.to[0],
      subject: customerMessage.subject,
      html: customerMessage.html,
      text: customerMessage.text,
      headers,
    }),
  ]);

  const outcome = (result: PromiseSettledResult<{ error: unknown } | unknown>) => {
    if (result.status === "rejected") return "failed" as const;
    const value = result.value as { error?: unknown } | null;
    return value && value.error ? ("failed" as const) : ("sent" as const);
  };

  return { restaurant: outcome(restaurant), customer: outcome(customer) };
}
