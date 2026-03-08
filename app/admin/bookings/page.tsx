import { getRooms } from "@/lib/content"
import { getBookings } from "@/actions/bookings"
import { getBlocks } from "@/actions/availability"
import { BookingGrid } from "@/components/admin/booking-grid/booking-grid"
import { toDateStr } from "@/lib/date-utils"

export default async function AdminBookingsPage() {
  const today = toDateStr(new Date())
  const inSixMonths = toDateStr(new Date(Date.now() + 180 * 86400000))

  const [rooms, bookings, blocks] = await Promise.all([
    getRooms("en"),
    getBookings({ from: today, to: inSixMonths }),
    // Fetch blocks for all rooms
    (async () => {
      const allBlocks = await Promise.all(
        (await getRooms("en")).map((r) => getBlocks(r.id))
      )
      return allBlocks.flat()
    })(),
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div>
          <h1 className="text-xl font-semibold">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reservations and room availability
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <BookingGrid
          rooms={rooms}
          bookings={bookings}
          blocks={blocks}
          initialStartDate={today}
        />
      </div>
    </div>
  )
}
