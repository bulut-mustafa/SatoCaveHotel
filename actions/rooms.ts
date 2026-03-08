"use server"

import { revalidateTag } from "next/cache"
import { kv } from "@/lib/kv"
import { getLocalizedRooms } from "@/lib/rooms-data"
import { getDictionary } from "@/lib/dictionary"
import { getDefaultContact } from "@/lib/default-contact"
import type { RoomData, RoomContent, Activity, AboutContent } from "@/types/content"

export async function updateRoom(
  id: string,
  data: RoomData,
  enContent: RoomContent,
  trContent: RoomContent
) {
  // Ensure room is in the order list
  const order = await kv.get<string[]>("rooms:order")
  if (order && !order.includes(id)) {
    await kv.set("rooms:order", [...order, id])
  }

  await Promise.all([
    kv.set(`rooms:data:${id}`, data),
    kv.set(`rooms:content:en:${id}`, enContent),
    kv.set(`rooms:content:tr:${id}`, trContent),
  ])

  revalidateTag("rooms")
}

export async function reorderRooms(ids: string[]) {
  await kv.set("rooms:order", ids)
  revalidateTag("rooms")
}

export async function deleteRoomImage(id: string, imageUrl: string) {
  const data = await kv.get<RoomData>(`rooms:data:${id}`)
  if (!data) return

  data.images = data.images.filter((img) => img !== imageUrl)
  if (data.mainImage === imageUrl) {
    data.mainImage = data.images[0] ?? ""
  }

  await kv.set(`rooms:data:${id}`, data)
  revalidateTag("rooms")
}

export async function setRoomMainImage(id: string, imageUrl: string) {
  const data = await kv.get<RoomData>(`rooms:data:${id}`)
  if (!data) return

  data.mainImage = imageUrl
  await kv.set(`rooms:data:${id}`, data)
  revalidateTag("rooms")
}

export async function addRoomImage(id: string, imageUrl: string) {
  const data = await kv.get<RoomData>(`rooms:data:${id}`)
  if (!data) return

  data.images = [...data.images, imageUrl]
  if (!data.mainImage) data.mainImage = imageUrl

  await kv.set(`rooms:data:${id}`, data)
  revalidateTag("rooms")
}

export async function reorderRoomImages(id: string, images: string[]) {
  const data = await kv.get<RoomData>(`rooms:data:${id}`)
  if (!data) return

  data.images = images
  await kv.set(`rooms:data:${id}`, data)
  revalidateTag("rooms")
}

export async function toggleRoomVisibility(id: string, hidden: boolean) {
  const data = await kv.get<RoomData>(`rooms:data:${id}`)
  if (!data) return

  await kv.set(`rooms:data:${id}`, { ...data, hidden })
  revalidateTag("rooms")
}

export async function deleteRoom(id: string) {
  const order = await kv.get<string[]>("rooms:order") ?? []
  await kv.set("rooms:order", order.filter((i) => i !== id))

  await Promise.all([
    kv.del(`rooms:data:${id}`),
    kv.del(`rooms:content:en:${id}`),
    kv.del(`rooms:content:tr:${id}`),
  ])

  revalidateTag("rooms")
}

export async function createRoom(
  id: string,
  data: Omit<RoomData, "id">,
  enContent: RoomContent,
  trContent: RoomContent
): Promise<{ error?: string }> {
  // Validate ID: lowercase letters, numbers, hyphens only
  if (!/^[a-z0-9-]+$/.test(id)) {
    return { error: "ID must contain only lowercase letters, numbers, and hyphens." }
  }

  const existing = await kv.get<RoomData>(`rooms:data:${id}`)
  if (existing) return { error: "A room with this ID already exists." }

  const order = await kv.get<string[]>("rooms:order") ?? []

  await Promise.all([
    kv.set("rooms:order", [...order, id]),
    kv.set(`rooms:data:${id}`, { ...data, id }),
    kv.set(`rooms:content:en:${id}`, enContent),
    kv.set(`rooms:content:tr:${id}`, trContent),
  ])

  revalidateTag("rooms")
  return {}
}

export async function initializeRoomsToKV() {
  const [enDict, trDict] = await Promise.all([
    getDictionary("en"),
    getDictionary("tr"),
  ])

  const enRooms = getLocalizedRooms(enDict.room_details)
  const trRooms = getLocalizedRooms(trDict.room_details)

  const order = enRooms.map((r) => r.id)
  await kv.set("rooms:order", order)

  await Promise.all(
    enRooms.map(async (room) => {
      const data: RoomData = {
        id: room.id,
        type: room.type,
        price: room.price,
        size: room.size,
        capacity: room.capacity,
        bedType: room.bedType,
        images: room.images,
        mainImage: room.image,
      }

      const enContent: RoomContent = {
        name: room.name,
        tagline: room.tagline,
        description: room.description,
        amenities: room.amenities,
        highlights: room.highlights,
      }

      const trRoom = trRooms.find((r) => r.id === room.id)!
      const trContent: RoomContent = {
        name: trRoom.name,
        tagline: trRoom.tagline,
        description: trRoom.description,
        amenities: trRoom.amenities,
        highlights: trRoom.highlights,
      }

      await Promise.all([
        kv.set(`rooms:data:${room.id}`, data),
        kv.set(`rooms:content:en:${room.id}`, enContent),
        kv.set(`rooms:content:tr:${room.id}`, trContent),
      ])
    })
  )

  // Seed activities
  const enActs = enDict.activities
  const trActs = trDict.activities

  const enActivities: Activity[] = [
    { id: "hot_air_balloons", ...enActs.hot_air_balloons, video: "/videos/compressed/hot-air-balloon.mp4", poster: enActs.hot_air_balloons.image_url },
    { id: "horseback_riding", ...enActs.horseback_riding, video: "/videos/compressed/horse.mp4", poster: enActs.horseback_riding.image_url },
    { id: "green_tour", ...enActs.green_tour, localImage: "/images/greentour-ihlara.webp" },
    { id: "red_tour", ...enActs.red_tour, video: "/videos/compressed/uchisar-castle.mp4", poster: "/images/uchisar-castle.webp", localImage: "/images/uchisar-castle.webp" },
    { id: "underground_cities", ...enActs.underground_cities, localImage: "/images/greentour-derinkuyu.webp" },
  ]

  const trActivities: Activity[] = [
    { id: "hot_air_balloons", ...trActs.hot_air_balloons, video: "/videos/compressed/hot-air-balloon.mp4", poster: trActs.hot_air_balloons.image_url },
    { id: "horseback_riding", ...trActs.horseback_riding, video: "/videos/compressed/horse.mp4", poster: trActs.horseback_riding.image_url },
    { id: "green_tour", ...trActs.green_tour, localImage: "/images/greentour-ihlara.webp" },
    { id: "red_tour", ...trActs.red_tour, video: "/videos/compressed/uchisar-castle.mp4", poster: "/images/uchisar-castle.webp", localImage: "/images/uchisar-castle.webp" },
    { id: "underground_cities", ...trActs.underground_cities, localImage: "/images/greentour-derinkuyu.webp" },
  ]

  await Promise.all([
    kv.set("activities:en", enActivities),
    kv.set("activities:tr", trActivities),
  ])

  // Seed about
  const enAbout: AboutContent = {
    subtitle: enDict.about.subtitle,
    title_part_1: enDict.about.title_part_1,
    title_part_2: enDict.about.title_part_2,
    description: enDict.about.description,
    features: enDict.about.features,
  }
  const trAbout: AboutContent = {
    subtitle: trDict.about.subtitle,
    title_part_1: trDict.about.title_part_1,
    title_part_2: trDict.about.title_part_2,
    description: trDict.about.description,
    features: trDict.about.features,
  }

  await Promise.all([
    kv.set("about:en", enAbout),
    kv.set("about:tr", trAbout),
  ])

  // Seed contact
  await kv.set("contact", getDefaultContact())

  revalidateTag("rooms")
  revalidateTag("activities")
  revalidateTag("about")
  revalidateTag("contact")

  return { success: true }
}
