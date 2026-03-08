"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { type DateRange } from "react-day-picker"
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Calendar, Bed, Maximize2, Users } from "lucide-react"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { PriceSummary } from "@/components/booking/price-summary"
import { BookingForm, type BookingFormValues } from "@/components/booking/booking-form"
import { cn } from "@/lib/utils"
import { toDateStr } from "@/lib/date-utils"
import type { AvailabilityData } from "@/types/booking"
import type { FullRoom } from "@/types/content"

type State = "selecting" | "filling" | "submitting" | "success"

interface Props {
  room: FullRoom
  availability: AvailabilityData
  initialFrom?: string
  initialTo?: string
  dict: any
  lang: string
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

// ─── Image Gallery ──────────────────────────────────────────────────────────
function RoomGallery({ images, mainImage, name }: { images: string[]; mainImage: string; name: string }) {
  const all = images.length > 0 ? images : mainImage ? [mainImage] : []
  const [idx, setIdx] = useState(0)
  if (all.length === 0) return null
  return (
    <div className="space-y-3 max-w-6xl mx-auto">
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={all[idx]}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {all.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i - 1 + all.length) % all.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIdx(i => (i + 1) % all.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {idx + 1} / {all.length}
            </div>
          </>
        )}
      </div>
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                i === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-90"
              )}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function ReservationClient({ room, availability, initialFrom, initialTo, dict }: Props) {
  const r = dict.reserve

  const initRange: DateRange | undefined =
    initialFrom && initialTo
      ? { from: new Date(initialFrom + "T00:00:00"), to: new Date(initialTo + "T00:00:00") }
      : undefined

  const [state, setState] = useState<State>(() => {
    if (initialFrom && initialTo) return "filling"
    return "selecting"
  })
  const [range, setRange] = useState<DateRange | undefined>(initRange)
  const [error, setError] = useState<string | null>(null)

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    setRange(newRange)
    setError(null)

    // wait until a real range is selected
    if (!newRange?.from || !newRange?.to || newRange.from.getTime() === newRange.to.getTime()) {
      setState("selecting")
      return
    }

    const from = toDateStr(newRange.from)
    const to = toDateStr(newRange.to)

    const blocked = availability.unavailable_dates.some(d => d >= from && d < to)

    if (blocked) {
      setError(r.unavailable_warning)
      setState("selecting")
    } else {
      setState("filling")
    }
  }

  const handleSubmit = async (values: BookingFormValues) => {
    if (!range?.from || !range?.to) return
    setState("submitting")
    setError(null)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_id: room.id,
        check_in: toDateStr(range.from),
        check_out: toDateStr(range.to),
        ...values,
      }),
    })
    if (res.ok) {
      setState("success")
    } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong. Please try again.")
      setState("filling")
    }
  }

  return (
    <div className="space-y-8">
      {/* Full-width gallery */}
      <RoomGallery images={room.images} mainImage={room.image} name={room.name} />

      {/* Two columns below: details left, booking right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">

        {/* Left: Room details */}
        <div className="space-y-7">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal mb-2">{room.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5" />{room.size}</span>
              <span className="flex items-center gap-1.5"><Bed className="h-3.5 w-3.5" />{room.bedType}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{room.capacity} guests</span>
            </div>
          </div>

          {room.tagline && (
            <p className="text-lg text-muted-foreground italic border-l-2 border-primary/30 pl-4">{room.tagline}</p>
          )}

          <p className="text-muted-foreground leading-relaxed">{room.description}</p>

          {room.highlights.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {room.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((a, i) => (
                  <span key={i} className="text-sm bg-muted px-3 py-1.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking panel (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border rounded-2xl p-6 shadow-sm space-y-5">
            {state === "success" ? (
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{r.success_title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{r.success_message}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">€{room.price}</span>
                  <span className="text-muted-foreground text-sm">{r.per_night}</span>
                </div>

                {state === "selecting" && (
                  <div>
                    <p className="text-sm font-medium mb-3 text-muted-foreground">{r.select_dates}</p>
                    <AvailabilityCalendar
                      unavailableDates={availability.unavailable_dates}
                      priceOverrides={availability.price_overrides}
                      basePrice={availability.base_price}
                      selected={range}
                      onSelect={handleRangeSelect}
                      numberOfMonths={1}
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {range?.from && range?.to && state !== "selecting" && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{fmtDate(toDateStr(range.from))} → {fmtDate(toDateStr(range.to))}</span>
                        </div>
                        <button
                          onClick={() => { setRange(undefined); setState("selecting") }}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                          Change
                        </button>
                      </div>
                      <PriceSummary
                        checkIn={toDateStr(range.from)}
                        checkOut={toDateStr(range.to)}
                        priceOverrides={availability.price_overrides}
                        basePrice={availability.base_price}
                        dict={r}
                      />
                      <BookingForm
                        capacity={room.capacity}
                        loading={state === "submitting"}
                        onSubmit={handleSubmit}
                        dict={r}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
