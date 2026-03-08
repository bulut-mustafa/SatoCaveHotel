"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Ban, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addBlock } from "@/actions/availability"

interface Props {
  roomId: string
  startDate: string
  endDate: string
  onDone: () => void
  onCancel: () => void
}

export function BlockConfirmBar({ roomId, startDate, endDate, onDone, onCancel }: Props) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleBlock = async () => {
    setLoading(true)
    await addBlock(roomId, startDate, endDate, reason || undefined)
    setLoading(false)
    onDone()
  }

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="fixed bottom-0 inset-x-0 bg-background border-t shadow-lg z-50 p-4 flex items-center gap-3"
    >
      <Ban className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground shrink-0">
        Block <strong>{startDate}</strong> → <strong>{endDate}</strong> for room {roomId}
      </span>
      <Input
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="max-w-xs text-sm"
        disabled={loading}
      />
      <Button size="sm" variant="destructive" onClick={handleBlock} disabled={loading}>
        {loading ? "Blocking…" : "Block dates"}
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} disabled={loading}>
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
