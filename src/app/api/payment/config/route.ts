import { NextRequest, NextResponse } from "next/server";
import {
  CURRENCIES,
  GATEWAYS,
  Currency,
  PaymentGateway,
} from "@/types/payment";
import { getPaymentProvider } from "@/lib/payment/providers";

// ─── GET /api/payment/config ──────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") as Currency | null;

    const gateways = Object.values(GATEWAYS).map((g) => {
      const provider = getPaymentProvider(g.id);
      return {
        ...g,
        isConfigured: provider.isConfigured(),
      };
    });

    if (currency && CURRENCIES[currency]) {
      const config = CURRENCIES[currency];
      const filtered = gateways.filter(
        (g) =>
          g.isActive &&
          g.supportedCurrencies.includes(currency) &&
          (config.isSudanese ? g.isSudanese : !g.isSudanese)
      );
      return NextResponse.json({ gateways: filtered, currency: config });
    }

    return NextResponse.json({
      currencies: Object.values(CURRENCIES),
      gateways,
    });
  } catch (error) {
    console.error("Payment config error:", error);
    return NextResponse.json(
      { error: "Failed to load payment config" },
      { status: 500 }
    );
  }
}
