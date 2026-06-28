import crypto from "crypto";
import { Currency, CURRENCIES, PaymentGateway, GATEWAYS } from "@/types/payment";

// ─── Generate unique IDs ─────────────────────────────────────
export function generatePaymentNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

export function generateDonationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `DON-${timestamp}-${random}`;
}

export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

export function generateTransactionNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

export function generateRefundNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `REF-${timestamp}-${random}`;
}

// ─── Currency helpers ─────────────────────────────────────────
export function getCurrencyConfig(currency: Currency) {
  return CURRENCIES[currency];
}

export function formatAmount(amount: number, currency: Currency): string {
  const config = CURRENCIES[currency];
  return `${config.symbol}${amount.toFixed(config.decimals)}`;
}

export function isValidCurrency(currency: string): currency is Currency {
  return currency in CURRENCIES;
}

// ─── Gateway helpers ──────────────────────────────────────────
export function getGatewayConfig(gateway: PaymentGateway) {
  return GATEWAYS[gateway];
}

export function getAvailableGateways(currency: Currency) {
  const config = CURRENCIES[currency];
  return Object.values(GATEWAYS).filter(
    (g) =>
      g.isActive &&
      g.supportedCurrencies.includes(currency) &&
      (config.isSudanese ? g.isSudanese : !g.isSudanese)
  );
}

export function getPrioritizedGateways(currency: Currency) {
  const gateways = getAvailableGateways(currency);
  const sudanese = gateways.filter((g) => g.isSudanese);
  const international = gateways.filter((g) => !g.isSudanese);
  return { sudanese, international, all: [...sudanese, ...international] };
}

// ─── Signature helpers ────────────────────────────────────────
export function createHmacSignature(
  payload: string,
  secret: string,
  algorithm: string = "sha256"
): string {
  return crypto.createHmac(algorithm, secret).update(payload).digest("hex");
}

export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = "sha256"
): boolean {
  const expected = createHmacSignature(payload, secret, algorithm);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function createSha256Hash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ─── Validation helpers ───────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= 1000000;
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{7,20}$/.test(phone);
}

// ─── Sanitize ─────────────────────────────────────────────────
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 500);
}

// ─── IP extraction ────────────────────────────────────────────
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}
