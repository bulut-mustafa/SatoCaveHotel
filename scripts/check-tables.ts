import { neon } from "@neondatabase/serverless"

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) { console.error("No DATABASE_URL"); process.exit(1) }

const sql = neon(url)

async function main() {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  console.log("Tables found:", tables.map((r: any) => r.tablename))
}
main().catch(console.error)
