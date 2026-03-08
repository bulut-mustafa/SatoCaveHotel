import { notFound } from "next/navigation"
import { kv } from "@/lib/kv"
import { getLocalizedRooms } from "@/lib/rooms-data"
import { getDictionary } from "@/lib/dictionary"
import { getBlocks, getPriceOverrides, getAvailabilityData } from "@/actions/availability"
import type { RoomData, RoomContent } from "@/types/content"
import { RoomEditorClient } from "./room-editor"
import { toDateStr } from "@/lib/date-utils"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getEditorData(id: string) {
  const [enDict, trDict] = await Promise.all([
    getDictionary("en"),
    getDictionary("tr"),
  ])
  const hardcodedEn = getLocalizedRooms(enDict.room_details)
  const hardcodedTr = getLocalizedRooms(trDict.room_details)

  const fallbackEn = hardcodedEn.find((r) => r.id === id)
  const fallbackTr = hardcodedTr.find((r) => r.id === id)

  if (!fallbackEn) return null

  const [data, enContent, trContent] = await Promise.all([
    kv.get<RoomData>(`rooms:data:${id}`),
    kv.get<RoomContent>(`rooms:content:en:${id}`),
    kv.get<RoomContent>(`rooms:content:tr:${id}`),
  ])

  const resolvedData: RoomData = data ?? {
    id: fallbackEn.id,
    type: fallbackEn.type,
    price: fallbackEn.price,
    size: fallbackEn.size,
    capacity: fallbackEn.capacity,
    bedType: fallbackEn.bedType,
    images: fallbackEn.images,
    mainImage: fallbackEn.image,
  }

  const resolvedEn: RoomContent = enContent ?? {
    name: fallbackEn.name,
    tagline: fallbackEn.tagline,
    description: fallbackEn.description,
    amenities: fallbackEn.amenities,
    highlights: fallbackEn.highlights,
  }

  const resolvedTr: RoomContent = trContent ?? {
    name: fallbackTr?.name ?? fallbackEn.name,
    tagline: fallbackTr?.tagline ?? fallbackEn.tagline,
    description: fallbackTr?.description ?? fallbackEn.description,
    amenities: fallbackTr?.amenities ?? fallbackEn.amenities,
    highlights: fallbackTr?.highlights ?? fallbackEn.highlights,
  }

  return { data: resolvedData, enContent: resolvedEn, trContent: resolvedTr }
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params
  const editorData = await getEditorData(id)

  if (!editorData) return notFound()

  const today = toDateStr(new Date())
  const inSixMonths = toDateStr(new Date(Date.now() + 180 * 86400000))

  const [blocks, priceOverrides, availability] = await Promise.all([
    getBlocks(id),
    getPriceOverrides(id),
    getAvailabilityData(id, today, inSixMonths, editorData.data.price),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <a href="/admin/rooms" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to rooms
        </a>
        <h1 className="text-2xl font-semibold mt-2">{editorData.enContent.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">{editorData.data.type} · ID: {id}</p>
      </div>
      <RoomEditorClient
        id={id}
        initialData={editorData.data}
        initialEnContent={editorData.enContent}
        initialTrContent={editorData.trContent}
        blocks={blocks}
        priceOverrides={priceOverrides}
        unavailableDates={availability.unavailable_dates}
      />
    </div>
  )
}
