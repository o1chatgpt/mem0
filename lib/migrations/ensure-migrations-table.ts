import { executeSql, tableExists } from "@/lib/db-utils"

/**
 * Ensures that the migrations table exists
 * This table tracks which migrations have been applied
 */
export async function ensureMigrationsTable(): Promise<boolean> {
  try {
    // Check if the migrations table exists
    const exists = await tableExists("schema_migrations")

    // If the table already exists, return true
    if (exists) {
      console.log("Migrations table already exists")
      return true
    }

    console.log("Migrations table does not exist, creating it...")

    // Create the migrations table
    const createMigrationsTableQuery = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64) NOT NULL,
        execution_time INTEGER NOT NULL,
        success BOOLEAN NOT NULL
      );
    `

    // Execute the SQL query directly
    const success = await executeSql(createMigrationsTableQuery)

    if (!success) {
      console.error("Failed to create migrations table")
      return false
    }

    console.log("Migrations table created successfully")
    return true
  } catch (error) {
    console.error("Error ensuring migrations table:", error)
    return false
  }
}
