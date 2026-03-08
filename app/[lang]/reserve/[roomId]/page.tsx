import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import { getRooms, getContact } from "@/lib/content"
import { getAvailabilityData } from "@/actions/availability"
import { ReservationClient } from "./reservation-client"
import type { Locale } from "@/i18n-config"
import { toDateStr } from "@/lib/date-utils"

export default async function ReserveRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale; roomId: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { lang, roomId } = await params
  const { from, to } = await searchParams

  const [dict, rooms, contact] = await Promise.all([
    getDictionary(lang),
    getRooms(lang),
    getContact(),
  ])

  const room = rooms.find((r) => r.id === roomId)
  if (!room) notFound()

  const today = toDateStr(new Date())
  const inThreeMonths = toDateStr(new Date(Date.now() + 90 * 86400000))

  const availability = await getAvailabilityData(roomId, today, inThreeMonths, room.price)

  return (
    <main>
      <Header dict={dict.header} lang={lang} />
      <div className="min-h-screen pt-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href={`/${lang}/reserve`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to rooms
          </Link>
          <ReservationClient
            room={room}
            availability={availability}
            initialFrom={from}
            initialTo={to}
            dict={dict}
            lang={lang}
          />
        </div>
      </div>
      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
