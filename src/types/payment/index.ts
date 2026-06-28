// ═══════════════════════════════════════════════════════════════
// Payment System Types - Enterprise Grade
// ═══════════════════════════════════════════════════════════════

// ─── Gateway枚举 ───────────────────────────────────────────────
export type PaymentGateway =
  | "bankak"
  | "fawry"
  | "okash"
  | "stripe"
  | "paypal"
  | "verifone"
  | "apple_pay"
  | "google_pay";

// ─── Currency ─────────────────────────────────────────────────
export type Currency = "USD" | "EUR" | "SAR" | "AED" | "GBP" | "SDG";

// ─── Payment Status ───────────────────────────────────────────
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "expired"
  | "disputed";

// ─── Donation Status ──────────────────────────────────────────
export type DonationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

// ─── Refund Status ────────────────────────────────────────────
export type RefundStatus = "pending" | "processing" | "completed" | "failed";

// ─── Currency Config ──────────────────────────────────────────
export interface CurrencyConfig {
  code: Currency;
  name: string;
  nameAr: string;
  symbol: string;
  decimals: number;
  isSudanese: boolean;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { code: "USD", name: "US Dollar", nameAr: "الدولار الأمريكي", symbol: "$", decimals: 2, isSudanese: false },
  EUR: { code: "EUR", name: "Euro", nameAr: "اليورو", symbol: "€", decimals: 2, isSudanese: false },
  SAR: { code: "SAR", name: "Saudi Riyal", nameAr: "الريال السعودي", symbol: "﷼", decimals: 2, isSudanese: false },
  AED: { code: "AED", name: "UAE Dirham", nameAr: "الدرهم الإماراتي", symbol: "د.إ", decimals: 2, isSudanese: false },
  GBP: { code: "GBP", name: "British Pound", nameAr: "الجنيه الإسترليني", symbol: "£", decimals: 2, isSudanese: false },
  SDG: { code: "SDG", name: "Sudanese Pound", nameAr: "الجنيه السوداني", symbol: "ج.س", decimals: 2, isSudanese: true },
};

// ─── Gateway Config ───────────────────────────────────────────
export interface GatewayConfig {
  id: PaymentGateway;
  name: string;
  nameAr: string;
  icon: string;
  supportedCurrencies: Currency[];
  isActive: boolean;
  requiresApiKey: boolean;
  isSudanese: boolean;
}

export const GATEWAYS: Record<PaymentGateway, GatewayConfig> = {
  bankak: {
    id: "bankak",
    name: "Bankak",
    nameAr: "بنكك",
    icon: "/uploads/payments/bankak.svg",
    supportedCurrencies: ["SDG"],
    isActive: true,
    requiresApiKey: true,
    isSudanese: true,
  },
  fawry: {
    id: "fawry",
    name: "Fawry",
    nameAr: "فوري",
    icon: "/uploads/payments/fawry.svg",
    supportedCurrencies: ["SDG"],
    isActive: true,
    requiresApiKey: true,
    isSudanese: true,
  },
  okash: {
    id: "okash",
    name: "OKash",
    nameAr: "أوكاش",
    icon: "/uploads/payments/okash.svg",
    supportedCurrencies: ["SDG"],
    isActive: true,
    requiresApiKey: true,
    isSudanese: true,
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    nameAr: "سترايب",
    icon: "/uploads/payments/stripe.svg",
    supportedCurrencies: ["USD", "EUR", "SAR", "AED", "GBP"],
    isActive: true,
    requiresApiKey: true,
    isSudanese: false,
  },
  paypal: {
    id: "paypal",
    name: "PayPal",
    nameAr: "باي بال",
    icon: "/uploads/payments/paypal.svg",
    supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
    isActive: true,
    requiresApiKey: true,
    isSudanese: false,
  },
  verifone: {
    id: "verifone",
    name: "2Checkout",
    nameAr: "2Checkout",
    icon: "/uploads/payments/verifone.svg",
    supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
    isActive: true,
    requiresApiKey: true,
    isSudanese: false,
  },
  apple_pay: {
    id: "apple_pay",
    name: "Apple Pay",
    nameAr: "أبل باي",
    icon: "/uploads/payments/apple-pay.svg",
    supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
    isActive: false,
    requiresApiKey: true,
    isSudanese: false,
  },
  google_pay: {
    id: "google_pay",
    name: "Google Pay",
    nameAr: "جوجل باي",
    icon: "/uploads/payments/google-pay.svg",
    supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
    isActive: false,
    requiresApiKey: true,
    isSudanese: false,
  },
};

// ─── Payment Request/Response ─────────────────────────────────
export interface CreatePaymentRequest {
  donationId: string;
  gateway: PaymentGateway;
  amount: number;
  currency: Currency;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  description?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  gatewayReference?: string;
  redirectUrl?: string;
  clientSecret?: string;
  status: PaymentStatus;
  message?: string;
  metadata?: Record<string, string>;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  gatewayReference?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: PaymentStatus;
  gatewayReference?: string;
  amount?: number;
  currency?: Currency;
  paidAt?: string;
  metadata?: Record<string, string>;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  status: RefundStatus;
  amount: number;
  message?: string;
}

// ─── Webhook ──────────────────────────────────────────────────
export interface WebhookEvent {
  gateway: PaymentGateway;
  eventType: string;
  gatewayReference: string;
  paymentId?: string;
  amount?: number;
  currency?: Currency;
  status: PaymentStatus;
  rawPayload: Record<string, unknown>;
  signature?: string;
  timestamp: string;
}

export interface WebhookResponse {
  received: boolean;
  processed: boolean;
  message?: string;
}

// ─── Donation Form ────────────────────────────────────────────
export interface DonationFormData {
  amount: number;
  currency: Currency;
  paymentMethod: PaymentGateway;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorCountry?: string;
  isAnonymous: boolean;
  message?: string;
  acceptTerms: boolean;
}

// ─── Stats ────────────────────────────────────────────────────
export interface DonationStats {
  today: { count: number; total: number; currency: Currency };
  month: { count: number; total: number; currency: Currency };
  year: { count: number; total: number; currency: Currency };
  successful: number;
  failed: number;
  pending: number;
  refunded: number;
}

// ─── Receipt ──────────────────────────────────────────────────
export interface DonationReceipt {
  id: string;
  receiptNumber: string;
  donationId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: Currency;
  paymentMethod: string;
  gatewayReference: string;
  date: Date;
  qrCode: string;
  verificationUrl: string;
  isAnonymous: boolean;
}

// ─── Provider Interface ───────────────────────────────────────
export interface PaymentProvider {
  readonly gateway: PaymentGateway;
  readonly config: GatewayConfig;

  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  refund(request: RefundRequest): Promise<RefundResponse>;
  handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<WebhookEvent>;
  getStatus(gatewayReference: string): Promise<PaymentStatus>;
  isConfigured(): boolean;
}
