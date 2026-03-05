import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/i18n-config"
import { RoomsGrid } from "@/components/rooms/rooms-grid"
import { getLocalizedRooms } from "@/lib/rooms-data"

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <main>
      <Header dict={dict.header} lang={lang} />

      <section className="bg-hero-bg px-6 pt-32 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-sm tracking-[0.3em] text-hero-overlay/70 uppercase">
            {dict.rooms_page.subtitle}
          </p>
          <h1 className="font-serif text-4xl font-bold text-hero-overlay md:text-5xl lg:text-6xl">
            {dict.rooms_page.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-hero-overlay/80">
            {dict.rooms_page.description}
          </p>
        </div>
      </section>

      <RoomsGrid dict={dict} rooms={getLocalizedRooms(dict.room_details)} />

      <Footer dict={dict.footer} lang={lang} />
    </main>
  )
}
