"use server"

import { revalidatePath } from "next/cache"
import { kv } from "@/lib/kv"
import type { ContactInfo } from "@/types/content"

export async function updateContact(contact: ContactInfo) {
  await kv.set("contact", contact)
  revalidatePath("/en", "page")
  revalidatePath("/tr", "page")
  revalidatePath("/en/rooms", "page")
  revalidatePath("/tr/rooms", "page")
  revalidatePath("/en/activities", "page")
  revalidatePath("/tr/activities", "page")
}
