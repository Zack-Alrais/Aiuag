import { PaymentLog } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  PaymentProvider,
  PaymentGateway,
  CreatePaymentRequest,
  PaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  RefundRequest,
  RefundResponse,
  WebhookEvent,
  PaymentStatus,
  GatewayConfig,
} from "@/types/payment";
import {
  generatePaymentNumber,
  generateTransactionNumber,
  generateRefundNumber,
  getClientIp,
  getUserAgent,
} from "../utils";

// ─── Abstract Base Provider ───────────────────────────────────
export abstract class BasePaymentProvider implements PaymentProvider {
  abstract readonly gateway: PaymentGateway;
  abstract readonly config: GatewayConfig;

  abstract createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  abstract verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  abstract refund(request: RefundRequest): Promise<RefundResponse>;
  abstract handleWebhook(
    payload: Record<string, unknown>,
    signature?: string
  ): Promise<WebhookEvent>;
  abstract getStatus(gatewayReference: string): Promise<PaymentStatus>;
  abstract isConfigured(): boolean;

  // ─── Shared DB operations ─────────────────────────────────
  protected async createPaymentRecord(
    request: CreatePaymentRequest,
    extraMetadata?: Record<string, string>
  ): Promise<string> {
    const paymentNumber = generatePaymentNumber();
    const ipAddress = request.metadata?.ipAddress;
    const userAgent = request.metadata?.userAgent;

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        donationId: request.donationId,
        gateway: this.gateway,
        status: "pending",
        amount: request.amount,
        currency: request.currency,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: extraMetadata ? JSON.stringify(extraMetadata) : null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
      },
    });

    await this.logEvent(payment.id, "info", "payment_created", `Payment ${paymentNumber} created for gateway ${this.gateway}`);

    return payment.id;
  }

  protected async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    gatewayReference?: string,
    gatewayPaymentId?: string,
    paidAt?: Date
  ): Promise<void> {
    const updateData: Record<string, unknown> = { status };
    if (gatewayReference) updateData.gatewayReference = gatewayReference;
    if (gatewayPaymentId) updateData.gatewayPaymentId = gatewayPaymentId;
    if (paidAt) updateData.paidAt = paidAt;

    await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });

    // Update donation status
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { donationId: true },
    });

    if (payment) {
      const donationStatus =
        status === "completed"
          ? "completed"
          : status === "failed"
          ? "failed"
          : status === "refunded"
          ? "refunded"
          : "processing";

      await prisma.donation.update({
        where: { id: payment.donationId },
        data: { status: donationStatus },
      });
    }

    await this.logEvent(paymentId, "info", "status_updated", `Status updated to ${status}`);
  }

  protected async createTransaction(
    paymentId: string,
    type: string,
    status: string,
    amount: number,
    currency: string,
    gatewayReference?: string,
    gatewayResponse?: Record<string, unknown>
  ): Promise<void> {
    await prisma.transaction.create({
      data: {
        transactionNumber: generateTransactionNumber(),
        paymentId,
        type,
        status,
        amount,
        currency,
        gatewayReference: gatewayReference || null,
        gatewayResponse: gatewayResponse ? JSON.stringify(gatewayResponse) : null,
      },
    });
  }

  protected async logEvent(
    paymentId: string,
    level: string,
    event: string,
    message?: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await prisma.paymentLog.create({
      data: {
        paymentId,
        level,
        event,
        message: message || null,
        data: data ? JSON.stringify(data) : null,
      },
    });
  }

  protected async createRefundRecord(
    paymentId: string,
    amount: number,
    currency: string,
    reason?: string
  ): Promise<string> {
    const refundNumber = generateRefundNumber();

    const refund = await prisma.refund.create({
      data: {
        refundNumber,
        paymentId,
        amount,
        currency,
        reason: reason || null,
        status: "pending",
      },
    });

    return refund.id;
  }
}
