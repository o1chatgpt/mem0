import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Ensures that the migrations table exists
 * This table tracks which migrations have been applied
 */
export async function ensureMigrationsTable(): Promise<boolean> {
  try {
    // Check if the migrations table exists
    const { error: checkError } = await supabase.from("schema_migrations").select("*", { head: true }).limit(1)

    // If the table already exists, return true
    if (!checkError) {
      console.log("Migrations table already exists")
      return true
    }

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
    const { error } = await supabase.rpc("exec_sql", { sql_string: createMigrationsTableQuery })

    if (error) {
      console.error("Error creating migrations table:", error)
      return false
    }

    console.log("Migrations table created successfully")
    return true
  } catch (error) {
    console.error("Error ensuring migrations table:", error)
    return false
  }
}
