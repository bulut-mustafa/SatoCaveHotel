"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { type DateRange } from "react-day-picker"
import {
  Search, Users, X, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, Calendar, Bed,
  Maximize2, ArrowRight, Minus, Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { BookingForm, type BookingFormValues } from "@/components/booking/booking-form"
import { PriceSummary } from "@/components/booking/price-summary"
import { cn } from "@/lib/utils"
import { toDateStr } from "@/lib/date-utils"
import type { FullRoom } from "@/types/content"
import type { AvailabilityData } from "@/types/booking"

type SearchStatus = "idle" | "searching" | "done"
type BookingState = "selecting" | "filling" | "submitting" | "success"

interface Props {
  rooms: FullRoom[]
  dict: any
  lang: string
  initialFrom?: string
  initialTo?: string
  initialGuests?: number
  initialRoom?: string
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function checkAvailability(from: string, to: string, avail: AvailabilityData): boolean {
  const set = new Set(avail.unavailable_dates)
  const d = new Date(from + "T00:00:00")
  const end = new Date(to + "T00:00:00")
  while (d < end) {
    if (set.has(d.toISOString().slice(0, 10))) return false
    d.setDate(d.getDate() + 1)
  }
  return true
}

async function fetchAllAvailability(
  from: string,
  to: string,
  rooms: FullRoom[]
): Promise<Record<string, AvailabilityData>> {
  const results = await Promise.all(
    rooms.map(async room => {
      const res = await fetch(`/api/availability/${room.id}?from=${from}&to=${to}`)
      return { roomId: room.id, data: res.ok ? (await res.json() as AvailabilityData) : null }
    })
  )
  const map: Record<string, AvailabilityData> = {}
  for (const { roomId, data } of results) {
    if (data) map[roomId] = data
  }
  return map
}

// ─── Image Gallery ─────────────────────────────────────────────────────────────
function RoomGallery({ images, mainImage, name }: { images: string[]; mainImage: string; name: string }) {
  const all = images.length > 0 ? images : mainImage ? [mainImage] : []
  const [idx, setIdx] = useState(0)
  if (all.length === 0) return null
  return (
    <div className="space-y-2">
      {/* Fixed-height main image — prevents it from becoming enormous */}
      <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image src={all[idx]} alt={name} fill className="object-cover" />
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
                "relative h-16 w-24 shrink-0 rounded-md overflow-hidden border-2 transition-all",
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

// ─── Booking Panel ─────────────────────────────────────────────────────────────
function BookingPanel({
  room,
  availability,
  initialRange,
  dict,
}: {
  room: FullRoom
  availability: AvailabilityData | null
  initialRange?: DateRange
  dict: any
}) {
  const r = dict.reserve
  const [state, setState] = useState<BookingState>(
    initialRange?.from && initialRange?.to ? "filling" : "selecting"
  )
  const [range, setRange] = useState<DateRange | undefined>(initialRange)
  const [error, setError] = useState<string | null>(null)

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    setRange(newRange)
    setError(null)
    if (newRange?.from && newRange?.to) {
      if (
        availability &&
        !checkAvailability(toDateStr(newRange.from), toDateStr(newRange.to), availability)
      ) {
        setError(r.unavailable_warning)
        setState("selecting")
        return
      }
      setState("filling")
    } else {
      setState("selecting")
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

  if (state === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-10">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{r.success_title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">{r.success_message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">€{room.price}</span>
        <span className="text-muted-foreground text-sm">{r.per_night}</span>
      </div>

      {state === "selecting" && (
        <div>
          <p className="text-sm font-medium mb-3 text-muted-foreground">{r.select_dates}</p>
          {availability ? (
            <AvailabilityCalendar
              unavailableDates={availability.unavailable_dates}
              priceOverrides={availability.price_overrides}
              basePrice={availability.base_price}
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-sm text-muted-foreground border rounded-xl">
              <span className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin mr-2" />
              Loading availability…
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {range?.from && range?.to && state !== "selecting" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
            priceOverrides={availability?.price_overrides ?? {}}
            basePrice={availability?.base_price ?? room.price}
            dict={r}
          />
          <BookingForm
            capacity={room.capacity}
            loading={state === "submitting"}
            onSubmit={handleSubmit}
            dict={r}
          />
        </motion.div>
      )}
    </div>
  )
}

// ─── Room Card ─────────────────────────────────────────────────────────────────
function RoomCard({
  room,
  available,
  searchDone,
  onClick,
}: {
  room: FullRoom
  available: boolean
  searchDone: boolean
  onClick: () => void
}) {
  return (
    <div
      className="flex rounded-xl border bg-card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={onClick}
    >
      {/* Fixed-width side image that stretches to match card height */}
      <div className="relative w-48 sm:w-64 md:w-72 shrink-0 overflow-hidden">
        <Image
          src={room.image}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 288px"
        />
      </div>
      <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="font-semibold text-base sm:text-lg leading-tight">{room.name}</h2>
              <Badge variant="outline" className="text-xs capitalize shrink-0">{room.type}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{room.size}</span>
              <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{room.bedType}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.capacity}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg sm:text-xl font-bold">€{room.price}</p>
            <p className="text-xs text-muted-foreground">per night</p>
            {searchDone && (
              <Badge
                className={cn(
                  "mt-1.5 text-xs border",
                  available
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                )}
              >
                {available ? "✓ Available" : "✗ Unavailable"}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{room.description}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {room.amenities.slice(0, 4).map(a => (
            <span key={a} className="text-xs bg-muted px-2.5 py-1 rounded-full">{a}</span>
          ))}
          {room.amenities.length > 4 && (
            <span className="text-xs text-muted-foreground">+{room.amenities.length - 4} more</span>
          )}
        </div>

        <div className="flex items-center justify-end mt-4 pt-3 border-t">
          <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
            View & Book <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export function ReserveSearchClient({
  rooms, dict, lang,
  initialFrom, initialTo, initialGuests, initialRoom,
}: Props) {
  const r = dict.reserve

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (initialFrom && initialTo) {
      return {
        from: new Date(initialFrom + "T00:00:00"),
        to: new Date(initialTo + "T00:00:00"),
      }
    }
    return undefined
  })
  const [guests, setGuests] = useState(initialGuests ?? 1)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle")
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityData>>({})

  const [selectedRoom, setSelectedRoom] = useState<FullRoom | null>(null)
  const [overlayAvailability, setOverlayAvailability] = useState<AvailabilityData | null>(null)
  const [overlayLoading, setOverlayLoading] = useState(false)

  const from = range?.from ? toDateStr(range.from) : null
  const to = range?.to ? toDateStr(range.to) : null

  // ── URL sync ──────────────────────────────────────────────────────────────────
  function updateUrl(f: string | null, t: string | null, g: number, roomId: string | null) {
    if (typeof window === "undefined") return
    const p = new URLSearchParams()
    if (f) p.set("from", f)
    if (t) p.set("to", t)
    if (g !== 1) p.set("guests", String(g))
    if (roomId) p.set("room", roomId)
    const qs = p.toString()
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
  }

  // Sync URL whenever key state changes (skip first render to avoid overwriting initial URL)
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    updateUrl(from, to, guests, selectedRoom?.id ?? null)
  }, [from, to, guests, selectedRoom?.id])

  // ── Auto-search + auto-open on mount (from URL params) ────────────────────────
  useEffect(() => {
    if (!initialFrom || !initialTo) return
    async function init() {
      setSearchStatus("searching")
      try {
        const map = await fetchAllAvailability(initialFrom!, initialTo!, rooms)
        setAvailabilityMap(map)
        setSearchStatus("done")
        if (initialRoom) {
          const room = rooms.find(r => r.id === initialRoom)
          if (room) {
            setSelectedRoom(room)
            setOverlayAvailability(map[room.id] ?? null)
          }
        }
      } catch {
        setSearchStatus("idle")
      }
    }
    init()
  }, []) // intentionally only on mount

  // ── Search handler ────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!from || !to) return
    setSearchStatus("searching")
    try {
      const map = await fetchAllAvailability(from, to, rooms)
      setAvailabilityMap(map)
    } finally {
      setSearchStatus("done")
    }
  }, [from, to, rooms])

  const isRoomAvailable = useCallback((room: FullRoom) => {
    if (searchStatus !== "done" || !from || !to) return true
    const avail = availabilityMap[room.id]
    return avail ? checkAvailability(from, to, avail) : false
  }, [searchStatus, availabilityMap, from, to])

  const visibleRooms = useMemo(() => {
    if (searchStatus !== "done") return rooms
    return rooms.filter(r => isRoomAvailable(r))
  }, [rooms, searchStatus, isRoomAvailable])

  const openRoom = useCallback(async (room: FullRoom) => {
    setSelectedRoom(room)
    setOverlayAvailability(null)
    const existing = availabilityMap[room.id]
    if (existing) { setOverlayAvailability(existing); return }
    setOverlayLoading(true)
    try {
      const f = from ?? toDateStr(new Date())
      const t = to ?? toDateStr(new Date(Date.now() + 90 * 86400000))
      const res = await fetch(`/api/availability/${room.id}?from=${f}&to=${t}`)
      if (res.ok) setOverlayAvailability(await res.json())
    } finally {
      setOverlayLoading(false)
    }
  }, [availabilityMap, from, to])

  const closeOverlay = useCallback(() => {
    setSelectedRoom(null)
    setOverlayAvailability(null)
  }, [])

  const initialRange: DateRange | undefined = range?.from && range?.to ? range : undefined

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-32 pb-10 px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground font-normal mb-3">
            {r.page_title}
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">{r.select_room}</p>
        </section>

        {/* Search bar */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card border rounded-2xl p-2 shadow-sm">

              {/* Date picker */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-left">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {r.check_in} → {r.check_out}
                      </p>
                      <p className="text-sm mt-0.5">
                        {from && to
                          ? <span className="font-medium">{fmtDate(from)} – {fmtDate(to)}</span>
                          : <span className="text-muted-foreground">Select dates</span>
                        }
                      </p>
                    </div>
                    {(from || to) && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setRange(undefined)
                          setSearchStatus("idle")
                          setAvailabilityMap({})
                        }}
                        className="p-1 rounded-full hover:bg-muted-foreground/20 transition-colors shrink-0"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <AvailabilityCalendar
                    unavailableDates={[]}
                    priceOverrides={{}}
                    basePrice={0}
                    selected={range}
                    onSelect={(r) => {
                      setRange(r)
                      if (r?.from && r?.to) setCalendarOpen(false)
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <div className="hidden sm:block w-px h-10 bg-border" />

              {/* Guests */}
              <div className="flex items-center gap-2 px-4 py-2.5">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="mr-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{r.num_guests}</p>
                  <p className="text-sm font-medium">{guests} {guests === 1 ? "guest" : "guests"}</p>
                </div>
                <button
                  onClick={() => setGuests(g => Math.max(1, g - 1))}
                  className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setGuests(g => g + 1)}
                  className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Search */}
              <Button
                onClick={handleSearch}
                disabled={!from || !to || searchStatus === "searching"}
                className="rounded-xl px-6 h-11 shrink-0"
              >
                {searchStatus === "searching" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Searching…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </span>
                )}
              </Button>
            </div>

            {searchStatus === "done" && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-muted-foreground mt-2 pb-1"
              >
                {visibleRooms.length === 0
                  ? "No rooms available for these dates."
                  : `${visibleRooms.length} room${visibleRooms.length !== 1 ? "s" : ""} available`
                }
              </motion.p>
            )}
          </div>
        </div>

        {/* Room list */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {(searchStatus !== "done" ? rooms : visibleRooms).map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <RoomCard
                room={room}
                available={isRoomAvailable(room)}
                searchDone={searchStatus === "done"}
                onClick={() => openRoom(room)}
              />
            </motion.div>
          ))}

          {searchStatus === "done" && visibleRooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">No rooms available for these dates.</p>
              <button
                onClick={() => { setSearchStatus("idle"); setAvailabilityMap({}) }}
                className="text-sm underline text-foreground"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Booking overlay ─── */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
              <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
                <button
                  onClick={closeOverlay}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <span className="font-medium truncate">{selectedRoom.name}</span>
                <Badge variant="outline" className="capitalize text-xs shrink-0">{selectedRoom.type}</Badge>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

              {/* Full-width gallery above the grid */}
              <RoomGallery
                images={selectedRoom.images}
                mainImage={selectedRoom.image}
                name={selectedRoom.name}
              />

              {/* Two-column: details left, booking right */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">

                {/* Left: room details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal mb-2">{selectedRoom.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5" />{selectedRoom.size}</span>
                      <span className="flex items-center gap-1.5"><Bed className="h-3.5 w-3.5" />{selectedRoom.bedType}</span>
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{selectedRoom.capacity} guests max</span>
                    </div>
                  </div>

                  {selectedRoom.tagline && (
                    <p className="text-base text-muted-foreground italic border-l-2 border-primary/30 pl-4">
                      {selectedRoom.tagline}
                    </p>
                  )}

                  <p className="text-muted-foreground leading-relaxed">{selectedRoom.description}</p>

                  {selectedRoom.highlights.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Highlights</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedRoom.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRoom.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.amenities.map((a, i) => (
                          <span key={i} className="text-sm bg-muted px-3 py-1.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: booking panel (sticky on desktop) */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                  <div className="border rounded-2xl p-5 shadow-sm">
                    {overlayLoading ? (
                      <div className="flex flex-col items-center gap-3 py-10">
                        <span className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading availability…</p>
                      </div>
                    ) : (
                      <BookingPanel
                        room={selectedRoom}
                        availability={overlayAvailability}
                        initialRange={initialRange}
                        dict={dict}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
