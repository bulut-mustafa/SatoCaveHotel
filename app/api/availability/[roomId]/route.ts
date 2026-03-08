import { NextRequest, NextResponse } from "next/server"
import { getAvailabilityData } from "@/actions/availability"
import { getRooms } from "@/lib/content"

export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const { searchParams } = request.nextUrl

  const from = searchParams.get("from") ?? new Date().toISOString().slice(0, 10)
  const to =
    searchParams.get("to") ??
    new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)

  // Get base price from KV
  const rooms = await getRooms("en")
  const room = rooms.find((r) => r.id === roomId)
  const basePrice = room?.price ?? 0

  const data = await getAvailabilityData(roomId, from, to, basePrice)

  return NextResponse.json(data)
}
