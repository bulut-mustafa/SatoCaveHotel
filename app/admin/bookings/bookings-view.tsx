"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingGrid } from "@/components/admin/booking-grid/booking-grid"
import { BookingList } from "@/components/admin/booking-list"
import type { Booking, RoomBlock } from "@/types/booking"
import type { FullRoom } from "@/types/content"

interface Props {
  rooms: FullRoom[]
  bookings: Booking[]
  blocks: RoomBlock[]
  today: string
  priceOverrideMap: Record<string, Record<string, number>>
}

export function BookingsView({ rooms, bookings, blocks, today, priceOverrideMap }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div>
          <h1 className="text-xl font-semibold">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-1 border rounded-lg overflow-hidden">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-l"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4 mr-1.5" />
            List
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "grid" ? (
          <BookingGrid
            rooms={rooms}
            bookings={bookings}
            blocks={blocks}
            initialStartDate={today}
            priceOverrideMap={priceOverrideMap}
          />
        ) : (
          <BookingList rooms={rooms} bookings={bookings} />
        )}
      </div>
    </div>
  )
}
