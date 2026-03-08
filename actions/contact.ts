"use server"

import { revalidateTag } from "next/cache"
import { kv } from "@/lib/kv"
import type { ContactInfo } from "@/types/content"

export async function updateContact(contact: ContactInfo) {
  await kv.set("contact", contact)
  revalidateTag("contact")
}
