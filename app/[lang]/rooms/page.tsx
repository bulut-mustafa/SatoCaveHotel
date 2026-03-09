import type { Metadata } from 'next'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import { getRooms, getContact } from "@/lib/content"
import type { Locale } from "@/i18n-config"
import { RoomsGrid } from "@/components/rooms/rooms-grid"

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://satocavehotel.com'
  return {
    title: lang === 'en' ? 'Rooms & Suites' : 'Oda ve Süitlerimiz',
    description: lang === 'en'
      ? 'Explore 8 unique cave rooms and stone suites at Sato Cave Hotel in Göreme. Cave rooms, bathtub suites. Prices from $100 per night.'
      : "Göreme'deki Şato Cave Hotel'de 8 benzersiz mağara odası ve taş süiti keşfedin. Mağara odaları, küvetli süitler. Gecelik 100$'dan başlayan fiyatlar.",
    alternates: {
      canonical: `${base}/${lang}/rooms`,
      languages: { en: `${base}/en/rooms`, tr: `${base}/tr/rooms` },
    },
    openGraph: { url: `${base}/${lang}/rooms` },
  }
}

export default async function RoomsPage({
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

      <RoomsGrid dict={dict} rooms={rooms} lang={lang} />

      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
