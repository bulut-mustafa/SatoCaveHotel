import type { Metadata } from 'next'
import { getDictionary } from "@/lib/dictionary"
import { getActivities, getContact } from "@/lib/content"
import type { Locale } from "@/i18n-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ActivitiesList } from "./activities-list"

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://satocavehotel.com'
  return {
    title: lang === 'en' ? 'Activities & Tours' : 'Aktiviteler',
    description: lang === 'en'
      ? 'Discover Cappadocia activities from Sato Cave Hotel — hot air balloon rides, horseback riding, green tours, underground cities, and more.'
      : "Şato Cave Hotel'den Kapadokya aktivitelerini keşfedin — sıcak hava balonu turları, at binme, yeşil turlar, yeraltı şehirleri ve daha fazlası.",
    alternates: {
      canonical: `${base}/${lang}/activities`,
      languages: { en: `${base}/en/activities`, tr: `${base}/tr/activities` },
    },
    openGraph: { url: `${base}/${lang}/activities` },
  }
}

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const [dict, activities, contact] = await Promise.all([
    getDictionary(lang),
    getActivities(lang),
    getContact(),
  ])

  return (
    <main>
      <Header dict={dict.header} lang={lang} />

      <div className="pt-32 pb-24 min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              {dict.activities.title_line_1}{" "}
              <span className="text-muted-foreground">{dict.activities.title_line_2}</span>
            </h1>
            <p className="text-muted-foreground text-lg">{dict.activities.description}</p>
          </div>

          <ActivitiesList
            activities={activities}
            dict={{
              details_button: dict.activities.details_button,
              book_activity: dict.activities.book_activity,
              close: dict.activities.close,
            }}
          />
        </div>
      </div>

      <Footer dict={dict.footer} lang={lang} contact={contact} />
    </main>
  )
}
