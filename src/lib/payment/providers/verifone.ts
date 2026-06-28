// ═══════════════════════════════════════════════════════════════
// Verifone (2Checkout) Payment Gateway Adapter
// ═══════════════════════════════════════════════════════════════
// TODO: Add real 2Checkout API credentials to .env:
//   VERIFONE_MERCHANT_CODE=your_merchant_code
//   VERIFONE_SECRET_KEY=your_secret_key
//   VERIFONE_BASE_URL=https://www.2checkout.com
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
} from "@/types/payment";
import { createSha256Hash, createHmacSignature } from "../utils";

export class VerifoneProvider extends BasePaymentProvider {
  readonly gateway: PaymentGateway = "verifone";
  readonly config: GatewayConfig = GATEWAYS.verifone;

  private get merchantCode() {
    return process.env.VERIFONE_MERCHANT_CODE || "";
  }
  private get secretKey() {
    return process.env.VERIFONE_SECRET_KEY || "";
  }
  private get baseUrl() {
    return process.env.VERIFONE_BASE_URL || "https://www.2checkout.com";
  }

  isConfigured(): boolean {
    return !!(this.merchantCode && this.secretKey);
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const paymentId = await this.createPaymentRecord(request);

    if (!this.isConfigured()) {
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/payment/verifone?paymentId=${paymentId}&amount=${request.amount}`,
        message: "2Checkout gateway in demo mode",
      };
    }

    try {
      // ── Generate 2Checkout buy link ──
      const hash = createSha256Hash(
        `${this.merchantCode}${process.env.NEXT_PUBLIC_APP_URL}/donations/success?paymentId=${paymentId}${request.amount}${request.currency}Donation to AIUAG`
      );

      const params = new URLSearchParams({
        merchant_code: this.merchantCode,
        oid: paymentId,
        currency: request.currency,
        total: request.amount.toFixed(2),
        description: "Donation to AIUAG",
        orderRegistration: paymentId,
        email: request.donorEmail,
        firstName: request.donorName.split(" ")[0] || "",
        lastName: request.donorName.split(" ").slice(1).join(" ") || "",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/donations/success?paymentId=${paymentId}`,
        merchantNotify: "Y",
        demo: this.merchantCode ? "N" : "Y",
      });

      // ── TODO: In production, use 2Checkout API to create order ──
      const redirectUrl = `${this.baseUrl}/shopping/purchase?${params.toString()}&HASH=${hash}`;

      await this.updatePaymentStatus(paymentId, "processing");
      await this.createTransaction(paymentId, "authorization", "pending", request.amount, request.currency);

      return {
        success: true,
        paymentId,
        redirectUrl,
        status: "processing",
      };
    } catch (error) {
      await this.updatePaymentStatus(paymentId, "failed");
      await this.logEvent(paymentId, "error", "api_error", `2Checkout API error: ${error}`);
      return { success: false, paymentId, status: "failed", message: "Payment gateway error" };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "pending" };
    }

    try {
      // ── TODO: Use 2Checkout API order lookup ──
      const response = await fetch(`${this.baseUrl}/api/orders/${request.gatewayReference}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.merchantCode}:${this.secretKey}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const status: PaymentStatus =
        data.status === "COMPLETE" ? "completed" : data.status === "REJECTED" ? "failed" : "pending";

      return { success: status === "completed", status, gatewayReference: data.order_number?.toString(), amount: data.total, currency: data.currency };
    } catch (error) {
      await this.logEvent(request.paymentId, "error", "verify_error", `2Checkout verify error: ${error}`);
      return { success: false, status: "failed" };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = await this.createRefundRecord(request.paymentId, request.amount || 0, "USD", request.reason);

    if (!this.isConfigured()) {
      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "2Checkout not configured" };
    }

    // ── TODO: Implement 2Checkout refund API (POST /api/orders/{order_id}/refunds) ──
    return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "2Checkout refund not yet implemented" };
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent> {
    // ── Verify 2Checkout webhook signature ──
    if (this.secretKey && payload.HASH) {
      const calculatedHash = createSha256Hash(
        `${this.merchantCode}${this.secretKey}${payload.order_number}${payload.ref_no || ""}`
      );
      if (calculatedHash !== payload.HASH) {
        throw new Error("Invalid 2Checkout webhook signature");
      }
    }

    const eventType = (payload.order_status as string) || "unknown";
    const status: PaymentStatus =
      eventType === "COMPLETE" ? "completed" : eventType === "REJECTED" || eventType === "FAILED" ? "failed" : "pending";

    return {
      gateway: "verifone",
      eventType,
      gatewayReference: (payload.order_number as string) || "",
      amount: parseFloat((payload.total as string) || "0"),
      currency: payload.currency as any,
      status,
      rawPayload: payload,
      signature,
      timestamp: new Date().toISOString(),
    };
  }

  async getStatus(gatewayReference: string): Promise<PaymentStatus> {
    if (!this.isConfigured()) return "pending";
    return "pending";
  }
}
