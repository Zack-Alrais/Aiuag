"use client"

import { Currency, CURRENCIES, CurrencyConfig } from "@/types/payment"

interface CurrencySelectorProps {
  selected: Currency
  onSelect: (currency: Currency) => void
}

export default function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {Object.values(CURRENCIES).map((c) => (
        <button
          key={c.code}
          onClick={() => onSelect(c.code)}
          className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${
            selected === c.code
              ? "bg-[#1A3A6B] text-white shadow-lg scale-105"
              : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-[#1A3A6B]/50"
          }`}
        >
          <div className="text-lg">{c.symbol}</div>
          <div className="text-xs mt-1">{c.code}</div>
        </button>
      ))}
    </div>
  )
}
