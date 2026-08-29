"use client"

import { useEffect, useRef, useState } from "react"
import { Languages, Loader2, Check } from "lucide-react"

async function callGoogle(text: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null
  const out = data[0]
    .map((seg: unknown[]) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
    .join("")
  return out.trim() ? out : null
}

async function callMyMemory(text: string): Promise<string | null> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|en`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const out = data?.responseData?.translatedText
  return typeof out === "string" && out.trim() ? out.trim() : null
}

async function translateChunk(text: string): Promise<string> {
  const viaGoogle = await callGoogle(text)
  if (viaGoogle) return viaGoogle
  const viaMyMemory = await callMyMemory(text)
  if (viaMyMemory) return viaMyMemory
  const res = await fetch("/api/admin/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  if (res.ok) {
    const data = await res.json()
    if (typeof data.translated === "string" && data.translated.trim()) return data.translated
  }
  throw new Error("translate failed")
}

async function translateText(text: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ""
  if (!/[\u0600-\u06FF]/.test(trimmed)) return text

  const maxChunk = 4500
  const chunks: string[] = []
  for (let i = 0; i < trimmed.length; i += maxChunk) {
    chunks.push(trimmed.slice(i, i + maxChunk))
  }
  const results = chunks.length > 1 ? await Promise.all(chunks.map(translateChunk)) : [await translateChunk(trimmed)]
  return results.join("")
}

interface TranslateIntoProps {
  source: string
  target: string
  onTranslated: (text: string) => void
}

export function TranslateInto({ source, target, onTranslated }: TranslateIntoProps) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const lastAuto = useRef<string | null>(null)
  const lastSrc = useRef<string>("")

  useEffect(() => {
    if (lastAuto.current === null) {
      lastAuto.current = (target ?? "").trim() || null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const src = (source ?? "").trim()
    if (!src) return
    if (src === lastSrc.current) return
    const cur = (target ?? "").trim()

    // Don't overwrite English the user typed manually (target holds something we didn't fill)
    if (cur.length > 0 && lastAuto.current !== cur) return

    lastSrc.current = src

    const timer = setTimeout(async () => {
      setBusy(true)
      try {
        const tr = await translateText(src)
        if (tr.trim()) {
          lastAuto.current = tr
          onTranslated(tr)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        }
      } finally {
        setBusy(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [source, target, onTranslated])

  async function runManual() {
    const src = (source ?? "").trim()
    if (!src || busy) return
    setBusy(true)
    try {
      const tr = await translateText(src)
      if (tr.trim()) {
        lastAuto.current = tr
        lastSrc.current = src
        onTranslated(tr)
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={runManual}
      disabled={busy || !source?.trim()}
      title="ترجمة تلقائية إلى الإنجليزية"
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#1A3A6B]/10 text-[#1A3A6B] dark:bg-[#60a5fa]/10 dark:text-[#60a5fa] hover:bg-[#1A3A6B]/20 dark:hover:bg-[#60a5fa]/20"
    >
      {busy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : done ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Languages className="w-3.5 h-3.5" />
      )}
      <span>{done ? "تمت الترجمة" : busy ? "جارٍ الترجمة..." : "ترجمة تلقائية"}</span>
    </button>
  )
}