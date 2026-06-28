// ═══════════════════════════════════════════════════════════════
// Bankak Payment Gateway Adapter
// Bankak (بنكك) - Sudanese Mobile Payment
// ═══════════════════════════════════════════════════════════════
// TODO: Add real Bankak API credentials to .env:
//   BANKAK_MERCHANT_ID=your_merchant_id
//   BANKAK_API_KEY=your_api_key
//   BANKAK_API_SECRET=your_api_secret
//   BANKAK_BASE_URL=https://api.bankak.com
//   BANKAK_MERCHANT_CODE=your_merchant_code
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
import { generatePaymentNumber } from "../utils";

export class BankakProvider extends BasePaymentProvider {
  readonly gateway: PaymentGateway = "bankak";
  readonly config: GatewayConfig = GATEWAYS.bankak;

  private get merchantId() {
    return process.env.BANKAK_MERCHANT_ID || "";
  }
  private get apiKey() {
    return process.env.BANKAK_API_KEY || "";
  }
  private get baseUrl() {
    return process.env.BANKAK_BASE_URL || "https://api.bankak.com";
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
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/payment/bankak?paymentId=${paymentId}&amount=${request.amount}`,
        message: "Bankak gateway in demo mode - redirecting to payment page",
      };
    }

    try {
      // ── TODO: Replace with real Bankak API call ──
      const response = await fetch(`${this.baseUrl}/api/v1/payment/initiate`, {
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
          return_url: request.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/donations/success`,
          cancel_url: request.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/donations/cancel`,
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
          redirectUrl: data.payment_url || data.redirect_url,
          status: "processing",
        };
      }

      await this.updatePaymentStatus(paymentId, "failed");
      return { success: false, paymentId, status: "failed", message: data.message || "Payment initiation failed" };
    } catch (error) {
      await this.updatePaymentStatus(paymentId, "failed");
      await this.logEvent(paymentId, "error", "api_error", `Bankak API error: ${error}`);
      return { success: false, paymentId, status: "failed", message: "Payment gateway error" };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      return { success: false, status: "pending" };
    }

    try {
      // ── TODO: Replace with real Bankak verification API ──
      const response = await fetch(`${this.baseUrl}/api/v1/payment/status/${request.gatewayReference}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-Merchant-Id": this.merchantId,
        },
      });

      const data = await response.json();

      const status: PaymentStatus =
        data.status === "completed" || data.status === "paid"
          ? "completed"
          : data.status === "failed"
          ? "failed"
          : "pending";

      return {
        success: status === "completed",
        status,
        gatewayReference: data.reference,
        amount: data.amount,
        currency: "SDG",
        paidAt: data.paid_at,
      };
    } catch (error) {
      await this.logEvent(request.paymentId, "error", "verify_error", `Bankak verify error: ${error}`);
      return { success: false, status: "failed" };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = await this.createRefundRecord(request.paymentId, request.amount || 0, "SDG", request.reason);

    if (!this.isConfigured()) {
      return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "Bankak gateway not configured" };
    }

    // ── TODO: Implement Bankak refund API ──
    return { success: false, refundId, status: "failed", amount: request.amount || 0, message: "Bankak refund API not yet implemented" };
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent> {
    // ── TODO: Verify Bankak webhook signature ──
    const eventType = (payload.event as string) || "payment.completed";
    const status: PaymentStatus =
      eventType.includes("completed") || eventType.includes("paid") ? "completed" : "failed";

    return {
      gateway: "bankak",
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
    // ── TODO: Implement Bankak status check ──
    return "pending";
  }
}
