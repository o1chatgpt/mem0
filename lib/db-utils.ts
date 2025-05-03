import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate configuration
if (!supabaseUrl) {
  console.error("Supabase URL is missing. Please check your environment variables.")
}

if (!supabaseKey) {
  console.error("Supabase key is missing. Please check your environment variables.")
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: "public",
  },
})

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey)
}

/**
 * Execute SQL directly using Supabase's query method
 * This is a more reliable way to execute SQL than using RPC
 */
export async function executeSql(sql: string): Promise<boolean> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error("Cannot execute SQL: Supabase is not configured")
      return false
    }

    console.log("Executing SQL:", sql.substring(0, 100) + "...")

    // Try direct query execution first (most reliable method)
    try {
      await supabase.query(sql)
      console.log("SQL executed successfully using direct query")
      return true
    } catch (queryError) {
      console.log(
        "Direct query execution failed:",
        queryError instanceof Error ? queryError.message : String(queryError),
      )
    }

    // Try using the REST API
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ sql_string: sql }),
      })

      if (response.ok) {
        console.log("SQL executed successfully using REST API")
        return true
      }

      console.log("REST API execution failed:", await response.text())
    } catch (restError) {
      console.log("REST API method failed:", restError instanceof Error ? restError.message : String(restError))
    }

    // Try RPC execution
    try {
      // First, try to create the exec_sql function if it doesn't exist
      const createExecSqlFunction = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_string text) RETURNS void AS $$
        BEGIN
          EXECUTE sql_string;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `

      await supabase.query(createExecSqlFunction)

      // Now try to use the function
      const { error } = await supabase.rpc("exec_sql", { sql_string: sql })

      if (!error) {
        console.log("SQL executed successfully using RPC")
        return true
      }

      console.log("RPC execution failed:", error.message)
    } catch (rpcError) {
      console.log("RPC method failed:", rpcError instanceof Error ? rpcError.message : String(rpcError))
    }

    // If all methods fail, try a direct API endpoint approach
    try {
      const response = await fetch("/api/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      if (response.ok) {
        console.log("SQL executed successfully using API endpoint")
        return true
      }

      console.log("API endpoint execution failed:", await response.text())
    } catch (apiError) {
      console.log("API endpoint method failed:", apiError instanceof Error ? apiError.message : String(apiError))
    }

    console.error("All SQL execution methods failed")
    return false
  } catch (error) {
    console.error("Critical error in executeSql:", error instanceof Error ? error.message : String(error))
    return false
  }
}

// Replace the tableExists function with this simpler, more robust version:

export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error(`Cannot check if table ${tableName} exists: Supabase is not configured`)
      return false
    }

    console.log(`Checking if table ${tableName} exists...`)

    // Try a simple query to see if the table exists
    try {
      const { error } = await supabase.from(tableName).select("*", { head: true }).limit(1)

      // If there's no error, the table exists
      if (!error) {
        console.log(`Table ${tableName} exists`)
        return true
      }

      // If the error is about the relation not existing, the table doesn't exist
      if (
        error.message.includes(`relation "${tableName}" does not exist`) ||
        error.message.includes(`relation "public.${tableName}" does not exist`)
      ) {
        console.log(`Table ${tableName} does not exist`)
        return false
      }

      // For other errors, log and return false to be safe
      console.error(`Error checking if table ${tableName} exists:`, error)
      return false
    } catch (error) {
      console.error(`Error in tableExists query for ${tableName}:`, error)
      return false
    }
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error)
    return false
  }
}

// Create a direct function to create the user_settings table
export async function createUserSettingsTable(): Promise<boolean> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error("Cannot create user_settings table: Supabase is not configured")
      return false
    }

    // Check if the table already exists
    const exists = await tableExists("user_settings")
    if (exists) {
      console.log("user_settings table already exists")
      return true
    }

    // Create the table directly using SQL
    const createTableSQL = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE,
        openai_api_key TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `

    const success = await executeSql(createTableSQL)

    if (!success) {
      console.error("Failed to create user_settings table using executeSql")
      return false
    }

    console.log("user_settings table created successfully")
    return true
  } catch (error) {
    console.error("Error in createUserSettingsTable:", error)
    return false
  }
}
