import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  try {
    const { sql } = await req.json()

    if (!sql) {
      return NextResponse.json({ success: false, error: "SQL query is required" }, { status: 400 })
    }

    console.log("Executing SQL via API:", sql.substring(0, 100) + "...")

    // Try to execute the SQL directly using Supabase's REST API
    // This is a more direct approach than using RPC
    try {
      // For DDL statements, we need to use a special approach
      // First create a function that will execute our SQL
      const functionName = `temp_exec_${Date.now()}`
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION ${functionName}() 
        RETURNS void AS $$
        BEGIN
          ${sql}
        END;
        $$ LANGUAGE plpgsql;
      `

      // Create the function
      const { error: createFunctionError } = await supabase.rpc("exec_sql", {
        sql_string: createFunctionSql,
      })

      if (createFunctionError) {
        console.error("Error creating temporary function:", createFunctionError)
        throw new Error(`Failed to create temporary function: ${createFunctionError.message}`)
      }

      // Execute the function
      const { error: execFunctionError } = await supabase.rpc(functionName)

      if (execFunctionError) {
        console.error("Error executing temporary function:", execFunctionError)
        throw new Error(`Failed to execute SQL: ${execFunctionError.message}`)
      }

      // Drop the function
      const dropFunctionSql = `DROP FUNCTION IF EXISTS ${functionName}();`
      await supabase.rpc("exec_sql", { sql_string: dropFunctionSql })

      return NextResponse.json({ success: true, message: "SQL executed successfully" })
    } catch (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to execute SQL",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in execute-sql API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
