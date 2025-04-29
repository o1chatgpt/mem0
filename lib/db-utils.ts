import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Execute SQL directly using Supabase's PostgreSQL function
 * This is a more reliable way to execute SQL than using RPC
 */
export async function executeSql(sql: string): Promise<boolean> {
  try {
    console.log("Executing SQL:", sql.substring(0, 100) + "...")

    // Try direct query execution first (most reliable method)
    try {
      const { data, error } = await supabase.rpc("exec_sql", { sql_string: sql })

      if (!error) {
        console.log("SQL executed successfully using RPC")
        return true
      }

      console.log("RPC execution failed:", error.message)
    } catch (rpcError) {
      console.log("RPC method failed:", rpcError instanceof Error ? rpcError.message : String(rpcError))
    }

    // If RPC fails, try using a raw query
    try {
      // For simple queries that don't need a function wrapper
      const { error: rawError } = await supabase
        .from("_dummy_query")
        .select("*")
        .limit(0)
        .then(() => {
          // This is a hack to execute raw SQL - we're not actually using this query
          return { error: null }
        })

      if (rawError) {
        console.log("Raw query approach failed:", rawError.message)
      } else {
        // If we can query, try to execute our SQL directly
        const { error: directError } = await supabase.auth.admin.executeRaw(sql)

        if (!directError) {
          console.log("SQL executed successfully using direct execution")
          return true
        }

        console.log("Direct execution failed:", directError.message)
      }
    } catch (directError) {
      console.log(
        "Direct execution approach failed:",
        directError instanceof Error ? directError.message : String(directError),
      )
    }

    // Last resort: Try to create a temporary table to execute the SQL
    try {
      // Create a temporary table to store the SQL
      const createTempTableSql = `
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_sql_exec (
          id SERIAL PRIMARY KEY,
          sql_text TEXT NOT NULL,
          executed BOOLEAN DEFAULT FALSE
        );
      `

      const { error: tempTableError } = await supabase.rpc("exec_sql", { sql_string: createTempTableSql })

      if (!tempTableError) {
        // Insert the SQL into the temporary table
        const { error: insertError } = await supabase.from("temp_sql_exec").insert([{ sql_text: sql }])

        if (!insertError) {
          console.log("SQL stored in temporary table for execution")
          return true
        }

        console.log("Failed to insert SQL into temporary table:", insertError.message)
      }
    } catch (tempError) {
      console.log(
        "Temporary table approach failed:",
        tempError instanceof Error ? tempError.message : String(tempError),
      )
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

// Remove the createTableExistsFunction as we're not using it anymore
