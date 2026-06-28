import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/providers";
import { PaymentGateway } from "@/types/payment";
import { generateReceiptNumber } from "@/lib/payment/utils";

// ─── POST /api/webhooks/[gateway] ─────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gateway: string }> }
) {
  const { gateway } = await params;

  try {
    const gatewayName = gateway as PaymentGateway;
    const body = await request.json();
    const signature = request.headers.get("x-webhook-signature") || request.headers.get("stripe-signature") || undefined;

    // ── Log webhook ──
    await prisma.webhook.create({
      data: {
        gateway: gatewayName,
        eventType: (body.type as string) || (body.event_type as string) || "unknown",
        gatewayReference: (body.data?.object?.id as string) || (body.resource?.id as string) || null,
        payload: JSON.stringify(body),
        signature: signature || null,
        status: "received",
      },
    });

    // ── Process through provider ──
    const provider = getPaymentProvider(gatewayName);
    const event = await provider.handleWebhook(body, signature);

    // ── Find and update payment ──
    let payment = null;
    if (event.gatewayReference) {
      payment = await prisma.payment.findFirst({
        where: {
          gateway: gatewayName,
          OR: [
            { gatewayReference: event.gatewayReference },
            { gatewayPaymentId: event.gatewayReference },
          ],
        },
        include: { donation: true },
      });
    }

    if (!payment) {
      // Try to find by metadata or donation ID
      const donationId = body.data?.object?.metadata?.donation_id || body.metadata?.donation_id;
      if (donationId) {
        payment = await prisma.payment.findFirst({
          where: { donationId },
          include: { donation: true },
        });
      }
    }

    if (payment) {
      // ── Update payment status ──
      const newStatus = event.status;
      const currentStatus = payment.status;

      if (currentStatus !== "completed" && currentStatus !== "refunded") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            gatewayPaymentId: event.gatewayReference || payment.gatewayPaymentId,
            paidAt: newStatus === "completed" ? new Date() : payment.paidAt,
          },
        });

        // ── Create transaction ──
        await prisma.transaction.create({
          data: {
            transactionNumber: `TXN-${Date.now().toString(36).toUpperCase()}`,
            paymentId: payment.id,
            type: newStatus === "completed" ? "capture" : "authorization",
            status: newStatus === "completed" ? "completed" : newStatus === "failed" ? "failed" : "pending",
            amount: event.amount || payment.amount,
            currency: event.currency || payment.currency,
            gatewayReference: event.gatewayReference || null,
            gatewayResponse: JSON.stringify(event.rawPayload),
          },
        });

        // ── Update donation status ──
        const donationStatus =
          newStatus === "completed" ? "completed" :
          newStatus === "failed" ? "failed" : "processing";

        await prisma.donation.update({
          where: { id: payment.donationId },
          data: { status: donationStatus },
        });

        // ── Generate receipt on completion ──
        if (newStatus === "completed") {
          await prisma.donationReceipt.create({
            data: {
              receiptNumber: generateReceiptNumber(),
              donationId: payment.donationId,
              donorName: payment.donation.donorName,
              donorEmail: payment.donation.donorEmail,
              amount: payment.amount,
              currency: payment.currency,
              paymentMethod: payment.gateway,
              gatewayReference: event.gatewayReference || "",
            },
          });

          // ── Create success notification ──
          await prisma.notification.create({
            data: {
              titleAr: "تم استلام التبرع",
              titleEn: "Donation Received",
              messageAr: `تم استلام تبرع من ${payment.donation.donorName} بقيمة ${payment.amount} ${payment.currency}`,
              messageEn: `Donation of ${payment.amount} ${payment.currency} received from ${payment.donation.donorName}`,
              type: "success",
              entityType: "donation",
              entityId: payment.donationId,
            },
          });

          // ── TODO: Send confirmation email to donor ──
          // await sendDonationConfirmation(payment.donation);
        }
      }

      // ── Update webhook status ──
      await prisma.webhook.updateMany({
        where: {
          gateway: gatewayName,
          gatewayReference: event.gatewayReference,
          status: "received",
        },
        data: {
          status: "processed",
          processedAt: new Date(),
          paymentId: payment.id,
        },
      });

      return NextResponse.json({ received: true, processed: true });
    }

    // ── Update webhook as ignored ──
    await prisma.webhook.updateMany({
      where: { gateway: gatewayName, status: "received", payload: JSON.stringify(body) },
      data: { status: "ignored" },
    });

    return NextResponse.json({ received: true, processed: false, message: "No matching payment found" });
  } catch (error) {
    console.error(`Webhook error for ${gateway}:`, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
