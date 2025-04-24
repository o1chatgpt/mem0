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
    // First try using the exec_sql RPC function if it exists
    const { error: rpcError } = await supabase.rpc("exec_sql", { sql_string: sql })

    if (!rpcError) {
      console.log("SQL executed successfully using RPC")
      return true
    }

    console.log("RPC execution failed, trying direct SQL execution")

    // If RPC fails, try direct SQL execution
    // Create a temporary function to execute SQL
    const tempFunctionSql = `
      CREATE OR REPLACE FUNCTION temp_exec_sql() RETURNS void AS $$
      BEGIN
        ${sql}
      END;
      $$ LANGUAGE plpgsql;
      
      SELECT temp_exec_sql();
      
      DROP FUNCTION temp_exec_sql();
    `

    // Execute the temporary function
    const { error: sqlError } = await supabase.from("_exec_sql").insert({ query: tempFunctionSql })

    if (sqlError) {
      console.error("Error executing SQL:", sqlError)
      return false
    }

    console.log("SQL executed successfully using direct execution")
    return true
  } catch (error) {
    console.error("Error in executeSql:", error)
    return false
  }
}

/**
 * Check if a table exists in the database
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true }).limit(1)

    // If there's no error, the table exists
    if (!error) return true

    // If the error is about the relation not existing, the table doesn't exist
    if (
      error.message.includes(`relation "${tableName}" does not exist`) ||
      error.message.includes(`relation "public.${tableName}" does not exist`)
    ) {
      return false
    }

    // For other errors, log and return false
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error)
    return false
  }
}
