"use client"

import { cn } from "@/lib/utils"
import type { Booking, RoomBlock } from "@/types/booking"

interface BookingBarProps {
  booking: Booking
  startCol: number
  spanCols: number
  cellWidth: number
  onClick: () => void
}

export function BookingBar({ booking, startCol, spanCols, cellWidth, onClick }: BookingBarProps) {
  const statusColors = {
    pending: "bg-amber-400 text-amber-950 border-amber-500",
    accepted: "bg-green-500 text-white border-green-600",
    rejected: "bg-red-400 text-white border-red-500",
    cancelled: "bg-gray-300 text-gray-600 border-gray-400",
  }

  const color = statusColors[booking.status] ?? statusColors.pending

  return (
    <div
      className={cn(
        "absolute top-1.5 bottom-1.5 rounded-sm border cursor-pointer px-2 flex items-center overflow-hidden z-10",
        "text-xs font-medium hover:opacity-80 transition-opacity",
        color
      )}
      style={{
        left: startCol * cellWidth,
        width: spanCols * cellWidth - 2,
      }}
      onClick={onClick}
      title={`${booking.guest_name} — ${booking.check_in} to ${booking.check_out}`}
    >
      <span className="truncate">{booking.guest_name}</span>
    </div>
  )
}

interface BlockBarProps {
  block: RoomBlock
  startCol: number
  spanCols: number
  cellWidth: number
  onClick: () => void
}

export function BlockBar({ block, startCol, spanCols, cellWidth, onClick }: BlockBarProps) {
  return (
    <div
      className="absolute top-1.5 bottom-1.5 rounded-sm border border-orange-400 cursor-pointer px-2 flex items-center overflow-hidden z-10"
      style={{
        left: startCol * cellWidth,
        width: spanCols * cellWidth - 2,
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(251,146,60,0.3) 4px, rgba(251,146,60,0.3) 8px)",
        backgroundColor: "rgba(251,146,60,0.15)",
      }}
      onClick={onClick}
      title={`Blocked: ${block.start_date} to ${block.end_date}${block.reason ? ` — ${block.reason}` : ""}`}
    >
      <span className="text-xs text-orange-700 font-medium truncate">
        {block.reason ?? "Blocked"}
      </span>
    </div>
  )
}
