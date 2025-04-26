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

    // If the error is not about the table not existing, something else is wrong
    if (!checkError.message.includes("relation") && !checkError.message.includes("does not exist")) {
      console.error("Unexpected error checking migrations table:", checkError)
      return false
    }

    console.log("Migrations table does not exist, attempting to create it")

    // Create the migrations table using direct SQL
    // First, try using the exec_sql RPC function
    try {
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

      const { error } = await supabase.rpc("exec_sql", { sql_string: createMigrationsTableQuery })

      if (error) {
        // If the RPC function doesn't exist, we'll handle this in the catch block
        if (error.message.includes("function") && error.message.includes("does not exist")) {
          throw new Error("exec_sql function does not exist")
        }

        console.error("Error creating migrations table:", error)
        return false
      }

      console.log("Migrations table created successfully using RPC")
      return true
    } catch (rpcError) {
      console.log("Could not use RPC function, falling back to direct SQL API")

      // If the RPC function doesn't exist, we need to create the table using a different approach
      // For now, we'll return false and show a message to the user
      console.error("Cannot create migrations table automatically:", rpcError)
      return false
    }
  } catch (error) {
    console.error("Error ensuring migrations table:", error)
    return false
  }
}
