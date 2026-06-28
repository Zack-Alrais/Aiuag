"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Currency,
  PaymentGateway,
  CurrencyConfig,
  GatewayConfig,
  DonationFormData,
} from "@/types/payment"

interface UsePaymentReturn {
  currencies: CurrencyConfig[]
  gateways: GatewayConfig[]
  loading: boolean
  submitting: boolean
  error: string
  success: boolean
  selectedCurrency: Currency
  selectedGateway: PaymentGateway | ""
  availableGateways: GatewayConfig[]
  setCurrency: (currency: Currency) => void
  setGateway: (gateway: PaymentGateway | "") => void
  processDonation: (data: DonationFormData) => Promise<{ redirectUrl?: string; donationId?: string } | null>
  clearError: () => void
  clearSuccess: () => void
}

export function usePayment(): UsePaymentReturn {
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([])
  const [allGateways, setAllGateways] = useState<GatewayConfig[]>([])
  const [availableGateways, setAvailableGateways] = useState<GatewayConfig[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD")
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | "">("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // ── Load config ──
  useEffect(() => {
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then((data) => {
        setCurrencies(data.currencies || [])
        setAllGateways(data.gateways || [])
      })
      .catch(() => setError("Failed to load payment config"))
      .finally(() => setLoading(false))
  }, [])

  // ── Filter gateways when currency changes ──
  useEffect(() => {
    const filtered = allGateways.filter(
      (g) => g.isActive && g.supportedCurrencies.includes(selectedCurrency)
    )
    setAvailableGateways(filtered)
    setSelectedGateway(filtered.length > 0 ? filtered[0].id : "")
  }, [selectedCurrency, allGateways])

  const setCurrency = useCallback((currency: Currency) => {
    setSelectedCurrency(currency)
    setError("")
  }, [])

  const setGateway = useCallback((gateway: PaymentGateway | "") => {
    setSelectedGateway(gateway)
    setError("")
  }, [])

  const processDonation = useCallback(
    async (data: DonationFormData): Promise<{ redirectUrl?: string; donationId?: string } | null> => {
      setSubmitting(true)
      setError("")
      setSuccess(false)

      try {
        const res = await fetch("/api/payment/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const result = await res.json()

        if (!res.ok) {
          setError(result.error || "حدث خطأ أثناء معالجة الدفع")
          return null
        }

        setSuccess(true)
        return {
          redirectUrl: result.redirectUrl,
          donationId: result.donationId,
        }
      } catch {
        setError("حدث خطأ أثناء الاتصال بالخادم")
        return null
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(""), [])
  const clearSuccess = useCallback(() => setSuccess(false), [])

  return {
    currencies,
    gateways: allGateways,
    loading,
    submitting,
    error,
    success,
    selectedCurrency,
    selectedGateway,
    availableGateways,
    setCurrency,
    setGateway,
    processDonation,
    clearError,
    clearSuccess,
  }
}
