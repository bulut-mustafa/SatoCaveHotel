import { kv as vercelKv } from "@vercel/kv"

const isConfigured = () =>
  !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    if (!isConfigured()) return null
    try {
      return await vercelKv.get<T>(key)
    } catch {
      return null
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (!isConfigured()) {
      console.warn(`[KV] Not configured — skipping set("${key}")`)
      return
    }
    try {
      await vercelKv.set(key, value)
    } catch (e) {
      console.error(`[KV] set("${key}") error:`, e)
    }
  },

  async del(key: string): Promise<void> {
    if (!isConfigured()) return
    try {
      await vercelKv.del(key)
    } catch (e) {
      console.error(`[KV] del("${key}") error:`, e)
    }
  },
}
