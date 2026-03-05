import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/i18n-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ActivitiesList } from "./activities-list"

export default async function ActivitiesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dict = await getDictionary(lang)

    return (
        <main>
            <Header dict={dict.header} lang={lang} />

            <div className="pt-32 pb-24 min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
                            {dict.activities.title_line_1} <span className="text-muted-foreground">{dict.activities.title_line_2}</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {dict.activities.description}
                        </p>
                    </div>

                    <ActivitiesList dict={dict.activities} />
                </div>
            </div>

            <Footer dict={dict.footer} lang={lang} />
        </main>
    )
}
