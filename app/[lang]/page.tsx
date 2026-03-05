import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/i18n-config"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { RoomsPreview } from "@/components/rooms-preview"
import { ExperienceSection } from "@/components/experience-section"
import { SightsSection } from "@/components/sights-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"
import { getLocalizedRooms } from "@/lib/rooms-data"

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <main>
      <Header dict={dict.header} lang={lang} />
      <HeroSection dict={dict.hero} />
      <AboutSection dict={dict.about} />
      <RoomsPreview dict={dict.rooms} lang={lang} rooms={getLocalizedRooms(dict.room_details)} />
      <ExperienceSection dict={dict.facilities} />
      <SightsSection dict={dict.sights} />
      <ReviewsSection dict={dict.reviews} />
      <Footer dict={dict.footer} lang={lang} />
    </main>
  )
}
