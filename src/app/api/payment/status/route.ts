import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/providers";
import { PaymentGateway } from "@/types/payment";

// ─── GET /api/payment/status?id=xxx ───────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get("donationId");
    const paymentId = searchParams.get("paymentId");

    if (!donationId && !paymentId) {
      return NextResponse.json(
        { error: "donationId or paymentId is required" },
        { status: 400 }
      );
    }

    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          donation: { select: { donationNumber: true, donorName: true, amount: true, currency: true, status: true } },
          transactions: { orderBy: { createdAt: "desc" }, take: 5 },
          refunds: { orderBy: { createdAt: "desc" } },
        },
      });
    } else if (donationId) {
      payment = await prisma.payment.findFirst({
        where: { donationId },
        include: {
          donation: { select: { donationNumber: true, donorName: true, amount: true, currency: true, status: true } },
          transactions: { orderBy: { createdAt: "desc" }, take: 5 },
          refunds: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // ── If status is still pending/processing, verify with gateway ──
    if ((payment.status === "pending" || payment.status === "processing") && payment.gatewayReference) {
      try {
        const provider = getPaymentProvider(payment.gateway as PaymentGateway);
        if (provider.isConfigured()) {
          const verification = await provider.verifyPayment({
            paymentId: payment.id,
            gatewayReference: payment.gatewayReference,
          });

          if (verification.status !== payment.status) {
            // Update status
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: verification.status },
            });

            // Update donation
            const donationStatus =
              verification.status === "completed" ? "completed" :
              verification.status === "failed" ? "failed" : "processing";

            await prisma.donation.update({
              where: { id: payment.donationId },
              data: { status: donationStatus },
            });

            payment.status = verification.status;
            payment.donation.status = donationStatus;
          }
        }
      } catch {
        // Gateway verification failed, keep current status
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        gatewayReference: payment.gatewayReference,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
      donation: payment.donation,
      transactions: payment.transactions,
      refunds: payment.refunds,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
