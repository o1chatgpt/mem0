import { Pool } from "pg"
import * as fs from "fs"
import * as path from "path"
import { config } from "../lib/config"

async function runMigration() {
  console.log("Starting database migration...")

  const pool = new Pool({
    connectionString: config.postgresUrl,
  })

  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), "db", "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Execute the schema
    await pool.query(schema)

    console.log("Migration completed successfully!")

    // Create a default admin user if it doesn't exist
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", ["admin"])

    if (userResult.rows.length === 0) {
      await pool.query("INSERT INTO users (username, email) VALUES ($1, $2)", ["admin", "admin@andiegogiap.com"])
      console.log("Created default admin user")
    }
  } catch (err) {
    console.error("Error during migration:", err)
  } finally {
    await pool.end()
  }
}

// Run the migration
runMigration().catch(console.error)
