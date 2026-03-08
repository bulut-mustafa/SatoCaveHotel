"use server"

import { revalidatePath } from "next/cache"
import { kv } from "@/lib/kv"
import type { AboutContent } from "@/types/content"

export async function updateAbout(lang: "en" | "tr", content: AboutContent) {
  await kv.set(`about:${lang}`, content)
  revalidatePath(`/${lang}`, "page")
}
