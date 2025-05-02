import { NextResponse } from "next/server"
import { supabase } from "@/lib/db-utils"

export async function POST() {
  try {
    // SQL to create the user_settings table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE,
        openai_api_key TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create index on user_id for faster lookups
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `

    // Execute the SQL directly
    const { error } = await supabase.rpc("exec_sql", { sql_string: createTableSQL })

    if (error) {
      console.error("Error creating user_settings table:", error)

      // Try an alternative approach if the first one fails
      try {
        // Create the table using raw queries
        await supabase.from("_dummy_query").select("*").limit(0)

        // If we can query, try to execute our SQL directly
        const { error: directError } = await supabase.auth.admin.executeRaw(createTableSQL)

        if (directError) {
          console.error("Direct execution failed:", directError)
          return NextResponse.json({ success: false, error: directError.message }, { status: 500 })
        }
      } catch (directError) {
        console.error("Alternative approach failed:", directError)
        return NextResponse.json({ success: false, error: "Failed to create table" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in create-tables API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
