import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client directly in this file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ success: false, error: "SQL query is required" }, { status: 400 })
    }

    console.log("Executing SQL via API endpoint:", sql.substring(0, 100) + "...")

    // Try direct query execution
    try {
      await supabase.query(sql)
      console.log("SQL executed successfully via direct query")
      return NextResponse.json({ success: true, message: "SQL executed successfully" })
    } catch (queryError) {
      console.error("Direct query execution failed:", queryError)

      // Return detailed error information
      return NextResponse.json(
        {
          success: false,
          error: queryError instanceof Error ? queryError.message : "SQL execution failed",
          details: String(queryError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in execute-sql API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
