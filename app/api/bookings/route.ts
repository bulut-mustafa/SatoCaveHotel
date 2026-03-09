import { NextRequest, NextResponse } from "next/server"
import { createBooking } from "@/actions/bookings"
import { getRooms } from "@/lib/content"
import type { CreateBookingInput } from "@/types/booking"

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingInput = await request.json()

    // Validate required fields
    const required = ["room_id", "check_in", "check_out", "guest_name", "guest_email", "guest_phone", "num_guests"] as const
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    if (body.check_in >= body.check_out) {
      return NextResponse.json({ error: "check_out must be after check_in" }, { status: 400 })
    }

    // Get base price
    const rooms = await getRooms("en")
    const room = rooms.find((r) => r.id === body.room_id)
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const result = await createBooking(body, room.price)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    return NextResponse.json({ booking: result.booking }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
