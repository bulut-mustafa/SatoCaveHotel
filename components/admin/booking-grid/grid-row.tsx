"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { BookingBar, BlockBar } from "./booking-bar"
import type { Booking, RoomBlock } from "@/types/booking"
import { toDateStr } from "@/lib/date-utils"

interface Props {
  roomId: string
  roomName: string
  dates: Date[]
  bookings: Booking[]
  blocks: RoomBlock[]
  cellWidth: number
  onBookingClick: (booking: Booking) => void
  onBlockClick: (block: RoomBlock) => void
  onCellDrag: (roomId: string, startDate: string, endDate: string) => void
}

function dateIndex(dates: Date[], dateStr: string): number {
  return dates.findIndex((d) => toDateStr(d) === dateStr)
}

function clampSpan(start: number, end: number, total: number) {
  const s = Math.max(0, start)
  const e = Math.min(total, end)
  return { s, span: e - s }
}

export function GridRow({
  roomId,
  roomName,
  dates,
  bookings,
  blocks,
  cellWidth,
  onBookingClick,
  onBlockClick,
  onCellDrag,
}: Props) {
  const dragStart = useRef<number | null>(null)
  const today = toDateStr(new Date())

  const handleMouseDown = (colIdx: number) => {
    dragStart.current = colIdx
  }

  const handleMouseUp = (colIdx: number) => {
    if (dragStart.current === null) return
    const start = Math.min(dragStart.current, colIdx)
    const end = Math.max(dragStart.current, colIdx)
    const startDate = toDateStr(dates[start])
    const endDate = toDateStr(new Date(dates[end].getTime() + 86400000)) // end is exclusive
    dragStart.current = null
    onCellDrag(roomId, startDate, endDate)
  }

  return (
    <div className="flex border-b hover:bg-muted/20 transition-colors group">
      <div className="w-60 shrink-0 px-4 py-3 border-r flex flex-col justify-center">
        <span className="text-sm font-medium text-foreground truncate">{roomName}</span>
        <span className="text-xs text-muted-foreground">{roomId}</span>
      </div>

      <div className="relative flex" style={{ height: 48 }}>
        {/* Empty cells */}
        {dates.map((date, idx) => {
          const dateStr = toDateStr(date)
          const isToday = dateStr === today
          return (
            <div
              key={dateStr}
              style={{ width: cellWidth, minWidth: cellWidth }}
              className={cn(
                "shrink-0 border-r h-full cursor-pointer select-none",
                isToday ? "bg-primary/5" : "hover:bg-accent/40",
              )}
              onMouseDown={() => handleMouseDown(idx)}
              onMouseUp={() => handleMouseUp(idx)}
            />
          )
        })}

        {/* Booking bars */}
        {bookings.map((booking) => {
          const { s, span } = clampSpan(
            dateIndex(dates, booking.check_in),
            dateIndex(dates, booking.check_out),
            dates.length
          )
          if (span <= 0) return null
          return (
            <BookingBar
              key={booking.id}
              booking={booking}
              startCol={s}
              spanCols={span}
              cellWidth={cellWidth}
              onClick={() => onBookingClick(booking)}
            />
          )
        })}

        {/* Block bars */}
        {blocks.map((block) => {
          const { s, span } = clampSpan(
            dateIndex(dates, block.start_date),
            dateIndex(dates, block.end_date),
            dates.length
          )
          if (span <= 0) return null
          return (
            <BlockBar
              key={block.id}
              block={block}
              startCol={s}
              spanCols={span}
              cellWidth={cellWidth}
              onClick={() => onBlockClick(block)}
            />
          )
        })}
      </div>
    </div>
  )
}
