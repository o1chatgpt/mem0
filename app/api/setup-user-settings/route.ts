import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client directly in this file to ensure we have the right configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    console.log("Starting setup-user-settings with direct SQL approach")

    // Create the user_settings table directly with SQL
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

    try {
      // Use direct query method instead of RPC
      console.log("Executing direct SQL query to create user_settings table")
      await supabase.query(createTableSQL)
      console.log("User settings table created successfully via direct SQL")

      return NextResponse.json({
        success: true,
        message: "User settings table created successfully via direct SQL",
      })
    } catch (directError) {
      console.error("Direct SQL execution failed:", directError)

      // Try an alternative approach - use the REST API directly
      try {
        console.log("Attempting to create table via REST API")
        const response = await fetch("/api/execute-sql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql: createTableSQL }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API execution failed: ${JSON.stringify(errorData)}`)
        }

        console.log("User settings table created successfully via API endpoint")
        return NextResponse.json({
          success: true,
          message: "User settings table created successfully via API endpoint",
        })
      } catch (apiError) {
        console.error("API endpoint execution failed:", apiError)

        // Return detailed error information
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create user_settings table",
            directError: directError instanceof Error ? directError.message : String(directError),
            apiError: apiError instanceof Error ? apiError.message : String(apiError),
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Error in setup-user-settings API:", error)
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
