"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { acceptBooking, rejectBooking } from "@/actions/bookings"
import type { Booking } from "@/types/booking"

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function BookingRow({ booking }: { booking: Booking }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const handle = async (action: "accept" | "reject") => {
    const fn = action === "accept" ? acceptBooking : rejectBooking
    await fn(booking.id)
    setDone(true)
    startTransition(() => router.refresh())
  }

  if (done) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm">
      <div className="flex-1 min-w-0">
        <span className="font-medium">{booking.guest_name}</span>
        <span className="text-muted-foreground mx-2">·</span>
        <span className="text-muted-foreground">{booking.room_id}</span>
        <span className="text-muted-foreground mx-2">·</span>
        <span>{fmtDate(booking.check_in)} → {fmtDate(booking.check_out)}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="font-semibold">€{Number(booking.total_price).toFixed(0)}</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handle("accept")}
            disabled={isPending}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-2"
            onClick={() => handle("reject")}
            disabled={isPending}
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PendingBookings({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No pending bookings — you&apos;re all caught up!
      </p>
    )
  }
  return (
    <div className="space-y-2">
      {bookings.map((b) => <BookingRow key={b.id} booking={b} />)}
    </div>
  )
}
