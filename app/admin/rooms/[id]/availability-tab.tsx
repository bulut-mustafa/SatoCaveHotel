"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { addBlock, removeBlock } from "@/actions/availability"
import { toDateStr } from "@/lib/date-utils"
import type { RoomBlock } from "@/types/booking"

interface Props {
  roomId: string
  blocks: RoomBlock[]
  unavailableDates: string[]
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function AvailabilityTab({ roomId, blocks, unavailableDates }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [range, setRange] = useState<DateRange | undefined>()
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddBlock = async () => {
    if (!range?.from || !range?.to) return
    setLoading(true)
    await addBlock(roomId, toDateStr(range.from), toDateStr(range.to), reason || undefined)
    setLoading(false)
    setRange(undefined)
    setReason("")
    startTransition(() => router.refresh())
  }

  const handleRemoveBlock = async (blockId: string) => {
    await removeBlock(blockId)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Block Dates</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a date range to block from bookings. Blocked dates appear on the guest-facing availability calendar.
        </p>
        <AvailabilityCalendar
          unavailableDates={unavailableDates}
          priceOverrides={{}}
          basePrice={0}
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
        />
        {range?.from && range?.to && (
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label>Reason (optional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Maintenance"
                disabled={loading}
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleAddBlock}
              disabled={loading}
            >
              Block {toDateStr(range.from)} → {toDateStr(range.to)}
            </Button>
          </div>
        )}
      </div>

      {blocks.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Existing Blocks</h3>
          <div className="space-y-2">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-muted text-sm"
              >
                <span>
                  <span className="font-medium">{formatDate(block.start_date)}</span>
                  {" → "}
                  <span className="font-medium">{formatDate(block.end_date)}</span>
                  {block.reason && (
                    <span className="text-muted-foreground ml-2">— {block.reason}</span>
                  )}
                </span>
                <button
                  onClick={() => handleRemoveBlock(block.id)}
                  disabled={isPending}
                  className="p-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
