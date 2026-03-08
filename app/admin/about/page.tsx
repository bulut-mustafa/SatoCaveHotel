import { getAbout } from "@/lib/content"
import { AboutAdminClient } from "./about-editor"

export default async function AdminAboutPage() {
  const [enAbout, trAbout] = await Promise.all([getAbout("en"), getAbout("tr")])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">About Section</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit the About section shown on the homepage
        </p>
      </div>
      <AboutAdminClient initialEn={enAbout} initialTr={trAbout} />
    </div>
  )
}
