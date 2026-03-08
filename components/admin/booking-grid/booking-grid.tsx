"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GridHeader } from "./grid-header"
import { GridRow } from "./grid-row"
import { BookingDetailPanel } from "./booking-detail-panel"
import { BlockConfirmBar } from "./block-confirm-bar"
import { removeBlock } from "@/actions/availability"
import { toDateStr } from "@/lib/date-utils"
import type { Booking, RoomBlock } from "@/types/booking"
import type { FullRoom } from "@/types/content"

interface Props {
  rooms: FullRoom[]
  bookings: Booking[]
  blocks: RoomBlock[]
  initialStartDate: string
}

function buildDates(startStr: string, count: number): Date[] {
  const dates: Date[] = []
  const start = new Date(startStr + "T00:00:00")
  for (let i = 0; i < count; i++) {
    dates.push(new Date(start.getTime() + i * 86400000))
  }
  return dates
}

export function BookingGrid({ rooms, bookings, blocks, initialStartDate }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [startDate, setStartDate] = useState(initialStartDate)
  const [zoom, setZoom] = useState<30 | 60>(30)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [dragState, setDragState] = useState<{
    roomId: string; startDate: string; endDate: string
  } | null>(null)

  const cellWidth = zoom === 30 ? 48 : 32
  const dates = buildDates(startDate, zoom)

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

  const handleBlockDone = () => {
    setDragState(null)
    startTransition(() => router.refresh())
  }

  const roomBookings = (roomId: string) =>
    bookings.filter((b) => b.room_id === roomId)

  const roomBlocks = (roomId: string) =>
    blocks.filter((bl) => bl.room_id === roomId)

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b bg-background shrink-0 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => shift(-7)}>
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Prev</span>
        </Button>
        <Button variant="outline" size="sm" onClick={goToday}>
          <Calendar className="h-4 w-4 mr-1" />
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => shift(7)}>
          <span className="mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          {startDate} — {toDateStr(new Date(new Date(startDate + "T00:00:00").getTime() + (zoom - 1) * 86400000))}
        </span>
        <div className="ml-auto flex gap-1">
          <Button
            variant={zoom === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setZoom(30)}
          >
            30d
          </Button>
          <Button
            variant={zoom === 60 ? "default" : "outline"}
            size="sm"
            onClick={() => setZoom(60)}
          >
            60d
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <GridHeader dates={dates} cellWidth={cellWidth} />
        {rooms.map((room) => (
          <GridRow
            key={room.id}
            roomId={room.id}
            roomName={room.name}
            dates={dates}
            bookings={roomBookings(room.id)}
            blocks={roomBlocks(room.id)}
            cellWidth={cellWidth}
            onBookingClick={setSelectedBooking}
            onBlockClick={handleBlockClick}
            onCellDrag={(rId, s, e) => setDragState({ roomId: rId, startDate: s, endDate: e })}
          />
        ))}
      </div>

      {/* Detail panel */}
      <BookingDetailPanel
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdate={() => startTransition(() => router.refresh())}
      />

      {/* Block confirm bar */}
      <AnimatePresence>
        {dragState && (
          <BlockConfirmBar
            roomId={dragState.roomId}
            startDate={dragState.startDate}
            endDate={dragState.endDate}
            onDone={handleBlockDone}
            onCancel={() => setDragState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
