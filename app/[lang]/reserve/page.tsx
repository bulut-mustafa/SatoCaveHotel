import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import { getRooms, getContact } from "@/lib/content"
import type { Locale } from "@/i18n-config"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === "en" ? "Reserve a Room" : "Oda Rezervasyonu",
  }
}

export default async function ReservePage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const [dict, rooms, contact] = await Promise.all([
    getDictionary(lang),
    getRooms(lang),
    getContact(),
  ])

  const r = dict.reserve

  return (
    <main>
      <Header dict={dict.header} lang={lang} />

      <section className="bg-background px-6 pt-32 pb-8 lg:px-8 border-b border-border">
        <div className="mx-auto max-w-4xl text-center py-12">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground font-normal tracking-wide">
            {r.page_title}
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground">
            {r.select_room}
          </p>
        </div>
      </section>

      <section className="bg-background px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{room.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {room.tagline}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>€{room.price} {r.per_night}</span>
                    <span>{room.capacity} guests</span>
                  </div>
                  <Link
                    href={`/${lang}/reserve/${room.id}`}
                    className="block w-full text-center bg-foreground hover:bg-foreground/80 text-background py-2.5 text-sm font-medium tracking-wide transition-colors rounded"
                  >
                    {r.book_now}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
