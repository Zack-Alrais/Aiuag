"use client"

import { CreditCard, Smartphone, Building, Shield, Loader2 } from "lucide-react"
import { PaymentGateway, GatewayConfig, Currency, CURRENCIES } from "@/types/payment"

interface PaymentMethodSelectorProps {
  gateways: GatewayConfig[]
  selectedGateway: PaymentGateway | ""
  currency: Currency
  onSelect: (gateway: PaymentGateway) => void
  loading?: boolean
}

export default function PaymentMethodSelector({
  gateways,
  selectedGateway,
  currency,
  onSelect,
  loading = false,
}: PaymentMethodSelectorProps) {
  const currencyConfig = CURRENCIES[currency]
  const sudaneseGateways = gateways.filter((g) => g.isSudanese)
  const internationalGateways = gateways.filter((g) => !g.isSudanese)

  const getGatewayIcon = (gateway: GatewayConfig) => {
    if (gateway.isSudanese) return <Smartphone className="w-5 h-5" />
    if (gateway.id === "stripe" || gateway.id === "verifone") return <CreditCard className="w-5 h-5" />
    if (gateway.id === "paypal") return <Building className="w-5 h-5" />
    return <CreditCard className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A3A6B]" />
      </div>
    )
  }

  if (gateways.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد بوابات دفع متاحة لهذه العملة
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sudaneseGateways.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <Smartphone className="w-4 h-4" />
            الدفع المحلي
          </p>
          <div className="grid grid-cols-3 gap-3">
            {sudaneseGateways.map((g) => (
              <button
                key={g.id}
                onClick={() => onSelect(g.id)}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-bold transition-all ${
                  selectedGateway === g.id
                    ? "bg-[#1A3A6B] text-white shadow-lg"
                    : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-[#1A3A6B]/50"
                }`}
              >
                {getGatewayIcon(g)}
                <span className="text-sm">{g.nameAr}</span>
                {!g.isConfigured && (
                  <span className="text-[10px] opacity-60 bg-white/20 px-2 py-0.5 rounded-full">Demo</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {internationalGateways.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            الدفع الدولي
          </p>
          <div className="grid grid-cols-3 gap-3">
            {internationalGateways.map((g) => (
              <button
                key={g.id}
                onClick={() => onSelect(g.id)}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-bold transition-all ${
                  selectedGateway === g.id
                    ? "bg-[#1A3A6B] text-white shadow-lg"
                    : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-[#1A3A6B]/50"
                }`}
              >
                {getGatewayIcon(g)}
                <span className="text-sm">{g.nameAr}</span>
                {!g.isConfigured && (
                  <span className="text-[10px] opacity-60 bg-white/20 px-2 py-0.5 rounded-full">Demo</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <Shield className="w-3.5 h-3.5" />
        جميع المعاملات آمنة ومشفرة
      </div>
    </div>
  )
}
