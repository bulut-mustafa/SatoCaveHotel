"use server"

import { query } from "@/lib/db"
import { expandDateRange, nightCount } from "@/lib/date-utils"
import { sendBookingReceived, sendAdminNewBooking, sendBookingConfirmed, sendBookingRejected } from "@/lib/email"
import type { Booking, CreateBookingInput } from "@/types/booking"

export async function createBooking(
  input: CreateBookingInput,
  basePrice: number
): Promise<{ booking?: Booking; error?: string }> {
  // Re-check availability server-side to prevent race conditions
  const [conflictBookings, conflictBlocks] = await Promise.all([
    query<{ id: string }>(
      `SELECT id FROM bookings
       WHERE room_id = ${input.room_id}
         AND status = 'accepted'
         AND check_in < ${input.check_out}::date
         AND check_out > ${input.check_in}::date`
    ),
    query<{ id: string }>(
      `SELECT id FROM room_blocks
       WHERE room_id = ${input.room_id}
         AND start_date < ${input.check_out}::date
         AND end_date > ${input.check_in}::date`
    ),
  ])

  if (conflictBookings.length > 0 || conflictBlocks.length > 0) {
    return { error: "These dates are no longer available. Please choose different dates." }
  }

  // Compute total price: sum per-night prices
  const nights = expandDateRange(input.check_in, input.check_out)
  const priceRows = await query<{ date: string; price: string }>(
    `SELECT date::text, price::text FROM room_prices
     WHERE room_id = ${input.room_id}
       AND date = ANY(${nights}::date[])`
  )
  const overrideMap: Record<string, number> = {}
  for (const r of priceRows) {
    overrideMap[r.date] = Number(r.price)
  }
  const total = nights.reduce((sum, d) => sum + (overrideMap[d] ?? basePrice), 0)

  const rows = await query<Booking>(
    `INSERT INTO bookings
       (room_id, check_in, check_out, guest_name, guest_email, guest_phone, num_guests, special_requests, total_price)
     VALUES
       (${input.room_id}, ${input.check_in}::date, ${input.check_out}::date,
        ${input.guest_name}, ${input.guest_email}, ${input.guest_phone},
        ${input.num_guests}, ${input.special_requests ?? null}, ${total})
     RETURNING
       id, room_id, check_in::text, check_out::text, guest_name, guest_email,
       guest_phone, num_guests, special_requests, status, total_price,
       admin_notes, created_at::text, updated_at::text`
  )

  const booking = rows[0]
  if (!booking) return { error: "Failed to create booking." }

  // Send emails (fire-and-forget errors)
  await Promise.all([
    sendBookingReceived(booking),
    sendAdminNewBooking(booking),
  ])

  return { booking }
}

export async function getBookings(options?: {
  roomId?: string
  status?: string
  from?: string
  to?: string
}): Promise<Booking[]> {
  const conditions: string[] = []
  if (options?.roomId) conditions.push(`room_id = '${options.roomId}'`)
  if (options?.status) conditions.push(`status = '${options.status}'`)
  if (options?.from) conditions.push(`check_out > '${options.from}'::date`)
  if (options?.to) conditions.push(`check_in < '${options.to}'::date`)

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  return query<Booking>(
    `SELECT id, room_id, check_in::text, check_out::text, guest_name, guest_email,
            guest_phone, num_guests, special_requests, status, total_price,
            admin_notes, created_at::text, updated_at::text
     FROM bookings
     ${where as any}
     ORDER BY created_at DESC`
  )
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const rows = await query<Booking>(
    `SELECT id, room_id, check_in::text, check_out::text, guest_name, guest_email,
            guest_phone, num_guests, special_requests, status, total_price,
            admin_notes, created_at::text, updated_at::text
     FROM bookings WHERE id = ${id}::uuid`
  )
  return rows[0] ?? null
}

export async function acceptBooking(id: string, adminNotes?: string): Promise<{ error?: string }> {
  const rows = await query<Booking>(
    `UPDATE bookings
     SET status = 'accepted', admin_notes = ${adminNotes ?? null}, updated_at = NOW()
     WHERE id = ${id}::uuid
     RETURNING id, room_id, check_in::text, check_out::text, guest_name, guest_email,
               guest_phone, num_guests, special_requests, status, total_price,
               admin_notes, created_at::text, updated_at::text`
  )
  const booking = rows[0]
  if (!booking) return { error: "Booking not found." }

  await sendBookingConfirmed(booking)
  return {}
}

export async function rejectBooking(id: string, adminNotes?: string): Promise<{ error?: string }> {
  const rows = await query<Booking>(
    `UPDATE bookings
     SET status = 'rejected', admin_notes = ${adminNotes ?? null}, updated_at = NOW()
     WHERE id = ${id}::uuid
     RETURNING id, room_id, check_in::text, check_out::text, guest_name, guest_email,
               guest_phone, num_guests, special_requests, status, total_price,
               admin_notes, created_at::text, updated_at::text`
  )
  const booking = rows[0]
  if (!booking) return { error: "Booking not found." }

  await sendBookingRejected(booking)
  return {}
}

export async function cancelBooking(id: string): Promise<{ error?: string }> {
  const rows = await query<{ id: string }>(
    `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
     WHERE id = ${id}::uuid RETURNING id`
  )
  if (!rows[0]) return { error: "Booking not found." }
  return {}
}
