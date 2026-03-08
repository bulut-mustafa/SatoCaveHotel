"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AvailabilityCalendar } from "./availability-calendar"
import type { AvailabilityData } from "@/types/booking"
import { toDateStr } from "@/lib/date-utils"

interface Props {
  roomId: string
  roomName: string
  children: React.ReactNode
  availabilityTitle: string
}

export function AvailabilityModal({ roomId, roomName, children, availabilityTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    const from = toDateStr(new Date())
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 3)
    const to = toDateStr(futureDate)
    fetch(`/api/availability/${roomId}?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, roomId, data])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{availabilityTitle} — {roomName}</DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Loading availability…
          </div>
        )}
        {data && !loading && (
          <AvailabilityCalendar
            unavailableDates={data.unavailable_dates}
            priceOverrides={data.price_overrides}
            basePrice={data.base_price}
            numberOfMonths={2}
            readOnly
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
