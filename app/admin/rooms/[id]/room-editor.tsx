"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Trash2, GripVertical, Upload, CheckCircle2, X } from "lucide-react"
import { updateRoom, deleteRoomImage, setRoomMainImage, addRoomImage, reorderRoomImages } from "@/actions/rooms"
import { AvailabilityTab } from "./availability-tab"
import { PricingTab } from "./pricing-tab"
import type { RoomData, RoomContent } from "@/types/content"
import type { RoomBlock, PriceOverride } from "@/types/booking"

interface Props {
  id: string
  initialData: RoomData
  initialEnContent: RoomContent
  initialTrContent: RoomContent
  blocks?: RoomBlock[]
  priceOverrides?: PriceOverride[]
  unavailableDates?: string[]
}

// ─── Sortable image item ───────────────────────────────────────────────────────
function SortableImage({
  url,
  isMain,
  onSetMain,
  onDelete,
}: {
  url: string
  isMain: boolean
  onSetMain: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-md overflow-hidden border bg-muted aspect-video"
    >
      <Image src={url} alt="" fill className="object-cover" />
      {isMain && (
        <div className="absolute top-1.5 left-1.5">
          <Badge className="text-[10px] px-1.5 py-0.5">Main</Badge>
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {!isMain && (
          <button
            onClick={onSetMain}
            className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
            title="Set as main image"
          >
            <Star className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 bg-red-500/70 hover:bg-red-600/90 rounded text-white"
          title="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Tag list editor ───────────────────────────────────────────────────────────
function TagList({
  label,
  value,
  onChange,
}: {
  label: string
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [input, setInput] = useState("")

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput("")
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add item…"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Translation form ─────────────────────────────────────────────────────────
function TranslationForm({
  lang,
  content,
  onChange,
}: {
  lang: string
  content: RoomContent
  onChange: (c: RoomContent) => void
}) {
  const set = (key: keyof RoomContent, val: any) => onChange({ ...content, [key]: val })

  return (
    <div className="space-y-4">
      <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
        {lang.toUpperCase()}
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={content.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Tagline</Label>
        <Input value={content.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={content.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />
      </div>
      <TagList label="Amenities" value={content.amenities} onChange={(v) => set("amenities", v)} />
      <TagList label="Highlights" value={content.highlights} onChange={(v) => set("highlights", v)} />
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────
export function RoomEditorClient({ id, initialData, initialEnContent, initialTrContent, blocks = [], priceOverrides = [], unavailableDates = [] }: Props) {
  const [data, setData] = useState<RoomData>(initialData)
  const [enContent, setEnContent] = useState<RoomContent>(initialEnContent)
  const [trContent, setTrContent] = useState<RoomContent>(initialTrContent)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleSave = async () => {
    setSaving(true)
    await updateRoom(id, data, enContent, trContent)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleImageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = data.images.indexOf(active.id as string)
    const newIndex = data.images.indexOf(over.id as string)
    const newImages = arrayMove(data.images, oldIndex, newIndex)
    setData((d) => ({ ...d, images: newImages }))
    await reorderRoomImages(id, newImages)
  }

  const handleDelete = async (url: string) => {
    setData((d) => ({
      ...d,
      images: d.images.filter((i) => i !== url),
      mainImage: d.mainImage === url ? (d.images.find((i) => i !== url) ?? "") : d.mainImage,
    }))
    await deleteRoomImage(id, url)
  }

  const handleSetMain = async (url: string) => {
    setData((d) => ({ ...d, mainImage: url }))
    await setRoomMainImage(id, url)
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.ok) {
          const { url } = await res.json()
          setData((d) => ({
            ...d,
            images: [...d.images, url],
            mainImage: d.mainImage || url,
          }))
          await addRoomImage(id, url)
        }
      }
      setUploading(false)
    },
    [id]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images ({data.images.length})</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* ── Details tab ── */}
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price ($/night)</Label>
              <Input
                type="number"
                value={data.price}
                onChange={(e) => setData((d) => ({ ...d, price: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                value={data.size}
                onChange={(e) => setData((d) => ({ ...d, size: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity (guests)</Label>
              <Input
                type="number"
                value={data.capacity}
                onChange={(e) => setData((d) => ({ ...d, capacity: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bed Type</Label>
              <Input
                value={data.bedType}
                onChange={(e) => setData((d) => ({ ...d, bedType: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select
                value={data.type}
                onValueChange={(v) => setData((d) => ({ ...d, type: v as RoomData["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cave">Cave</SelectItem>
                  <SelectItem value="arched">Arched</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* ── Images tab ── */}
        <TabsContent value="images" className="space-y-4 pt-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {uploading
                ? "Uploading…"
                : isDragActive
                ? "Drop images here"
                : "Drag & drop images, or click to select"}
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleImageDragEnd}
          >
            <SortableContext items={data.images} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {data.images.map((url) => (
                  <SortableImage
                    key={url}
                    url={url}
                    isMain={url === data.mainImage}
                    onSetMain={() => handleSetMain(url)}
                    onDelete={() => handleDelete(url)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* ── Translations tab ── */}
        <TabsContent value="translations" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TranslationForm lang="en" content={enContent} onChange={setEnContent} />
            <TranslationForm lang="tr" content={trContent} onChange={setTrContent} />
          </div>
        </TabsContent>

        {/* ── Pricing tab ── */}
        <TabsContent value="pricing" className="pt-4">
          <PricingTab
            roomId={id}
            basePrice={data.price}
            priceOverrides={priceOverrides}
          />
        </TabsContent>

        {/* ── Availability tab ── */}
        <TabsContent value="availability" className="pt-4">
          <AvailabilityTab
            roomId={id}
            blocks={blocks}
            unavailableDates={unavailableDates}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}
