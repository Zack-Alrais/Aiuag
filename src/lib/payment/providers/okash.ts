// ═══════════════════════════════════════════════════════════════
// OKash Payment Gateway Adapter
// OKash (أوكاش) - Sudanese Mobile Payment
// ═══════════════════════════════════════════════════════════════
// TODO: Add real OKash API credentials to .env:
//   OKASH_MERCHANT_ID=your_merchant_id
//   OKASH_API_KEY=your_api_key
//   OKASH_BASE_URL=https://api.okash.com
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

export class OkashProvider extends BasePaymentProvider {
  readonly gateway: PaymentGateway = "okash";
  readonly config: GatewayConfig = GATEWAYS.okash;

  private get merchantId() {
    return process.env.OKASH_MERCHANT_ID || "";
  }
  private get apiKey() {
    return process.env.OKASH_API_KEY || "";
  }
  private get baseUrl() {
    return process.env.OKASH_BASE_URL || "https://api.okash.com";
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
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/payment/okash?paymentId=${paymentId}&amount=${request.amount}`,
        message: "OKash gateway in demo mode",
      };
    }

    try {
      // ── TODO: Replace with real OKash API call ──
      const response = await fetch(`${this.baseUrl}/api/v1/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Merchant-Id": this.merchantId,
        },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount: request.amount,
          currency: "SDG",
          reference: paymentId,
          customer_name: request.donorName,
          customer_email: request.donorEmail,
          customer_phone: request.donorPhone || "",
          description: request.description || "Donation to AIUAG",
        }),
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "pending") {
        await this.updatePaymentStatus(paymentId, "processing", data.reference);
        await this.createTransaction(paymentId, "authorization", "pending", request.amount, request.currency, data.reference, data);

        return {
          success: true,
          paymentId,
          gatewayReference: data.reference,
          redirectUrl: data.payment_url || data.ussd_code,
          status: "processing",
        };
      }

      await this.updatePaymentStatus(paymentId, "failed");
      return { success: false, paymentId, status: "failed", message: data.message || "OKash payment failed" };
    } catch (error) {
      await this.updatePaymentStatus(paymentId, "failed");
      await this.logEvent(paymentId, "error", "api_error", `OKash API error: ${error}`);
      return { success: false, paymentId, status: "failed", message: "Payment gateway error" };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "pending" };
    }

    try {
      // ── TODO: Replace with real OKash verification ──
      const response = await fetch(`${this.baseUrl}/api/v1/payment/status/${request.gatewayReference}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, "X-Merchant-Id": this.merchantId },
      });
      const data = await response.json();
      const status: PaymentStatus = data.status === "completed" ? "completed" : data.status === "failed" ? "failed" : "pending";
      return { success: status === "completed", status, gatewayReference: data.reference, amount: data.amount, currency: "SDG" };
    } catch (error) {
      await this.logEvent(request.paymentId, "error", "verify_error", `OKash verify error: ${error}`);
      return { success: false, status: "failed" };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = await this.createRefundRecord(request.paymentId, request.amount || 0, "SDG", request.reason);
    return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "OKash refund not yet implemented" };
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent> {
    const eventType = (payload.event as string) || "payment.completed";
    const status: PaymentStatus = eventType.includes("completed") ? "completed" : "failed";
    return {
      gateway: "okash",
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
