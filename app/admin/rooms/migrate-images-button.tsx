"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImageIcon, CheckCircle2, AlertCircle } from "lucide-react"

type Status = "idle" | "loading" | "done" | "error"

export function MigrateImagesButton() {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleMigrate = async () => {
    if (!confirm("This will upload all room and activity images from the public folder to Vercel Blob, then update KV with the new URLs. This may take 1–2 minutes. Continue?")) {
      return
    }

    setStatus("loading")
    setMessage("Uploading images… this may take a while")

    try {
      const res = await fetch("/api/migrate-images", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        setMessage(data.error ?? "Migration failed")
        return
      }

      setStatus("done")
      setMessage(data.message)
      router.refresh()
    } catch (err: any) {
      setStatus("error")
      setMessage(err.message ?? "Network error")
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleMigrate}
        disabled={status === "loading"}
        className="gap-1.5"
      >
        {status === "loading" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : status === "done" ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : status === "error" ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        {status === "loading" ? "Uploading…" : "Migrate images to Blob"}
      </Button>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-destructive" : status === "done" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
          {message}
        </p>
      )}
    </div>
  )
}
