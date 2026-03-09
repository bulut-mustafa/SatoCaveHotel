import { neon } from "@neondatabase/serverless"

const connectionString = process.env.DATABASE_URL
function createDb() {
  if (!connectionString) {
    // Graceful fallback: return a no-op proxy when DATABASE_URL is not set
    return null
  }
  return neon(connectionString)
}

export const sql = createDb()

export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  if (!sql) {
    console.warn("[db] DATABASE_URL not set — skipping query")
    return []
  }
  return sql(strings, ...values) as Promise<T[]>
}
