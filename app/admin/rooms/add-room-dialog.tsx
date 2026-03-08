"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createRoom } from "@/actions/rooms"
import type { RoomData, RoomContent } from "@/types/content"

const EMPTY_CONTENT: RoomContent = {
  name: "",
  tagline: "",
  description: "",
  amenities: [],
  highlights: [],
}

export function AddRoomDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [id, setId] = useState("")
  const [type, setType] = useState<RoomData["type"]>("cave")
  const [price, setPrice] = useState("100")
  const [size, setSize] = useState("30 sqm")
  const [capacity, setCapacity] = useState("2")
  const [bedType, setBedType] = useState("Double Bed")
  const [enName, setEnName] = useState("")
  const [trName, setTrName] = useState("")

  const reset = () => {
    setId(""); setType("cave"); setPrice("100"); setSize("30 sqm")
    setCapacity("2"); setBedType("Double Bed"); setEnName(""); setTrName("")
    setError("")
  }

  const handleCreate = async () => {
    if (!id.trim() || !enName.trim()) {
      setError("Room ID and English name are required.")
      return
    }

    setLoading(true)
    setError("")

    const data: Omit<RoomData, "id"> = {
      type,
      price: Number(price),
      size,
      capacity: Number(capacity),
      bedType,
      images: [],
      mainImage: "",
    }

    const result = await createRoom(
      id.trim(),
      data,
      { ...EMPTY_CONTENT, name: enName },
      { ...EMPTY_CONTENT, name: trName || enName }
    )

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      reset()
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Room ID <span className="text-muted-foreground text-xs">(slug, e.g. "new-cave-room")</span></Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-new-room"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>English name</Label>
              <Input value={enName} onChange={(e) => setEnName(e.target.value)} placeholder="Room name" />
            </div>
            <div className="space-y-1.5">
              <Label>Turkish name</Label>
              <Input value={trName} onChange={(e) => setTrName(e.target.value)} placeholder="Oda adı (optional)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as RoomData["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cave">Cave</SelectItem>
                  <SelectItem value="arched">Arched</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Price ($/night)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Size</Label>
              <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="30 sqm" />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Bed type</Label>
              <Input value={bedType} onChange={(e) => setBedType(e.target.value)} placeholder="King Bed" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create room"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
