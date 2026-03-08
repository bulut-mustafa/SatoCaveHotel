import { notFound } from "next/navigation"
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

  const availability = await getAvailabilityData(
    roomId,
    today,
    inThreeMonths,
    room.price
  )

  return (
    <main>
      <Header dict={dict.header} lang={lang} />

      <section className="bg-background px-6 pt-32 pb-8 lg:px-8 border-b border-border">
        <div className="mx-auto max-w-4xl py-12">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
            {dict.reserve.page_title}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground font-normal">
            {room.name}
          </h1>
          <p className="mt-3 text-muted-foreground">{room.tagline}</p>
        </div>
      </section>

      <section className="bg-background px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ReservationClient
            room={room}
            availability={availability}
            initialFrom={from}
            initialTo={to}
            dict={dict}
            lang={lang}
          />
        </div>
      </section>

      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
