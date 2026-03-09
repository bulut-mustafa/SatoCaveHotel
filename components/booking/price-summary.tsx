"use client"

import { nightCount } from "@/lib/date-utils"

interface Props {
  checkIn: string
  checkOut: string
  priceOverrides: Record<string, number>
  basePrice: number
  dict: { check_in: string; check_out: string; nights: string; per_night: string; total: string }
}

function expandNights(checkIn: string, checkOut: string): string[] {
  const dates: string[] = []
  const start = new Date(checkIn + "T00:00:00")
  const end = new Date(checkOut + "T00:00:00")
  const d = new Date(start)
  while (d < end) {
    dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function PriceSummary({ checkIn, checkOut, priceOverrides, basePrice, dict }: Props) {
  const nights = expandNights(checkIn, checkOut)
  const total = nights.reduce((sum, d) => sum + (priceOverrides[d] ?? basePrice), 0)
  const count = nightCount(checkIn, checkOut)

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>{dict.check_in}</span>
        <span className="font-medium text-foreground">{formatDate(checkIn)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{dict.check_out}</span>
        <span className="font-medium text-foreground">{formatDate(checkOut)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{count} {dict.nights}</span>
        <span>€{basePrice} {dict.per_night}</span>
      </div>
      <div className="border-t pt-3 flex justify-between font-semibold text-base">
        <span>{dict.total}</span>
        <span>€{total.toFixed(2)}</span>
      </div>
    </div>
  )
}
