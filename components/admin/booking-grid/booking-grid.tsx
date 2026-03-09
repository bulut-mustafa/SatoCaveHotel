"use client"

import { useState, useTransition, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, Ban, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridHeader } from "./grid-header"
import { GridRow } from "./grid-row"
import { BookingDetailPanel } from "./booking-detail-panel"
import { SelectionActionBar } from "./block-confirm-bar"
import { removeBlock, addBlockAllRooms } from "@/actions/availability"
import { toDateStr, nightCount } from "@/lib/date-utils"
import type { Booking, RoomBlock } from "@/types/booking"
import type { FullRoom } from "@/types/content"

interface Props {
  rooms: FullRoom[]
  bookings: Booking[]
  blocks: RoomBlock[]
  initialStartDate: string
  priceOverrideMap?: Record<string, Record<string, number>> // roomId → { date → price }
}

// Drag selection state
type DragAnchor = { roomIdx: number; dateIdx: number }

function buildDates(startStr: string, count: number): Date[] {
  const dates: Date[] = []
  const start = new Date(startStr + "T00:00:00")
  for (let i = 0; i < count; i++) {
    dates.push(new Date(start.getTime() + i * 86400000))
  }
  return dates
}

type StatusFilter = "all" | "pending" | "accepted" | "rejected" | "cancelled"

export function BookingGrid({ rooms, bookings, blocks, initialStartDate, priceOverrideMap = {} }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [startDate, setStartDate] = useState(initialStartDate)
  const [zoom, setZoom] = useState<30 | 60>(30)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Drag/selection state
  const [isDragging, setIsDragging] = useState(false)
  const [anchor, setAnchor] = useState<DragAnchor | null>(null)
  const [current, setCurrent] = useState<DragAnchor | null>(null)
  const [committed, setCommitted] = useState<{ r0: number; r1: number; d0: number; d1: number } | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [roomFilter, setRoomFilter] = useState<string>("all")

  // Hotel-wide block panel
  const [hotelBlockOpen, setHotelBlockOpen] = useState(false)
  const [hotelBlockStart, setHotelBlockStart] = useState("")
  const [hotelBlockEnd, setHotelBlockEnd] = useState("")
  const [hotelBlockReason, setHotelBlockReason] = useState("")
  const [hotelBlockLoading, setHotelBlockLoading] = useState(false)

  const cellWidth = zoom === 30 ? 48 : 32
  const dates = buildDates(startDate, zoom)

  // Compute current selection rectangle
  const selection = useMemo(() => {
    const a = isDragging ? anchor : null
    const c = isDragging ? current : null
    const box = committed
    if (!box && (!a || !c)) return null
    const src = box ?? {
      r0: Math.min(a!.roomIdx, c!.roomIdx),
      r1: Math.max(a!.roomIdx, c!.roomIdx),
      d0: Math.min(a!.dateIdx, c!.dateIdx),
      d1: Math.max(a!.dateIdx, c!.dateIdx),
    }
    return src
  }, [isDragging, anchor, current, committed])

  // Mouse event handlers
  const handleCellMouseDown = useCallback((rowIdx: number, dateIdx: number) => {
    setCommitted(null)
    setAnchor({ roomIdx: rowIdx, dateIdx })
    setCurrent({ roomIdx: rowIdx, dateIdx })
    setIsDragging(true)
  }, [])

  const handleCellMouseEnter = useCallback((rowIdx: number, dateIdx: number) => {
    if (isDragging) setCurrent({ roomIdx: rowIdx, dateIdx })
  }, [isDragging])

  // Global mouseup to finish drag
  useEffect(() => {
    const onMouseUp = () => {
      if (isDragging && anchor && current) {
        setCommitted({
          r0: Math.min(anchor.roomIdx, current.roomIdx),
          r1: Math.max(anchor.roomIdx, current.roomIdx),
          d0: Math.min(anchor.dateIdx, current.dateIdx),
          d1: Math.max(anchor.dateIdx, current.dateIdx),
        })
      }
      setIsDragging(false)
      setAnchor(null)
      setCurrent(null)
    }
    window.addEventListener("mouseup", onMouseUp)
    return () => window.removeEventListener("mouseup", onMouseUp)
  }, [isDragging, anchor, current])

  // Cancel selection on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCommitted(null)
        setIsDragging(false)
        setAnchor(null)
        setCurrent(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const shift = (days: number) => {
    const d = new Date(startDate + "T00:00:00")
    d.setDate(d.getDate() + days)
    setStartDate(toDateStr(d))
  }

  const goToday = () => setStartDate(toDateStr(new Date()))

  const handleBlockClick = async (block: RoomBlock) => {
    if (!confirm(`Remove block: ${block.start_date} → ${block.end_date}?`)) return
    await removeBlock(block.id)
    startTransition(() => router.refresh())
  }

  const handleSelectionDone = () => {
    setCommitted(null)
    startTransition(() => router.refresh())
  }

  const handleHotelBlockSubmit = async () => {
    if (!hotelBlockStart || !hotelBlockEnd) return
    setHotelBlockLoading(true)
    await addBlockAllRooms(rooms.map((r) => r.id), hotelBlockStart, hotelBlockEnd, hotelBlockReason || undefined)
    setHotelBlockLoading(false)
    setHotelBlockOpen(false)
    setHotelBlockStart(""); setHotelBlockEnd(""); setHotelBlockReason("")
    startTransition(() => router.refresh())
  }

  const filteredBookings = useMemo(() =>
    statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter),
    [bookings, statusFilter]
  )
  const visibleRooms = useMemo(() =>
    roomFilter === "all" ? rooms : rooms.filter((r) => r.id === roomFilter),
    [rooms, roomFilter]
  )

  const pendingCount = bookings.filter((b) => b.status === "pending").length

  // Derive selection info for the action bar
  const selectionInfo = useMemo(() => {
    if (!committed) return null
    const selRooms = visibleRooms.slice(committed.r0, committed.r1 + 1)
    const startD = dates[committed.d0]
    const endD = dates[committed.d1]
    if (!startD || !endD) return null
    const startStr = toDateStr(startD)
    const endStr = toDateStr(new Date(endD.getTime() + 86400000)) // exclusive
    const nights = nightCount(startStr, endStr)

    // Initial price: price override for startDate on first selected room, else base price
    const firstRoom = selRooms[0]
    const initialPrice = firstRoom
      ? (priceOverrideMap[firstRoom.id]?.[startStr] ?? firstRoom.price)
      : undefined

    return {
      roomIds: selRooms.map((r) => r.id),
      roomNames: selRooms.map((r) => r.name),
      startDate: startStr,
      endDate: endStr,
      nights,
      initialPrice,
    }
  }, [committed, visibleRooms, dates, priceOverrideMap])

  return (
    <div
      className="flex flex-col h-full"
      onMouseLeave={() => { if (isDragging && anchor && current) setCurrent(current) }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b bg-background shrink-0 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => shift(-7)}>
          <ChevronLeft className="h-4 w-4" /><span className="ml-1">Prev</span>
        </Button>
        <Button variant="outline" size="sm" onClick={goToday}>
          <Calendar className="h-4 w-4 mr-1" />Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => shift(7)}>
          <span className="mr-1">Next</span><ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">
          {startDate} — {toDateStr(new Date(new Date(startDate + "T00:00:00").getTime() + (zoom - 1) * 86400000))}
        </span>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex rounded-lg border overflow-hidden text-xs">
            {(["all", "pending", "accepted"] as StatusFilter[]).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 capitalize border-r last:border-r-0 transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {s}
                {s === "pending" && pendingCount > 0 && (
                  <span className={`ml-1 px-1 py-0.5 rounded-full text-[9px] font-bold ${statusFilter === "pending" ? "bg-white/30" : "bg-amber-500 text-white"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Room filter */}
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="All rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rooms</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Hotel-wide block */}
          <Button variant="outline" size="sm" onClick={() => setHotelBlockOpen(true)} className="text-xs">
            <Ban className="h-3.5 w-3.5 mr-1" />Block all rooms
          </Button>

          {/* Zoom */}
          <div className="flex gap-1">
            <Button variant={zoom === 30 ? "default" : "outline"} size="sm" onClick={() => setZoom(30)}>30d</Button>
            <Button variant={zoom === 60 ? "default" : "outline"} size="sm" onClick={() => setZoom(60)}>60d</Button>
          </div>
        </div>
      </div>

      {/* Hotel-wide block inline panel */}
      <AnimatePresence>
        {hotelBlockOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-amber-50 overflow-hidden shrink-0"
          >
            <div className="flex flex-wrap items-end gap-3 p-4">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={hotelBlockStart} onChange={(e) => setHotelBlockStart(e.target.value)} className="h-8 text-sm w-36" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To (exclusive)</Label>
                <Input type="date" value={hotelBlockEnd} onChange={(e) => setHotelBlockEnd(e.target.value)} className="h-8 text-sm w-36" />
              </div>
              <div className="space-y-1 flex-1 min-w-36">
                <Label className="text-xs">Reason (optional)</Label>
                <Input value={hotelBlockReason} onChange={(e) => setHotelBlockReason(e.target.value)} placeholder="e.g. Hotel renovation" className="h-8 text-sm" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleHotelBlockSubmit}
                  disabled={hotelBlockLoading || !hotelBlockStart || !hotelBlockEnd}
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />Block {rooms.length} rooms
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setHotelBlockOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag hint */}
      {!isDragging && !committed && (
        <div className="px-4 py-1.5 bg-muted/40 border-b text-xs text-muted-foreground text-center select-none">
          Click and drag across dates and rooms to select — then block or set a price
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto" style={{ userSelect: "none" }}>
        <GridHeader dates={dates} cellWidth={cellWidth} />
        {visibleRooms.map((room, rowIdx) => {
          const liveAnchor = isDragging ? anchor : null
          const liveCurrent = isDragging ? current : null
          const box = committed ?? (
            liveAnchor && liveCurrent ? {
              r0: Math.min(liveAnchor.roomIdx, liveCurrent.roomIdx),
              r1: Math.max(liveAnchor.roomIdx, liveCurrent.roomIdx),
              d0: Math.min(liveAnchor.dateIdx, liveCurrent.dateIdx),
              d1: Math.max(liveAnchor.dateIdx, liveCurrent.dateIdx),
            } : null
          )
          const isRowInSelection = box !== null && rowIdx >= box.r0 && rowIdx <= box.r1

          return (
            <GridRow
              key={room.id}
              roomId={room.id}
              roomName={room.name}
              rowIdx={rowIdx}
              dates={dates}
              bookings={filteredBookings.filter((b) => b.room_id === room.id)}
              blocks={blocks.filter((bl) => bl.room_id === room.id)}
              cellWidth={cellWidth}
              selectedDateStart={isRowInSelection && box ? box.d0 : null}
              selectedDateEnd={isRowInSelection && box ? box.d1 : null}
              isRowInSelection={isRowInSelection}
              isDragging={isDragging}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseEnter={handleCellMouseEnter}
              onBookingClick={setSelectedBooking}
              onBlockClick={handleBlockClick}
            />
          )
        })}
      </div>

      {/* Booking detail panel */}
      <BookingDetailPanel
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdate={() => startTransition(() => router.refresh())}
      />

      {/* Selection action bar */}
      <AnimatePresence>
        {selectionInfo && !isDragging && (
          <SelectionActionBar
            roomIds={selectionInfo.roomIds}
            roomNames={selectionInfo.roomNames}
            startDate={selectionInfo.startDate}
            endDate={selectionInfo.endDate}
            nightCount={selectionInfo.nights}
            initialPrice={selectionInfo.initialPrice}
            onDone={handleSelectionDone}
            onCancel={() => setCommitted(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
