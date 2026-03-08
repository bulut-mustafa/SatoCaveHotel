import { kv } from "@/lib/kv"
import { getLocalizedRooms } from "@/lib/rooms-data"
import { getDictionary } from "@/lib/dictionary"
import type { RoomData, RoomContent } from "@/types/content"
import { RoomsAdminList } from "./rooms-list"
import { InitializeButton } from "./initialize-button"
import { AddRoomDialog } from "./add-room-dialog"
import { MigrateImagesButton } from "./migrate-images-button"

export interface AdminRoom {
  id: string
  name: string
  type: string
  price: number
  mainImage: string
  hidden?: boolean
}

async function getAdminRooms(): Promise<{ rooms: AdminRoom[]; isInitialized: boolean }> {
  const order = await kv.get<string[]>("rooms:order")

  if (!order) {
    const dict = await getDictionary("en")
    const hardcoded = getLocalizedRooms(dict.room_details)
    return {
      rooms: hardcoded.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        price: r.price,
        mainImage: r.image,
        hidden: false,
      })),
      isInitialized: false,
    }
  }

  const rooms = await Promise.all(
    order.map(async (id) => {
      const [data, content] = await Promise.all([
        kv.get<RoomData>(`rooms:data:${id}`),
        kv.get<RoomContent>(`rooms:content:en:${id}`),
      ])
      return {
        id,
        name: content?.name ?? id,
        type: data?.type ?? "cave",
        price: data?.price ?? 0,
        mainImage: data?.mainImage || data?.images?.[0] || "",
        hidden: data?.hidden ?? false,
      }
    })
  )

  return { rooms, isInitialized: true }
}

export default async function AdminRoomsPage() {
  const { rooms, isInitialized } = await getAdminRooms()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag to reorder · Toggle visibility · Edit details
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isInitialized && <MigrateImagesButton />}
          {isInitialized && <AddRoomDialog />}
          <InitializeButton isInitialized={isInitialized} />
        </div>
      </div>

      {!isInitialized && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
          KV storage is not initialized yet. Click <strong>Initialize from code</strong> to seed all content. Add/hide/delete features are available after initialization.
        </div>
      )}

      <RoomsAdminList initialRooms={rooms} isInitialized={isInitialized} />
    </div>
  )
}
