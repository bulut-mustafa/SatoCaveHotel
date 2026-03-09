import { getRooms } from "@/lib/content"
import { getBookings } from "@/actions/bookings"
import { getBlocks, getPriceOverrides } from "@/actions/availability"
import { BookingsView } from "./bookings-view"
import { toDateStr } from "@/lib/date-utils"

export default async function AdminBookingsPage() {
  const today = toDateStr(new Date())
  const inSixMonths = toDateStr(new Date(Date.now() + 180 * 86400000))

  const rooms = await getRooms("en")

  const [bookings, blocks, allOverrides] = await Promise.all([
    getBookings({ from: today, to: inSixMonths }),
    Promise.all(rooms.map((r) => getBlocks(r.id))).then((all) => all.flat()),
    Promise.all(rooms.map((r) => getPriceOverrides(r.id).then((overrides) => ({ roomId: r.id, overrides })))),
  ])

  // Build a map: roomId → { date → price }
  const priceOverrideMap: Record<string, Record<string, number>> = {}
  for (const { roomId, overrides } of allOverrides) {
    priceOverrideMap[roomId] = Object.fromEntries(overrides.map((o) => [o.date, Number(o.price)]))
  }

  return (
    <div className="flex flex-col h-full">
      <BookingsView
        rooms={rooms}
        bookings={bookings}
        blocks={blocks}
        today={today}
        priceOverrideMap={priceOverrideMap}
      />
    </div>
  )
}
