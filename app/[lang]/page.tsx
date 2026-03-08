import type { Metadata } from 'next'
import { getDictionary } from "@/lib/dictionary"
import { getRooms, getContact } from "@/lib/content"
import type { Locale } from "@/i18n-config"

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://satocavehotel.com'
  return {
    title: lang === 'en'
      ? 'Sato Cave Hotel | Authentic Cave Hotel in Göreme, Cappadocia'
      : "Şato Cave Hotel | Göreme, Kapadokya'da Otantik Mağara Oteli",
    description: lang === 'en'
      ? 'Experience authentic cave living at Sato Cave Hotel in Göreme, Cappadocia. Cave rooms from $100/night, hot air balloon views, panoramic terrace breakfast.'
      : "Göreme, Kapadokya'da Şato Cave Hotel'de otantik mağara yaşamını deneyimleyin. Gecelik 100$'dan başlayan mağara odaları, sıcak hava balonu manzarası.",
    alternates: {
      canonical: `${base}/${lang}`,
      languages: { en: `${base}/en`, tr: `${base}/tr` },
    },
    openGraph: { url: `${base}/${lang}` },
  }
}
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { RoomsPreview } from "@/components/rooms-preview"
import { ActivitiesSection } from "@/components/activities-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"

export default async function HomePage({
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
      <HeroSection dict={dict.hero} />
      <AboutSection dict={dict.about} />
      <RoomsPreview dict={dict.rooms} lang={lang} rooms={rooms} />
      <ActivitiesSection dict={dict.activities} lang={lang} />
      <ReviewsSection dict={dict.reviews} />
      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
