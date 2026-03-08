import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { join } from "path"
import 'dotenv/config'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function migrate() {
  const schemaPath = join(process.cwd(), "lib", "db-schema.sql")
  const schema = readFileSync(schemaPath, "utf-8")

  // Split on semicolons and run each statement
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  console.log(`Running ${statements.length} migration statements...`)

  for (const stmt of statements) {
    await sql.unsafe(stmt)
    console.log("✓", stmt.slice(0, 60).replace(/\s+/g, " "))
  }

  console.log("Migration complete!")
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
