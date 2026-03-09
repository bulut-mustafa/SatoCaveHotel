"use client"

import { cn } from "@/lib/utils"
import { BookingBar, BlockBar } from "./booking-bar"
import type { Booking, RoomBlock } from "@/types/booking"
import { toDateStr } from "@/lib/date-utils"

interface Props {
  roomId: string
  roomName: string
  rowIdx: number
  dates: Date[]
  bookings: Booking[]
  blocks: RoomBlock[]
  cellWidth: number
  // Selection state (computed by parent)
  selectedDateStart: number | null  // inclusive col index
  selectedDateEnd: number | null    // inclusive col index
  isRowInSelection: boolean
  isDragging: boolean
  onCellMouseDown: (rowIdx: number, dateIdx: number) => void
  onCellMouseEnter: (rowIdx: number, dateIdx: number) => void
  onBookingClick: (booking: Booking) => void
  onBlockClick: (block: RoomBlock) => void
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
  rowIdx,
  dates,
  bookings,
  blocks,
  cellWidth,
  selectedDateStart,
  selectedDateEnd,
  isRowInSelection,
  isDragging,
  onCellMouseDown,
  onCellMouseEnter,
  onBookingClick,
  onBlockClick,
}: Props) {
  const today = toDateStr(new Date())

  return (
    <div className="flex border-b hover:bg-muted/20 transition-colors group">
      {/* Room label */}
      <div className={cn(
        "w-60 shrink-0 px-4 py-3 border-r flex flex-col justify-center transition-colors",
        isRowInSelection && "bg-blue-50 dark:bg-blue-950/30"
      )}>
        <span className="text-sm font-medium text-foreground truncate">{roomName}</span>
        <span className="text-xs text-muted-foreground">{roomId}</span>
      </div>

      <div
        className="relative flex"
        style={{ height: 48 }}
        onMouseLeave={() => {/* keep drag alive even if leaving row */}}
      >
        {/* Empty cells */}
        {dates.map((date, idx) => {
          const dateStr = toDateStr(date)
          const isToday = dateStr === today
          const isSelected = isRowInSelection &&
            selectedDateStart !== null &&
            selectedDateEnd !== null &&
            idx >= selectedDateStart && idx <= selectedDateEnd

          return (
            <div
              key={dateStr}
              style={{ width: cellWidth, minWidth: cellWidth }}
              className={cn(
                "shrink-0 border-r h-full select-none transition-colors",
                isSelected
                  ? "bg-blue-200/70 dark:bg-blue-700/40 cursor-crosshair"
                  : isToday
                  ? "bg-primary/5"
                  : isDragging
                  ? "cursor-crosshair hover:bg-blue-100/50"
                  : "cursor-crosshair hover:bg-accent/40",
              )}
              onMouseDown={(e) => { e.preventDefault(); onCellMouseDown(rowIdx, idx) }}
              onMouseEnter={() => { if (isDragging) onCellMouseEnter(rowIdx, idx) }}
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
