import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/providers";
import {
  DonationFormData,
  Currency,
  PaymentGateway,
  CURRENCIES,
  GATEWAYS,
} from "@/types/payment";
import {
  generateDonationNumber,
  isValidEmail,
  isValidAmount,
  sanitizeInput,
  getClientIp,
  getUserAgent,
} from "@/lib/payment/utils";

// ─── POST /api/payment/process ────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: DonationFormData = await request.json();

    // ── Validation ──
    const errors: string[] = [];

    if (!body.donorName || body.donorName.trim().length < 2) {
      errors.push("الاسم مطلوب ويجب أن يكون على الأقل حرفين");
    }

    if (!body.donorEmail || !isValidEmail(body.donorEmail)) {
      errors.push("البريد الإلكتروني غير صحيح");
    }

    if (!isValidAmount(body.amount)) {
      errors.push("المبلغ غير صحيح");
    }

    if (!body.currency || !CURRENCIES[body.currency]) {
      errors.push("العملة غير مدعومة");
    }

    if (!body.paymentMethod || !GATEWAYS[body.paymentMethod]) {
      errors.push("طريقة الدفع غير مدعومة");
    }

    if (!body.acceptTerms) {
      errors.push("يجب قبول الشروط والأحكام");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    // ── Check gateway is available for currency ──
    const gatewayConfig = GATEWAYS[body.paymentMethod as PaymentGateway];
    const currencyConfig = CURRENCIES[body.currency as Currency];

    if (!gatewayConfig.supportedCurrencies.includes(body.currency as Currency)) {
      return NextResponse.json(
        { error: `طريقة الدفع ${gatewayConfig.nameAr} لا تدعم العملة ${currencyConfig.nameAr}` },
        { status: 400 }
      );
    }

    // ── Create Donation record ──
    const donation = await prisma.donation.create({
      data: {
        donationNumber: generateDonationNumber(),
        donorName: sanitizeInput(body.donorName),
        donorEmail: body.donorEmail.toLowerCase().trim(),
        donorPhone: body.donorPhone ? sanitizeInput(body.donorPhone) : null,
        donorCountry: body.donorCountry ? sanitizeInput(body.donorCountry) : null,
        amount: body.amount,
        currency: body.currency,
        paymentMethod: body.paymentMethod,
        gateway: body.paymentMethod,
        message: body.message ? sanitizeInput(body.message) : null,
        isAnonymous: body.isAnonymous,
        status: "pending",
      },
    });

    // ── Process payment through gateway ──
    const provider = getPaymentProvider(body.paymentMethod as PaymentGateway);

    const paymentResponse = await provider.createPayment({
      donationId: donation.id,
      gateway: body.paymentMethod as PaymentGateway,
      amount: body.amount,
      currency: body.currency as Currency,
      donorName: sanitizeInput(body.donorName),
      donorEmail: body.donorEmail.toLowerCase().trim(),
      donorPhone: body.donorPhone,
      description: `Donation to AIUAG - ${body.donorName}`,
      metadata: {
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
        donationNumber: donation.donationNumber,
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/donations/success?donationId=${donation.id}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/donations/cancel?donationId=${donation.id}`,
    });

    // ── Update donation with payment result ──
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: paymentResponse.success ? "processing" : "failed",
      },
    });

    // ── Create notification for admin ──
    if (paymentResponse.success) {
      await prisma.notification.create({
        data: {
          titleAr: "تبرع جديد",
          titleEn: "New Donation",
          messageAr: `تبرع جديد من ${body.isAnonymous ? "مجهول" : body.donorName} بقيمة ${body.amount} ${body.currency}`,
          messageEn: `New donation from ${body.isAnonymous ? "anonymous" : body.donorName} for ${body.amount} ${body.currency}`,
          type: "success",
          entityType: "donation",
          entityId: donation.id,
        },
      });
    }

    return NextResponse.json({
      success: paymentResponse.success,
      donationId: donation.id,
      donationNumber: donation.donationNumber,
      paymentId: paymentResponse.paymentId,
      redirectUrl: paymentResponse.redirectUrl,
      status: paymentResponse.status,
      message: paymentResponse.message,
    });
  } catch (error) {
    console.error("Payment process error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الدفع" },
      { status: 500 }
    );
  }
}
