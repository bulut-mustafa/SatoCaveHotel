"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { acceptBooking, rejectBooking } from "@/actions/bookings"
import type { Booking } from "@/types/booking"

interface Props {
  booking: Booking | null
  onClose: () => void
  onUpdate: () => void
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function BookingDetailPanel({ booking, onClose, onUpdate }: Props) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = async (action: "accept" | "reject") => {
    if (!booking) return
    setLoading(true)
    setError(null)
    const fn = action === "accept" ? acceptBooking : rejectBooking
    const result = await fn(booking.id, notes || undefined)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onUpdate()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {booking && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30"
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-40 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Booking Detail</h2>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[booking.status]}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground">#{booking.id.slice(0, 8)}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">{booking.room_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-medium">{booking.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-right text-xs">{booking.guest_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{booking.guest_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{booking.num_guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{formatDate(booking.check_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{formatDate(booking.check_out)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">€{Number(booking.total_price).toFixed(2)}</span>
                </div>
              </div>

              {booking.special_requests && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Special requests</p>
                  <p className="bg-muted rounded-md p-2">{booking.special_requests}</p>
                </div>
              )}

              {booking.admin_notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Admin notes</p>
                  <p className="bg-muted rounded-md p-2">{booking.admin_notes}</p>
                </div>
              )}

              {booking.status === "pending" && (
                <div className="space-y-2">
                  <Label className="text-xs">Note to guest (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a message for the guest…"
                    rows={3}
                    disabled={loading}
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            {booking.status === "pending" && (
              <div className="p-4 border-t flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handle("accept")}
                  disabled={loading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handle("reject")}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
