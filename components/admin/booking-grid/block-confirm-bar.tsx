"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Ban, DollarSign, X, Calendar, BedDouble } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addBlock } from "@/actions/availability"
import { setRangePriceOverrides } from "@/actions/availability"

interface Props {
  roomIds: string[]         // all selected room IDs
  roomNames: string[]       // display names
  startDate: string         // inclusive
  endDate: string           // exclusive (check-out style)
  nightCount: number
  initialPrice?: number     // current price for startDate of first room
  onDone: () => void
  onCancel: () => void
}

export function SelectionActionBar({
  roomIds,
  roomNames,
  startDate,
  endDate,
  nightCount,
  initialPrice,
  onDone,
  onCancel,
}: Props) {
  const [action, setAction] = useState<"idle" | "blocking" | "pricing">("idle")
  const [reason, setReason] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)

  const handleBlock = async () => {
    setLoading(true)
    await Promise.all(roomIds.map((id) => addBlock(id, startDate, endDate, reason || undefined)))
    setLoading(false)
    onDone()
  }

  const handleSetPrice = async () => {
    if (!price) return
    setLoading(true)
    await Promise.all(roomIds.map((id) => setRangePriceOverrides(id, startDate, endDate, Number(price))))
    setLoading(false)
    onDone()
  }

  const roomLabel = roomIds.length === 1
    ? roomNames[0] ?? roomIds[0]
    : `${roomIds.length} rooms`

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed bottom-0 inset-x-0 bg-background border-t shadow-2xl z-50"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col gap-3">
        {/* Selection summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium text-foreground">{fmtDate(startDate)}</span>
            <span>→</span>
            <span className="font-medium text-foreground">{fmtDate(endDate)}</span>
            <span className="text-muted-foreground">({nightCount} night{nightCount !== 1 ? "s" : ""})</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <span className="font-medium text-foreground">{roomLabel}</span>
          </div>
          <button onClick={onCancel} className="ml-auto p-1.5 rounded-full hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {action === "idle" && (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setAction("blocking")}
                className="gap-1.5"
              >
                <Ban className="h-4 w-4" />
                Block dates
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPrice(initialPrice != null ? String(initialPrice) : "")
                  setAction("pricing")
                }}
                className="gap-1.5"
              >
                <DollarSign className="h-4 w-4" />
                Set price{initialPrice != null ? ` (current: €${initialPrice})` : ""}
              </Button>
            </>
          )}

          {action === "blocking" && (
            <>
              <span className="text-sm text-muted-foreground">
                Block <strong>{roomLabel}</strong> for <strong>{nightCount}</strong> night{nightCount !== 1 ? "s" : ""}?
              </span>
              <Input
                placeholder="Reason (optional, e.g. Maintenance)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="max-w-xs h-8 text-sm"
                disabled={loading}
                autoFocus
              />
              <Button size="sm" variant="destructive" onClick={handleBlock} disabled={loading}>
                {loading ? "Blocking…" : "Confirm block"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAction("idle")} disabled={loading}>
                Back
              </Button>
            </>
          )}

          {action === "pricing" && (
            <>
              <span className="text-sm text-muted-foreground">
                Set price for <strong>{roomLabel}</strong> for <strong>{nightCount}</strong> night{nightCount !== 1 ? "s" : ""}:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">€</span>
                <Input
                  type="number"
                  placeholder="e.g. 175"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-28 h-8 text-sm"
                  disabled={loading}
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">/ night</span>
              </div>
              <Button size="sm" onClick={handleSetPrice} disabled={loading || !price}>
                {loading ? "Saving…" : "Apply price"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAction("idle")} disabled={loading}>
                Back
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
