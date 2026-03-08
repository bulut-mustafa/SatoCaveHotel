"use server"

import { revalidatePath } from "next/cache"
import { kv } from "@/lib/kv"
import type { Activity } from "@/types/content"

export async function updateActivities(lang: "en" | "tr", activities: Activity[]) {
  await kv.set(`activities:${lang}`, activities)
  revalidatePath(`/${lang}/activities`, "page")
}

export async function updateActivity(
  lang: "en" | "tr",
  id: string,
  updated: Partial<Activity>
) {
  const activities = await kv.get<Activity[]>(`activities:${lang}`)
  if (!activities) return

  const next = activities.map((a) => (a.id === id ? { ...a, ...updated } : a))
  await kv.set(`activities:${lang}`, next)
  revalidatePath(`/${lang}/activities`, "page")
}

export async function reorderActivities(lang: "en" | "tr", ids: string[]) {
  const activities = await kv.get<Activity[]>(`activities:${lang}`)
  if (!activities) return

  const sorted = ids
    .map((id) => activities.find((a) => a.id === id))
    .filter(Boolean) as Activity[]

  await kv.set(`activities:${lang}`, sorted)
  revalidatePath(`/${lang}/activities`, "page")
}
