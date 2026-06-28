// ═══════════════════════════════════════════════════════════════
// Stripe Payment Gateway Adapter
// ═══════════════════════════════════════════════════════════════
// TODO: Add real Stripe API credentials to .env:
//   STRIPE_SECRET_KEY=sk_test_...
//   STRIPE_PUBLISHABLE_KEY=pk_test_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
// ═══════════════════════════════════════════════════════════════

import { BasePaymentProvider } from "./base";
import {
  PaymentGateway,
  GatewayConfig,
  CreatePaymentRequest,
  PaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  RefundRequest,
  RefundResponse,
  WebhookEvent,
  PaymentStatus,
  GATEWAYS,
  Currency,
} from "@/types/payment";
import { createHmacSignature } from "../utils";

// Stripe amount is in smallest currency unit (cents for USD)
function toStripeAmount(amount: number, currency: Currency): number {
  const zeroDecimalCurrencies = ["BIF", "DJF", "KMF", "KRW", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"];
  return zeroDecimalCurrencies.includes(currency) ? Math.round(amount) : Math.round(amount * 100);
}

export class StripeProvider extends BasePaymentProvider {
  readonly gateway: PaymentGateway = "stripe";
  readonly config: GatewayConfig = GATEWAYS.stripe;

  private get secretKey() {
    return process.env.STRIPE_SECRET_KEY || "";
  }
  private get webhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  isConfigured(): boolean {
    return !!this.secretKey;
  }

  private async stripeFetch(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...options.headers,
      },
    });
    return response.json();
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const paymentId = await this.createPaymentRecord(request);

    if (!this.isConfigured()) {
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/payment/stripe?paymentId=${paymentId}&amount=${request.amount}`,
        message: "Stripe gateway in demo mode",
      };
    }

    try {
      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("payment_method_types[]", "card");
      params.append("line_items[0][price_data][currency]", request.currency.toLowerCase());
      params.append("line_items[0][price_data][unit_amount]", toStripeAmount(request.amount, request.currency).toString());
      params.append("line_items[0][price_data][product_data][name]", "Donation to AIUAG");
      params.append("line_items[0][quantity]", "1");
      params.append("success_url", `${process.env.NEXT_PUBLIC_APP_URL}/donations/success?paymentId=${paymentId}`);
      params.append("cancel_url", `${process.env.NEXT_PUBLIC_APP_URL}/donations/cancel?paymentId=${paymentId}`);
      params.append("client_reference_id", paymentId);
      params.append("customer_email", request.donorEmail);
      params.append("metadata[donation_id]", request.donationId);
      params.append("metadata[payment_id]", paymentId);

      const session = await this.stripeFetch("/checkout/sessions", {
        method: "POST",
        body: params.toString(),
      });

      if (session.id && session.url) {
        await this.updatePaymentStatus(paymentId, "processing", session.id as string);
        await this.createTransaction(paymentId, "authorization", "pending", request.amount, request.currency, session.id as string, session);

        return {
          success: true,
          paymentId,
          gatewayReference: session.id as string,
          redirectUrl: session.url as string,
          status: "processing",
        };
      }

      await this.updatePaymentStatus(paymentId, "failed");
      return { success: false, paymentId, status: "failed", message: (session.error as any)?.message || "Stripe session creation failed" };
    } catch (error) {
      await this.updatePaymentStatus(paymentId, "failed");
      await this.logEvent(paymentId, "error", "api_error", `Stripe API error: ${error}`);
      return { success: false, paymentId, status: "failed", message: "Payment gateway error" };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "pending" };
    }

    try {
      const session = await this.stripeFetch(`/checkout/sessions/${request.gatewayReference}`);

      if (session.id) {
        const status: PaymentStatus =
          session.payment_status === "paid" ? "completed" : session.status === "expired" ? "expired" : "pending";

        return {
          success: status === "completed",
          status,
          gatewayReference: session.id as string,
          amount: ((session.amount_total as number) || 0) / 100,
          currency: ((session.currency as string) || "usd").toUpperCase() as Currency,
          paidAt: session.payment_status === "paid" ? new Date().toISOString() : undefined,
        };
      }

      return { success: false, status: "failed" };
    } catch (error) {
      await this.logEvent(request.paymentId, "error", "verify_error", `Stripe verify error: ${error}`);
      return { success: false, status: "failed" };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = await this.createRefundRecord(request.paymentId, request.amount || 0, "USD", request.reason);

    if (!this.isConfigured()) {
      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "Stripe not configured" };
    }

    try {
      const payment = await (await import("@/lib/prisma")).default.payment.findUnique({
        where: { id: request.paymentId },
      });

      if (!payment?.gatewayPaymentId) {
        return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "No Stripe session found" };
      }

      const params = new URLSearchParams();
      params.append("payment_intent", payment.gatewayPaymentId);
      if (request.amount) params.append("amount", toStripeAmount(request.amount, payment.currency as Currency).toString());
      if (request.reason) params.append("reason", request.reason);

      const result = await this.stripeFetch("/refunds", {
        method: "POST",
        body: params.toString(),
      });

      if (result.id) {
        return { success: true, refundId, status: "completed", amount: request.amount || 0 };
      }

      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "Refund failed" };
    } catch (error) {
      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: `Refund error: ${error}` };
    }
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent> {
    // ── Verify webhook signature ──
    if (this.webhookSecret && signature) {
      const timestamp = payload.created as string;
      const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
      const expectedSig = createHmacSignature(signedPayload, this.webhookSecret);
      if (signature !== expectedSig) {
        throw new Error("Invalid Stripe webhook signature");
      }
    }

    const eventType = payload.type as string;
    const data = payload.data as Record<string, unknown>;
    const obj = data?.object as Record<string, unknown>;

    let status: PaymentStatus = "pending";
    if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
      status = "completed";
    } else if (eventType === "payment_intent.payment_failed") {
      status = "failed";
    }

    return {
      gateway: "stripe",
      eventType,
      gatewayReference: (obj?.id as string) || "",
      amount: ((obj?.amount_total as number) || 0) / 100,
      currency: ((obj?.currency as string) || "usd").toUpperCase() as Currency,
      status,
      rawPayload: payload as Record<string, unknown>,
      signature,
      timestamp: new Date().toISOString(),
    };
  }

  async getStatus(gatewayReference: string): Promise<PaymentStatus> {
    if (!this.isConfigured()) return "pending";
    try {
      const session = await this.stripeFetch(`/checkout/sessions/${gatewayReference}`);
      return session.payment_status === "paid" ? "completed" : "pending";
    } catch {
      return "pending";
    }
  }
}
