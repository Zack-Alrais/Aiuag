// ═══════════════════════════════════════════════════════════════
// PayPal Payment Gateway Adapter
// ═══════════════════════════════════════════════════════════════
// TODO: Add real PayPal API credentials to .env:
//   PAYPAL_CLIENT_ID=your_client_id
//   PAYPAL_CLIENT_SECRET=your_client_secret
//   PAYPAL_MODE=sandbox|live
//   PAYPAL_WEBHOOK_ID=your_webhook_id
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

export class PaypalProvider extends BasePaymentProvider {
  readonly gateway: PaymentGateway = "paypal";
  readonly config: GatewayConfig = GATEWAYS.paypal;

  private get clientId() {
    return process.env.PAYPAL_CLIENT_ID || "";
  }
  private get clientSecret() {
    return process.env.PAYPAL_CLIENT_SECRET || "";
  }
  private get mode() {
    return process.env.PAYPAL_MODE || "sandbox";
  }
  private get baseUrl() {
    return this.mode === "live" ? "https://api.paypal.com" : "https://api-m.sandbox.paypal.com";
  }
  private get webhookId() {
    return process.env.PAYPAL_WEBHOOK_ID || "";
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = await response.json();
    return data.access_token;
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const paymentId = await this.createPaymentRecord(request);

    if (!this.isConfigured()) {
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/payment/paypal?paymentId=${paymentId}&amount=${request.amount}`,
        message: "PayPal gateway in demo mode",
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      const orderResponse = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: paymentId,
              description: "Donation to AIUAG",
              amount: {
                currency_code: request.currency,
                value: request.amount.toFixed(2),
              },
            },
          ],
          application_context: {
            brand_name: "AIUAG Alumni Association",
            landing_page: "BILLING",
            user_action: "PAY_NOW",
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/donations/success?paymentId=${paymentId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donations/cancel?paymentId=${paymentId}`,
          },
        }),
      });

      const order = await orderResponse.json();

      if (order.id) {
        await this.updatePaymentStatus(paymentId, "processing", order.id);
        await this.createTransaction(paymentId, "authorization", "pending", request.amount, request.currency, order.id, order);

        const approveLink = order.links?.find((l: any) => l.rel === "approve")?.href;

        return {
          success: true,
          paymentId,
          gatewayReference: order.id,
          redirectUrl: approveLink,
          status: "processing",
        };
      }

      await this.updatePaymentStatus(paymentId, "failed");
      return { success: false, paymentId, status: "failed", message: order.message || "PayPal order creation failed" };
    } catch (error) {
      await this.updatePaymentStatus(paymentId, "failed");
      await this.logEvent(paymentId, "error", "api_error", `PayPal API error: ${error}`);
      return { success: false, paymentId, status: "failed", message: "Payment gateway error" };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "pending" };
    }

    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${request.gatewayReference}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const order = await response.json();

      const status: PaymentStatus =
        order.status === "COMPLETED" ? "completed" : order.status === "VOIDED" ? "cancelled" : "pending";

      return {
        success: status === "completed",
        status,
        gatewayReference: order.id,
        amount: parseFloat(order.purchase_units?.[0]?.amount?.value || "0"),
        currency: order.purchase_units?.[0]?.amount?.currency_code as Currency,
      };
    } catch (error) {
      await this.logEvent(request.paymentId, "error", "verify_error", `PayPal verify error: ${error}`);
      return { success: false, status: "failed" };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = await this.createRefundRecord(request.paymentId, request.amount || 0, "USD", request.reason);

    if (!this.isConfigured()) {
      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "PayPal not configured" };
    }

    try {
      const accessToken = await this.getAccessToken();
      const payment = await (await import("@/lib/prisma")).default.payment.findUnique({
        where: { id: request.paymentId },
      });

      if (!payment?.gatewayPaymentId) {
        return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "No PayPal capture ID" };
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/capture/${payment.gatewayPaymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: {
            value: (request.amount || payment.amount).toFixed(2),
            currency_code: payment.currency,
          },
          note_to_payer: request.reason || "Donation refund",
        }),
      });

      const result = await response.json();
      if (result.id) {
        return { success: true, refundId, status: "completed", amount: request.amount || 0 };
      }

      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "PayPal refund failed" };
    } catch (error) {
      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: `Refund error: ${error}` };
    }
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent> {
    // ── TODO: Verify PayPal webhook signature with transmission_id, timestamp, webhook_id ──
    if (this.webhookId && signature) {
      // PayPal webhook verification requires special headers
      // In production, use PayPal's verify-webhook-signature API
    }

    const eventType = payload.event_type as string;
    const resource = payload.resource as Record<string, unknown>;

    let status: PaymentStatus = "pending";
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      status = "completed";
    } else if (eventType === "PAYMENT.CAPTURE.DENIED") {
      status = "failed";
    }

    return {
      gateway: "paypal",
      eventType,
      gatewayReference: (resource?.id as string) || (payload.resource?.id as string) || "",
      amount: parseFloat((resource?.amount as any)?.value || "0"),
      currency: (resource?.amount as any)?.currency_code as Currency,
      status,
      rawPayload: payload as Record<string, unknown>,
      signature,
      timestamp: new Date().toISOString(),
    };
  }

  async getStatus(gatewayReference: string): Promise<PaymentStatus> {
    if (!this.isConfigured()) return "pending";
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${gatewayReference}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const order = await response.json();
      return order.status === "COMPLETED" ? "completed" : "pending";
    } catch {
      return "pending";
    }
  }
}
