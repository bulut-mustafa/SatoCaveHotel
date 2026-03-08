"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { initializeRoomsToKV } from "@/actions/rooms"

export function InitializeButton({ isInitialized }: { isInitialized: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInitialize = async () => {
    if (!confirm("This will seed all content from hardcoded data into KV storage. Existing KV data will be overwritten. Continue?")) {
      return
    }
    setLoading(true)
    await initializeRoomsToKV()
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant={isInitialized ? "outline" : "default"}
      size="sm"
      onClick={handleInitialize}
      disabled={loading}
    >
      <Database className="h-4 w-4 mr-2" />
      {loading ? "Initializing…" : "Initialize from code"}
    </Button>
  )
}
