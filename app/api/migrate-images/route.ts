import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { kv } from "@/lib/kv"
import fs from "fs/promises"
import path from "path"
import type { RoomData } from "@/types/content"

export const maxDuration = 300

// Room ID → directory and image count
const ROOM_IMAGES: { id: string; dir: string; count: number; mainIndex: number }[] = [
  { id: "white-stone-room-bathtub",  dir: "Room-1", count: 15, mainIndex: 1 },
  { id: "arena-stone-room-bathtub",  dir: "Room-2", count: 16, mainIndex: 1 },
  { id: "cooper-cave",               dir: "Room-3", count: 11, mainIndex: 3 },
  { id: "olive-cave",                dir: "Room-4", count: 10, mainIndex: 2 },
  { id: "black-stone-room-bathtub",  dir: "Room-5", count: 15, mainIndex: 1 },
  { id: "moon-cave",                 dir: "Room-6", count: 11, mainIndex: 2 },
  { id: "amber-cave",                dir: "Room-7", count: 19, mainIndex: 2 },
  { id: "almond-cave-bathtub",       dir: "Room-8", count: 15, mainIndex: 6 },
]

const ACTIVITY_IMAGES = [
  "greentour-ihlara.webp",
  "greentour-derinkuyu.webp",
  "uchisar-castle.webp",
]

async function uploadFile(localPath: string, blobPath: string): Promise<string> {
  const buffer = await fs.readFile(localPath)
  const ext = path.extname(localPath).slice(1).toLowerCase()
  const contentType = ext === "webp" ? "image/webp" : "image/jpeg"
  const blob = await put(blobPath, buffer, { access: "public", contentType })
  return blob.url
}

export async function POST(req: NextRequest) {
  const publicDir = path.join(process.cwd(), "public")
  const results: { path: string; url: string }[] = []
  const errors: { path: string; error: string }[] = []

  // 1. Migrate room images
  for (const room of ROOM_IMAGES) {
    const roomDir = path.join(publicDir, "images", "rooms", room.dir)
    const blobUrls: string[] = []
    const dirNum = room.dir.replace("Room-", "")

    for (let i = 1; i <= room.count; i++) {
      const filename = `room-${dirNum}-${i}.jpg`
      const localPath = path.join(roomDir, filename)
      const blobPath = `rooms/${room.id}/${filename}`

      try {
        const url = await uploadFile(localPath, blobPath)
        blobUrls.push(url)
        results.push({ path: localPath, url })
      } catch (err: any) {
        errors.push({ path: blobPath, error: err.message })
      }
    }

    if (blobUrls.length > 0) {
      const existing = await kv.get<RoomData>(`rooms:data:${room.id}`)
      if (existing) {
        const mainUrl = blobUrls[room.mainIndex - 1] ?? blobUrls[0]
        await kv.set(`rooms:data:${room.id}`, {
          ...existing,
          images: blobUrls,
          mainImage: mainUrl,
        })
      }
    }
  }

  // 2. Migrate activity images
  const activityBlobMap: Record<string, string> = {}
  for (const filename of ACTIVITY_IMAGES) {
    const localPath = path.join(publicDir, "images", filename)
    const blobPath = `activities/${filename}`
    try {
      const url = await uploadFile(localPath, blobPath)
      activityBlobMap[`/images/${filename}`] = url
      results.push({ path: localPath, url })
    } catch (err: any) {
      errors.push({ path: blobPath, error: err.message })
    }
  }

  // Update activity KV entries with new blob URLs
  for (const lang of ["en", "tr"] as const) {
    const activities = await kv.get<any[]>(`activities:${lang}`)
    if (activities) {
      const updated = activities.map((act) => {
        const newAct = { ...act }
        if (act.localImage && activityBlobMap[act.localImage]) {
          newAct.localImage = activityBlobMap[act.localImage]
        }
        if (act.poster && activityBlobMap[act.poster]) {
          newAct.poster = activityBlobMap[act.poster]
        }
        return newAct
      })
      await kv.set(`activities:${lang}`, updated)
    }
  }

  return NextResponse.json({
    uploaded: results.length,
    errors,
    message: `Migrated ${results.length} images. ${errors.length} errors.`,
  })
}
