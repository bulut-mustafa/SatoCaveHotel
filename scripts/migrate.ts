import { Client } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { join } from "path"
import 'dotenv/config'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required")
  process.exit(1)
}

async function migrate() {
  const client = new Client(DATABASE_URL)
  await client.connect()

  const schemaPath = join(process.cwd(), "lib", "db-schema.sql")
  const schema = readFileSync(schemaPath, "utf-8")

  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  console.log(`Running ${statements.length} migration statements...`)

  for (const stmt of statements) {
    await client.query(stmt)
    console.log("✓", stmt.slice(0, 60).replace(/\s+/g, " "))
  }

  await client.end()
  console.log("Migration complete!")
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
