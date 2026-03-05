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

      <section className="bg-background px-6 pt-32 pb-8 lg:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl text-center py-12">
          <p className="mb-6 text-sm md:text-xs tracking-[0.3em] text-muted-foreground uppercase">
            {dict.rooms_page.subtitle}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-foreground font-normal tracking-wide">
            {dict.rooms_page.title}
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            {dict.rooms_page.description}
          </p>
        </div>
      </section>

      <RoomsGrid dict={dict} rooms={getLocalizedRooms(dict.room_details)} />

      <Footer dict={dict.footer} lang={lang} />
    </main>
  )
}
