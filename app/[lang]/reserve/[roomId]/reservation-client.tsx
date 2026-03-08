"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type DateRange } from "react-day-picker"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { PriceSummary } from "@/components/booking/price-summary"
import { BookingForm, type BookingFormValues } from "@/components/booking/booking-form"
import { toDateStr } from "@/lib/date-utils"
import type { AvailabilityData } from "@/types/booking"
import type { FullRoom } from "@/types/content"
import { CheckCircle, AlertTriangle } from "lucide-react"

type State = "selecting" | "filling" | "submitting" | "success"

interface Props {
  room: FullRoom
  availability: AvailabilityData
  initialFrom?: string
  initialTo?: string
  dict: any
  lang: string
}

export function ReservationClient({ room, availability, initialFrom, initialTo, dict, lang }: Props) {
  const r = dict.reserve

  const [state, setState] = useState<State>(() => {
    if (initialFrom && initialTo) return "filling"
    return "selecting"
  })

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (initialFrom && initialTo) {
      return {
        from: new Date(initialFrom + "T00:00:00"),
        to: new Date(initialTo + "T00:00:00"),
      }
    }
    return undefined
  })

  const [unavailableWarning, setUnavailableWarning] = useState(() => {
    if (!initialFrom || !initialTo) return false
    return availability.unavailable_dates.some(
      (d) => d >= initialFrom && d < initialTo
    )
  })

  const [error, setError] = useState<string | null>(null)

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    setRange(newRange)
    setError(null)
    if (newRange?.from && newRange?.to) {
      const from = toDateStr(newRange.from)
      const to = toDateStr(newRange.to)
      const blocked = availability.unavailable_dates.some((d) => d >= from && d < to)
      if (blocked) {
        setUnavailableWarning(true)
        setState("selecting")
      } else {
        setUnavailableWarning(false)
        setState("filling")
      }
    } else {
      setUnavailableWarning(false)
      setState("selecting")
    }
  }

  const handleSubmit = async (values: BookingFormValues) => {
    if (!range?.from || !range?.to) return
    setState("submitting")
    setError(null)

    const body = {
      room_id: room.id,
      check_in: toDateStr(range.from),
      check_out: toDateStr(range.to),
      ...values,
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setState("success")
    } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong. Please try again.")
      setState("filling")
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <div>
          <h2 className="font-serif text-3xl text-foreground mb-3">{r.success_title}</h2>
          <p className="text-muted-foreground max-w-sm">{r.success_message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Calendar */}
      <div>
        <h2 className="font-medium text-foreground mb-4">{r.select_dates}</h2>
        {unavailableWarning && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {r.unavailable_warning}
          </div>
        )}
        <AvailabilityCalendar
          unavailableDates={availability.unavailable_dates}
          priceOverrides={availability.price_overrides}
          basePrice={availability.base_price}
          selected={range}
          onSelect={handleRangeSelect}
          numberOfMonths={1}
        />
      </div>

      {/* Form */}
      <div>
        <AnimatePresence mode="wait">
          {state === "selecting" && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-lg"
            >
              {r.select_dates}
            </motion.div>
          )}

          {(state === "filling" || state === "submitting") && range?.from && range?.to && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <PriceSummary
                checkIn={toDateStr(range.from)}
                checkOut={toDateStr(range.to)}
                priceOverrides={availability.price_overrides}
                basePrice={availability.base_price}
                dict={r}
              />

              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <BookingForm
                capacity={room.capacity}
                loading={state === "submitting"}
                onSubmit={handleSubmit}
                dict={r}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
