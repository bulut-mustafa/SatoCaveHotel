"use server"

import { query } from "@/lib/db"
import { expandDateRange } from "@/lib/date-utils"
import type { RoomBlock, PriceOverride, AvailabilityData } from "@/types/booking"

export async function getAvailabilityData(
  roomId: string,
  from: string,
  to: string,
  basePrice: number
): Promise<AvailabilityData> {
  const [bookings, blocks, prices] = await Promise.all([
    query<{ check_in: string; check_out: string }>`
      SELECT check_in::text, check_out::text FROM bookings
      WHERE room_id = ${roomId}
        AND status = 'accepted'
        AND check_in < ${to}::date
        AND check_out > ${from}::date
    `,
    query<{ start_date: string; end_date: string }>`
      SELECT start_date::text, end_date::text FROM room_blocks
      WHERE room_id = ${roomId}
        AND start_date < ${to}::date
        AND end_date > ${from}::date
    `,
    query<{ date: string; price: string }>`
      SELECT date::text, price::text FROM room_prices
      WHERE room_id = ${roomId}
        AND date >= ${from}::date
        AND date < ${to}::date
    `,
  ])

  const unavailableSet = new Set<string>()
  for (const b of bookings) {
    for (const d of expandDateRange(b.check_in, b.check_out)) unavailableSet.add(d)
  }
  for (const bl of blocks) {
    for (const d of expandDateRange(bl.start_date, bl.end_date)) unavailableSet.add(d)
  }

  const price_overrides: Record<string, number> = {}
  for (const p of prices) price_overrides[p.date] = Number(p.price)

  return {
    unavailable_dates: Array.from(unavailableSet).sort(),
    price_overrides,
    base_price: basePrice,
  }
}

export async function addBlock(roomId: string, startDate: string, endDate: string, reason?: string) {
  await query`
    INSERT INTO room_blocks (room_id, start_date, end_date, reason)
    VALUES (${roomId}, ${startDate}::date, ${endDate}::date, ${reason ?? null})
  `
}

export async function removeBlock(blockId: string) {
  await query`DELETE FROM room_blocks WHERE id = ${blockId}::uuid`
}

export async function getBlocks(roomId: string): Promise<RoomBlock[]> {
  return query<RoomBlock>`
    SELECT id, room_id, start_date::text, end_date::text, reason, created_at::text
    FROM room_blocks WHERE room_id = ${roomId} ORDER BY start_date
  `
}

export async function getPriceOverrides(roomId: string): Promise<PriceOverride[]> {
  return query<PriceOverride>`
    SELECT id, room_id, date::text, price, created_at::text
    FROM room_prices WHERE room_id = ${roomId} ORDER BY date
  `
}

export async function setPriceOverride(roomId: string, date: string, price: number) {
  await query`
    INSERT INTO room_prices (room_id, date, price)
    VALUES (${roomId}, ${date}::date, ${price})
    ON CONFLICT (room_id, date) DO UPDATE SET price = EXCLUDED.price
  `
}

export async function deletePriceOverride(roomId: string, date: string) {
  await query`
    DELETE FROM room_prices WHERE room_id = ${roomId} AND date = ${date}::date
  `
}

export async function setRangePriceOverrides(roomId: string, startDate: string, endDate: string, price: number) {
  const dates = expandDateRange(startDate, endDate)
  for (const date of dates) {
    await query`
      INSERT INTO room_prices (room_id, date, price)
      VALUES (${roomId}, ${date}::date, ${price})
      ON CONFLICT (room_id, date) DO UPDATE SET price = EXCLUDED.price
    `
  }
}

export async function addBlockAllRooms(roomIds: string[], startDate: string, endDate: string, reason?: string) {
  await Promise.all(
    roomIds.map((roomId) => query`
      INSERT INTO room_blocks (room_id, start_date, end_date, reason)
      VALUES (${roomId}, ${startDate}::date, ${endDate}::date, ${reason ?? null})
    `)
  )
}
