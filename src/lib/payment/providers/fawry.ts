// ═══════════════════════════════════════════════════════════════
// Fawry Payment Gateway Adapter
// Fawry (فوري) - Sudanese Payment Platform
// ═══════════════════════════════════════════════════════════════
// TODO: Add real Fawry API credentials to .env:
//   FAWRY_MERCHANT_ID=your_merchant_id
//   FAWRY_API_KEY=your_api_key
//   FAWRY_API_SECRET=your_api_secret
//   FAWRY_BASE_URL=https://api.fawry.com
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

export class FawryProvider extends BasePaymentProvider {
  readonly gateway: PaymentGateway = "fawry";
  readonly config: GatewayConfig = GATEWAYS.fawry;

  private get merchantId() {
    return process.env.FAWRY_MERCHANT_ID || "";
  }
  private get apiKey() {
    return process.env.FAWRY_API_KEY || "";
  }
  private get baseUrl() {
    return process.env.FAWRY_BASE_URL || "https://api.fawry.com";
  }

  isConfigured(): boolean {
    return !!(this.merchantId && this.apiKey);
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const paymentId = await this.createPaymentRecord(request);

    if (!this.isConfigured()) {
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/payment/fawry?paymentId=${paymentId}&amount=${request.amount}`,
        message: "Fawry gateway in demo mode",
      };
    }

    try {
      // ── TODO: Replace with real Fawry API call ──
      const response = await fetch(`${this.baseUrl}/api/v1/charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount: request.amount,
          currency: "SDG",
          order_id: paymentId,
          customer_name: request.donorName,
          customer_email: request.donorEmail,
          customer_phone: request.donorPhone || "",
          description: request.description || "Donation to AIUAG",
        }),
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "pending") {
        await this.updatePaymentStatus(paymentId, "processing", data.reference || data.charge_id);
        await this.createTransaction(paymentId, "authorization", "pending", request.amount, request.currency, data.reference, data);

        return {
          success: true,
          paymentId,
          gatewayReference: data.reference || data.charge_id,
          redirectUrl: data.payment_url || data.fawry_url,
          status: "processing",
        };
      }

      await this.updatePaymentStatus(paymentId, "failed");
      return { success: false, paymentId, status: "failed", message: data.message || "Fawry payment failed" };
    } catch (error) {
      await this.updatePaymentStatus(paymentId, "failed");
      await this.logEvent(paymentId, "error", "api_error", `Fawry API error: ${error}`);
      return { success: false, paymentId, status: "failed", message: "Payment gateway error" };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "pending" };
    }

    try {
      // ── TODO: Replace with real Fawry verification ──
      const response = await fetch(`${this.baseUrl}/api/v1/charge/${request.gatewayReference}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = await response.json();
      const status: PaymentStatus = data.status === "paid" ? "completed" : data.status === "failed" ? "failed" : "pending";
      return { success: status === "completed", status, gatewayReference: data.reference, amount: data.amount, currency: "SDG" };
    } catch (error) {
      await this.logEvent(request.paymentId, "error", "verify_error", `Fawry verify error: ${error}`);
      return { success: false, status: "failed" };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = await this.createRefundRecord(request.paymentId, request.amount || 0, "SDG", request.reason);
    return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "Fawry refund API not yet implemented" };
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent> {
    const eventType = (payload.event as string) || "payment.completed";
    const status: PaymentStatus = eventType.includes("completed") || eventType.includes("paid") ? "completed" : "failed";
    return {
      gateway: "fawry",
      eventType,
      gatewayReference: (payload.reference as string) || "",
      amount: payload.amount as number,
      currency: "SDG",
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
