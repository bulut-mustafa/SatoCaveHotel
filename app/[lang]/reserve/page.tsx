import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import { getRooms, getContact } from "@/lib/content"
import type { Locale } from "@/i18n-config"
import { ReserveSearchClient } from "./reserve-search-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
  const { lang } = await params
  return { title: lang === "en" ? "Reserve a Room" : "Oda Rezervasyonu" }
}

export default async function ReservePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>
  searchParams: Promise<{ from?: string; to?: string; guests?: string; room?: string }>
}) {
  const { lang } = await params
  const { from, to, guests, room } = await searchParams

  const [dict, rooms, contact] = await Promise.all([
    getDictionary(lang),
    getRooms(lang),
    getContact(),
  ])

  return (
    <main>
      <Header dict={dict.header} lang={lang} />
      <ReserveSearchClient
        rooms={rooms}
        dict={dict}
        lang={lang}
        initialFrom={from}
        initialTo={to}
        initialGuests={guests ? Math.max(1, parseInt(guests)) : undefined}
        initialRoom={room}
      />
      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
