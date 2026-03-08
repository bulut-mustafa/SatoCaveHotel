import { getActivities } from "@/lib/content"
import { ActivitiesAdminClient } from "./activities-editor"

export default async function AdminActivitiesPage() {
  const [enActivities, trActivities] = await Promise.all([
    getActivities("en"),
    getActivities("tr"),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Activities</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit activity content for both languages
        </p>
      </div>
      <ActivitiesAdminClient
        initialEn={enActivities}
        initialTr={trActivities}
      />
    </div>
  )
}
