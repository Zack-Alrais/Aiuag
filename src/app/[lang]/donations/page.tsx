"use client"

import { useState, useEffect, Suspense } from "react"
import { Heart, CreditCard, Loader2, CheckCircle, AlertCircle, Smartphone, Building, Shield } from "lucide-react"
import HeroSection from "@/components/ui/hero-section"
import {
  Currency,
  PaymentGateway,
  CURRENCIES,
  CurrencyConfig,
} from "@/types/payment"

interface GatewayInfo {
  id: PaymentGateway
  name: string
  nameAr: string
  icon: string
  supportedCurrencies: Currency[]
  isActive: boolean
  isConfigured: boolean
  isSudanese: boolean
}

function DonationsContent() {
  const [lang] = useState("ar")
  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  // ── Form state ──
  const [currency, setCurrency] = useState<Currency>("USD")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway | "">("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")
  const [donorCountry, setDonorCountry] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ── Gateways state ──
  const [gateways, setGateways] = useState<GatewayInfo[]>([])
  const [loadingGateways, setLoadingGateways] = useState(true)

  const presetAmounts = [5, 10, 20, 50, 100, 250, 500, 1000]

  // ── Load gateways for selected currency ──
  useEffect(() => {
    setLoadingGateways(true)
    fetch(`/api/payment/config?currency=${currency}`)
      .then((r) => r.json())
      .then((data) => {
        setGateways(data.gateways || [])
        // Auto-select first gateway
        if (data.gateways?.length > 0) {
          setPaymentMethod(data.gateways[0].id)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingGateways(false))
  }, [currency])

  const currencyConfig: CurrencyConfig = CURRENCIES[currency]
  const amount = selectedAmount || parseFloat(customAmount) || 0

  const handleSubmit = async () => {
    setError("")

    if (!donorName.trim()) {
      setError(isArabic ? "يرجى إدخال الاسم" : "Please enter your name")
      return
    }
    if (!donorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      setError(isArabic ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email")
      return
    }
    if (amount <= 0) {
      setError(isArabic ? "يرجى إدخال مبلغ صحيح" : "Please enter a valid amount")
      return
    }
    if (!paymentMethod) {
      setError(isArabic ? "يرجى اختيار طريقة الدفع" : "Please select a payment method")
      return
    }
    if (!acceptTerms) {
      setError(isArabic ? "يجب قبول الشروط والأحكام" : "You must accept the terms and conditions")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          paymentMethod,
          donorName: anonymous ? "Anonymous" : donorName,
          donorEmail,
          donorPhone,
          donorCountry,
          isAnonymous: anonymous,
          message,
          acceptTerms,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء معالجة الدفع")
        return
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        // For gateways that don't need redirect (e.g., Bankak USSD)
        window.location.href = `/donations/success?donationId=${data.donationId}`
      }
    } catch {
      setError(isArabic ? "حدث خطأ أثناء الاتصال بالخادم" : "Connection error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getGatewayIcon = (gateway: GatewayInfo) => {
    if (gateway.isSudanese) return <Smartphone className="w-5 h-5" />
    if (gateway.id === "stripe" || gateway.id === "verifone") return <CreditCard className="w-5 h-5" />
    if (gateway.id === "paypal") return <Building className="w-5 h-5" />
    return <CreditCard className="w-5 h-5" />
  }

  const sudaneseGateways = gateways.filter((g) => g.isSudanese)
  const internationalGateways = gateways.filter((g) => !g.isSudanese)

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="donations"
        lang={lang}
        defaultTitle={isArabic ? "تبرعاتنا" : "Our Donations"}
        defaultSubtitle={isArabic ? "تبرعك يُحدث فرقاً — ساهم في دعم التعليم والتنمية للخريجين والطلاب" : "Your donation makes a difference"}
        gradient="from-secondary via-secondary-light to-secondary"
      >
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "تبرعاتنا" : "Our Donations"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "تبرعك يُحدث فرقاً — ساهم في دعم التعليم والتنمية" : "Your donation makes a difference"}
          </p>
        </div>
      </HeroSection>

      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">

            {/* Currency Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-text mb-3">{isArabic ? "اختر العملة" : "Select Currency"}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.values(CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setPaymentMethod(""); setSelectedAmount(null) }}
                    className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${
                      currency === c.code
                        ? "bg-[#1A3A6B] text-white shadow-lg scale-105"
                        : "bg-background border-2 border-border text-text hover:border-[#1A3A6B]/50"
                    }`}
                  >
                    <div className="text-lg">{c.symbol}</div>
                    <div className="text-xs mt-1">{c.code}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text mb-3">{isArabic ? "اختر المبلغ" : "Select Amount"}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setSelectedAmount(a); setCustomAmount("") }}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      selectedAmount === a
                        ? "bg-[#1A3A6B] text-white shadow-lg scale-105"
                        : "bg-background border-2 border-border text-text hover:border-[#1A3A6B]/50"
                    }`}
                  >
                    {currencyConfig.symbol}{a}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "مبلغ مخصص" : "Custom Amount"}</label>
              <div className="relative">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-text-secondary">{currencyConfig.symbol}</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                  className="w-full h-12 rounded-lg border-2 border-border bg-background ps-8 pe-4 text-lg font-bold text-text focus:outline-none focus:border-[#1A3A6B] transition-all"
                  placeholder={isArabic ? "أدخل المبلغ" : "Enter amount"}
                  dir="ltr"
                  min="1"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-text mb-3">{isArabic ? "طريقة الدفع" : "Payment Method"}</h3>
              {loadingGateways ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1A3A6B]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sudanese Gateways */}
                  {sudaneseGateways.length > 0 && (
                    <div>
                      <p className="text-sm text-text-secondary mb-2">{isArabic ? "الدفع المحلي" : "Local Payment"}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {sudaneseGateways.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setPaymentMethod(g.id)}
                            className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-bold transition-all ${
                              paymentMethod === g.id
                                ? "bg-[#1A3A6B] text-white shadow-lg"
                                : "bg-background border-2 border-border text-text hover:border-[#1A3A6B]/50"
                            }`}
                          >
                            {getGatewayIcon(g)}
                            <span className="text-sm">{g.nameAr}</span>
                            {!g.isConfigured && (
                              <span className="text-[10px] opacity-60">Demo</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* International Gateways */}
                  {internationalGateways.length > 0 && (
                    <div>
                      <p className="text-sm text-text-secondary mb-2">{isArabic ? "الدفع الدولي" : "International Payment"}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {internationalGateways.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setPaymentMethod(g.id)}
                            className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-bold transition-all ${
                              paymentMethod === g.id
                                ? "bg-[#1A3A6B] text-white shadow-lg"
                                : "bg-background border-2 border-border text-text hover:border-[#1A3A6B]/50"
                            }`}
                          >
                            {getGatewayIcon(g)}
                            <span className="text-sm">{g.nameAr}</span>
                            {!g.isConfigured && (
                              <span className="text-[10px] opacity-60">Demo</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {gateways.length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                      {isArabic ? "لا توجد بوابات دفع متاحة لهذه العملة" : "No payment gateways available for this currency"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Donor Info */}
            <div className="bg-background rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-text mb-4">{isArabic ? "بيانات المتبرع" : "Donor Information"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "الاسم الكامل" : "Full Name"} *</label>
                  <input
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
                    dir={dir}
                    disabled={anonymous}
                    placeholder={isArabic ? "محمد أحمد" : "John Doe"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "البريد الإلكتروني" : "Email"} *</label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
                    dir="ltr"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "رقم الهاتف" : "Phone"}</label>
                  <input
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
                    dir="ltr"
                    placeholder="+249..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "الدولة" : "Country"}</label>
                  <input
                    value={donorCountry}
                    onChange={(e) => setDonorCountry(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
                    dir={dir}
                    placeholder={isArabic ? "السودان" : "Sudan"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "رسالة (اختياري)" : "Message (optional)"}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] resize-none"
                    dir={dir}
                    placeholder={isArabic ? "رسالة خاصة..." : "A personal message..."}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1A3A6B] focus:ring-[#1A3A6B]"
                  />
                  <span className="text-sm text-text-secondary">{isArabic ? "تبرع مجهول الهوية" : "Anonymous donation"}</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-background border-2 border-[#1A3A6B]/20 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-text-secondary">{isArabic ? "المبلغ" : "Amount"}</span>
                <span className="text-2xl font-bold text-[#1A3A6B]">{currencyConfig.symbol}{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-text-secondary">{isArabic ? "العملة" : "Currency"}</span>
                <span className="font-bold">{currencyConfig.nameAr}</span>
              </div>
              {paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{isArabic ? "طريقة الدفع" : "Payment Method"}</span>
                  <span className="font-bold">{gateways.find((g) => g.id === paymentMethod)?.nameAr || paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1A3A6B] focus:ring-[#1A3A6B]"
              />
              <span className="text-sm text-text-secondary">
                {isArabic ? "أوافق على الشروط والأحكام وسياسة الخصوصية" : "I agree to the Terms and Conditions and Privacy Policy"}
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !amount || !paymentMethod}
              className="w-full py-4 bg-[#1A3A6B] text-white rounded-xl text-lg font-bold hover:bg-[#0f2547] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isArabic ? "جاري المعالجة..." : "Processing..."}
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  {isArabic ? "تبرع الآن" : "Donate Now"}
                </>
              )}
            </button>

            {/* Security */}
            <div className="flex items-center justify-center gap-2 mt-4 text-text-secondary text-xs">
              <Shield className="w-4 h-4" />
              {isArabic ? "جميع المعاملات آمنة ومشفرة" : "All transactions are secure and encrypted"}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function DonationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
      </div>
    }>
      <DonationsContent />
    </Suspense>
  )
}
