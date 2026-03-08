import { unstable_cache } from "next/cache"
import { kv } from "./kv"
import { getLocalizedRooms } from "./rooms-data"
import { getDictionary } from "./dictionary"
import { getDefaultContact } from "./default-contact"
import type { Locale } from "@/i18n-config"
import type { RoomData, RoomContent, Activity, AboutContent, ContactInfo, FullRoom } from "@/types/content"

export { getDefaultContact }

async function _getRooms(lang: Locale): Promise<FullRoom[]> {
  const dict = await getDictionary(lang)
  const hardcoded = getLocalizedRooms(dict.room_details)

  const order = await kv.get<string[]>("rooms:order")
  if (!order) return hardcoded

  const rooms = await Promise.all(
    order.map(async (id) => {
      const [data, content] = await Promise.all([
        kv.get<RoomData>(`rooms:data:${id}`),
        kv.get<RoomContent>(`rooms:content:${lang}:${id}`),
      ])

      if (!data || !content) {
        return hardcoded.find((r) => r.id === id) ?? null
      }

      return {
        id,
        name: content.name,
        type: data.type,
        tagline: content.tagline,
        description: content.description,
        price: data.price,
        size: data.size,
        capacity: data.capacity,
        bedType: data.bedType,
        image: data.mainImage || data.images[0] || "",
        images: data.images,
        amenities: content.amenities,
        highlights: content.highlights,
      } satisfies FullRoom
    })
  )

  return rooms.filter(Boolean).filter((r) => !(r as any).hidden) as FullRoom[]
}

export const getRooms = unstable_cache(
  _getRooms,
  ["rooms"],
  { tags: ["rooms"], revalidate: 3600 }
)

async function _getActivities(lang: Locale): Promise<Activity[]> {
  const fromKv = await kv.get<Activity[]>(`activities:${lang}`)
  if (fromKv) return fromKv

  const dict = await getDictionary(lang)
  const a = dict.activities

  return [
    { id: "hot_air_balloons", ...a.hot_air_balloons, video: "/videos/compressed/hot-air-balloon.mp4", poster: a.hot_air_balloons.image_url },
    { id: "horseback_riding", ...a.horseback_riding, video: "/videos/compressed/horse.mp4", poster: a.horseback_riding.image_url },
    { id: "green_tour", ...a.green_tour, localImage: "/images/greentour-ihlara.webp" },
    { id: "red_tour", ...a.red_tour, video: "/videos/compressed/uchisar-castle.mp4", poster: "/images/uchisar-castle.webp", localImage: "/images/uchisar-castle.webp" },
    { id: "underground_cities", ...a.underground_cities, localImage: "/images/greentour-derinkuyu.webp" },
  ]
}

export const getActivities = unstable_cache(
  _getActivities,
  ["activities"],
  { tags: ["activities"], revalidate: 3600 }
)

async function _getAbout(lang: Locale): Promise<AboutContent> {
  const fromKv = await kv.get<AboutContent>(`about:${lang}`)
  if (fromKv) return fromKv

  const dict = await getDictionary(lang)
  return dict.about as AboutContent
}

export const getAbout = unstable_cache(
  _getAbout,
  ["about"],
  { tags: ["about"], revalidate: 3600 }
)

async function _getContact(): Promise<ContactInfo> {
  const fromKv = await kv.get<any>("contact")
  if (!fromKv) return getDefaultContact()

  // Migrate old flat format → new fields array format
  if (!Array.isArray(fromKv.fields)) {
    return getDefaultContact()
  }

  return fromKv as ContactInfo
}

export const getContact = unstable_cache(
  _getContact,
  ["contact"],
  { tags: ["contact"], revalidate: 3600 }
)
