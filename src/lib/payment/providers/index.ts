import { PaymentGateway, PaymentProvider } from "@/types/payment";
import { BankakProvider } from "./bankak";
import { FawryProvider } from "./fawry";
import { OkashProvider } from "./okash";
import { StripeProvider } from "./stripe";
import { PaypalProvider } from "./paypal";
import { VerifoneProvider } from "./verifone";

// ─── Provider Registry (Singleton) ────────────────────────────
const providerInstances = new Map<PaymentGateway, PaymentProvider>();

function getProvider(provider: PaymentGateway): PaymentProvider {
  if (!providerInstances.has(provider)) {
    switch (provider) {
      case "bankak":
        providerInstances.set(provider, new BankakProvider());
        break;
      case "fawry":
        providerInstances.set(provider, new FawryProvider());
        break;
      case "okash":
        providerInstances.set(provider, new OkashProvider());
        break;
      case "stripe":
        providerInstances.set(provider, new StripeProvider());
        break;
      case "paypal":
        providerInstances.set(provider, new PaypalProvider());
        break;
      case "verifone":
        providerInstances.set(provider, new VerifoneProvider());
        break;
      case "apple_pay":
      case "google_pay":
        // These are handled through Stripe or PayPal as payment methods
        throw new Error(`Payment method ${provider} requires a parent gateway (Stripe/PayPal)`);
      default:
        throw new Error(`Unknown payment gateway: ${provider}`);
    }
  }
  return providerInstances.get(provider)!;
}

export function getPaymentProvider(gateway: PaymentGateway): PaymentProvider {
  return getProvider(gateway);
}

export function getAllProviders(): PaymentGateway[] {
  return ["bankak", "fawry", "okash", "stripe", "paypal", "verifone"];
}
